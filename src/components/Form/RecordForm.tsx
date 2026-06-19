import { useState, useMemo, useRef, useEffect } from 'react';
import { Store, MapPin, Tag, Coins, Percent, Calendar, Clock, FileText, Save, RotateCcw, Wallet, AlertTriangle, Star, Tags, ShoppingCart, X } from 'lucide-react';
import { useStore, useUserRecords, useUserTags, useUserShoppingList } from '../../store/useStore';
import { calculateDiscountPrice, calculateSavings, calculateDaysUntilExpiry, formatCurrency, formatDiscount, computeBudgetStatusWithNewRecord } from '../../utils/calculations';
import { getSupermarketCoords, getCategoryColor } from '../../utils/mockData';
import type { FormData, BudgetStatus } from '../../types';
import BudgetAlertModal from '../Budget/BudgetAlertModal';

const RecordForm = () => {
  const supermarkets = useStore((state) => state.supermarkets);
  const categories = useStore((state) => state.categories);
  const addRecord = useStore((state) => state.addRecord);
  const currentUser = useStore((state) => state.currentUser);
  const monthlyBudgets = useStore((state) => state.monthlyBudgets);
  const userRecords = useUserRecords();
  const tags = useUserTags();
  const shoppingList = useUserShoppingList();
  const completeShoppingListItem = useStore((state) => state.completeShoppingListItem);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [pendingBudgetStatus, setPendingBudgetStatus] = useState<BudgetStatus | null>(null);
  const [showShoppingListPicker, setShowShoppingListPicker] = useState(false);
  const [selectedListItemId, setSelectedListItemId] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const [formData, setFormData] = useState<FormData>({
    supermarketName: '',
    shelfLocation: '',
    productName: '',
    category: '',
    originalPrice: '',
    discount: '5',
    expiryDate: '',
    purchaseDate: today,
    purchaseTime: currentTime,
    notes: '',
  });
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [pendingShoppingItemId, setPendingShoppingItemId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowShoppingListPicker(false);
      }
    };
    if (showShoppingListPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShoppingListPicker]);

  const budgetLimit = useMemo(() => {
    if (!currentUser) return 0;
    const budget = monthlyBudgets.find(b => b.userId === currentUser.id);
    return budget ? budget.limit : 0;
  }, [monthlyBudgets, currentUser]);

  const liveBudgetStatus = useMemo((): BudgetStatus | null => {
    if (budgetLimit <= 0) return null;

    const originalPrice = parseFloat(formData.originalPrice) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const purchaseDate = formData.purchaseDate || today;
    const category = formData.category || '';

    return computeBudgetStatusWithNewRecord(
      userRecords,
      budgetLimit,
      originalPrice,
      discount,
      purchaseDate,
      category
    );
  }, [userRecords, budgetLimit, formData.originalPrice, formData.discount, formData.purchaseDate, formData.category, today]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!selectedListItemId) return;
    const item = shoppingList.find(i => i.id === selectedListItemId);
    if (!item) {
      setSelectedListItemId(null);
      setPendingShoppingItemId(null);
      return;
    }
    const nameMatches = formData.productName.trim() === item.productName.trim();
    const categoryMatches = formData.category === item.category;
    if (!nameMatches || !categoryMatches) {
      setSelectedListItemId(null);
      setPendingShoppingItemId(null);
    }
  }, [formData.productName, formData.category, selectedListItemId, shoppingList]);

  const resetForm = () => {
    const now = new Date();
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setFormData({
      supermarketName: '',
      shelfLocation: '',
      productName: '',
      category: '',
      originalPrice: '',
      discount: '5',
      expiryDate: '',
      purchaseDate: today,
      purchaseTime: nowTime,
      notes: '',
    });
    setIsFavorite(false);
    setSelectedTagIds([]);
    setSelectedListItemId(null);
    setPendingShoppingItemId(null);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  const doSubmit = () => {
    const coords = getSupermarketCoords(formData.supermarketName) || { 
      x: 20 + Math.random() * 60, 
      y: 20 + Math.random() * 60 
    };

    const purchaseDateTime = `${formData.purchaseDate}T${formData.purchaseTime}:00`;

    addRecord({
      supermarketName: formData.supermarketName,
      shelfLocation: formData.shelfLocation,
      productName: formData.productName,
      category: formData.category,
      originalPrice: parseFloat(formData.originalPrice),
      discount: parseFloat(formData.discount),
      expiryDate: formData.expiryDate,
      purchaseDate: purchaseDateTime,
      notes: formData.notes,
      x: coords.x,
      y: coords.y,
      isFavorite: isFavorite,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    });

    if (pendingShoppingItemId) {
      const pendingItem = shoppingList.find(item => item.id === pendingShoppingItemId);
      if (pendingItem && !pendingItem.completed) {
        const nameMatches = formData.productName.trim() === pendingItem.productName.trim();
        const categoryMatches = formData.category === pendingItem.category;
        if (nameMatches && categoryMatches) {
          completeShoppingListItem(pendingShoppingItemId);
        }
      }
    }

    setShowSuccess(true);
    resetForm();
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (liveBudgetStatus && liveBudgetStatus.isOverBudget) {
      setPendingBudgetStatus(liveBudgetStatus);
      setShowBudgetAlert(true);
    } else {
      doSubmit();
    }
  };

  const handleBudgetAlertClose = () => {
    setShowBudgetAlert(false);
    if (pendingBudgetStatus && pendingBudgetStatus.isOverBudget) {
      doSubmit();
    }
    setPendingBudgetStatus(null);
  };

  const calculations = useMemo(() => {
    const price = parseFloat(formData.originalPrice) || 0;
    const discount = parseFloat(formData.discount) || 0;
    
    if (price <= 0 || discount <= 0) {
      return { discountPrice: 0, savings: 0, daysUntilExpiry: null };
    }

    const discountPrice = calculateDiscountPrice(price, discount);
    const savings = calculateSavings(price, discount);
    const daysUntilExpiry = formData.expiryDate ? calculateDaysUntilExpiry(formData.expiryDate) : null;

    return { discountPrice, savings, daysUntilExpiry };
  }, [formData.originalPrice, formData.discount, formData.expiryDate]);

  const isFormValid = 
    formData.supermarketName && 
    formData.productName && 
    formData.category && 
    parseFloat(formData.originalPrice) > 0 && 
    formData.expiryDate;

  const pendingShoppingItems = shoppingList.filter(item => !item.completed);

  const handleSelectFromShoppingList = (item: typeof shoppingList[0]) => {
    setFormData(prev => ({
      ...prev,
      productName: item.productName,
      category: item.category,
      discount: String(item.targetDiscount),
    }));
    setSelectedListItemId(item.id);
    setPendingShoppingItemId(item.id);
    setShowShoppingListPicker(false);
  };

  const handleClearShoppingListSelection = () => {
    setSelectedListItemId(null);
    setPendingShoppingItemId(null);
  };

  const selectedListItem = selectedListItemId
    ? shoppingList.find(item => item.id === selectedListItemId)
    : null;

  return (
    <div className="card-paper p-6 md:p-8 relative overflow-hidden">
      <div className="tape" style={{ top: '-8px', left: '50%', transform: 'translateX(-50%) rotate(2deg)' }} />

      {showSuccess && (
        <div className="absolute top-4 right-4 z-20 stamp-animation">
          <div className="bg-forest-600 text-parchment-100 px-4 py-2 rounded-lg border-2 border-forest-700 shadow-stamp font-display text-lg">
            ✓ 记录成功！
          </div>
        </div>
      )}

      <div className="relative z-10">
        <h2 className="title-display text-2xl md:text-3xl text-center mb-6">
          📜 记录新的捡漏
        </h2>

        {pendingShoppingItems.length > 0 && (
          <div className="mb-6" ref={pickerRef}>
            <label className="label-text">
              <ShoppingCart className="inline w-5 h-5 mr-2" />
              从购物清单选择
            </label>
            {selectedListItem ? (
              <div className="flex items-center gap-3 p-3 bg-amber-50 border-2 border-amber-500 rounded-lg">
                <div className="flex-1 min-w-0">
                  <span className="font-display text-amber-900">{selectedListItem.productName}</span>
                  <span
                    className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium border"
                    style={{
                      backgroundColor: `${getCategoryColor(selectedListItem.category)}15`,
                      color: getCategoryColor(selectedListItem.category),
                      borderColor: `${getCategoryColor(selectedListItem.category)}40`,
                    }}
                  >
                    {selectedListItem.category}
                  </span>
                  <span className="ml-2 text-sm text-amber-600">
                    目标 {formatDiscount(selectedListItem.targetDiscount)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearShoppingListSelection}
                  className="p-1 text-amber-500 hover:text-crimson-700 hover:bg-red-50 rounded transition-all"
                  title="清除选择"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowShoppingListPicker(!showShoppingListPicker)}
                  className={`w-full p-3 border-2 border-dashed rounded-lg text-left flex items-center gap-2 transition-all ${
                    showShoppingListPicker
                      ? 'border-amber-600 bg-amber-50 text-amber-800'
                      : 'border-amber-300 text-amber-600 hover:border-amber-500 hover:bg-amber-50'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="font-display">点选清单中的商品，自动回填名称、品类和目标折扣</span>
                  <span className="ml-auto badge-stamp stamp-amber text-xs">
                    {pendingShoppingItems.length} 项
                  </span>
                </button>

                {showShoppingListPicker && (
                  <div className="absolute z-30 mt-2 w-full bg-parchment-50 border-2 border-amber-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {pendingShoppingItems.map(item => {
                      const catColor = getCategoryColor(item.category);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectFromShoppingList(item)}
                          className="w-full text-left p-3 hover:bg-amber-100 transition-all border-b border-amber-200 last:border-b-0 flex items-center gap-3"
                        >
                          <ShoppingCart className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-display text-amber-900">{item.productName}</span>
                            <span
                              className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium border"
                              style={{
                                backgroundColor: `${catColor}15`,
                                color: catColor,
                                borderColor: `${catColor}40`,
                              }}
                            >
                              {item.category}
                            </span>
                          </div>
                          <span className="font-mono text-sm text-amber-700 flex-shrink-0">
                            目标 {formatDiscount(item.targetDiscount)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text">
                <Store className="inline w-5 h-5 mr-2" />
                超市名称
              </label>
              <select
                name="supermarketName"
                value={formData.supermarketName}
                onChange={handleChange}
                className="input-field cursor-pointer"
                required
              >
                <option value="">选择超市...</option>
                {supermarkets.map(supermarket => (
                  <option key={supermarket.name} value={supermarket.name}>
                    {supermarket.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-text">
                <MapPin className="inline w-5 h-5 mr-2" />
                货架位置
              </label>
              <input
                type="text"
                name="shelfLocation"
                value={formData.shelfLocation}
                onChange={handleChange}
                className="input-field"
                placeholder="如：零食区最底层角落"
              />
            </div>

            <div>
              <label className="label-text">
                <Tag className="inline w-5 h-5 mr-2" />
                商品名称
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="input-field"
                placeholder="如：进口牛奶 1L"
                required
              />
            </div>

            <div>
              <label className="label-text">
                <Tag className="inline w-5 h-5 mr-2" />
                商品品类
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field cursor-pointer"
                required
              >
                <option value="">选择品类...</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-text">
                <Coins className="inline w-5 h-5 mr-2" />
                原价 (元)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                className="input-field font-mono"
                placeholder="如：28.80"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="label-text">
                <Percent className="inline w-5 h-5 mr-2" />
                折扣 (折)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="1"
                  max="9"
                  step="0.5"
                  className="flex-1 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <span className="font-mono text-xl font-bold text-amber-800 w-16 text-center">
                  {formatDiscount(parseFloat(formData.discount) || 0)}
                </span>
              </div>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="input-field font-mono mt-2"
                min="1"
                max="9"
                step="0.5"
                required
              />
            </div>

            <div>
              <label className="label-text">
                <Calendar className="inline w-5 h-5 mr-2" />
                过期日期
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="input-field font-mono"
                required
              />
            </div>

            <div>
              <label className="label-text">
                <Calendar className="inline w-5 h-5 mr-2" />
                购买日期
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="input-field font-mono"
                max={today}
                required
              />
            </div>

            <div>
              <label className="label-text">
                <Clock className="inline w-5 h-5 mr-2" />
                购买时间
              </label>
              <input
                type="time"
                name="purchaseTime"
                value={formData.purchaseTime}
                onChange={handleChange}
                className="input-field font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="label-text">
              <FileText className="inline w-5 h-5 mr-2" />
              备注
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input-field resize-none h-20"
              placeholder="记录一下发现的过程或心得..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text">
                <Star className="inline w-5 h-5 mr-2" />
                收藏标记
              </label>
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-full p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                  isFavorite
                    ? 'bg-amber-100 border-amber-500 text-amber-700'
                    : 'bg-parchment-100 border-amber-200 text-amber-500 hover:border-amber-300'
                }`}
              >
                <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-500' : ''}`} />
                {isFavorite ? '已收藏 ⭐' : '点击收藏此记录'}
              </button>
            </div>

            {tags.length > 0 && (
              <div>
                <label className="label-text">
                  <Tags className="inline w-5 h-5 mr-2" />
                  添加标签
                  {selectedTagIds.length > 0 && (
                    <span className="ml-2 badge-stamp stamp-amber text-xs">
                      已选 {selectedTagIds.length}
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-parchment-100 rounded-lg border border-amber-200 min-h-[60px]">
                  {tags.map(tag => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-2.5 py-1 rounded-full text-sm font-medium flex items-center gap-1 transition-all hover:scale-105`}
                        style={{
                          backgroundColor: isSelected ? tag.color : `${tag.color}20`,
                          color: isSelected ? 'white' : tag.color,
                          border: `1px solid ${tag.color}`,
                          boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px ${tag.color}` : 'none',
                        }}
                      >
                        <Tag className="w-3.5 h-3.5" />
                        {tag.name}
                        {isSelected && <span className="text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {liveBudgetStatus && budgetLimit > 0 && (
            <div className={`rounded-xl p-4 border-2 ${
              liveBudgetStatus.isOverBudget
                ? 'bg-crimson-50 border-crimson-400'
                : liveBudgetStatus.percentage >= 80
                ? 'bg-amber-50 border-amber-400'
                : 'bg-emerald-50 border-emerald-400'
            }`}>
              <h3 className={`font-display text-lg mb-3 text-center flex items-center justify-center gap-2 ${
                liveBudgetStatus.isOverBudget
                  ? 'text-crimson-800'
                  : liveBudgetStatus.percentage >= 80
                  ? 'text-amber-900'
                  : 'text-emerald-800'
              }`}>
                <Wallet className="w-5 h-5" />
                📊 本月预算实时监控
              </h3>
              
              <div className="mb-3">
                <div className="flex justify-between mb-1 text-sm">
                  <span className={
                    liveBudgetStatus.isOverBudget ? 'text-crimson-700' : 'text-amber-700'
                  }>
                    已使用 {liveBudgetStatus.percentage}%
                  </span>
                  <span className="font-mono font-bold">
                    {formatCurrency(liveBudgetStatus.spent)} / {formatCurrency(liveBudgetStatus.limit)}
                  </span>
                </div>
                <div className="w-full bg-parchment-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      liveBudgetStatus.isOverBudget
                        ? 'bg-gradient-to-r from-crimson-500 to-crimson-600'
                        : liveBudgetStatus.percentage >= 80
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    }`}
                    style={{ width: `${Math.min(liveBudgetStatus.percentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-parchment-50 rounded-lg p-2 border border-parchment-300">
                  <p className="text-xs text-amber-600 mb-1">剩余额度</p>
                  <p className={`font-mono text-lg font-bold ${
                    liveBudgetStatus.isOverBudget ? 'text-crimson-700' : 'text-emerald-700'
                  }`}>
                    {liveBudgetStatus.isOverBudget
                      ? `-${formatCurrency(liveBudgetStatus.overAmount)}`
                      : formatCurrency(liveBudgetStatus.remaining)}
                  </p>
                </div>
                <div className="bg-parchment-50 rounded-lg p-2 border border-parchment-300">
                  <p className="text-xs text-amber-600 mb-1">本次消费</p>
                  <p className="font-mono text-lg font-bold text-amber-800">
                    {formatCurrency(calculations.discountPrice)}
                  </p>
                </div>
              </div>

              {liveBudgetStatus.isOverBudget && (
                <div className="mt-3 flex items-center gap-2 text-crimson-700 text-sm bg-crimson-100 rounded-lg p-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>保存后将超出预算 {formatCurrency(liveBudgetStatus.overAmount)}，仍可继续记录</span>
                </div>
              )}
            </div>
          )}

          {(parseFloat(formData.originalPrice) > 0 || calculations.daysUntilExpiry !== null) && (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4">
              <h3 className="font-display text-lg text-amber-900 mb-3 text-center">
                💰 实时计算
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-parchment-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-xs text-amber-600 mb-1">折后价</p>
                  <p className="font-mono text-2xl font-bold text-forest-700 number-pop">
                    {formatCurrency(calculations.discountPrice)}
                  </p>
                </div>
                <div className="bg-parchment-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-xs text-amber-600 mb-1">节省金额</p>
                  <p className="font-mono text-2xl font-bold text-crimson-700 number-pop">
                    {formatCurrency(calculations.savings)}
                  </p>
                </div>
                <div className="bg-parchment-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-xs text-amber-600 mb-1">离过期</p>
                  <p className={`font-mono text-2xl font-bold number-pop ${
                    calculations.daysUntilExpiry === null ? 'text-amber-400' :
                    calculations.daysUntilExpiry <= 3 ? 'text-crimson-700' :
                    calculations.daysUntilExpiry <= 7 ? 'text-amber-700' : 'text-forest-700'
                  }`}>
                    {calculations.daysUntilExpiry !== null 
                      ? `${calculations.daysUntilExpiry}天` 
                      : '--'}
                  </p>
                </div>
                <div className="bg-parchment-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-xs text-amber-600 mb-1">节省比例</p>
                  <p className="font-mono text-2xl font-bold text-map-600 number-pop">
                    {parseFloat(formData.originalPrice) > 0 
                      ? `${Math.round((1 - parseFloat(formData.discount) / 10) * 100)}%` 
                      : '--'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="btn-stamp btn-secondary flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              重置表单
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`btn-stamp btn-primary flex items-center justify-center gap-2 ${
                !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save className="w-5 h-5" />
              保存记录
            </button>
          </div>
        </form>
      </div>

      <BudgetAlertModal
        isOpen={showBudgetAlert}
        onClose={handleBudgetAlertClose}
        budgetStatus={pendingBudgetStatus}
      />
    </div>
  );
};

export default RecordForm;

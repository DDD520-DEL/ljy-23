import { useState, useMemo } from 'react';
import { Store, MapPin, Tag, Coins, Percent, Calendar, FileText, Save, RotateCcw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { calculateDiscountPrice, calculateSavings, calculateDaysUntilExpiry, formatCurrency, formatDiscount } from '../../utils/calculations';
import { getSupermarketCoords } from '../../utils/mockData';
import type { FormData } from '../../types';

const RecordForm = () => {
  const supermarkets = useStore((state) => state.supermarkets);
  const categories = useStore((state) => state.categories);
  const addRecord = useStore((state) => state.addRecord);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<FormData>({
    supermarketName: '',
    shelfLocation: '',
    productName: '',
    category: '',
    originalPrice: '',
    discount: '5',
    expiryDate: '',
    purchaseDate: today,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      supermarketName: '',
      shelfLocation: '',
      productName: '',
      category: '',
      originalPrice: '',
      discount: '5',
      expiryDate: '',
      purchaseDate: today,
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const coords = getSupermarketCoords(formData.supermarketName) || { 
      x: 20 + Math.random() * 60, 
      y: 20 + Math.random() * 60 
    };

    addRecord({
      supermarketName: formData.supermarketName,
      shelfLocation: formData.shelfLocation,
      productName: formData.productName,
      category: formData.category,
      originalPrice: parseFloat(formData.originalPrice),
      discount: parseFloat(formData.discount),
      expiryDate: formData.expiryDate,
      purchaseDate: formData.purchaseDate,
      notes: formData.notes,
      x: coords.x,
      y: coords.y,
    });

    setShowSuccess(true);
    resetForm();
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
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
    </div>
  );
};

export default RecordForm;

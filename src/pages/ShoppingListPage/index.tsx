import { useState } from 'react';
import { ShoppingCart, Plus, Trash2, CheckCircle2, Circle, Edit3, X, Save, Tag, Percent, Filter } from 'lucide-react';
import { useStore, useUserShoppingList } from '../../store/useStore';
import { getCategoryColor } from '../../utils/mockData';
import { formatDiscount } from '../../utils/calculations';

const ShoppingListPage = () => {
  const categories = useStore((state) => state.categories);
  const addShoppingListItem = useStore((state) => state.addShoppingListItem);
  const updateShoppingListItem = useStore((state) => state.updateShoppingListItem);
  const deleteShoppingListItem = useStore((state) => state.deleteShoppingListItem);
  const completeShoppingListItem = useStore((state) => state.completeShoppingListItem);
  const uncompleteShoppingListItem = useStore((state) => state.uncompleteShoppingListItem);
  const shoppingList = useUserShoppingList();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    targetDiscount: '5',
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('');

  const pendingItems = shoppingList.filter(item => !item.completed);
  const completedItems = shoppingList.filter(item => item.completed);

  const filteredItems = shoppingList.filter(item => {
    if (filterStatus === 'pending' && item.completed) return false;
    if (filterStatus === 'completed' && !item.completed) return false;
    if (filterCategory && item.category !== filterCategory) return false;
    return true;
  });

  const resetForm = () => {
    setFormData({ productName: '', category: '', targetDiscount: '5' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.category) return;

    if (editingId) {
      updateShoppingListItem(editingId, {
        productName: formData.productName.trim(),
        category: formData.category,
        targetDiscount: parseFloat(formData.targetDiscount),
      });
    } else {
      addShoppingListItem({
        productName: formData.productName.trim(),
        category: formData.category,
        targetDiscount: parseFloat(formData.targetDiscount),
        completed: false,
      });
    }
    resetForm();
  };

  const startEdit = (item: typeof shoppingList[0]) => {
    setFormData({
      productName: item.productName,
      category: item.category,
      targetDiscount: String(item.targetDiscount),
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const toggleComplete = (item: typeof shoppingList[0]) => {
    if (item.completed) {
      uncompleteShoppingListItem(item.id);
    } else {
      completeShoppingListItem(item.id);
    }
  };

  const usedCategories = Array.from(new Set(shoppingList.map(item => item.category)));

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <ShoppingCart className="w-6 h-6 text-amber-600" />
          <h2 className="title-display text-3xl md:text-4xl text-amber-900">
            购物清单
          </h2>
          <ShoppingCart className="w-6 h-6 text-amber-600" />
        </div>
        <p className="text-amber-700 font-body text-lg">
          提前规划要买的商品及目标折扣，捡漏时一键回填
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card-paper p-6 relative">
            <div className="tape" style={{ top: '-8px', right: '30px', transform: 'rotate(5deg)' }} />

            {showForm ? (
              <div className="relative z-10">
                <h3 className="font-display text-xl text-amber-900 mb-4 flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  {editingId ? '编辑商品' : '添加商品'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label-text">
                      <Tag className="inline w-5 h-5 mr-2" />
                      商品名称
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
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
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
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
                      <Percent className="inline w-5 h-5 mr-2" />
                      目标折扣 (折)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        value={formData.targetDiscount}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetDiscount: e.target.value }))}
                        min="1"
                        max="9"
                        step="0.5"
                        className="flex-1 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                      <span className="font-mono text-xl font-bold text-amber-800 w-16 text-center">
                        {formatDiscount(parseFloat(formData.targetDiscount) || 0)}
                      </span>
                    </div>
                    <input
                      type="number"
                      value={formData.targetDiscount}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetDiscount: e.target.value }))}
                      className="input-field font-mono mt-2"
                      min="1"
                      max="9"
                      step="0.5"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn-stamp btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      取消
                    </button>
                    <button
                      type="submit"
                      className="btn-stamp btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {editingId ? '更新' : '添加'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="relative z-10">
                <h3 className="font-display text-xl text-amber-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  新增规划
                </h3>
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full p-6 border-2 border-dashed border-amber-400 rounded-lg text-amber-700 hover:bg-amber-50 hover:border-amber-600 transition-all flex flex-col items-center gap-2"
                >
                  <Plus className="w-8 h-8" />
                  <span className="font-display text-lg">添加商品到清单</span>
                </button>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-parchment-100 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-600 mb-1">待捡漏</p>
                    <p className="font-mono text-2xl font-bold text-amber-800">{pendingItems.length}</p>
                  </div>
                  <div className="text-center p-3 bg-parchment-100 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-600 mb-1">已完成</p>
                    <p className="font-mono text-2xl font-bold text-forest-700">{completedItems.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card-paper p-6 relative">
            <div className="tape" style={{ top: '-8px', left: '40px', transform: 'rotate(-3deg)' }} />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-display text-xl text-amber-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  清单列表
                  <span className="badge-stamp stamp-amber text-xs">
                    {shoppingList.length} 项
                  </span>
                </h3>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-600" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                    className="px-3 py-1.5 bg-parchment-50 border-2 border-amber-400 rounded-lg text-sm font-body text-amber-900 focus:outline-none focus:border-amber-800"
                  >
                    <option value="all">全部</option>
                    <option value="pending">待捡漏</option>
                    <option value="completed">已完成</option>
                  </select>
                  {usedCategories.length > 0 && (
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-1.5 bg-parchment-50 border-2 border-amber-400 rounded-lg text-sm font-body text-amber-900 focus:outline-none focus:border-amber-800"
                    >
                      <option value="">全部品类</option>
                      {usedCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-amber-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-display text-lg">
                    {shoppingList.length === 0
                      ? '清单为空，快去添加想买的商品吧！'
                      : '没有符合筛选条件的商品'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map(item => {
                    const catColor = getCategoryColor(item.category);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          item.completed
                            ? 'bg-amber-50/50 border-amber-200 opacity-75'
                            : 'bg-parchment-50 border-amber-300 hover:border-amber-500 hover:shadow-md'
                        }`}
                      >
                        <button
                          onClick={() => toggleComplete(item)}
                          className="flex-shrink-0 transition-transform hover:scale-110"
                          title={item.completed ? '标记为未完成' : '标记为已完成'}
                        >
                          {item.completed
                            ? <CheckCircle2 className="w-6 h-6 text-forest-600" />
                            : <Circle className="w-6 h-6 text-amber-400 hover:text-amber-600" />
                          }
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-display text-lg ${
                              item.completed ? 'line-through text-amber-500' : 'text-amber-900'
                            }`}>
                              {item.productName}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium border"
                              style={{
                                backgroundColor: `${catColor}15`,
                                color: catColor,
                                borderColor: `${catColor}40`,
                              }}
                            >
                              {item.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-amber-600">
                            <span>目标折扣：</span>
                            <span className="font-mono font-bold text-amber-800">
                              {formatDiscount(item.targetDiscount)}
                            </span>
                            {item.completed && item.completedAt && (
                              <span className="text-forest-600 text-xs">
                                ✓ {new Date(item.completedAt).toLocaleDateString('zh-CN')} 完成
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-all"
                            title="编辑"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteShoppingListItem(item.id)}
                            className="p-2 text-amber-500 hover:text-crimson-700 hover:bg-red-50 rounded-lg transition-all"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListPage;

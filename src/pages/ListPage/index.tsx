import { useState, useMemo } from 'react';
import { useStore, useUserRecords, useUserTags } from '../../store/useStore';
import RecordCard from '../../components/Card/RecordCard';
import TagManager from '../../components/Tag/TagManager';
import BatchTagModal from '../../components/Tag/BatchTagModal';
import { 
  Search, Filter, Calendar, Store, Tag, ListTodo, X, ArrowUpDown, 
  Star, CheckSquare, Square, Tags, Trash2, Bookmark
} from 'lucide-react';

type SortOption = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc' | 'discount-asc' | 'discount-desc' | 'favorites-first';

const ListPage = () => {
  const supermarkets = useStore((state) => state.supermarkets);
  const categories = useStore((state) => state.categories);
  const deleteRecord = useStore((state) => state.deleteRecord);
  const records = useUserRecords();
  const tags = useUserTags();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupermarket, setSelectedSupermarket] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagFilterMode, setTagFilterMode] = useState<'all' | 'any'>('all');
  
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showBatchTagModal, setShowBatchTagModal] = useState(false);

  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (filterFavoritesOnly) {
      result = result.filter(r => r.isFavorite);
    }

    if (selectedTagIds.length > 0) {
      if (tagFilterMode === 'all') {
        result = result.filter(r => 
          selectedTagIds.every(tagId => r.tagIds?.includes(tagId))
        );
      } else {
        result = result.filter(r => 
          selectedTagIds.some(tagId => r.tagIds?.includes(tagId))
        );
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.productName.toLowerCase().includes(term) ||
        r.supermarketName.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term) ||
        r.shelfLocation.toLowerCase().includes(term) ||
        r.notes.toLowerCase().includes(term)
      );
    }

    if (selectedSupermarket) {
      result = result.filter(r => r.supermarketName === selectedSupermarket);
    }

    if (selectedCategory) {
      result = result.filter(r => r.category === selectedCategory);
    }

    if (startDate) {
      result = result.filter(r => r.purchaseDate >= startDate);
    }

    if (endDate) {
      result = result.filter(r => r.purchaseDate <= endDate);
    }

    if (sortBy === 'favorites-first') {
      result.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
      });
    } else {
      switch (sortBy) {
        case 'date-desc':
          result.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
          break;
        case 'date-asc':
          result.sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
          break;
        case 'price-desc':
          result.sort((a, b) => b.originalPrice - a.originalPrice);
          break;
        case 'price-asc':
          result.sort((a, b) => a.originalPrice - b.originalPrice);
          break;
        case 'discount-asc':
          result.sort((a, b) => a.discount - b.discount);
          break;
        case 'discount-desc':
          result.sort((a, b) => b.discount - a.discount);
          break;
      }
    }

    return result;
  }, [records, searchTerm, selectedSupermarket, selectedCategory, startDate, endDate, sortBy, filterFavoritesOnly, selectedTagIds, tagFilterMode]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSupermarket('');
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
    setSortBy('date-desc');
    setFilterFavoritesOnly(false);
    setSelectedTagIds([]);
  };

  const hasActiveFilters = searchTerm || selectedSupermarket || selectedCategory || startDate || endDate || filterFavoritesOnly || selectedTagIds.length > 0;

  const toggleTagFilter = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  const handleToggleSelect = (recordId: string) => {
    setSelectedRecordIds(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId) 
        : [...prev, recordId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecordIds.length === filteredRecords.length) {
      setSelectedRecordIds([]);
    } else {
      setSelectedRecordIds(filteredRecords.map(r => r.id));
    }
  };

  const handleBatchDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedRecordIds.length} 条记录吗？`)) {
      selectedRecordIds.forEach(id => deleteRecord(id));
      setSelectedRecordIds([]);
      setIsBatchMode(false);
    }
  };

  const handleBatchFavorite = () => {
    const hasNonFavorites = selectedRecordIds.some(id => {
      const record = records.find(r => r.id === id);
      return !record?.isFavorite;
    });
    
    selectedRecordIds.forEach(id => {
      const record = records.find(r => r.id === id);
      if (hasNonFavorites && !record?.isFavorite) {
        useStore.getState().toggleFavorite(id);
      } else if (!hasNonFavorites && record?.isFavorite) {
        useStore.getState().toggleFavorite(id);
      }
    });
  };

  const exitBatchMode = () => {
    setIsBatchMode(false);
    setSelectedRecordIds([]);
  };

  return (
    <div className="space-y-6">
      {isBatchMode && (
        <div className="card-paper p-4 border-2 border-amber-400 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-amber-600" />
              <span className="font-display text-xl text-amber-900">
                批量操作模式
              </span>
              <span className="badge-stamp stamp-amber">
                已选 {selectedRecordIds.length} 条
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSelectAll}
                className="btn-stamp btn-secondary flex items-center gap-1 text-sm"
              >
                {selectedRecordIds.length === filteredRecords.length ? (
                  <><Square className="w-4 h-4" /> 取消全选</>
                ) : (
                  <><CheckSquare className="w-4 h-4" /> 全选</>
                )}
              </button>
              <button
                onClick={handleBatchFavorite}
                disabled={selectedRecordIds.length === 0}
                className={`btn-stamp btn-primary flex items-center gap-1 text-sm ${
                  selectedRecordIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Star className="w-4 h-4" />
                {selectedRecordIds.some(id => !records.find(r => r.id === id)?.isFavorite) 
                  ? '批量收藏' 
                  : '批量取消收藏'}
              </button>
              <button
                onClick={() => setShowBatchTagModal(true)}
                disabled={selectedRecordIds.length === 0}
                className={`btn-stamp btn-primary flex items-center gap-1 text-sm ${
                  selectedRecordIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Tags className="w-4 h-4" />
                批量打标
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={selectedRecordIds.length === 0}
                className={`btn-stamp btn-danger flex items-center gap-1 text-sm ${
                  selectedRecordIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Trash2 className="w-4 h-4" />
                批量删除
              </button>
              <button
                onClick={exitBatchMode}
                className="btn-stamp btn-secondary flex items-center gap-1 text-sm"
              >
                <X className="w-4 h-4" />
                退出
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <ListTodo className="w-8 h-8 text-amber-600" />
          <h2 className="title-display text-3xl md:text-4xl text-amber-900">
            记录列表
          </h2>
          <ListTodo className="w-8 h-8 text-amber-600" />
        </div>
        <p className="text-amber-700 font-body text-lg">
          浏览你的所有捡漏记录，支持筛选和搜索
        </p>
      </div>

      <div className="card-paper p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              placeholder="搜索商品名称、超市、品类..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
              className={`btn-stamp flex items-center gap-2 ${
                filterFavoritesOnly 
                  ? 'btn-primary ring-2 ring-amber-500' 
                  : 'btn-secondary'
              }`}
            >
              <Star className={`w-5 h-5 ${filterFavoritesOnly ? 'fill-amber-100' : ''}`} />
              收藏
            </button>

            <button
              onClick={() => setShowTagManager(true)}
              className="btn-stamp btn-secondary flex items-center gap-2"
            >
              <Tags className="w-5 h-5" />
              标签管理
            </button>

            <button
              onClick={() => setIsBatchMode(!isBatchMode)}
              className={`btn-stamp flex items-center gap-2 ${
                isBatchMode ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              批量操作
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-stamp btn-secondary flex items-center gap-2 ${
                hasActiveFilters ? 'ring-2 ring-amber-500' : ''
              }`}
            >
              <Filter className="w-5 h-5" />
              筛选
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-amber-600 text-white rounded-full text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-stamp btn-danger flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                清除
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="space-y-4 pt-4 border-t-2 border-amber-200 animate-scroll">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="label-text text-base">
                  <Store className="inline w-4 h-4 mr-1" />
                  超市
                </label>
                <select
                  value={selectedSupermarket}
                  onChange={(e) => setSelectedSupermarket(e.target.value)}
                  className="input-field"
                >
                  <option value="">全部超市</option>
                  {supermarkets.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text text-base">
                  <Tag className="inline w-4 h-4 mr-1" />
                  品类
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="">全部品类</option>
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text text-base">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  开始日期
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field font-mono"
                />
              </div>

              <div>
                <label className="label-text text-base">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  结束日期
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field font-mono"
                />
              </div>
            </div>

            {tags.length > 0 && (
              <div className="bg-parchment-50 rounded-lg p-4 border border-amber-200">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <label className="label-text text-base flex items-center gap-2">
                    <Bookmark className="inline w-4 h-4" />
                    标签筛选
                    {selectedTagIds.length > 0 && (
                      <span className="badge-stamp stamp-amber text-xs">
                        已选 {selectedTagIds.length}
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <span className="text-sm text-amber-600">匹配模式：</span>
                    <button
                      onClick={() => setTagFilterMode('all')}
                      className={`text-xs px-3 py-1 rounded transition-colors ${
                        tagFilterMode === 'all'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                    >
                      同时拥有
                    </button>
                    <button
                      onClick={() => setTagFilterMode('any')}
                      className={`text-xs px-3 py-1 rounded transition-colors ${
                        tagFilterMode === 'any'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                    >
                      任一拥有
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTagFilter(tag.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'hover:scale-105'
                            : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: isSelected ? tag.color : `${tag.color}20`,
                          color: isSelected ? 'white' : tag.color,
                          border: `2px solid ${isSelected ? tag.color : 'transparent'}`,
                          boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px ${tag.color}` : 'none',
                        }}
                      >
                        <Tag className="w-3.5 h-3.5" />
                        {tag.name}
                        {isSelected && <X className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t-2 border-amber-200">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-amber-700" />
            <span className="font-display text-amber-800">排序：</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="input-field w-auto py-2 px-3"
            >
              <option value="favorites-first">⭐ 收藏置顶</option>
              <option value="date-desc">日期（新→旧）</option>
              <option value="date-asc">日期（旧→新）</option>
              <option value="price-desc">原价（高→低）</option>
              <option value="price-asc">原价（低→高）</option>
              <option value="discount-asc">折扣（低→高）</option>
              <option value="discount-desc">折扣（高→低）</option>
            </select>
          </div>

          <div className="flex-1 text-right">
            <span className="badge-stamp stamp-amber">
              共 {filteredRecords.length} 条记录
            </span>
          </div>
        </div>
      </div>

      {filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record, index) => (
            <div
              key={record.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-fadeIn"
            >
              <RecordCard
                record={record}
                onDelete={deleteRecord}
                showActions={true}
                tags={tags}
                showCheckbox={isBatchMode}
                isSelected={selectedRecordIds.includes(record.id)}
                onToggleSelect={handleToggleSelect}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="card-paper p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="font-display text-2xl text-amber-900 mb-2">
            {records.length === 0 ? '暂无记录' : '没有找到匹配的记录'}
          </h3>
          <p className="text-amber-700 mb-4">
            {records.length === 0 
              ? '开始记录你的捡漏经历吧！'
              : '试试调整筛选条件或搜索关键词'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-stamp btn-secondary"
            >
              清除所有筛选条件
            </button>
          )}
        </div>
      )}

      {filteredRecords.length > 0 && (
        <div className="card-paper p-4 mt-6">
          <h3 className="font-display text-xl text-amber-900 mb-4">📊 当前筛选结果统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-parchment-100 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-600 mb-1">记录数</p>
              <p className="font-mono text-2xl font-bold text-amber-800">{filteredRecords.length}</p>
            </div>
            <div className="text-center p-3 bg-parchment-100 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-600 mb-1">总原价</p>
              <p className="font-mono text-2xl font-bold text-amber-800">
                ¥{filteredRecords.reduce((sum, r) => sum + r.originalPrice, 0).toFixed(2)}
              </p>
            </div>
            <div className="text-center p-3 bg-parchment-100 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-600 mb-1">总节省</p>
              <p className="font-mono text-2xl font-bold text-forest-700">
                ¥{filteredRecords.reduce((sum, r) => sum + r.originalPrice * (1 - r.discount / 10), 0).toFixed(2)}
              </p>
            </div>
            <div className="text-center p-3 bg-parchment-100 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-600 mb-1">平均折扣</p>
              <p className="font-mono text-2xl font-bold text-crimson-700">
                {filteredRecords.length > 0 
                  ? (filteredRecords.reduce((sum, r) => sum + r.discount, 0) / filteredRecords.length).toFixed(1)
                  : 0}折
              </p>
            </div>
          </div>
        </div>
      )}

      <TagManager
        isOpen={showTagManager}
        onClose={() => setShowTagManager(false)}
      />

      <BatchTagModal
        isOpen={showBatchTagModal}
        onClose={() => setShowBatchTagModal(false)}
        selectedRecordIds={selectedRecordIds}
      />
    </div>
  );
};

export default ListPage;

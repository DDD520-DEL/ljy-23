import { useState, useRef, useEffect } from 'react';
import { Search, TrendingDown, Clock, Store, Tag, ChevronRight, X } from 'lucide-react';
import { useProductPriceCompare, useSearchProductNames, useStore } from '../../store/useStore';
import { formatDate, formatCurrency } from '../../utils/calculations';
import { getCategoryColor } from '../../utils/mockData';
import type { SupermarketPriceCompare } from '../../types';

const PriceComparePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const allProductNames = useStore((state) => state.getAllProductNames());
  const suggestions = useSearchProductNames(searchQuery);
  const priceCompare = useProductPriceCompare(selectedProduct);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);
  };

  const handleSelectProduct = (productName: string) => {
    setSelectedProduct(productName);
    setSearchQuery(productName);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedProduct('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSelectProduct(suggestions[0]);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const categoryColor = priceCompare ? getCategoryColor(priceCompare.category) : '#D97706';

  const SupermarketCard = ({ data, isLowest }: { data: SupermarketPriceCompare; isLowest: boolean }) => {
    return (
      <div
        className={`flex-shrink-0 w-72 card-paper p-5 relative transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
          isLowest ? 'ring-4 ring-forest-500 ring-opacity-60' : ''
        }`}
      >
        {isLowest && (
          <div className="absolute -top-3 -right-3 bg-forest-600 text-parchment-100 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            最低价
          </div>
        )}
        <div className="tape" style={{ top: '-6px', left: '20px', transform: 'rotate(-1deg)' }} />
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-100 border-2 border-amber-400 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h3 className="font-display text-lg text-amber-900 leading-tight">
              {data.supermarketName}
            </h3>
            <span className="text-xs text-amber-600">
              共 {data.totalRecords} 条记录
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className={`p-3 rounded-xl border-2 ${
            isLowest 
              ? 'bg-forest-50 border-forest-400' 
              : 'bg-amber-50 border-amber-300'
          }`}>
            <div className="flex items-center gap-2 text-xs text-amber-600 mb-1">
              <TrendingDown className={`w-4 h-4 ${isLowest ? 'text-forest-600' : ''}`} />
              <span>历史最低价</span>
            </div>
            <p className={`font-mono text-2xl font-bold ${
              isLowest ? 'text-forest-700' : 'text-amber-800'
            }`}>
              {formatCurrency(data.lowestPrice)}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              {formatDate(data.lowestPriceDate)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-parchment-100 border-2 border-amber-200">
            <div className="flex items-center gap-2 text-xs text-amber-600 mb-1">
              <Clock className="w-4 h-4" />
              <span>最近购买价</span>
            </div>
            <p className="font-mono text-xl font-bold text-amber-800">
              {formatCurrency(data.latestPrice)}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              {formatDate(data.latestPriceDate)}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-amber-700 pt-2 border-t border-amber-200">
            <span>平均价格</span>
            <span className="font-mono font-semibold">{formatCurrency(data.averagePrice)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="title-display text-3xl md:text-4xl text-amber-900 mb-2">
          🔍 商品比价
        </h1>
        <p className="text-amber-700 max-w-md mx-auto">
          输入商品名称，对比各超市的历史价格，找出最划算的购买时机
        </p>
      </div>

      <div className="max-w-2xl mx-auto relative">
        <div className={`card-paper p-2 transition-all duration-300 ${
          isSearchFocused ? 'ring-4 ring-amber-400 ring-opacity-50' : ''
        }`}>
          <div className="flex items-center gap-3 px-4">
            <Search className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => {
                setIsSearchFocused(true);
                if (searchQuery) setShowSuggestions(true);
              }}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="输入商品名称，例如：牛奶、面包..."
              className="flex-1 py-3 bg-transparent text-amber-900 placeholder-amber-400 font-body text-lg outline-none"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="p-2 rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 card-paper p-2 max-h-80 overflow-y-auto z-50 shadow-2xl"
          >
            {suggestions.map((productName, index) => (
              <button
                key={productName}
                onClick={() => handleSelectProduct(productName)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left hover:bg-amber-100 transition-colors group"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-800 font-body">{productName}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:text-amber-600 transition-colors" />
              </button>
            ))}
          </div>
        )}

        {showSuggestions && searchQuery && suggestions.length === 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 card-paper p-6 text-center z-50"
          >
            <div className="text-4xl mb-2">🤔</div>
            <p className="text-amber-700">未找到匹配的商品</p>
            <p className="text-amber-500 text-sm mt-1">试试其他关键词，或先添加该商品的记录</p>
          </div>
        )}
      </div>

      {!selectedProduct && allProductNames.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <p className="text-amber-600 text-sm mb-3 text-center">热门搜索</p>
          <div className="flex flex-wrap justify-center gap-2">
            {allProductNames.slice(0, 12).map((name) => (
              <button
                key={name}
                onClick={() => handleSelectProduct(name)}
                className="badge-stamp bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="space-y-6">
          {priceCompare ? (
            <>
              <div className="card-paper p-6 relative overflow-hidden">
                <div className="tape" style={{ top: '-8px', left: '50%', transform: 'translateX(-50%) rotate(1deg)' }} />
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${categoryColor}20`, border: `3px solid ${categoryColor}` }}
                      >
                        <Tag className="w-8 h-8" style={{ color: categoryColor }} />
                      </div>
                      <div>
                        <h2 className="title-display text-2xl text-amber-900">
                          {priceCompare.productName}
                        </h2>
                        <span
                          className="badge-stamp mt-1"
                          style={{
                            backgroundColor: `${categoryColor}15`,
                            color: categoryColor,
                            borderColor: categoryColor,
                          }}
                        >
                          {priceCompare.category}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-forest-500 to-emerald-500 text-parchment-100 p-4 rounded-2xl shadow-lg">
                      <div className="text-xs opacity-90 mb-1">🏆 全网最低价</div>
                      <div className="font-mono text-3xl font-bold">
                        {formatCurrency(priceCompare.overallLowestPrice)}
                      </div>
                      <div className="text-sm opacity-90 mt-1">
                        {priceCompare.overallLowestPriceSupermarket} · {formatDate(priceCompare.overallLowestPriceDate)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <p className="text-amber-700 text-sm">
                      该商品在 <span className="font-bold text-amber-900">{priceCompare.supermarkets.length}</span> 家超市有记录，
                      点击卡片查看各超市详细价格对比
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl text-amber-900">
                    📊 各超市价格对比
                  </h3>
                  <span className="text-sm text-amber-600">
                    按历史最低价排序
                  </span>
                </div>
                
                <div className="flex gap-6 overflow-x-auto pb-6 px-2 -mx-2 scrollbar-thin">
                  {priceCompare.supermarkets.map((supermarketData, index) => (
                    <SupermarketCard
                      key={supermarketData.supermarketName}
                      data={supermarketData}
                      isLowest={index === 0}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card-paper p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="font-display text-2xl text-amber-900 mb-2">
                暂无该商品的记录
              </h3>
              <p className="text-amber-700 mb-4">
                还没有「{selectedProduct}」的购买记录，快去添加一条吧！
              </p>
              <button
                onClick={handleClearSearch}
                className="btn-stamp btn-primary"
              >
                搜索其他商品
              </button>
            </div>
          )}
        </div>
      )}

      {!selectedProduct && allProductNames.length === 0 && (
        <div className="card-paper p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="font-display text-2xl text-amber-900 mb-2">
            还没有商品记录
          </h3>
          <p className="text-amber-700">
            先去记录中心添加一些商品购买记录，然后再来比价吧！
          </p>
        </div>
      )}
    </div>
  );
};

export default PriceComparePage;

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, TrendingDown, Calendar } from 'lucide-react';
import { useProductPriceHistory } from '../../store/useStore';
import PriceHistoryChart from '../../components/Chart/PriceHistoryChart';
import { formatDate } from '../../utils/calculations';
import { getCategoryColor } from '../../utils/mockData';

const ProductDetailPage = () => {
  const { productName } = useParams<{ productName: string }>();
  const navigate = useNavigate();
  const decodedName = productName ? decodeURIComponent(productName) : '';
  const priceHistory = useProductPriceHistory(decodedName);

  const categoryColor = priceHistory ? getCategoryColor(priceHistory.category) : '#D97706';

  if (!priceHistory) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-stamp btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>
        <div className="card-paper p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="font-display text-2xl text-amber-900 mb-2">
            未找到该商品
          </h3>
          <p className="text-amber-700">
            请检查商品名称是否正确，或返回列表查看其他商品
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-stamp btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>
      </div>

      <div className="card-paper p-6 md:p-8 relative overflow-hidden">
        <div className="tape" style={{ top: '-8px', left: '50%', transform: 'translateX(-50%) rotate(2deg)' }} />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${categoryColor}20`, border: `3px solid ${categoryColor}` }}
                >
                  <Tag className="w-6 h-6" style={{ color: categoryColor }} />
                </div>
                <div>
                  <h1 className="title-display text-2xl md:text-3xl text-amber-900">
                    {priceHistory.productName}
                  </h1>
                  <span 
                    className="badge-stamp mt-1"
                    style={{ 
                      backgroundColor: `${categoryColor}15`, 
                      color: categoryColor, 
                      borderColor: categoryColor 
                    }}
                  >
                    {priceHistory.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="bg-forest-50 border-2 border-forest-600 rounded-xl px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-forest-700 mb-1">
                  <TrendingDown className="w-4 h-4" />
                  <span>历史最低价入手</span>
                </div>
                <p className="font-mono text-xl font-bold text-forest-700">
                  ¥{priceHistory.lowestPrice.toFixed(2)}
                </p>
                <p className="text-xs text-forest-600 mt-1">
                  {priceHistory.lowestPriceSupermarket}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-amber-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>首次记录：{formatDate(priceHistory.history[0]?.date || '')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>最近记录：{formatDate(priceHistory.history[priceHistory.history.length - 1]?.date || '')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>共 {priceHistory.totalRecords} 条历史记录</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PriceHistoryChart history={priceHistory} />
    </div>
  );
};

export default ProductDetailPage;

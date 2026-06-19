import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Calendar, MapPin, Tag, Clock, Coins, Percent, TrendingDown, Star } from 'lucide-react';
import type { Record, Tag as TagType } from '../../types';
import { calculateDiscountPrice, calculateSavings, calculateDaysUntilExpiry, formatCurrency, formatDiscount, formatShortDate, getExpiryStatus } from '../../utils/calculations';
import { getCategoryColor } from '../../utils/mockData';
import { useStore } from '../../store/useStore';

interface RecordCardProps {
  record: Record;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  tags?: TagType[];
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  showCheckbox?: boolean;
}

const RecordCard = ({ record, onDelete, showActions = true, tags = [], isSelected = false, onToggleSelect, showCheckbox = false }: RecordCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const toggleFavorite = useStore((state) => state.toggleFavorite);
  
  const discountPrice = calculateDiscountPrice(record.originalPrice, record.discount);
  const savings = calculateSavings(record.originalPrice, record.discount);
  const daysUntilExpiry = calculateDaysUntilExpiry(record.expiryDate);
  const expiryStatus = getExpiryStatus(daysUntilExpiry);
  const categoryColor = getCategoryColor(record.category);
  
  const recordTags = tags.filter(t => record.tagIds?.includes(t.id));

  const handleProductClick = () => {
    navigate(`/product/${encodeURIComponent(record.productName)}`);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete?.(record.id);
    }, 300);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(record.id);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.(record.id);
  };

  return (
    <div 
      className={`card-paper p-5 relative overflow-hidden transition-all duration-300 ${
        isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      } ${isSelected ? 'ring-4 ring-amber-500 ring-opacity-70' : ''}`}
    >
      <div className="tape" style={{ top: '-8px', left: '20px' }} />
      
      {showCheckbox && (
        <div className="absolute top-3 left-3 z-20">
          <button
            onClick={handleCheckboxClick}
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
              isSelected 
                ? 'bg-amber-600 border-amber-600 text-white' 
                : 'bg-white border-amber-300 hover:border-amber-500'
            }`}
          >
            {isSelected && <span className="text-sm font-bold">✓</span>}
          </button>
        </div>
      )}
      
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        <button
          onClick={handleFavoriteClick}
          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 ${
            record.isFavorite 
              ? 'bg-amber-100 border-2 border-amber-500' 
              : 'bg-white border-2 border-amber-200 hover:border-amber-400'
          }`}
          title={record.isFavorite ? '取消收藏' : '添加收藏'}
        >
          <Star 
            className={`w-4 h-4 ${record.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-amber-300'}`} 
          />
        </button>
        
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
          style={{ backgroundColor: `${categoryColor}20`, border: `2px solid ${categoryColor}` }}
        >
          <Tag className="w-4 h-4" style={{ color: categoryColor }} />
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <button
              onClick={handleProductClick}
              className="text-left group"
            >
              <h3 className="font-display text-xl text-amber-900 mb-1 group-hover:text-amber-600 transition-colors flex items-center gap-2">
                {record.productName}
                <TrendingDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
              </h3>
            </button>
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <MapPin className="w-4 h-4" />
              <span>{record.supermarketName}</span>
            </div>
          </div>
          
          <div className="text-right">
            <span 
              className="badge-stamp mb-1"
              style={{ 
                backgroundColor: `${categoryColor}15`, 
                color: categoryColor, 
                borderColor: categoryColor 
              }}
            >
              {record.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Calendar className="w-3 h-3" />
              <span>{formatShortDate(record.purchaseDate)}</span>
            </div>
          </div>
        </div>

        <div className="bg-parchment-100 rounded-lg p-3 mb-3 border border-amber-300">
          <div className="flex items-center gap-1 text-sm text-amber-700 mb-1">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span className="font-medium">货架位置：</span>
            <span>{record.shelfLocation}</span>
          </div>
          {record.notes && (
            <p className="text-sm text-amber-600 italic">
              "{record.notes}"
            </p>
          )}
        </div>

        {recordTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {recordTags.map(tag => (
              <span
                key={tag.id}
                className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                style={{ 
                  backgroundColor: `${tag.color}20`, 
                  color: tag.color,
                  border: `1px solid ${tag.color}40`
                }}
              >
                <Tag className="w-3 h-3" />
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-parchment-100 rounded-lg p-2 text-center border border-amber-200">
            <div className="flex items-center justify-center gap-1 text-xs text-amber-600 mb-1">
              <Coins className="w-3 h-3" />
              <span>原价</span>
            </div>
            <p className="font-mono text-lg text-amber-800 line-through">
              {formatCurrency(record.originalPrice)}
            </p>
          </div>

          <div className="bg-parchment-100 rounded-lg p-2 text-center border border-amber-200">
            <div className="flex items-center justify-center gap-1 text-xs text-amber-600 mb-1">
              <Percent className="w-3 h-3" />
              <span>折扣</span>
            </div>
            <p className="font-mono text-lg text-amber-700">
              {formatDiscount(record.discount)}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-2 text-center border-2 border-forest-700">
            <div className="flex items-center justify-center gap-1 text-xs text-forest-700 mb-1">
              <Coins className="w-3 h-3" />
              <span>折后价</span>
            </div>
            <p className="font-mono text-lg font-bold text-forest-700">
              {formatCurrency(discountPrice)}
            </p>
          </div>

          <div className={`rounded-lg p-2 text-center border-2 ${expiryStatus.bgColor} ${expiryStatus.color} border-current`}>
            <div className="flex items-center justify-center gap-1 text-xs mb-1">
              <Clock className="w-3 h-3" />
              <span>{expiryStatus.status}</span>
            </div>
            <p className="font-mono text-lg font-bold">
              {daysUntilExpiry > 0 ? `${daysUntilExpiry}天` : '已过期'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className={`badge-stamp stamp-green ${savings > 0 ? '' : 'opacity-50'}`}>
            💰 节省 {formatCurrency(savings)}
          </div>

          {showActions && (
            <button
              onClick={handleDelete}
              className="p-2 text-crimson-700 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
              title="删除记录"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordCard;

import { X, Star, Clock, ShoppingBag, Coins, TrendingUp, Calendar, Award } from 'lucide-react';
import type { SupermarketDetail } from '../../types';
import { formatCurrency, formatDiscount, formatShortDate } from '../../utils/calculations';

interface SupermarketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: SupermarketDetail | null;
}

const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'S': return 'from-amber-400 to-amber-600';
    case 'A': return 'from-emerald-400 to-emerald-600';
    case 'B': return 'from-blue-400 to-blue-600';
    case 'C': return 'from-purple-400 to-purple-600';
    default: return 'from-gray-400 to-gray-600';
  }
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-crimson-600';
};

const ProgressBar = ({ value, color }: { value: number; color: string }) => (
  <div className="w-full bg-parchment-200 rounded-full h-3 overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-1000 ${color}`}
      style={{ width: `${value}%` }}
    />
  </div>
);

const CategoryCard = ({ category, rank }: { category: any; rank: number }) => (
  <div className="bg-parchment-50 rounded-xl p-4 border-2 transition-all hover:scale-105" style={{ borderColor: category.color }}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
          rank === 0 ? 'bg-amber-500' : rank === 1 ? 'bg-gray-400' : 'bg-amber-700'
        }`}>
          #{rank + 1}
        </span>
        <span className="font-display text-amber-900">{category.name}</span>
      </div>
      <div className={`font-mono font-bold text-lg ${getScoreColor(category.score)}`}>
        {category.score}
      </div>
    </div>
    <div className="flex items-center justify-between text-sm text-amber-700 mb-2">
      <span className="flex items-center gap-1">
        <ShoppingBag className="w-3 h-3" />
        {category.count} 次
      </span>
      <span className="flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        {category.averageDiscount} 折
      </span>
      <span className="flex items-center gap-1">
        <Coins className="w-3 h-3" />
        ¥{category.totalSavings.toFixed(0)}
      </span>
    </div>
    <ProgressBar value={category.score} color="bg-gradient-to-r from-amber-400 to-amber-600" />
  </div>
);

const TimeSlotCard = ({ timeSlot, rank }: { timeSlot: any; rank: number }) => (
  <div className={`rounded-xl p-4 border-2 transition-all hover:scale-105 ${
    rank === 0 ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-400' : 'bg-parchment-50 border-parchment-300'
  }`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        {rank === 0 && <Award className="w-5 h-5 text-amber-500" />}
        <span className="font-display text-amber-900 text-sm">{timeSlot.timeSlot}</span>
      </div>
      <div className={`font-mono font-bold ${getScoreColor(timeSlot.score)}`}>
        {timeSlot.score}
      </div>
    </div>
    <div className="flex items-center justify-between text-xs text-amber-700 mb-2">
      <span className="flex items-center gap-1">
        <ShoppingBag className="w-3 h-3" />
        {timeSlot.count} 次
      </span>
      <span className="flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        {timeSlot.averageDiscount} 折
      </span>
      <span className="flex items-center gap-1">
        <Coins className="w-3 h-3" />
        ¥{timeSlot.totalSavings.toFixed(0)}
      </span>
    </div>
    <ProgressBar value={timeSlot.score} color="bg-gradient-to-r from-emerald-400 to-emerald-600" />
  </div>
);

const SupermarketDetailModal = ({ isOpen, onClose, detail }: SupermarketDetailModalProps) => {
  if (!isOpen || !detail) return null;

  const { score, topCategories, topTimeSlots, recentRecords, name } = detail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-parchment-50 rounded-3xl shadow-2xl border-4 border-amber-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
        >
          <X className="w-5 h-5 text-amber-800" />
        </button>

        <div className={`bg-gradient-to-r ${getGradeColor(score.grade)} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 text-3xl font-bold backdrop-blur-sm">
                  {score.grade}
                </span>
                <div>
                  <h2 className="font-display text-3xl">{name}</h2>
                  <p className="text-white/80 font-medium">折扣质量评分详情</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-6xl font-bold">{score.totalScore}</div>
              <div className="text-white/80 text-sm">综合评分</div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-parchment-100 rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">💰</div>
              <div className="font-mono text-2xl font-bold text-amber-900">{score.discountScore}</div>
              <div className="text-sm text-amber-700">折扣力度 (40%)</div>
              <div className="text-xs text-amber-600 mt-1">平均 {score.averageDiscount} 折</div>
            </div>
            <div className="bg-parchment-100 rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">🛒</div>
              <div className="font-mono text-2xl font-bold text-amber-900">{score.frequencyScore}</div>
              <div className="text-sm text-amber-700">捡漏频率 (30%)</div>
              <div className="text-xs text-amber-600 mt-1">共 {score.count} 次</div>
            </div>
            <div className="bg-parchment-100 rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">💵</div>
              <div className="font-mono text-2xl font-bold text-amber-900">{score.savingsScore}</div>
              <div className="text-sm text-amber-700">省钱金额 (30%)</div>
              <div className="text-xs text-amber-600 mt-1">累计省 ¥{score.totalSavings.toFixed(0)}</div>
            </div>
          </div>

          {topCategories.length > 0 && (
            <div>
              <h3 className="font-display text-xl text-amber-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                最值得蹲守的品类
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topCategories.map((category, index) => (
                  <CategoryCard key={category.name} category={category} rank={index} />
                ))}
              </div>
            </div>
          )}

          {topTimeSlots.length > 0 && (
            <div>
              <h3 className="font-display text-xl text-amber-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                最佳捡漏时间段
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topTimeSlots.map((timeSlot, index) => (
                  <TimeSlotCard key={timeSlot.timeSlot} timeSlot={timeSlot} rank={index} />
                ))}
              </div>
              {topTimeSlots.length > 0 && (
                <div className="mt-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Clock className="w-5 h-5" />
                    <span className="font-display">💡 蹲守建议：</span>
                  </div>
                  <p className="mt-2 text-emerald-700 text-sm ml-7">
                    根据历史数据分析，<strong className="text-emerald-800">{topTimeSlots[0].timeSlot}</strong> 是在 {name} 捡漏的黄金时段，
                    平均折扣可达 <strong className="text-emerald-800">{topTimeSlots[0].averageDiscount} 折</strong>，
                    建议重点关注！
                  </p>
                </div>
              )}
            </div>
          )}

          {recentRecords.length > 0 && (
            <div>
              <h3 className="font-display text-xl text-amber-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                最近捡漏记录
              </h3>
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <div key={record.id} className="bg-parchment-100 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-lg">
                        {record.category.charAt(0)}
                      </div>
                      <div>
                        <div className="font-display text-amber-900">{record.productName}</div>
                        <div className="text-sm text-amber-700">
                          {formatShortDate(record.purchaseDate)} · {record.shelfLocation}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold text-crimson-700">
                        {formatDiscount(record.discount)}
                      </div>
                      <div className="text-sm text-forest-700 font-mono">
                        省 {formatCurrency(record.originalPrice - (record.originalPrice * record.discount / 10))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupermarketDetailModal;

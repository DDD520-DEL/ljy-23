import type { SupermarketScore } from '../../types';
import { Star, TrendingUp, Coins, ShoppingBag, ChevronRight } from 'lucide-react';

interface SupermarketScoreRankingProps {
  data: SupermarketScore[];
  onSelectSupermarket: (name: string) => void;
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

const getGradeBg = (grade: string): string => {
  switch (grade) {
    case 'S': return 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-400';
    case 'A': return 'bg-gradient-to-br from-emerald-100 to-emerald-200 border-emerald-400';
    case 'B': return 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400';
    case 'C': return 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-400';
    default: return 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400';
  }
};

const ProgressBar = ({ value, color }: { value: number; color: string }) => (
  <div className="w-full bg-parchment-200 rounded-full h-2 overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-700 ${color}`}
      style={{ width: `${value}%` }}
    />
  </div>
);

const SupermarketScoreRanking = ({ data, onSelectSupermarket }: SupermarketScoreRankingProps) => {
  if (data.length === 0) return null;

  return (
    <div className="card-paper p-6">
      <h3 className="font-display text-2xl text-amber-900 mb-6 flex items-center gap-2">
        <Star className="w-6 h-6 text-amber-500" />
        超市折扣质量评分排行
      </h3>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div
            key={item.name}
            onClick={() => onSelectSupermarket(item.name)}
            className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${getGradeBg(item.grade)}`}
          >
            <div className="absolute -top-3 -left-3">
              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-white text-lg bg-gradient-to-br ${getGradeColor(item.grade)} shadow-lg`}>
                {item.grade}
              </span>
            </div>

            <div className="flex items-start justify-between mb-4 pl-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-mono font-bold text-sm ${
                    index === 0 ? 'bg-amber-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-parchment-300 text-amber-800'
                  }`}>
                    #{index + 1}
                  </span>
                  <h4 className="font-display text-xl text-amber-900">{item.name}</h4>
                </div>
                <div className="flex items-center gap-4 text-sm text-amber-700 ml-9">
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="w-4 h-4" />
                    {item.count} 次
                  </span>
                  <span className="flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    省 ¥{item.totalSavings.toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {item.averageDiscount} 折
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-mono text-4xl font-bold text-amber-900">
                  {item.totalScore}
                </div>
                <div className="text-xs text-amber-600 font-mono">综合评分</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 ml-8 mb-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-amber-700 font-medium">折扣力度</span>
                  <span className="text-xs font-mono text-amber-800">{item.discountScore}</span>
                </div>
                <ProgressBar value={item.discountScore} color="bg-gradient-to-r from-amber-400 to-amber-600" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-amber-700 font-medium">捡漏频率</span>
                  <span className="text-xs font-mono text-amber-800">{item.frequencyScore}</span>
                </div>
                <ProgressBar value={item.frequencyScore} color="bg-gradient-to-r from-emerald-400 to-emerald-600" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-amber-700 font-medium">省钱金额</span>
                  <span className="text-xs font-mono text-amber-800">{item.savingsScore}</span>
                </div>
                <ProgressBar value={item.savingsScore} color="bg-gradient-to-r from-blue-400 to-blue-600" />
              </div>
            </div>

            <div className="flex justify-end">
              <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium hover:text-amber-800">
                查看蹲守攻略
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupermarketScoreRanking;

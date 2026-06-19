import { AlertTriangle, X, Coins, ShoppingBag, PieChart } from 'lucide-react';
import type { BudgetStatus } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface BudgetAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetStatus: BudgetStatus | null;
}

const BudgetAlertModal = ({ isOpen, onClose, budgetStatus }: BudgetAlertModalProps) => {
  if (!isOpen || !budgetStatus || !budgetStatus.isOverBudget) return null;

  const totalSpent = budgetStatus.spent;
  const totalByCategory = budgetStatus.byCategory.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-parchment-50 rounded-3xl shadow-2xl border-4 border-crimson-400 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-crimson-100 hover:bg-crimson-200 transition-colors"
        >
          <X className="w-5 h-5 text-crimson-800" />
        </button>

        <div className="bg-gradient-to-r from-crimson-500 to-crimson-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-display text-2xl">⚠️ 预算超支提醒</h2>
              <p className="text-white/80 text-sm">本月捡漏已超出预算</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-parchment-100 rounded-xl p-4 text-center border-2 border-parchment-300">
              <div className="text-xs text-amber-600 mb-1">预算上限</div>
              <div className="font-mono text-xl font-bold text-amber-900">
                {formatCurrency(budgetStatus.limit)}
              </div>
            </div>
            <div className="bg-parchment-100 rounded-xl p-4 text-center border-2 border-parchment-300">
              <div className="text-xs text-amber-600 mb-1">已花费</div>
              <div className="font-mono text-xl font-bold text-crimson-700">
                {formatCurrency(totalSpent)}
              </div>
            </div>
            <div className="bg-crimson-50 rounded-xl p-4 text-center border-2 border-crimson-300">
              <div className="text-xs text-crimson-600 mb-1">超支金额</div>
              <div className="font-mono text-xl font-bold text-crimson-700">
                +{formatCurrency(budgetStatus.overAmount)}
              </div>
            </div>
          </div>

          {budgetStatus.byCategory.length > 0 && (
            <div>
              <h3 className="font-display text-lg text-amber-900 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-amber-600" />
                各品类超支分布明细
              </h3>
              <div className="space-y-3">
                {budgetStatus.byCategory.map((category) => {
                  const percentage = totalByCategory > 0
                    ? Math.round((category.totalSpent / totalByCategory) * 100)
                    : 0;
                  const isOverLimit = budgetStatus.limit > 0 && category.totalSpent > (budgetStatus.limit / budgetStatus.byCategory.length);

                  return (
                    <div
                      key={category.name}
                      className={`rounded-xl p-4 border-2 transition-all ${
                        isOverLimit
                          ? 'bg-crimson-50 border-crimson-200'
                          : 'bg-parchment-100 border-parchment-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-display text-amber-900">{category.name}</span>
                          <span className="text-xs text-amber-600">
                            ({category.count} 次)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`font-mono font-bold ${
                            isOverLimit ? 'text-crimson-700' : 'text-amber-800'
                          }`}>
                            {formatCurrency(category.totalSpent)}
                          </span>
                          <span className="text-xs text-amber-600 ml-2">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-parchment-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-display mb-1">💡 省钱建议：</p>
                <ul className="list-disc list-inside space-y-1 text-amber-700">
                  <li>本月超支较多，建议下月适当收紧预算</li>
                  <li>关注高折扣时段，平均折扣可提升 10-20%</li>
                  <li>优先选择临期清仓区，性价比更高</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full btn-stamp btn-primary flex items-center justify-center gap-2 py-3"
          >
            <Coins className="w-5 h-5" />
            我知道了，继续省钱
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetAlertModal;

import { useState } from 'react';
import { Wallet, Settings, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useBudgetStatus } from '../../store/useStore';
import { formatCurrency, getCurrentMonthKey, getMonthLabel } from '../../utils/calculations';
import BudgetSettingModal from './BudgetSettingModal';
import BudgetAlertModal from './BudgetAlertModal';

interface BudgetOverviewCardProps {
  showSettingsButton?: boolean;
}

const BudgetOverviewCard = ({ showSettingsButton = true }: BudgetOverviewCardProps) => {
  const budgetStatus = useBudgetStatus();
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const noBudget = budgetStatus.limit <= 0;
  const currentMonthLabel = getMonthLabel(getCurrentMonthKey());

  const getProgressColor = () => {
    if (noBudget) return 'from-gray-400 to-gray-500';
    if (budgetStatus.isOverBudget) return 'from-crimson-500 to-crimson-600';
    if (budgetStatus.percentage >= 80) return 'from-amber-500 to-amber-600';
    return 'from-emerald-500 to-emerald-600';
  };

  const getStatusIcon = () => {
    if (noBudget) return <Wallet className="w-6 h-6 text-gray-500" />;
    if (budgetStatus.isOverBudget) return <AlertTriangle className="w-6 h-6 text-crimson-600" />;
    if (budgetStatus.percentage >= 80) return <TrendingUp className="w-6 h-6 text-amber-600" />;
    return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
  };

  const getStatusText = () => {
    if (noBudget) return '未设置预算';
    if (budgetStatus.isOverBudget) return '已超支';
    if (budgetStatus.percentage >= 80) return '接近上限';
    return '预算充足';
  };

  const getStatusTextColor = () => {
    if (noBudget) return 'text-gray-600';
    if (budgetStatus.isOverBudget) return 'text-crimson-700';
    if (budgetStatus.percentage >= 80) return 'text-amber-700';
    return 'text-emerald-700';
  };

  return (
    <>
      <div className="card-paper p-6 relative bg-gradient-to-br from-amber-50 to-parchment-50 border-2 border-amber-300">
        <div className="absolute -top-2 left-4 w-4 h-4 bg-amber-500 rounded-full shadow-md border-2 border-white" />

        {showSettingsButton && (
          <button
            onClick={() => setShowSettingModal(true)}
            className="absolute top-4 right-4 p-2 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
            title="设置预算"
          >
            <Settings className="w-5 h-5 text-amber-700" />
          </button>
        )}

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl border-2 border-amber-300">
                <Wallet className="w-7 h-7 text-amber-700" />
              </div>
              <div>
                <h3 className="font-display text-xl text-amber-900">
                  {currentMonthLabel}预算
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon()}
                  <span className={`text-sm font-display ${getStatusTextColor()}`}>
                    {getStatusText()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {noBudget ? (
            <div className="text-center py-4">
              <p className="text-amber-700 mb-4">还没有设置月度预算</p>
              <button
                onClick={() => setShowSettingModal(true)}
                className="btn-stamp btn-primary inline-flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                立即设置
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-amber-700">已花费</span>
                  <span className="text-sm font-mono text-amber-800">
                    {budgetStatus.percentage}%
                  </span>
                </div>
                <div className="w-full bg-parchment-200 rounded-full h-4 overflow-hidden border-2 border-parchment-300">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${getProgressColor()}`}
                    style={{ width: `${Math.min(budgetStatus.percentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-parchment-100 rounded-lg p-3 text-center border border-amber-200">
                  <p className="text-xs text-amber-600 mb-1">预算上限</p>
                  <p className="font-mono text-lg font-bold text-amber-900">
                    {formatCurrency(budgetStatus.limit)}
                  </p>
                </div>
                <div className="bg-parchment-100 rounded-lg p-3 text-center border border-amber-200">
                  <p className="text-xs text-amber-600 mb-1">已花费</p>
                  <p className={`font-mono text-lg font-bold ${
                    budgetStatus.isOverBudget ? 'text-crimson-700' : 'text-amber-900'
                  }`}>
                    {formatCurrency(budgetStatus.spent)}
                  </p>
                </div>
                <div className="bg-parchment-100 rounded-lg p-3 text-center border border-amber-200">
                  <p className="text-xs text-amber-600 mb-1">
                    {budgetStatus.isOverBudget ? '超支' : '剩余'}
                  </p>
                  <p className={`font-mono text-lg font-bold ${
                    budgetStatus.isOverBudget ? 'text-crimson-700' : 'text-emerald-700'
                  }`}>
                    {budgetStatus.isOverBudget
                      ? `+${formatCurrency(budgetStatus.overAmount)}`
                      : formatCurrency(budgetStatus.remaining)}
                  </p>
                </div>
              </div>

              {budgetStatus.isOverBudget && (
                <button
                  onClick={() => setShowAlertModal(true)}
                  className="mt-4 w-full py-2 bg-crimson-50 hover:bg-crimson-100 text-crimson-700 rounded-lg font-display text-sm border-2 border-crimson-200 transition-colors flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  查看超支品类分布明细
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <BudgetSettingModal
        isOpen={showSettingModal}
        onClose={() => setShowSettingModal(false)}
      />

      <BudgetAlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        budgetStatus={budgetStatus}
      />
    </>
  );
};

export default BudgetOverviewCard;

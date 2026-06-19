import { useState, useEffect } from 'react';
import { X, Coins, Save } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface BudgetSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetBudgets = [
  { value: 200, label: '¥200 轻度' },
  { value: 500, label: '¥500 适中' },
  { value: 1000, label: '¥1000 宽裕' },
  { value: 2000, label: '¥2000 土豪' },
];

const BudgetSettingModal = ({ isOpen, onClose }: BudgetSettingModalProps) => {
  const getMonthlyBudget = useStore((state) => state.getMonthlyBudget);
  const setMonthlyBudget = useStore((state) => state.setMonthlyBudget);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      const current = getMonthlyBudget();
      setInputValue(current > 0 ? String(current) : '');
    }
  }, [isOpen, getMonthlyBudget]);

  if (!isOpen) return null;

  const handleSave = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || value < 0) {
      setMonthlyBudget(0);
    } else {
      setMonthlyBudget(Number(value.toFixed(2)));
    }
    onClose();
  };

  const handlePresetClick = (value: number) => {
    setInputValue(String(value));
  };

  const handleClear = () => {
    setInputValue('');
    setMonthlyBudget(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-parchment-50 rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
        >
          <X className="w-5 h-5 text-amber-800" />
        </button>

        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Coins className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-display text-2xl">设置月度预算</h2>
              <p className="text-white/80 text-sm">设定每月捡漏预算上限</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="label-text">
              <Coins className="inline w-5 h-5 mr-2" />
              每月预算上限 (元)
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="input-field font-mono text-xl mt-2"
              placeholder="请输入预算金额，如：500"
              step="0.01"
              min="0"
            />
            <p className="text-xs text-amber-600 mt-2">
              💡 设定 0 或留空表示不限制预算
            </p>
          </div>

          <div>
            <p className="label-text mb-3">快速选择</p>
            <div className="grid grid-cols-2 gap-3">
              {presetBudgets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className={`p-3 rounded-xl border-2 transition-all font-display ${
                    parseFloat(inputValue) === preset.value
                      ? 'bg-amber-100 border-amber-500 text-amber-900'
                      : 'bg-parchment-100 border-parchment-300 text-amber-700 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClear}
              className="btn-stamp btn-secondary flex-1"
            >
              不限制
            </button>
            <button
              onClick={handleSave}
              className="btn-stamp btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSettingModal;

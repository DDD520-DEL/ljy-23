import { useState } from 'react';
import { Settings, Sun, Moon, Trash2, Info, Shield, AlertTriangle, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useStore } from '../../store/useStore';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const clearAllData = useStore((state) => state.clearAllData);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const appVersion = '1.0.0';

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
    setClearSuccess(true);
    setTimeout(() => setClearSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <Settings className="w-6 h-6 text-amber-600" />
          <h2 className="title-display text-3xl md:text-4xl text-amber-900">
            设置中心
          </h2>
          <Settings className="w-6 h-6 text-amber-600" />
        </div>
        <p className="text-amber-700 font-body text-lg">
          个性化你的寻宝体验
        </p>
      </div>

      <div className="card-paper p-6 relative">
        <div className="tape" style={{ top: '-8px', left: '30px', transform: 'rotate(-3deg)' }} />
        <h3 className="font-display text-xl text-amber-900 mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-600" />
          主题配色
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-amber-800">
              当前主题：<span className="font-semibold">{theme === 'light' ? '浅色模式' : '深色模式'}</span>
            </p>
            <p className="text-sm text-amber-600 mt-1">
              切换应用的显示主题
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="btn-stamp btn-secondary flex items-center gap-2 !px-4 !py-2 !text-base"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-5 h-5" />
                切换深色
              </>
            ) : (
              <>
                <Sun className="w-5 h-5" />
                切换浅色
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card-paper p-6 relative">
        <div className="tape" style={{ top: '-8px', right: '30px', transform: 'rotate(3deg)' }} />
        <h3 className="font-display text-xl text-amber-900 mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-crimson-700" />
          数据管理
        </h3>
        <div className="space-y-4">
          <div>
            <p className="font-body text-amber-800">
              清除本地数据
            </p>
            <p className="text-sm text-amber-600 mt-1">
              一键清除所有本地存储的数据，此操作不可撤销
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn-stamp btn-danger flex items-center gap-2 !px-4 !py-2 !text-base"
            >
              <Trash2 className="w-4 h-4" />
              清除所有数据
            </button>
            {clearSuccess && (
              <span className="flex items-center gap-1 text-forest-700 text-sm">
                <Check className="w-4 h-4" />
                数据已清除
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="card-paper p-6 relative">
        <div className="tape" style={{ top: '-8px', left: '50%', transform: 'translateX(-50%) rotate(1deg)' }} />
        <h3 className="font-display text-xl text-amber-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-amber-600" />
          关于应用
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-amber-700">应用版本</span>
            <span className="font-mono text-amber-900 font-semibold">v{appVersion}</span>
          </div>
          <div className="border-t border-amber-200 my-2" />
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              <span className="text-amber-800">隐私声明</span>
            </div>
            <span className="text-amber-500">→</span>
          </button>
        </div>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-paper p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-crimson-700 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-parchment-100" />
              </div>
              <div>
                <h4 className="font-display text-xl text-amber-900">确认清除数据？</h4>
                <p className="text-sm text-amber-600">此操作不可撤销</p>
              </div>
            </div>
            <p className="text-amber-700 mb-6">
              你确定要清除所有本地数据吗？这将删除所有记录、用户信息和设置。此操作无法撤销，数据丢失后将无法恢复。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-stamp btn-secondary !px-4 !py-2 !text-base"
              >
                取消
              </button>
              <button
                onClick={handleClearData}
                className="btn-stamp btn-danger !px-4 !py-2 !text-base"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-paper p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-parchment-100" />
              </div>
              <h4 className="font-display text-xl text-amber-900">隐私声明</h4>
            </div>
            <div className="space-y-4 text-amber-700 font-body">
              <p>
                <strong className="text-amber-900">1. 数据存储</strong>
              </p>
              <p className="text-sm">
                临期猎人应用将所有数据存储在你的设备本地，我们不会上传或收集你的个人数据到任何服务器。
              </p>
              <p>
                <strong className="text-amber-900">2. 数据安全</strong>
              </p>
              <p className="text-sm">
                你的所有记录和个人信息都保存在本地浏览器存储中，只有你本人可以访问这些数据。
              </p>
              <p>
                <strong className="text-amber-900">3. 云同步</strong>
              </p>
              <p className="text-sm">
                如启用云同步功能，数据将加密存储在云端服务器，仅用于多设备间的数据同步。
              </p>
              <p>
                <strong className="text-amber-900">4. 数据删除</strong>
              </p>
              <p className="text-sm">
                你可以随时通过"清除本地数据"功能删除所有存储的数据，删除后数据将无法恢复。
              </p>
              <p>
                <strong className="text-amber-900">5. 联系方式</strong>
              </p>
              <p className="text-sm">
                如有任何隐私相关问题，请通过应用内反馈渠道联系我们。
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="btn-stamp btn-primary !px-4 !py-2 !text-base"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

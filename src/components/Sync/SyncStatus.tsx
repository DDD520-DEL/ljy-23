import { useState } from 'react';
import { RefreshCw, Cloud, CloudOff, AlertCircle, CheckCircle2, Download, Upload, GitMerge, ChevronDown, ChevronUp, RotateCw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { SyncPhase } from '../../types';

const formatSyncTime = (isoString: string | null): string => {
  if (!isoString) return '从未同步';
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (diff < 60000) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const phaseConfig: Record<SyncPhase, { icon: typeof Cloud; label: string; color: string; animate?: boolean }> = {
  idle: { icon: Cloud, label: '', color: 'text-amber-600' },
  downloading: { icon: Download, label: '正在从云端拉取数据…', color: 'text-amber-700', animate: true },
  merging: { icon: GitMerge, label: '正在合并本地与云端数据…', color: 'text-amber-700', animate: true },
  uploading: { icon: Upload, label: '正在上传数据到云端…', color: 'text-amber-700', animate: true },
  success: { icon: CheckCircle2, label: '同步完成', color: 'text-green-600' },
  error: { icon: AlertCircle, label: '同步失败', color: 'text-red-600' },
};

const SyncStatus = () => {
  const syncPhase = useStore((state) => state.syncPhase);
  const lastSyncTime = useStore((state) => state.lastSyncTime);
  const syncError = useStore((state) => state.syncError);
  const syncAll = useStore((state) => state.syncAll);
  const currentUser = useStore((state) => state.currentUser);
  const [showError, setShowError] = useState(false);

  if (!currentUser) return null;

  const isSyncing = ['downloading', 'merging', 'uploading'].includes(syncPhase);
  const config = phaseConfig[syncPhase];

  const handleRetry = () => {
    setShowError(false);
    syncAll();
  };

  const getDisplayText = () => {
    if (isSyncing) return config.label;
    if (syncPhase === 'success') return config.label;
    if (syncPhase === 'error') return config.label;
    return formatSyncTime(lastSyncTime);
  };

  const getIcon = () => {
    if (syncPhase === 'idle' && !lastSyncTime) {
      return <CloudOff className="w-4 h-4 text-amber-400" />;
    }
    const IconComponent = config.icon;
    return <IconComponent className={`w-4 h-4 ${config.color} ${config.animate ? 'animate-pulse' : ''}`} />;
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border-2 border-amber-300">
        {getIcon()}

        <span className={`text-xs font-body ${config.color} max-w-[140px] truncate`}>
          {getDisplayText()}
        </span>

        {syncPhase === 'error' && (
          <button
            onClick={() => setShowError(!showError)}
            className="p-0.5 rounded hover:bg-amber-200 transition-colors"
            title="查看详情"
          >
            {showError
              ? <ChevronUp className="w-3.5 h-3.5 text-red-500" />
              : <ChevronDown className="w-3.5 h-3.5 text-red-500" />
            }
          </button>
        )}

        <button
          onClick={handleRetry}
          disabled={isSyncing}
          className="p-1 rounded hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={isSyncing ? '同步中' : '立即同步'}
        >
          <RefreshCw className={`w-4 h-4 text-amber-700 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {syncPhase === 'error' && showError && syncError && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg border-2 border-red-300 shadow-lg z-50 p-3">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 font-body leading-relaxed">
              {syncError}
            </p>
          </div>
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-300 rounded-md text-xs text-red-700 font-body transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            重新同步
          </button>
        </div>
      )}
    </div>
  );
};

export default SyncStatus;

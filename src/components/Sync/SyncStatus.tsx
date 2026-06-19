import { RefreshCw, Cloud, CloudOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

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

const SyncStatus = () => {
  const syncStatus = useStore((state) => state.syncStatus);
  const lastSyncTime = useStore((state) => state.lastSyncTime);
  const syncError = useStore((state) => state.syncError);
  const syncAll = useStore((state) => state.syncAll);
  const currentUser = useStore((state) => state.currentUser);

  if (!currentUser) return null;

  const handleRefresh = () => {
    if (syncStatus !== 'syncing') {
      syncAll();
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return lastSyncTime ? <Cloud className="w-4 h-4 text-amber-600" /> : <CloudOff className="w-4 h-4 text-amber-400" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return '同步中...';
      case 'success':
        return '同步成功';
      case 'error':
        return syncError || '同步失败';
      default:
        return formatSyncTime(lastSyncTime);
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-amber-700';
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-amber-700';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border-2 border-amber-300">
      <div className="flex items-center gap-1.5">
        {getStatusIcon()}
        <span className={`text-xs font-body ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      <button
        onClick={handleRefresh}
        disabled={syncStatus === 'syncing'}
        className="p-1 rounded hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title={syncStatus === 'syncing' ? '同步中' : '立即同步'}
      >
        <RefreshCw className={`w-4 h-4 text-amber-700 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default SyncStatus;

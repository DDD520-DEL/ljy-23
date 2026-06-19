import { useMemo } from 'react';
import { Bell, AlertTriangle, CloudUpload, Trophy, Wallet, Settings as SettingsIcon, CheckCheck, Trash2, Inbox } from 'lucide-react';
import { useStore, useUserNotifications } from '../../store/useStore';
import { formatDate } from '../../utils/calculations';
import type { NotificationType } from '../../types';

const notificationConfig: Record<NotificationType, {
  icon: typeof Bell;
  label: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}> = {
  expiry: {
    icon: AlertTriangle,
    label: '临期提醒',
    bgColor: 'bg-red-50 dark:bg-red-900/30',
    iconColor: 'text-crimson-700 dark:text-red-300',
    borderColor: 'border-crimson-700 dark:border-red-500',
  },
  backup: {
    icon: CloudUpload,
    label: '数据备份',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-map-600 dark:text-blue-300',
    borderColor: 'border-map-600 dark:border-blue-500',
  },
  achievement: {
    icon: Trophy,
    label: '成就徽章',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-700 dark:border-amber-500',
  },
  budget: {
    icon: Wallet,
    label: '预算提醒',
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    iconColor: 'text-forest-700 dark:text-green-300',
    borderColor: 'border-forest-700 dark:border-green-500',
  },
  system: {
    icon: SettingsIcon,
    label: '系统消息',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    iconColor: 'text-amber-800 dark:text-amber-300',
    borderColor: 'border-amber-800 dark:border-amber-500',
  },
};

const NotificationsPage = () => {
  const notifications = useUserNotifications();
  const markNotificationRead = useStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useStore((state) => state.markAllNotificationsRead);
  const deleteNotification = useStore((state) => state.deleteNotification);
  const clearAllNotifications = useStore((state) => state.clearAllNotifications);

  const { unreadCount, totalCount } = useMemo(() => {
    return {
      unreadCount: notifications.filter(n => !n.read).length,
      totalCount: notifications.length,
    };
  }, [notifications]);

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
  };

  const handleNotificationClick = (id: string, read: boolean) => {
    if (!read) {
      markNotificationRead(id);
    }
  };

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, typeof notifications> = {};
    notifications.forEach((notification) => {
      const date = new Date(notification.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = '今天';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = '昨天';
      } else {
        key = formatDate(notification.createdAt);
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(notification);
    });
    return groups;
  }, [notifications]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center shadow-stamp border-2 border-amber-900">
              <Bell className="w-6 h-6 text-parchment-100" />
            </div>
            <div>
              <h2 className="title-display text-3xl md:text-4xl text-amber-900 dark:text-amber-200">
                消息中心
              </h2>
              <p className="text-amber-700 dark:text-amber-400 font-body">
                {unreadCount > 0
                  ? `您有 ${unreadCount} 条未读消息`
                  : '所有消息都已阅读'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn-stamp btn-secondary flex items-center gap-2 !px-4 !py-2 !text-base"
            >
              <CheckCheck className="w-4 h-4" />
              <span>全部标为已读</span>
            </button>
          )}
          {totalCount > 0 && (
            <button
              onClick={clearAllNotifications}
              className="btn-stamp btn-danger flex items-center gap-2 !px-4 !py-2 !text-base"
            >
              <Trash2 className="w-4 h-4" />
              <span>清空全部</span>
            </button>
          )}
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="card-paper p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
            <Inbox className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="font-display text-2xl text-amber-900 dark:text-amber-200 mb-2">
            暂无消息
          </h3>
          <p className="text-amber-700 dark:text-amber-400">
            您的所有系统通知将显示在这里
          </p>
          <div className="mt-6 inline-flex flex-wrap justify-center gap-2 text-sm">
            <span className="badge-stamp stamp-amber">⏰ 临期提醒</span>
            <span className="badge-stamp stamp-blue">☁️ 数据备份</span>
            <span className="badge-stamp stamp-green">🏆 成就解锁</span>
            <span className="badge-stamp stamp-red">💰 预算提醒</span>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedNotifications).map(([dateGroup, groupItems]) => (
            <div key={dateGroup}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-amber-300 dark:bg-amber-700" />
                <span className="px-4 py-1 bg-amber-100 dark:bg-amber-900/50 rounded-full font-display text-amber-800 dark:text-amber-300 text-sm">
                  {dateGroup}
                </span>
                <div className="h-px flex-1 bg-amber-300 dark:bg-amber-700" />
              </div>

              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-amber-300 dark:bg-amber-700" />

                <div className="space-y-4">
                  {groupItems.map((notification) => {
                    const config = notificationConfig[notification.type];
                    const IconComponent = config.icon;
                    return (
                      <div
                        key={notification.id}
                        className={`relative pl-16 pr-4 cursor-pointer group ${
                          !notification.read ? 'opacity-100' : 'opacity-75'
                        }`}
                        onClick={() => handleNotificationClick(notification.id, notification.read)}
                      >
                        <div
                          className={`absolute left-0 top-2 w-12 h-12 rounded-full flex items-center justify-center border-3 ${config.bgColor} ${config.borderColor} border-2 z-10 transition-transform group-hover:scale-110`}
                        >
                          <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
                          {!notification.read && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-crimson-700 rounded-full border-2 border-parchment-50 dark:border-amber-950" />
                          )}
                        </div>

                        <div
                          className={`card-paper p-4 transition-all duration-300 ${
                            !notification.read
                              ? 'ring-2 ring-amber-400 dark:ring-amber-600'
                              : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-display text-lg text-amber-900 dark:text-amber-200">
                                  {notification.title}
                                </h4>
                                <span
                                  className={`badge-stamp ${config.bgColor} ${config.iconColor} ${config.borderColor} !text-xs !py-0.5`}
                                >
                                  {config.label}
                                </span>
                              </div>
                              <p className="text-amber-700 dark:text-amber-400 font-body text-sm leading-relaxed">
                                {notification.content}
                              </p>
                              <p className="text-amber-500 dark:text-amber-500 font-mono text-xs mt-2">
                                {new Date(notification.createdAt).toLocaleTimeString('zh-CN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-2 rounded-lg text-amber-500 hover:text-crimson-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors opacity-0 group-hover:opacity-100"
                              title="删除消息"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

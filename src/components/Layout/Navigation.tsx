import { NavLink, useNavigate } from 'react-router-dom';
import { ScrollText, BarChart3, Map, ListTodo, ShoppingCart, Compass, LogIn, LogOut, User, Settings, CalendarDays, BookOpen, Navigation as NavigationIcon, Medal, Bell, Archive } from 'lucide-react';
import { useStore, useUnreadNotificationCount, useUserDeletedRecords } from '../../store/useStore';
import SyncStatus from '../Sync/SyncStatus';

const Navigation = () => {
  const currentUser = useStore((state) => state.currentUser);
  const logout = useStore((state) => state.logout);
  const navigate = useNavigate();
  const unreadCount = useUnreadNotificationCount();
  const deletedRecords = useUserDeletedRecords();
  const deletedCount = deletedRecords.length;

  const navItems = [
    { path: '/', label: '记录中心', icon: ScrollText },
    { path: '/shopping-list', label: '购物清单', icon: ShoppingCart },
    { path: '/stats', label: '战绩统计', icon: BarChart3 },
    { path: '/badges', label: '成就徽章', icon: Medal },
    { path: '/map', label: '捡漏地图', icon: Map },
    { path: '/nearby-deals', label: '附近折扣', icon: NavigationIcon },
    { path: '/list', label: '记录列表', icon: ListTodo },
    { path: '/calendar', label: '捡漏日历', icon: CalendarDays },
    { path: '/tips-guide', label: '捡漏技巧', icon: BookOpen },
    { path: '/notifications', label: '消息中心', icon: Bell, badge: unreadCount },
    { path: '/recycle-bin', label: '回收站', icon: Archive, badge: deletedCount },
  ];

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="bg-parchment-100 border-b-4 border-amber-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center shadow-stamp border-2 border-amber-900">
              <Compass className="w-7 h-7 text-parchment-100" />
            </div>
            <div>
              <h1 className="title-display text-2xl md:text-3xl leading-tight">
                临期猎人
              </h1>
              <p className="text-xs text-amber-600 font-body italic">
                寻宝日志
              </p>
            </div>
          </div>

          {currentUser && (
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link flex items-center gap-2 relative ${isActive ? 'active' : ''}`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-crimson-700 text-parchment-100 text-xs font-bold rounded-full flex items-center justify-center border-2 border-parchment-100 dark:border-amber-950">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <SyncStatus />
                <button
                  onClick={() => navigate('/notifications')}
                  className="relative p-2 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors"
                  title="消息中心"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-crimson-700 text-parchment-100 text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-parchment-100 dark:border-amber-950">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="p-2 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors"
                  title="设置"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border-2 border-amber-300">
                  <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-parchment-100" />
                  </div>
                  <span className="font-display text-amber-800 text-sm">
                    {currentUser.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-stamp btn-danger flex items-center gap-2 !px-4 !py-2 !text-base"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">退出</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/settings')}
                  className="p-2 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors"
                  title="设置"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="btn-stamp btn-primary flex items-center gap-2 !px-4 !py-2 !text-base"
                >
                  <LogIn className="w-4 h-4" />
                  <span>登录/注册</span>
                </button>
              </>
            )}
          </div>
        </div>

        {currentUser && (
          <div className="md:hidden flex items-center justify-center gap-1 pb-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `p-2 rounded-lg transition-all relative ${
                    isActive
                      ? 'bg-amber-600 text-parchment-100'
                      : 'text-amber-800 hover:bg-amber-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-crimson-700 text-parchment-100 text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-parchment-100 dark:border-amber-950">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

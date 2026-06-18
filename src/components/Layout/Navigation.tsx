import { NavLink } from 'react-router-dom';
import { ScrollText, BarChart3, Map, ListTodo, Compass } from 'lucide-react';

const Navigation = () => {
  const navItems = [
    { path: '/', label: '记录中心', icon: ScrollText },
    { path: '/stats', label: '战绩统计', icon: BarChart3 },
    { path: '/map', label: '捡漏地图', icon: Map },
    { path: '/list', label: '记录列表', icon: ListTodo },
  ];

  return (
    <nav className="bg-parchment-100 border-b-4 border-amber-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
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

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="md:hidden flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `p-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-amber-600 text-parchment-100'
                      : 'text-amber-800 hover:bg-amber-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

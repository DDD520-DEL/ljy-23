import { useNavigate } from 'react-router-dom';
import { usePublicStats } from '../../store/useStore';
import { Compass, ScrollText, Coins, Users, LogIn, UserPlus, Sparkles, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';

const PublicDashboard = () => {
  const stats = usePublicStats();
  const navigate = useNavigate();

  const [displayRecords, setDisplayRecords] = useState(0);
  const [displaySavings, setDisplaySavings] = useState(0);
  const [displayUsers, setDisplayUsers] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const incrementRecords = stats.totalRecords / steps;
    const incrementSavings = stats.totalSavings / steps;
    const incrementUsers = stats.totalUsers / steps;
    let currentRecords = 0;
    let currentSavings = 0;
    let currentUsers = 0;

    const timer = setInterval(() => {
      currentRecords += incrementRecords;
      currentSavings += incrementSavings;
      currentUsers += incrementUsers;

      if (currentRecords >= stats.totalRecords) {
        setDisplayRecords(stats.totalRecords);
        setDisplaySavings(stats.totalSavings);
        setDisplayUsers(stats.totalUsers);
        clearInterval(timer);
      } else {
        setDisplayRecords(Math.floor(currentRecords));
        setDisplaySavings(currentSavings);
        setDisplayUsers(Math.floor(currentUsers));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [stats.totalRecords, stats.totalSavings, stats.totalUsers]);

  const features = [
    {
      icon: ScrollText,
      title: '记录每一次捡漏',
      desc: '详细记录超市、商品、价格、折扣等信息',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
    },
    {
      icon: Trophy,
      title: '战绩统计分析',
      desc: '查看总节省、平均折扣、超市排行等数据',
      color: 'text-forest-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
    },
    {
      icon: Compass,
      title: '捡漏地图',
      desc: '可视化你的省钱版图，发现宝藏超市',
      color: 'text-map-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
    },
  ];

  return (
    <div className="space-y-12">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-20 h-20 bg-amber-700 rounded-full flex items-center justify-center shadow-stamp border-4 border-amber-900">
            <Compass className="w-12 h-12 text-parchment-100" />
          </div>
        </div>
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-amber-600" />
          <h1 className="title-display text-4xl md:text-5xl">
            临期猎人 · 寻宝日志
          </h1>
          <Sparkles className="w-6 h-6 text-amber-600" />
        </div>
        <p className="text-amber-700 text-xl font-body max-w-2xl mx-auto">
          专淘临期食品的省钱记录工具，每一次捡漏都是一次探险
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-paper p-8 text-center relative overflow-hidden">
          <div className="tape" style={{ top: '-8px', left: '20px', transform: 'rotate(-5deg)' }} />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-400">
              <ScrollText className="w-8 h-8 text-amber-700" />
            </div>
            <p className="text-sm text-amber-600 font-display mb-2">全局捡漏次数</p>
            <p className="font-mono text-5xl font-bold text-amber-900 number-pop">
              {displayRecords}
            </p>
            <p className="text-sm text-amber-500 mt-2">次</p>
          </div>
        </div>

        <div className="card-paper p-8 text-center relative overflow-hidden">
          <div className="tape" style={{ top: '-8px', left: '50%', transform: 'translateX(-50%) rotate(2deg)' }} />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-400">
              <Coins className="w-8 h-8 text-forest-700" />
            </div>
            <p className="text-sm text-amber-600 font-display mb-2">全局节省总额</p>
            <p className="font-mono text-5xl font-bold text-forest-700 number-pop">
              ¥{displaySavings.toFixed(0)}
            </p>
            <p className="text-sm text-amber-500 mt-2">元</p>
          </div>
        </div>

        <div className="card-paper p-8 text-center relative overflow-hidden">
          <div className="tape" style={{ top: '-8px', right: '20px', transform: 'rotate(5deg)' }} />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-400">
              <Users className="w-8 h-8 text-map-600" />
            </div>
            <p className="text-sm text-amber-600 font-display mb-2">注册猎人数量</p>
            <p className="font-mono text-5xl font-bold text-map-600 number-pop">
              {displayUsers}
            </p>
            <p className="text-sm text-amber-500 mt-2">位</p>
          </div>
        </div>
      </div>

      <div className="card-paper p-8 relative overflow-hidden">
        <div className="tape" style={{ top: '-8px', left: '50%', transform: 'translateX(-50%) rotate(-3deg)' }} />
        <div className="relative z-10">
          <h2 className="title-display text-2xl md:text-3xl text-center mb-8">
            🎯 核心功能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${feature.bgColor} rounded-xl p-6 border-2 ${feature.borderColor} transition-all hover:scale-105 hover:shadow-lg`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${feature.bgColor} border-2 ${feature.borderColor}`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-display text-xl text-amber-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-amber-700 text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-paper p-8 text-center relative overflow-hidden">
        <div className="tape" style={{ top: '-8px', right: '30px', transform: 'rotate(4deg)' }} />
        <div className="relative z-10">
          <h2 className="title-display text-2xl md:text-3xl mb-4">
            🚀 立即开始你的省钱之旅
          </h2>
          <p className="text-amber-700 mb-8 max-w-xl mx-auto">
            注册账号，记录每一次捡漏，积累你的省钱战绩，
            成为真正的临期猎人！
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/auth')}
              className="btn-stamp btn-primary flex items-center justify-center gap-2 px-8"
            >
              <UserPlus className="w-5 h-5" />
              立即注册
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="btn-stamp btn-secondary flex items-center justify-center gap-2 px-8"
            >
              <LogIn className="w-5 h-5" />
              登录账号
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;

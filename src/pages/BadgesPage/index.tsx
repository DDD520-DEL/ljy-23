import { useMemo } from 'react';
import { useAchievements, useUserStats } from '../../store/useStore';
import { Trophy, Lock, Award, Star, TrendingUp } from 'lucide-react';
import { formatDate } from '../../utils/calculations';

const BadgesPage = () => {
  const achievements = useAchievements();
  const stats = useUserStats();

  const { unlockedCount, totalCount } = useMemo(() => {
    const unlocked = achievements.filter(a => a.isUnlocked).length;
    return {
      unlockedCount: unlocked,
      totalCount: achievements.length,
    };
  }, [achievements]);

  const sortedAchievements = useMemo(() => {
    return [...achievements].sort((a, b) => {
      if (a.isUnlocked && !b.isUnlocked) return -1;
      if (!a.isUnlocked && b.isUnlocked) return 1;
      return b.progress.percentage - a.progress.percentage;
    });
  }, [achievements]);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-amber-600" />
            <h2 className="title-display text-3xl md:text-4xl text-amber-900">
              成就徽章
            </h2>
            <Trophy className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <p className="text-amber-700 font-body text-lg mb-4">
          记录你的捡漏旅程，解锁专属徽章
        </p>
        <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border-2 border-amber-300">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span className="font-display text-amber-900">
              已解锁 <span className="text-2xl font-bold text-amber-700">{unlockedCount}</span> / {totalCount}
            </span>
          </div>
          <div className="w-px h-8 bg-amber-300" />
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-forest-600" />
            <span className="font-body text-amber-800">
              完成度 <span className="font-bold">{Math.round((unlockedCount / totalCount) * 100)}%</span>
            </span>
          </div>
        </div>
      </div>

      {stats.totalRecords > 0 && (
        <div className="card-paper p-6 mb-8">
          <h3 className="font-display text-xl text-amber-900 mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-600" />
            当前数据
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="font-mono text-3xl font-bold text-amber-700">{stats.totalRecords}</p>
              <p className="text-sm text-amber-600">总捡漏次数</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="font-mono text-3xl font-bold text-forest-700">¥{stats.totalSavings.toFixed(0)}</p>
              <p className="text-sm text-forest-600">累计节省</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="font-mono text-3xl font-bold text-crimson-700">{stats.averageDiscount}折</p>
              <p className="text-sm text-crimson-600">平均折扣</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="font-mono text-3xl font-bold text-map-700">{stats.bySupermarket.length}</p>
              <p className="text-sm text-map-600">超市数量</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`card-paper p-6 transition-all duration-300 ${
              achievement.isUnlocked
                ? 'hover:scale-105 cursor-default'
                : 'opacity-75 grayscale'
            }`}
          >
            <div className="relative">
              <div
                className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl shadow-lg border-4 ${
                  achievement.isUnlocked
                    ? 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-400'
                    : 'bg-gray-100 border-gray-300'
                }`}
                style={achievement.isUnlocked ? { boxShadow: `0 0 20px ${achievement.color}40` } : {}}
              >
                {achievement.isUnlocked ? (
                  <span className="text-4xl">{achievement.icon}</span>
                ) : (
                  <Lock className="w-8 h-8 text-gray-400" />
                )}
              </div>
              {achievement.isUnlocked && (
                <div
                  className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: achievement.color }}
                >
                  ✓
                </div>
              )}
            </div>

            <h3
              className={`font-display text-xl text-center mb-2 ${
                achievement.isUnlocked ? 'text-amber-900' : 'text-gray-500'
              }`}
            >
              {achievement.name}
            </h3>

            <p
              className={`text-sm text-center mb-4 ${
                achievement.isUnlocked ? 'text-amber-700' : 'text-gray-400'
              }`}
            >
              {achievement.description}
            </p>

            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className={achievement.isUnlocked ? 'text-amber-600' : 'text-gray-400'}>
                  {achievement.isUnlocked ? '已达成' : '达成条件'}
                </span>
                <span className={achievement.isUnlocked ? 'text-amber-600' : 'text-gray-400'}>
                  {achievement.progress.current} / {achievement.progress.total}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${achievement.progress.percentage}%`,
                    backgroundColor: achievement.isUnlocked ? achievement.color : '#9ca3af',
                  }}
                />
              </div>
            </div>

            <div
              className={`text-center text-xs py-2 px-3 rounded-lg ${
                achievement.isUnlocked
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-gray-50 text-gray-500'
              }`}
            >
              {achievement.isUnlocked && achievement.unlockedAt ? (
                <span>🎊 {formatDate(achievement.unlockedAt)} 解锁</span>
              ) : (
                <span>📋 {achievement.requirement}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {stats.totalRecords === 0 && (
        <div className="card-paper p-12 text-center mt-8">
          <div className="text-6xl mb-4">🏅</div>
          <h3 className="font-display text-2xl text-amber-900 mb-2">暂无成就</h3>
          <p className="text-amber-700 mb-4">
            开始记录你的捡漏经历，解锁专属成就徽章！
          </p>
          <div className="inline-flex flex-wrap justify-center gap-2 text-sm text-amber-600">
            <span className="px-3 py-1 bg-amber-50 rounded-full">🌱 初出茅庐</span>
            <span className="px-3 py-1 bg-amber-50 rounded-full">💰 省钱百元户</span>
            <span className="px-3 py-1 bg-amber-50 rounded-full">🎯 三折狙击手</span>
            <span className="px-3 py-1 bg-amber-50 rounded-full">👑 千元大亨</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgesPage;

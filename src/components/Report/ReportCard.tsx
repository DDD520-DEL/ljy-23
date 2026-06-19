import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Trophy, Coins, Percent, ShoppingBag } from 'lucide-react';
import type { StatsData } from '../../types';
import { getMonthLabel } from '../../utils/calculations';

export type ReportDimension = 'all' | { type: 'month'; value: string } | { type: 'supermarket'; value: string };

interface ReportCardProps {
  stats: StatsData;
  dimension: ReportDimension;
  username: string;
}

const ReportCard = ({ stats, dimension, username }: ReportCardProps) => {
  const dimensionTitle = useMemo(() => {
    if (dimension === 'all') return '全部战绩';
    if (dimension.type === 'month') return `${getMonthLabel(dimension.value)} 月度战报`;
    return `${dimension.value} 超市战报`;
  }, [dimension]);

  const dimensionSubtitle = useMemo(() => {
    if (dimension === 'all') return `累计 ${stats.totalRecords} 次捡漏`;
    if (dimension.type === 'month') return `本月捡漏 ${stats.totalRecords} 次`;
    return `累计捡漏 ${stats.totalRecords} 次`;
  }, [dimension, stats.totalRecords]);

  const barColors = ['#D97706', '#B45309', '#92400E', '#78350F', '#A16207', '#854D0E'];

  const topSupermarkets = stats.bySupermarket.slice(0, 5);
  const topCategories = stats.byCategory.slice(0, 6);

  const avgSavingPerRecord = stats.totalRecords > 0 ? (stats.totalSavings / stats.totalRecords).toFixed(2) : '0';

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const renderCustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[10px] text-amber-800 font-body">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      id="report-card"
      className="w-[600px] bg-gradient-to-br from-parchment-50 to-amber-100 rounded-2xl border-4 border-amber-700 overflow-hidden shadow-2xl relative"
      style={{ fontFamily: "'Lora', serif" }}
    >
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700" />

      <div className="p-6 relative">
        <div className="text-center mb-6 relative">
          <div className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-amber-700" />
              <h1 className="font-display text-3xl text-amber-900 tracking-wide">
                捡漏战报
              </h1>
              <Trophy className="w-8 h-8 text-amber-700" />
            </div>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
          </div>
          <h2 className="font-display text-2xl text-amber-800 mt-3 mb-1">
            {dimensionTitle}
          </h2>
          <p className="text-amber-600 font-body text-sm">
            {dimensionSubtitle} · 生成于 {today}
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-amber-200 rounded-full border border-amber-400">
            <span className="text-amber-900 font-mono text-xs">👤 {username}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white/60 rounded-xl p-3 text-center border-2 border-amber-300 shadow-sm">
            <div className="flex justify-center mb-1">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
            </div>
            <p className="font-mono text-2xl font-bold text-amber-900 number-pop">
              {stats.totalRecords}
            </p>
            <p className="text-[11px] text-amber-700 font-body">捡漏次数</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3 text-center border-2 border-green-300 shadow-sm">
            <div className="flex justify-center mb-1">
              <Coins className="w-5 h-5 text-forest-700" />
            </div>
            <p className="font-mono text-2xl font-bold text-forest-700 number-pop">
              ¥{stats.totalSavings.toFixed(0)}
            </p>
            <p className="text-[11px] text-forest-700 font-body">累计节省</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3 text-center border-2 border-red-300 shadow-sm">
            <div className="flex justify-center mb-1">
              <Percent className="w-5 h-5 text-crimson-700" />
            </div>
            <p className="font-mono text-2xl font-bold text-crimson-700 number-pop">
              {stats.averageDiscount}
            </p>
            <p className="text-[11px] text-crimson-700 font-body">平均折扣</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3 text-center border-2 border-blue-300 shadow-sm">
            <div className="flex justify-center mb-1">
              <Coins className="w-5 h-5 text-map-600" />
            </div>
            <p className="font-mono text-2xl font-bold text-map-600 number-pop">
              ¥{avgSavingPerRecord}
            </p>
            <p className="text-[11px] text-map-600 font-body">单次省</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {topSupermarkets.length > 0 && (
            <div className="bg-white/50 rounded-xl p-4 border-2 border-amber-300">
              <h3 className="font-display text-sm text-amber-900 mb-3 text-center border-b border-amber-200 pb-2">
                🏪 超市TOP5
              </h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSupermarkets} layout="vertical" margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D97706" opacity={0.15} />
                    <XAxis type="number" tick={{ fontSize: 9, fill: '#78350F', fontFamily: 'JetBrains Mono' }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={55}
                      tick={{ fontSize: 10, fill: '#78350F', fontFamily: 'Lora' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {topSupermarkets.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {topCategories.length > 0 && (
            <div className="bg-white/50 rounded-xl p-4 border-2 border-amber-300">
              <h3 className="font-display text-sm text-amber-900 mb-3 text-center border-b border-amber-200 pb-2">
                📦 品类分布
              </h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topCategories}
                      cx="50%"
                      cy="45%"
                      outerRadius={55}
                      innerRadius={22}
                      dataKey="count"
                      paddingAngle={2}
                    >
                      {topCategories.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="#FFFBEB"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Legend content={renderCustomLegend} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {stats.bySupermarket.length > 0 && (
          <div className="bg-white/50 rounded-xl p-4 border-2 border-amber-300 mb-6">
            <h3 className="font-display text-sm text-amber-900 mb-3 text-center border-b border-amber-200 pb-2">
              🏆 超市排行榜
            </h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-amber-300">
                  <th className="py-1.5 px-2 text-left font-display text-amber-800">排名</th>
                  <th className="py-1.5 px-2 text-left font-display text-amber-800">超市</th>
                  <th className="py-1.5 px-2 text-center font-display text-amber-800">次数</th>
                  <th className="py-1.5 px-2 text-center font-display text-amber-800">节省</th>
                  <th className="py-1.5 px-2 text-center font-display text-amber-800">折扣</th>
                </tr>
              </thead>
              <tbody>
                {stats.bySupermarket.slice(0, 5).map((item, index) => (
                  <tr key={item.name} className="border-b border-amber-100 last:border-0">
                    <td className="py-2 px-2">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-mono font-bold text-[10px] ${
                          index === 0
                            ? 'bg-amber-500 text-white'
                            : index === 1
                            ? 'bg-gray-400 text-white'
                            : index === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-amber-200 text-amber-800'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-display text-amber-900 text-[11px]">{item.name}</td>
                    <td className="py-2 px-2 text-center font-mono text-amber-800 text-[11px]">{item.count}</td>
                    <td className="py-2 px-2 text-center font-mono text-forest-700 font-bold text-[11px]">
                      ¥{item.totalSavings.toFixed(0)}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-crimson-700 font-bold text-[11px]">
                      {item.averageDiscount}折
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {stats.byCategory.length > 0 && (
          <div className="bg-white/50 rounded-xl p-4 border-2 border-amber-300 mb-6">
            <h3 className="font-display text-sm text-amber-900 mb-3 text-center border-b border-amber-200 pb-2">
              🎯 省钱达人
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {stats.byCategory.slice(0, 6).map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg p-2 border"
                  style={{
                    backgroundColor: `${item.color}15`,
                    borderColor: `${item.color}50`,
                  }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-display text-amber-900 text-[11px] truncate">{item.name}</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-amber-800">
                    省¥{item.totalSavings.toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-4 border-t-2 border-dashed border-amber-400">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 rounded-lg">
            <span className="font-display text-parchment-50 text-xs tracking-widest">
              临期猎人 · 捡漏日志
            </span>
          </div>
          <p className="text-amber-600 font-body text-[10px] mt-2">
            专淘临期食品 · 每一次捡漏都是对钱包的温柔
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700" />
    </div>
  );
};

export default ReportCard;

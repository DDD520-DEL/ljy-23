import { useStore } from '../../store/useStore';
import StatsCard from '../../components/Card/StatsCard';
import SupermarketChart from '../../components/Chart/SupermarketChart';
import CategoryPieChart from '../../components/Chart/CategoryPieChart';
import TrendChart from '../../components/Chart/TrendChart';
import { ScrollText, Coins, Percent, Calendar, Trophy } from 'lucide-react';

const StatsPage = () => {
  const { getStats } = useStore();
  const stats = getStats();

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <Trophy className="w-8 h-8 text-amber-600" />
          <h2 className="title-display text-3xl md:text-4xl text-amber-900">
            战绩统计
          </h2>
          <Trophy className="w-8 h-8 text-amber-600" />
        </div>
        <p className="text-amber-700 font-body text-lg">
          查看你的捡漏战绩，发现省钱规律
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="总捡漏次数"
          value={stats.totalRecords}
          icon={<ScrollText className="w-7 h-7" />}
          color="amber"
          subtitle="次"
        />
        <StatsCard
          title="累计节省金额"
          value={stats.totalSavings.toFixed(2)}
          icon={<Coins className="w-7 h-7" />}
          color="green"
          subtitle="元"
        />
        <StatsCard
          title="平均折扣"
          value={stats.averageDiscount}
          icon={<Percent className="w-7 h-7" />}
          color="red"
          subtitle="折"
        />
        <StatsCard
          title="平均每次节省"
          value={stats.totalRecords > 0 ? (stats.totalSavings / stats.totalRecords).toFixed(2) : '0'}
          icon={<Calendar className="w-7 h-7" />}
          color="blue"
          subtitle="元/次"
        />
      </div>

      {stats.bySupermarket.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SupermarketChart data={stats.bySupermarket.slice(0, 8)} />
          <CategoryPieChart data={stats.byCategory} />
        </div>
      )}

      {stats.byMonth.length > 0 && (
        <div className="mb-8">
          <TrendChart data={stats.byMonth} />
        </div>
      )}

      {stats.bySupermarket.length > 0 && (
        <div className="card-paper p-6">
          <h3 className="font-display text-2xl text-amber-900 mb-6 flex items-center gap-2">
            🏆 超市排行榜
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-amber-300">
                  <th className="text-left py-3 px-4 font-display text-amber-800">排名</th>
                  <th className="text-left py-3 px-4 font-display text-amber-800">超市</th>
                  <th className="text-center py-3 px-4 font-display text-amber-800">捡漏次数</th>
                  <th className="text-center py-3 px-4 font-display text-amber-800">累计节省</th>
                  <th className="text-center py-3 px-4 font-display text-amber-800">平均折扣</th>
                </tr>
              </thead>
              <tbody>
                {stats.bySupermarket.map((item, index) => (
                  <tr 
                    key={item.name} 
                    className="border-b border-amber-200 hover:bg-amber-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-mono font-bold ${
                        index === 0 ? 'bg-amber-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-parchment-200 text-amber-800'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-display text-amber-900">{item.name}</td>
                    <td className="py-3 px-4 text-center font-mono text-amber-800">{item.count} 次</td>
                    <td className="py-3 px-4 text-center font-mono text-forest-700 font-bold">
                      ¥{item.totalSavings.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-crimson-700 font-bold">
                      {item.averageDiscount} 折
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats.byCategory.length > 0 && (
        <div className="card-paper p-6">
          <h3 className="font-display text-2xl text-amber-900 mb-6 flex items-center gap-2">
            📦 品类分析详情
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.byCategory.map((item) => (
              <div 
                key={item.name}
                className="bg-parchment-50 rounded-xl p-4 border-2 transition-all hover:scale-105"
                style={{ borderColor: item.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-amber-900">{item.name}</span>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
                <p className="font-mono text-2xl font-bold text-amber-800">
                  {item.count} <span className="text-sm">次</span>
                </p>
                <p className="text-sm text-forest-700 font-mono">
                  省 ¥{item.totalSavings.toFixed(2)}
                </p>
                <p className="text-xs text-crimson-700 font-mono">
                  平均 {item.averageDiscount} 折
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.totalRecords === 0 && (
        <div className="card-paper p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="font-display text-2xl text-amber-900 mb-2">暂无统计数据</h3>
          <p className="text-amber-700">开始记录你的捡漏经历，这里会展示你的战绩统计！</p>
        </div>
      )}
    </div>
  );
};

export default StatsPage;

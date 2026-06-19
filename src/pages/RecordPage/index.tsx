import { useStore, useUserRecords, useUserStats } from '../../store/useStore';
import RecordForm from '../../components/Form/RecordForm';
import RecordCard from '../../components/Card/RecordCard';
import BudgetOverviewCard from '../../components/Budget/BudgetOverviewCard';
import { Sparkles } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

const RecordPage = () => {
  const deleteRecord = useStore((state) => state.deleteRecord);
  const records = useUserRecords();
  const stats = useUserStats();
  const recentRecords = records.slice(0, 3);

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.purchaseDate === today);
    const todaySavings = todayRecords.reduce((sum, r) => 
      sum + r.originalPrice * (1 - r.discount / 10), 0
    );
    return {
      count: todayRecords.length,
      savings: Number(todaySavings.toFixed(2))
    };
  }, [records]);

  const [displayCount, setDisplayCount] = useState(0);
  const [displaySavings, setDisplaySavings] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    setDisplayCount(0);
    setDisplaySavings(0);
    
    const duration = 1000;
    const steps = 30;
    const incrementCount = todayStats.count / steps;
    const incrementSavings = todayStats.savings / steps;
    let currentCount = 0;
    let currentSavings = 0;
    
    const timer = setInterval(() => {
      currentCount += incrementCount;
      currentSavings += incrementSavings;
      
      if (currentCount >= todayStats.count) {
        setDisplayCount(todayStats.count);
        setDisplaySavings(todayStats.savings);
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(currentCount));
        setDisplaySavings(currentSavings);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [todayStats.count, todayStats.savings]);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-amber-600" />
          <h2 className="title-display text-3xl md:text-4xl text-amber-900">
            记录中心
          </h2>
          <Sparkles className="w-6 h-6 text-amber-600" />
        </div>
        <p className="text-amber-700 font-body text-lg">
          记录每一次精彩的捡漏，积累你的省钱战绩
        </p>
      </div>

      {stats.latestRecord && (
        <div className="card-paper p-4 mb-6 bg-gradient-to-r from-amber-50 to-parchment-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-parchment-100 text-2xl">
              🎉
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-600 font-display">最近一次捡漏</p>
              <p className="font-display text-xl text-amber-900">
                {stats.latestRecord.productName}
              </p>
              <p className="text-sm text-amber-700">
                在 {stats.latestRecord.supermarketName} 以 {stats.latestRecord.discount}折 入手
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold text-forest-700">
                省 ¥{(stats.latestRecord.originalPrice * (1 - stats.latestRecord.discount / 10)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <RecordForm />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <BudgetOverviewCard />

          <div className="card-paper p-6 relative">
            <div className="tape" style={{ top: '-8px', right: '30px', transform: 'rotate(5deg)' }} />
            <h3 className="font-display text-xl text-amber-900 mb-4 flex items-center gap-2">
              📊 今日战绩
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-parchment-100 rounded-lg border border-amber-200 relative overflow-hidden">
                <p className="text-xs text-amber-600 mb-1">今日捡漏次数</p>
                <p className={`font-mono text-3xl font-bold text-amber-800 ${isAnimating ? 'number-pop' : ''}`}>
                  {displayCount}
                </p>
              </div>
              <div className="text-center p-3 bg-parchment-100 rounded-lg border border-amber-200 relative overflow-hidden">
                <p className="text-xs text-amber-600 mb-1">今日节省</p>
                <p className={`font-mono text-3xl font-bold text-forest-700 ${isAnimating ? 'number-pop' : ''}`}>
                  ¥{displaySavings.toFixed(0)}
                </p>
              </div>
            </div>
            {todayStats.count === 0 && (
              <p className="text-center text-sm text-amber-500 mt-3 italic">
                今天还没有记录，快去淘临期好物吧！
              </p>
            )}
          </div>

          {recentRecords.length > 0 && (
            <div>
              <h3 className="font-display text-xl text-amber-900 mb-4 flex items-center gap-2">
                📝 最近记录
              </h3>
              <div className="space-y-4">
                {recentRecords.map((record, index) => (
                  <div 
                    key={record.id} 
                    className="card-paper p-4 relative"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-display text-lg text-amber-900">
                          {record.productName}
                        </h4>
                        <p className="text-sm text-amber-700">
                          📍 {record.supermarketName}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="badge-stamp stamp-green text-xs">
                          {record.discount}折
                        </span>
                        <p className="font-mono text-sm text-forest-700 mt-1">
                          省 ¥{(record.originalPrice * (1 - record.discount / 10)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordPage;

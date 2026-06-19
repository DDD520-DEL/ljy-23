import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Store, Tag, MapPin, Target, Sparkles } from 'lucide-react';
import type { Record } from '../../types';
import { calculateSavings } from '../../utils/calculations';
import { getCategoryColor, defaultCategories } from '../../utils/mockData';
import MiniTrendChart from '../Chart/MiniTrendChart';

interface DashboardCardGridProps {
  records: Record[];
}

interface SupermarketQuickEntry {
  name: string;
  count: number;
  totalSavings: number;
  averageDiscount: number;
  lastVisit: string;
}

interface HighDiscountCategory {
  name: string;
  count: number;
  averageDiscount: number;
  totalSavings: number;
  color: string;
  icon: string;
}

const DashboardCardGrid = ({ records }: DashboardCardGridProps) => {
  const navigate = useNavigate();

  const [displayCount, setDisplayCount] = useState(0);
  const [displaySavings, setDisplaySavings] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const todayData = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayRecords = records.filter((r) => {
      const recordDate = new Date(r.purchaseDate).toISOString().split('T')[0];
      return recordDate === todayStr;
    });
    const count = todayRecords.length;
    const savings = todayRecords.reduce(
      (sum, r) => sum + calculateSavings(r.originalPrice, r.discount),
      0
    );
    return { count, savings: Number(savings.toFixed(2)) };
  }, [records]);

  useEffect(() => {
    setIsAnimating(true);
    setDisplayCount(0);
    setDisplaySavings(0);

    const duration = 1000;
    const steps = 30;
    const incrementCount = todayData.count / steps;
    const incrementSavings = todayData.savings / steps;
    let currentCount = 0;
    let currentSavings = 0;

    const timer = setInterval(() => {
      currentCount += incrementCount;
      currentSavings += incrementSavings;

      if (currentCount >= todayData.count) {
        setDisplayCount(todayData.count);
        setDisplaySavings(todayData.savings);
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(currentCount));
        setDisplaySavings(currentSavings);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [todayData.count, todayData.savings]);

  const weeklyTrend = useMemo(() => {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayRecords = records.filter((r) => {
        const recordDate = new Date(r.purchaseDate).toISOString().split('T')[0];
        return recordDate === dateStr;
      });
      const savings = dayRecords.reduce(
        (sum, r) => sum + calculateSavings(r.originalPrice, r.discount),
        0
      );
      result.push({
        day: weekDays[date.getDay()],
        savings: Number(savings.toFixed(2)),
      });
    }
    return result;
  }, [records]);

  const topSupermarkets = useMemo((): SupermarketQuickEntry[] => {
    const supermarketMap = new Map<
      string,
      { count: number; totalSavings: number; totalDiscount: number; lastDate: string }
    >();

    records.forEach((r) => {
      if (!supermarketMap.has(r.supermarketName)) {
        supermarketMap.set(r.supermarketName, {
          count: 0,
          totalSavings: 0,
          totalDiscount: 0,
          lastDate: '',
        });
      }
      const data = supermarketMap.get(r.supermarketName)!;
      const savings = calculateSavings(r.originalPrice, r.discount);
      data.count++;
      data.totalSavings += savings;
      data.totalDiscount += r.discount;
      if (!data.lastDate || r.purchaseDate > data.lastDate) {
        data.lastDate = r.purchaseDate;
      }
    });

    return Array.from(supermarketMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        totalSavings: Number(data.totalSavings.toFixed(2)),
        averageDiscount: Number((data.totalDiscount / data.count).toFixed(1)),
        lastVisit: data.lastDate,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [records]);

  const highDiscountCategories = useMemo((): HighDiscountCategory[] => {
    const categoryMap = new Map<
      string,
      { count: number; totalSavings: number; totalDiscount: number }
    >();

    const recentRecords = records.slice(0, 30);

    recentRecords.forEach((r) => {
      if (!categoryMap.has(r.category)) {
        categoryMap.set(r.category, { count: 0, totalSavings: 0, totalDiscount: 0 });
      }
      const data = categoryMap.get(r.category)!;
      data.count++;
      data.totalSavings += calculateSavings(r.originalPrice, r.discount);
      data.totalDiscount += r.discount;
    });

    const categoriesWithData = Array.from(categoryMap.entries())
      .filter(([, data]) => data.count >= 2)
      .map(([name, data]) => {
        const categoryMeta = defaultCategories.find((c) => c.name === name);
        return {
          name,
          count: data.count,
          averageDiscount: Number((data.totalDiscount / data.count).toFixed(1)),
          totalSavings: Number(data.totalSavings.toFixed(2)),
          color: getCategoryColor(name),
          icon: categoryMeta?.icon || 'Tag',
        };
      })
      .sort((a, b) => a.averageDiscount - b.averageDiscount);

    if (categoriesWithData.length >= 4) {
      return categoriesWithData.slice(0, 4);
    }

    const allWithCategory = Array.from(categoryMap.entries()).map(([name, data]) => {
      const categoryMeta = defaultCategories.find((c) => c.name === name);
      return {
        name,
        count: data.count,
        averageDiscount: Number((data.totalDiscount / Math.max(data.count, 1)).toFixed(1)),
        totalSavings: Number(data.totalSavings.toFixed(2)),
        color: getCategoryColor(name),
        icon: categoryMeta?.icon || 'Tag',
      };
    });

    return allWithCategory.sort((a, b) => a.averageDiscount - b.averageDiscount).slice(0, 4);
  }, [records]);

  const formatLastVisit = (dateStr: string): string => {
    if (!dateStr) return '暂无';
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-amber-600" />
          <h2 className="title-display text-3xl md:text-4xl text-amber-900">
            猎人看板
          </h2>
          <Sparkles className="w-6 h-6 text-amber-600" />
        </div>
        <p className="text-amber-700 font-body text-lg">
          一览今日捡漏战绩与省钱趋势
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-paper p-5 relative bg-gradient-to-br from-amber-50 to-parchment-100">
          <div
            className="tape"
            style={{ top: '-8px', left: '20px', transform: 'rotate(-3deg)' }}
          />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-amber-600 p-2.5 rounded-xl text-parchment-100 shadow-lg">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="badge-stamp stamp-amber text-xs">
                {todayData.count > 0 ? '已记录' : '待开始'}
              </span>
            </div>
            <h3 className="font-display text-base text-amber-900 mb-1">
              今日捡漏数
            </h3>
            <p
              className={`font-mono text-4xl font-bold text-amber-800 ${
                isAnimating ? 'number-pop' : ''
              }`}
            >
              {displayCount}
              <span className="text-lg font-display ml-1">次</span>
            </p>
            <p className="mt-2 text-sm font-mono text-forest-700">
              已节省 ¥{displaySavings.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="card-paper p-5 relative bg-gradient-to-br from-green-50 to-parchment-50 col-span-1 sm:col-span-2">
          <div
            className="tape"
            style={{ top: '-8px', right: '40px', transform: 'rotate(2deg)' }}
          />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-forest-600 p-2.5 rounded-xl text-parchment-100 shadow-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-base text-amber-900">
                    本周省钱趋势
                  </h3>
                  <p className="text-xs text-amber-600 font-body">
                    最近7天每日节省金额
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/stats')}
                className="text-xs font-mono text-map-600 hover:text-map-500 underline flex items-center gap-1 transition-colors"
              >
                查看详情
                <Target className="w-3 h-3" />
              </button>
            </div>
            <div className="h-[130px]">
              <MiniTrendChart data={weeklyTrend} />
            </div>
          </div>
        </div>

        <div className="card-paper p-5 relative bg-gradient-to-br from-map-50 to-parchment-50">
          <div
            className="tape"
            style={{ top: '-8px', left: '30px', transform: 'rotate(4deg)' }}
          />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-map-600 p-2.5 rounded-xl text-parchment-100 shadow-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="badge-stamp stamp-blue text-xs">
                TOP 3
              </span>
            </div>
            <h3 className="font-display text-base text-amber-900 mb-1">
              常去超市
            </h3>
            <p className="text-xs text-amber-600 font-body mb-3">
              按访问频率排行
            </p>
            <div className="space-y-1.5">
              {topSupermarkets.length > 0 ? (
                topSupermarkets.map((sm, index) => (
                  <div
                    key={sm.name}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded bg-parchment-100/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-amber-700 w-4">
                        {index + 1}
                      </span>
                      <span className="font-display text-amber-900 truncate">
                        {sm.name}
                      </span>
                    </div>
                    <span className="font-mono text-forest-700 whitespace-nowrap">
                      {sm.count}次
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-amber-500 italic font-body py-2 text-center">
                  暂无数据
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card-paper p-5 relative col-span-1 lg:col-span-2">
          <div
            className="tape"
            style={{ top: '-8px', left: '60px', transform: 'rotate(-2deg)' }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-amber-700 p-2.5 rounded-xl text-parchment-100 shadow-lg">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-amber-900">
                    常去超市快捷入口
                  </h3>
                  <p className="text-xs text-amber-600 font-body">
                    点击查看该超市的捡漏详情
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/map')}
                className="text-sm font-display text-map-600 hover:text-map-500 underline transition-colors"
              >
                打开地图 →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topSupermarkets.length > 0 ? (
                topSupermarkets.map((sm, index) => (
                  <button
                    key={sm.name}
                    onClick={() => navigate('/map')}
                    className="text-left p-4 rounded-xl border-2 border-amber-200 bg-parchment-50 hover:border-amber-500 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-xl text-parchment-100 shadow-md ${
                          index === 0
                            ? 'bg-amber-600'
                            : index === 1
                            ? 'bg-forest-600'
                            : 'bg-map-600'
                        }`}
                      >
                        {sm.name.charAt(0)}
                      </div>
                      <span className="badge-stamp stamp-green text-xs">
                        {sm.averageDiscount}折
                      </span>
                    </div>
                    <h4 className="font-display text-lg text-amber-900 mb-1 group-hover:text-amber-800">
                      {sm.name}
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-amber-600 font-body">
                          累计捡漏:
                        </span>
                        <span className="font-mono text-amber-800 font-bold">
                          {sm.count}次
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-600 font-body">
                          累计省钱:
                        </span>
                        <span className="font-mono text-forest-700 font-bold">
                          ¥{sm.totalSavings.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-600 font-body">
                          最近光顾:
                        </span>
                        <span className="font-mono text-amber-800">
                          {formatLastVisit(sm.lastVisit)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="md:col-span-3 text-center py-10 text-amber-500 italic font-body">
                  <Store className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>还没有超市记录，快去添加第一笔捡漏吧！</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card-paper p-5 relative">
          <div
            className="tape"
            style={{ top: '-8px', right: '30px', transform: 'rotate(3deg)' }}
          />
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-crimson-700 p-2.5 rounded-xl text-parchment-100 shadow-lg">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-xl text-amber-900">
                  高折扣品类
                </h3>
                <p className="text-xs text-amber-600 font-body">
                  近期最值得入手
                </p>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              {highDiscountCategories.length > 0 ? (
                highDiscountCategories.map((cat, index) => (
                  <div
                    key={cat.name}
                    className="p-3 rounded-lg border-2 transition-all hover:shadow-md"
                    style={{
                      borderColor: cat.color,
                      backgroundColor: `${cat.color}10`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: cat.color }}
                        >
                          <span className="text-parchment-100 text-xs font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <span className="font-display text-amber-900 text-sm">
                          {cat.name}
                        </span>
                      </div>
                      <span
                        className="badge-stamp font-mono text-xs px-2 py-0.5"
                        style={{
                          backgroundColor: `${cat.color}20`,
                          color: cat.color,
                          borderColor: cat.color,
                        }}
                      >
                        平均{cat.averageDiscount}折
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] px-1">
                      <span className="text-amber-600 font-body">
                        记录 {cat.count} 次
                      </span>
                      <span className="font-mono text-forest-700 font-bold">
                        省 ¥{cat.totalSavings.toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-amber-500 italic font-body text-sm text-center py-6">
                  <div>
                    <Tag className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>暂无足够数据</p>
                    <p className="text-xs mt-1">多记录几笔，推荐更精准</p>
                  </div>
                </div>
              )}
            </div>

            {highDiscountCategories.length > 0 && (
              <button
                onClick={() => navigate('/stats')}
                className="mt-4 w-full py-2 rounded-lg border-2 border-amber-400 text-amber-800 font-display text-sm hover:bg-amber-100 transition-colors"
              >
                查看完整品类分析 →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCardGrid;

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, useUserRecords } from '../../store/useStore';
import { MapPin, ShoppingBag, Percent, ArrowUpDown, Navigation, Store, TrendingDown } from 'lucide-react';
import { formatDiscount, calculateDistance, formatDistance, calculateAverageDiscount } from '../../utils/calculations';

type SortOption = 'distance' | 'discount' | 'count';

const NearbyDealsPage = () => {
  const navigate = useNavigate();
  const supermarkets = useStore((state) => state.supermarkets);
  const records = useUserRecords();
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [myLocation] = useState({ x: 50, y: 50 });

  const supermarketDeals = useMemo(() => {
    const dealsMap = new Map<string, { count: number; avgDiscount: number; distance: number; supermarket: typeof supermarkets[0] }>();

    supermarkets.forEach(supermarket => {
      const supermarketRecords = records.filter(r => r.supermarketName === supermarket.name);
      const distance = calculateDistance(myLocation.x, myLocation.y, supermarket.x, supermarket.y);
      
      dealsMap.set(supermarket.name, {
        count: supermarketRecords.length,
        avgDiscount: calculateAverageDiscount(supermarketRecords),
        distance,
        supermarket,
      });
    });

    const dealsList = Array.from(dealsMap.values());

    switch (sortBy) {
      case 'distance':
        dealsList.sort((a, b) => a.distance - b.distance);
        break;
      case 'discount':
        dealsList.sort((a, b) => a.avgDiscount - b.avgDiscount);
        break;
      case 'count':
        dealsList.sort((a, b) => b.count - a.count);
        break;
    }

    return dealsList;
  }, [supermarkets, records, myLocation, sortBy]);

  const handleSupermarketClick = (supermarketName: string) => {
    navigate(`/map?supermarket=${encodeURIComponent(supermarketName)}`);
  };

  const getDistanceBadgeColor = (distance: number) => {
    if (distance < 20) return 'bg-forest-100 text-forest-700 border-forest-300';
    if (distance < 40) return 'bg-amber-100 text-amber-700 border-amber-300';
    return 'bg-crimson-100 text-crimson-700 border-crimson-300';
  };

  const getDiscountBadgeColor = (avgDiscount: number) => {
    if (avgDiscount <= 4) return 'stamp-green';
    if (avgDiscount <= 6) return 'stamp-amber';
    return 'stamp-red';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Navigation className="w-8 h-8 text-amber-600" />
          <h2 className="title-display text-3xl md:text-4xl text-amber-900">
            附近折扣
          </h2>
          <Navigation className="w-8 h-8 text-amber-600" />
        </div>
        <p className="text-amber-700 font-body text-lg">
          发现身边的宝藏超市，捡漏快人一步
        </p>
      </div>

      <div className="card-paper p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-forest-500 animate-pulse" />
            <span className="font-display text-amber-800">我的位置</span>
            <span className="text-sm text-amber-600">(地图中心)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-amber-700" />
            <span className="font-display text-amber-800">排序：</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="input-field w-auto py-2 px-3"
            >
              <option value="distance">距离最近</option>
              <option value="discount">折扣最低</option>
              <option value="count">商品最多</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {supermarketDeals.map((deal, index) => (
            <div
              key={deal.supermarket.name}
              onClick={() => handleSupermarketClick(deal.supermarket.name)}
              className="card-paper p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.01] border-2 border-transparent hover:border-amber-300 group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                    <Store className="w-6 h-6 text-amber-700" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-xl text-amber-900 truncate">
                        {deal.supermarket.name}
                      </h3>
                      <span className={`badge-stamp ${getDiscountBadgeColor(deal.avgDiscount)}`}>
                        {deal.avgDiscount > 0 ? formatDiscount(deal.avgDiscount) : '暂无'}
                      </span>
                    </div>
                    <p className="text-sm text-amber-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {deal.supermarket.address}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getDistanceBadgeColor(deal.distance)}`}>
                    <Navigation className="w-4 h-4 inline mr-1" />
                    {formatDistance(deal.distance)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-amber-200">
                <div className="text-center p-2 bg-parchment-50 rounded-lg border border-amber-100">
                  <ShoppingBag className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                  <p className="text-xs text-amber-600">折扣商品</p>
                  <p className="font-mono text-lg font-bold text-amber-900">
                    {deal.count} <span className="text-xs font-normal">件</span>
                  </p>
                </div>
                
                <div className="text-center p-2 bg-parchment-50 rounded-lg border border-amber-100">
                  <Percent className="w-5 h-5 mx-auto mb-1 text-crimson-600" />
                  <p className="text-xs text-amber-600">平均折扣</p>
                  <p className="font-mono text-lg font-bold text-crimson-700">
                    {deal.avgDiscount > 0 ? `${deal.avgDiscount}折` : '-'}
                  </p>
                </div>
                
                <div className="text-center p-2 bg-parchment-50 rounded-lg border border-amber-100 col-span-2 sm:col-span-1">
                  <TrendingDown className="w-5 h-5 mx-auto mb-1 text-forest-600" />
                  <p className="text-xs text-amber-600">距离</p>
                  <p className="font-mono text-lg font-bold text-forest-700">
                    {formatDistance(deal.distance)}
                  </p>
                </div>
              </div>

              <div className="mt-3 text-right">
                <span className="text-sm text-amber-500 group-hover:text-amber-700 transition-colors">
                  点击查看地图位置 →
                </span>
              </div>
            </div>
          ))}
        </div>

        {supermarketDeals.filter(d => d.count > 0).length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="font-display text-2xl text-amber-900 mb-2">
              暂无折扣记录
            </h3>
            <p className="text-amber-700">
              快去记录你的第一笔捡漏吧！
            </p>
          </div>
        )}
      </div>

      <div className="card-paper p-4 md:p-6">
        <h3 className="font-display text-xl text-amber-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          距离说明
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-forest-500" />
            <span className="text-amber-700">近距离 (2 km 以内)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-amber-700">中距离 (2-4 km)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-crimson-500" />
            <span className="text-amber-700">远距离 (4 km 以上)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyDealsPage;

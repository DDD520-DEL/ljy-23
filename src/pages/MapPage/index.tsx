import { useState, useMemo } from 'react';
import { useStore, useUserRecords, useUserStats } from '../../store/useStore';
import RecordCard from '../../components/Card/RecordCard';
import { MapPin, ShoppingBag, Coins, Percent, X, Compass, Target } from 'lucide-react';
import { formatCurrency, formatDiscount } from '../../utils/calculations';

const MapPage = () => {
  const { supermarkets, deleteRecord } = useStore();
  const records = useUserRecords();
  const stats = useUserStats();
  const [selectedSupermarket, setSelectedSupermarket] = useState<string | null>(null);
  const [hoveredSupermarket, setHoveredSupermarket] = useState<string | null>(null);

  const supermarketStats = useMemo(() => {
    const map = new Map<string, { count: number; totalSavings: number; avgDiscount: number; records: typeof records }>();
    
    records.forEach(record => {
      if (!map.has(record.supermarketName)) {
        map.set(record.supermarketName, { count: 0, totalSavings: 0, avgDiscount: 0, records: [] });
      }
      const data = map.get(record.supermarketName)!;
      data.count++;
      data.totalSavings += record.originalPrice * (1 - record.discount / 10);
      data.avgDiscount += record.discount;
      data.records.push(record);
    });

    map.forEach((data, name) => {
      data.avgDiscount = Number((data.avgDiscount / data.count).toFixed(1));
      data.totalSavings = Number(data.totalSavings.toFixed(2));
    });

    return map;
  }, [records]);

  const getMarkerSize = (count: number) => {
    if (count >= 5) return 48;
    if (count >= 3) return 40;
    return 32;
  };

  const getMarkerColor = (count: number) => {
    if (count >= 5) return '#991B1B';
    if (count >= 3) return '#D97706';
    return '#166534';
  };

  const selectedRecords = selectedSupermarket 
    ? records.filter(r => r.supermarketName === selectedSupermarket)
    : [];

  const selectedStats = selectedSupermarket ? supermarketStats.get(selectedSupermarket) : null;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <Compass className="w-8 h-8 text-amber-600" />
          <h2 className="title-display text-3xl md:text-4xl text-amber-900">
            捡漏地图
          </h2>
          <Compass className="w-8 h-8 text-amber-600" />
        </div>
        <p className="text-amber-700 font-body text-lg">
          探索你的省钱版图，发现宝藏超市
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card-paper p-4 text-center">
          <MapPin className="w-6 h-6 mx-auto mb-2 text-amber-700" />
          <p className="font-display text-sm text-amber-600 mb-1">已探索超市</p>
          <p className="font-mono text-2xl font-bold text-amber-900">{stats.bySupermarket.length}</p>
        </div>
        <div className="card-paper p-4 text-center">
          <Target className="w-6 h-6 mx-auto mb-2 text-crimson-700" />
          <p className="font-display text-sm text-amber-600 mb-1">宝藏超市</p>
          <p className="font-mono text-2xl font-bold text-crimson-700">
            {stats.bySupermarket.filter(s => s.count >= 3).length}
          </p>
        </div>
        <div className="card-paper p-4 text-center">
          <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-forest-700" />
          <p className="font-display text-sm text-amber-600 mb-1">总捡漏次数</p>
          <p className="font-mono text-2xl font-bold text-forest-700">{stats.totalRecords}</p>
        </div>
        <div className="card-paper p-4 text-center">
          <Coins className="w-6 h-6 mx-auto mb-2 text-map-600" />
          <p className="font-display text-sm text-amber-600 mb-1">累计节省</p>
          <p className="font-mono text-2xl font-bold text-map-600">¥{stats.totalSavings.toFixed(0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="map-container aspect-[4/3] relative">
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-parchment-100 border-2 border-amber-700 rounded-lg px-3 py-2 shadow-lg">
                <p className="font-display text-amber-900 text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  藏宝图
                </p>
              </div>
            </div>

            <div className="absolute top-4 right-4 z-10">
              <div className="bg-parchment-100 border-2 border-amber-700 rounded-lg p-3 shadow-lg">
                <p className="font-display text-amber-900 text-xs mb-2">图例</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-crimson-700" />
                    <span className="text-xs text-amber-800">≥ 5 次</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-600" />
                    <span className="text-xs text-amber-800">3-4 次</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-forest-600" />
                    <span className="text-xs text-amber-800">1-2 次</span>
                  </div>
                </div>
              </div>
            </div>

            {supermarkets.map(supermarket => {
              const data = supermarketStats.get(supermarket.name);
              if (!data) return null;
              
              const size = getMarkerSize(data.count);
              const color = getMarkerColor(data.count);
              const isSelected = selectedSupermarket === supermarket.name;
              const isHovered = hoveredSupermarket === supermarket.name;

              return (
                <div key={supermarket.name}>
                  {(isSelected || isHovered) && data.count >= 3 && (
                    <div 
                      className="absolute pulse-ring rounded-full border-2 border-crimson-700"
                      style={{
                        left: `${supermarket.x}%`,
                        top: `${supermarket.y}%`,
                        width: `${size + 20}px`,
                        height: `${size + 20}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  )}

                  <div
                    className={`absolute cursor-pointer transition-all duration-300 ${
                      isSelected ? 'z-20' : 'z-10'
                    }`}
                    style={{
                      left: `${supermarket.x}%`,
                      top: `${supermarket.y}%`,
                      transform: `translate(-50%, -50%) ${isHovered || isSelected ? 'scale(1.2)' : 'scale(1)'}`,
                    }}
                    onClick={() => setSelectedSupermarket(
                      selectedSupermarket === supermarket.name ? null : supermarket.name
                    )}
                    onMouseEnter={() => setHoveredSupermarket(supermarket.name)}
                    onMouseLeave={() => setHoveredSupermarket(null)}
                  >
                    <div 
                      className={`rounded-full flex items-center justify-center shadow-lg border-3 border-parchment-100 ${
                        isSelected ? 'ring-4 ring-amber-400' : ''
                      }`}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        backgroundColor: color,
                        borderWidth: '3px',
                      }}
                    >
                      <span className="text-parchment-100 font-mono font-bold text-sm">
                        {data.count}
                      </span>
                    </div>

                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap">
                      <span 
                        className={`font-display text-sm px-2 py-1 rounded border transition-all ${
                          isHovered || isSelected 
                            ? 'opacity-100 bg-parchment-100 border-amber-700 text-amber-900' 
                            : 'opacity-0 bg-transparent border-transparent'
                        }`}
                      >
                        {supermarket.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {records.map(record => (
              <div
                key={record.id}
                className="absolute w-2 h-2 rounded-full bg-amber-500 opacity-60"
                style={{
                  left: `${record.x}%`,
                  top: `${record.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={`${record.productName} - ${record.discount}折`}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedSupermarket && selectedStats ? (
            <div className="space-y-4">
              <div className="card-paper p-4 relative">
                <div className="tape" style={{ top: '-8px', right: '20px', transform: 'rotate(3deg)' }} />
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-2xl text-amber-900">
                      {selectedSupermarket}
                    </h3>
                    <p className="text-sm text-amber-600">
                      📍 {supermarkets.find(s => s.name === selectedSupermarket)?.address}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSupermarket(null)}
                    className="p-1 hover:bg-amber-100 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-amber-700" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-parchment-100 rounded-lg border border-amber-200">
                    <ShoppingBag className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                    <p className="text-xs text-amber-600">次数</p>
                    <p className="font-mono font-bold text-amber-900">{selectedStats.count}</p>
                  </div>
                  <div className="text-center p-2 bg-parchment-100 rounded-lg border border-amber-200">
                    <Coins className="w-4 h-4 mx-auto mb-1 text-forest-600" />
                    <p className="text-xs text-amber-600">节省</p>
                    <p className="font-mono font-bold text-forest-700">¥{selectedStats.totalSavings.toFixed(0)}</p>
                  </div>
                  <div className="text-center p-2 bg-parchment-100 rounded-lg border border-amber-200">
                    <Percent className="w-4 h-4 mx-auto mb-1 text-crimson-600" />
                    <p className="text-xs text-amber-600">平均</p>
                    <p className="font-mono font-bold text-crimson-700">{selectedStats.avgDiscount}折</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  <p className="font-display text-amber-800 text-sm">捡漏记录：</p>
                  {selectedRecords.map(record => (
                    <div 
                      key={record.id} 
                      className="bg-parchment-50 rounded-lg p-3 border border-amber-200 hover:border-amber-400 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-display text-amber-900">{record.productName}</p>
                          <p className="text-xs text-amber-600">{record.category}</p>
                        </div>
                        <div className="text-right">
                          <span className="badge-stamp stamp-green text-xs">
                            {formatDiscount(record.discount)}
                          </span>
                          <p className="text-xs font-mono text-forest-700 mt-1">
                            省 {formatCurrency(record.originalPrice * (1 - record.discount / 10))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card-paper p-8 text-center h-full flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="font-display text-xl text-amber-900 mb-2">点击地图上的标记</h3>
              <p className="text-amber-700 text-sm">
                查看该超市的捡漏记录和统计数据
              </p>
              <div className="mt-6 text-left w-full">
                <p className="font-display text-amber-800 mb-2">超市列表：</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stats.bySupermarket.map(item => (
                    <div 
                      key={item.name}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedSupermarket(item.name)}
                    >
                      <span className="font-display text-amber-900">{item.name}</span>
                      <span className="font-mono text-sm text-amber-700">{item.count} 次</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSupermarket && selectedRecords.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display text-2xl text-amber-900 mb-6 flex items-center gap-2">
            📦 {selectedSupermarket} 的所有捡漏记录
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedRecords.map(record => (
              <RecordCard
                key={record.id}
                record={record}
                onDelete={deleteRecord}
                showActions={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;

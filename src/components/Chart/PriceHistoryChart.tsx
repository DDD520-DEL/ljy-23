import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceDot, ReferenceLine } from 'recharts';
import type { ProductPriceHistory } from '../../types';
import { formatCurrency, formatDiscount, formatShortDate } from '../../utils/calculations';
import { TrendingDown, Award, Store, Calendar } from 'lucide-react';

interface PriceHistoryChartProps {
  history: ProductPriceHistory;
}

const PriceHistoryChart = ({ history }: PriceHistoryChartProps) => {
  const chartData = history.history.map((point, index) => ({
    ...point,
    dateLabel: formatShortDate(point.date),
    isLowest: point.recordId === history.lowestPriceRecordId,
    index,
  }));

  const lowestIndex = chartData.findIndex(d => d.isLowest);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-parchment-100 border-2 border-amber-700 rounded-lg p-3 shadow-lg min-w-[200px]">
          <p className="font-display text-amber-900 font-bold mb-2">{label}</p>
          <p className="text-sm text-amber-700 mb-1">
            <Store className="inline w-3 h-3 mr-1" />
            {data.supermarketName}
          </p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-mono font-bold">
                {entry.name === '折扣' ? `${entry.value}折` : formatCurrency(entry.value)}
              </span>
            </p>
          ))}
          {data.isLowest && (
            <div className="mt-2 pt-2 border-t border-amber-300">
              <span className="badge-stamp stamp-green text-xs">
                🏆 历史最低价
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-4 mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-amber-800 font-body">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-paper p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-amber-600 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span>历史最低价</span>
          </div>
          <p className="font-mono text-2xl font-bold text-forest-700">
            {formatCurrency(history.lowestPrice)}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {history.lowestPriceSupermarket}
          </p>
        </div>

        <div className="card-paper p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-amber-600 mb-1">
            <Award className="w-4 h-4" />
            <span>最大折扣</span>
          </div>
          <p className="font-mono text-2xl font-bold text-crimson-700">
            {formatDiscount(history.highestDiscount)}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            节省 {((1 - history.highestDiscount / 10) * 100).toFixed(0)}%
          </p>
        </div>

        <div className="card-paper p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-amber-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span>平均折扣</span>
          </div>
          <p className="font-mono text-2xl font-bold text-amber-700">
            {formatDiscount(history.averageDiscount)}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            共 {history.totalRecords} 次记录
          </p>
        </div>

        <div className="card-paper p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-amber-600 mb-1">
            <Store className="w-4 h-4" />
            <span>平均入手价</span>
          </div>
          <p className="font-mono text-2xl font-bold text-map-600">
            {formatCurrency(history.averagePrice)}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            历史均价参考
          </p>
        </div>
      </div>

      <div className="card-paper p-6">
        <h3 className="font-display text-xl text-amber-900 mb-4 text-center">
          📉 折扣力度变化趋势
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 20, right: 30, top: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D97706" opacity={0.2} />
              <XAxis 
                dataKey="dateLabel" 
                stroke="#78350F"
                tick={{ fill: '#78350F', fontFamily: 'Lora', fontSize: 11 }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#D97706" 
                tick={{ fill: '#D97706', fontFamily: 'JetBrains Mono' }}
                domain={[0, 10]}
                label={{ value: '折扣(折)', angle: -90, position: 'insideLeft', fill: '#D97706', fontFamily: 'Lora', fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#166534" 
                tick={{ fill: '#166534', fontFamily: 'JetBrains Mono' }}
                label={{ value: '折后价(元)', angle: 90, position: 'insideRight', fill: '#166534', fontFamily: 'Lora', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              
              <ReferenceLine 
                yAxisId="right"
                y={history.lowestPrice} 
                stroke="#DC2626" 
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ 
                  value: '最低价', 
                  fill: '#DC2626', 
                  fontSize: 11,
                  position: 'right',
                }}
              />

              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="discount" 
                name="折扣"
                stroke="#D97706" 
                strokeWidth={3}
                dot={{ fill: '#D97706', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: '#92400E' }}
                animationDuration={1000}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="discountPrice" 
                name="折后价"
                stroke="#166534" 
                strokeWidth={3}
                dot={{ fill: '#166534', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: '#14532D' }}
                animationDuration={1200}
              />

              {lowestIndex >= 0 && (
                <ReferenceDot
                  yAxisId="right"
                  x={chartData[lowestIndex].dateLabel}
                  y={history.lowestPrice}
                  r={10}
                  fill="#DC2626"
                  stroke="#FFF"
                  strokeWidth={3}
                  label={{ 
                    value: '🏆', 
                    position: 'top',
                    fontSize: 16,
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-paper p-6">
        <h3 className="font-display text-xl text-amber-900 mb-4 text-center">
          📋 历史记录明细
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-amber-300">
                <th className="text-left py-2 px-3 text-amber-800 font-display">日期</th>
                <th className="text-left py-2 px-3 text-amber-800 font-display">超市</th>
                <th className="text-right py-2 px-3 text-amber-800 font-display">原价</th>
                <th className="text-right py-2 px-3 text-amber-800 font-display">折扣</th>
                <th className="text-right py-2 px-3 text-amber-800 font-display">折后价</th>
                <th className="text-center py-2 px-3 text-amber-800 font-display">备注</th>
              </tr>
            </thead>
            <tbody>
              {[...history.history].reverse().map((point, index) => (
                <tr 
                  key={point.recordId} 
                  className={`border-b border-amber-200 ${
                    point.recordId === history.lowestPriceRecordId 
                      ? 'bg-green-50' 
                      : 'hover:bg-amber-50'
                  } transition-colors`}
                >
                  <td className="py-2 px-3 text-amber-700 font-mono">
                    {formatShortDate(point.date)}
                  </td>
                  <td className="py-2 px-3 text-amber-700">
                    {point.supermarketName}
                  </td>
                  <td className="py-2 px-3 text-right text-amber-600 font-mono line-through">
                    {formatCurrency(point.originalPrice)}
                  </td>
                  <td className="py-2 px-3 text-right text-amber-700 font-mono font-bold">
                    {formatDiscount(point.discount)}
                  </td>
                  <td className="py-2 px-3 text-right text-forest-700 font-mono font-bold">
                    {formatCurrency(point.discountPrice)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {point.recordId === history.lowestPriceRecordId && (
                      <span className="badge-stamp stamp-green text-xs">
                        🏆 最低价
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryChart;

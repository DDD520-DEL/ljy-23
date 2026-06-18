import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { MonthStat } from '../../types';

interface TrendChartProps {
  data: MonthStat[];
}

const TrendChart = ({ data }: TrendChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-parchment-100 border-2 border-amber-700 rounded-lg p-3 shadow-lg">
          <p className="font-display text-amber-900 font-bold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-mono font-bold">
                {entry.name === '捡漏次数' ? entry.value : `¥${entry.value.toFixed(2)}`}
              </span>
            </p>
          ))}
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
    <div className="chart-container">
      <h3 className="font-display text-xl text-amber-900 mb-4 text-center">
        📈 时间趋势
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D97706" opacity={0.2} />
            <XAxis 
              dataKey="month" 
              stroke="#78350F"
              tick={{ fill: '#78350F', fontFamily: 'Lora', fontSize: 11 }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#D97706" 
              tick={{ fill: '#D97706', fontFamily: 'JetBrains Mono' }}
              label={{ value: '次数', angle: -90, position: 'insideLeft', fill: '#D97706', fontFamily: 'Lora', fontSize: 12 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#166534" 
              tick={{ fill: '#166534', fontFamily: 'JetBrains Mono' }}
              label={{ value: '节省(元)', angle: 90, position: 'insideRight', fill: '#166534', fontFamily: 'Lora', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="count" 
              name="捡漏次数"
              stroke="#D97706" 
              strokeWidth={3}
              dot={{ fill: '#D97706', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#92400E' }}
              animationDuration={1000}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="totalSavings" 
              name="节省金额"
              stroke="#166534" 
              strokeWidth={3}
              dot={{ fill: '#166534', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#14532D' }}
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;

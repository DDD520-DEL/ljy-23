import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { SupermarketStat } from '../../types';

interface SupermarketChartProps {
  data: SupermarketStat[];
}

const SupermarketChart = ({ data }: SupermarketChartProps) => {
  const colors = ['#D97706', '#B45309', '#92400E', '#78350F', '#A16207', '#854D0E', '#713F12', '#CA8A04', '#A16207'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-parchment-100 border-2 border-amber-700 rounded-lg p-3 shadow-lg">
          <p className="font-display text-amber-900 font-bold">{item.name}</p>
          <p className="text-sm text-amber-700">捡漏次数: <span className="font-mono font-bold">{item.count}</span></p>
          <p className="text-sm text-forest-700">节省金额: <span className="font-mono font-bold">¥{item.totalSavings.toFixed(2)}</span></p>
          <p className="text-sm text-map-600">平均折扣: <span className="font-mono font-bold">{item.averageDiscount}折</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h3 className="font-display text-xl text-amber-900 mb-4 text-center">
        🏪 超市捡漏排行
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D97706" opacity={0.2} />
            <XAxis 
              type="number" 
              stroke="#78350F" 
              tick={{ fill: '#78350F', fontFamily: 'JetBrains Mono' }}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={80} 
              stroke="#78350F"
              tick={{ fill: '#78350F', fontFamily: 'Lora', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              radius={[0, 8, 8, 0]}
              animationDuration={1000}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SupermarketChart;

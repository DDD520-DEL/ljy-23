import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CategoryStat } from '../../types';

interface CategoryPieChartProps {
  data: CategoryStat[];
}

const CategoryPieChart = ({ data }: CategoryPieChartProps) => {
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

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-mono font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div 
            key={`legend-${index}`} 
            className="flex items-center gap-1 px-2 py-1 bg-parchment-50 rounded border border-amber-200"
          >
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
        📦 品类分析
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={40}
              dataKey="count"
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="#FEF3C7"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryPieChart;

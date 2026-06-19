interface MiniTrendChartProps {
  data: Array<{ day: string; savings: number }>;
  width?: number;
  height?: number;
}

const MiniTrendChart = ({ data, width = 280, height = 120 }: MiniTrendChartProps) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-amber-500 italic font-body">
          本周暂无数据
        </p>
      </div>
    );
  }

  const padding = { top: 10, right: 10, bottom: 24, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxSavings = Math.max(...data.map(d => d.savings), 10);
  const roundedMax = Math.ceil(maxSavings / 10) * 10;

  const xStep = data.length > 1 ? chartWidth / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + chartHeight - (d.savings / roundedMax) * chartHeight,
    value: d.savings,
    day: d.day,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaD =
    pathD +
    ` L ${padding.left + (data.length - 1) * xStep} ${padding.top + chartHeight}` +
    ` L ${padding.left} ${padding.top + chartHeight} Z`;

  const totalSavings = data.reduce((sum, d) => sum + d.savings, 0);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="miniGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#166534" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#166534" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={`grid-${i}`}
            x1={padding.left}
            y1={padding.top + chartHeight * ratio}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight * ratio}
            stroke="#D97706"
            strokeOpacity="0.15"
            strokeDasharray="3 3"
          />
        ))}

        <path
          d={areaD}
          fill="url(#miniGradient)"
        />

        <path
          d={pathD}
          fill="none"
          stroke="#166534"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <g key={`point-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={p.value > 0 ? 4 : 3}
              fill="#166534"
              stroke="#FEF3C7"
              strokeWidth="1.5"
            />
            <text
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              fontSize="9"
              fill="#78350F"
              fontFamily="Lora, serif"
            >
              {p.day}
            </text>
          </g>
        ))}
      </svg>

      <div className="flex justify-between items-center mt-1 px-1">
        <span className="text-[10px] font-mono text-forest-700 font-bold">
          本周合计: ¥{totalSavings.toFixed(0)}
        </span>
        {totalSavings > 0 && (
          <span className="text-[10px] font-mono text-amber-700">
            日均 ¥{(totalSavings / 7).toFixed(0)}
          </span>
        )}
      </div>
    </div>
  );
};

export default MiniTrendChart;

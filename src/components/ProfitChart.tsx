import React, { useState } from 'react';
import { ProfitDataPoint } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProfitChartProps {
  data: ProfitDataPoint[];
  totalProfit?: string;
  profitChange?: string;
  onOpenDetails?: () => void;
}

export const ProfitChart: React.FC<ProfitChartProps> = ({
  data,
  totalProfit = '$446.7K',
  profitChange = '▲ 24,4%',
  onOpenDetails
}) => {
  const { t, language } = useLanguage();
  const [activePoint, setActivePoint] = useState<ProfitDataPoint | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // SVG Chart Geometry
  const width = 310;
  const height = 130;
  const paddingLeft = 32;
  const paddingRight = 12;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const minVal = 0;
  const maxVal = 16; // 16K scale

  // Compute coordinates for data points
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartW;
    const y = paddingTop + chartH - ((d.profit - minVal) / (maxVal - minVal)) * chartH;
    return { x, y, data: d };
  });

  // Construct SVG path string with smooth curves
  const linePath = points.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[idx - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX} ${prev.y}, ${midX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  // Construct SVG area closed path for gradient fill
  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  const baselineY = paddingTop + chartH;
  const areaPath = `${linePath} L ${lastPt.x} ${baselineY} L ${firstPt.x} ${baselineY} Z`;

  const yLabels = [
    { label: '15K', val: 15 },
    { label: '10K', val: 10 },
    { label: '5K', val: 5 },
    { label: '0', val: 0 }
  ];

  const getMonthLabel = (day: number) => {
    if (language === 'ru') return `${day} Янв`;
    return `${day} Қаң`;
  };

  const xTicks = [
    { label: getMonthLabel(1), index: 0 },
    { label: getMonthLabel(8), index: 2 },
    { label: getMonthLabel(15), index: 4 },
    { label: getMonthLabel(22), index: 6 },
    { label: getMonthLabel(29), index: 8 }
  ];

  return (
    <div
      id="card-total-profit"
      onClick={onOpenDetails}
      className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-xs hover:shadow-md transition-all cursor-pointer"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] font-medium text-slate-500">{t.totalProfit}</span>
      </div>

      {/* Main Metric & Growth badge */}
      <div className="flex items-baseline gap-2.5 mb-3">
        <span className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">
          {totalProfit}
        </span>
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60 leading-tight">
            <span>▲</span>
            <span>24,4%</span>
          </span>
          <span className="text-[11px] text-slate-400 font-normal">{t.comparisonLastMonth}</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => {
            setActivePoint(null);
            setHoverIndex(null);
          }}
        >
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines and Y labels */}
          {yLabels.map((item) => {
            const y = paddingTop + chartH - ((item.val - minVal) / (maxVal - minVal)) * chartH;
            return (
              <g key={item.label}>
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[9.5px] fill-slate-400 font-medium select-none"
                >
                  {item.label}
                </text>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray={item.val === 0 ? 'none' : '3 3'}
                />
              </g>
            );
          })}

          {/* Area Gradient */}
          <path d={areaPath} fill="url(#profitGradient)" />

          {/* Main Blue Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X axis tick labels */}
          {xTicks.map((tick) => {
            const pt = points[tick.index];
            if (!pt) return null;
            return (
              <text
                key={tick.label}
                x={pt.x}
                y={height - 6}
                textAnchor="middle"
                className="text-[9.5px] fill-slate-400 font-medium select-none"
              >
                {tick.label}
              </text>
            );
          })}

          {/* Interactive Data Points and Tooltips */}
          {points.map((pt, idx) => {
            const isHovered = hoverIndex === idx;
            return (
              <g key={idx}>
                {/* Touch/Hover target */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={12}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setActivePoint(pt.data);
                    setHoverIndex(idx);
                  }}
                  onTouchStart={() => {
                    setActivePoint(pt.data);
                    setHoverIndex(idx);
                  }}
                />

                {/* Point dot when hovered or active */}
                {isHovered && (
                  <>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={5}
                      fill="#FFFFFF"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      className="transition-all animate-pulse"
                    />
                    <line
                      x1={pt.x}
                      y1={pt.y}
                      x2={pt.x}
                      y2={baselineY}
                      stroke="#2563EB"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      opacity="0.6"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Popup */}
        {activePoint && (
          <div className="absolute top-1 right-2 bg-slate-900 text-white text-[10.5px] px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-2 pointer-events-none animate-fadeIn">
            <span className="font-semibold text-blue-300">{activePoint.displayDate}:</span>
            <span>
              ${activePoint.profit}K {language === 'ru' ? 'прибыль' : 'пайда'}
            </span>
            <span className="text-slate-400">({activePoint.orders} {(t?.orders || 'orders').toLowerCase()})</span>
          </div>
        )}
      </div>
    </div>
  );
};

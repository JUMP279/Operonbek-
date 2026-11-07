import React, { useState, useRef } from 'react';
import { Calendar, Maximize2, Minimize2, ChevronDown, Check } from 'lucide-react';

interface RevenueDataPoint {
  month: string;
  shortDate: string;
  value: number; // In millions
  displayValue: string;
  cumulativeDisplay: string;
  timestamp: string;
}

const yearRevenueData: RevenueDataPoint[] = [
  { month: 'Jan', shortDate: '15 Jan 2024', value: 1.2, displayValue: '$1.2M', cumulativeDisplay: '$1.20M', timestamp: '15 Jan 2024, 10:14 am' },
  { month: 'Feb', shortDate: '14 Feb 2024', value: 3.8, displayValue: '$3.8M', cumulativeDisplay: '$5.00M', timestamp: '14 Feb 2024, 2:30 pm' },
  { month: 'Mar', shortDate: '20 Mar 2024', value: 8.5, displayValue: '$8.5M', cumulativeDisplay: '$13.50M', timestamp: '20 Mar 2024, 11:45 am' },
  { month: 'Apr', shortDate: '18 Apr 2024', value: 24.0, displayValue: '$24.0M', cumulativeDisplay: '$37.50M', timestamp: '18 Apr 2024, 4:10 pm' },
  { month: 'May', shortDate: '22 May 2024', value: 38.2, displayValue: '$38.2M', cumulativeDisplay: '$75.70M', timestamp: '22 May 2024, 1:15 pm' },
  { month: 'Jun', shortDate: '16 Jun 2024', value: 9.8, displayValue: '$9.8M', cumulativeDisplay: '$85.50M', timestamp: '16 Jun 2024, 5:20 pm' },
  { month: 'Jul', shortDate: '24 Jul 2024', value: 52.4, displayValue: '$52.4M', cumulativeDisplay: '$103,56M', timestamp: '24 Jul 2024, 9:23 pm' },
  { month: 'Aug', shortDate: '19 Aug 2024', value: 84.0, displayValue: '$84.0M', cumulativeDisplay: '$187.56M', timestamp: '19 Aug 2024, 3:40 pm' },
  { month: 'Sep', shortDate: '15 Sep 2024', value: 62.1, displayValue: '$62.1M', cumulativeDisplay: '$249.66M', timestamp: '15 Sep 2024, 8:12 pm' },
  { month: 'Oct', shortDate: '21 Oct 2024', value: 41.5, displayValue: '$41.5M', cumulativeDisplay: '$291.16M', timestamp: '21 Oct 2024, 12:05 pm' },
  { month: 'Nov', shortDate: '18 Nov 2024', value: 68.9, displayValue: '$68.9M', cumulativeDisplay: '$360.06M', timestamp: '18 Nov 2024, 7:35 pm' },
  { month: 'Dec', shortDate: '28 Dec 2024', value: 480.0, displayValue: '$480.0M', cumulativeDisplay: '$1,469,324,230', timestamp: '28 Dec 2024, 11:59 pm' },
];

export const RevenueAreaChart: React.FC<{
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}> = ({ onToggleFullscreen, isFullscreen = false }) => {
  const [selectedRange, setSelectedRange] = useState<'Last 12 months' | 'Last 30 days' | 'Last 7 days' | 'Today'>('Last 12 months');
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number>(6); // Default on Jul to match reference mockup
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Chart dimensions & scaling
  const width = 640;
  const height = 260;
  const paddingLeft = 58;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Log scale for values between $1M and $1000M ($1B)
  const minYLog = Math.log10(1); // 1M = 0
  const maxYLog = Math.log10(1000); // 1000M = 3

  const getY = (val: number) => {
    const valLog = Math.log10(Math.max(1, val));
    const normalized = (valLog - minYLog) / (maxYLog - minYLog);
    return paddingTop + chartH - normalized * chartH;
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (yearRevenueData.length - 1)) * chartW;
  };

  // Build SVG smooth Bezier path
  const points = yearRevenueData.map((d, i) => ({ x: getX(i), y: getY(d.value) }));

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  // Grid levels matching image: $1B, $100M, $50M, $10M, $1M
  const yLabels = [
    { label: '$1B', val: 1000 },
    { label: '$100M', val: 100 },
    { label: '$50M', val: 50 },
    { label: '$10M', val: 10 },
    { label: '$1M', val: 1 },
  ];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = (mouseX / rect.width) * width;
    
    // Find closest data point
    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - ratio);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setHoverIndex(closestIdx);
  };

  const activePoint = points[hoverIndex] || points[6];
  const activeData = yearRevenueData[hoverIndex] || yearRevenueData[6];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100/90 shadow-[0_12px_40px_rgba(0,0,0,0.04)] relative select-none">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 tracking-normal block">
            Total Revenue
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              $1,469,324,230
            </h2>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            <span className="text-emerald-500 font-bold">
              +22.325 (12.2%)
            </span>
            <span className="text-slate-400 font-normal">
              • last 12 months
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Dropdown Range Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRangeDropdown(!showRangeDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{selectedRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRangeDropdown && (
              <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-40 min-w-[145px] animate-in fade-in zoom-in-95">
                {(['Last 12 months', 'Last 30 days', 'Last 7 days', 'Today'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setSelectedRange(r);
                      setShowRangeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                      selectedRange === r ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{r}</span>
                    {selectedRange === r && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen Expand Button */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Kichik ekran' : 'Katta ekranga kengaytirish'}
              className="w-8 h-8 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center shadow-2xs transition-all active:scale-95"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative w-full overflow-visible pt-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(6)}
        >
          <defs>
            {/* Soft Green/Emerald Gradient Fill */}
            <linearGradient id="revenueTealGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#34D399" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing line filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#10B981" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Dotted Grid Horizontal Lines & Y-Labels */}
          {yLabels.map((yl, idx) => {
            const y = getY(yl.val);
            return (
              <g key={idx}>
                {/* Y-Axis text */}
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[11px] font-medium font-sans"
                >
                  {yl.label}
                </text>

                {/* Dotted Grid line */}
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1.2"
                  strokeDasharray="2 6"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* Subtle vertical dotted grid marks */}
          {points.map((p, idx) => (
            <line
              key={idx}
              x1={p.x}
              y1={paddingTop}
              x2={p.x}
              y2={height - paddingBottom}
              stroke="#F1F5F9"
              strokeWidth="1"
              strokeDasharray="1 8"
              strokeLinecap="round"
            />
          ))}

          {/* Gradient Area under curve */}
          <path
            d={areaD}
            fill="url(#revenueTealGradient)"
          />

          {/* Smooth Teal/Emerald Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#2DD4BF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#softGlow)"
          />

          {/* Active Hover Crosshair Line */}
          <line
            x1={activePoint.x}
            y1={paddingTop}
            x2={activePoint.x}
            y2={height - paddingBottom}
            stroke="#10B981"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Active Point Circle Indicator (Concentric circles like image) */}
          <circle
            cx={activePoint.x}
            cy={activePoint.y}
            r="11"
            fill="#FFFFFF"
            stroke="#2DD4BF"
            strokeWidth="2.5"
            className="transition-all duration-150"
          />
          <circle
            cx={activePoint.x}
            cy={activePoint.y}
            r="4.5"
            fill="#10B981"
            className="transition-all duration-150"
          />

          {/* X-Axis Month Labels */}
          {yearRevenueData.map((d, idx) => {
            const x = getX(idx);
            const isHovered = hoverIndex === idx;
            return (
              <text
                key={idx}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className={`text-[11px] font-sans transition-colors ${
                  isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-400 font-normal'
                }`}
              >
                {d.month}
              </text>
            );
          })}
        </svg>

        {/* Floating Dark Tooltip Box matching exact reference */}
        <div
          className="absolute pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full pb-3"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: `${(activePoint.y / height) * 100}%`,
          }}
        >
          <div className="bg-[#18181B] text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700/80 text-left min-w-[155px]">
            <div className="text-[10px] font-medium text-slate-400">
              {activeData.timestamp}
            </div>
            <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
              <span>Cumulative:</span>
              <span className="font-extrabold text-emerald-400">{activeData.cumulativeDisplay}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

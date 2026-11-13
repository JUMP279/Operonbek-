import React, { useState } from 'react';
import { ProfitDataPoint } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { formatCompact, formatChange, formatMoney } from '../lib/format';

interface ProfitChartProps {
  /** `profit` — davr bo'lagi bo'yicha daromad (to'liq summa, valyutada). */
  data: ProfitDataPoint[];
  total: number;
  change: number | null;
  currency: string;
  onOpenDetails?: () => void;
}

export const ProfitChart: React.FC<ProfitChartProps> = ({ data, total, change, currency, onOpenDetails }) => {
  const { language } = useLanguage();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const ru = language !== 'kk';

  const width = 310;
  const height = 130;
  const paddingLeft = 40;
  const paddingRight = 12;
  const paddingTop = 15;
  const paddingBottom = 25;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const peak = Math.max(0, ...data.map((d) => d.profit));
  // "Chiroyli" yuqori chegara: 1, 2, 5 × 10^n
  const niceMax = (() => {
    if (peak <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(peak)));
    for (const m of [1, 2, 5, 10]) if (peak <= m * p) return m * p;
    return 10 * p;
  })();

  const n = Math.max(1, data.length - 1);
  const points = data.map((d, i) => ({
    x: paddingLeft + (data.length === 1 ? chartW / 2 : (i / n) * chartW),
    y: paddingTop + chartH - (d.profit / niceMax) * chartH,
    data: d,
  }));

  const linePath = points.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[idx - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX} ${prev.y}, ${midX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');
  const baselineY = paddingTop + chartH;
  const areaPath =
    points.length > 0 ? `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z` : '';

  const yLabels = [1, 0.5, 0].map((f) => ({ val: niceMax * f, label: f === 0 ? '0' : formatCompact(niceMax * f, language) }));
  const tickIdx = data.length <= 5 ? data.map((_, i) => i) : [0, 1, 2, 3, 4].map((k) => Math.round((k / 4) * (data.length - 1)));

  const ch = formatChange(change);
  const active = hoverIndex !== null ? points[hoverIndex]?.data : null;
  const empty = peak === 0;

  return (
    <div
      id="card-total-profit"
      onClick={onOpenDetails}
      className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-xs hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] font-medium text-slate-500">{ru ? 'Выручка' : 'Түсім'}</span>
      </div>

      <div className="flex items-baseline gap-2.5 mb-3 flex-wrap">
        <span className="text-[24px] font-bold text-slate-900 tracking-tight leading-none">
          {formatMoney(total, currency, language)}
        </span>
        {ch && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold leading-tight border ${
              ch.positive ? 'bg-emerald-50 text-emerald-600 border-emerald-100/60' : 'bg-rose-50 text-rose-600 border-rose-100/60'
            }`}
          >
            {ch.text}
          </span>
        )}
      </div>

      <div className="relative w-full overflow-hidden select-none">
        {empty && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="text-[11px] font-medium text-slate-400 bg-white/90 px-2.5 py-1 rounded-lg">
              {ru ? 'Подтверждённых продаж пока нет' : 'Расталған сатылым әзірге жоқ'}
            </span>
          </div>
        )}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible" onMouseLeave={() => setHoverIndex(null)}>
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {yLabels.map((item) => {
            const y = paddingTop + chartH - (item.val / niceMax) * chartH;
            return (
              <g key={item.val}>
                <text x={paddingLeft - 6} y={y + 3.5} textAnchor="end" className="text-[9px] fill-slate-400 font-medium">
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

          {areaPath && <path d={areaPath} fill="url(#profitGradient)" />}
          {linePath && (
            <path d={linePath} fill="none" stroke="#2563EB" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {tickIdx.map((i) => {
            const pt = points[i];
            if (!pt) return null;
            return (
              <text key={i} x={pt.x} y={height - 6} textAnchor="middle" className="text-[9px] fill-slate-400 font-medium">
                {pt.data.displayDate}
              </text>
            );
          })}

          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={12}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
                onTouchStart={() => setHoverIndex(idx)}
              />
              {hoverIndex === idx && (
                <>
                  <circle cx={pt.x} cy={pt.y} r={5} fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                  <line x1={pt.x} y1={pt.y} x2={pt.x} y2={baselineY} stroke="#2563EB" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                </>
              )}
            </g>
          ))}
        </svg>

        {active && (
          <div className="absolute top-1 right-2 bg-slate-900 text-white text-[10.5px] px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-2 pointer-events-none">
            <span className="font-semibold text-blue-300">{active.displayDate}:</span>
            <span>{formatMoney(active.profit, currency, language)}</span>
            <span className="text-slate-400">
              ({active.orders} {ru ? 'зак.' : 'тапс.'})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

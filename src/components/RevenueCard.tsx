import React, { useMemo, useState } from 'react';
import { ChevronRight, Handshake } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DashboardData } from '../lib/api';
import { formatChange, formatCompact, formatDay, formatMoney, formatNumber } from '../lib/format';

// Выручка (2026-11-16, ProfitChart o'rniga; saytdagi cabinet/RevenueChart bilan bir xil):
// kunlik ustunlar + o'tgan davr chizig'i, o'rtacha chek, eng yaxshi kun, to'lov kutayotganlar.
// 45 kundan uzun davr haftalarga guruhlanadi.
type Bar = { from: string; to: string; revenue: number; orders: number; prev: number };

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (v <= m * p) return m * p;
  return 10 * p;
}

export const RevenueCard: React.FC<{ dash: DashboardData; currency: string; onOpenDeals?: () => void }> = ({ dash, currency, onOpenDeals }) => {
  const { language } = useLanguage();
  const ru = language !== 'kk';
  const [hover, setHover] = useState<number | null>(null);
  const st = dash.revenue_stats;

  const bars: Bar[] = useMemo(() => {
    const s = dash.series || [];
    const size = s.length > 45 ? 7 : 1;
    const out: Bar[] = [];
    for (let i = 0; i < s.length; i += size) {
      const part = s.slice(i, i + size);
      out.push({
        from: part[0].date, to: part[part.length - 1].date,
        revenue: part.reduce((a, x) => a + x.revenue, 0),
        orders: part.reduce((a, x) => a + x.orders, 0),
        prev: part.reduce((a, x) => a + (x.prev_revenue || 0), 0),
      });
    }
    return out;
  }, [dash.series]);

  const total = dash.metrics.revenue;
  const W = 320, H = 150, L = 34, R = 4, T = 10, B = 20;
  const cw = W - L - R, chh = H - T - B;
  const top = niceMax(Math.max(1, ...bars.map((b) => Math.max(b.revenue, b.prev))));
  const slot = cw / Math.max(1, bars.length);
  const y = (v: number) => T + chh - (v / top) * chh;
  const cx = (i: number) => L + slot * i + slot / 2;
  const hasPrev = bars.some((b) => b.prev > 0);
  // Silliq chiziq (monoton kubik: qiymatdan oshib ketmaydi)
  const smooth = (p: (readonly [number, number])[]) => {
    if (p.length < 3) return p.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
    let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const mx = (p[i][0] + p[i + 1][0]) / 2;
      d += ` C${mx.toFixed(1)} ${p[i][1].toFixed(1)} ${mx.toFixed(1)} ${p[i + 1][1].toFixed(1)} ${p[i + 1][0].toFixed(1)} ${p[i + 1][1].toFixed(1)}`;
    }
    return d;
  };
  const pts = bars.map((b, i) => [cx(i), y(b.revenue)] as const);
  const line = smooth(pts);
  const area = pts.length ? `${line} L${pts[pts.length - 1][0].toFixed(1)} ${T + chh} L${pts[0][0].toFixed(1)} ${T + chh} Z` : '';
  const prevLine = smooth(bars.map((b, i) => [cx(i), y(b.prev)] as const));
  const hv = hover !== null ? bars[hover] : null;
  const ch = formatChange(dash.metrics.revenue_change ?? null);
  const label = (b: Bar) => (b.from === b.to ? formatDay(b.from, language) : `${formatDay(b.from, language)}–${formatDay(b.to, language)}`);
  const ticks = bars.length <= 7 ? bars.map((_, i) => i) : [0, Math.round((bars.length - 1) / 2), bars.length - 1];
  const empty = total === 0 && !hasPrev;

  const stat = (k: string, v: string, sub?: string) => (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2 min-w-0">
      <div className="text-[10px] font-semibold text-slate-500 truncate">{k}</div>
      <div className="text-[13px] font-black text-slate-900 truncate">{v}</div>
      {sub && <div className="text-[9.5px] text-slate-400 truncate">{sub}</div>}
    </div>
  );

  return (
    <div id="card-total-profit" className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-xs">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] font-medium text-slate-500">{ru ? 'Выручка' : 'Түсім'}</span>
        <div className="flex items-center gap-2 text-[9.5px] text-slate-400">
          <span className="inline-flex items-center gap-1"><span className="w-3 border-t-2 border-blue-600" />{bars.length > 0 && dash.series.length > 45 ? (ru ? 'недели' : 'апталар') : (ru ? 'дни' : 'күндер')}</span>
          {hasPrev && <span className="inline-flex items-center gap-1"><span className="w-3 border-t-2 border-dashed border-orange-400" />{ru ? 'раньше' : 'бұрын'}</span>}
        </div>
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-[24px] font-bold text-slate-900 tracking-tight leading-none">{formatMoney(hv ? hv.revenue : total, currency, language)}</span>
        {!hv && ch && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${ch.positive ? 'bg-emerald-50 text-emerald-600 border-emerald-100/60' : 'bg-rose-50 text-rose-600 border-rose-100/60'}`}>{ch.text}</span>
        )}
      </div>
      <div className="mt-1 h-4 text-[11px] text-slate-500 truncate">
        {hv ? `${label(hv)} · ${hv.orders} ${ru ? 'продаж' : 'сатылым'}${hasPrev ? ` · ${ru ? 'раньше' : 'бұрын'} ${formatMoney(hv.prev, currency, language)}` : ''}`
          : st ? `${ru ? 'Прошлый период' : 'Өткен кезең'}: ${formatMoney(st.prev_revenue, currency, language)}` : ''}
      </div>

      {empty ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-[11.5px] text-slate-500">
          {ru ? 'Продаж за период пока нет. Отмечайте «Продано» в «Сделках» — выручка появится здесь.' : 'Кезеңде сатылым әлі жоқ. «Мәмілелерде» «Сатылды» белгілеңіз — түсім осында көрінеді.'}
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full h-auto select-none" onMouseLeave={() => setHover(null)}>
          {[0, 0.5, 1].map((f) => (
            <g key={f}>
              <line x1={L} x2={W - R} y1={y(top * f)} y2={y(top * f)} stroke="#F1F5F9" strokeDasharray={f ? '3 3' : undefined} />
              <text x={L - 5} y={y(top * f) + 3} textAnchor="end" fontSize="8.5" fill="#94A3B8">{f ? formatCompact(top * f, language) : '0'}</text>
            </g>
          ))}
          <defs>
            <linearGradient id="revCardGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#revCardGrad)" />
          <path d={line} fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
          {hasPrev && <path d={prevLine} fill="none" stroke="#FB923C" strokeWidth="1.4" strokeDasharray="4 3" />}
          {hover !== null && pts[hover] && (
            <>
              <line x1={pts[hover][0]} x2={pts[hover][0]} y1={T} y2={T + chh} stroke="#2563EB" strokeDasharray="2 2" opacity="0.5" />
              <circle cx={pts[hover][0]} cy={pts[hover][1]} r="4" fill="#fff" stroke="#2563EB" strokeWidth="2" />
            </>
          )}
          {bars.map((_, i) => (
            <rect key={`h${i}`} x={L + slot * i} y={0} width={slot} height={H} fill="transparent"
              onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} onClick={() => setHover(i)} />
          ))}
          {ticks.map((i) => (
            <text key={`t${i}`} x={cx(i)} y={H - 5} textAnchor={bars.length > 7 ? (i === 0 ? 'start' : i === bars.length - 1 ? 'end' : 'middle') : 'middle'} fontSize="8.5" fill="#94A3B8">
              {formatDay(bars[i].from, language)}
            </text>
          ))}
        </svg>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        {stat(ru ? 'Средний чек' : 'Орташа чек', formatMoney(st?.avg_check || 0, currency, language),
          st && st.prev_avg_check ? `${ru ? 'было' : 'болды'} ${formatMoney(st.prev_avg_check, currency, language)}` : undefined)}
        {stat(ru ? 'Продаж' : 'Сатылым', formatNumber(dash.metrics.orders, language),
          st ? `${st.sale_days} ${ru ? 'дн. с продажами' : 'күн сатылыммен'}` : undefined)}
        {stat(ru ? 'Лучший день' : 'Үздік күн', st?.best_day ? formatMoney(st.best_day.revenue, currency, language) : '—',
          st?.best_day ? formatDay(st.best_day.date, language) : undefined)}
        {stat(ru ? 'Ждут оплаты' : 'Төлемді күтеді', formatMoney(dash.metrics.potential_revenue || 0, currency, language),
          `${formatNumber(dash.metrics.inquiries, language)} ${ru ? 'заявок' : 'өтінім'}`)}
      </div>
      {onOpenDeals && (
        <button onClick={onOpenDeals} className="mt-3 w-full flex items-center justify-between rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5 text-[12px] font-bold text-blue-700 active:scale-[0.99]">
          <span className="inline-flex items-center gap-1.5"><Handshake className="w-4 h-4" />{ru ? 'Сделки: кто купил, кто нет' : 'Мәмілелер: кім алды, кім алмады'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

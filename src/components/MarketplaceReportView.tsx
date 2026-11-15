import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, Eye, Package, RefreshCw, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, MarketplaceReport, MpOrdersBlock, WbFunnel } from '../lib/api';
import { formatDay, formatMoney, formatNumber } from '../lib/format';
import { MarketplaceConnectCard } from './MarketplaceConnectCard';
import { MpCardsPanel, MpGuidePanel, MpLinksPanel, MpReviewsPanel } from './MarketplaceTools';

// Marketplace hisoboti (2026-11-14) — saytdagi "Маркетплейсы" bilan bir manba: GET /marketplaces/{id}/report.
// Kaspi/WB/Uzum buyurtmalari + WB voronkasi (ko'rish → savat → buyurtma → sotib olish).
type Src = 'kaspi' | 'wb' | 'uzum';
const NAME: Record<Src, string> = { kaspi: 'Kaspi', wb: 'Wildberries', uzum: 'Uzum' };
const CUR: Record<Src, string> = { kaspi: 'KZT', wb: 'RUB', uzum: 'UZS' };
const COLOR: Record<Src, string> = { kaspi: '#f14635', wb: '#a73afd', uzum: '#7000ff' };

const Bars: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-end gap-[2px] h-16">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${Math.max(v ? 4 : 0, (v / max) * 100)}%`, background: color, opacity: v ? 1 : 0.15 }} />
      ))}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-2.5 rounded-xl bg-slate-50">
    <div className="text-[10.5px] text-slate-500">{label}</div>
    <div className="text-[15px] font-black text-slate-900 tabular-nums leading-tight">{value}</div>
  </div>
);

export const MarketplaceReportView: React.FC<{ onBack?: () => void; storeContext?: { businessId?: string } }> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();
  const ru = language !== 'kk';
  const lang = ru ? 'ru' : 'kk';
  const businessId = storeContext?.businessId;
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState<'all' | Src>('all');
  const [section, setSection] = useState<'report' | 'reviews' | 'cards' | 'links' | 'guide'>('report');
  const [data, setData] = useState<MarketplaceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (refresh = false) => {
    if (!businessId) return;
    setLoading(true);
    setError('');
    try {
      setData(await api.marketplaceReport(businessId, days, refresh));
    } catch {
      setError(ru ? 'Не удалось загрузить отчёт.' : 'Есеп жүктелмеді.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, days]);

  const Block: React.FC<{ s: Src; b: MpOrdersBlock }> = ({ s, b }) => {
    const cur = b.currency || CUR[s];
    return (
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <Stat label={ru ? 'Заказы' : 'Тапсырыстар'} value={formatNumber(b.totals.orders, lang)} />
          <Stat label={ru ? 'Выручка' : 'Түсім'} value={formatMoney(b.totals.revenue, cur, lang)} />
          <Stat label={ru ? 'Средний чек' : 'Орташа чек'} value={b.totals.avg_check != null ? formatMoney(b.totals.avg_check, cur, lang) : '—'} />
          <Stat label={ru ? 'Отмены' : 'Бас тарту'} value={b.totals.cancel_pct != null ? `${b.totals.cancel_pct}%` : '—'} />
          {s === 'wb' && (
            <>
              <Stat label={ru ? 'Выкуплено' : 'Сатып алынды'} value={`${formatNumber(b.totals.bought || 0, lang)}${b.totals.buyout_pct != null ? ` · ${b.totals.buyout_pct}%` : ''}`} />
              <Stat label={ru ? 'Возвраты / в пути' : 'Қайтару / жолда'} value={`${b.totals.returned || 0} / ${b.totals.in_transit ?? 0}`} />
            </>
          )}
        </div>
        {s === 'wb' && (
          <p className="text-[10.5px] text-slate-400 leading-snug px-1">
            {ru ? `Выручка WB — только выкупленные товары (отчёт «Продажи»). Сумма всех заказов: ${formatMoney(b.totals.ordered_revenue || 0, cur, lang)}.`
              : `WB түсімі — тек сатып алынған тауарлар («Сатылымдар» есебі). Барлық тапсырыс сомасы: ${formatMoney(b.totals.ordered_revenue || 0, cur, lang)}.`}
          </p>
        )}
        <div className="p-3 bg-white rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 mb-2">{ru ? 'Заказы по дням' : 'Күндер бойынша тапсырыс'}</div>
          <Bars values={b.series.map((x) => x.orders)} color={COLOR[s]} />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-500">{ru ? 'Товары' : 'Тауарлар'}</div>
          {b.products.length === 0 ? (
            <p className="px-3 py-3 text-xs text-slate-500">{ru ? 'Заказов за период нет.' : 'Кезеңде тапсырыс жоқ.'}</p>
          ) : b.products.slice(0, 30).map((p) => (
            <div key={p.title} className="px-3 py-2.5 flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold text-slate-900 truncate">{p.title}</div>
                <div className="text-[10.5px] text-slate-500">{ru ? 'с' : 'бастап'} {p.first_order ? formatDay(p.first_order, lang) : '—'} · {p.units} {ru ? 'шт' : 'дана'}{p.cancel_pct ? ` · ${ru ? 'отмен' : 'бас тарту'} ${p.cancel_pct}%` : ''}{s === 'wb' && p.bought != null ? ` · ${ru ? 'выкуп' : 'сатып алу'} ${p.bought}` : ''}{p.product_id ? ' · 🔗' : ''}</div>
              </div>
              <div className="text-right">
                <div className="text-[12.5px] font-black tabular-nums">{p.orders}</div>
                <div className="text-[10.5px] text-slate-500 tabular-nums">{formatMoney(p.revenue, cur, lang)}</div>
              </div>
            </div>
          ))}
        </div>
        {s !== 'wb' && (
          <p className="text-[10.5px] text-slate-400 leading-snug px-1">
            {s === 'kaspi'
              ? (ru ? 'Kaspi не отдаёт через API просмотры и дату размещения — они в Kaspi Pay → «Аналитика».' : 'Kaspi API арқылы қаралым мен орналастыру күнін бермейді — олар Kaspi Pay → «Аналитика» бөлімінде.')
              : (ru ? 'Uzum не отдаёт просмотры через открытый API.' : 'Uzum ашық API арқылы қаралымды бермейді.')}
          </p>
        )}
      </div>
    );
  };

  const Funnel: React.FC<{ f: WbFunnel }> = ({ f }) => {
    if (f.error) {
      return (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {f.error === 'wb_scope'
            ? (ru ? 'Токен WB без доступа к «Аналитика». Создайте токен с категориями «Статистика», «Аналитика», «Контент».' : 'WB токенінде «Аналитика» рұқсаты жоқ. «Статистика», «Аналитика», «Контент» санаттарымен токен құрыңыз.')
            : (ru ? 'Аналитика WB сейчас недоступна.' : 'WB аналитикасы қазір қолжетімсіз.')}
        </div>
      );
    }
    const tot = f.totals;
    if (!tot) return null;
    const steps = [
      { l: ru ? 'Посмотрели' : 'Көрді', v: tot.open, icon: Eye, p: null as number | null },
      { l: ru ? 'В корзину' : 'Себетке', v: tot.cart, icon: ShoppingCart, p: tot.add_to_cart_pct },
      { l: ru ? 'Заказали' : 'Тапсырыс берді', v: tot.order, icon: Package, p: tot.cart_to_order_pct },
      { l: ru ? 'Выкупили' : 'Сатып алды', v: tot.buyout, icon: Check, p: tot.buyout_pct },
    ];
    const max = Math.max(1, tot.open);
    return (
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2.5">
        <div className="text-[13px] font-black text-slate-900">{ru ? 'Воронка Wildberries' : 'Wildberries воронкасы'}</div>
        {steps.map((st, i) => (
          <div key={i}>
            <div className="flex justify-between text-[11.5px]"><span className="flex items-center gap-1.5 text-slate-600"><st.icon className="w-3.5 h-3.5" />{st.l}</span>
              <span className="font-bold tabular-nums">{formatNumber(st.v, lang)}{st.p != null ? <span className="text-slate-400 font-normal"> · {Math.round(st.p * 10) / 10}%</span> : null}</span></div>
            <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.max(st.v ? 2 : 0, (st.v / max) * 100)}%`, background: COLOR.wb, opacity: 1 - i * 0.18 }} /></div>
          </div>
        ))}
        {f.products && f.products.length > 0 && (
          <div className="pt-2 border-t border-slate-100 divide-y divide-slate-100">
            {f.products.slice(0, 20).map((p, i) => (
              <div key={String(p.nm_id ?? i)} className="py-2 flex items-center gap-2.5">
                <div className="w-9 h-11 rounded-lg bg-slate-100 overflow-hidden shrink-0">{p.photo && <img src={p.photo} alt="" className="w-full h-full object-cover" loading="lazy" />}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-semibold truncate">{p.title || p.vendor_code || p.nm_id}</div>
                  <div className="text-[10.5px] text-slate-500">{p.created_at ? `${ru ? 'создан' : 'құрылды'} ${formatDay(p.created_at, lang)} · ` : ''}{formatNumber(p.open, lang)} {ru ? 'просм.' : 'қаралым'} · {p.cart} {ru ? 'в корз.' : 'себет'}</div>
                </div>
                <div className="text-right text-[11px]"><b className="tabular-nums">{p.order}</b> <span className="text-slate-400">/ {p.buyout}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const srcs: Src[] = ['kaspi', 'wb', 'uzum'];
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-800" /></button>
        <h2 className="text-[16px] font-bold text-slate-900">{ru ? 'Маркетплейсы' : 'Маркетплейстер'}</h2>
        <button onClick={() => load(true)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"><RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-4 pb-2">
        {([['report', ru ? 'Отчёт' : 'Есеп'], ['reviews', ru ? 'Отзывы' : 'Пікірлер'], ['cards', ru ? 'Карточки' : 'Карточкалар'], ['links', ru ? 'Связки' : 'Байланыстар'], ['guide', ru ? 'Правила' : 'Ережелер']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setSection(k)} className={`px-3 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap ${section === k ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>{label}</button>
        ))}
      </div>
      {section !== 'report' && businessId && (
        <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar">
          {section === 'reviews' && <MpReviewsPanel businessId={businessId} l={lang} />}
          {section === 'cards' && <MpCardsPanel businessId={businessId} l={lang} />}
          {section === 'links' && <MpLinksPanel businessId={businessId} l={lang} />}
          {section === 'guide' && <MpGuidePanel businessId={businessId} l={lang} />}
        </div>
      )}
      {section === 'report' && <>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-4 pb-2">
        {(['all', ...srcs] as const).map((s) => (
          <button key={s} onClick={() => setTab(s)} className={`px-3 py-1.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap border ${tab === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>
            {s === 'all' ? (ru ? 'Все' : 'Барлығы') : NAME[s]}{s !== 'all' && data?.sources[s].connected ? ' •' : ''}
          </button>
        ))}
        <span className="flex-1" />
        {[7, 30, 90].map((d) => (
          <button key={d} onClick={() => setDays(d)} className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold border ${days === d ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>{d}{ru ? 'д' : 'к'}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 no-scrollbar">
        {error && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>}
        {!data && loading && <div className="py-12 flex justify-center"><div className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}
        {data && tab === 'all' && (
          <>
            {businessId && <MarketplaceConnectCard businessId={businessId} onSynced={() => load(true)} />}
            {srcs.map((s) => {
              const b = data.sources[s];
              return (
                <button key={s} onClick={() => setTab(s)} className="w-full text-left p-3.5 bg-white rounded-2xl border border-slate-200 active:scale-[0.99] transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black" style={{ color: COLOR[s] }}>{NAME[s]}</span>
                    <span className={`text-[10.5px] font-bold ${b.connected ? 'text-emerald-600' : 'text-slate-400'}`}>{b.connected ? (ru ? 'подключён' : 'қосылған') : (ru ? 'не подключён' : 'қосылмаған')}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Stat label={ru ? 'Заказы' : 'Тапсырыстар'} value={formatNumber(b.totals.orders, lang)} />
                    <Stat label={ru ? 'Выручка' : 'Түсім'} value={formatMoney(b.totals.revenue, b.currency || CUR[s], lang)} />
                  </div>
                  {s === 'wb' && data.sources.wb.funnel?.totals && (
                    <div className="mt-2 text-[11px] text-slate-500">{formatNumber(data.sources.wb.funnel.totals.open, lang)} {ru ? 'просмотров карточек' : 'карточка қаралымы'}</div>
                  )}
                </button>
              );
            })}
          </>
        )}
        {data && tab !== 'all' && (
          <>
            {!data.sources[tab].connected && businessId && <MarketplaceConnectCard businessId={businessId} onSynced={() => load(true)} />}
            {tab === 'wb' && data.sources.wb.funnel && <Funnel f={data.sources.wb.funnel} />}
            <Block s={tab} b={data.sources[tab]} />
          </>
        )}
      </div>
      </>}
    </div>
  );
};

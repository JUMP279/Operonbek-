import React, { useState } from 'react';
import { SlidersHorizontal, Check, X, Package } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DashboardOrder } from '../lib/api';
import { formatMoney, timeAgo } from '../lib/format';

type Filter = 'all' | 'inquiry' | 'confirmed' | 'cancelled';

interface OrdersTabProps {
  orders: DashboardOrder[];
  currency: string;
  /** Holatni Supabase'da o'zgartiradi (backend PATCH). */
  onSetStatus: (orderId: string, status: 'inquiry' | 'confirmed' | 'cancelled') => Promise<void>;
}

const SALE = new Set(['confirmed', 'paid', 'completed', 'delivered', 'done']);

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders, currency, onSetStatus }) => {
  const { language } = useLanguage();
  const ru = language !== 'kk';
  const [filter, setFilter] = useState<Filter>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const group = (s: string): Filter => (SALE.has(s) ? 'confirmed' : s === 'cancelled' ? 'cancelled' : 'inquiry');
  const filtered = orders.filter((o) => filter === 'all' || group(o.status) === filter);

  const LABELS: Record<Filter, string> = ru
    ? { all: 'Все', inquiry: 'Запросы', confirmed: 'Продажи', cancelled: 'Отменённые' }
    : { all: 'Барлығы', inquiry: 'Сұраулар', confirmed: 'Сатылымдар', cancelled: 'Бас тартылған' };

  const badge = (s: string) => {
    const g = group(s);
    const cls =
      g === 'confirmed' ? 'bg-[#34C759] text-white' : g === 'cancelled' ? 'bg-[#C7C7CC] text-white' : 'bg-[#007AFF] text-white';
    const text =
      g === 'confirmed' ? (ru ? 'Продано' : 'Сатылды') : g === 'cancelled' ? (ru ? 'Отменён' : 'Бас тартылды') : ru ? 'Запрос' : 'Сұрау';
    return <span className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-tight ${cls}`}>{text}</span>;
  };

  const SRC: Record<string, { name: string; cls: string }> = {
    kaspi: { name: 'Kaspi', cls: 'bg-rose-50 text-rose-700' },
    wb: { name: 'Wildberries', cls: 'bg-fuchsia-50 text-fuchsia-700' },
    uzum: { name: 'Uzum', cls: 'bg-violet-50 text-violet-700' },
    instagram: { name: 'Instagram', cls: 'bg-pink-50 text-pink-700' },
    telegram: { name: 'Telegram', cls: 'bg-sky-50 text-sky-700' },
    manual: { name: ru ? 'Вручную' : 'Қолмен', cls: 'bg-slate-100 text-slate-600' },
  };
  const isMarket = (s?: string) => s === 'kaspi' || s === 'wb' || s === 'uzum';
  // Suhbatdan aniqlangan bosqich (services/customer_chat.py)
  const stage = (o: DashboardOrder): string | null => {
    if (group(o.status) !== 'inquiry') return null;
    if (o.external_status === 'ordered') return ru ? 'Клиент оформил заказ — проверьте и подтвердите' : 'Клиент тапсырыс берді — тексеріп растаңыз';
    if (o.external_status === 'paid_claimed') return ru ? 'Клиент пишет, что оплатил — проверьте оплату' : 'Клиент төледім деп жазды — төлемді тексеріңіз';
    return null;
  };
  const money = (o: DashboardOrder) => formatMoney(o.amount, o.order_currency || currency, language);

  const change = async (id: string, status: 'confirmed' | 'cancelled' | 'inquiry') => {
    setBusyId(id);
    setError('');
    try {
      await onSetStatus(id, status);
    } catch {
      setError(ru ? 'Не удалось изменить статус. Попробуйте ещё раз.' : 'Күйді өзгерту мүмкін болмады. Қайталап көріңіз.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3 pt-0 select-none pb-2">
      <div className="flex items-center justify-between px-1 py-1 relative">
        <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">{ru ? 'Заказы' : 'Тапсырыстар'}</h2>
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-slate-800 hover:text-blue-600 py-1 px-2 rounded-lg hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-700" strokeWidth={2} />
            <span>{LABELS[filter]}</span>
          </button>
          {showFilter && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-30 min-w-[140px]">
              {(Object.keys(LABELS) as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setShowFilter(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                    filter === f ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{LABELS[f]}</span>
                  {filter === f && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>}

      {filtered.length === 0 ? (
        <div className="py-14 flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">{ru ? 'Заказов пока нет' : 'Тапсырыстар әзірге жоқ'}</p>
          <p className="text-xs text-slate-400 max-w-[240px]">
            {ru
              ? 'Здесь собираются заказы из Kaspi, Wildberries, Uzum (после подключения) и из переписок в Instagram и Telegram.'
              : 'Мұнда Kaspi, Wildberries, Uzum (қосылғаннан кейін) және Instagram мен Telegram хат алмасуларынан тапсырыстар жиналады.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="bg-white rounded-[22px] p-4 border border-slate-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-[14px] font-bold text-slate-900 tracking-tight truncate">
                    {o.product_name || (ru ? 'Товар' : 'Тауар')}
                    {o.product_code ? <span className="text-slate-400 font-medium"> · #{o.product_code}</span> : null}
                  </h3>
                  <p className="text-[11.5px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-1.5">
                    <span className={`px-1.5 py-[1px] rounded-md text-[10.5px] font-bold ${(SRC[o.source || 'telegram'] || SRC.manual).cls}`}>
                      {(SRC[o.source || 'telegram'] || SRC.manual).name}
                    </span>
                    <span>{timeAgo(o.created_at, language)}</span>
                    {(o.customer_name || (!isMarket(o.source) && o.customer_id)) ? <span>· {o.customer_name || o.customer_id}</span> : null}
                    {o.quantity && o.quantity > 1 ? <span>· {o.quantity} {ru ? 'шт.' : 'дана'}</span> : null}
                  </p>
                  {(o.customer_phone || o.note) && (
                    <p className="text-[11.5px] text-slate-500 mt-0.5 break-words">
                      {o.customer_phone ? <a href={`tel:${o.customer_phone}`} className="text-blue-600 font-semibold">{o.customer_phone}</a> : null}
                      {o.customer_phone && o.note ? ' · ' : ''}{o.note || ''}
                    </p>
                  )}
                  {isMarket(o.source) && o.external_id ? <p className="text-[10.5px] text-slate-400 mt-0.5">№ {o.external_id}</p> : null}
                </div>
                {badge(o.status)}
              </div>
              {stage(o) && <p className="text-[11.5px] font-semibold text-amber-700 bg-amber-50 rounded-xl px-2.5 py-1.5">{stage(o)}</p>}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{o.amount ? money(o) : '—'}</span>
                {group(o.status) === 'inquiry' && !isMarket(o.source) && (
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={busyId === o.id}
                      onClick={() => change(o.id, 'cancelled')}
                      className="h-8 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" /> {ru ? 'Отмена' : 'Бас тарту'}
                    </button>
                    <button
                      disabled={busyId === o.id}
                      onClick={() => change(o.id, 'confirmed')}
                      className="h-8 px-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" /> {ru ? 'Продано' : 'Сатылды'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

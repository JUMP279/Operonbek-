import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Flame, Handshake, Loader2, RotateCcw, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, DealRow, DealsBoard } from '../lib/api';
import { formatMoney, timeAgo } from '../lib/format';

// «Сделки» (2026-11-16, saytdagi cabinet/Deals bilan bir xil): «беру» degan mijozlar alohida.
// Продано / Не купили saqlanadi; mijoz adashib bekor qilgan bo'lsa — «Всё-таки купил» → Продано.
type Tab = 'active' | 'won' | 'lost';

export const DealsView: React.FC<{ onBack: () => void; storeContext?: { businessId?: string } }> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();
  const ru = language !== 'kk';
  const bid = storeContext?.businessId;
  const [data, setData] = useState<DealsBoard | null>(null);
  const [tab, setTab] = useState<Tab>('active');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    if (!bid) return;
    try {
      setData(await api.deals(bid));
      setError('');
    } catch {
      setError(ru ? 'Не удалось загрузить сделки' : 'Мәмілелер жүктелмеді');
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [bid]);

  const act = async (d: DealRow, action: 'won' | 'lost') => {
    if (!bid) return;
    setBusy(d.conversation_id);
    try {
      await api.closeDeal(bid, d.conversation_id, action);
      await load();
    } catch {
      setError(ru ? 'Не удалось сохранить' : 'Сақталмады');
    } finally {
      setBusy(null);
    }
  };

  const stage = (s?: string) => (ru
    ? ({ ready: 'Хочет купить', ordered: 'Оформил заказ', paid: 'Говорит, что оплатил' } as Record<string, string>)
    : ({ ready: 'Сатып алғысы келеді', ordered: 'Тапсырыс берді', paid: 'Төледім дейді' } as Record<string, string>))[s || ''] || '';

  const sum = (rows: DealRow[]) => rows.reduce((a, d) => a + (Number(d.amount) || 0), 0);
  const tabs: [Tab, string, number, number][] = data ? [
    ['active', ru ? 'Ждут вас' : 'Күтеді', data.counts.active, sum(data.active)],
    ['won', ru ? 'Продано' : 'Сатылды', data.counts.won, sum(data.won)],
    ['lost', ru ? 'Не купили' : 'Алмады', data.counts.lost, 0],
  ] : [];
  const list = data ? data[tab] : [];
  const btn = 'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11.5px] font-bold active:scale-95 disabled:opacity-50';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-x-hidden font-sans text-slate-900 w-full max-w-full">
      <div className="bg-white border-b border-slate-200/80 px-3 py-2.5 shrink-0 w-full flex items-center gap-2">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 active:scale-95">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5">
          <Handshake className="w-4 h-4 text-blue-600" />{ru ? 'Сделки' : 'Мәмілелер'}
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto p-3 pb-16 space-y-3">
        <p className="text-[11.5px] text-slate-500 leading-snug">
          {ru ? 'Клиенты, которые сказали «беру». Отмечайте, кто купил, — выручка на главном экране считается отсюда.'
            : '«Аламын» деген клиенттер. Кім сатып алғанын белгілеңіз — басты экрандағы түсім осыдан есептеледі.'}
        </p>
        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
        {!data && !error && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div>}
        {data && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {tabs.map(([k, label, n, s]) => (
                <button key={k} onClick={() => setTab(k)}
                  className={`rounded-2xl border px-2.5 py-2.5 text-left active:scale-[0.98] ${tab === k ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200'}`}>
                  <div className={`text-[10.5px] font-semibold ${tab === k ? 'text-white/70' : 'text-slate-500'}`}>{label}</div>
                  <div className="text-lg font-black leading-tight">{n}</div>
                  {s > 0 && <div className={`text-[10px] truncate ${tab === k ? 'text-white/70' : 'text-slate-400'}`}>{formatMoney(s, 'KZT', language)}</div>}
                </button>
              ))}
            </div>
            {list.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                <Flame className="w-6 h-6 mx-auto text-slate-300" />
                <p className="mt-2 text-[13px] font-bold">
                  {tab === 'active' ? (ru ? 'Пока никто не ждёт' : 'Әзірге ешкім күтпейді') : tab === 'won' ? (ru ? 'Продаж пока нет' : 'Әзірге сатылым жоқ') : (ru ? 'Отказов нет' : 'Бас тартқандар жоқ')}
                </p>
                {tab === 'active' && <p className="mt-1 text-[11.5px] text-slate-500">{ru ? 'Когда клиент скажет «беру», AI остановится и клиент появится здесь.' : 'Клиент «аламын» десе, AI тоқтайды және клиент осында пайда болады.'}</p>}
              </div>
            ) : list.map((d) => (
              <div key={d.conversation_id} className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-2xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13.5px] font-bold truncate max-w-[60%]">{d.customer_name || d.name || (ru ? 'Клиент' : 'Клиент')}</span>
                  <span className="text-[10px] font-semibold text-slate-400">{(d.platform || '').startsWith('instagram') ? 'Instagram' : 'Telegram'}</span>
                  {tab === 'active' && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">{stage(d.stage)}</span>}
                  {tab === 'won' && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{ru ? 'Продано' : 'Сатылды'}</span>}
                  {tab === 'lost' && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{d.closed_by === 'customer' ? (ru ? 'Клиент отменил' : 'Клиент бас тартты') : (ru ? 'Не купил' : 'Алмады')}</span>}
                </div>
                <div className="mt-1 text-[12.5px] text-slate-700">
                  {d.product ? `${d.product}${d.quantity && d.quantity > 1 ? ` × ${d.quantity}` : ''}` : '—'}
                  {d.amount ? <b className="ml-1.5">{formatMoney(Number(d.amount), 'KZT', language)}</b> : null}
                </div>
                {(d.phone || d.address) && <div className="text-[11.5px] text-slate-500 truncate">{[d.phone, d.address].filter(Boolean).join(' · ')}</div>}
                <div className="text-[10.5px] text-slate-400">{timeAgo((tab === 'active' ? d.updated_at : d.closed_at) || d.since || '', language)}</div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {tab === 'active' && (
                    <>
                      <button disabled={busy === d.conversation_id} onClick={() => act(d, 'won')} className={`${btn} bg-slate-900 text-white`}><Check className="w-3.5 h-3.5" />{ru ? 'Продано' : 'Сатылды'}</button>
                      <button disabled={busy === d.conversation_id} onClick={() => act(d, 'lost')} className={`${btn} bg-slate-100 text-slate-700`}><X className="w-3.5 h-3.5" />{ru ? 'Не купил' : 'Алмады'}</button>
                    </>
                  )}
                  {tab === 'lost' && (
                    <button disabled={busy === d.conversation_id} onClick={() => act(d, 'won')} className={`${btn} bg-slate-900 text-white`}><RotateCcw className="w-3.5 h-3.5" />{ru ? 'Всё-таки купил → Продано' : 'Бәрібір алды → Сатылды'}</button>
                  )}
                  {tab === 'won' && (
                    <button disabled={busy === d.conversation_id} onClick={() => act(d, 'lost')} className={`${btn} bg-slate-100 text-slate-700`}><RotateCcw className="w-3.5 h-3.5" />{ru ? 'Ошибка — не купил' : 'Қате — алмады'}</button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

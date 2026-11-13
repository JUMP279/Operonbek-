import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, Loader2, Plug, RefreshCw, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, ApiError, MarketplaceState } from '../lib/api';
import { timeAgo } from '../lib/format';

type Src = 'kaspi' | 'wb' | 'uzum';
const NAMES: Record<Src, string> = { kaspi: 'Kaspi', wb: 'Wildberries', uzum: 'Uzum' };

// Marketplace'larni ulash: sotuvchi kabinetidagi API-kalit kiritiladi → buyurtmalar har 30 daqiqada
// "Заказы" bo'limiga tushadi (services/marketplaces.py). Kalit serverda saqlanadi, ekranga qaytmaydi.
export const MarketplaceConnectCard: React.FC<{ businessId: string; onSynced?: () => void }> = ({ businessId, onSynced }) => {
  const { language } = useLanguage();
  const ru = language !== 'kk';
  const [st, setSt] = useState<MarketplaceState | null>(null);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Src | null>(null);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const HINT: Record<Src, string> = ru ? {
    kaspi: 'Kaspi Магазин → Настройки → Токен API (кабинет продавца).',
    wb: 'WB Партнёры → Настройки → Доступ к API → создать токен с доступом «Статистика».',
    uzum: 'Uzum Seller → Настройки → API → создать токен.',
  } : {
    kaspi: 'Kaspi Дүкен → Баптаулар → API токені (сатушы кабинеті).',
    wb: 'WB Серіктестер → Баптаулар → API қолжетімділігі → «Статистика» рұқсатымен токен жасау.',
    uzum: 'Uzum Seller → Баптаулар → API → токен жасау.',
  };
  const ERR: Record<string, string> = ru ? {
    bad_token: 'Ключ не подошёл. Проверьте, что он скопирован полностью и не отозван.',
    rate_limited: 'Маркетплейс ограничил частоту запросов — попробуйте через пару минут.',
    not_migrated: 'База ещё не обновлена для заказов с маркетплейсов. Обратитесь в поддержку Operon.',
    unavailable: 'Маркетплейс сейчас не отвечает. Попробуйте позже.',
  } : {
    bad_token: 'Кілт сәйкес келмеді. Толық көшірілгенін және күші жойылмағанын тексеріңіз.',
    rate_limited: 'Маркетплейс сұраныс жиілігін шектеді — бірнеше минуттан кейін қайталаңыз.',
    not_migrated: 'База маркетплейс тапсырыстары үшін әлі жаңартылмаған. Operon қолдауына жазыңыз.',
    unavailable: 'Маркетплейс қазір жауап бермейді. Кейінірек қайталаңыз.',
  };
  const errText = (e: unknown) => {
    const code = e instanceof ApiError ? (e.message || '').split(':')[0] : '';
    return ERR[code] || ERR.unavailable;
  };

  const load = () => api.marketplaces(businessId).then(setSt).catch(() => {});
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [businessId]);

  const connect = async (s: Src) => {
    if (token.trim().length < 10) return;
    setBusy(s); setError('');
    try {
      setSt(await api.marketplaceConnect(businessId, s, token.trim()));
      setEdit(null); setToken('');
      onSynced?.();
    } catch (e) { setError(errText(e)); } finally { setBusy(''); }
  };
  const disconnect = async (s: Src) => {
    setBusy(s); setError('');
    try { setSt(await api.marketplaceDisconnect(businessId, s)); } catch (e) { setError(errText(e)); } finally { setBusy(''); }
  };
  const sync = async () => {
    setBusy('sync'); setError('');
    try { setSt(await api.marketplaceSync(businessId)); onSynced?.(); } catch (e) { setError(errText(e)); } finally { setBusy(''); }
  };

  const connected = st ? (Object.keys(NAMES) as Src[]).filter((s) => st.sources[s]?.connected) : [];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl mb-3">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-2 p-3.5 text-left">
        <Plug className="w-4 h-4 text-purple-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-black">{ru ? 'Маркетплейсы' : 'Маркетплейстер'}</p>
          <p className="text-[11px] text-slate-500 truncate">
            {connected.length ? connected.map((s) => NAMES[s]).join(' · ') + (ru ? ' — подключено' : ' — қосылған')
              : (ru ? 'Подключите Kaspi, Wildberries, Uzum — заказы появятся здесь' : 'Kaspi, Wildberries, Uzum қосыңыз — тапсырыстар осында шығады')}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 space-y-2">
          {st && !st.migrated && (
            <p className="text-[11.5px] text-amber-700 bg-amber-50 rounded-xl px-3 py-2 flex gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{ERR.not_migrated}
            </p>
          )}
          {error && <p className="text-[11.5px] text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{error}</p>}
          {(Object.keys(NAMES) as Src[]).map((s) => {
            const c = st?.sources[s];
            return (
              <div key={s} className="rounded-xl bg-slate-50 p-2.5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="text-[12.5px] font-black flex-1">{NAMES[s]}</p>
                  {c?.connected ? (
                    <>
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{c.token_hint}</span>
                      <button onClick={() => disconnect(s)} disabled={!!busy} title={ru ? 'Отключить' : 'Ажырату'}
                        className="w-7 h-7 rounded-lg bg-white text-slate-400 hover:text-rose-600 flex items-center justify-center disabled:opacity-50">
                        {busy === s ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { setEdit(edit === s ? null : s); setToken(''); setError(''); }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-[11.5px] font-bold active:scale-95">
                      {ru ? 'Подключить' : 'Қосу'}
                    </button>
                  )}
                </div>
                {c?.connected && (
                  <p className="text-[11px] text-slate-500">
                    {c.last_error ? <span className="text-rose-600">{ERR[c.last_error.split(':')[0]] || ERR.unavailable}</span>
                      : c.last_sync ? `${ru ? 'Обновлено' : 'Жаңартылды'} ${timeAgo(c.last_sync, language)} · ${c.orders ?? 0} ${ru ? 'заказов' : 'тапсырыс'}`
                      : (ru ? 'Ожидает первой синхронизации' : 'Алғашқы синхрондауды күтуде')}
                  </p>
                )}
                {edit === s && !c?.connected && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500 leading-snug">{HINT[s]}</p>
                    <input value={token} onChange={(e) => setToken(e.target.value)} type="password" autoComplete="off"
                      placeholder={ru ? 'Вставьте API-ключ' : 'API кілтін қойыңыз'}
                      className="w-full rounded-lg border border-slate-200 p-2 text-[12px] outline-none focus:border-purple-400 bg-white" />
                    <button onClick={() => connect(s)} disabled={busy === s || token.trim().length < 10}
                      className="w-full py-2 rounded-lg bg-purple-600 text-white text-[12px] font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                      {busy === s && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{ru ? 'Проверить и подключить' : 'Тексеріп қосу'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {connected.length > 0 && (
            <button onClick={sync} disabled={!!busy}
              className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 text-[12px] font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${busy === 'sync' ? 'animate-spin' : ''}`} />{ru ? 'Обновить заказы сейчас' : 'Тапсырыстарды қазір жаңарту'}
            </button>
          )}
          <p className="text-[10.5px] text-slate-400 leading-snug">
            {ru ? 'Ключ хранится на сервере Operon и используется только для чтения заказов. Заказы обновляются каждые 30 минут.'
              : 'Кілт Operon серверінде сақталады және тек тапсырыстарды оқу үшін қолданылады. Тапсырыстар әр 30 минут сайын жаңарады.'}
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { BriefcaseBusiness, CheckCircle2, ChevronDown, Circle, Copy } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, TelegramBusinessState } from '../lib/api';

// Telegram Business — AI egasining SHAXSIY Telegram akkaunti nomidan javob beradi (services/tg_business.py).
// Saytdagi cabinet/TelegramBusiness.tsx bilan bir xil.
export const TelegramBusinessCard: React.FC<{ businessId?: string | null }> = ({ businessId }) => {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const [st, setSt] = useState<TelegramBusinessState | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    const load = () => api.telegramBusiness(businessId).then(setSt).catch(() => {});
    load();
    const t = window.setInterval(() => { if (document.visibilityState === 'visible') load(); }, 30000);
    return () => window.clearInterval(t);
  }, [businessId]);

  if (!businessId || !st) return null;
  const bot = '@' + st.bot_username;
  const copy = () => {
    try { navigator.clipboard.writeText(bot); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };
  const Step: React.FC<{ done?: boolean; n: number; children: React.ReactNode }> = ({ done, n, children }) => (
    <div className="flex gap-2 items-start">
      {done ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-px" /> : <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-px" />}
      <div className={`flex-1 ${done ? 'text-slate-400' : 'text-slate-700'}`}><b>{n}.</b> {children}</div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 text-left">
        <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
          <BriefcaseBusiness className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-900">Telegram Business</div>
          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
            {st.connected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-emerald-700 font-semibold truncate">
                  {ru ? 'AI отвечает от вашего имени' : 'AI сіздің атыңыздан жауап береді'}{st.user_name ? ` · ${st.user_name}` : ''}
                </span>
              </>
            ) : ru ? 'AI отвечает в вашем личном Telegram' : 'AI жеке Telegram-ыңызда жауап береді'}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {st.connected && !st.can_reply && (
        <p className="mt-2 text-[11px] font-semibold text-amber-700 bg-amber-50 rounded-xl px-2.5 py-2">
          {ru ? 'Бот только читает. В Telegram → Настройки → Telegram для бизнеса → Чат-боты включите «Отвечать на сообщения».'
            : 'Бот тек оқиды. Telegram → Баптаулар → Бизнеске арналған Telegram → Чат-боттар бөлімінде «Хабарламаларға жауап беру» қосыңыз.'}
        </p>
      )}

      {open && (
        <div className="mt-3 space-y-2 text-[11.5px] leading-snug">
          <p className="text-slate-500">{ru
            ? 'Клиенты пишут вам в личку — AI отвечает от вашего имени по каталогу, а горячих клиентов передаёт вам. Отвечает только тем, кто писал за последние 24 часа (правило Telegram).'
            : 'Клиенттер жекеңізге жазады — AI каталог бойынша сіздің атыңыздан жауап береді, ыстық клиенттерді сізге береді. Тек соңғы 24 сағатта жазғандарға жауап береді (Telegram ережесі).'}</p>
          <Step done={st.owner_linked} n={1}>{ru ? 'Свяжите Telegram с магазином (карточка Telegram выше).' : 'Telegram-ды дүкенмен байланыстырыңыз (жоғарыдағы Telegram картасы).'}</Step>
          <Step done={st.connected} n={2}>
            {ru ? 'Telegram → Настройки → Telegram для бизнеса → Чат-боты → добавьте ' : 'Telegram → Баптаулар → Бизнеске арналған Telegram → Чат-боттар → қосыңыз: '}
            <button onClick={copy} className="inline-flex items-center gap-1 font-bold text-sky-700">{bot}<Copy className="w-3 h-3" /></button>
            {copied && <span className="text-emerald-600 font-semibold"> ✓</span>}
          </Step>
          <Step done={st.connected && st.can_reply} n={3}>{ru ? 'Выберите чаты и включите «Отвечать на сообщения».' : 'Чаттарды таңдап, «Хабарламаларға жауап беру» қосыңыз.'}</Step>
          <p className="text-slate-400 text-[10.5px]">{ru
            ? 'Если напишете в чате сами — AI в этом чате встанет на паузу (включается обратно в «Ответы клиентам»). Для Telegram Business может понадобиться Telegram Premium.'
            : 'Чатқа өзіңіз жазсаңыз — сол чатта AI кідіреді («Клиенттерге жауап» бөлімінде қайта қосылады). Telegram Business үшін Telegram Premium керек болуы мүмкін.'}</p>
        </div>
      )}
    </div>
  );
};

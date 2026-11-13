import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Brain, Check, Loader2, PenLine, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, BusinessUnderstanding } from '../lib/api';
import { timeAgo } from '../lib/format';

interface BusinessMemoryViewProps {
  onBack?: () => void;
  storeContext?: { businessId?: string };
}

// Biznes xotira (2026-11-13, user talabi): faqat Operon biznesni QANDAY tushungani ko'rsatiladi
// ("bu do'kon kiyim-kechak sotadi..."). Adashsa — tadbirkor "bunday emas, bunday" deb yozadi va tushuncha
// fonda ~3 daqiqada qayta yoziladi. Bu AI CHAT EMAS: yozilganga javob berilmaydi.
// Eski "Профиль / Анкета / Правила / Акции / Выводы" tablari olib tashlandi (bazadagi yozuvlar o'chirilmadi).
export const BusinessMemoryView: React.FC<BusinessMemoryViewProps> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();
  const ru = language !== 'kk';
  const businessId = storeContext?.businessId;

  const [data, setData] = useState<BusinessUnderstanding | null>(null);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const poll = useRef<number | null>(null);

  const load = async (quiet = false) => {
    if (!businessId) return;
    try {
      setData(await api.understanding(businessId));
      setError('');
    } catch {
      if (!quiet) setError(ru ? 'Не удалось загрузить память.' : 'Жадты жүктеу мүмкін болмады.');
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (poll.current) window.clearInterval(poll.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  // Yangilanayotganda tayyor tushunchani ko'rsatish uchun har 8s tekshiramiz
  useEffect(() => {
    if (data?.status === 'updating' && !poll.current) {
      poll.current = window.setInterval(() => load(true), 8000);
    } else if (data?.status !== 'updating' && poll.current) {
      window.clearInterval(poll.current);
      poll.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.status]);

  const send = async () => {
    const v = text.trim();
    if (!businessId || v.length < 2) return;
    setSending(true);
    try {
      setData(await api.addUnderstandingCorrection(businessId, v));
      setText('');
      setSent(true);
    } catch {
      setError(ru ? 'Не удалось отправить. Попробуйте ещё раз.' : 'Жіберілмеді. Қайталап көріңіз.');
    } finally {
      setSending(false);
    }
  };

  const removeCorr = async (i: number) => {
    if (!businessId) return;
    try {
      setData(await api.deleteUnderstandingCorrection(businessId, i));
    } catch {
      /* ignore */
    }
  };

  const updating = data?.status === 'updating';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <div className="flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-blue-600" />
          <h2 className="text-[16px] font-bold text-slate-900">{ru ? 'Память бизнеса' : 'Бизнес жады'}</h2>
        </div>
        <span className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 no-scrollbar">
        <p className="text-[11.5px] text-slate-500 leading-relaxed">
          {ru
            ? 'Так Operon понимает ваш бизнес. На это опираются видео, посты и ответы клиентам.'
            : 'Operon бизнесіңізді осылай түсінеді. Видео, пост және клиентке жауап осыған сүйенеді.'}
        </p>

        {error && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>}

        {!data && !error && (
          <div className="py-12 flex justify-center">
            <div className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {data && (
          <>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10.5px] font-bold uppercase tracking-wide text-blue-600">
                  {ru ? 'Operon понимает так' : 'Operon былай түсінеді'}
                </span>
                {updating ? (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-blue-600">
                    <Loader2 className="w-3 h-3 animate-spin" /> {ru ? 'Обновляется' : 'Жаңартылуда'}
                  </span>
                ) : data.updated_at ? (
                  <span className="text-[10.5px] text-slate-400">{timeAgo(data.updated_at, language)}</span>
                ) : null}
              </div>
              {data.summary ? (
                <p className={`text-[14px] text-slate-800 leading-relaxed ${updating ? 'opacity-60' : ''}`}>{data.summary}</p>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  {ru ? 'Operon изучает ваш бизнес — это займёт до 3 минут.' : 'Operon бизнесіңізді зерттеп жатыр — 3 минутқа дейін.'}
                </p>
              )}
              {data.facts.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {data.facts.map((f, i) => (
                    <li key={i} className="flex gap-2 text-[12px] text-slate-700 leading-snug">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-900">
                <PenLine className="w-3.5 h-3.5 text-blue-600" /> {ru ? 'Что-то не так?' : 'Бірдеңе дұрыс емес пе?'}
              </div>
              <p className="text-[11.5px] text-slate-500 leading-snug">
                {ru
                  ? 'Напишите, как на самом деле. Например: «Мы продаём только вязаные свитера ручной работы».'
                  : 'Шын мәнінде қалай екенін жазыңыз. Мысалы: «Біз тек қолдан тоқылған свитер сатамыз».'}
              </p>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setSent(false); }}
                maxLength={600}
                rows={3}
                placeholder={ru ? 'Здесь не так, а вот так…' : 'Бұл жерде олай емес, былай…'}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-blue-500 focus:bg-white resize-none"
              />
              <button
                onClick={send}
                disabled={sending || text.trim().length < 2}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-bold disabled:opacity-40 active:scale-[0.98] transition"
              >
                {sending ? '…' : ru ? 'Сохранить' : 'Сақтау'}
              </button>
              {sent && (
                <p className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] leading-snug">
                  {ru
                    ? 'Принято. Если вы что-то написали — информация обновится в течение 3 минут.'
                    : 'Қабылданды. Егер бірдеңе жазсаңыз — ақпарат 3 минут ішінде жаңарады.'}
                </p>
              )}
              <p className="text-[10.5px] text-slate-400">
                {ru ? 'Это не чат: Operon не отвечает здесь, а меняет своё понимание бизнеса.' : 'Бұл чат емес: Operon мұнда жауап бермейді, бизнес туралы түсінігін өзгертеді.'}
              </p>
            </div>

            {data.corrections.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400 px-1">
                  {ru ? 'Ваши уточнения' : 'Сіздің нақтылауларыңыз'}
                </div>
                {data.corrections.map((c, i) => ({ c, i })).reverse().map(({ c, i }) => (
                  <div key={i} className="p-3 bg-white rounded-2xl border border-slate-100 flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-800 whitespace-pre-wrap break-words leading-relaxed">{c.text}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(c.at, language)}</p>
                    </div>
                    <button onClick={() => removeCorr(i)} className="w-7 h-7 shrink-0 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

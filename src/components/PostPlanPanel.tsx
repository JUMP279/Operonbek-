import React, { useEffect, useRef, useState } from 'react';
import { CalendarClock, Clock, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { api, ApiError, ContentLang, PostPlan, PostPlanItem } from '../lib/api';

// Kunlik post rejasi: har kuni 1 post, tanlangan vaqtda. Matn+rasm faqat eng yaqin post uchun
// oldindan tayyorlanadi; ҚАЗ/РУС bilan til almashtiriladi.
const T = {
  ru: {
    intro: 'Каждый день 1 пост в Instagram и Telegram. AI заранее готовит текст и картинку — вы видите их до публикации.',
    time: 'Время публикации', start: 'Запустить план', starting: 'Создаём план…',
    daily: (t: string) => `Каждый день в ${t}`, stop: 'Остановить план', stopConfirm: 'Точно остановить? Будущие посты удалятся.',
    preparing: 'AI готовит пост…', pending: 'Пост появится после выхода предыдущего',
    ready: 'Готов — выйдет по расписанию', published: 'Опубликовано', failed: 'Не получилось', draft: 'Черновик',
    other: 'Другой вариант', errors: { network: 'Нет связи с сервером', generic: 'Что-то пошло не так. Попробуйте ещё раз.', busy: 'Пост уже публикуется — изменить нельзя' },
  },
  kk: {
    intro: 'Күн сайын Instagram мен Telegram-ға 1 пост. AI мәтін мен суретті алдын ала дайындайды — жарияланғанға дейін көресіз.',
    time: 'Жариялау уақыты', start: 'Жоспарды бастау', starting: 'Жоспар жасалуда…',
    daily: (t: string) => `Күн сайын ${t}`, stop: 'Жоспарды тоқтату', stopConfirm: 'Шынымен тоқтатасыз ба? Болашақ посттар өшеді.',
    preparing: 'AI пост дайындап жатыр…', pending: 'Пост алдыңғысы шыққаннан кейін дайын болады',
    ready: 'Дайын — кесте бойынша шығады', published: 'Жарияланды', failed: 'Шықпады', draft: 'Жоба',
    other: 'Басқа нұсқа', errors: { network: 'Сервермен байланыс жоқ', generic: 'Бірдеңе дұрыс болмады. Қайталап көріңіз.', busy: 'Пост жариялануда — өзгерту мүмкін емес' },
  },
};

function when(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleString(lang === 'kk' ? 'kk-KZ' : 'ru-RU', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export const PostPlanPanel: React.FC<{ businessId: string; lang: 'ru' | 'kk' }> = ({ businessId, lang }) => {
  const L = T[lang];
  const [plan, setPlan] = useState<PostPlan | null>(null);
  const [time, setTime] = useState('19:00');
  const [starting, setStarting] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [confirmStop, setConfirmStop] = useState(false);
  const waiting = useRef(false);

  const errText = (e: unknown) => {
    if (e instanceof ApiError) {
      if (e.status === 0) return L.errors.network;
      if (e.status === 409) return L.errors.busy;
    }
    return L.errors.generic;
  };

  const load = async () => {
    try {
      const p = await api.postPlan(businessId);
      setPlan(p);
      if (p.settings?.time) setTime(p.settings.time);
    } catch (e) {
      setError(errText(e));
    }
  };

  useEffect(() => {
    load();
    // Eng yaqin post tayyorlanayotganda yangilab turamiz
    const t = window.setInterval(() => { if (waiting.current) load(); }, 10000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  // Faqat oldindagi (rejalashtirilgan) postlar — chiqib bo'lganlari va o'tgan kunlar ko'rsatilmaydi (2026-11-13)
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const upcoming = (plan?.items || [])
    .filter((i) => i.status !== 'published' && i.status !== 'failed'
      && (!i.past || new Date(i.scheduled_at) >= todayStart))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const nextDraft = upcoming.find((i) => i.status === 'draft');
  waiting.current = !!nextDraft && !nextDraft.text;
  const active = upcoming.length > 0;

  const start = async () => {
    setStarting(true);
    setError('');
    try {
      await api.createPostPlan(businessId, time);
      await load();
    } catch (e) {
      setError(errText(e));
    } finally {
      setStarting(false);
    }
  };

  const stop = async () => {
    setConfirmStop(false);
    try {
      await api.stopPostPlan(businessId);
      await load();
    } catch (e) {
      setError(errText(e));
    }
  };

  const patch = (id: string, x: Partial<PostPlanItem>) =>
    setPlan((p) => (p ? { ...p, items: p.items.map((i) => (i.id === id ? { ...i, ...x } : i)) } : p));

  const switchLang = async (it: PostPlanItem, to: ContentLang) => {
    if ((it.lang || 'kk') === to || busy) return;
    setBusy(it.id);
    setError('');
    try {
      const r = await api.switchPostItemLang(it.id, to);
      patch(it.id, { text: r.text, hashtags: r.hashtags, lang: r.lang });
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(null);
    }
  };

  const regenerate = async (it: PostPlanItem) => {
    if (busy) return;
    setBusy(it.id);
    setError('');
    try {
      const r = await api.regeneratePostItem(it.id);
      patch(it.id, { text: r.text, hashtags: r.hashtags, lang: r.lang, image_url: r.image_url });
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(null);
    }
  };

  const badge = (s: PostPlanItem['status'], hasText: boolean) => {
    const [label, cls] =
      s === 'published' ? [L.published, 'bg-emerald-50 text-emerald-700']
      : s === 'scheduled' ? [L.ready, 'bg-sky-50 text-sky-700']
      : s === 'failed' ? [L.failed, 'bg-rose-50 text-rose-700']
      : [hasText ? L.draft : '…', 'bg-slate-100 text-slate-600'];
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
  };

  if (!plan) {
    return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-purple-600 animate-spin" /></div>;
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-3.5 py-2.5 text-xs font-semibold">{error}</div>
      )}

      {!active && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
          <p className="text-[12px] text-slate-600">{L.intro}</p>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{L.time}</p>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="rounded-xl border border-slate-200 p-2.5 text-[13px] font-bold outline-none focus:border-purple-400" />
          </div>
          <button onClick={start} disabled={starting || !time}
            className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-60">
            {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {starting ? L.starting : L.start}
          </button>
        </div>
      )}

      {active && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 flex items-center justify-between gap-2">
          <p className="text-[12px] font-bold flex items-center gap-1.5"><Clock className="w-4 h-4 text-purple-600" />{L.daily(plan.settings?.time || time)}</p>
          {confirmStop ? (
            <button onClick={stop} className="text-[10.5px] font-bold text-rose-600">{L.stopConfirm}</button>
          ) : (
            <button onClick={() => setConfirmStop(true)} className="text-[10.5px] font-bold text-rose-600">{L.stop}</button>
          )}
        </div>
      )}

      {active && upcoming.map((it) => (
        <div key={it.id} className="bg-white border border-slate-200/90 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11.5px] font-bold text-purple-700 flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5" />{when(it.scheduled_at, lang)}
            </span>
            {badge(it.status, !!it.text)}
          </div>

          {it.text ? (
            <>
              {it.image_url && <img src={it.image_url} alt="" className="w-full rounded-xl border border-slate-100 object-cover max-h-72" />}
              <p className="text-[12.5px] leading-relaxed whitespace-pre-line text-slate-700">{it.text}</p>
              {it.hashtags.length > 0 && <p className="text-[11.5px] text-purple-700">{it.hashtags.join(' ')}</p>}
              {it.status === 'draft' && (
                <div className="flex items-center gap-1.5">
                  {(['kk', 'ru'] as const).map((l) => (
                    <button key={l} onClick={() => switchLang(it, l)} disabled={busy === it.id}
                      className={`px-3 py-1 rounded-lg text-[11px] font-black border active:scale-95 ${
                        (it.lang || 'kk') === l ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                      {l === 'kk' ? 'ҚАЗ' : 'РУС'}
                    </button>
                  ))}
                  {busy === it.id && <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin" />}
                  <button onClick={() => regenerate(it)} disabled={busy === it.id}
                    className="ml-auto px-3 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5" />{L.other}
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              {it.id === nextDraft?.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {it.id === nextDraft?.id ? L.preparing : L.pending}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

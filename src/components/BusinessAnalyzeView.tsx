import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle, ArrowLeft, CheckCircle2, ChevronDown, ExternalLink, Film, HeartPulse, Instagram, Lightbulb,
  Loader2, Lock, RefreshCw, Save, Send, ShoppingBag, Sparkles, Star, Swords, TrendingDown, TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, MarketProduct, MarketState, MarketWatch, MarketIgAccount } from '../lib/api';

// Biznes-tahlil (2026-11-09): raqobatchilar (Kaspi / WB / Uzum / Instagram / Telegram) va o'z biznes
// sog'lig'i. Ma'lumot backend'da har 3 kunda yangilanadi (services/market_intel.py).
const T = {
  ru: {
    title: 'Бизнес-анализ', refresh: 'Обновить сейчас', running: 'Идёт анализ конкурентов… это 1–3 минуты',
    updated: 'Обновлено', next: 'Следующее обновление', auto: 'Обновляется автоматически раз в 3 дня',
    empty: 'Анализа ещё нет. Добавьте конкурентов ниже (или просто нажмите «Обновить» — Kaspi проанализируем по вашим товарам).',
    error: 'Не удалось загрузить данные', runError: 'Прошлый анализ завершился с ошибкой — попробуйте обновить.',
    health: 'Состояние вашего бизнеса (3 дня)', good: 'Хорошо', ok: 'Средне', bad: 'Плохо',
    changes: 'Что изменилось', problems: 'Проблемы', advice: 'Советы на 3 дня',
    summary: 'Итог по конкурентам', actions: 'Что делать', why: 'Почему', expected: 'Эффект',
    competitors: 'Сильные и слабые стороны конкурентов', strengths: 'Сильные', weaknesses: 'Слабые', opps: 'Возможности для вас',
    kaspi: 'Kaspi', wb: 'Wildberries', uzum: 'Uzum', ig: 'Instagram', tg: 'Telegram',
    leaders: 'Лидеры продаж', tactics: 'Как продвигают', price: 'Цена', reviews: 'Отзывов',
    week: (n: number, capped?: boolean) => `не менее ${n}${capped ? '+' : ''} продаж за 7 дней`,
    growth: (n: number, d: number) => `+${n} отзывов за ${d} дн.`,
    salesNote: 'Маркетплейсы не публикуют продажи. Отзыв можно оставить только после покупки, поэтому «продаж за 7 дней» — это минимум по отзывам; реальных продаж больше.',
    complaints: 'Жалобы покупателей', noWb: 'Добавьте ссылки на товары конкурентов с Wildberries — поиск WB закрыт для автоматического чтения.',
    uzumClosed: 'Uzum закрыл открытые данные — автоматический анализ сейчас невозможен.',
    igNeeds: 'Instagram показывает чужие аккаунты только через вход Facebook (Meta Business). С текущим подключением анализ недоступен.',
    igNone: 'Добавьте Instagram-аккаунты конкурентов ниже.', followers: 'Подписчики', perWeek: 'постов/нед', reels: 'Reels',
    er: 'вовлечённость', topVideos: 'Лучшие видео', patterns: 'Что работает в видео', tryIt: 'Попробуйте',
    tgNone: 'Добавьте Telegram-каналы конкурентов ниже.', subs: 'Подписчики', posts30: 'постов за 30 дн.', avgViews: 'ср. просмотры',
    discounts: 'Скидки и акции', discountViews: 'просмотры акций', notFound: 'не найден или закрыт',
    watch: 'Конкуренты для отслеживания', watchHint: 'По одному в строке. Ссылки или @имена.',
    kw: 'Слова для поиска на Kaspi (по умолчанию — ваши товары)', kaspiL: 'Kaspi — ссылки на товары конкурентов',
    wbL: 'Wildberries — ссылки на товары', uzumL: 'Uzum — ссылки на товары', igL: 'Instagram — @аккаунты', tgL: 'Telegram — @каналы',
    save: 'Сохранить', saved: 'Сохранено', unknown: '—',
    vsUs: 'Чем вы отличаетесь от конкурентов', them: 'У них', us: 'У вас', ourMove: 'Ваш ход',
    howGrow: 'Как конкуренты увеличили продажи', genres: 'Жанры видео конкурентов', forViews: 'для просмотров', forSales: 'для продаж', forBoth: 'просмотры и продажи',
    salesVideos: 'Как продают через видео', notWorking: 'Что не работает', ideas: 'Идеи видео для вас', basedOn: 'Основание',
    views: 'просмотров', avgReel: 'ср. просмотры Reels', viewsHidden: 'просмотры скрыты', reelsWeek: 'Reels/нед',
    revWeek: (v: string) => `не менее ${v} за 7 дней`, month: (n: number, capped?: boolean) => `не менее ${n}${capped ? '+' : ''} продаж за 30 дней`,
    priceBox: 'Цены на рынке (Kaspi)', median: 'медиана', range: 'диапазон', yourPrice: 'ваша медиана',
    cheaper: 'вы дешевле рынка', pricier: 'вы дороже рынка', same: 'вы в рынке', withDisc: 'со скидкой', withInst: 'в рассрочку',
    marketWeek: 'лидеры за 7 дней: не менее', err: 'охват поста', discLift: 'акции к обычным постам', tgSales: 'Как продают в Telegram', perWeekTg: 'постов/нед',
  },
  kk: {
    title: 'Бизнес талдауы', refresh: 'Қазір жаңарту', running: 'Бәсекелестер талданып жатыр… 1–3 минут',
    updated: 'Жаңартылды', next: 'Келесі жаңарту', auto: 'Әр 3 күн сайын автоматты түрде жаңарады',
    empty: 'Талдау әлі жоқ. Төменде бәсекелестерді қосыңыз (немесе «Жаңарту» басыңыз — Kaspi-ді тауарларыңыз бойынша талдаймыз).',
    error: 'Деректер жүктелмеді', runError: 'Алдыңғы талдау қатемен аяқталды — қайта жаңартып көріңіз.',
    health: 'Бизнесіңіздің жағдайы (3 күн)', good: 'Жақсы', ok: 'Орташа', bad: 'Нашар',
    changes: 'Не өзгерді', problems: 'Мәселелер', advice: '3 күнге кеңес',
    summary: 'Бәсекелестер бойынша қорытынды', actions: 'Не істеу керек', why: 'Неге', expected: 'Нәтиже',
    competitors: 'Бәсекелестердің күшті және әлсіз жақтары', strengths: 'Күшті', weaknesses: 'Әлсіз', opps: 'Сізге мүмкіндіктер',
    kaspi: 'Kaspi', wb: 'Wildberries', uzum: 'Uzum', ig: 'Instagram', tg: 'Telegram',
    leaders: 'Сатылым көшбасшылары', tactics: 'Қалай жылжытады', price: 'Баға', reviews: 'Пікір',
    week: (n: number, capped?: boolean) => `7 күнде кемінде ${n}${capped ? '+' : ''} сатылым`,
    growth: (n: number, d: number) => `${d} күнде +${n} пікір`,
    salesNote: 'Маркетплейстер сатылымды жарияламайды. Пікірді тек сатып алғаннан кейін қалдыруға болады, сондықтан «7 күндегі сатылым» — пікір бойынша ең төменгі сан; нақты сатылым көбірек.',
    complaints: 'Сатып алушылардың шағымдары', noWb: 'Wildberries-тегі бәсекелес тауарлардың сілтемесін қосыңыз — WB іздеуі автоматты оқуға жабық.',
    uzumClosed: 'Uzum ашық деректерді жапты — қазір автоматты талдау мүмкін емес.',
    igNeeds: 'Instagram басқа аккаунттарды тек Facebook (Meta Business) арқылы кіргенде көрсетеді. Қазіргі қосылыммен талдау қолжетімсіз.',
    igNone: 'Төменде бәсекелестердің Instagram аккаунттарын қосыңыз.', followers: 'Жазылушы', perWeek: 'пост/апта', reels: 'Reels',
    er: 'белсенділік', topVideos: 'Үздік бейнелер', patterns: 'Бейнеде не жұмыс істейді', tryIt: 'Байқап көріңіз',
    tgNone: 'Төменде бәсекелестердің Telegram арналарын қосыңыз.', subs: 'Жазылушы', posts30: '30 күнде пост', avgViews: 'орташа қаралым',
    discounts: 'Жеңілдіктер мен акциялар', discountViews: 'акция қаралымы', notFound: 'табылмады немесе жабық',
    watch: 'Бақылайтын бәсекелестер', watchHint: 'Әр жолға біреуден. Сілтеме немесе @атау.',
    kw: 'Kaspi-де іздеу сөздері (әдепкі — сіздің тауарларыңыз)', kaspiL: 'Kaspi — бәсекелес тауар сілтемелері',
    wbL: 'Wildberries — тауар сілтемелері', uzumL: 'Uzum — тауар сілтемелері', igL: 'Instagram — @аккаунттар', tgL: 'Telegram — @арналар',
    save: 'Сақтау', saved: 'Сақталды', unknown: '—',
    vsUs: 'Бәсекелестерден айырмашылығыңыз', them: 'Оларда', us: 'Сізде', ourMove: 'Сіздің қадамыңыз',
    howGrow: 'Бәсекелестер сатылымды қалай өсірді', genres: 'Бәсекелес бейнелерінің жанрлары', forViews: 'қаралым үшін', forSales: 'сатылым үшін', forBoth: 'қаралым және сатылым',
    salesVideos: 'Бейне арқылы қалай сатады', notWorking: 'Не жұмыс істемейді', ideas: 'Сізге бейне идеялары', basedOn: 'Негізі',
    views: 'қаралым', avgReel: 'Reels орташа қаралымы', viewsHidden: 'қаралым жасырылған', reelsWeek: 'Reels/апта',
    revWeek: (v: string) => `7 күнде кемінде ${v}`, month: (n: number, capped?: boolean) => `30 күнде кемінде ${n}${capped ? '+' : ''} сатылым`,
    priceBox: 'Нарықтағы бағалар (Kaspi)', median: 'медиана', range: 'аралық', yourPrice: 'сіздің медианаңыз',
    cheaper: 'сіз нарықтан арзансыз', pricier: 'сіз нарықтан қымбатсыз', same: 'сіз нарық деңгейіндесіз', withDisc: 'жеңілдікпен', withInst: 'бөліп төлеумен',
    marketWeek: 'көшбасшылар 7 күнде: кемінде', err: 'пост қамтуы', discLift: 'акция / қарапайым пост', tgSales: 'Telegram-да қалай сатады', perWeekTg: 'пост/апта',
  },
};

const fmt = (n: number | null | undefined, lang: string) =>
  n === null || n === undefined ? '—' : new Intl.NumberFormat(lang === 'kk' ? 'kk-KZ' : 'ru-RU', { notation: n >= 100000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n);

const fmtDate = (iso: string | undefined, lang: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(lang === 'kk' ? 'kk-KZ' : 'ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
};

const Card: React.FC<{ title?: React.ReactNode; children: React.ReactNode; tone?: string }> = ({ title, children, tone }) => (
  <div className={`border rounded-2xl p-3.5 space-y-2.5 ${tone || 'bg-white border-slate-200/90'}`}>
    {title && <h3 className="text-[13px] font-black flex items-center gap-1.5">{title}</h3>}
    {children}
  </div>
);

const Bullets: React.FC<{ items?: string[]; color?: string }> = ({ items, color = 'bg-slate-400' }) =>
  items && items.length ? (
    <ul className="space-y-1">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2 text-[12px] text-slate-700 leading-snug">
          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${color}`} />{t}
        </li>
      ))}
    </ul>
  ) : null;

const Note: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <p className="text-[11.5px] text-slate-500 bg-slate-50 rounded-xl px-3 py-2 flex gap-2 leading-snug">
    {icon || <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />}<span>{children}</span>
  </p>
);

// Havolalar serverdan keladi (scraping/AI manbali) — faqat https va ma'lum saytlar (javascript:/data: XSS'dan himoya)
const SAFE_HOSTS = ['kaspi.kz', 'wildberries.ru', 'instagram.com', 't.me', 'uzum.uz'];
const safeUrl = (u?: string | null): string | undefined => {
  if (!u) return undefined;
  try {
    const x = new URL(u);
    if (x.protocol !== 'https:') return undefined;
    return SAFE_HOSTS.some((h) => x.hostname === h || x.hostname.endsWith('.' + h)) ? x.href : undefined;
  } catch { return undefined; }
};

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

export const BusinessAnalyzeView: React.FC<{ onBack: () => void; storeContext?: { businessId?: string } }> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();
  const lang: 'ru' | 'kk' = language === 'ru' ? 'ru' : 'kk';
  const L = T[lang];
  const businessId = storeContext?.businessId;
  const [state, setState] = useState<MarketState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Record<Exclude<keyof MarketWatch, 'auto'>, string>>({ keywords: '', kaspi: '', wb: '', uzum: '', instagram: '', telegram: '' });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [showWatch, setShowWatch] = useState(false);
  const poll = useRef<number | null>(null);
  const n = (v: number | null | undefined) => fmt(v, lang);

  const fillForm = (w: MarketWatch) =>
    setForm({
      keywords: w.keywords.join('\n'), kaspi: w.kaspi.join('\n'), wb: w.wb.join('\n'), uzum: w.uzum.join('\n'),
      instagram: w.instagram.map((u) => '@' + u).join('\n'), telegram: w.telegram.map((u) => '@' + u).join('\n'),
    });

  const load = async (quiet = false) => {
    if (!businessId) return;
    if (!quiet) setLoading(true);
    try {
      const s = await api.market(businessId);
      setState(s);
      setError('');
      if (!quiet) {
        fillForm(s.watch);
        if (!s.intel) setShowWatch(true);
      }
    } catch {
      setError(L.error);
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => { if (poll.current) window.clearInterval(poll.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  // Tahlil fonda ketayotganda har 6s holatni tekshiramiz
  useEffect(() => {
    if (state?.running && !poll.current) {
      poll.current = window.setInterval(() => load(true), 6000);
    } else if (!state?.running && poll.current) {
      window.clearInterval(poll.current);
      poll.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.running]);

  const refresh = async () => {
    if (!businessId) return;
    try {
      await api.marketRefresh(businessId);
      setState((s) => (s ? { ...s, running: true } : s));
    } catch (e: any) {
      setError(e?.message || L.error);
    }
  };

  const saveWatch = async () => {
    if (!businessId) return;
    setSaving(true);
    try {
      const { watch } = await api.marketWatch(businessId, {
        keywords: lines(form.keywords), kaspi: lines(form.kaspi), wb: lines(form.wb), uzum: lines(form.uzum),
        instagram: lines(form.instagram), telegram: lines(form.telegram),
      });
      fillForm(watch);
      setState((s) => (s ? { ...s, watch } : s));
      setSavedMsg(true);
      window.setTimeout(() => setSavedMsg(false), 2500);
    } catch (e: any) {
      setError(e?.message || L.error);
    } finally {
      setSaving(false);
    }
  };

  const intel = state?.intel;
  const rep = intel?.report || {};
  const src = intel?.data?.sources || {};
  const health = state?.health?.report;
  const verdictTone: Record<string, string> = {
    good: 'bg-emerald-50 border-emerald-200', ok: 'bg-amber-50 border-amber-200', bad: 'bg-rose-50 border-rose-200',
  };

  const ProductRow: React.FC<{ p: MarketProduct }> = ({ p }) => (
    <div className="p-2.5 rounded-xl bg-slate-50 space-y-1">
      <div className="flex items-start gap-2">
        <a href={safeUrl(p.link)} target="_blank" rel="noreferrer" className="text-[12px] font-bold text-slate-800 flex-1 leading-snug hover:text-purple-700">
          {p.title || p.id}{p.brand && p.brand !== 'Без бренда' ? ` · ${p.brand}` : ''}
        </a>
        {p.link && <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />}
      </div>
      {p.error ? <p className="text-[11px] text-slate-400">{L.notFound}</p> : (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
          {p.price != null && <span><b>{n(p.price)}</b> {p.currency === 'RUB' ? '₽' : '₸'}{p.old_price ? <s className="text-slate-400 ml-1">{n(p.old_price)}</s> : null}</span>}
          {p.rating != null && <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-500" />{p.rating}</span>}
          {p.reviews_total != null && <span>{L.reviews}: {n(p.reviews_total)}</span>}
          {p.reviews_7d != null && <span className="font-bold text-purple-700">{L.week(p.reviews_7d, p.reviews_7d_capped)}</span>}
          {!!p.reviews_30d && <span className="text-purple-700">{L.month(p.reviews_30d, p.reviews_30d_capped)}</span>}
          {!!p.min_week_revenue && <span className="font-bold text-emerald-700">{L.revWeek(`${n(p.min_week_revenue)} ${p.currency === 'RUB' ? '₽' : '₸'}`)}</span>}
          {p.discount_pct ? <span className="px-1.5 rounded bg-rose-100 text-rose-700 font-bold">−{p.discount_pct}%</span> : null}
          {p.reviews_growth != null && p.growth_days != null && <span className="text-emerald-700">{L.growth(p.reviews_growth, p.growth_days)}</span>}
          {(p.promos || []).map((x) => <span key={x} className="px-1.5 rounded bg-purple-100 text-purple-700 font-bold">{x}</span>)}
        </div>
      )}
      {p.complaints && p.complaints.length > 0 && (
        <details className="text-[11px]">
          <summary className="cursor-pointer text-rose-600 font-bold">{L.complaints} ({p.complaints.length})</summary>
          <Bullets items={p.complaints} color="bg-rose-400" />
        </details>
      )}
    </div>
  );

  const MarketBlock: React.FC<{ k: 'kaspi' | 'wb' }> = ({ k }) => {
    const ai = rep.marketplaces?.[k];
    return ai ? (
      <div className="space-y-2">
        {ai.summary && <p className="text-[12px] text-slate-700 leading-snug">{ai.summary}</p>}
        {ai.leaders && ai.leaders.length > 0 && (
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500">{L.leaders}</p>
            {ai.leaders.map((l, i) => (
              <div key={i} className="text-[12px] bg-purple-50/60 rounded-xl p-2">
                <p className="font-bold">{l.name}</p>
                {l.sales_signal && <p className="text-purple-700 font-semibold">{l.sales_signal}</p>}
                {l.revenue_signal && <p className="text-emerald-700 font-semibold">{l.revenue_signal}</p>}
                {l.why_sells && <p className="text-slate-600">{l.why_sells}</p>}
              </div>
            ))}
          </div>
        )}
        {ai.tactics && ai.tactics.length > 0 && (<><p className="text-[11px] font-bold text-slate-500">{L.tactics}</p><Bullets items={ai.tactics} color="bg-purple-400" /></>)}
      </div>
    ) : null;
  };

  const ks = intel?.data?.kaspi_summary;
  const igAccounts = (src.instagram?.accounts || []).filter((a): a is MarketIgAccount => typeof a === 'object');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-x-hidden font-sans text-slate-900 w-full max-w-full">
      <div className="bg-white border-b border-slate-200/80 px-3 py-2.5 shrink-0 w-full">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 active:scale-95">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5 flex-1">
            <Sparkles className="w-4 h-4 text-purple-600" />{L.title}
          </h1>
          <button onClick={refresh} disabled={!!state?.running || loading} title={L.refresh}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${state?.running ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-[10.5px] text-slate-400 mt-1.5">
          {intel ? `${L.updated}: ${fmtDate(intel.generated_at, lang)} · ${L.next}: ${fmtDate(intel.next_at, lang)}` : L.auto}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 w-full space-y-3 pb-16">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />{error}
          </div>
        )}
        {state?.running && (
          <div className="bg-purple-50 border border-purple-200 text-purple-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />{L.running}
          </div>
        )}
        {state?.last_error && !state.running && <Note icon={<AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}>{L.runError}</Note>}
        {!state && loading && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-purple-600 animate-spin" /></div>}

        {/* O'z biznes sog'lig'i */}
        {health && (
          <Card tone={verdictTone[health.verdict || ''] || 'bg-white border-slate-200/90'}
            title={<><HeartPulse className="w-4 h-4 text-rose-500" />{L.health}
              {health.verdict && <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-white/80 font-black">
                {health.verdict === 'good' ? L.good : health.verdict === 'bad' ? L.bad : L.ok}{health.score != null ? ` · ${health.score}/100` : ''}
              </span>}</>}>
            {health.headline && <p className="text-[12.5px] font-semibold leading-snug">{health.headline}</p>}
            {health.changes && health.changes.length > 0 && (<><p className="text-[11px] font-bold text-slate-500">{L.changes}</p><Bullets items={health.changes} /></>)}
            {health.problems && health.problems.length > 0 && (<><p className="text-[11px] font-bold text-slate-500 flex items-center gap-1"><TrendingDown className="w-3 h-3" />{L.problems}</p><Bullets items={health.problems} color="bg-rose-400" /></>)}
            {health.advice && health.advice.length > 0 && (
              <>
                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1"><Lightbulb className="w-3 h-3" />{L.advice}</p>
                <div className="space-y-1.5">
                  {health.advice.map((a, i) => (
                    <div key={i} className="bg-white/80 rounded-xl p-2 text-[12px]">
                      <p className="font-bold flex gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />{a.action}</p>
                      {a.why && <p className="text-slate-500 mt-0.5">{a.why}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        )}

        {!intel && !loading && !state?.running && <Note icon={<Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />}>{L.empty}</Note>}

        {intel && (
          <>
            {/* Umumiy xulosa va harakatlar */}
            <Card title={<><Swords className="w-4 h-4 text-purple-600" />{L.summary}</>}>
              {rep.summary && <p className="text-[12.5px] leading-snug">{rep.summary}</p>}
              {rep.actions && rep.actions.length > 0 && (
                <>
                  <p className="text-[11px] font-bold text-slate-500">{L.actions}</p>
                  <div className="space-y-1.5">
                    {rep.actions.map((a, i) => (
                      <div key={i} className="bg-purple-50/60 rounded-xl p-2.5 text-[12px] space-y-0.5">
                        <p className="font-bold">{i + 1}. {a.action}</p>
                        {a.why && <p className="text-slate-600"><b>{L.why}:</b> {a.why}</p>}
                        {a.expected && <p className="text-emerald-700"><b>{L.expected}:</b> {a.expected}</p>}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {rep.opportunities && rep.opportunities.length > 0 && (<><p className="text-[11px] font-bold text-slate-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{L.opps}</p><Bullets items={rep.opportunities} color="bg-emerald-500" /></>)}
            </Card>

            {rep.vs_us && rep.vs_us.length > 0 && (
              <Card title={<><Swords className="w-4 h-4 text-emerald-600" />{L.vsUs}</>}>
                <div className="space-y-2">
                  {rep.vs_us.map((d, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-2.5 space-y-1 text-[12px]">
                      {d.topic && <p className="text-[10.5px] font-black uppercase text-slate-400">{d.topic}</p>}
                      {d.them && <p className="text-slate-700"><b>{L.them}:</b> {d.them}</p>}
                      {d.us && <p className="text-slate-700"><b>{L.us}:</b> {d.us}</p>}
                      {d.our_move && <p className="text-emerald-700 font-semibold"><b>{L.ourMove}:</b> {d.our_move}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {rep.how_they_grow && rep.how_they_grow.length > 0 && (
              <Card title={<><TrendingUp className="w-4 h-4 text-purple-600" />{L.howGrow}</>}>
                <div className="space-y-1.5">
                  {rep.how_they_grow.map((g, i) => (
                    <div key={i} className="bg-purple-50/60 rounded-xl p-2.5 text-[12px]">
                      <p className="font-bold">{g.lever}{g.who ? <span className="ml-1.5 text-[10.5px] font-semibold text-slate-500">{g.who}</span> : null}</p>
                      {g.evidence && <p className="text-slate-600">{g.evidence}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {rep.content_ideas && rep.content_ideas.length > 0 && (
              <Card title={<><Lightbulb className="w-4 h-4 text-amber-500" />{L.ideas}</>}>
                <div className="space-y-1.5">
                  {rep.content_ideas.map((c, i) => (
                    <div key={i} className="bg-amber-50/70 rounded-xl p-2.5 text-[12px] space-y-0.5">
                      <p className="font-bold">{c.idea}</p>
                      {c.format && <p className="text-[10.5px] font-bold uppercase text-amber-700">{c.format}</p>}
                      {c.based_on && <p className="text-slate-600"><b>{L.basedOn}:</b> {c.based_on}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {rep.competitors && rep.competitors.length > 0 && (
              <Card title={<><Swords className="w-4 h-4 text-slate-600" />{L.competitors}</>}>
                <div className="space-y-2">
                  {rep.competitors.map((c, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-2.5 space-y-1.5">
                      <p className="text-[12.5px] font-black">{c.name}{c.platform ? <span className="ml-1.5 text-[10px] font-bold text-slate-400 uppercase">{c.platform}</span> : null}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div><p className="text-[10.5px] font-bold text-emerald-700">{L.strengths}</p><Bullets items={c.strengths} color="bg-emerald-500" /></div>
                        <div><p className="text-[10.5px] font-bold text-rose-600">{L.weaknesses}</p><Bullets items={c.weaknesses} color="bg-rose-400" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Kaspi */}
            <Card title={<><ShoppingBag className="w-4 h-4 text-rose-600" />{L.kaspi}</>}>
              <MarketBlock k="kaspi" />
              {ks?.market_median_price != null && (
                <div className="rounded-xl bg-rose-50/60 p-2.5 text-[11.5px] text-slate-700 space-y-0.5">
                  <p className="text-[11px] font-bold text-slate-500">{L.priceBox}</p>
                  <p>{L.median}: <b>{n(ks.market_median_price)} ₸</b> · {L.range}: {n(ks.market_min_price)}–{n(ks.market_max_price)} ₸</p>
                  {ks.our_median_price != null && (
                    <p>{L.yourPrice}: <b>{n(ks.our_median_price)} ₸</b> — <b className={ks.price_position === 'pricier' ? 'text-rose-600' : 'text-emerald-700'}>
                      {ks.price_position === 'cheaper' ? L.cheaper : ks.price_position === 'pricier' ? L.pricier : L.same}
                      {ks.our_vs_market_pct != null ? ` (${ks.our_vs_market_pct > 0 ? '+' : ''}${ks.our_vs_market_pct}%)` : ''}</b></p>
                  )}
                  <p>{ks.with_discount_pct != null && <>{L.withDisc}: <b>{ks.with_discount_pct}%</b> · </>}{ks.with_installment_pct != null && <>{L.withInst}: <b>{ks.with_installment_pct}%</b></>}</p>
                  {!!ks.min_week_sales_total && <p>{L.marketWeek} <b>{n(ks.min_week_sales_total)}</b>{ks.min_week_revenue_total ? <> · <b>{n(ks.min_week_revenue_total)} ₸</b></> : null}</p>}
                </div>
              )}
              {[...(src.kaspi?.tracked || []), ...(src.kaspi?.market_top || [])].map((p) => <ProductRow key={'k' + p.id} p={p} />)}
              <Note icon={<AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}>{L.salesNote}</Note>
            </Card>

            {/* Wildberries */}
            <Card title={<><ShoppingBag className="w-4 h-4 text-fuchsia-600" />{L.wb}</>}>
              <MarketBlock k="wb" />
              {(src.wb?.tracked || []).length ? (src.wb?.tracked || []).map((p) => <ProductRow key={'w' + p.id} p={p} />) : <Note>{L.noWb}</Note>}
            </Card>

            {/* Uzum */}
            <Card title={<><ShoppingBag className="w-4 h-4 text-violet-600" />{L.uzum}</>}>
              <Note>{L.uzumClosed}</Note>
            </Card>

            {/* Instagram */}
            <Card title={<><Instagram className="w-4 h-4 text-pink-600" />{L.ig}</>}>
              {src.instagram?.status === 'needs_facebook_login' && <Note>{L.igNeeds}</Note>}
              {src.instagram?.status === 'no_accounts' && <Note icon={<Instagram className="w-3.5 h-3.5 shrink-0 mt-0.5" />}>{L.igNone}</Note>}
              {rep.instagram?.summary && <p className="text-[12px] text-slate-700 leading-snug">{rep.instagram.summary}</p>}
              {igAccounts.map((a) => (
                <div key={a.username} className="rounded-xl bg-slate-50 p-2.5 space-y-1.5">
                  <a href={`https://instagram.com/${a.username}`} target="_blank" rel="noreferrer" className="text-[12.5px] font-black hover:text-pink-600">@{a.username}</a>
                  {a.error ? <p className="text-[11px] text-slate-400">{L.notFound}</p> : (
                    <>
                      <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-600">
                        <span>{L.followers}: <b>{n(a.followers)}</b></span>
                        {a.posts_per_week != null && <span><b>{a.posts_per_week}</b> {L.perWeek}</span>}
                        {a.reels_share != null && <span>{L.reels}: <b>{a.reels_share}%</b></span>}
                        {a.avg_er != null && <span>{L.er}: <b>{a.avg_er}%</b></span>}
                        {a.reels_per_week != null && <span><b>{a.reels_per_week}</b> {L.reelsWeek}</span>}
                        {a.avg_reel_views != null && <span>{L.avgReel}: <b>{n(a.avg_reel_views)}</b></span>}
                        {a.views_hidden && <span className="text-slate-400">{L.viewsHidden}</span>}
                      </div>
                      {(a.top_videos || []).length > 0 && <p className="text-[10.5px] font-bold text-slate-500">{L.topVideos}</p>}
                      {(a.top_videos || []).slice(0, 3).map((v, i) => (
                        <a key={i} href={safeUrl(v.permalink)} target="_blank" rel="noreferrer" className="flex gap-2 items-start text-[11.5px] bg-white rounded-lg p-1.5">
                          <Film className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                          <span className="flex-1 line-clamp-2 text-slate-700">{v.caption || '—'}</span>
                          <span className="shrink-0 font-bold text-right">{v.views ? <>▶ {n(v.views)}{v.vs_avg && v.vs_avg >= 1.5 ? <span className="text-emerald-600"> ×{v.vs_avg}</span> : null}<br /></> : null}♥ {n(v.likes)}</span>
                        </a>
                      ))}
                    </>
                  )}
                </div>
              ))}
              {rep.instagram?.genres && rep.instagram.genres.length > 0 && (
                <>
                  <p className="text-[11px] font-bold text-slate-500">{L.genres}</p>
                  <div className="space-y-1.5">
                    {rep.instagram.genres.map((g, i) => (
                      <div key={i} className="bg-pink-50/60 rounded-xl p-2.5 text-[12px] space-y-0.5">
                        <p className="font-bold">{g.genre}{g.count ? ` · ${g.count}` : ''}
                          {g.goal && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-pink-700">{g.goal === 'sales' ? L.forSales : g.goal === 'both' ? L.forBoth : L.forViews}</span>}
                          {safeUrl(g.example_link) && <a href={safeUrl(g.example_link)} target="_blank" rel="noreferrer" className="ml-1.5 inline-flex align-middle text-slate-400"><ExternalLink className="w-3 h-3" /></a>}</p>
                        {g.views_signal && <p className="text-purple-700 font-semibold">{g.views_signal}</p>}
                        {g.why_works && <p className="text-slate-600">{g.why_works}</p>}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {rep.instagram?.sales_videos && rep.instagram.sales_videos.length > 0 && (<><p className="text-[11px] font-bold text-slate-500">{L.salesVideos}</p><Bullets items={rep.instagram.sales_videos} color="bg-purple-400" /></>)}
              {rep.instagram?.not_working && rep.instagram.not_working.length > 0 && (<><p className="text-[11px] font-bold text-slate-500">{L.notWorking}</p><Bullets items={rep.instagram.not_working} color="bg-rose-400" /></>)}
              {rep.instagram?.video_patterns && rep.instagram.video_patterns.length > 0 && (<><p className="text-[11px] font-bold text-slate-500">{L.patterns}</p><Bullets items={rep.instagram.video_patterns} color="bg-pink-400" /></>)}
              {rep.instagram?.what_to_try && rep.instagram.what_to_try.length > 0 && (<><p className="text-[11px] font-bold text-slate-500">{L.tryIt}</p><Bullets items={rep.instagram.what_to_try} color="bg-emerald-500" /></>)}
            </Card>

            {/* Telegram */}
            <Card title={<><Send className="w-4 h-4 text-sky-600" />{L.tg}</>}>
              {src.telegram?.status === 'no_channels' && <Note icon={<Send className="w-3.5 h-3.5 shrink-0 mt-0.5" />}>{L.tgNone}</Note>}
              {rep.telegram?.summary && <p className="text-[12px] text-slate-700 leading-snug">{rep.telegram.summary}</p>}
              {(src.telegram?.channels || []).map((c) => (
                <div key={c.channel} className="rounded-xl bg-slate-50 p-2.5 space-y-1.5">
                  <a href={`https://t.me/${c.channel}`} target="_blank" rel="noreferrer" className="text-[12.5px] font-black hover:text-sky-600">@{c.channel}</a>
                  {c.error ? <p className="text-[11px] text-slate-400">{L.notFound}</p> : (
                    <>
                      <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-600">
                        <span>{L.subs}: <b>{n(c.subscribers)}</b></span>
                        <span><b>{c.posts_30d}</b> {L.posts30}</span>
                        <span>{L.avgViews}: <b>{n(c.avg_views)}</b></span>
                        {c.discount_avg_views != null && <span>{L.discountViews}: <b>{n(c.discount_avg_views)}</b></span>}
                        {c.posts_per_week != null && <span><b>{c.posts_per_week}</b> {L.perWeekTg}</span>}
                        {c.err_pct != null && <span>{L.err}: <b>{c.err_pct}%</b></span>}
                        {c.discount_lift != null && <span>{L.discLift}: <b>×{c.discount_lift}</b></span>}
                      </div>
                      {(c.discount_posts || []).length > 0 && <p className="text-[10.5px] font-bold text-slate-500">{L.discounts}</p>}
                      {(c.discount_posts || []).slice(0, 3).map((d, i) => (
                        <a key={i} href={safeUrl(d.link)} target="_blank" rel="noreferrer" className="block text-[11.5px] bg-white rounded-lg p-1.5 text-slate-700">
                          <span className="line-clamp-2">{d.text}</span>
                          <span className="text-[10.5px] text-slate-400">{d.date} · {n(d.views)}</span>
                        </a>
                      ))}
                    </>
                  )}
                </div>
              ))}
              {rep.telegram?.discount_tactics && rep.telegram.discount_tactics.length > 0 && <Bullets items={rep.telegram.discount_tactics} color="bg-sky-400" />}
              {rep.telegram?.sales_tactics && rep.telegram.sales_tactics.length > 0 && (<><p className="text-[11px] font-bold text-slate-500">{L.tgSales}</p><Bullets items={rep.telegram.sales_tactics} color="bg-emerald-500" /></>)}
            </Card>
          </>
        )}

        {state?.watch?.auto && (state.watch.auto.telegram.length > 0 || state.watch.auto.instagram.length > 0 || state.watch.auto.keywords.length > 0) && (
          <Card title={<><Sparkles className="w-4 h-4 text-purple-600" />{lang === 'kk' ? 'AI өзі тапқан бәсекелестер' : 'Конкуренты, которых AI нашёл сам'}</>}>
            {state.watch.auto.keywords.length > 0 && (
              <p className="text-[12px] text-slate-700"><b>Kaspi:</b> {state.watch.auto.keywords.join(' · ')}</p>
            )}
            {state.watch.auto.telegram.length > 0 && (
              <p className="text-[12px] text-slate-700 break-words"><b>Telegram:</b> {state.watch.auto.telegram.map((c) => '@' + c).join(', ')}</p>
            )}
            {state.watch.auto.instagram.length > 0 && (
              <p className="text-[12px] text-slate-700 break-words"><b>Instagram:</b> {state.watch.auto.instagram.map((c) => '@' + c).join(', ')}</p>
            )}
            <p className="text-[11px] text-slate-400 leading-snug">
              {lang === 'kk' ? 'Әр арна шынымен бар екені тексерілген. Тізім 14 күн сайын жаңарады; өз бәсекелестеріңізді төменде қосуға болады.'
                : 'Каждый канал проверен — он существует и активен. Список обновляется раз в 14 дней; своих конкурентов можно добавить ниже.'}
            </p>
          </Card>
        )}

        {/* Kuzatuv ro'yxati */}
        <div className="bg-white border border-slate-200/90 rounded-2xl">
          <button onClick={() => setShowWatch((v) => !v)} className="w-full flex items-center justify-between p-3.5 text-[13px] font-black">
            <span className="flex items-center gap-1.5"><Swords className="w-4 h-4 text-purple-600" />{L.watch}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showWatch ? 'rotate-180' : ''}`} />
          </button>
          {showWatch && (
            <div className="px-3.5 pb-3.5 space-y-2.5">
              <p className="text-[11px] text-slate-500">{L.watchHint}</p>
              {([['keywords', L.kw, 'платье женское'], ['kaspi', L.kaspiL, 'https://kaspi.kz/shop/p/...'], ['wb', L.wbL, 'https://www.wildberries.ru/catalog/123456/detail.aspx'],
                ['uzum', L.uzumL, 'https://uzum.uz/ru/product/...'], ['instagram', L.igL, '@competitor'], ['telegram', L.tgL, '@channel']] as const).map(([key, label, ph]) => (
                <label key={key} className="block space-y-1">
                  <span className="text-[11.5px] font-bold text-slate-700">{label}</span>
                  <textarea value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} rows={2} placeholder={ph}
                    className="w-full text-[12px] rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 outline-none focus:border-purple-400" />
                </label>
              ))}
              <div className="flex gap-2">
                <button onClick={saveWatch} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedMsg ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  {savedMsg ? L.saved : L.save}
                </button>
                <button onClick={async () => { await saveWatch(); await refresh(); }} disabled={!!state?.running || saving}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60">
                  <RefreshCw className={`w-3.5 h-3.5 ${state?.running ? 'animate-spin' : ''}`} />{L.refresh}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

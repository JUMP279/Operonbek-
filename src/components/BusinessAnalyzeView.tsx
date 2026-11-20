import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle, ArrowLeft, CheckCircle2, ChevronDown, Circle, ExternalLink, HeartPulse, Instagram, Lightbulb,
  ListChecks, Loader2, Lock, Megaphone, RefreshCw, Save, Send, ShoppingBag, Sparkles, Star, Swords, TrendingDown,
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
    verdictT: 'Где вы сейчас', aiFound: 'Каналы, найденные AI', tasks: 'Задачи на эту неделю', check: 'Как проверить',
    who: 'Кто ваши конкуренты', gaps: 'Где вы проигрываете', data: 'Подробные данные', adapt: 'Взять себе', adsLink: 'Их реклама сейчас',
    lvl: { direct: 'прямой', near: 'близкий', leader: 'пример', channel: 'канал' } as Record<string, string>,
    pos: { leader: 'вы впереди', middle: 'наравне', behind: 'вы отстаёте', unknown: 'мало данных' } as Record<string, string>,
    sales30: (n: number, capped?: boolean) => `≥${n}${capped ? '+' : ''} продаж/30 дн.`,
    vsYou: (p: number) => (p === 0 ? 'как у вас' : `${p > 0 ? '+' : ''}${p}% к вашей цене`),
    inst: 'рассрочка',
    where: { kaspi: 'Kaspi', wb: 'WB', instagram: 'Instagram', telegram: 'Telegram', card: 'Карточка', price: 'Цена', delivery: 'Доставка', reviews: 'Отзывы' } as Record<string, string>,
    topic: { price: 'Цена', reviews: 'Отзывы', delivery: 'Доставка', assortment: 'Ассортимент', content: 'Контент', channels: 'Каналы', trust: 'Доверие' } as Record<string, string>,
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
    verdictT: 'Қазір қай жердесіз', aiFound: 'AI өзі тапқан арналар', tasks: 'Осы аптаның тапсырмалары', check: 'Қалай тексеру',
    who: 'Бәсекелестеріңіз кім', gaps: 'Қай жерде ұтыласыз', data: 'Толық деректер', adapt: 'Өзіңізге алыңыз', adsLink: 'Қазіргі жарнамасы',
    lvl: { direct: 'тікелей', near: 'жақын', leader: 'үлгі', channel: 'арна' } as Record<string, string>,
    pos: { leader: 'сіз алдындасыз', middle: 'тең', behind: 'сіз артта қалдыңыз', unknown: 'дерек аз' } as Record<string, string>,
    sales30: (n: number, capped?: boolean) => `30 күнде ≥${n}${capped ? '+' : ''} сатылым`,
    vsYou: (p: number) => (p === 0 ? 'сіздікіндей' : `сіздің бағаңызға ${p > 0 ? '+' : ''}${p}%`),
    inst: 'бөліп төлеу',
    where: { kaspi: 'Kaspi', wb: 'WB', instagram: 'Instagram', telegram: 'Telegram', card: 'Карточка', price: 'Баға', delivery: 'Жеткізу', reviews: 'Пікірлер' } as Record<string, string>,
    topic: { price: 'Баға', reviews: 'Пікірлер', delivery: 'Жеткізу', assortment: 'Ассортимент', content: 'Контент', channels: 'Арналар', trust: 'Сенім' } as Record<string, string>,
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
const SAFE_HOSTS = ['kaspi.kz', 'wildberries.ru', 'instagram.com', 't.me', 'uzum.uz', 'facebook.com'];
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
  // Vazifalar "bajarildi" belgisi — shu hisobot uchun (yangi hisobot kelganda tozalanadi), faqat shu qurilmada
  const [done, setDone] = useState<Record<number, boolean>>({});
  const doneKey = `fl-market-done:${businessId || ''}:${state?.intel?.generated_at || ''}`;
  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(doneKey) || '{}') || {}); } catch { setDone({}); }
  }, [doneKey]);
  const toggleDone = (i: number) => setDone((d) => {
    const next = { ...d, [i]: !d[i] };
    try { localStorage.setItem(doneKey, JSON.stringify(next)); } catch { /* private rejim */ }
    return next;
  });
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
        if (!s.intel && !s.locked) setShowWatch(true);
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

  const ks = intel?.data?.kaspi_summary;
  const acts = (rep.actions || []).filter((a) => a.task || a.action).slice(0, 5);
  const comps = (rep.competitors || []).slice(0, 4);
  const gaps = (rep.gaps && rep.gaps.length ? rep.gaps : (rep.vs_us || []).map((d) => ({ topic: d.topic, them: d.them, us: d.us }))).slice(0, 3);
  const igAccounts = (src.instagram?.accounts || []).filter((a): a is MarketIgAccount => typeof a === 'object');

  if (state?.locked) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] font-sans text-slate-900 w-full">
        <div className="bg-white border-b border-slate-200/80 px-3 py-2.5 flex items-center gap-2">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="text-sm font-black flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-600" />{L.title}</h1>
        </div>
        <div className="p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center space-y-2">
            <p className="text-[14px] font-black">{lang === 'kk' ? 'Бизнес талдауы — Growth және Business тарифтерінде' : 'Анализ бизнеса — в тарифах Growth и Business'}</p>
            <p className="text-[12px] text-slate-600 leading-snug">{lang === 'kk'
              ? 'FindLead Kaspi, WB, Instagram және Telegram-дағы бәсекелестерді бақылап, бизнесіңіздің жағдайын бағалайды. «Тариф» бөлімінен қосыңыз.'
              : 'FindLead будет следить за конкурентами на Kaspi, WB, в Instagram и Telegram и оценивать состояние бизнеса. Подключите в разделе «Тариф».'}</p>
          </div>
        </div>
      </div>
    );
  }

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
                        {health.problems && health.problems.length > 0 && (<><p className="text-[11px] font-bold text-slate-500 flex items-center gap-1"><TrendingDown className="w-3 h-3" />{L.problems}</p><Bullets items={health.problems.slice(0, 2)} color="bg-rose-400" /></>)}
            {health.advice && health.advice.length > 0 && (
              <>
                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1"><Lightbulb className="w-3 h-3" />{L.advice}</p>
                <div className="space-y-1.5">
                  {health.advice.slice(0, 3).map((a, i) => (
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
            {/* 1. Qayerdamiz — 1-2 gap */}
            {(rep.verdict || rep.summary) && (
              <Card title={<><Swords className="w-4 h-4 text-purple-600" />{L.verdictT}
                {rep.position && L.pos[rep.position] && <span className="ml-auto text-[10.5px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-black">{L.pos[rep.position]}</span>}</>}>
                <p className="text-[12.5px] leading-snug">{rep.verdict || rep.summary}</p>
              </Card>
            )}

            {/* 2. Shu hafta nima qilish kerak — belgilanadigan ro'yxat */}
            {acts.length > 0 && (
              <Card title={<><ListChecks className="w-4 h-4 text-emerald-600" />{L.tasks}
                <span className="ml-auto text-[10.5px] font-black text-slate-400">{acts.filter((_, i) => done[i]).length}/{acts.length}</span></>}>
                <div className="space-y-1.5">
                  {acts.map((a, i) => (
                    <div key={i} className={`rounded-xl p-2.5 text-[12px] space-y-1 ${done[i] ? 'bg-slate-50 opacity-60' : 'bg-emerald-50/60'}`}>
                      <button onClick={() => toggleDone(i)} className="w-full text-left flex gap-2 items-start">
                        {done[i] ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-px" /> : <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-px" />}
                        <span className={`flex-1 font-bold leading-snug ${done[i] ? 'line-through' : ''}`}>{a.task || a.action}</span>
                        {a.where && L.where[a.where] && <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-slate-500">{L.where[a.where]}</span>}
                      </button>
                      {!done[i] && a.why && <p className="text-slate-600 pl-6 leading-snug">{a.why}</p>}
                      {!done[i] && (a.check || a.expected) && <p className="text-emerald-700 pl-6 leading-snug"><b>{L.check}:</b> {a.check || a.expected}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 3. Raqobatchilar — 3-4 ta: raqamlar, nega sotadi, zaif joyi */}
            {comps.length > 0 && (
              <Card title={<><Swords className="w-4 h-4 text-slate-600" />{L.who}</>}>
                <div className="space-y-2">
                  {comps.map((c, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-2.5 space-y-1">
                      <div className="flex items-start gap-1.5">
                        {safeUrl(c.link) ? (
                          <a href={safeUrl(c.link)} target="_blank" rel="noreferrer" className="text-[12.5px] font-black leading-snug flex-1 hover:text-purple-700">{c.name}</a>
                        ) : <p className="text-[12.5px] font-black leading-snug flex-1">{c.name}</p>}
                        {c.level && L.lvl[c.level] && <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-slate-500">{L.lvl[c.level]}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[11px] text-slate-600">
                        {c.platform && <span className="uppercase font-bold text-slate-400">{c.platform}</span>}
                        {c.shop && <span className="font-semibold text-slate-700">{c.shop}</span>}
                        {c.price != null && <span><b>{n(c.price)} ₸</b>{c.price_vs_ours_pct != null && <span className={c.price_vs_ours_pct > 0 ? 'text-rose-600' : 'text-emerald-700'}> ({L.vsYou(c.price_vs_ours_pct)})</span>}</span>}
                        {c.rating != null && <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-500" />{c.rating}</span>}
                        {c.reviews_total != null && <span>{L.reviews}: {n(c.reviews_total)}</span>}
                        {!!c.reviews_30d && <span className="font-bold text-purple-700">{L.sales30(c.reviews_30d, c.reviews_30d_capped)}</span>}
                        {c.installment && <span>{L.inst}</span>}
                      </div>
                      {(c.strong || c.strengths?.[0]) && <p className="text-[12px] text-slate-700 leading-snug"><b className="text-emerald-700">+</b> {c.strong || c.strengths?.[0]}</p>}
                      {(c.weak || c.weaknesses?.[0]) && <p className="text-[12px] text-slate-700 leading-snug"><b className="text-rose-600">−</b> {c.weak || c.weaknesses?.[0]}</p>}
                      {c.adapt && <p className="text-[12px] text-purple-700 leading-snug"><b>{L.adapt}:</b> {c.adapt}</p>}
                      {safeUrl(c.ads_url) && (
                        <a href={safeUrl(c.ads_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700">
                          <Megaphone className="w-3 h-3" />{L.adsLink}<ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 4. Qayerda yutqazyapmiz — max 3 qator */}
            {gaps.length > 0 && (
              <Card title={<><TrendingDown className="w-4 h-4 text-rose-500" />{L.gaps}</>}>
                <div className="space-y-1.5">
                  {gaps.map((g, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-2.5 text-[12px] space-y-0.5">
                      {g.topic && <p className="text-[10.5px] font-black uppercase text-slate-400">{L.topic[g.topic] || g.topic}</p>}
                      {g.them && <p className="text-slate-700"><b>{L.them}:</b> {g.them}</p>}
                      {g.us && <p className="text-slate-700"><b>{L.us}:</b> {g.us}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 5. Xom ma'lumotlar — yopiq holda */}
            <details className="bg-white border border-slate-200/90 rounded-2xl group">
              <summary className="cursor-pointer list-none flex items-center justify-between p-3.5 text-[13px] font-black">
                <span className="flex items-center gap-1.5"><ShoppingBag className="w-4 h-4 text-slate-500" />{L.data}</span>
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-3.5 pb-3.5 space-y-2.5">
                {ks?.market_median_price != null && (
                  <div className="rounded-xl bg-rose-50/60 p-2.5 text-[11.5px] text-slate-700 space-y-0.5">
                    <p className="text-[11px] font-bold text-slate-500">{L.priceBox}</p>
                    <p>{L.median}: <b>{n(ks.market_median_price)} ₸</b> · {L.range}: {n(ks.market_min_price)}–{n(ks.market_max_price)} ₸</p>
                    {ks.our_median_price != null && (
                      <p>{L.yourPrice}: <b>{n(ks.our_median_price)} ₸</b> — <b className={ks.price_position === 'pricier' ? 'text-rose-600' : 'text-emerald-700'}>
                        {ks.price_position === 'cheaper' ? L.cheaper : ks.price_position === 'pricier' ? L.pricier : L.same}
                        {ks.our_vs_market_pct != null ? ` (${ks.our_vs_market_pct > 0 ? '+' : ''}${ks.our_vs_market_pct}%)` : ''}</b></p>
                    )}
                  </div>
                )}
                {[...(src.kaspi?.tracked || []), ...(src.kaspi?.market_top || [])].map((p) => <ProductRow key={'k' + p.id} p={p} />)}
                {(src.wb?.tracked || []).map((p) => <ProductRow key={'w' + p.id} p={p} />)}
                {igAccounts.filter((a) => !a.error).map((a) => (
                  <p key={a.username} className="text-[11.5px] text-slate-600"><Instagram className="inline w-3 h-3 text-pink-600 mr-1" />
                    <b>@{a.username}</b> · {L.followers}: {n(a.followers)}{a.reels_per_week != null ? ` · ${a.reels_per_week} ${L.reelsWeek}` : ''}{a.avg_reel_views != null ? ` · ${L.avgReel}: ${n(a.avg_reel_views)}` : ''}</p>
                ))}
                {(src.telegram?.channels || []).filter((c) => !c.error).map((c) => (
                  <p key={c.channel} className="text-[11.5px] text-slate-600"><Send className="inline w-3 h-3 text-sky-600 mr-1" />
                    <b>@{c.channel}</b> · {L.subs}: {n(c.subscribers)}{c.posts_per_week != null ? ` · ${c.posts_per_week} ${L.perWeekTg}` : ''} · {L.avgViews}: {n(c.avg_views)}</p>
                ))}
                {src.instagram?.status === 'needs_facebook_login' && <Note>{L.igNeeds}</Note>}
                <Note icon={<AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}>{L.salesNote}</Note>
                {state?.watch?.auto && (state.watch.auto.telegram.length > 0 || state.watch.auto.instagram.length > 0) && (
                  <p className="text-[11px] text-slate-500 break-words">
                    <Sparkles className="inline w-3 h-3 text-purple-600 mr-1" />{L.aiFound}: {[...state.watch.auto.telegram, ...state.watch.auto.instagram].map((c) => '@' + c).join(', ')}
                  </p>
                )}
              </div>
            </details>
          </>
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

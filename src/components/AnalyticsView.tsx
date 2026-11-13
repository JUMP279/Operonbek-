import React, { useEffect, useState } from 'react';
import {
  AlertCircle, ArrowLeft, BarChart3, Eye, ExternalLink, Film, Instagram, Loader2,
  MessagesSquare, MousePointerClick, RefreshCw, Send, Users,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, Analytics, AnalyticsTopItem } from '../lib/api';

// Analitika — REAL (2026-11-08). Instagram Graph API + Telegram kanal sahifasi + o'z bazamiz.
// Avval to'qima raqamli doiraviy grafiklar edi.
const T = {
  ru: {
    title: 'Аналитика', d7: '7 дней', d30: '30 дней', d90: '90 дней', refresh: 'Обновить',
    views: 'Просмотры', videoViews: 'Просмотры видео', postViews: 'Просмотры постов', profile: 'Заходы в профиль',
    people: 'Клиентов в диалогах', newPeople: 'новых', followers: 'Подписчики', reach: 'Охват',
    published: 'Опубликовано', posts: 'Постов', videos: 'Видео', upcoming: 'в плане', failed: 'не вышло',
    funnel: 'Воронка', fViews: 'Просмотры', fProfile: 'Заходы в профиль', fChats: 'Диалоги', fLeads: 'Заявки', fOrders: 'Заказы',
    activity: 'Активность по дням', mPosts: 'Посты', mVideos: 'Видео', mChats: 'Диалоги', mOrders: 'Заказы',
    ig: 'Instagram', tg: 'Telegram', notConnected: 'Не подключён — подключите в профиле.',
    igBroken: 'Доступ к Instagram потерян — переподключите Instagram в профиле.',
    insightsDenied: 'Instagram не даёт доступ к статистике (просмотры, охват). Подключите Instagram заново и разрешите доступ к статистике.',
    reconnect: 'Подключить заново',
    tgPrivate: 'Канал закрытый — Telegram не показывает просмотры закрытых каналов.',
    engaged: 'Вовлечённые аккаунты', interactions: 'Взаимодействия', likes: 'Лайки', comments: 'Комментарии', saves: 'Сохранения', shares: 'Репосты',
    avgViews: 'Средние просмотры', top: 'Лучшие публикации', igLimit: (d: number) => `Данные аккаунта Instagram — за последние ${d} дн. (ограничение Meta)`,
    chats: 'Диалоги с клиентами', custMsgs: 'Сообщений от клиентов', aiReplies: 'Ответов AI', yourReplies: 'Ваших ответов',
    comments2: 'Комментарии Instagram', direct: 'Instagram Direct', telegram: 'Telegram',
    sales: 'Продажи', orders: 'Заказы', inquiries: 'Заявки', revenue: 'Выручка', conversion: 'Конверсия заявка → заказ',
    avgCheck: 'Средний чек', buyers: 'Покупателей', products: 'Активных товаров',
    error: 'Не удалось загрузить аналитику', empty: '—',
  },
  kk: {
    title: 'Аналитика', d7: '7 күн', d30: '30 күн', d90: '90 күн', refresh: 'Жаңарту',
    views: 'Қаралымдар', videoViews: 'Бейне қаралымы', postViews: 'Пост қаралымы', profile: 'Профильге кіру',
    people: 'Диалогтағы клиенттер', newPeople: 'жаңа', followers: 'Жазылушылар', reach: 'Қамту',
    published: 'Жарияланды', posts: 'Пост', videos: 'Бейне', upcoming: 'жоспарда', failed: 'шықпады',
    funnel: 'Воронка', fViews: 'Қаралымдар', fProfile: 'Профильге кіру', fChats: 'Диалогтар', fLeads: 'Өтінімдер', fOrders: 'Тапсырыстар',
    activity: 'Күндер бойынша белсенділік', mPosts: 'Посттар', mVideos: 'Бейнелер', mChats: 'Диалогтар', mOrders: 'Тапсырыстар',
    ig: 'Instagram', tg: 'Telegram', notConnected: 'Қосылмаған — профильде қосыңыз.',
    igBroken: 'Instagram-ға қолжетімділік жоғалды — профильде Instagram-ды қайта қосыңыз.',
    insightsDenied: 'Instagram статистикаға (қаралым, қамту) рұқсат бермей тұр. Instagram-ды қайта қосып, статистикаға рұқсат беріңіз.',
    reconnect: 'Қайта қосу',
    tgPrivate: 'Арна жабық — Telegram жабық арналардың қаралымын көрсетпейді.',
    engaged: 'Белсенді аккаунттар', interactions: 'Әрекеттер', likes: 'Лайктар', comments: 'Пікірлер', saves: 'Сақтаулар', shares: 'Бөлісулер',
    avgViews: 'Орташа қаралым', top: 'Үздік жарияланымдар', igLimit: (d: number) => `Instagram аккаунт деректері — соңғы ${d} күн (Meta шектеуі)`,
    chats: 'Клиенттермен диалогтар', custMsgs: 'Клиент хабарлары', aiReplies: 'AI жауаптары', yourReplies: 'Сіздің жауаптарыңыз',
    comments2: 'Instagram пікірлері', direct: 'Instagram Direct', telegram: 'Telegram',
    sales: 'Сатылым', orders: 'Тапсырыстар', inquiries: 'Өтінімдер', revenue: 'Түсім', conversion: 'Өтінім → тапсырыс конверсиясы',
    avgCheck: 'Орташа чек', buyers: 'Сатып алушылар', products: 'Белсенді тауарлар',
    error: 'Аналитика жүктелмеді', empty: '—',
  },
};

type Metric = 'posts' | 'videos' | 'conversations';

const fmt = (n: number | null | undefined, lang: string) =>
  n === null || n === undefined ? '—' : new Intl.NumberFormat(lang === 'kk' ? 'kk-KZ' : 'ru-RU', { notation: n >= 100000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n);

const Card: React.FC<{ title?: React.ReactNode; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5">
    {title && <h3 className="text-[13px] font-black flex items-center gap-1.5">{title}</h3>}
    {children}
  </div>
);

const Tile: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string }> = ({ icon, label, value, sub }) => (
  <div className="bg-white border border-slate-200/90 rounded-2xl p-3">
    <p className="text-[10.5px] font-bold text-slate-500 flex items-center gap-1">{icon}{label}</p>
    <p className="text-[20px] font-black tracking-tight mt-0.5">{value}</p>
    {sub && <p className="text-[10.5px] text-slate-400">{sub}</p>}
  </div>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between text-[12px] py-1 border-b border-slate-100 last:border-0">
    <span className="text-slate-600">{label}</span><span className="font-bold">{value}</span>
  </div>
);

export const AnalyticsView: React.FC<{ onBack: () => void; storeContext?: { businessId?: string; currency?: string } }> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();
  const lang: 'ru' | 'kk' = language === 'ru' ? 'ru' : 'kk';
  const L = T[lang];
  const businessId = storeContext?.businessId;
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metric, setMetric] = useState<Metric>('posts');
  const [hover, setHover] = useState<number | null>(null);

  // Statistika ruxsati yo'q bo'lsa — shu yerning o'zidan qayta ulash (popup blokerdan qochish uchun oyna darhol ochiladi)
  const reconnectIg = async () => {
    if (!businessId) return;
    const win = window.open('', '_blank');
    try {
      const { login_url } = await api.instagramLink(businessId);
      if (win) win.location.href = login_url; else window.location.href = login_url;
    } catch {
      win?.close();
    }
  };

  const load = async (refresh = false) => {
    if (!businessId) return;
    setLoading(true);
    setError('');
    try {
      setData(await api.analytics(businessId, days, refresh));
    } catch {
      setError(L.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, days]);

  const n = (v: number | null | undefined) => fmt(v, lang);
  const ig = data?.instagram;
  const tg = data?.telegram;
  const funnel = data ? [
    { label: L.fViews, v: data.totals.views },
    { label: L.fProfile, v: data.totals.profile_visits ?? null },
    { label: L.fChats, v: data.conversations.people },
  ] : [];
  const fMax = Math.max(1, ...funnel.map((f) => f.v || 0));

  const series = data?.series || [];
  const sMax = Math.max(1, ...series.map((d) => d[metric]));

  const TopList: React.FC<{ items?: AnalyticsTopItem[] }> = ({ items }) =>
    items && items.length ? (
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold text-slate-500">{L.top}</p>
        {items.map((it) => (
          <a key={String(it.id)} href={it.permalink} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100">
            {it.type === 'video' ? <Film className="w-3.5 h-3.5 text-purple-600 shrink-0" /> : <BarChart3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            <span className="text-[11.5px] text-slate-700 truncate flex-1">{it.caption || it.text || '—'}</span>
            <span className="text-[11.5px] font-bold flex items-center gap-1 shrink-0"><Eye className="w-3 h-3" />{n(it.views ?? 0)}</span>
            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
          </a>
        ))}
      </div>
    ) : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-x-hidden font-sans text-slate-900 w-full max-w-full">
      <div className="bg-white border-b border-slate-200/80 px-3 py-2.5 shrink-0 w-full">
        <div className="flex items-center gap-2">
          <button onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 active:scale-95">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5 flex-1">
            <BarChart3 className="w-4 h-4 text-purple-600" />{L.title}
          </h1>
          <button onClick={() => load(true)} disabled={loading} title={L.refresh}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-1.5 mt-2.5">
          {([[7, L.d7], [30, L.d30], [90, L.d90]] as const).map(([d, label]) => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${days === d ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 w-full space-y-3 pb-16">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />{error}
          </div>
        )}
        {!data && loading && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-purple-600 animate-spin" /></div>}

        {data && (
          <div className={`space-y-3 ${loading ? 'opacity-60' : ''}`}>
            {/* Asosiy raqamlar */}
            <div className="grid grid-cols-2 gap-2">
              <Tile icon={<Eye className="w-3 h-3" />} label={L.views} value={n(data.totals.views)}
                sub={`${L.postViews}: ${n(data.totals.post_views)}`} />
              <Tile icon={<Film className="w-3 h-3" />} label={L.videoViews} value={n(data.totals.video_views)} />
              <Tile icon={<MousePointerClick className="w-3 h-3" />} label={L.profile} value={n(data.totals.profile_visits)} />
              <Tile icon={<MessagesSquare className="w-3 h-3" />} label={L.people} value={n(data.conversations.people)}
                sub={`${n(data.conversations.new_people)} ${L.newPeople}`} />
              <Tile icon={<BarChart3 className="w-3 h-3" />} label={`${L.published}: ${L.posts}`} value={n(data.content.posts_published)}
                sub={`${n(data.content.upcoming)} ${L.upcoming}`} />
              <Tile icon={<Film className="w-3 h-3" />} label={`${L.published}: ${L.videos}`} value={n(data.content.videos_published)}
                sub={data.content.failed ? `${data.content.failed} ${L.failed}` : undefined} />
              <Tile icon={<Users className="w-3 h-3" />} label={L.followers} value={n(data.totals.followers)} />
            </div>

            {/* Voronka */}
            <Card title={L.funnel}>
              {funnel.map((f) => (
                <div key={f.label} className="space-y-0.5">
                  <div className="flex justify-between text-[11.5px]"><span className="text-slate-600">{f.label}</span><span className="font-bold">{n(f.v)}</span></div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-600" style={{ width: `${f.v ? Math.max(2, (f.v / fMax) * 100) : 0}%` }} />
                  </div>
                </div>
              ))}
            </Card>

            {/* Kunlik faollik — bitta qator, ko'rsatkich tanlanadi */}
            <Card title={L.activity}>
              <div className="flex flex-wrap gap-1.5">
                {([['posts', L.mPosts], ['videos', L.mVideos], ['conversations', L.mChats]] as const).map(([m, label]) => (
                  <button key={m} onClick={() => setMetric(m)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${metric === m ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="relative h-32 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
                {series.map((d, i) => (
                  <div key={d.date} className="flex-1 h-full flex items-end cursor-pointer" onMouseEnter={() => setHover(i)} onClick={() => setHover(i)}>
                    <div className={`w-full rounded-t-[4px] ${hover === i ? 'bg-purple-800' : 'bg-purple-500'}`}
                      style={{ height: d[metric] ? `${Math.max(4, (d[metric] / sMax) * 100)}%` : '2px', opacity: d[metric] ? 1 : 0.25 }} />
                  </div>
                ))}
                {hover !== null && series[hover] && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold px-2 py-1 rounded-lg pointer-events-none">
                    {new Date(series[hover].date).toLocaleDateString(lang === 'kk' ? 'kk-KZ' : 'ru-RU', { day: 'numeric', month: 'short' })}: {series[hover][metric]}
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{series[0] && new Date(series[0].date).toLocaleDateString(lang === 'kk' ? 'kk-KZ' : 'ru-RU', { day: 'numeric', month: 'short' })}</span>
                <span>{series.length > 0 && new Date(series[series.length - 1].date).toLocaleDateString(lang === 'kk' ? 'kk-KZ' : 'ru-RU', { day: 'numeric', month: 'short' })}</span>
              </div>
            </Card>

            {/* Instagram */}
            <Card title={<><Instagram className="w-4 h-4 text-pink-600" />{L.ig}{ig?.username ? ` · @${ig.username}` : ''}</>}>
              {!ig?.connected && <p className="text-[12px] text-slate-500">{L.notConnected}</p>}
              {ig?.connected && ig.error && <p className="text-[12px] text-rose-600 font-semibold">{L.igBroken}</p>}
              {ig?.connected && !ig.error && ig.insights_denied && (
                <div className="text-[11.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mb-2 space-y-1.5">
                  <p>{L.insightsDenied}</p>
                  <button onClick={reconnectIg}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold active:scale-95">{L.reconnect}</button>
                </div>
              )}
              {ig?.connected && !ig.error && (
                <>
                  <div className="grid grid-cols-2 gap-x-4">
                    <Row label={L.followers} value={n(ig.followers_count)} />
                    <Row label={L.reach} value={n(ig.account?.reach)} />
                    <Row label={L.views} value={n(ig.account?.views)} />
                    <Row label={L.profile} value={n(ig.account?.profile_views)} />
                    <Row label={L.engaged} value={n(ig.account?.accounts_engaged)} />
                    <Row label={L.interactions} value={n(ig.account?.total_interactions)} />
                    <Row label={`${L.postViews} (${ig.media?.posts ?? 0})`} value={n(ig.media?.post_views)} />
                    <Row label={`${L.videoViews} (${ig.media?.videos ?? 0})`} value={n(ig.media?.video_views)} />
                    <Row label={L.likes} value={n(ig.media?.likes)} />
                    <Row label={L.comments} value={n(ig.media?.comments)} />
                    <Row label={L.saves} value={n(ig.media?.saved)} />
                    <Row label={L.shares} value={n(ig.media?.shares)} />
                  </div>
                  {ig.account_days !== undefined && ig.account_days < days && (
                    <p className="text-[10.5px] text-slate-400">{L.igLimit(ig.account_days)}</p>
                  )}
                  <TopList items={ig.top} />
                </>
              )}
            </Card>

            {/* Telegram */}
            <Card title={<><Send className="w-4 h-4 text-sky-600" />{L.tg}{tg?.url ? ` · @${tg.url.split('/').pop()}` : ''}</>}>
              {!tg?.connected && <p className="text-[12px] text-slate-500">{L.notConnected}</p>}
              {tg?.connected && (
                <>
                  <div className="grid grid-cols-2 gap-x-4">
                    <Row label={L.followers} value={n(tg.subscribers)} />
                    <Row label={L.views} value={n(tg.views)} />
                    <Row label={`${L.postViews} (${tg.posts ?? 0})`} value={n(tg.post_views)} />
                    <Row label={`${L.videoViews} (${tg.videos ?? 0})`} value={n(tg.video_views)} />
                    <Row label={L.avgViews} value={n(tg.avg_views)} />
                  </div>
                  {tg.views_error === 'private' && <p className="text-[11px] text-slate-500">{L.tgPrivate}</p>}
                  <TopList items={tg.top} />
                </>
              )}
            </Card>

            {/* Suhbatlar */}
            <Card title={<><MessagesSquare className="w-4 h-4 text-purple-600" />{L.chats}</>}>
              <Row label={L.people} value={`${n(data.conversations.people)} (${n(data.conversations.new_people)} ${L.newPeople})`} />
              <Row label={L.comments2} value={n(data.conversations.by_platform.instagram_comment ?? 0)} />
              <Row label={L.direct} value={n(data.conversations.by_platform.instagram ?? 0)} />
              <Row label={L.telegram} value={n(data.conversations.by_platform.telegram ?? 0)} />
              <Row label={L.custMsgs} value={n(data.conversations.customer_messages)} />
              <Row label={L.aiReplies} value={n(data.conversations.ai_replies)} />
              <Row label={L.yourReplies} value={n(data.conversations.operator_replies)} />
            </Card>

          </div>
        )}
      </div>
    </div>
  );
};

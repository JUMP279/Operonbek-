import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Instagram,
  Library,
  Loader2,
  PenSquare,
  RefreshCw,
  Send,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { NicheGate } from './NicheGate';
import { PostPlanPanel } from './PostPlanPanel';
import { api, ApiError, GeneratedPost, PostPlatform, PostRow, PublishResult, PublishTarget } from '../lib/api';

export interface AIPostGeneratorViewProps {
  onBack: () => void;
  storeContext?: { businessId?: string };
}

type Tab = 'plan' | 'create' | 'journal';
type Style = 'reklama' | 'jalb' | 'malumot';

const T = {
  ru: {
    back: 'Назад', title: 'AI пост', plan: 'План', create: 'Создать', journal: 'Запланированные',
    where: 'Куда публиковать',
    igNot: 'Instagram не подключён', tgNot: 'Telegram-канал не подключён',
    both: 'Оба',
    topic: 'О чём пост?', topicPh: 'Например: новое поступление, акция на выходные… Можно оставить пустым — AI выберет сам.',
    style: 'Стиль', styles: { reklama: 'Реклама', jalb: 'Вовлечение', malumot: 'Полезное' } as Record<Style, string>,
    generate: 'Сгенерировать пост', generating: 'AI пишет пост…',
    preview: 'Пост', text: 'Текст', tags: 'Хэштеги (через пробел)',
    publish: 'Опубликовать', publishing: 'Публикуем…', again: 'Другой вариант', copy: 'Копировать', copied: 'Скопировано',
    published: 'Опубликовано', failed: 'Не опубликовано', draft: 'Черновик', scheduled: 'Запланирован',
    openPost: 'Открыть пост', openChannel: 'Открыть канал', openProfile: 'Открыть профиль',
    noImageIg: 'Для Instagram нужна картинка — AI не смог её создать.',
    resultTitle: 'Результат публикации', newPost: 'Новый пост',
    empty: 'Запланированных постов нет', loading: 'Загрузка…',
    errors: { network: 'Нет связи с сервером', generic: 'Что-то пошло не так. Попробуйте ещё раз.', limit: 'Лимит постов по тарифу исчерпан' },
  },
  kk: {
    back: 'Артқа', title: 'AI пост', plan: 'Жоспар', create: 'Жасау', journal: 'Жоспарланған',
    where: 'Қайда жариялау',
    igNot: 'Instagram қосылмаған', tgNot: 'Telegram-арна қосылмаған',
    both: 'Екеуі де',
    topic: 'Пост не туралы?', topicPh: 'Мысалы: жаңа тауар, демалыс күнгі акция… Бос қалдыруға болады — AI өзі таңдайды.',
    style: 'Стиль', styles: { reklama: 'Жарнама', jalb: 'Тартымды', malumot: 'Пайдалы' } as Record<Style, string>,
    generate: 'Пост жасау', generating: 'AI пост жазуда…',
    preview: 'Пост', text: 'Мәтін', tags: 'Хэштегтер (бос орын арқылы)',
    publish: 'Жариялау', publishing: 'Жариялануда…', again: 'Басқа нұсқа', copy: 'Көшіру', copied: 'Көшірілді',
    published: 'Жарияланды', failed: 'Жарияланбады', draft: 'Жоба', scheduled: 'Жоспарланған',
    openPost: 'Постты ашу', openChannel: 'Арнаны ашу', openProfile: 'Профильді ашу',
    noImageIg: 'Instagram үшін сурет керек — AI оны жасай алмады.',
    resultTitle: 'Жариялау нәтижесі', newPost: 'Жаңа пост',
    empty: 'Жоспарланған пост жоқ', loading: 'Жүктелуде…',
    errors: { network: 'Сервермен байланыс жоқ', generic: 'Бірдеңе дұрыс болмады. Қайталап көріңіз.', limit: 'Тариф бойынша пост лимиті бітті' },
  },
};

function when(iso: string | null | undefined, lang: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(lang === 'kk' ? 'kk-KZ' : 'ru-RU', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function tgLabel(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/t\.me\/([^/?#]+)/i);
  return m ? '@' + m[1] : url;
}

export const AIPostGeneratorView: React.FC<AIPostGeneratorViewProps> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();
  const lang: 'ru' | 'kk' = language === 'ru' ? 'ru' : 'kk';
  const L = T[lang];
  const businessId = storeContext?.businessId;

  const [tab, setTab] = useState<Tab>('plan');
  const [error, setError] = useState('');

  // ulangan kanallar
  const [igUser, setIgUser] = useState<string | null>(null);
  const [igOn, setIgOn] = useState(false);
  const [tgUrl, setTgUrl] = useState<string | null>(null);

  // forma
  const [platform, setPlatform] = useState<PostPlatform>('both');
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<Style>('reklama');
  const [generating, setGenerating] = useState(false);

  // natija
  const [post, setPost] = useState<GeneratedPost | null>(null);
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [copied, setCopied] = useState(false);

  const [needsNiche, setNeedsNiche] = useState(false);

  // jurnal
  const [posts, setPosts] = useState<PostRow[] | null>(null);

  const errText = (e: unknown) => {
    if (e instanceof ApiError) {
      if (e.status === 0) return L.errors.network;
      // backend detail o'zbekcha bo'lishi mumkin — UI faqat kk/ru, shuning uchun o'z matnimiz
      if (e.status === 429) return L.errors.limit;
    }
    return L.errors.generic;
  };

  useEffect(() => {
    if (!businessId) return;
    api.brand(businessId).then((b) => setNeedsNiche(b.needs_niche)).catch(() => {});
    api.instagramStatus(businessId)
      .then((s) => {
        const igOk = s.connected && s.healthy !== false;
        setIgOn(igOk);
        setIgUser(s.username);
        setTgUrl(s.telegram_url || null);
        // Faqat ulangan kanalni sukut qilib tanlaymiz
        if (igOk && !s.telegram_url) setPlatform('instagram');
        else if (!igOk && s.telegram_url) setPlatform('telegram');
      })
      .catch(() => {});
  }, [businessId]);

  const loadPosts = async () => {
    if (!businessId) return;
    try {
      // Faqat CHIQISHI kutilayotgan (rejalashtirilgan) postlar — chiqib bo'lganlari ko'rsatilmaydi (2026-11-13)
      const now = Date.now() - 60 * 60 * 1000;
      setPosts((await api.posts(businessId, 60)).posts
        .filter((p) => p.mode !== 'video_plan' && p.status === 'scheduled'
          && (!p.scheduled_at || new Date(p.scheduled_at).getTime() >= now))
        .sort((a, b) => new Date(a.scheduled_at || a.created_at).getTime() - new Date(b.scheduled_at || b.created_at).getTime()));
    } catch (e) {
      setError(errText(e));
      setPosts([]);
    }
  };

  useEffect(() => {
    if (tab === 'journal') loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, businessId]);

  const generate = async () => {
    if (!businessId) return;
    setError('');
    setResult(null);
    setGenerating(true);
    try {
      const p = await api.generatePost(businessId, platform, topic.trim(), style);
      setPost(p);
      setText(p.content);
      setTags((p.hashtags || []).join(' '));
    } catch (e) {
      setError(errText(e));
    } finally {
      setGenerating(false);
    }
  };

  const publish = async () => {
    if (!post) return;
    setError('');
    setPublishing(true);
    try {
      const hashtags = tags.split(/\s+/).map((t) => t.trim()).filter(Boolean)
        .map((t) => (t.startsWith('#') ? t : '#' + t));
      await api.editPost(post.post_id, text.trim(), hashtags, platform);
      setResult(await api.publishPost(post.post_id));
    } catch (e) {
      setError(errText(e));
    } finally {
      setPublishing(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n\n${tags}`.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard yo'q */
    }
  };

  const reset = () => {
    setPost(null);
    setResult(null);
    setText('');
    setTags('');
  };

  const chip = (active: boolean, disabled = false) =>
    `px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 active:scale-95 ${
      disabled ? 'opacity-40' : ''} ${
      active ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-200'}`;

  const TargetRow: React.FC<{ kind: 'instagram' | 'telegram'; r: PublishTarget }> = ({ kind, r }) => {
    const icon = kind === 'instagram'
      ? <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
      : <Send className="w-4 h-4 text-sky-600 shrink-0" />;
    const account = r.account ? (kind === 'instagram' ? '@' + r.account : tgLabel(r.url) || r.account) : null;
    const link = r.url || r.profile_url;
    const linkLabel = kind === 'telegram' ? L.openChannel : r.url ? L.openPost : L.openProfile;
    return (
      <div className={`rounded-xl border p-2.5 space-y-1 ${r.ok ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
        <div className="flex items-center gap-2 text-[12.5px] font-bold">
          {icon}
          <span>{kind === 'instagram' ? 'Instagram' : 'Telegram'}</span>
          {account && <span className="text-slate-600 font-semibold truncate">{account}</span>}
          <span className="ml-auto flex items-center gap-1 shrink-0">
            {r.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
            <span className={r.ok ? 'text-emerald-700' : 'text-rose-700'}>{r.ok ? L.published : L.failed}</span>
          </span>
        </div>
        {!r.ok && (
          <p className="text-[11px] text-rose-700">
            {(kind === 'instagram' ? !igOn : !tgUrl) ? (kind === 'instagram' ? L.igNot : L.tgNot) : r.error}
          </p>
        )}
        {r.ok && link && (
          <a href={link} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11.5px] font-bold text-purple-700">
            <ExternalLink className="w-3.5 h-3.5" />{linkLabel}
          </a>
        )}
      </div>
    );
  };

  const statusBadge = (s: string) => {
    const map: Record<string, [string, string]> = {
      published: [L.published, 'bg-emerald-50 text-emerald-700'],
      failed: [L.failed, 'bg-rose-50 text-rose-700'],
      scheduled: [L.scheduled, 'bg-sky-50 text-sky-700'],
    };
    const [label, cls] = map[s] || [L.draft, 'bg-slate-100 text-slate-600'];
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
  };

  const platformIcons = (p: PostPlatform) => (
    <span className="flex items-center gap-1">
      {(p === 'instagram' || p === 'both') && <Instagram className="w-3.5 h-3.5 text-pink-600" />}
      {(p === 'telegram' || p === 'both') && <Send className="w-3.5 h-3.5 text-sky-600" />}
    </span>
  );

  const needsIgImage = post && !post.image_url && (platform === 'instagram' || platform === 'both');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-x-hidden font-sans text-slate-900 w-full max-w-full">
      <div className="bg-white border-b border-slate-200/80 px-3 py-2.5 shrink-0 w-full">
        <div className="flex items-center gap-2">
          <button onClick={onBack} title={L.back}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 active:scale-95">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5 truncate">
            <PenSquare className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{L.title}</span>
          </h1>
        </div>
        <div className="flex items-center gap-1.5 mt-2.5">
          {([
            { id: 'plan' as const, label: L.plan, icon: <CalendarClock className="w-3.5 h-3.5" /> },
            { id: 'create' as const, label: L.create, icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: 'journal' as const, label: L.journal, icon: <Library className="w-3.5 h-3.5" /> },
          ]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 ${
                tab === t.id ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 w-full space-y-3.5 pb-16">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-3.5 py-2.5 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}

        {(tab === 'create' || tab === 'plan') && needsNiche && businessId && (
          <NicheGate businessId={businessId} lang={lang} onDone={() => setNeedsNiche(false)} />
        )}

        {tab === 'plan' && !needsNiche && businessId && <PostPlanPanel businessId={businessId} lang={lang} />}

        {tab === 'create' && !needsNiche && !post && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3.5">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{L.where}</p>
              <div className="flex flex-wrap gap-1.5">
                <button className={chip(platform === 'instagram')} onClick={() => setPlatform('instagram')}>
                  <Instagram className="w-3.5 h-3.5" />Instagram
                </button>
                <button className={chip(platform === 'telegram')} onClick={() => setPlatform('telegram')}>
                  <Send className="w-3.5 h-3.5" />Telegram
                </button>
                <button className={chip(platform === 'both')} onClick={() => setPlatform('both')}>{L.both}</button>
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5 pt-0.5">
                {(platform === 'instagram' || platform === 'both') && (
                  <p className="flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-600" />
                    {igOn ? <b>{igUser ? '@' + igUser : 'Instagram'}</b> : <span className="text-rose-600">{L.igNot}</span>}
                  </p>
                )}
                {(platform === 'telegram' || platform === 'both') && (
                  <p className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-sky-600" />
                    {tgUrl ? <b>{tgLabel(tgUrl)}</b> : <span className="text-rose-600">{L.tgNot}</span>}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{L.topic}</p>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} maxLength={500}
                placeholder={L.topicPh}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-[12.5px] outline-none focus:border-purple-400 resize-none" />
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{L.style}</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(L.styles) as Style[]).map((s) => (
                  <button key={s} className={chip(style === s)} onClick={() => setStyle(s)}>{L.styles[s]}</button>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={generating || !businessId}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? L.generating : L.generate}
            </button>
          </div>
        )}

        {tab === 'create' && post && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black flex items-center gap-1.5">{platformIcons(platform)}{L.preview}</h2>
              {!result && (
                <button onClick={copy} className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? L.copied : L.copy}
                </button>
              )}
            </div>

            {post.image_url && (
              <img src={post.image_url} alt="" className="w-full rounded-xl border border-slate-100 object-cover max-h-80" />
            )}
            {needsIgImage && !result && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2">{L.noImageIg}</p>
            )}

            {!result ? (
              <>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-500">{L.text}</p>
                  <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-[12.5px] leading-relaxed outline-none focus:border-purple-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-500">{L.tags}</p>
                  <input value={tags} onChange={(e) => setTags(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-[12px] text-purple-700 outline-none focus:border-purple-400" />
                </div>
                <div className="flex gap-2">
                  <button onClick={generate} disabled={generating || publishing}
                    className="flex-1 py-2.5 rounded-xl text-[12px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center gap-1.5 disabled:opacity-60">
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}{L.again}
                  </button>
                  <button onClick={publish} disabled={publishing || generating || !text.trim()}
                    className="flex-1 py-2.5 rounded-xl text-[12px] font-bold bg-purple-600 text-white flex items-center justify-center gap-1.5 disabled:opacity-60">
                    {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {publishing ? L.publishing : L.publish}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[12.5px] leading-relaxed whitespace-pre-line text-slate-700">{text}</p>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{L.resultTitle}</p>
                  {result.results.instagram && <TargetRow kind="instagram" r={result.results.instagram} />}
                  {result.results.telegram && <TargetRow kind="telegram" r={result.results.telegram} />}
                  {result.results.info && (
                    <p className="text-[11.5px] text-slate-600">{result.results.info.message}</p>
                  )}
                </div>
                <button onClick={reset}
                  className="w-full py-2.5 rounded-xl text-[12px] font-bold bg-purple-600 text-white flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4" />{L.newPost}
                </button>
              </>
            )}
          </div>
        )}

        {tab === 'journal' && posts === null && (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-purple-600 animate-spin" /></div>
        )}
        {tab === 'journal' && posts && posts.length === 0 && (
          <p className="text-center text-xs text-slate-500 py-10">{L.empty}</p>
        )}
        {tab === 'journal' && posts && posts.map((p) => (
          <div key={p.id} className="bg-white border border-slate-200/90 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                {platformIcons(p.platform)}{when(p.scheduled_at || p.created_at, lang)}
              </span>
              {statusBadge(p.status)}
            </div>
            <div className="flex gap-2.5">
              {p.image_url && <img src={p.image_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />}
              <p className="text-[12px] leading-snug text-slate-700 line-clamp-4 whitespace-pre-line">{p.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

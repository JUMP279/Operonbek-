import { isUz } from '../context/LanguageContext';
import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, BookOpen, Calculator, Check, Clock, Copy, Download, ExternalLink, Image as ImageIcon, Link2, MessageSquare, Package, RefreshCw, Send, Sparkles, Star, TrendingUp, Wand2 } from 'lucide-react';
import { api, ApiError, MpCard, MpGuide, MpLinks, MpReview, MpReviews, Product } from '../lib/api';
import { formatDay } from '../lib/format';

// Marketplace asboblari (2026-11-15) — sayt kabinetidagi «Маркетплейсы» bilan bir xil (ilova + sayt QONUNI):
//  • Отзывы  — o'z sharhlari (WB API + Kaspi ochiq sahifa), AI javob qoralamasi, WB'ga yuborish / Kaspi'ga nusxa
//  • Карточки — Kaspi/WB/Uzum kartochkasi: nom, SEO tavsif, xususiyatlar, infografika rasmlari
//  • Связки   — marketplace tovari ↔ FindLead mahsuloti, qoldiqni avtomatik kamaytirish
//  • Правила  — o'rganilgan qoidalar (services/mp_playbook.py)
// Saytdagi nusxa: operon/src/components/cabinet/MarketplaceTools.tsx (faqat uslub konstantalari farq qiladi).
type L = 'uz' | 'ru' | 'kk';
type Plat = 'kaspi' | 'wb' | 'uzum';
const BOX = 'bg-white rounded-2xl border border-slate-200';
const MUTED = 'text-slate-500';
const SOFT = 'bg-slate-50';
const PRIMARY = 'bg-blue-600 text-white';
const NAME: Record<Plat, string> = { kaspi: 'Kaspi', wb: 'Wildberries', uzum: 'Uzum' };
const LANG_NAME: Record<string, string> = { ru: 'Русский', kk: 'Қазақша', uz: "O'zbekcha" };
const tr = (l: L, ru: string, kk: string) => (l === 'kk' ? kk : ru);

const copy = async (text: string) => {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
};

const CopyBtn: React.FC<{ text: string; l: L; small?: boolean }> = ({ text, l, small }) => {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={async () => { if (await copy(text)) { setOk(true); setTimeout(() => setOk(false), 1500); } }}
      className={`inline-flex items-center gap-1 rounded-full border border-slate-200 ${small ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-[12px]'} font-semibold ${ok ? 'text-emerald-600' : 'text-slate-600'}`}>
      {ok ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{ok ? (isUz() ? "Nusxalandi" : tr(l, 'Скопировано', 'Көшірілді')) : (isUz() ? "Nusxalash" : tr(l, 'Копировать', 'Көшіру'))}
    </button>
  );
};

const Stars: React.FC<{ n: number }> = ({ n }) => (
  <span className="inline-flex">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`w-3.5 h-3.5 ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />)}</span>
);

const Err: React.FC<{ text: string }> = ({ text }) => (
  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{text}</div>
);

// ── Отзывы ───────────────────────────────────────────────────────────────────
const ReviewItem: React.FC<{ r: MpReview; businessId: string; l: L; onAnswered: (id: string, text: string) => void }> = ({ r, businessId, l, onAnswered }) => {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState<'' | 'draft' | 'send'>('');
  const [err, setErr] = useState('');
  const neg = r.rating > 0 && r.rating <= 3;
  const makeDraft = async () => {
    setBusy('draft'); setErr('');
    try { setDraft((await api.mpReviewDraft(businessId, r, l)).text); }
    catch { setErr((isUz() ? "AI hozir javob bermadi, qaytadan urinib ko'ring." : tr(l, 'ИИ сейчас не ответил, попробуйте ещё раз.', 'ЖИ қазір жауап бермеді, қайталап көріңіз.'))); }
    finally { setBusy(''); }
  };
  const send = async () => {
    setBusy('send'); setErr('');
    try { await api.mpReviewAnswer(businessId, r.id, draft.trim()); onAnswered(r.id, draft.trim()); setDraft(''); }
    catch (e) {
      const m = e instanceof ApiError ? e.message : '';
      setErr(m === 'contacts_forbidden' ? (isUz() ? "Javobda telefonlar, havolalar va ijtimoiy tarmoqlarni qoldirish mumkin emas." : tr(l, 'В ответе нельзя оставлять телефоны, ссылки и соцсети.', 'Жауапта телефон, сілтеме, әлеуметтік желі болмауы керек.'))
        : m === 'wb_scope' ? (isUz() ? "WB tokeniga «Savollar va sharhlar» ruxsati kerak." : tr(l, 'Токену WB нужен доступ «Вопросы и отзывы».', 'WB токеніне «Сұрақтар мен пікірлер» рұқсаты керек.'))
          : (isUz() ? "Yuborib bo'lmadi. Keyinroq urinib ko'ring." : tr(l, 'Не удалось отправить. Попробуйте позже.', 'Жіберілмеді. Кейінірек көріңіз.')));
    } finally { setBusy(''); }
  };
  return (
    <div className={`p-3 ${BOX} ${neg && !r.answered ? 'border-rose-200' : ''}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <Stars n={r.rating} />
        <span className="text-[11px] font-bold" style={{ color: r.source === 'wb' ? '#a73afd' : '#f14635' }}>{r.source === 'wb' ? 'WB' : 'Kaspi'}</span>
        <span className={`text-[11px] ${MUTED}`}>{r.date ? formatDay(r.date, l) : ''}{r.author ? ` · ${r.author}` : ''}</span>
        {r.answered ? <span className="ml-auto text-[10.5px] font-bold text-emerald-600">{(isUz() ? "javob berilgan" : tr(l, 'отвечен', 'жауап берілді'))}</span>
          : <span className="ml-auto text-[10.5px] font-bold text-amber-600">{(isUz() ? "javobsiz" : tr(l, 'без ответа', 'жауапсыз'))}</span>}
      </div>
      {r.product && <div className={`mt-1 text-[11.5px] font-semibold truncate`}>{r.product}</div>}
      {r.text && <p className="mt-1 text-[12.5px] leading-snug whitespace-pre-line">{r.text}</p>}
      {r.pros && <p className="mt-1 text-[12px] leading-snug"><b className="text-emerald-600">+</b> {r.pros}</p>}
      {r.cons && <p className="mt-0.5 text-[12px] leading-snug"><b className="text-rose-600">−</b> {r.cons}</p>}
      {r.photos?.length > 0 && <div className="mt-2 flex gap-1.5">{r.photos.map((p) => <img key={p} src={p} alt="" className="w-12 h-12 rounded-lg object-cover" loading="lazy" />)}</div>}
      {r.answered && r.answer && <div className={`mt-2 p-2 rounded-xl ${SOFT} text-[12px]`}><b>{(isUz() ? "Sizning javobingiz:" : tr(l, 'Ваш ответ:', 'Сіздің жауабыңыз:'))}</b> {r.answer}</div>}
      {!r.answered && (
        <div className="mt-2 space-y-2">
          {draft ? (
            <>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} maxLength={1000}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-[12.5px] leading-snug" />
              <div className="flex flex-wrap gap-2">
                {r.can_reply ? (
                  <button onClick={send} disabled={busy !== '' || draft.trim().length < 2} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold ${PRIMARY} disabled:opacity-50`}>
                    <Send className="w-3.5 h-3.5" />{busy === 'send' ? '…' : (isUz() ? "WBga yuborish" : tr(l, 'Отправить на WB', 'WB-ға жіберу'))}
                  </button>
                ) : (
                  <>
                    <CopyBtn text={draft} l={l} />
                    {r.link && <a href={r.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-slate-200 text-[12px] font-semibold text-slate-600"><ExternalLink className="w-3.5 h-3.5" />Kaspi</a>}
                  </>
                )}
                <button onClick={makeDraft} disabled={busy !== ''} className="px-3 py-1 rounded-full border border-slate-200 text-[12px] font-semibold text-slate-600">{(isUz() ? "Boshqa variant" : tr(l, 'Другой вариант', 'Басқа нұсқа'))}</button>
              </div>
              {!r.can_reply && <p className={`text-[10.5px] ${MUTED}`}>{(isUz() ? "Kaspi API orqali javoblarni qabul qilmaydi — matnni nusxalab, sotuvchi kabinetiga o'ting → Sharhlar." : tr(l, 'Kaspi не принимает ответы через API — скопируйте текст и вставьте в кабинете продавца → Отзывы.', 'Kaspi API арқылы жауап қабылдамайды — мәтінді көшіріп, сатушы кабинеті → Пікірлер бөліміне қойыңыз.'))}</p>}
            </>
          ) : (
            <button onClick={makeDraft} disabled={busy !== ''} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 text-blue-700 text-[12px] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />{busy === 'draft' ? (isUz() ? "Javob yozilmoqda…" : tr(l, 'Пишу ответ…', 'Жауап жазып жатырмын…')) : (isUz() ? "Javob tayyorlash" : tr(l, 'Подготовить ответ', 'Жауап дайындау'))}
            </button>
          )}
          {err && <Err text={err} />}
        </div>
      )}
    </div>
  );
};

export const MpReviewsPanel: React.FC<{ businessId: string; l: L }> = ({ businessId, l }) => {
  const [data, setData] = useState<MpReviews | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState<'todo' | 'neg' | 'all'>('todo');
  const load = async (refresh = false) => {
    setLoading(true); setErr('');
    try { setData(await api.mpReviews(businessId, refresh)); } catch { setErr((isUz() ? "Sharhlarni yuklab bo'lmadi." : tr(l, 'Не удалось загрузить отзывы.', 'Пікірлер жүктелмеді.'))); }
    finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [businessId]);
  const items = useMemo(() => (data?.items || []).filter((r) => filter === 'all' ? true : filter === 'neg' ? r.rating > 0 && r.rating <= 3 : !r.answered), [data, filter]);
  const srcNote = (s: 'wb' | 'kaspi' | 'uzum') => {
    const st = data?.sources[s];
    if (!st || st.ok) return null;
    const m: Record<string, string> = {
      not_connected: (isUz() ? "WB ulanmagan — «Savollar va sharhlar» ruxsati bilan token ulang." : tr(l, 'WB не подключён — подключите токен с доступом «Вопросы и отзывы».', 'WB қосылмаған — «Сұрақтар мен пікірлер» рұқсаты бар токенді қосыңыз.')),
      wb_scope: (isUz() ? "WB tokenida «Savollar va sharhlar» ruxsati yetishmayapti — shu kategoriya bilan yangi token yarating." : tr(l, 'Токену WB не хватает доступа «Вопросы и отзывы» — создайте новый токен с этой категорией.', 'WB токеніне «Сұрақтар мен пікірлер» рұқсаты жетіспейді — осы санатпен жаңа токен құрыңыз.')),
      no_kaspi_ids: (isUz() ? "Kaspi: «Bog'lamalar» bo'limida Kaspi mahsulot ID sini kiriting (kaspi.kz/shop/p/…-123456/ havolasidagi raqam) — yoki birinchi buyurtmadan keyin o'zi paydo bo'ladi." : tr(l, 'Kaspi: укажите ID товара Kaspi во вкладке «Связки» (число из ссылки kaspi.kz/shop/p/…-123456/) — или он появится сам после первого заказа.', 'Kaspi: «Байланыстар» қойындысында Kaspi тауар ID-ін көрсетіңіз (kaspi.kz/shop/p/…-123456/ сілтемесіндегі сан) — немесе алғашқы тапсырыстан кейін өзі шығады.')),
      no_api: (isUz() ? "Uzum ochiq API orqali sharhlarni bermaydi — Uzum Sellers ilovasida javob bering. FindLead sharhni chatga joylasangiz, javob matnini tayyorlab berishi mumkin." : tr(l, 'Uzum не отдаёт отзывы через открытый API — отвечайте в приложении Uzum Sellers. FindLead может подготовить текст ответа, если вставите отзыв в чат.', 'Uzum ашық API арқылы пікір бермейді — Uzum Sellers қосымшасында жауап беріңіз.')),
    };
    return <p key={s} className={`text-[11px] ${MUTED} leading-snug`}>• {m[st.error || ''] || (isUz() ? `${NAME[s]}: hozir mavjud emas.` : tr(l, `${NAME[s]}: сейчас недоступно.`, `${NAME[s]}: қазір қолжетімсіз.`))}</p>;
  };
  const sm = data?.summary;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {(['todo', 'neg', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-[11.5px] font-semibold border ${filter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>
            {f === 'todo' ? (isUz() ? "Javobsiz" : tr(l, 'Без ответа', 'Жауапсыз')) : f === 'neg' ? (isUz() ? "Salbiy" : tr(l, 'Негатив', 'Теріс')) : (isUz() ? "Barchasi" : tr(l, 'Все', 'Барлығы'))}
          </button>
        ))}
        <span className="flex-1" />
        <button onClick={() => load(true)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>
      {sm && sm.total > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className={`p-2.5 rounded-xl ${SOFT}`}><div className={`text-[10.5px] ${MUTED}`}>{(isUz() ? "O'rtacha baho" : tr(l, 'Средняя оценка', 'Орташа баға'))}</div><div className="text-[15px] font-black">{sm.avg ?? '—'}</div></div>
          <div className={`p-2.5 rounded-xl ${SOFT}`}><div className={`text-[10.5px] ${MUTED}`}>{(isUz() ? "Javobsiz" : tr(l, 'Без ответа', 'Жауапсыз'))}</div><div className="text-[15px] font-black">{sm.unanswered}</div></div>
          <div className={`p-2.5 rounded-xl ${SOFT}`}><div className={`text-[10.5px] ${MUTED}`}>{(isUz() ? "Salbiy ≤3★" : tr(l, 'Негатив ≤3★', 'Теріс ≤3★'))}</div><div className="text-[15px] font-black text-rose-600">{sm.negative}</div></div>
        </div>
      )}
      {sm && sm.top_complaints.length > 0 && (
        <div className={`p-3 ${BOX}`}>
          <div className="text-[12px] font-bold">{(isUz() ? "Eng ko'p nimalardan shikoyat qilinadi" : tr(l, 'На что жалуются чаще всего', 'Ең жиі шағым'))}</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">{sm.top_complaints.map((w) => <span key={w} className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px]">{w}</span>)}</div>
          <p className={`mt-1.5 text-[10.5px] ${MUTED}`}>{(isUz() ? "Bu qo'rquvlarni foto, infografika va kartochka tavsifida yoping." : tr(l, 'Закройте эти страхи в фото, инфографике и описании карточки.', 'Осы қорқыныштарды карточканың фотосы, инфографикасы және сипаттамасында жабыңыз.'))}</p>
        </div>
      )}
      {err && <Err text={err} />}
      {data && <div className="space-y-1">{(['wb', 'kaspi', 'uzum'] as const).map(srcNote)}</div>}
      {!data && loading && <div className="py-10 flex justify-center"><div className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}
      {data && items.length === 0 && <p className={`text-[12.5px] ${MUTED} py-4 text-center`}>{filter === 'todo' ? (isUz() ? "Barcha sharhlarga javob berilgan 👍" : tr(l, 'Все отзывы отвечены 👍', 'Барлық пікірге жауап берілген 👍')) : (isUz() ? "Hozircha sharhlar yo'q." : tr(l, 'Отзывов пока нет.', 'Пікірлер әзірге жоқ.'))}</p>}
      {items.slice(0, 60).map((r) => (
        <ReviewItem key={`${r.source}:${r.id}`} r={r} businessId={businessId} l={l}
          onAnswered={(id, text) => setData((d) => d ? { ...d, items: d.items.map((x) => x.id === id ? { ...x, answered: true, answer: text, can_reply: false } : x) } : d)} />
      ))}
    </div>
  );
};

// ── Карточки ─────────────────────────────────────────────────────────────────
const CardView: React.FC<{ c: MpCard; l: L }> = ({ c, l }) => {
  const langs = Object.keys(c.title || {});
  const [lg, setLg] = useState(langs[0] || 'ru');
  const chars = c.characteristics.map((x) => `${x.name}: ${x.value}`).join('\n');
  return (
    <div className="space-y-2.5">
      {c.lint?.length > 0 ? (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[12px] text-amber-800 space-y-1">
          <b>{(isUz() ? "Yuklashdan oldin tekshiring:" : tr(l, 'Проверьте перед загрузкой:', 'Жүктеу алдында тексеріңіз:'))}</b>
          {c.lint.slice(0, 6).map((i, k) => <div key={k}>• «{i.word}» — {i.hint}</div>)}
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] flex gap-1.5"><Check className="w-4 h-4" />{(isUz() ? "Taqiqlangan so'zlar yo'q — kartochka moderatsiyaga tayyor." : tr(l, 'Запрещённых слов нет — карточка готова к модерации.', 'Тыйым салынған сөз жоқ — карточка модерацияға дайын.'))}</div>
      )}
      {langs.length > 1 && (
        <div className="flex gap-1.5">{langs.map((x) => <button key={x} onClick={() => setLg(x)} className={`px-3 py-1 rounded-full text-[11.5px] font-semibold border ${lg === x ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{LANG_NAME[x] || x}</button>)}</div>
      )}
      <div className={`p-3 ${BOX}`}>
        <div className="flex items-center justify-between"><span className={`text-[11px] font-bold ${MUTED}`}>{(isUz() ? "Nomi" : tr(l, 'Название', 'Атауы'))} · {(c.title[lg] || '').length}</span><CopyBtn small text={c.title[lg] || ''} l={l} /></div>
        <div className="mt-1 text-[13.5px] font-bold">{c.title[lg]}</div>
      </div>
      {c.short_keywords?.[lg] && (
        <div className={`p-3 ${BOX}`}>
          <div className="flex items-center justify-between"><span className={`text-[11px] font-bold ${MUTED}`}>{(isUz() ? "Qisqacha tavsif (Uzum kalitlari)" : tr(l, 'Краткое описание (ключи Uzum)', 'Қысқа сипаттама (Uzum кілттері)'))} · {c.short_keywords[lg].length}/390</span><CopyBtn small text={c.short_keywords[lg]} l={l} /></div>
          <div className="mt-1 text-[12px]">{c.short_keywords[lg]}</div>
        </div>
      )}
      <div className={`p-3 ${BOX}`}>
        <div className="flex items-center justify-between"><span className={`text-[11px] font-bold ${MUTED}`}>{(isUz() ? "Tavsif" : tr(l, 'Описание', 'Сипаттама'))} · {(c.description[lg] || '').length}</span><CopyBtn small text={c.description[lg] || ''} l={l} /></div>
        <p className="mt-1 text-[12.5px] leading-snug whitespace-pre-line">{c.description[lg]}</p>
      </div>
      {c.characteristics.length > 0 && (
        <div className={`p-3 ${BOX}`}>
          <div className="flex items-center justify-between"><span className={`text-[11px] font-bold ${MUTED}`}>{(isUz() ? "Xarakteristikalar" : tr(l, 'Характеристики', 'Сипаттамалар'))}</span><CopyBtn small text={chars} l={l} /></div>
          <div className="mt-1 divide-y divide-slate-100">{c.characteristics.map((x, i) => <div key={i} className="py-1 flex gap-2 text-[12px]"><span className={`${MUTED} w-2/5 shrink-0`}>{x.name}</span><span className="font-medium">{x.value}</span></div>)}</div>
        </div>
      )}
      {c.keywords.length > 0 && (
        <div className={`p-3 ${BOX}`}>
          <div className="flex items-center justify-between"><span className={`text-[11px] font-bold ${MUTED}`}>{(isUz() ? "Xaridorlarning qidiruv so'rovlari" : tr(l, 'Поисковые запросы покупателей', 'Сатып алушылардың іздеу сұраулары'))}</span><CopyBtn small text={c.keywords.join(', ')} l={l} /></div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">{c.keywords.map((k) => <span key={k} className={`px-2 py-0.5 rounded-full ${SOFT} text-[11px]`}>{k}</span>)}</div>
        </div>
      )}
      {(c.images?.length || 0) > 0 && (
        <div className={`p-3 ${BOX}`}>
          <div className={`text-[11px] font-bold ${MUTED}`}>{(isUz() ? "Infografika — tayyor slaydlar" : tr(l, 'Инфографика — готовые слайды', 'Инфографика — дайын слайдтар'))} ({c.platform === 'kaspi' ? '1:1' : '3:4'})</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {c.images!.map((u, i) => (
              <a key={u} href={u} target="_blank" rel="noreferrer" download={`slide-${i + 1}.jpg`} className="relative block rounded-xl overflow-hidden border border-slate-200">
                <img src={u} alt="" className="w-full" loading="lazy" />
                <span className="absolute right-1 bottom-1 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center"><Download className="w-3.5 h-3.5" /></span>
              </a>
            ))}
          </div>
          <p className={`mt-1.5 text-[10.5px] ${MUTED}`}>{(isUz() ? "Birinchisi — asosiy rasm (muqova). Ularga 1–2 ta haqiqiy mahsulot rasmini qo'shing: xaridor mahsulot haqiqiy ekaniga ishonishi kerak." : tr(l, 'Первое — главное фото (обложка). Добавьте к ним 1–2 живых фото товара: покупатель должен поверить, что товар реальный.', 'Біріншісі — басты фото (мұқаба). Оларға тауардың 1–2 нақты фотосын қосыңыз.'))}</p>
        </div>
      )}
      {c.images_error && <Err text={(isUz() ? "Slaydlar chizilmadi — karta matni tayyor, qayta yaratib ko'ring." : tr(l, 'Слайды не отрисовались — текст карточки готов, попробуйте создать ещё раз.', 'Слайдтар салынбады — мәтін дайын, қайта көріңіз.'))} />}
      {c.faq.length > 0 && (
        <div className={`p-3 ${BOX}`}>
          <div className={`text-[11px] font-bold ${MUTED}`}>{(isUz() ? "Xaridorlar savollariga javoblar (tavsif va savollar uchun)" : tr(l, 'Ответы на вопросы покупателей (для описания и вопросов)', 'Сатып алушы сұрақтарына жауаптар'))}</div>
          {c.faq.map((f, i) => <div key={i} className="mt-1.5 text-[12px]"><b>{f.q}</b><div>{f.a}</div></div>)}
        </div>
      )}
      {(c.ask_seller.length > 0 || c.photo_tips.length > 0) && (
        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-[12px] space-y-1">
          {c.ask_seller.length > 0 && <><b>{(isUz() ? "Kartani 100% to'ldirish uchun aniqlang:" : tr(l, 'Уточните, чтобы заполнить карточку на 100%:', 'Карточканы 100% толтыру үшін нақтылаңыз:'))}</b>{c.ask_seller.map((x, i) => <div key={i}>• {x}</div>)}</>}
          {c.photo_tips.length > 0 && <><b className="block pt-1">{(isUz() ? "Qo'shimcha qanday rasmlar kerak:" : tr(l, 'Какие фото доснять:', 'Қандай фото түсіру керек:'))}</b>{c.photo_tips.map((x, i) => <div key={i}>• {x}</div>)}</>}
        </div>
      )}
    </div>
  );
};

export const MpCardsPanel: React.FC<{ businessId: string; l: L }> = ({ businessId, l }) => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [pid, setPid] = useState('');
  const [plat, setPlat] = useState<Plat>('kaspi');
  const [extra, setExtra] = useState('');
  const [cards, setCards] = useState<Partial<Record<Plat, MpCard>>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    api.products(businessId).then((r) => { const arr = r.products || []; setProducts(arr); if (arr[0]) setPid(arr[0].id); }).catch(() => setProducts([]));
  }, [businessId]);
  useEffect(() => {
    if (!pid) return;
    setCards({});
    api.mpCards(businessId, pid).then((r) => setCards(r.cards || {})).catch(() => undefined);
  }, [businessId, pid]);
  const gen = async () => {
    setBusy(true); setErr('');
    try { const r = await api.mpCardGenerate(businessId, pid, plat, extra.trim()); setCards((c) => ({ ...c, [plat]: r.card })); }
    catch (e) {
      setErr(e instanceof ApiError && e.status === 402 ? (isUz() ? "Faol tarif kerak." : tr(l, 'Нужен активный тариф.', 'Белсенді тариф керек.'))
        : e instanceof ApiError && e.status === 429 ? (isUz() ? "Juda tez-tez — biroz kuting." : tr(l, 'Слишком часто — подождите немного.', 'Тым жиі — сәл күтіңіз.'))
          : (isUz() ? "AI javob bermadi, qayta urinib ko'ring." : tr(l, 'ИИ не ответил, попробуйте ещё раз.', 'ЖИ жауап бермеді, қайталап көріңіз.')));
    } finally { setBusy(false); }
  };
  const card = cards[plat];
  if (products && products.length === 0) {
    return <p className={`text-[12.5px] ${MUTED} py-6 text-center`}>{(isUz() ? "Avval mahsulotni «Mahsulotlar» bo'limiga qo'shing — rasm, narx va tavsif bilan." : tr(l, 'Сначала добавьте товар в «Товары» — с фото, ценой и описанием.', 'Алдымен «Тауарлар» бөліміне фотосы, бағасы және сипаттамасы бар тауар қосыңыз.'))}</p>;
  }
  return (
    <div className="space-y-3">
      <div className={`p-3 ${BOX} space-y-2.5`}>
        <label className={`block text-[11px] font-bold ${MUTED}`}>{(isUz() ? "Tovar" : tr(l, 'Товар', 'Тауар'))}</label>
        <select value={pid} onChange={(e) => setPid(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] bg-white">
          {(products || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="flex gap-1.5">
          {(['kaspi', 'wb', 'uzum'] as const).map((p) => (
            <button key={p} onClick={() => setPlat(p)} className={`flex-1 py-2 rounded-xl text-[12px] font-bold border ${plat === p ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{NAME[p]}{cards[p] ? ' ✓' : ''}</button>
          ))}
        </div>
        <textarea value={extra} onChange={(e) => setExtra(e.target.value)} rows={2} maxLength={800}
          placeholder={(isUz() ? "Majburiy emas: o'lchamlar, tarkibi, mamlakat, komplektatsiya, raqobatchilardan nimasi yaxshiroq…" : tr(l, 'Необязательно: размеры, состав, страна, комплектация, чем лучше конкурентов…', 'Міндетті емес: өлшемі, құрамы, елі, жиынтығы, бәсекелестерден артықшылығы…'))}
          className="w-full p-2.5 rounded-xl border border-slate-200 text-[12.5px]" />
        <button onClick={gen} disabled={busy || !pid} className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold ${PRIMARY} disabled:opacity-60`}>
          <Wand2 className="w-4 h-4" />{busy ? (isUz() ? "Karta va slaydlarni yaratyapman… (1 daqiqagacha)" : tr(l, 'Создаю карточку и слайды… (до 1 мин)', 'Карточка мен слайдтарды жасап жатырмын… (1 мин дейін)')) : card ? (isUz() ? `${NAME[plat]} uchun qayta yaratish` : tr(l, `Пересоздать для ${NAME[plat]}`, `${NAME[plat]} үшін қайта жасау`)) : (isUz() ? `${NAME[plat]} uchun karta yaratish` : tr(l, `Создать карточку для ${NAME[plat]}`, `${NAME[plat]} үшін карточка жасау`))}
        </button>
        <p className={`text-[10.5px] ${MUTED} leading-snug`}>{(isUz() ? "FindLead platforma qoidalari bo'yicha yozadi: nom formula bo'yicha, kalit so'zlar tavsif boshida, taqiqlangan so'zlarsiz, slayd-infografika. Kabinetga yuklash — qo'lda (nusxalang va yuklab oling)." : tr(l, 'FindLead пишет по правилам площадки: название по формуле, ключи в начале описания, без запрещённых слов, слайды-инфографика. Загрузка в кабинет — вручную (копируйте и скачивайте).', 'FindLead алаң ережесімен жазады: формула бойынша атау, сипаттама басында кілттер, тыйым сөздерсіз, инфографика слайдтары. Кабинетке жүктеу — қолмен (көшіріп, жүктеп алыңыз).'))}</p>
      </div>
      {err && <Err text={err} />}
      {card && <CardView c={card} l={l} />}
    </div>
  );
};

// ── Связки и остатки ─────────────────────────────────────────────────────────
const LinkRow: React.FC<{ it: MpLinks['items'][number]; businessId: string; l: L; onSaved: (d: MpLinks) => void }> = ({ it, businessId, l, onSaved }) => {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<Record<Plat, string>>({ kaspi: it.kaspi.join(', '), wb: it.wb.join(', '), uzum: it.uzum.join(', ') });
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      let d: MpLinks | null = null;
      for (const p of ['kaspi', 'wb', 'uzum'] as const) {
        const next = vals[p].split(/[,\s]+/).map((x) => x.trim()).filter(Boolean);
        if (next.join(',') !== it[p].join(',')) d = await api.mpLinkSet(businessId, it.id, p, next);
      }
      if (d) onSaved(d);
      setOpen(false);
    } finally { setBusy(false); }
  };
  const linked = (['kaspi', 'wb', 'uzum'] as const).filter((p) => it[p].length);
  return (
    <div className="px-3 py-2.5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 text-left">
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold truncate">{it.name}</div>
          <div className={`text-[10.5px] ${MUTED}`}>{(isUz() ? "Qoldiq" : tr(l, 'Остаток', 'Қалдық'))}: {it.stock ?? '—'} · {linked.length ? linked.map((p) => NAME[p]).join(', ') + (it.auto ? (isUz() ? " (avto)" : tr(l, ' (авто)', ' (авто)')) : '') : (isUz() ? "bog'lanmagan" : tr(l, 'не связан', 'байланыспаған'))}</div>
        </div>
        <Link2 className={`w-4 h-4 ${linked.length ? 'text-emerald-600' : 'text-slate-300'}`} />
      </button>
      {open && (
        <div className="mt-2 space-y-1.5">
          {(['kaspi', 'wb', 'uzum'] as const).map((p) => (
            <label key={p} className="flex items-center gap-2 text-[11.5px]">
              <span className="w-16 font-bold">{NAME[p]}</span>
              <input value={vals[p]} onChange={(e) => setVals({ ...vals, [p]: e.target.value })}
                placeholder={p === 'kaspi' ? (isUz() ? "Kaspi mahsulot ID yoki SKU" : tr(l, 'ID товара Kaspi или SKU', 'Kaspi тауар ID немесе SKU')) : p === 'wb' ? (isUz() ? "WB artikuli (nmId)" : tr(l, 'Артикул WB (nmId)', 'WB артикулы (nmId)')) : 'SKU'}
                className="flex-1 min-w-0 p-2 rounded-lg border border-slate-200 text-[12px]" />
            </label>
          ))}
          <button onClick={save} disabled={busy} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold ${PRIMARY} disabled:opacity-50`}>{busy ? '…' : (isUz() ? "Saqlash" : tr(l, 'Сохранить', 'Сақтау'))}</button>
        </div>
      )}
    </div>
  );
};

export const MpLinksPanel: React.FC<{ businessId: string; l: L }> = ({ businessId, l }) => {
  const [data, setData] = useState<MpLinks | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.mpLinks(businessId).then(setData).catch(() => setErr((isUz() ? "Yuklab bo'lmadi." : tr(l, 'Не удалось загрузить.', 'Жүктелмеді.')))); }, [businessId, l]);
  const toggle = async (p: Plat) => { if (data) setData(await api.mpStockSync(businessId, p, !data.stock_sync[p])); };
  return (
    <div className="space-y-3">
      <div className={`p-3 ${BOX}`}>
        <div className="text-[13px] font-black">{(isUz() ? "Buyurtma paytida qoldiqni kamaytirish" : tr(l, 'Списывать остаток при заказе', 'Тапсырыс кезінде қалдықты азайту'))}</div>
        <p className={`mt-0.5 text-[11px] ${MUTED} leading-snug`}>{(isUz() ? "Marketpleysdagi buyurtma FindLeaddagi mahsulot qoldig'ini kamaytiradi, bekor qilish/qaytarish — qaytaradi. Faqat yoqilgandan keyingi buyurtmalar hisobga olinadi. WB sukut bo'yicha o'chirilgan: FBO'da mahsulot WB omborida turadi." : tr(l, 'Заказ с маркетплейса уменьшает остаток товара в FindLead, отмена/возврат — возвращает. Считаются только заказы после включения. WB по умолчанию выключен: при FBO товар лежит на складе WB.', 'Маркетплейс тапсырысы FindLead-дағы қалдықты азайтады, бас тарту/қайтару — қайтарады. Тек қосылғаннан кейінгі тапсырыстар. WB әдепкіде өшірулі: FBO кезінде тауар WB қоймасында.'))}</p>
        <div className="mt-2 flex gap-1.5">
          {(['kaspi', 'wb', 'uzum'] as const).map((p) => (
            <button key={p} onClick={() => toggle(p)} disabled={!data} className={`flex-1 py-2 rounded-xl text-[12px] font-bold border ${data?.stock_sync[p] ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200'}`}>{NAME[p]} {data?.stock_sync[p] ? (isUz() ? "yoniq" : tr(l, 'вкл', 'қосулы')) : (isUz() ? "o'chiq" : tr(l, 'выкл', 'өшік'))}</button>
          ))}
        </div>
      </div>
      <p className={`text-[11px] ${MUTED} leading-snug px-1`}>{(isUz() ? "FindLead buyurtmalarni mahsulotlar bilan nom bo'yicha o'zi bog'laydi va artikulni eslab qoladi. Agar noto'g'ri bog'lagan yoki bog'lamagan bo'lsa — artikulni qo'lda ko'rsating." : tr(l, 'FindLead сам связывает заказы с товарами по названию и запоминает артикул. Если связал неверно или не связал — укажите артикул вручную.', 'FindLead тапсырыстарды тауарлармен атауы бойынша өзі байланыстырып, артикулды есте сақтайды. Қате болса — артикулды қолмен көрсетіңіз.'))}</p>
      {err && <Err text={err} />}
      {data && (
        <div className={`${BOX} divide-y divide-slate-100`}>
          {data.items.length === 0 ? <p className={`p-3 text-[12px] ${MUTED}`}>{(isUz() ? "Mahsulotlar yo'q." : tr(l, 'Товаров нет.', 'Тауар жоқ.'))}</p>
            : data.items.map((it) => <LinkRow key={it.id} it={it} businessId={businessId} l={l} onSaved={setData} />)}
        </div>
      )}
    </div>
  );
};

// ── Правила (o'rganilgan qoidalar) ───────────────────────────────────────────
export const MpGuidePanel: React.FC<{ businessId: string; l: L }> = ({ businessId, l }) => {
  const [g, setG] = useState<MpGuide | null>(null);
  const [plat, setPlat] = useState<Plat>('kaspi');
  useEffect(() => { api.mpGuide(businessId).then(setG).catch(() => undefined); }, [businessId]);
  if (!g) return <div className="py-10 flex justify-center"><div className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  const p = g.platforms[plat];
  const List: React.FC<{ title: string; items: string[]; icon: React.ReactNode }> = ({ title, items, icon }) => (
    <div className={`p-3 ${BOX}`}>
      <div className="text-[13px] font-black flex items-center gap-1.5">{icon}{title}</div>
      <div className="mt-1.5 space-y-1">{items.map((x, i) => <div key={i} className="text-[12px] leading-snug">• {x}</div>)}</div>
    </div>
  );
  return (
    <div className="space-y-3">
      <p className={`text-[11px] ${MUTED} leading-snug px-1`}>{(isUz() ? "FindLead bu qoidalarni Kaspi, WB va Uzum sotuvchilari darslari (34 video) va rasmiy qo'llanmalar asosida o'rgandi: pullar va komissiyalar, buyurtma bilan nima qilish, mahsulotni qanday qo'shish, platforma qanday tartiblaydi va yangi boshlovchilarning asosiy xatolari." : tr(l, 'Эти правила FindLead изучил по урокам продавцов Kaspi, WB и Uzum (34 видео) и официальным гидам: деньги и комиссии, что делать с заказом, как добавить товар, как площадка ранжирует и главные ошибки новичков.', 'Бұл ережелерді FindLead Kaspi, WB және Uzum сатушыларының сабақтарынан (34 бейне) және ресми гидтерден үйренді: ақша мен комиссия, тапсырыспен не істеу, тауар қосу, рейтинг және басты қателер.'))}</p>
      <div className="flex gap-1.5">
        {(['kaspi', 'wb', 'uzum'] as const).map((x) => <button key={x} onClick={() => setPlat(x)} className={`flex-1 py-2 rounded-xl text-[12px] font-bold border ${plat === x ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{NAME[x]}</button>)}
      </div>
      <div className={`p-3 ${BOX} text-[12px] space-y-1`}>
        <div><b>{(isUz() ? "Nomi" : tr(l, 'Название', 'Атауы'))} (≤{p.title_max}):</b> {p.title_rule}</div>
        <div><b>{(isUz() ? "Foto" : tr(l, 'Фото', 'Фото'))}:</b> {p.photo.size}. {p.photo.main}</div>
        <div><b>{(isUz() ? "Video" : tr(l, 'Видео', 'Бейне'))}:</b> {p.video}</div>
        <div><b>{(isUz() ? "Moderatsiya" : tr(l, 'Модерация', 'Модерация'))}:</b> {p.moderation}</div>
      </div>
      {p.economics && <List title={(isUz() ? "Pullar: komissiyalar, yetkazib berish, soliqlar" : tr(l, 'Деньги: комиссии, доставка, налоги', 'Ақша: комиссия, жеткізу, салық'))} items={p.economics} icon={<Calculator className="w-4 h-4" />} />}
      {p.orders && <List title={(isUz() ? "Buyurtma keldi: nima qilish va muddatlar" : tr(l, 'Пришёл заказ: что делать и сроки', 'Тапсырыс келді: не істеу және мерзім'))} items={p.orders} icon={<Clock className="w-4 h-4" />} />}
      {p.adding && <List title={(isUz() ? "Mahsulotni qanday qo'shish" : tr(l, 'Как добавить товар', 'Тауарды қалай қосу'))} items={p.adding} icon={<Package className="w-4 h-4" />} />}
      {p.ranking && <List title={(isUz() ? "Platforma mahsulotlarni qanday ko'rsatadi" : tr(l, 'Как площадка показывает товары', 'Алаң тауарды қалай көрсетеді'))} items={p.ranking} icon={<TrendingUp className="w-4 h-4" />} />}
      {p.mistakes && <List title={(isUz() ? "Yangi boshlovchilarning asosiy xatolari" : tr(l, 'Главные ошибки новичков', 'Жаңадан бастаушылардың басты қателері'))} items={p.mistakes} icon={<AlertTriangle className="w-4 h-4" />} />}
      <List title={(isUz() ? "Platforma uchun maslahatlar" : tr(l, 'Советы для площадки', 'Алаң бойынша кеңестер'))} items={p.tips} icon={<BookOpen className="w-4 h-4" />} />
      <List title={(isUz() ? "Tavsif" : tr(l, 'Описание', 'Сипаттама'))} items={g.description} icon={<MessageSquare className="w-4 h-4" />} />
      <List title={(isUz() ? "Rasm va infografika" : tr(l, 'Фото и инфографика', 'Фото және инфографика'))} items={g.infographic} icon={<ImageIcon className="w-4 h-4" />} />
      <List title={(isUz() ? "Sharhlarga javoblar" : tr(l, 'Ответы на отзывы', 'Пікірлерге жауап'))} items={g.reviews} icon={<Star className="w-4 h-4" />} />
      {p.sources && p.sources.length > 0 && (
        <div className={`p-3 ${BOX}`}>
          <div className="text-[13px] font-black flex items-center gap-1.5"><ExternalLink className="w-4 h-4" />{(isUz() ? "Manbalar (sotuvchilar darslari)" : tr(l, 'Источники (уроки продавцов)', 'Дереккөздер (сатушылар сабақтары)'))}</div>
          <div className="mt-1.5 space-y-1">{p.sources.map((s) => (
            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="block text-[12px] leading-snug text-blue-600 underline-offset-2 hover:underline">• {s.title}</a>
          ))}</div>
          <p className={`mt-2 text-[10.5px] ${MUTED} leading-snug`}>{(isUz() ? `Raqamlar — 2024–2026 darslaridan (yangilangan ${g.as_of || ''}). Platformalar tariflari o'zgaradi — o'z kabinetingizda tekshiring.` : tr(l, `Цифры — из уроков 2024–2026 (обновлено ${g.as_of || ''}). Тарифы площадок меняются — сверяйте в своём кабинете.`, `Сандар — 2024–2026 сабақтарынан (${g.as_of || ''}). Алаң тарифтері өзгереді — кабинетіңізде тексеріңіз.`))}</p>
        </div>
      )}
    </div>
  );
};

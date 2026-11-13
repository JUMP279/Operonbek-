import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Check,
  Flame,
  Phone,
  X,
  Instagram,
  Loader2,
  MessageCircle,
  MessagesSquare,
  Send,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, ApiError, Conversation } from '../lib/api';

// Mijozlarga javob — REAL (2026-11-08). Avval 1300 qatorlik soxta demo edi.
// Ma'lumot: ai_conversations (webhook yozadi): instagram_comment — izohlar, instagram/telegram — xabarlar.
export interface CustomerResponseViewProps {
  onBack: () => void;
  storeContext?: { businessId?: string };
}

type Tab = 'hot' | 'comments' | 'direct' | 'tone';

const T = {
  ru: {
    title: 'Ответы клиентам', comments: 'Комментарии', direct: 'Сообщения', tone: 'Тон AI',
    emptyComments: 'Комментариев пока нет. Когда клиенты прокомментируют посты в Instagram, AI ответит и они появятся здесь.',
    emptyDirect: 'Сообщений пока нет. Когда клиенты напишут в Instagram Direct или Telegram-бот, диалоги появятся здесь.',
    customer: 'Клиент', ai: 'AI', operator: 'Вы', aiOn: 'AI отвечает', aiOff: 'Отвечаете вы',
    aiHint: 'Выключите, чтобы отвечать клиенту самим.', placeholder: 'Написать ответ…', sent: 'Отправлено',
    notSent: 'Ответ сохранён, но не доставлен: проверьте подключение Instagram/Telegram.',
    toneTitle: 'Как AI общается с клиентами', toneHint: 'Например: «вежливо на вы, коротко, без лишних эмодзи». Применяется к следующим ответам.',
    save: 'Сохранить', saved: 'Сохранено', back: 'Назад',
    hot: 'Готовы купить',
    emptyHot: 'Пока нет клиентов, готовых купить. Когда клиент напишет «беру», спросит про оплату или оставит телефон — он появится здесь, а AI передаст разговор вам.',
    hotHint: 'Эти клиенты близки к покупке. AI остановился — оплату, предоплату и условия обсуждаете вы.',
    stage: { interest: 'Интересуется', ready: 'Хочет купить', ordered: 'Оформил заказ', paid: 'Пишет, что оплатил' },
    dealTitle: 'Сделка — закройте её сами', product: 'Товар', phone: 'Телефон', address: 'Адрес', sum: 'Сумма', note: 'Детали',
    won: 'Продано', lost: 'Не купил', backToAi: 'Вернуть AI',
    wonHint: 'Заказ отмечен как проданный.', lostHint: 'Сделка закрыта без продажи.',
    errors: { network: 'Нет связи с сервером', generic: 'Что-то пошло не так. Попробуйте ещё раз.' },
  },
  kk: {
    title: 'Клиенттерге жауап', comments: 'Пікірлер', direct: 'Хабарлар', tone: 'AI үні',
    emptyComments: 'Әзірге пікір жоқ. Клиенттер Instagram посттарына пікір жазғанда AI жауап береді және олар осында көрінеді.',
    emptyDirect: 'Әзірге хабар жоқ. Клиенттер Instagram Direct немесе Telegram-ботқа жазғанда, диалогтар осында көрінеді.',
    customer: 'Клиент', ai: 'AI', operator: 'Сіз', aiOn: 'AI жауап береді', aiOff: 'Өзіңіз жауап бересіз',
    aiHint: 'Клиентке өзіңіз жауап беру үшін өшіріңіз.', placeholder: 'Жауап жазу…', sent: 'Жіберілді',
    notSent: 'Жауап сақталды, бірақ жеткізілмеді: Instagram/Telegram қосылымын тексеріңіз.',
    toneTitle: 'AI клиенттермен қалай сөйлеседі', toneHint: 'Мысалы: «сіз деп сыпайы, қысқа, эмодзисіз». Келесі жауаптарға қолданылады.',
    save: 'Сақтау', saved: 'Сақталды', back: 'Артқа',
    hot: 'Сатып алуға дайын',
    emptyHot: 'Сатып алуға дайын клиент әзірге жоқ. Клиент «аламын» деп жазса, төлем туралы сұраса немесе телефонын қалдырса — осында шығады, AI әңгімені сізге береді.',
    hotHint: 'Бұл клиенттер сатып алуға жақын. AI тоқтады — төлемді, алдын ала төлемді және шарттарды өзіңіз талқылайсыз.',
    stage: { interest: 'Қызығып отыр', ready: 'Сатып алғысы келеді', ordered: 'Тапсырыс берді', paid: 'Төледім деп жазды' },
    dealTitle: 'Мәміле — оны өзіңіз жабыңыз', product: 'Тауар', phone: 'Телефон', address: 'Мекенжай', sum: 'Сома', note: 'Мәлімет',
    won: 'Сатылды', lost: 'Сатып алмады', backToAi: 'AI-ге қайтару',
    wonHint: 'Тапсырыс сатылды деп белгіленді.', lostHint: 'Мәміле сатылымсыз жабылды.',
    errors: { network: 'Сервермен байланыс жоқ', generic: 'Бірдеңе дұрыс болмады. Қайталап көріңіз.' },
  },
};

function when(iso: string | undefined, lang: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const sameDay = d.toDateString() === new Date().toDateString();
    return d.toLocaleString(lang === 'kk' ? 'kk-KZ' : 'ru-RU', sameDay
      ? { hour: '2-digit', minute: '2-digit' }
      : { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

const isComment = (c: Conversation) => c.platform === 'instagram_comment';
// Issiq mijoz: sotib olishga tayyor / buyurtma berdi / "to'ladim" dedi — bitimni tadbirkor yopadi
const isHot = (c: Conversation) => !!c.deal && ['ready', 'ordered', 'paid'].includes(c.deal.stage);
const STAGE_CLS: Record<string, string> = {
  interest: 'bg-slate-100 text-slate-600', ready: 'bg-amber-100 text-amber-800',
  ordered: 'bg-orange-100 text-orange-800', paid: 'bg-emerald-100 text-emerald-800',
};

export const CustomerResponseView: React.FC<CustomerResponseViewProps> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();
  const lang: 'ru' | 'kk' = language === 'ru' ? 'ru' : 'kk';
  const L = T[lang];
  const businessId = storeContext?.businessId;

  const [tab, setTab] = useState<Tab>('hot');
  const [dealBusy, setDealBusy] = useState(false);
  const [convs, setConvs] = useState<Conversation[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [tone, setTone] = useState('');
  const [toneSaved, setToneSaved] = useState(false);
  const [toneBusy, setToneBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const errText = (e: unknown) => (e instanceof ApiError && e.status === 0 ? L.errors.network : L.errors.generic);

  const load = async () => {
    if (!businessId) return;
    try {
      setConvs((await api.conversations(businessId)).conversations);
    } catch (e) {
      setError(errText(e));
      setConvs((x) => x || []);
    }
  };

  useEffect(() => {
    load();
    if (businessId) api.aiTone(businessId).then((r) => setTone(r.instruction || '')).catch(() => {});
    const t = window.setInterval(load, 20000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const open = convs?.find((c) => c.id === openId) || null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [openId, open?.messages.length]);

  const hotCount = (convs || []).filter(isHot).length;
  const list = (convs || [])
    .filter((c) => (tab === 'hot' ? isHot(c) : tab === 'comments' ? isComment(c) : !isComment(c)))
    .map((c) => ({ c, last: c.messages[c.messages.length - 1] }))
    .sort((a, b) => (b.last?.timestamp || b.c.created_at).localeCompare(a.last?.timestamp || a.c.created_at));

  const send = async () => {
    if (!open || !businessId || !draft.trim()) return;
    setSending(true);
    setError('');
    setNotice('');
    try {
      const r = await api.replyConversation(businessId, open.id, draft.trim());
      setDraft('');
      if (r.sent) setNotice(L.sent);
      else setError(L.notSent);
      await load();
    } catch (e) {
      setError(errText(e));
    } finally {
      setSending(false);
    }
  };

  const closeDeal = async (c: Conversation, action: 'won' | 'lost' | 'ai') => {
    if (!businessId) return;
    setDealBusy(true);
    setError('');
    try {
      await api.closeDeal(businessId, c.id, action);
      setNotice(action === 'won' ? L.wonHint : action === 'lost' ? L.lostHint : '');
      await load();
    } catch (e) {
      setError(errText(e));
    } finally {
      setDealBusy(false);
    }
  };

  const toggleAi = async (c: Conversation) => {
    if (!businessId) return;
    const next = !(c.ai_enabled ?? true);
    setConvs((xs) => (xs || []).map((x) => (x.id === c.id ? { ...x, ai_enabled: next } : x)));
    try {
      await api.toggleConversationAi(businessId, c.id, next);
    } catch (e) {
      setError(errText(e));
      await load();
    }
  };

  const saveTone = async () => {
    if (!businessId) return;
    setToneBusy(true);
    setError('');
    try {
      await api.setAiTone(businessId, tone.trim());
      setToneSaved(true);
      window.setTimeout(() => setToneSaved(false), 1500);
    } catch (e) {
      setError(errText(e));
    } finally {
      setToneBusy(false);
    }
  };

  const platformIcon = (p: string) =>
    p.startsWith('instagram')
      ? <Instagram className="w-3.5 h-3.5 text-pink-600 shrink-0" />
      : <Send className="w-3.5 h-3.5 text-sky-600 shrink-0" />;

  const name = (c: Conversation) => c.customer_name || c.customer_id || L.customer;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-x-hidden font-sans text-slate-900 w-full max-w-full">
      <div className="bg-white border-b border-slate-200/80 px-3 py-2.5 shrink-0 w-full">
        <div className="flex items-center gap-2">
          <button onClick={open ? () => setOpenId(null) : onBack} title={L.back}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 active:scale-95">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5 truncate">
            {open ? <>{platformIcon(open.platform)}<span className="truncate">{name(open)}</span></>
              : <><MessagesSquare className="w-4 h-4 text-purple-600 shrink-0" /><span>{L.title}</span></>}
          </h1>
        </div>
        {!open && (
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
            {([
              { id: 'hot' as const, label: hotCount ? `${L.hot} · ${hotCount}` : L.hot, icon: <Flame className="w-3.5 h-3.5" /> },
              { id: 'comments' as const, label: L.comments, icon: <MessageCircle className="w-3.5 h-3.5" /> },
              { id: 'direct' as const, label: L.direct, icon: <Send className="w-3.5 h-3.5" /> },
              { id: 'tone' as const, label: L.tone, icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
            ]).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 shrink-0 whitespace-nowrap ${
                  tab === t.id ? (t.id === 'hot' ? 'bg-orange-500 text-white' : 'bg-purple-600 text-white')
                    : (t.id === 'hot' && hotCount ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600')}`}>
                {t.icon}<span>{t.label}</span>
              </button>
            ))}
          </div>
        )}
        {open && (
          <button onClick={() => toggleAi(open)} className="mt-2 flex items-center gap-2 text-[11.5px] font-bold">
            <span className={`w-9 h-5 rounded-full relative transition-colors ${(open.ai_enabled ?? true) ? 'bg-purple-600' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${(open.ai_enabled ?? true) ? 'left-4' : 'left-0.5'}`} />
            </span>
            {(open.ai_enabled ?? true) ? L.aiOn : L.aiOff}
            <span className="text-[10.5px] font-normal text-slate-400">{L.aiHint}</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 w-full space-y-2.5 pb-4">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-3.5 py-2.5 text-xs font-semibold">{error}</div>
        )}
        {notice && !error && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-3.5 py-2 text-xs font-semibold">{notice}</div>
        )}

        {!open && tab !== 'tone' && convs === null && (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-purple-600 animate-spin" /></div>
        )}
        {!open && tab !== 'tone' && convs && list.length === 0 && (
          <p className="text-center text-[12px] text-slate-500 py-10 px-4">{tab === 'hot' ? L.emptyHot : tab === 'comments' ? L.emptyComments : L.emptyDirect}</p>
        )}
        {!open && tab === 'hot' && list.length > 0 && (
          <p className="text-[11.5px] text-orange-800 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2 leading-snug flex gap-2">
            <Flame className="w-3.5 h-3.5 shrink-0 mt-0.5" />{L.hotHint}
          </p>
        )}
        {!open && tab !== 'tone' && list.map(({ c, last }) => (
          <button key={c.id} onClick={() => { setOpenId(c.id); setNotice(''); setError(''); }}
            className="w-full text-left bg-white border border-slate-200/90 rounded-2xl p-3 flex gap-3 active:scale-[0.99]">
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm shrink-0">
              {name(c).replace('@', '').slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {platformIcon(c.platform)}
                <span className="text-[12.5px] font-bold truncate">{name(c)}</span>
                <span className="ml-auto text-[10.5px] text-slate-400 shrink-0">{when(last?.timestamp || c.created_at, lang)}</span>
              </div>
              <p className="text-[11.5px] text-slate-500 truncate mt-0.5">
                {last ? `${last.role === 'customer' ? '' : (last.role === 'ai' ? 'AI: ' : `${L.operator}: `)}${last.text}` : ''}
              </p>
              {c.deal && (
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10.5px]">
                  <span className={`px-1.5 py-[1px] rounded-md font-bold ${STAGE_CLS[c.deal.stage] || STAGE_CLS.interest}`}>{L.stage[c.deal.stage]}</span>
                  {c.deal.product && <span className="text-slate-600 truncate max-w-[55%]">{c.deal.product}</span>}
                  {c.deal.phone && <span className="text-slate-500">· {c.deal.phone}</span>}
                </p>
              )}
              {c.ai_enabled === false && <span className="text-[10px] font-bold text-amber-700">{L.aiOff}</span>}
            </div>
          </button>
        ))}

        {open && open.deal && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-600 shrink-0" />
              <p className="text-[12.5px] font-black flex-1">{L.dealTitle}</p>
              <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${STAGE_CLS[open.deal.stage] || STAGE_CLS.interest}`}>{L.stage[open.deal.stage]}</span>
            </div>
            <div className="text-[12px] text-slate-700 space-y-0.5">
              {open.deal.product && <p><b>{L.product}:</b> {open.deal.product}{open.deal.quantity && open.deal.quantity > 1 ? ` × ${open.deal.quantity}` : ''}</p>}
              {open.deal.amount ? <p><b>{L.sum}:</b> {new Intl.NumberFormat('ru-RU').format(open.deal.amount)} ₸</p> : null}
              {open.deal.phone && <p className="flex items-center gap-1.5"><b>{L.phone}:</b> <a href={`tel:${open.deal.phone}`} className="text-blue-600 font-semibold inline-flex items-center gap-1"><Phone className="w-3 h-3" />{open.deal.phone}</a></p>}
              {open.deal.address && <p><b>{L.address}:</b> {open.deal.address}</p>}
              {open.deal.note && <p><b>{L.note}:</b> {open.deal.note}</p>}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => closeDeal(open, 'won')} disabled={dealBusy}
                className="flex-1 h-9 rounded-xl bg-emerald-600 text-white text-[12px] font-bold flex items-center justify-center gap-1 disabled:opacity-50">
                <Check className="w-3.5 h-3.5" />{L.won}
              </button>
              <button onClick={() => closeDeal(open, 'lost')} disabled={dealBusy}
                className="flex-1 h-9 rounded-xl border border-slate-300 bg-white text-slate-700 text-[12px] font-bold flex items-center justify-center gap-1 disabled:opacity-50">
                <X className="w-3.5 h-3.5" />{L.lost}
              </button>
              <button onClick={() => closeDeal(open, 'ai')} disabled={dealBusy}
                className="h-9 px-3 rounded-xl border border-slate-300 bg-white text-slate-600 text-[11.5px] font-bold flex items-center justify-center gap-1 disabled:opacity-50">
                <Bot className="w-3.5 h-3.5" />{L.backToAi}
              </button>
            </div>
          </div>
        )}

        {open && open.messages.map((m, i) => {
          const mine = m.role !== 'customer';
          return (
            <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed whitespace-pre-line ${
                mine ? (m.role === 'ai' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-white') : 'bg-white border border-slate-200'}`}>
                <p className={`text-[10px] font-bold mb-0.5 flex items-center gap-1 ${mine ? 'text-white/70' : 'text-slate-400'}`}>
                  {m.role === 'ai' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {m.role === 'customer' ? name(open) : m.role === 'ai' ? L.ai : L.operator}
                  <span className="font-normal">· {when(m.timestamp, lang)}</span>
                </p>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />

        {!open && tab === 'tone' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5">
            <h2 className="text-sm font-black">{L.toneTitle}</h2>
            <p className="text-[11px] text-slate-500">{L.toneHint}</p>
            <textarea value={tone} onChange={(e) => setTone(e.target.value)} rows={4} maxLength={1000}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-[12.5px] outline-none focus:border-purple-400 resize-none" />
            <button onClick={saveTone} disabled={toneBusy}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-60">
              {toneBusy && <Loader2 className="w-4 h-4 animate-spin" />}{toneSaved ? L.saved : L.save}
            </button>
          </div>
        )}
      </div>

      {open && (
        <div className="bg-white border-t border-slate-200 p-2.5 flex gap-2 shrink-0">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={L.placeholder} maxLength={4000}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-[12.5px] outline-none focus:border-purple-400" />
          <button onClick={send} disabled={sending || !draft.trim()}
            className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center disabled:opacity-50">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};

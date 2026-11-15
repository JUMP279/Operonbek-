import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Crown, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, PlanUsage } from '../lib/api';

// Tarif — REAL (2026-11-08): joriy tarif va shu oydagi foydalanish backend'dan.
// Avval o'ylab topilgan imkoniyatlar (bank integratsiyasi, VIP menejer, raqobatchi radari...)
// va hech narsa saqlamaydigan "faollashtirish" bor edi. Onlayn to'lov hali ulanmagan.
// 2026-11-13: "Подключить" → POST /auth/plan (so'rov) → Operon admini Telegram'da tasdiqlaydi.
export interface SubscriptionPlanViewProps {
  onBack: () => void;
  storeContext?: { businessId?: string };
}

type PlanId = 'starter' | 'growth' | 'business';

// Narx va funksiyalar backend bilan bir xil: services/billing.py (PLAN_PRICES_USD, PLAN_FEATURES), models/video.py
const PRICES: Record<PlanId, string> = { starter: '20', growth: '49.90', business: '79.99' };

const T = {
  ru: {
    title: 'Тариф', current: 'Ваш тариф', trial: 'Пробный период', until: 'до',
    usage: 'Использовано в этом месяце', videos: 'AI-видео', posts: 'Опубликованные посты',
    perMonth: '/ мес', active: 'Текущий',
    soon: 'Онлайн-оплата скоро. Сейчас: нажмите «Подключить» — мы свяжемся, примем оплату и включим тариф.',
    connect: 'Подключить', pending: 'Заявка отправлена', pendingNote: (p: string) => `Заявка на тариф ${p} отправлена. Мы свяжемся с вами для оплаты.`,
    expired: 'Срок действия закончился — видео и посты не создаются. Выберите тариф.',
    daysLeft: (n: number) => `осталось ${n} дн.`, reqError: 'Не удалось отправить заявку, попробуйте ещё раз',
    features: (p: PlanId) => ({
      starter: [
        '15 AI-видео и 15 постов в месяц',
        'Через день: день видео, день пост',
        'Instagram и Telegram',
        '1 маркетплейс на выбор — Kaspi, Wildberries или Uzum',
        'AI отвечает клиентам, товары и заказы',
      ],
      growth: [
        'Каждый день: 1 AI-видео + 1 пост',
        'Instagram и Telegram вместе',
        'Анализ бизнеса и конкурентов',
        'Kaspi, Wildberries, Uzum — все 3 маркетплейса',
        'Все функции Operon',
      ],
      business: [
        'Каждый день: 3 AI-видео + 3 поста',
        'Reels в 12:30, 18:30 и 21:30 — когда смотрят больше всего',
        'Все функции + все 3 маркетплейса',
        'Новости Operon и ранний доступ к новым функциям',
        'Прямой контакт для связи с администраторами Operon',
      ],
    }[p]),
    adminContact: 'Связь с администраторами Operon',
    error: 'Не удалось загрузить данные тарифа',
  },
  kk: {
    title: 'Тариф', current: 'Сіздің тарифіңіз', trial: 'Сынақ кезеңі', until: 'дейін',
    usage: 'Осы айда қолданылды', videos: 'AI-бейне', posts: 'Жарияланған посттар',
    perMonth: '/ ай', active: 'Ағымдағы',
    soon: 'Онлайн төлем жақында. Қазір: «Қосу» батырмасын басыңыз — біз хабарласып, төлемді қабылдап, тарифті қосамыз.',
    connect: 'Қосу', pending: 'Өтінім жіберілді', pendingNote: (p: string) => `${p} тарифіне өтінім жіберілді. Төлем үшін сізбен хабарласамыз.`,
    expired: 'Мерзім аяқталды — бейне мен посттар жасалмайды. Тариф таңдаңыз.',
    daysLeft: (n: number) => `${n} күн қалды`, reqError: 'Өтінім жіберілмеді, қайта көріңіз',
    features: (p: PlanId) => ({
      starter: [
        'Айына 15 AI-бейне және 15 пост',
        'Күн аралатып: бір күн бейне, бір күн пост',
        'Instagram және Telegram',
        'Таңдауыңызша 1 маркетплейс — Kaspi, Wildberries немесе Uzum',
        'AI клиенттерге жауап береді, тауарлар мен тапсырыстар',
      ],
      growth: [
        'Күн сайын: 1 AI-бейне + 1 пост',
        'Instagram және Telegram бірге',
        'Бизнес пен бәсекелестер талдауы',
        'Kaspi, Wildberries, Uzum — 3 маркетплейс',
        'Operon-ның барлық мүмкіндіктері',
      ],
      business: [
        'Күн сайын: 3 AI-бейне + 3 пост',
        'Reels 12:30, 18:30 және 21:30-да — ең көп қарайтын уақытта',
        'Барлық мүмкіндік + 3 маркетплейс',
        'Operon жаңалықтары және жаңа мүмкіндіктерге алғашқы қолжетімділік',
        'Operon әкімшілерімен байланысуға тікелей контакт',
      ],
    }[p]),
    adminContact: 'Operon әкімшілерімен байланыс',
    error: 'Тариф деректері жүктелмеді',
  },
};

const NAMES: Record<PlanId, string> = { starter: 'Starter', growth: 'Growth', business: 'Business' };

export const SubscriptionPlanView: React.FC<SubscriptionPlanViewProps> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();
  const lang: 'ru' | 'kk' = language === 'ru' ? 'ru' : 'kk';
  const L = T[lang];
  const businessId = storeContext?.businessId;
  const [usage, setUsage] = useState<PlanUsage | null>(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState<PlanId | null>(null);

  const requestPlan = async (p: PlanId) => {
    setSending(p);
    setError('');
    try {
      await api.requestPlan(p);
      setUsage((u) => (u ? { ...u, pending_plan: p } : u));
    } catch {
      setError(L.reqError);
    } finally {
      setSending(null);
    }
  };

  useEffect(() => {
    if (!businessId) return;
    api.planUsage(businessId).then(setUsage).catch(() => setError(L.error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const currentId: PlanId | null = usage && (['starter', 'growth', 'business'] as string[]).includes(usage.plan)
    ? (usage.plan as PlanId) : null;
  const expired = usage?.state === 'expired';
  const pending = (usage?.pending_plan || null) as PlanId | null;

  const bar = (used: number, limit: number) => (
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${Math.min(100, (used / Math.max(1, limit)) * 100)}%` }} />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-x-hidden font-sans text-slate-900 w-full max-w-full">
      <div className="bg-white border-b border-slate-200/80 px-3 py-2.5 shrink-0 w-full flex items-center gap-2">
        <button onClick={onBack}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 active:scale-95">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-purple-600" />{L.title}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 w-full space-y-3 pb-16">
        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
        {!usage && !error && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-purple-600 animate-spin" /></div>}

        {expired && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-3 text-[12px] font-semibold">{L.expired}</div>
        )}
        {pending && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-3 text-[12px] font-semibold">
            {L.pendingNote(NAMES[pending] || pending)}
          </div>
        )}

        {usage && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{L.current}</p>
              <p className="text-lg font-black">
                {currentId ? NAMES[currentId] : L.trial}
                {usage.trial_end && (
                  <span className="text-[12px] font-semibold text-slate-500">
                    {' '}· {L.until} {new Date(usage.trial_end).toLocaleDateString(lang === 'kk' ? 'kk-KZ' : 'ru-RU')}
                    {!expired && usage.days_left != null && ` (${L.daysLeft(usage.days_left)})`}
                  </span>
                )}
              </p>
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{L.usage}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-[12px] font-semibold"><span>{L.videos}</span><span>{usage.videos_used} / {usage.videos_limit}</span></div>
              {bar(usage.videos_used, usage.videos_limit)}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[12px] font-semibold"><span>{L.posts}</span><span>{usage.posts_used} / {usage.posts_limit}</span></div>
              {bar(usage.posts_used, usage.posts_limit)}
            </div>
          </div>
        )}

        {usage?.admin_contact && (
          <div className="bg-purple-50 border border-purple-200 text-purple-900 rounded-2xl p-3 text-[12px] font-semibold">
            {L.adminContact}: {usage.admin_contact}
          </div>
        )}

        {/* Bepul sinov — alohida kartochka (sayt va landing bilan bir xil) */}
        <div className={`bg-white rounded-2xl p-3.5 space-y-2 border-2 border-dashed ${usage?.state === 'trial' ? 'border-emerald-500' : 'border-emerald-200'}`}>
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-black">{lang === 'kk' ? 'Тегін' : 'Бесплатно'}</p>
            {usage?.state === 'trial'
              ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{L.active}</span>
              : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">🎁</span>}
          </div>
          <p className="text-[11px] text-slate-500">{lang === 'kk' ? 'Operon-ды өз бизнесіңізде байқап көру' : 'Попробовать Operon на своём бизнесе'}</p>
          <p className="text-[20px] font-black">$0 <span className="text-[12px] font-semibold text-slate-500">/ {lang === 'kk' ? '14 күн' : '14 дней'}</span></p>
          <ul className="space-y-1">
            {(lang === 'kk'
              ? ['Күн сайын: 1 бейне + 1 пост', 'Instagram және Telegram', '24/7 AI-сатушы клиенттерге жауап береді', 'Барлық мүмкіндік, шектеусіз', 'Картасыз, міндеттемесіз']
              : ['Каждый день: 1 видео + 1 пост', 'Instagram и Telegram', 'AI-продавец отвечает клиентам 24/7', 'Все функции, без ограничений', 'Без карты и обязательств']
            ).map((f) => (
              <li key={f} className="text-[12px] text-slate-600 flex gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />{f}</li>
            ))}
          </ul>
          <p className="w-full h-10 rounded-xl text-[12.5px] font-bold flex items-center justify-center bg-emerald-50 text-emerald-700">
            {usage?.state === 'trial'
              ? (lang === 'kk' ? `Белсенді · ${usage.days_left ?? '—'} күн қалды` : `Активен · осталось ${usage.days_left ?? '—'} дн.`)
              : (lang === 'kk' ? 'Сынақ мерзімі пайдаланылды' : 'Пробный период использован')}
          </p>
        </div>

        {(['starter', 'growth', 'business'] as PlanId[]).map((p) => (
          <div key={p} className={`bg-white rounded-2xl p-3.5 space-y-2 border ${currentId === p ? 'border-purple-500' : 'border-slate-200/90'}`}>
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-black">{NAMES[p]}</p>
              {currentId === p && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{L.active}</span>}
            </div>
            <p className="text-[20px] font-black">${PRICES[p]} <span className="text-[12px] font-semibold text-slate-500">{L.perMonth}</span></p>
            <ul className="space-y-1">
              {L.features(p).map((f) => (
                <li key={f} className="text-[12px] text-slate-600 flex gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />{f}</li>
              ))}
            </ul>
            {!(currentId === p && !expired) && (
              <button
                onClick={() => requestPlan(p)}
                disabled={!!sending || pending === p}
                className={`w-full h-10 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition ${
                  pending === p ? 'bg-amber-100 text-amber-800' : 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60'}`}>
                {sending === p && <Loader2 className="w-4 h-4 animate-spin" />}
                {pending === p ? L.pending : L.connect}
              </button>
            )}
          </div>
        ))}

        <p className="text-center text-[11px] text-slate-500">{L.soon}</p>
      </div>
    </div>
  );
};

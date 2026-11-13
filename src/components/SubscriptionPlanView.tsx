import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Crown, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, PlanUsage } from '../lib/api';

// Tarif — REAL (2026-11-08): joriy tarif va shu oydagi foydalanish backend'dan.
// Avval o'ylab topilgan imkoniyatlar (bank integratsiyasi, VIP menejer, raqobatchi radari...)
// va hech narsa saqlamaydigan "faollashtirish" bor edi. Onlayn to'lov hali ulanmagan.
export interface SubscriptionPlanViewProps {
  onBack: () => void;
  storeContext?: { businessId?: string };
}

type PlanId = 'starter' | 'growth' | 'business';

const PRICES: Record<PlanId, number> = { starter: 15.99, growth: 28.99, business: 59.99 };
const VIDEOS: Record<PlanId, number> = { starter: 15, growth: 30, business: 60 };

const T = {
  ru: {
    title: 'Тариф', current: 'Ваш тариф', trial: 'Пробный период', until: 'до',
    usage: 'Использовано в этом месяце', videos: 'AI-видео', posts: 'Опубликованные посты',
    perMonth: '/ мес', active: 'Текущий', soon: 'Онлайн-оплата скоро будет доступна',
    cadence: { starter: 'каждые 2 дня', growth: 'каждый день', business: '2 в день' } as Record<PlanId, string>,
    features: (p: PlanId) => [
      `${VIDEOS[p]} AI-видео в месяц (${T.ru.cadence[p]}) — Reels + Stories`,
      'Ежедневный пост в Instagram и Telegram с картинкой',
      'AI отвечает на комментарии и сообщения клиентов',
      'Товары, заказы и уведомления',
    ],
    error: 'Не удалось загрузить данные тарифа',
  },
  kk: {
    title: 'Тариф', current: 'Сіздің тарифіңіз', trial: 'Сынақ кезеңі', until: 'дейін',
    usage: 'Осы айда қолданылды', videos: 'AI-бейне', posts: 'Жарияланған посттар',
    perMonth: '/ ай', active: 'Ағымдағы', soon: 'Онлайн төлем жақында қосылады',
    cadence: { starter: '2 күнде 1', growth: 'күн сайын', business: 'күніне 2' } as Record<PlanId, string>,
    features: (p: PlanId) => [
      `Айына ${VIDEOS[p]} AI-бейне (${T.kk.cadence[p]}) — Reels + Stories`,
      'Instagram мен Telegram-ға күн сайын суретті пост',
      'AI клиенттердің пікірлері мен хабарларына жауап береді',
      'Тауарлар, тапсырыстар және хабарламалар',
    ],
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

  useEffect(() => {
    if (!businessId) return;
    api.planUsage(businessId).then(setUsage).catch(() => setError(L.error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const currentId: PlanId | null = usage && (['starter', 'growth', 'business'] as string[]).includes(usage.plan)
    ? (usage.plan as PlanId) : null;

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

        {usage && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{L.current}</p>
              <p className="text-lg font-black">
                {currentId ? NAMES[currentId] : L.trial}
                {usage.trial_end && (
                  <span className="text-[12px] font-semibold text-slate-500">
                    {' '}· {L.until} {new Date(usage.trial_end).toLocaleDateString(lang === 'kk' ? 'kk-KZ' : 'ru-RU')}
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
          </div>
        ))}

        <p className="text-center text-[11px] text-slate-500">{L.soon}</p>
      </div>
    </div>
  );
};

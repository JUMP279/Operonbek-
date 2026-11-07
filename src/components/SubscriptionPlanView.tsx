import React, { useState } from 'react';
import { ArrowLeft, Check, Crown, Sparkles, Shield, CheckCircle2, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface SubscriptionPlanViewProps {
  onBack: () => void;
  currentPlanId?: 'starter' | 'growth' | 'bizness';
  onSelectPlan?: (planId: string) => void;
}

export const SubscriptionPlanView: React.FC<SubscriptionPlanViewProps> = ({
  onBack,
  currentPlanId = 'starter',
  onSelectPlan
}) => {
  const { language } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'bizness'>(currentPlanId);
  const [activatedSuccess, setActivatedSuccess] = useState<string | null>(null);

  const plans = [
    {
      id: 'starter' as const,
      name: language === 'ru' ? 'Starter Plan' : 'Starter тарифі',
      subtitle: language === 'ru' 
        ? 'Базовый тариф для малого бизнеса' 
        : 'Шағын дүкендер мен бастапқы автоматтандыру',
      monthlyPrice: 15.99,
      originalMonthlyPrice: 18.99,
      yearlyPrice: 12.99,
      originalYearlyPrice: 15.99,
      badge: language === 'ru' ? 'Включено' : 'Қосылған',
      features: language === 'ru' ? [
        'Неограниченное число клиентов и заказов',
        'Инвойсы и прием платежей',
        'Коммерческие предложения и договоры',
        'Базовый ИИ бизнес-ассистент'
      ] : [
        'Шексіз клиенттер мен тапсырыстар',
        'Шот-фактуралар және төлем жүйесі',
        'Ұсыныстар мен ресми шарттар',
        'AI негізгі бизнес көмекшісі'
      ]
    },
    {
      id: 'growth' as const,
      name: language === 'ru' ? 'Growth Plan' : 'Growth тарифі',
      subtitle: language === 'ru' 
        ? 'Для растущих магазинов и команд' 
        : 'Жылдам дамып келе жатқан бизнес пен командалар',
      monthlyPrice: 28.99,
      originalMonthlyPrice: 34.99,
      yearlyPrice: 22.99,
      originalYearlyPrice: 28.99,
      badge: language === 'ru' ? 'Популярный' : 'Танымал',
      features: language === 'ru' ? [
        'Удаление копирайта Operon',
        'Управление расходами и чистая прибыль',
        'Интеграция с банками и бухгалтерией',
        'AI голосовой оператор (1,000 мин)',
        'Полная автоматизация Telegram и Instagram'
      ] : [
        'Operon бренд белгісін алып тастау',
        'Шығындар мен таза пайда талдауы',
        'Банк және бухгалтерлік интеграция',
        'AI Дауыстық оператор (1,000 мин)',
        'Telegram & Instagram толық автоматтандыру'
      ]
    },
    {
      id: 'bizness' as const,
      name: language === 'ru' ? 'Bizness Plan' : 'Bizness тарифі',
      subtitle: language === 'ru' 
        ? 'Для крупных сетей и дистрибьюторов' 
        : 'Ірі желілер мен дистрибьюторлар үшін',
      monthlyPrice: 59.99,
      originalMonthlyPrice: 69.99,
      yearlyPrice: 47.99,
      originalYearlyPrice: 59.99,
      badge: language === 'ru' ? 'VIP' : 'VIP',
      features: language === 'ru' ? [
        'Персональный 24/7 VIP менеджер',
        'Синхронизация складов нескольких филиалов',
        'Индивидуальная AI модель под ваш магазин',
        'Неограниченные сотрудники и права доступа',
        'Радар цен конкурентов в реальном времени'
      ] : [
        'Жеке 24/7 VIP менеджер',
        'Көп филиалды қойма және касса үндестіруі',
        'Дүкеніңізге бейімделген жеке AI моделі',
        'Шексіз қызметкерлер мен касса рөлдері',
        'Нақты уақыттағы бәсекелестер радары'
      ]
    }
  ];

  const handleActivate = (planId: 'starter' | 'growth' | 'bizness') => {
    setSelectedPlan(planId);
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
    const chosenPlan = plans.find(p => p.id === planId);
    setActivatedSuccess(`${chosenPlan?.name || planId} muvaffaqiyatli tanlandi!`);
    setTimeout(() => {
      setActivatedSuccess(null);
    }, 2800);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-hidden select-none font-sans">
      {/* Top Header - exactly styled with rounded back button */}
      <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center transition-all shadow-xs active:scale-95"
          title={language === 'ru' ? 'Назад' : 'Артқа'}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {language === 'ru' ? 'Тарифные планы' : 'Тарифтер мен жазылым'}
        </h2>

        {/* Empty balancing spacer */}
        <div className="w-10 h-10" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 pb-10">
        {/* Billing Cycle Switcher: Monthly / Yearly */}
        <div className="flex items-center justify-center p-1 bg-slate-100/90 rounded-2xl max-w-[340px] mx-auto border border-slate-200/60">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ru' ? 'Ежемесячно' : 'Ай сайын'}
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{language === 'ru' ? 'Ежегодно' : 'Жылдық'}</span>
            <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-extrabold ${
              billingCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
            }`}>
              -20%
            </span>
          </button>
        </div>

        {/* Success Toast */}
        {activatedSuccess && (
          <div className="p-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{activatedSuccess}</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
              {language === 'ru' ? 'Активен' : 'Белсенді'}
            </span>
          </div>
        )}

        {/* Plans List */}
        <div className="space-y-4 max-w-md mx-auto">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const currentPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const origPrice = billingCycle === 'monthly' ? plan.originalMonthlyPrice : plan.originalYearlyPrice;

            if (isSelected) {
              // Highlighted Purple Card - matches uploaded screenshot
              return (
                <div
                  key={plan.id}
                  onClick={() => handleActivate(plan.id)}
                  className="relative overflow-hidden rounded-[26px] p-5 text-white bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] shadow-xl shadow-purple-500/20 transition-all cursor-pointer border border-purple-400/30 active:scale-[0.99]"
                >
                  {/* Decorative organic background curves */}
                  <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-purple-400/20 blur-lg pointer-events-none" />

                  {/* Header Row: Crown Icon & Included Badge */}
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="w-9 h-9 flex items-center justify-center">
                      <Crown className="w-8 h-8 text-white fill-white/20 drop-shadow-sm" />
                    </div>

                    <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/25 shadow-2xs">
                      {plan.badge}
                    </span>
                  </div>

                  {/* Plan Name & Price Row */}
                  <div className="flex items-start justify-between gap-2 relative z-10 mb-4">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-white">{plan.name}</h3>
                      <p className="text-xs text-purple-100 font-normal mt-0.5 leading-snug">
                        {plan.subtitle}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black tracking-tight text-white">
                        ${currentPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-purple-200 line-through font-medium">
                        ${origPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Features Section */}
                  <div className="relative z-10 pt-2 border-t border-white/20 space-y-2.5">
                    <div className="text-xs font-bold text-white tracking-wide">
                      {language === 'ru' ? 'Возможности' : 'Мүмкіндіктер'}
                    </div>

                    <div className="space-y-2">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs text-purple-50">
                          <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                          </div>
                          <span className="leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Indicator Strip */}
                  <div className="mt-4 pt-2.5 flex items-center justify-between text-[11px] font-bold text-purple-100">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                      {language === 'ru' ? 'Текущий активный тариф' : 'Қазіргі белсенді тариф'}
                    </span>
                    <span className="text-xs font-black underline underline-offset-2">
                      {language === 'ru' ? 'Активен' : 'Белсенді'}
                    </span>
                  </div>
                </div>
              );
            }

            // Standard Light Card
            return (
              <div
                key={plan.id}
                onClick={() => handleActivate(plan.id)}
                className="relative overflow-hidden rounded-[26px] p-5 bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer active:scale-[0.99] group"
              >
                {/* Header Row: Crown Icon & Included Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-slate-800" />
                  </div>

                  <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/60 group-hover:bg-purple-50 group-hover:text-purple-700 transition-colors">
                    {plan.badge}
                  </span>
                </div>

                {/* Plan Name & Price Row */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-purple-700 transition-colors">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal mt-0.5 leading-snug">
                      {plan.subtitle}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black tracking-tight text-slate-900">
                      ${currentPrice.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400 line-through font-medium">
                      ${origPrice.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div className="text-xs font-bold text-slate-800 tracking-wide">
                    {language === 'ru' ? 'Возможности' : 'Мүмкіндіктер'}
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-600">
                        <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors">
                          <Check className="w-2.5 h-2.5 text-slate-600 group-hover:text-purple-700 stroke-[3]" />
                        </div>
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Select Action */}
                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-purple-700">
                  <span>{language === 'ru' ? 'Перейти на этот тариф' : 'Осы тарифке өту'}</span>
                  <span className="px-3 py-1 rounded-xl bg-slate-100 group-hover:bg-purple-600 group-hover:text-white transition-all text-[11px]">
                    {language === 'ru' ? 'Выбрать' : 'Таңдау'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

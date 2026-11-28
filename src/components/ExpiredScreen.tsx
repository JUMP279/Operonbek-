import { isUz } from '../context/LanguageContext';
import React from 'react';
import { PauseCircle, CreditCard, LifeBuoy, LogOut } from 'lucide-react';
import type { PlanUsage } from '../lib/api';

/**
 * Tarif muddati tugagan (2026-11-22, user qarori): FindLead BUTUNLAY to'xtaydi — video, post, analitika,
 * biznes-tahlil va mijozlarga AI javobi. 7 kun ichida tarif tanlansa ma'lumotlar saqlanadi, aks holda o'chadi.
 * Sayt bilan bir xil matn: operon/src/components/cabinet/ExpiredNotice.tsx
 */
export function ExpiredScreen({ usage, lang, onChoosePlan, onSupport, onLogout }: {
  usage: PlanUsage;
  lang: 'uz' | 'ru' | 'kk';
  onChoosePlan: () => void;
  onSupport: () => void;
  onLogout: () => void;
}) {
  const ru = lang === 'ru';
  const left = usage.grace_days_left ?? null;
  const purge = usage.purge_at ? new Date(usage.purge_at) : null;
  const purgeStr = purge
    ? purge.toLocaleDateString(isUz() ? 'uz-UZ' : ru ? 'ru-RU' : 'kk-KZ', { day: 'numeric', month: 'long' })
    : null;
  const wasTrial = usage.plan === 'trial';

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar">
      <div className="mt-4 rounded-3xl bg-white border border-rose-200 shadow-sm p-5 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
          <PauseCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="mt-3 text-[20px] font-extrabold text-slate-900 leading-tight">
          {usage.no_trial
            ? (isUz() ? "Bepul sinov bu akkauntga berilmadi" : ru ? 'Бесплатный период для этого аккаунта недоступен' : 'Бұл аккаунтқа тегін кезең берілмеді')
            : wasTrial
            ? ((isUz() ? "Bepul 14 kun tugadi" : ru ? 'Бесплатные 14 дней закончились' : 'Тегін 14 күн аяқталды'))
            : ((isUz() ? "Tarif muddati tugadi" : ru ? 'Срок тарифа истёк' : 'Тариф мерзімі аяқталды'))}
        </h1>
        {usage.no_trial ? (
          <p className="mt-2 text-[13px] text-slate-600 leading-snug">
            {usage.trial_used_by
              ? (isUz() ? `Bepul 14 kun har bir tadbirkorga bir marta beriladi — bu qurilma yoki email'da u avval «${usage.trial_used_by}» do'koni orqali olingan. Ishni boshlash uchun tarifni tanlang: akkauntingiz va sozlamalaringiz saqlanadi, hech narsa o'chirilmaydi.` : ru ? `Бесплатные 14 дней даются один раз на предпринимателя — на этом устройстве или email их уже получил магазин «${usage.trial_used_by}». Чтобы начать работу, выберите тариф: аккаунт и настройки сохранены, ничего не удаляется.` : `Тегін 14 күн әр кәсіпкерге бір рет беріледі — бұл құрылғыда немесе email-да оны бұрын «${usage.trial_used_by}» дүкені алған. Жұмысты бастау үшін тариф таңдаңыз: аккаунт пен баптаулар сақталады, ештеңе өшірілмейді.`)
              : (isUz() ? "Bepul 14 kun har bir tadbirkorga bir marta beriladi — bu email yoki qurilmada u avval ishlatilgan. Ishni boshlash uchun tarifni tanlang: akkauntingiz va sozlamalaringiz saqlanadi, hech narsa o'chirilmaydi." : ru ? 'Бесплатные 14 дней даются один раз на предпринимателя — на этом email или устройстве они уже использовались. Чтобы начать работу, выберите тариф: аккаунт и настройки сохранены, ничего не удаляется.' : 'Тегін 14 күн әр кәсіпкерге бір рет беріледі — бұл email немесе құрылғыда ол бұрын қолданылған. Жұмысты бастау үшін тариф таңдаңыз: аккаунт пен баптаулар сақталады, ештеңе өшірілмейді.')}
          </p>
        ) : (<>
        <p className="mt-2 text-[13px] text-slate-600 leading-snug">
          {(isUz() ? "FindLead butunlay to'xtatildi: video va postlar yaratmaydi, nashr qilmaydi, mijozlarga javob bermaydi va sizning nomingizdan biznes tahlili va analitikani qilmaydi." : ru
            ? 'FindLead полностью остановлен: не создаёт видео и посты, не публикует, не отвечает клиентам и не делает аналитику и анализ бизнеса от вашего имени.'
            : 'FindLead толық тоқтатылды: сіздің атыңыздан видео мен пост жасамайды, жарияламайды, клиенттерге жауап бермейді, аналитика мен бизнес талдауын жасамайды.')}
        </p>

        <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-left">
          <div className="text-[13px] font-bold text-rose-700">
            {left != null && left > 0
              ? ((isUz() ? `Qoldi ${left} kun` : ru ? `Осталось ${left} дн.` : `${left} күн қалды`))
              : ((isUz() ? "Oxirgi kun" : ru ? 'Последний день' : 'Соңғы күн'))}
            {purgeStr ? ((isUz() ? ` — gacha ${purgeStr}` : ru ? ` — до ${purgeStr}` : ` — ${purgeStr} дейін`)) : ''}
          </div>
          <p className="mt-1 text-[12px] text-rose-700/90 leading-snug">
            {(isUz() ? "7 kun ichida tarifni tanlang — mahsulotlar, mijozlar, dialoglar, videolar va sozlamalar saqlanadi. Agar tanlamasangiz, biznes ma'lumotlaringiz butunlay o'chirib yuboriladi." : ru
              ? 'Выберите тариф в течение 7 дней — товары, клиенты, диалоги, видео и настройки сохранятся. Если не выбрать, все данные бизнеса будут удалены безвозвратно.'
              : '7 күн ішінде тариф таңдаңыз — тауарлар, клиенттер, диалогтар, видео мен баптаулар сақталады. Таңдамасаңыз, бизнестің барлық деректері біржола өшіріледі.')}
          </p>
        </div>
        </>)}

        <button
          onClick={onChoosePlan}
          className="mt-4 w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all"
        >
          <CreditCard className="w-4 h-4" /> {(isUz() ? "Tarifni tanlang" : ru ? 'Выбрать тариф' : 'Тариф таңдау')}
        </button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button onClick={onSupport}
            className="py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-[12px] font-semibold flex items-center justify-center gap-1.5">
            <LifeBuoy className="w-3.5 h-3.5" /> {(isUz() ? "Yordam" : ru ? 'Поддержка' : 'Қолдау')}
          </button>
          <button onClick={onLogout}
            className="py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-[12px] font-semibold flex items-center justify-center gap-1.5">
            <LogOut className="w-3.5 h-3.5" /> {(isUz() ? "Chiqish" : ru ? 'Выйти' : 'Шығу')}
          </button>
        </div>
      </div>
    </div>
  );
}

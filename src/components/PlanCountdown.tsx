import { isUz } from '../context/LanguageContext';
import React, { useEffect, useState } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import type { PlanUsage } from '../lib/api';

/**
 * Tarif/sinov tugashiga qancha qolgani — bosh sahifada DOIM ko'rinadi (2026-11-22, user talabi).
 * Oxirgi sutkada soat/daqiqa bilan. Sayt bilan bir xil: operon/src/components/cabinet/PlanCountdown.tsx
 */
export function timeLeft(until: string | null | undefined, now = Date.now()) {
  if (!until) return null;
  const ms = new Date(until).getTime() - now;
  if (!Number.isFinite(ms)) return null;
  const s = Math.max(0, Math.floor(ms / 1000));
  return { ms, days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60) };
}

export function PlanCountdown({ usage, lang, onOpen }: { usage: PlanUsage; lang: 'uz' | 'ru' | 'kk'; onOpen: () => void }) {
  const ru = lang === 'ru';
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (usage.state === 'expired') return null;            // tugagan — ExpiredScreen ko'rsatiladi
  const t = timeLeft(usage.trial_end, now);
  if (!t) return null;
  const trial = usage.plan === 'trial';
  const urgent = t.days < 3;
  const left = t.days >= 1
    ? ((isUz() ? `${t.days} kun ${t.hours} soat` : ru ? `${t.days} дн. ${t.hours} ч` : `${t.days} күн ${t.hours} сағ`))
    : ((isUz() ? `${t.hours} soat ${t.minutes} daqiqa` : ru ? `${t.hours} ч ${t.minutes} мин` : `${t.hours} сағ ${t.minutes} мин`));
  const end = new Date(usage.trial_end as string).toLocaleDateString(ru ? 'ru-RU' : 'kk-KZ', { day: 'numeric', month: 'long' });
  const title = trial
    ? ((isUz() ? "Bepul davr" : ru ? 'Бесплатный период' : 'Тегін кезең'))
    : ((isUz() ? `Tarif ${usage.plan.charAt(0).toUpperCase()}${usage.plan.slice(1)}` : ru ? `Тариф ${usage.plan.charAt(0).toUpperCase()}${usage.plan.slice(1)}` : `${usage.plan.charAt(0).toUpperCase()}${usage.plan.slice(1)} тарифі`));

  return (
    <button
      onClick={onOpen}
      className={`w-full p-3 rounded-2xl border flex items-center gap-3 text-left active:scale-[0.99] transition-all ${
        urgent ? 'bg-rose-50 border-rose-200' : trial ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100'
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${urgent ? 'bg-rose-100' : 'bg-blue-100'}`}>
        <Clock className={`w-[18px] h-[18px] ${urgent ? 'text-rose-600' : 'text-blue-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-slate-500">{title}</div>
        <div className={`text-[14px] font-extrabold ${urgent ? 'text-rose-700' : 'text-slate-900'}`}>
          {(isUz() ? `${left} qoldi` : ru ? `Осталось ${left}` : `${left} қалды`)}
          <span className="text-[11px] font-medium text-slate-500"> · {(isUz() ? `${end}gacha` : ru ? `до ${end}` : `${end} дейін`)}</span>
        </div>
        {trial && urgent && (
          <div className="text-[10.5px] text-rose-600 mt-0.5 leading-snug">
            {(isUz() ? "Keyin FindLead to'xtaydi — oldindan tarif tanlang." : ru ? 'Потом FindLead остановится — выберите тариф заранее.' : 'Кейін FindLead тоқтайды — тарифті алдын ала таңдаңыз.')}
          </div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
    </button>
  );
}

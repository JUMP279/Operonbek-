import { isUz } from '../context/LanguageContext';
// Kanallarni ulash bloki — ILOVADA Обзор/boshqa joylarda (2026-11-21). Instagram + Telegram kartalari birga,
// aniq sarlavha bilan: "nega va qanday". InstagramConnectCard / TelegramConnectCard mantiqini qayta ishlatadi.
import React from 'react';
import { Link2 } from 'lucide-react';
import { InstagramConnectCard } from './InstagramConnectCard';
import { TelegramConnectCard } from './TelegramConnectCard';

export const ConnectChannelsCard: React.FC<{ businessId?: string | null; lang: 'uz' | 'ru' | 'kk'; heading?: boolean }> = ({ businessId, lang, heading = true }) => {
  const ru = lang === 'ru';
  if (!businessId) return null;
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3 shadow-2xs">
      {heading && (
        <div className="flex items-start gap-2">
          <Link2 className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-[13px] font-black text-slate-900">{(isUz() ? "Akkauntlarni bog'lang" : ru ? 'Подключите аккаунты' : 'Аккаунттарды қосыңыз')}</div>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
              {(isUz() ? "FindLead videolar va postlarni joylashi va mijozlarga javob berishi uchun Instagram va Telegramni bog'lang." : ru ? 'Чтобы FindLead выкладывал видео и посты и отвечал клиентам — подключите Instagram и Telegram.'
                : 'FindLead бейне мен постты шығарып, клиенттерге жауап беруі үшін — Instagram мен Telegram-ды қосыңыз.')}
            </p>
          </div>
        </div>
      )}
      <InstagramConnectCard businessId={businessId} />
      <TelegramConnectCard businessId={businessId} />
    </div>
  );
};

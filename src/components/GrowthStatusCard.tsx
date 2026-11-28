import { isUz } from '../context/LanguageContext';
import React from 'react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { GrowthStatus } from '../lib/api';

// «Рост подписчиков» — haqiqiy raqamlar (2026-11-21, saytdagi cabinet/GrowthStatusCard.tsx bilan bir xil mantiq):
// obunachilar, 7/30 kunlik o'zgarish va Instagram ulanishi ISHLAYAPTIMI (bloklangan bo'lsa — aniq nima qilish).
type Lang = 'uz' | 'ru' | 'kk';

const fmt = (n?: number | null) => (n == null ? '—' : n.toLocaleString('ru-RU'));
const Delta: React.FC<{ v?: number | null; label: string }> = ({ v, label }) => (
  <span className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded-md ${v == null ? 'bg-slate-100 text-slate-400' : v > 0 ? 'bg-emerald-50 text-emerald-700' : v < 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
    {label}: {v == null ? '—' : `${v > 0 ? '+' : ''}${v}`}
  </span>
);

export const igProblemText = (s: GrowthStatus['instagram'], lang: Lang): string | null => {
  const k = lang === 'kk';
  const u = s.username ? `@${s.username}` : 'Instagram';
  if (!s.connected) return (isUz() ? "Instagram ulanmagan — FindLead Reels joylay olmaydi va Directda javob bera olmaydi." : k ? 'Instagram қосылмаған — FindLead Reels жариялай алмайды және Direct-ке жауап бермейді.' : 'Instagram не подключён — FindLead не может публиковать Reels и отвечать в Direct.');
  if (s.problem === 'checkpoint') return (isUz() ? `Instagram ${u} ga kirishni to'xtatib qo'ydi (xavfsizlik tekshiruvi). Brauzerda instagram.com ni oching, ${u} ga kiring va Instagram so'ragan narsani bajaring (kod, telefon yoki «Bu men»). Keyin «Tekshirish» tugmasini bosing. Shu vaqtgacha video va postlar faqat Telegramda chiqadi.` : k
    ? `Instagram ${u} аккаунтына кіруді тоқтатты (тексеру). Браузерде instagram.com ашып, ${u} аккаунтына кіріңіз де, Instagram сұрағанын орындаңыз (код, телефон не «Бұл мен»). Содан кейін «Тексеру» басыңыз. Оған дейін бейне мен пост тек Telegram-ға шығады.`
    : `Instagram приостановил доступ к ${u} (проверка безопасности). Откройте instagram.com в браузере, войдите в ${u} и выполните то, что просит Instagram (код, телефон или «Это я»). Затем нажмите «Проверить». До этого видео и посты выходят только в Telegram.`);
  if (s.problem === 'token') return (isUz() ? "Instagramga kirish muddati tugadi. Profil → Instagram → qayta ulang." : k
    ? 'Instagram рұқсатының мерзімі өтті. Профиль → Instagram → қайта қосыңыз.'
    : 'Доступ к Instagram истёк. Профиль → Instagram → подключите заново.');
  if (s.problem === 'network') return (isUz() ? "Instagram vaqtincha javob bermadi — keyinroq tekshiring." : k ? 'Instagram уақытша жауап бермеді — кейінірек тексеріңіз.' : 'Instagram временно не ответил — проверьте позже.');
  if (s.problem === 'other') return ((isUz() ? "Instagram xatosi: " : k ? 'Instagram қатесі: ' : 'Ошибка Instagram: ')) + (s.error || '');
  return null;
};

export const GrowthStatusCard: React.FC<{ status: GrowthStatus; lang: Lang; busy?: boolean; onRefresh: () => void }> = ({ status, lang, busy, onRefresh }) => {
  const k = lang === 'kk';
  const ig = status.instagram;
  const tg = status.telegram;
  const problem = igProblemText(ig, lang);
  const noHistory = status.history_days < 8;
  return (
    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-[13px] font-black flex-1">{(isUz() ? "Obunachilar — hozir" : k ? 'Жазылушылар — қазір' : 'Подписчики — сейчас')}</p>
        <button onClick={onRefresh} disabled={busy} className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 disabled:opacity-40">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}{(isUz() ? "Tekshirish" : k ? 'Тексеру' : 'Проверить')}
        </button>
      </div>
      {problem && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-rose-800 leading-snug">{problem}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 p-2.5 space-y-1">
          <p className="text-[10.5px] font-bold text-slate-500 truncate">Instagram{ig.username ? ` · @${ig.username}` : ''}</p>
          <p className="text-[20px] font-black leading-none">{ig.ok ? fmt(ig.followers_count) : '—'}</p>
          {ig.ok && <div className="flex flex-wrap gap-1"><Delta v={ig.delta_7} label={(isUz() ? "7 kun" : k ? '7 күн' : '7 дн')} /><Delta v={ig.delta_30} label={(isUz() ? "30 kun" : k ? '30 күн' : '30 дн')} /></div>}
          {ig.ok && ig.media_count != null && <p className="text-[10.5px] text-slate-500">{(isUz() ? "Nashrlar" : k ? 'Жарияланым' : 'Публикаций')}: {fmt(ig.media_count)}</p>}
        </div>
        <div className="rounded-xl bg-slate-50 p-2.5 space-y-1">
          <p className="text-[10.5px] font-bold text-slate-500 truncate">Telegram{tg.channel ? ` · ${tg.channel}` : ''}</p>
          <p className="text-[20px] font-black leading-none">{tg.connected ? fmt(tg.subscribers) : '—'}</p>
          {tg.connected ? <div className="flex flex-wrap gap-1"><Delta v={tg.delta_7} label={(isUz() ? "7 kun" : k ? '7 күн' : '7 дн')} /><Delta v={tg.delta_30} label={(isUz() ? "30 kun" : k ? '30 күн' : '30 дн')} /></div>
            : <p className="text-[10.5px] text-slate-500">{(isUz() ? "Kanal ulanmagan" : k ? 'Арна қосылмаған' : 'Канал не подключён')}</p>}
        </div>
      </div>
      {noHistory && (
        <p className="text-[10.5px] text-slate-500">{(isUz() ? `O'sish har kuni yozib boriladi (hozir ${status.history_days} kun). 7 kunlik o'zgarish 7 kunlik kuzatuvdan so'ng paydo bo'ladi.` : k
          ? `Өсу күн сайын жазылады (қазір ${status.history_days} күн). 7 күндік өзгеріс 7 күннен кейін көрінеді.`
          : `Рост записывается каждый день (сейчас ${status.history_days} дн.). Изменение за 7 дней появится через 7 дней наблюдений.`)}</p>
      )}
    </div>
  );
};

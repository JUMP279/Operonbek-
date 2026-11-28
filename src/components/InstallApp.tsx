import { isUz } from '../context/LanguageContext';
import React, { useEffect, useState } from 'react';
import { Download, Share, X, Smartphone } from 'lucide-react';
import { canPrompt, isIOS, isInstalled, isMobile, onPwaChange, promptInstall } from '../lib/pwa';

/**
 * «Telefonga o'rnatish» (2026-11-22, PWA). Sayt va ilovada BIR XIL.
 * Android/Chrome — tizim oynasi (beforeinstallprompt); iPhone — «Поделиться → На экран Домой» yo'riqnomasi;
 * boshqa mobil brauzer — menyu orqali yo'riqnoma. O'rnatilgan bo'lsa yoki yopilgan bo'lsa ko'rinmaydi.
 * variant="card" — yopiladigan kartochka (kabinet/ilova bosh sahifasi); "button" — oddiy tugma (landing).
 */
const DISMISS_KEY = 'fl_install_dismissed';

export function InstallApp({ lang, variant = 'card' }: { lang: 'uz' | 'ru' | 'kk'; variant?: 'card' | 'button' }) {
  const ru = lang === 'ru';
  const [, force] = useState(0);
  const [help, setHelp] = useState(false);
  const [hidden, setHidden] = useState(() => {
    try { return variant === 'card' && localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
  });
  useEffect(() => onPwaChange(() => force((n) => n + 1)), []);

  if (hidden || isInstalled()) return null;
  const prompt = canPrompt();
  if (!prompt && !isMobile()) return null;           // kompyuterda tizim oynasi bo'lmasa — ko'rsatmaymiz

  const title = (isUz() ? "FindLeadni telefonga o'rnatish" : ru ? 'Установить FindLead на телефон' : 'FindLead-ті телефонға орнату');
  const sub = (isUz() ? "Bosh ekrandagi ikonka — ilova kabi ochiladi, bir tegish bilan." : ru ? 'Иконка на главном экране — открывается как приложение, в один тап.'
                 : 'Басты экранда белгіше — қосымша сияқты бір басумен ашылады.');
  const onClick = async () => {
    if (prompt) { await promptInstall(); return; }
    setHelp(true);
  };
  const dismiss = () => { try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* */ } setHidden(true); };

  const helpSheet = help && (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setHelp(false)}>
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 text-slate-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-[16px]">{title}</div>
          <button onClick={() => setHelp(false)} aria-label="close" className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        {isIOS() ? (
          <ol className="space-y-2.5 text-[14px] text-slate-700">
            <li>1. {(isUz() ? "Saytni Safari brauzerida oching." : ru ? 'Откройте сайт в Safari.' : 'Сайтты Safari-де ашыңыз.')}</li>
            <li className="flex items-center gap-1.5 flex-wrap">2. {(isUz() ? "Bosing" : ru ? 'Нажмите' : 'Басыңыз')} <Share className="w-4 h-4 text-blue-600" /> {(isUz() ? "Ekranning pastidagi «Ulashish»." : ru ? '«Поделиться» внизу экрана.' : '«Бөлісу» (экран төменінде).')}</li>
            <li>3. {(isUz() ? "«Bosh ekranga» ni tanlang va «Qo'shish» ni bosing." : ru ? 'Выберите «На экран «Домой»» и нажмите «Добавить».' : '«Басты экранға» таңдап, «Қосу» басыңыз.')}</li>
          </ol>
        ) : (
          <ol className="space-y-2.5 text-[14px] text-slate-700">
            <li>1. {(isUz() ? "Brauzer menyusini oching (⋮ yoki ≡)." : ru ? 'Откройте меню браузера (⋮ или ≡).' : 'Браузер мәзірін ашыңыз (⋮ немесе ≡).')}</li>
            <li>2. {(isUz() ? "«Ilovani o'rnatish» yoki «Bosh ekranga qo'shish» ni bosing." : ru ? 'Нажмите «Установить приложение» или «Добавить на главный экран».' : '«Қосымшаны орнату» немесе «Басты экранға қосу» басыңыз.')}</li>
            <li>3. {(isUz() ? "Tasdiqlang — FindLead ikonkasi ekranda paydo bo'ladi." : ru ? 'Подтвердите — иконка FindLead появится на экране.' : 'Растаңыз — FindLead белгішесі экранда пайда болады.')}</li>
          </ol>
        )}
        <button onClick={() => setHelp(false)} className="mt-4 w-full rounded-full bg-blue-600 text-white font-semibold py-3 text-[14px]">
          {(isUz() ? "Tushunarli" : ru ? 'Понятно' : 'Түсінікті')}
        </button>
      </div>
    </div>
  );

  if (variant === 'button') {
    return (
      <>
        <button onClick={onClick} className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-[15px] font-medium border border-black/15 hover:border-black/40 transition-colors">
          <Smartphone className="w-4 h-4" /> {(isUz() ? "Telefonga o'rnatish" : ru ? 'Установить на телефон' : 'Телефонға орнату')}
        </button>
        {helpSheet}
      </>
    );
  }
  return (
    <>
      <div className="w-full p-3 rounded-2xl border border-blue-100 bg-white flex items-center gap-3 mb-4">
        <img src="/pwa-192.png" alt="" className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-bold text-slate-900">{title}</div>
          <div className="text-[11.5px] text-slate-500 leading-snug">{sub}</div>
        </div>
        <button onClick={onClick} className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-blue-600 text-white text-[12.5px] font-semibold px-3.5 py-2">
          <Download className="w-3.5 h-3.5" /> {(isUz() ? "O'rnatish" : ru ? 'Установить' : 'Орнату')}
        </button>
        <button onClick={dismiss} aria-label="close" className="p-1 text-slate-400 shrink-0"><X className="w-4 h-4" /></button>
      </div>
      {helpSheet}
    </>
  );
}

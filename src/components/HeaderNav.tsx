import React from 'react';
import { Bell, Globe } from 'lucide-react';
import { UserAvatarIcon } from './UserAvatar';
import { UserProfile, Language } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HeaderNavProps {
  onOpenNotifications?: () => void;
  onOpenFilter?: () => void;
  onOpenProfile?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenAvatarMenu?: () => void;
  unreadCount?: number;
  userProfile?: UserProfile | null;
}

// Operon belgisi — HAMMA joyda bir xil (2026-11-13): ko'k gradient fon, o'rtasi oq olti burchak.
// Telefon ikonkasi, web/icon.svg, Telegram bot rasmi bilan aynan bir xil.
export const OperonMark: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden="true">
    <defs>
      <linearGradient id="operon-mark-g" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#2563EB" /><stop offset="1" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="112" fill="url(#operon-mark-g)" />
    <path d="M256 96L394.6 176V336L256 416L117.4 336V176Z" fill="#fff" />
  </svg>
);

export const OperonLogo: React.FC<{ size?: number; className?: string }> = ({ size = 26, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <OperonMark size={size} />
      <span className="text-[20px] font-bold tracking-tight text-slate-900 font-sans">Operon</span>
    </div>
  );
};

export const LanguageSelectorPill: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'kk', label: 'Қазақша', flag: '🇰🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' }
  ];

  return (
    <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 shadow-2xs">
      {languages.map((l) => {
        const isActive = language === l.code;
        return (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-bold transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
            title={l.label}
          >
            {compact ? (l.code === 'kk' ? 'KZ' : 'RU') : (l.code === 'kk' ? 'KZ 🇰🇿' : 'RU 🇷🇺')}
          </button>
        );
      })}
    </div>
  );
};

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenNotifications,
  onOpenFilter,
  onOpenProfile,
  onOpenAuth,
  onOpenAvatarMenu,
  unreadCount = 2,
  userProfile
}) => {
  const { t, language, setLanguage } = useLanguage();
  const avatarId = userProfile?.avatarId || 1;

  const nextLanguage = () => {
    if (language === 'kk') setLanguage('ru');
    else setLanguage('kk');
  };

  return (
    <div className="w-full px-5 pt-1 pb-3 flex items-center justify-between">
      <OperonLogo />

      <div className="flex items-center gap-1.5">
        {/* Language Switch Button */}
        <button
          id="btn-lang-toggle"
          onClick={nextLanguage}
          className="h-9 px-2 rounded-xl border border-slate-200/80 bg-white/90 flex items-center gap-1 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-xs text-xs font-bold"
          title={language === 'kk' ? "Тіл: Қазақша (Ауыстыру үшін басыңыз)" : "Язык: Русский (Нажмите для переключения)"}
        >
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-bold text-blue-700 uppercase">{language === 'kk' ? 'KZ' : 'RU'}</span>
        </button>

        {/* Notification Bell Button */}
        <button
          id="btn-notifications"
          onClick={onOpenNotifications}
          className="relative w-9 h-9 rounded-xl border border-slate-200/80 bg-white/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
          title={t.notificationsTitle}
        >
          <Bell className="w-4 h-4 text-slate-700" strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          )}
        </button>

        {/* Filter / Settings Button (Equal bars icon) */}
        <button
          id="btn-filter-settings"
          onClick={onOpenFilter}
          className="w-9 h-9 rounded-xl border border-slate-200/80 bg-white/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
          title={t.filterTitle}
        >
          <div className="flex flex-col gap-[3.5px] items-center justify-center">
            <div className="w-3.5 h-[2px] bg-slate-700 rounded-full" />
            <div className="w-3.5 h-[2px] bg-slate-700 rounded-full" />
          </div>
        </button>

        {/* User Profile Avatar - Opens Avatar Quick Menu (Language, Registration & Account) */}
        <button
          id="btn-user-avatar"
          onClick={() => {
            // Wrapped so the click event is never forwarded as the `mode` argument.
            if (onOpenAvatarMenu) onOpenAvatarMenu();
            else if (onOpenProfile) onOpenProfile();
            else if (onOpenAuth) onOpenAuth('login');
          }}
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-white ring-1 ring-slate-200/80 hover:ring-blue-400 active:scale-95 transition-all shrink-0 shadow-xs flex items-center justify-center cursor-pointer"
          title={userProfile ? userProfile.name : t.profileAccount}
        >
          <UserAvatarIcon avatarId={avatarId} size={36} />
        </button>
      </div>
    </div>
  );
};

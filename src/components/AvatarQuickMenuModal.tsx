import React, { useState } from 'react';
import {
  Globe,
  UserPlus,
  LogIn,
  Check,
  Copy,
  ShieldCheck,
  Settings,
  LogOut,
  X,
  Sparkles,
  Store
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { UserAvatarIcon } from './UserAvatar';
import { useLanguage } from '../context/LanguageContext';

export interface AvatarQuickMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenProfileSettings?: () => void;
  onLogout?: () => void;
}

export const AvatarQuickMenuModal: React.FC<AvatarQuickMenuModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onOpenAuth,
  onOpenProfileSettings,
  onLogout
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentId = userProfile?.uniqueCode || userProfile?.id || '';

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(currentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const languageOptions: { code: Language; name: string; native: string; flag: string }[] = [
    { code: 'kk', name: 'Қазақша', native: 'Қазақша', flag: '🇰🇿' },
    { code: 'ru', name: 'Русский', native: 'Русский', flag: '🇷🇺' }
  ];

  return (
    <div
      id="avatar-quick-menu-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="avatar-quick-menu-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-[390px] shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header with gradient banner & Close button */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 pt-5 text-white">
          <button
            id="btn-close-avatar-menu"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            title={t.close}
          >
            <X className="w-4 h-4" />
          </button>

          {/* User Profile Card */}
          <div className="flex items-center gap-3.5">
            <div className="relative ring-4 ring-white/30 rounded-full">
              <UserAvatarIcon avatarId={userProfile?.avatarId || 1} size={54} showBadge />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-[17px] font-black text-white truncate flex items-center gap-1.5">
                  <Store className="w-4 h-4 shrink-0" />
                  {userProfile?.storeName || 'Operon'}
                </h3>
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              </div>

              {userProfile?.email && (
                <div className="text-[11px] text-blue-100 font-medium truncate mt-0.5">{userProfile.email}</div>
              )}

              {/* ID Badge with copy */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] uppercase font-bold text-blue-200">ID:</span>
                <span className="text-[10.5px] font-mono font-black bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {currentId}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title={t.copyId}
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-300" />
                  ) : (
                    <Copy className="w-3 h-3 text-white/80 hover:text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[65vh] no-scrollbar">

          {/* SECTION 1: TIL TANLASH (LANGUAGE SELECTION) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black text-slate-900 tracking-tight">
                  {t.languageSelect || (language === 'ru' ? 'Выбор языка' : 'Тіл таңдау')}
                </span>
              </div>
              <span className="text-[10.5px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full">
                {language === 'kk' ? 'KZ 🇰🇿' : 'RU 🇷🇺'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {languageOptions.map((opt) => {
                const isSelected = language === opt.code;
                return (
                  <button
                    key={opt.code}
                    id={`btn-lang-${opt.code}`}
                    onClick={() => setLanguage(opt.code)}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 hover:bg-slate-100/80 text-slate-700 border-slate-200/80'
                    }`}
                  >
                    <span className="text-2xl leading-none">{opt.flag}</span>
                    <span className="text-xs font-extrabold tracking-tight leading-none mt-0.5">
                      {opt.native}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 bg-white rounded-full mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: RO'YXATDAN O'TISH & HISOB (REGISTRATION & AUTH) */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-slate-900 tracking-tight">
                {language === 'ru' ? 'Регистрация и Вход' : 'Тіркелу және Кіру'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Yangi hisob / Ro'yxatdan o'tish */}
              <button
                id="btn-quick-register"
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth('register');
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-between shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black">{t.newAccountRegister}</div>
                    <div className="text-[10px] text-blue-100">{t.newStoreBranch}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-white text-blue-700 px-2 py-0.5 rounded-lg shadow-2xs">
                  {t.newBadge}
                </span>
              </button>

              {/* Mavjud hisobga kirish (Login) */}
              <button
                id="btn-quick-login"
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth('login');
                }}
                className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 flex items-center justify-between transition-all active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                    <LogIn className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{t.existingLogin}</div>
                    <div className="text-[10px] text-slate-400">{t.switchProfile}</div>
                  </div>
                </div>
                <span className="text-[10.5px] font-semibold text-slate-500">{t.signInArrow}</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: PROFILNI SOZLASH & CHIQISH */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            {onOpenProfileSettings && (
              <button
                onClick={() => {
                  onClose();
                  onOpenProfileSettings();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.settingsTitle || 'Sozlamalar'}</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.logout || (language === 'ru' ? 'Выйти' : 'Шығу')}</span>
              </button>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Operon OS • 2026</span>
          <button
            onClick={onClose}
            className="font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            {t.close || 'Yopish'}
          </button>
        </div>
      </div>
    </div>
  );
};

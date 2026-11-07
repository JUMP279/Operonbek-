import React, { useState } from 'react';
import { X, ShieldCheck, LogOut, Globe, UserPlus, Mail, Phone, Edit2, Check, Copy, Sparkles, Building2, Store, Tag } from 'lucide-react';
import { UserAvatarIcon, AVATAR_LIST } from './UserAvatar';
import { UserProfile, Language } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onOpenAuth?: () => void;
  onOpenOnboarding?: () => void;
  onUpdateProfile?: (updated: UserProfile) => void;
  onLogout?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onOpenAuth,
  onOpenOnboarding,
  onUpdateProfile,
  onLogout
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editName, setEditName] = useState(userProfile?.name || 'Shohjahon Uralbayev');
  const [editStore, setEditStore] = useState(userProfile?.storeName || 'Operon Flagship Global');
  const [editAvatar, setEditAvatar] = useState(userProfile?.avatarId || 1);

  if (!isOpen) return null;

  const currentProfile: UserProfile = userProfile || {
    id: 'OPR-84920',
    uniqueCode: 'OPR-84920',
    name: 'Shohjahon Uralbayev',
    email: 'shohjahonuralbayev5@gmail.com',
    storeName: 'Operon Flagship Global',
    businessType: 'Retailer',
    role: 'Store Owner & Lead Admin',
    avatarId: 1,
    phone: '+998 90 123 45 67',
    isVerified: true
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentProfile.uniqueCode || currentProfile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        ...currentProfile,
        name: editName.trim() || currentProfile.name,
        storeName: editStore.trim() || currentProfile.storeName,
        avatarId: editAvatar
      });
    }
    setIsEditing(false);
  };

  const languageOptions: { code: Language; label: string; prefix: string }[] = [
    { code: 'kk', label: 'Қазақша', prefix: 'KZ' },
    { code: 'ru', label: 'Русский', prefix: 'RU' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">{t.profileAccount}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-0.5 no-scrollbar text-xs">
          {/* Main User Profile Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-50 to-blue-50/30 border border-slate-100 space-y-2.5">
            <div className="flex items-start gap-3">
              <UserAvatarIcon avatarId={isEditing ? editAvatar : currentProfile.avatarId} size={48} showBadge />
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                      placeholder={t.fullName}
                    />
                    <input
                      type="text"
                      value={editStore}
                      onChange={(e) => setEditStore(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-700"
                      placeholder={t.storeName}
                    />
                  </div>
                ) : (
                  <>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{currentProfile.name}</h4>
                    <p className="text-xs text-slate-600 font-medium truncate flex items-center gap-1 mt-0.5">
                      <Store className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      {currentProfile.storeName}
                    </p>
                    <div className="flex items-center gap-1 text-[10.5px] text-emerald-600 font-semibold mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> {t.verifiedMerchant}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => {
                  if (isEditing) {
                    handleSaveEdit();
                  } else {
                    setEditName(currentProfile.name);
                    setEditStore(currentProfile.storeName);
                    setEditAvatar(currentProfile.avatarId);
                    setIsEditing(true);
                  }
                }}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 shadow-2xs"
                title={isEditing ? t.save : t.edit}
              >
                {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Avatar picker when editing */}
            {isEditing && (
              <div className="pt-2 border-t border-slate-200/80">
                <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">
                  Avatarni o‘zgartirish (Qizlar va Erkaklar):
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {AVATAR_LIST.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setEditAvatar(av.id)}
                      className={`p-0.5 rounded-full transition-all shrink-0 ${
                        editAvatar === av.id ? 'ring-2 ring-blue-600 scale-105' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <UserAvatarIcon avatarId={av.id} size={32} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* UNIQUE MERCHANT ID BADGE (CRITICAL REQUIREMENT) */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between bg-white/70 p-2 rounded-xl border border-slate-200/50">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-semibold text-slate-600">Unikal Tadbirkor ID:</span>
              </div>
              <button
                onClick={handleCopyId}
                className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono font-bold text-xs px-2 py-0.5 rounded-lg border border-blue-200 transition-colors"
                title="ID nusxalash"
              >
                <span>{currentProfile.uniqueCode || currentProfile.id}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>

            {/* Contact details */}
            <div className="space-y-1 text-[11px] text-slate-600 pt-1">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{currentProfile.email}</span>
              </div>
              {currentProfile.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{currentProfile.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Onboarding / Business Catalog Survey Trigger */}
          {onOpenOnboarding && (
            <button
              onClick={() => {
                onClose();
                onOpenOnboarding();
              }}
              className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 text-left">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <h5 className="font-bold text-xs">Biznes Tahlili & Onboarding</h5>
                  <p className="text-[10px] text-blue-100">Katalogni qayta ko‘rish yoki sozlash</p>
                </div>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-lg font-bold">Ochish</span>
            </button>
          )}

          {/* 2-Way Language Choice (KZ / RU) */}
          <div className="p-3 rounded-2xl bg-blue-50/30 border border-slate-200/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800">{t.languageSelect || (language === 'ru' ? 'Выбор языка' : 'Тіл таңдау')}</span>
              </div>
              <span className="text-[11px] uppercase font-black text-blue-600">{language === 'kk' ? 'KZ 🇰🇿' : 'RU 🇷🇺'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {languageOptions.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => setLanguage(opt.code)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    language === opt.code
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <span className="text-[11px] font-black">{opt.prefix}</span>
                  <span className="text-[11px] font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Switch / Register New Account Button */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>{language === 'ru' ? 'Новый аккаунт / Регистрация' : 'Жаңа аккаунт / Тіркелу'}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              className="text-[11px] font-extrabold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {language === 'ru' ? 'Регистрация' : 'Тіркелу'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          {onLogout && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.logout}
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { User, Bell, Globe, Shield, ChevronRight, UserPlus, Check, Sparkles, Store } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { UserAvatarIcon } from './AuthModal';
import { useLanguage } from '../context/LanguageContext';
import { AvatarQuickMenuModal } from './AvatarQuickMenuModal';

interface SettingsTabProps {
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  userProfile?: UserProfile | null;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  onOpenNotifications,
  onOpenProfile,
  onOpenAuth,
  userProfile
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  return (
    <div className="space-y-3.5 pt-1 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t.settingsTitle}</h2>
          <p className="text-[11px] text-slate-400">{t.settingsSubtitle}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-2xs">
        {/* Merchant Profile - Clicking avatar opens Til & Ro'yxatdan o'tish Menu */}
        <div
          onClick={() => setIsAvatarMenuOpen(true)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div
              id="btn-settings-avatar-trigger"
              className="relative cursor-pointer group/avatar shrink-0 active:scale-95 transition-transform"
              title="Til va ro'yxatdan o'tish (Bosing)"
            >
              <UserAvatarIcon avatarId={userProfile?.avatarId || 1} size={42} />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-2xs">
                <Globe className="w-2.5 h-2.5" />
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {userProfile?.name || 'Shohjahon Uralbayev'}
              </div>
              <div className="text-[10.5px] text-slate-400">
                {userProfile?.storeName || 'Operon Flagship Global'}
              </div>
              <div className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                <Globe className="w-2.5 h-2.5" />
                <span className="uppercase">{language}</span>
                <span>• Til va ro'yxatdan o'tish sozlamalari</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{t.notificationsTitle}</div>
              <div className="text-[10.5px] text-slate-400">Orders, traffic peaks, AI tips</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Security / Gemini API */}
        <div className="p-3 flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{t.serverStatus}</div>
              <div className="text-[10.5px] text-slate-400">Operon Gemini 3.7 Flash Connected</div>
            </div>
          </div>
          <span className="text-[10.5px] text-emerald-600 font-semibold">{t.aiOnline}</span>
        </div>
      </div>

      {/* Avatar Click Quick Menu: Til & Ro'yxatdan o'tish */}
      <AvatarQuickMenuModal
        isOpen={isAvatarMenuOpen}
        onClose={() => setIsAvatarMenuOpen(false)}
        userProfile={userProfile}
        onOpenAuth={onOpenAuth}
        onOpenProfileSettings={onOpenProfile}
      />
    </div>
  );
};

import React from 'react';
import { Compass, Clapperboard, BarChart3, User } from 'lucide-react';
import { ActiveTab } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onChangeTab }) => {
  const { t, language } = useLanguage();

  return (
    <div className="w-full bg-white border-t border-slate-100/90 px-7 pt-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex flex-col items-center select-none shrink-0 z-20">
      <div className="w-full flex items-center justify-between py-0.5">
        {/* Tab 1: Overview / Compass */}
        <button
          id="tab-overview"
          onClick={() => onChangeTab('overview')}
          className="relative flex flex-col items-center justify-center p-2 text-slate-700 hover:text-blue-600 transition-all active:scale-95"
          title={t.navOverview}
        >
          <Compass
            className={`w-[22px] h-[22px] transition-colors ${
              activeTab === 'overview' ? 'text-blue-600' : 'text-slate-400'
            }`}
            strokeWidth={activeTab === 'overview' ? 2.3 : 1.8}
          />
          {activeTab === 'overview' && (
            <div className="absolute -bottom-1 w-5 h-[2.5px] bg-blue-600 rounded-full transition-all" />
          )}
        </button>

        {/* Tab 2: Video yaratish */}
        <button
          id="tab-video"
          onClick={() => onChangeTab('video')}
          className="relative flex flex-col items-center justify-center p-2 text-slate-700 hover:text-blue-600 transition-all active:scale-95"
          title={language === 'ru' ? 'Видео' : 'Бейне'}
        >
          <Clapperboard
            className={`w-[22px] h-[22px] transition-colors ${
              activeTab === 'video' ? 'text-blue-600' : 'text-slate-400'
            }`}
            strokeWidth={activeTab === 'video' ? 2.3 : 1.8}
          />
          {activeTab === 'video' && (
            <div className="absolute -bottom-1 w-5 h-[2.5px] bg-blue-600 rounded-full transition-all" />
          )}
        </button>

        {/* Tab 3: Analitika */}
        <button
          id="tab-analytics"
          onClick={() => onChangeTab('analytics')}
          className="relative flex flex-col items-center justify-center p-2 text-slate-700 hover:text-blue-600 transition-all active:scale-95"
          title={language === 'ru' ? 'Аналитика' : 'Аналитика'}
        >
          <BarChart3
            className={`w-[22px] h-[22px] transition-colors ${
              activeTab === 'analytics' ? 'text-blue-600' : 'text-slate-400'
            }`}
            strokeWidth={activeTab === 'analytics' ? 2.3 : 1.8}
          />
          {activeTab === 'analytics' && (
            <div className="absolute -bottom-1 w-5 h-[2.5px] bg-blue-600 rounded-full transition-all" />
          )}
        </button>

        {/* Tab 4: Profile & 8 Business Tools */}
        <button
          id="tab-profile"
          onClick={() => onChangeTab('profile')}
          className="relative flex flex-col items-center justify-center p-2 text-slate-700 hover:text-blue-600 transition-all active:scale-95"
          title={t.navProfile}
        >
          <User
            className={`w-[22px] h-[22px] transition-colors ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'
            }`}
            strokeWidth={activeTab === 'profile' ? 2.3 : 1.8}
          />
          {activeTab === 'profile' && (
            <div className="absolute -bottom-1 w-5 h-[2.5px] bg-blue-600 rounded-full transition-all" />
          )}
        </button>
      </div>

    </div>
  );
};

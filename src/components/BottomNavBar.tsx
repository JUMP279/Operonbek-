import React from 'react';
import { Compass, Mail, Package, User } from 'lucide-react';
import { ActiveTab } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onChangeTab }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-white border-t border-slate-100/90 px-7 pt-2.5 pb-4 flex flex-col items-center select-none shrink-0 z-20">
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

        {/* Tab 2: Messages / Mail / Orders */}
        <button
          id="tab-messages"
          onClick={() => onChangeTab('messages')}
          className="relative flex flex-col items-center justify-center p-2 text-slate-700 hover:text-blue-600 transition-all active:scale-95"
          title={t.navOrders}
        >
          <Mail
            className={`w-[22px] h-[22px] transition-colors ${
              activeTab === 'messages' ? 'text-blue-600' : 'text-slate-400'
            }`}
            strokeWidth={activeTab === 'messages' ? 2.3 : 1.8}
          />
          {activeTab === 'messages' && (
            <div className="absolute -bottom-1 w-5 h-[2.5px] bg-blue-600 rounded-full transition-all" />
          )}
        </button>

        {/* Tab 3: Package / Inventory */}
        <button
          id="tab-inventory"
          onClick={() => onChangeTab('inventory')}
          className="relative flex flex-col items-center justify-center p-2 text-slate-700 hover:text-blue-600 transition-all active:scale-95"
          title={t.navInventory}
        >
          <Package
            className={`w-[22px] h-[22px] transition-colors ${
              activeTab === 'inventory' ? 'text-blue-600' : 'text-slate-400'
            }`}
            strokeWidth={activeTab === 'inventory' ? 2.3 : 1.8}
          />
          {activeTab === 'inventory' && (
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

      {/* iOS Home Indicator Bar (Dark rounded capsule exactly from user's image) */}
      <div className="w-32 h-[3.5px] bg-[#3A3F47] rounded-full mt-2" />
    </div>
  );
};

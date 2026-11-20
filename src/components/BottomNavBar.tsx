import React from 'react';
import { BarChart3, Compass, Package, Store, User } from 'lucide-react';
import { ActiveTab } from '../types';
import { useLanguage } from '../context/LanguageContext';

// Pastki menyu (2026-11-19, user so'rovi): Обзор · Аналитика · Маркетплейс · Товары · Профиль.
// Video yaratish — Профиль ichidagi asboblarda. Saytda telefon menyusi xuddi shunday, oxirgisi «Ещё».
interface BottomNavBarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onChangeTab }) => {
  const { t, language } = useLanguage();
  const ru = language === 'ru';
  const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: t.navOverview || (ru ? 'Обзор' : 'Шолу'), icon: Compass },
    { id: 'analytics', label: ru ? 'Аналитика' : 'Аналитика', icon: BarChart3 },
    { id: 'marketplaces', label: ru ? 'Маркетплейс' : 'Маркетплейс', icon: Store },
    { id: 'products', label: ru ? 'Товары' : 'Тауарлар', icon: Package },
    { id: 'profile', label: t.navProfile || (ru ? 'Профиль' : 'Профиль'), icon: User },
  ];

  return (
    <div className="w-full bg-white border-t border-slate-100/90 px-2 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] select-none shrink-0 z-20">
      <div className="w-full grid grid-cols-5">
        {tabs.map(({ id, label, icon: Icon }) => {
          const on = activeTab === id;
          return (
            <button
              key={id}
              id={`tab-${id}`}
              onClick={() => onChangeTab(id)}
              className="relative flex flex-col items-center justify-center gap-0.5 py-1.5 active:scale-95 transition-all"
              title={label}
            >
              <Icon className={`w-[21px] h-[21px] transition-colors ${on ? 'text-blue-600' : 'text-slate-400'}`} strokeWidth={on ? 2.3 : 1.8} />
              <span className={`text-[10px] leading-none font-semibold truncate max-w-full ${on ? 'text-blue-600' : 'text-slate-500'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

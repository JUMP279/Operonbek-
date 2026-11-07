import React, { useState } from 'react';
import { Download, Calendar, LayoutGrid } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { HeaderNav } from './HeaderNav';
import { BottomNavBar } from './BottomNavBar';
import { MetricCards } from './MetricCards';
import { ProfitChart } from './ProfitChart';
import { CustomerBreakdown } from './CustomerBreakdown';
import { DayActiveChart } from './DayActiveChart';
import { RetentionGauge } from './RetentionGauge';
import { AIAssistantCard } from './AIAssistantCard';
import { OrdersTab } from './OrdersTab';
import { InventoryTab } from './InventoryTab';
import { ProfileTab } from './ProfileTab';
import { ToolDetailView } from './ToolDetailView';
import { MetricItem, CustomerSegment, DayActiveData, ProfitDataPoint, ActiveTab, UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ThreeScreenShowcaseProps {
  metrics: MetricItem[];
  profitData: ProfitDataPoint[];
  customerData: CustomerSegment[];
  dayActiveData: DayActiveData[];
  dateRange: string;
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenExport: () => void;
  onOpenDateRange: () => void;
  onOpenAddWidget: () => void;
  onOpenNotifications: () => void;
  onOpenFilter: () => void;
  onOpenProfile: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenAvatarMenu?: () => void;
  onOpenRetentionDetails: () => void;
  onOpenCustomerDetails: () => void;
  onOpenAIChat: () => void;
  onOpenToolDemo?: (toolId: string) => void;
  onSelectMetric: (metric: MetricItem) => void;
  storeContext: any;
  userProfile?: UserProfile | null;
}

export const ThreeScreenShowcase: React.FC<ThreeScreenShowcaseProps> = ({
  metrics,
  profitData,
  customerData,
  dayActiveData,
  dateRange,
  activeTab,
  onChangeTab,
  onOpenExport,
  onOpenDateRange,
  onOpenAddWidget,
  onOpenNotifications,
  onOpenFilter,
  onOpenProfile,
  onOpenAuth,
  onOpenAvatarMenu,
  onOpenRetentionDetails,
  onOpenCustomerDetails,
  onOpenAIChat,
  onOpenToolDemo,
  onSelectMetric,
  storeContext,
  userProfile
}) => {
  const { t } = useLanguage();

  // Mobile screen switcher: screen1 | screen2 | screen3 | all
  const [mobileScreen, setMobileScreen] = useState<'screen1' | 'screen2' | 'screen3' | 'all'>('screen1');

  // In-screen tool states for each screen to preserve the bottom navigation bar exactly as in user reference
  const [screen1Tool, setScreen1Tool] = useState<string | null>(null);
  const [screen2Tool, setScreen2Tool] = useState<string | null>(null);
  const [screen3Tool, setScreen3Tool] = useState<string | null>(null);

  const handleScreen1ToolSelect = (toolId: string) => {
    setScreen1Tool(toolId);
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-1 sm:py-2">
      {/* Mobile Screen Switcher Tabs (Only visible on mobile/tablet screens < 1024px) */}
      <div className="w-full max-w-[360px] lg:hidden mb-3 px-1">
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200/90 shadow-2xs grid grid-cols-4 gap-1 text-[11px] font-bold">
          <button
            onClick={() => setMobileScreen('screen1')}
            className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
              mobileScreen === 'screen1'
                ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📱</span>
            <span className="truncate">{t.screen1Name}</span>
          </button>
          <button
            onClick={() => setMobileScreen('screen2')}
            className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
              mobileScreen === 'screen2'
                ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📊</span>
            <span className="truncate">{t.screen2Name}</span>
          </button>
          <button
            onClick={() => setMobileScreen('screen3')}
            className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
              mobileScreen === 'screen3'
                ? 'bg-indigo-600 text-white shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>⚡</span>
            <span className="truncate">{t.screen3Name}</span>
          </button>
          <button
            onClick={() => setMobileScreen('all')}
            className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
              mobileScreen === 'all'
                ? 'bg-slate-800 text-white shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🌐</span>
            <span className="truncate">{t.screenAllName}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8 xl:gap-10 w-full">
        {/* SCREEN 1: Main Dashboard (Left Mockup) */}
        <div className={`flex-col items-center w-full max-w-[360px] ${mobileScreen === 'screen1' || mobileScreen === 'all' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> {t.screen1Title}
          </div>
          <div className="w-full max-w-[350px] bg-[#FAFAFC] rounded-[38px] sm:rounded-[42px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)] border border-slate-200/90 relative overflow-hidden flex flex-col h-[690px] sm:h-[710px]">
            {/* Status bar */}
            <StatusBar time="9:41" />

            {screen1Tool ? (
              /* Tool rendered inside screen with BottomNavBar pinned at bottom */
              <div className="flex-1 overflow-hidden flex flex-col">
                <ToolDetailView
                  toolId={screen1Tool}
                  onBack={() => setScreen1Tool(null)}
                  storeContext={storeContext}
                />
              </div>
            ) : (
              <>
                {/* Top Brand Nav */}
                <HeaderNav
                  onOpenNotifications={onOpenNotifications}
                  onOpenFilter={onOpenFilter}
                  onOpenProfile={onOpenProfile}
                  onOpenAuth={onOpenAuth}
                  onOpenAvatarMenu={onOpenAvatarMenu}
                  userProfile={userProfile}
                />

                {/* Screen 1 Dynamic Content based on selected bottom tab */}
                <div className="flex-1 overflow-y-auto px-3.5 space-y-3.5 no-scrollbar pb-2">
                  {activeTab === 'overview' && (
                    <>
                      {/* Title & Export Button */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <h1 className="text-[23px] font-extrabold text-slate-900 tracking-tight">{t.dashboardTitle}</h1>
                          <p className="text-[10px] text-slate-400 font-mono font-bold">
                            ID: {userProfile?.uniqueCode || userProfile?.id || 'OPR-84920'}
                          </p>
                        </div>
                        <button
                          id="btn-export-screen1"
                          onClick={onOpenExport}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
                          <span>{t.export}</span>
                        </button>
                      </div>

                      {/* Date Range & Add Widget Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          id="btn-date-range-screen1"
                          onClick={onOpenDateRange}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 text-[11px] font-medium text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors truncate"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{dateRange}</span>
                        </button>

                        <button
                          id="btn-add-widget-screen1"
                          onClick={onOpenAddWidget}
                          className="py-1.5 px-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 text-[11px] font-medium text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                        >
                          <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
                          <span>{t.addWidget}</span>
                        </button>
                      </div>

                      {/* 4 Metric Cards Grid */}
                      <MetricCards
                        metrics={metrics}
                        onSelectMetric={(m) => {
                          if (m?.id === 'orders' || (m?.label && (m.label.toLowerCase().includes('order') || m.label.toLowerCase().includes('buyurtma')))) {
                            handleScreen1ToolSelect('orders-manager');
                          } else {
                            handleScreen1ToolSelect('analytics');
                          }
                        }}
                      />

                      {/* Peeking Total Profit Card at bottom -> Opens Dedicated Analytics Screen */}
                      <div className="opacity-95 transform translate-y-1">
                        <ProfitChart
                          data={profitData}
                          totalProfit="$446.7K"
                          profitChange="▲ 24,4%"
                          onOpenDetails={() => handleScreen1ToolSelect('analytics')}
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'messages' && (
                    <OrdersTab onOpenExport={() => handleScreen1ToolSelect('orders-manager')} />
                  )}

                  {activeTab === 'inventory' && (
                    <InventoryTab />
                  )}

                  {activeTab === 'profile' && (
                    <ProfileTab
                      onOpenNotifications={onOpenNotifications}
                      onOpenProfile={onOpenProfile}
                      onOpenAuth={onOpenAuth}
                      onOpenAIChat={onOpenAIChat}
                      onSelectTool={handleScreen1ToolSelect}
                      userProfile={userProfile}
                      storeContext={storeContext}
                    />
                  )}
                </div>
              </>
            )}

            {/* Bottom Docked Nav - Always present so user can navigate in/out */}
            <BottomNavBar
              activeTab={activeTab}
              onChangeTab={(tab) => {
                setScreen1Tool(null);
                onChangeTab(tab);
              }}
            />
          </div>
        </div>

        {/* SCREEN 2: Profit & Customers (Center Mockup) */}
        <div className={`flex-col items-center w-full max-w-[360px] ${mobileScreen === 'screen2' || mobileScreen === 'all' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t.screen2Title}
          </div>
          <div className="w-full max-w-[350px] bg-[#FAFAFC] rounded-[38px] sm:rounded-[42px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)] border border-slate-200/90 relative overflow-hidden flex flex-col h-[690px] sm:h-[710px]">
            {/* Status bar */}
            <StatusBar time="9:41" />

            {screen2Tool ? (
              <div className="flex-1 overflow-hidden flex flex-col">
                <ToolDetailView
                  toolId={screen2Tool}
                  onBack={() => setScreen2Tool(null)}
                  storeContext={storeContext}
                />
              </div>
            ) : (
              <>
                {/* Top Brand Nav */}
                <HeaderNav
                  onOpenNotifications={onOpenNotifications}
                  onOpenFilter={onOpenFilter}
                  onOpenProfile={onOpenProfile}
                  onOpenAuth={onOpenAuth}
                  onOpenAvatarMenu={onOpenAvatarMenu}
                  userProfile={userProfile}
                />

                {/* Screen 2 Content */}
                <div className="flex-1 overflow-y-auto px-3.5 space-y-3.5 no-scrollbar pb-2 pt-1">
                  {/* Total Profit Card with Full Area Chart -> Opens Analytics */}
                  <ProfitChart
                    data={profitData}
                    totalProfit="$446.7K"
                    profitChange="▲ 24,4%"
                    onOpenDetails={() => setScreen2Tool('analytics')}
                  />

                  {/* Customers Breakdown Card -> Opens Business Analyze */}
                  <CustomerBreakdown
                    segments={customerData}
                    onSelectSegment={() => setScreen2Tool('business-analyze')}
                    onOpenMenu={() => setScreen2Tool('business-analyze')}
                  />
                </div>
              </>
            )}

            {/* Bottom Docked Nav */}
            <BottomNavBar
              activeTab="overview"
              onChangeTab={(tab) => {
                setScreen2Tool(null);
                onChangeTab(tab);
              }}
            />
          </div>
        </div>

        {/* SCREEN 3: Retention & AI Assistant (Right Mockup) */}
        <div className={`flex-col items-center w-full max-w-[360px] ${mobileScreen === 'screen3' || mobileScreen === 'all' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> {t.screen3Title}
          </div>
          <div className="w-full max-w-[350px] bg-[#FAFAFC] rounded-[38px] sm:rounded-[42px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)] border border-slate-200/90 relative overflow-hidden flex flex-col h-[690px] sm:h-[710px]">
            {/* Status bar */}
            <StatusBar time="9:41" />

            {screen3Tool ? (
              <div className="flex-1 overflow-hidden flex flex-col">
                <ToolDetailView
                  toolId={screen3Tool}
                  onBack={() => setScreen3Tool(null)}
                  storeContext={storeContext}
                />
              </div>
            ) : (
              <>
                {/* Top Brand Nav */}
                <HeaderNav
                  onOpenNotifications={onOpenNotifications}
                  onOpenFilter={onOpenFilter}
                  onOpenProfile={onOpenProfile}
                  onOpenAuth={onOpenAuth}
                  onOpenAvatarMenu={onOpenAvatarMenu}
                  userProfile={userProfile}
                />

                {/* Screen 3 Content */}
                <div className="flex-1 overflow-y-auto px-3.5 space-y-3.5 no-scrollbar pb-2 pt-1">
                  {/* Most Day Active Bar Chart */}
                  <DayActiveChart
                    data={dayActiveData}
                    onOpenMenu={() => setScreen3Tool('business-analyze')}
                  />

                  {/* Repeat Customer Rate Radial Speedometer Gauge */}
                  <RetentionGauge
                    percentage={68}
                    target={80}
                    onShowDetails={() => setScreen3Tool('business-analyze')}
                  />

                  {/* AI Assistant Card */}
                  <AIAssistantCard
                    onOpenFullChat={onOpenAIChat}
                    storeContext={storeContext}
                  />
                </div>
              </>
            )}

            {/* Bottom Docked Nav */}
            <BottomNavBar
              activeTab="overview"
              onChangeTab={(tab) => {
                setScreen3Tool(null);
                onChangeTab(tab);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

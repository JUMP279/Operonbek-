import React, { useState, useEffect } from 'react';
import { Download, Calendar, LayoutGrid, Smartphone, Columns, Monitor, Sparkles, UserPlus, Globe, LogIn } from 'lucide-react';
import { StatusBar } from './components/StatusBar';
import { HeaderNav, LanguageSelectorPill } from './components/HeaderNav';
import { BottomNavBar } from './components/BottomNavBar';
import { MetricCards } from './components/MetricCards';
import { ProfitChart } from './components/ProfitChart';
import { CustomerBreakdown } from './components/CustomerBreakdown';
import { DayActiveChart } from './components/DayActiveChart';
import { RetentionGauge } from './components/RetentionGauge';
import { AIAssistantCard } from './components/AIAssistantCard';
import { ThreeScreenShowcase } from './components/ThreeScreenShowcase';
import { OrdersTab } from './components/OrdersTab';
import { InventoryTab } from './components/InventoryTab';
import { ProfileTab } from './components/ProfileTab';
import { ToolDetailView } from './components/ToolDetailView';

// Modals
import { ExportModal } from './components/ExportModal';
import { DateRangeModal } from './components/DateRangeModal';
import { AddWidgetModal } from './components/AddWidgetModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { NotificationDrawer } from './components/NotificationDrawer';
import { CustomerDetailsModal } from './components/CustomerDetailsModal';
import { RetentionDetailsModal } from './components/RetentionDetailsModal';
import { FilterModal } from './components/FilterModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { OnboardingCatalogModal } from './components/OnboardingCatalogModal';
import { ToolDemoModal } from './components/ToolDemoModal';
import { AvatarQuickMenuModal } from './components/AvatarQuickMenuModal';

// Language Context
import { LanguageProvider, useLanguage } from './context/LanguageContext';

// Mock Data
import {
  initialMetrics,
  profitHistory,
  customerSegments,
  dayActivityData,
  notificationsList
} from './data/mockData';
import { MetricItem, CustomerSegment, ActiveTab, ViewMode, UserProfile } from './types';

function DashboardApp() {
  const { t, language, setLanguage } = useLanguage();

  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('showcase'); // default to 3-screen showcase
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // User Profile & Authentication State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('operon_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: 'OPR-84920',
      uniqueCode: 'OPR-84920',
      name: 'Shohjahon Uralbayev',
      email: 'shohjahonuralbayev5@gmail.com',
      storeName: 'Operon Fashion Brand',
      phone: '+998 90 123 45 67',
      role: 'Asoschi & Boshqaruvchi',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedDate: 'Yanvar 2024',
      totalRevenue: '$1,469,324,230',
      activeProductsCount: 142,
      onboardingCompleted: true
    };
  });

  // State Management
  const [metrics, setMetrics] = useState<MetricItem[]>(initialMetrics);
  const [profitData] = useState(profitHistory);
  const [customerData] = useState<CustomerSegment[]>(customerSegments);
  const [dayActiveData] = useState(dayActivityData);
  const [notifications, setNotifications] = useState(notificationsList);
  const [dateRange, setDateRange] = useState('01 - 30 Jan, 2024');
  const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>(['conversion-rate']);
  const [selectedChannel, setSelectedChannel] = useState('All Channels');
  const [currency, setCurrency] = useState('USD');

  // Dedicated Full-Screen Tool Modal
  const [activeToolDemo, setActiveToolDemo] = useState<string | null>(null);
  // Single Phone In-Screen Tool View
  const [activePhoneTool, setActivePhoneTool] = useState<string | null>(null);

  // Modal Visibility States
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);
  const [selectedCustomerSeg, setSelectedCustomerSeg] = useState<CustomerSegment | null>(null);
  const [isRetentionDetailsOpen, setIsRetentionDetailsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Authentication & Onboarding Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  // Check if first-time visitor needs to see Kirish (Login)
  useEffect(() => {
    const isAuthed = localStorage.getItem('operon_is_authenticated');
    if (!isAuthed) {
      setAuthMode('login'); // First time entry: Kirish is shown first
      setIsAuthOpen(true);
    }
  }, []);

  // Unread notifications count
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleWidget = (id: string) => {
    setActiveWidgetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    // Open the tool in dedicated modal right away
    setActiveToolDemo(id);
  };

  const handleSelectCustomerSegment = (seg: CustomerSegment) => {
    setSelectedCustomerSeg(seg);
    setActiveToolDemo('business-analyze');
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem('operon_user_profile', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleAuthSuccess = (profile: UserProfile, isNewRegistration: boolean) => {
    setUserProfile(profile);
    setIsAuthOpen(false);

    if (isNewRegistration) {
      // For NEW registrations -> Open 2-Catalog Onboarding Screen (Biznesni qo'shish vs Biznes yaratish)
      setIsOnboardingOpen(true);
    } else {
      // For existing Login -> Enters directly to their business dashboard!
      setIsOnboardingOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('operon_is_authenticated');
    setAuthMode('login');
    setIsAuthOpen(true);
  };

  const storeContext = {
    totalProfit: '$1,469,324,230 (+12.2%)',
    pageViews: '16,431 (+15.5%)',
    visitors: '6,225 (+8.4%)',
    clicks: '2,832 (-10.5%)',
    orders: '1,224 (+4.4%)',
    dateRange,
    storeName: userProfile.storeName,
    activeProducts: userProfile.activeProductsCount || 142
  };

  return (
    <div className="min-h-screen bg-[#F0F2F6] text-slate-900 font-sans flex flex-col antialiased">
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              OP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-slate-900">OPERON JIMI OS</span>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/60 hidden sm:inline-block">
                  AI PRO 2026
                </span>
              </div>
              <div className="text-[10px] text-slate-400 hidden sm:block">
                {t.ecosystemSubtitle}
              </div>
            </div>
          </div>

          {/* Center: View Switcher (3-Screen vs Single Phone vs Fullscreen Canvas) */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
            <button
              id="view-mode-showcase"
              onClick={() => setViewMode('showcase')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'showcase'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={t.showcaseMode}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.viewShowcase}</span>
            </button>

            <button
              id="view-mode-single"
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'single'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={t.singlePhoneMode}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.viewSingle}</span>
            </button>

            <button
              id="view-mode-full"
              onClick={() => setViewMode('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'full'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={t.fullCanvasMode}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.viewFull}</span>
            </button>
          </div>

          {/* Right Controls: Quick Language Switcher & Auth / Profile */}
          <div className="flex items-center gap-2">
            {/* Quick 2-Language Toggle (KZ / RU) */}
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
              <button
                onClick={() => setLanguage('kk')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  language === 'kk' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Қазақша"
              >
                KZ 🇰🇿
              </button>
              <button
                onClick={() => setLanguage('ru')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  language === 'ru' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Русский"
              >
                RU 🇷🇺
              </button>
            </div>

            {/* Kirish / Ro'yxatdan o'tish yoki Profil / Til tezkor menyusi */}
            <button
              onClick={() => setIsAvatarMenuOpen(true)}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
              title={t.langAndAuth}
            >
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
              <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-[100px] truncate">
                {userProfile.name.split(' ')[0]}
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-4 md:p-5 flex flex-col justify-center">
        
        {/* MODE 1: 3-Screen Side-by-Side Showcase */}
        {viewMode === 'showcase' && (
          <ThreeScreenShowcase
            metrics={metrics}
            profitData={profitData}
            customerData={customerData}
            dayActiveData={dayActiveData}
            dateRange={dateRange}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenDateRange={() => setIsDateRangeOpen(true)}
            onOpenAddWidget={() => setIsAddWidgetOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenFilter={() => setIsFilterOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenAuth={(mode) => {
              setAuthMode(mode || 'login');
              setIsAuthOpen(true);
            }}
            onOpenAvatarMenu={() => setIsAvatarMenuOpen(true)}
            onOpenRetentionDetails={() => setActiveToolDemo('business-analyze')}
            onOpenCustomerDetails={() => setActiveToolDemo('business-analyze')}
            onOpenAIChat={() => setIsAIChatOpen(true)}
            onOpenToolDemo={(toolId) => setActiveToolDemo(toolId)}
            onSelectMetric={(m) => {
              if (m?.id === 'orders' || (m?.label && (m.label.toLowerCase().includes('order') || m.label.toLowerCase().includes('buyurtma')))) {
                setActiveToolDemo('orders-manager');
              } else {
                setActiveToolDemo('analytics');
              }
            }}
            storeContext={storeContext}
            userProfile={userProfile}
          />
        )}

        {/* MODE 2: Single Interactive iPhone Frame */}
        {viewMode === 'single' && (
          <div className="flex flex-col items-center w-full px-2">
            {/* Phone Bezel */}
            <div className="w-full max-w-[380px] bg-[#FAFAFC] rounded-[38px] sm:rounded-[48px] p-2.5 sm:p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.08)] border-2 sm:border-4 border-slate-800/80 relative overflow-hidden flex flex-col h-[710px] sm:h-[780px]">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-end px-3">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
              </div>

              {/* Status bar */}
              <StatusBar time="9:41" />

              {/* Brand Navigation */}
              <HeaderNav
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                onOpenFilter={() => setIsFilterOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
                onOpenAuth={() => {
                  setAuthMode('login');
                  setIsAuthOpen(true);
                }}
                onOpenAvatarMenu={() => setIsAvatarMenuOpen(true)}
                unreadCount={unreadCount}
                userProfile={userProfile}
              />

              {/* Main Content Area: Tool View or Dashboard Tabs */}
              {activePhoneTool ? (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <ToolDetailView
                    toolId={activePhoneTool}
                    onBack={() => setActivePhoneTool(null)}
                    storeContext={storeContext}
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-4 space-y-3.5 no-scrollbar pb-3">
                  {activeTab === 'overview' && (
                    <>
                      {/* Title & Export */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <h1 className="text-[23px] font-extrabold text-slate-900 tracking-tight">{t.dashboard}</h1>
                          <p className="text-[11px] text-slate-400 font-mono font-bold">
                            ID: {userProfile.uniqueCode || userProfile.id}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsExportOpen(true)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
                          <span>{t.export}</span>
                        </button>
                      </div>

                      {/* Date picker & Add Widget */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsDateRangeOpen(true)}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 text-[11px] font-medium text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors truncate"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{dateRange}</span>
                        </button>

                        <button
                          onClick={() => setIsAddWidgetOpen(true)}
                          className="py-1.5 px-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 text-[11px] font-medium text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                        >
                          <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
                          <span>{t.addWidget}</span>
                        </button>
                      </div>

                      {/* 4 Metric Cards */}
                      <MetricCards
                        metrics={metrics}
                        onSelectMetric={(m) => {
                          if (m?.id === 'orders' || (m?.label && (m.label.toLowerCase().includes('order') || m.label.toLowerCase().includes('buyurtma')))) {
                            setActivePhoneTool('orders-manager');
                          } else {
                            setActivePhoneTool('analytics');
                          }
                        }}
                      />

                      {/* Active Added Extra Widgets */}
                      {activeWidgetIds.includes('conversion-rate') && (
                        <div
                          onClick={() => setActivePhoneTool('analytics')}
                          className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-2xs cursor-pointer hover:shadow-xs transition-all"
                        >
                          <div>
                            <div className="text-[11.5px] font-medium text-slate-500">{t.conversionRate}</div>
                            <div className="text-lg font-bold text-slate-900">4.32%</div>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            ▲ 0.8%
                          </span>
                        </div>
                      )}

                      {/* Total Profit Area Line Chart -> Opens Dedicated Analytics Screen */}
                      <ProfitChart
                        data={profitData}
                        totalProfit="$1,469,324,230"
                        profitChange="▲ +12.2%"
                        onOpenDetails={() => setActivePhoneTool('analytics')}
                      />

                      {/* Customer Segments */}
                      <CustomerBreakdown
                        segments={customerData}
                        onSelectSegment={() => setActivePhoneTool('business-analyze')}
                        onOpenMenu={() => setActivePhoneTool('business-analyze')}
                      />

                      {/* Day Activity Bar Chart */}
                      <DayActiveChart
                        data={dayActiveData}
                        onOpenMenu={() => setActivePhoneTool('business-analyze')}
                      />

                      {/* Retention Speedometer Gauge */}
                      <RetentionGauge
                        percentage={68}
                        target={80}
                        onShowDetails={() => setActivePhoneTool('business-analyze')}
                      />

                      {/* AI Assistant Card */}
                      <AIAssistantCard
                        onOpenFullChat={() => setIsAIChatOpen(true)}
                        storeContext={storeContext}
                      />
                    </>
                  )}

                  {activeTab === 'messages' && (
                    <OrdersTab onOpenExport={() => setActivePhoneTool('orders-manager')} />
                  )}

                  {activeTab === 'inventory' && <InventoryTab />}

                  {activeTab === 'profile' && (
                    <ProfileTab
                      onOpenNotifications={() => setIsNotificationsOpen(true)}
                      onOpenProfile={() => setIsProfileOpen(true)}
                      onOpenAuth={(mode) => {
                        setAuthMode(mode || 'login');
                        setIsAuthOpen(true);
                      }}
                      onOpenAIChat={() => setIsAIChatOpen(true)}
                      onSelectTool={(toolId) => setActivePhoneTool(toolId)}
                      userProfile={userProfile}
                      storeContext={storeContext}
                    />
                  )}
                </div>
              )}

              {/* Bottom Docked Nav */}
              <BottomNavBar
                activeTab={activeTab}
                onChangeTab={(tab) => {
                  setActiveTab(tab);
                  setActivePhoneTool(null);
                }}
              />
            </div>
          </div>
        )}

        {/* MODE 3: Full Screen Canvas View */}
        {viewMode === 'full' && (
          <div className="w-full bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <HeaderNav
                  onOpenNotifications={() => setIsNotificationsOpen(true)}
                  onOpenFilter={() => setIsFilterOpen(true)}
                  onOpenProfile={() => setIsProfileOpen(true)}
                  onOpenAuth={(mode) => {
                    setAuthMode(mode || 'login');
                    setIsAuthOpen(true);
                  }}
                  onOpenAvatarMenu={() => setIsAvatarMenuOpen(true)}
                  unreadCount={unreadCount}
                  userProfile={userProfile}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDateRangeOpen(true)}
                  className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-100"
                >
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>{dateRange}</span>
                </button>

                <button
                  onClick={() => setIsAddWidgetOpen(true)}
                  className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-100"
                >
                  <LayoutGrid className="w-4 h-4 text-slate-500" />
                  <span>{t.addWidget}</span>
                </button>

                <button
                  onClick={() => setActiveToolDemo('analytics')}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.export}</span>
                </button>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
              {/* Left Column: Metrics & Profit Chart */}
              <div className="md:col-span-8 space-y-6">
                <MetricCards
                  metrics={metrics}
                  onSelectMetric={(m) => {
                    if (m?.id === 'orders' || (m?.label && (m.label.toLowerCase().includes('order') || m.label.toLowerCase().includes('buyurtma')))) {
                      setActiveToolDemo('orders-manager');
                    } else {
                      setActiveToolDemo('analytics');
                    }
                  }}
                />

                <ProfitChart
                  data={profitData}
                  totalProfit="$1,469,324,230"
                  profitChange="▲ +12.2%"
                  onOpenDetails={() => setActiveToolDemo('analytics')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <DayActiveChart data={dayActiveData} onOpenMenu={() => setActiveToolDemo('business-analyze')} />
                  <RetentionGauge percentage={68} target={80} onShowDetails={() => setActiveToolDemo('business-analyze')} />
                </div>
              </div>

              {/* Right Column: Customers & AI Assistant */}
              <div className="md:col-span-4 space-y-6">
                <CustomerBreakdown
                  segments={customerData}
                  onSelectSegment={() => setActiveToolDemo('business-analyze')}
                  onOpenMenu={() => setActiveToolDemo('business-analyze')}
                />

                <AIAssistantCard
                  onOpenFullChat={() => setIsAIChatOpen(true)}
                  storeContext={storeContext}
                />

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">{t.liveStatus}</h4>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>{t.serverStatus}</span>
                      <span className="text-emerald-600 font-semibold">99.98% Uptime</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.syncEngine}</span>
                      <span className="text-blue-600 font-semibold">Operon Real-time Connected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Dedicated Standalone / Fullscreen Tool Modal for any requested tool */}
      <ToolDemoModal
        toolId={activeToolDemo}
        onClose={() => setActiveToolDemo(null)}
        storeContext={storeContext}
      />

      {/* Interactive Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        dateRange={dateRange}
        metrics={metrics}
        totalProfit="$1,469,324,230"
      />

      <DateRangeModal
        isOpen={isDateRangeOpen}
        onClose={() => setIsDateRangeOpen(false)}
        currentRange={dateRange}
        onSelectRange={setDateRange}
      />

      <AddWidgetModal
        isOpen={isAddWidgetOpen}
        onClose={() => setIsAddWidgetOpen(false)}
        activeWidgetIds={activeWidgetIds}
        onToggleWidget={handleToggleWidget}
      />

      <AIAssistantDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        storeContext={storeContext}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />

      <CustomerDetailsModal
        isOpen={isCustomerDetailsOpen}
        onClose={() => setIsCustomerDetailsOpen(false)}
        segments={customerData}
        selectedSegment={selectedCustomerSeg}
      />

      <RetentionDetailsModal
        isOpen={isRetentionDetailsOpen}
        onClose={() => setIsRetentionDetailsOpen(false)}
        rate={68}
        target={80}
      />

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedChannel={selectedChannel}
        onChangeChannel={setSelectedChannel}
        currency={currency}
        onChangeCurrency={setCurrency}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onOpenAuth={() => {
          setAuthMode('login');
          setIsAuthOpen(true);
        }}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />

      {/* Registration & Login Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      {/* 2-Catalog Onboarding & Deep Questionnaire / Startup Advisor Modal */}
      <OnboardingCatalogModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        userProfile={userProfile}
        onCompleteOnboarding={handleUpdateProfile}
      />

      {/* Quick Avatar Menu: Til va Ro'yxatdan o'tish (Avatar ustiga bosganda chiqadi) */}
      <AvatarQuickMenuModal
        isOpen={isAvatarMenuOpen}
        onClose={() => setIsAvatarMenuOpen(false)}
        userProfile={userProfile}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'login');
          setIsAuthOpen(true);
        }}
        onOpenProfileSettings={() => setIsProfileOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <DashboardApp />
    </LanguageProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { Download, Calendar, LayoutGrid } from 'lucide-react';
import { HeaderNav } from './components/HeaderNav';
import { BottomNavBar } from './components/BottomNavBar';
import { MetricCards } from './components/MetricCards';
import { ProfitChart } from './components/ProfitChart';
import { CustomerBreakdown } from './components/CustomerBreakdown';
import { DayActiveChart } from './components/DayActiveChart';
import { RetentionGauge } from './components/RetentionGauge';
import { ProfileTab } from './components/ProfileTab';
import { ToolDetailView } from './components/ToolDetailView';
import { UserAvatarIcon } from './components/UserAvatar';

// Modals
import { ExportModal } from './components/ExportModal';
import { DateRangeModal } from './components/DateRangeModal';
import { AddWidgetModal } from './components/AddWidgetModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { CustomerDetailsModal } from './components/CustomerDetailsModal';
import { RetentionDetailsModal } from './components/RetentionDetailsModal';
import { FilterModal } from './components/FilterModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthFlow, AuthStep } from './components/AuthFlow';
import { api, ApiError, tokens, MeResponse, BusinessProfile, consumeOAuthReturn } from './lib/api';

// Google'dan qaytilgan bo'lsa — tokenlarni URL hash'idan oladi (komponentdan OLDIN, bir marta).
const OAUTH_RESULT = consumeOAuthReturn();
import { ToolDemoModal } from './components/ToolDemoModal';
import { AvatarQuickMenuModal } from './components/AvatarQuickMenuModal';

// Language Context
import { LanguageProvider, useLanguage } from './context/LanguageContext';

// Real ma'lumot (Supabase -> backend /dashboard)
import { DashboardData } from './lib/api';
import {
  buildMetrics,
  buildNotifications,
  buildRevenueSeries,
  buildSegments,
  buildStoreContext,
  buildWeekdays
} from './lib/dashboardView';
import { rangeLabel } from './components/DateRangeModal';
import { CustomerSegment, ActiveTab, UserProfile } from './types';

// Kirmagan holat uchun bo'sh profil (AuthFlow yopilmaguncha dashboard ko'rinmaydi).
const GUEST_PROFILE: UserProfile = {
  id: '',
  uniqueCode: '',
  name: 'Operon',
  email: '',
  storeName: '',
  businessType: 'Retailer',
  role: '',
  avatarId: 1,
  isVerified: false,
  onboardingCompleted: false
};

// Backend /auth/me javobidan dashboard profilini yasash.
function profileFromMe(me: MeResponse, prev: UserProfile, profile?: BusinessProfile): UserProfile {
  const code = me.business ? `OPR-${me.business.store_code}` : me.id.slice(0, 8).toUpperCase();
  return {
    ...prev,
    id: me.id,
    uniqueCode: code,
    name: prev.email === me.email && prev.name && prev.name !== 'Operon' ? prev.name : me.email.split('@')[0],
    email: me.email,
    storeName: me.business?.brand_name || profile?.brand_name || prev.storeName,
    isVerified: true,
    onboardingCompleted: !!me.business,
    businessData: profile
      ? {
          ...prev.businessData,
          category: profile.business_type,
          salesChannels: profile.channels,
          targetAudience: profile.target_audience || undefined
        }
      : prev.businessData
  };
}

function DashboardApp() {
  const { t, language, setLanguage } = useLanguage();

  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // User Profile & Authentication State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('operon_user_profile');
      if (saved) {
        // Merge over the guest profile so an older/partial stored shape can't
        // leave required fields (avatarId, businessType, ...) undefined.
        return { ...GUEST_PROFILE, ...(JSON.parse(saved) as Partial<UserProfile>) };
      }
    } catch (e) {}
    return GUEST_PROFILE;
  });

  // State Management
  // Dashboard — hammasi Supabase'dan (backend /dashboard/{id})
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [days, setDays] = useState<number>(30);
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [dashError, setDashError] = useState('');
  const [dashLoading, setDashLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);
  const [selectedCustomerSeg, setSelectedCustomerSeg] = useState<CustomerSegment | null>(null);
  const [isRetentionDetailsOpen, setIsRetentionDetailsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Kirish / Ro'yxatdan o'tish / Onboarding oqimi.
  // session: 'checking' (token tekshirilmoqda) | 'anon' | 'ready'.
  const [session, setSession] = useState<'checking' | 'anon' | 'ready'>(tokens.access ? 'checking' : 'anon');
  const [authStep, setAuthStep] = useState<AuthStep | null>(tokens.access ? null : 'welcome');
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  const openAuth = (mode: 'login' | 'register') => setAuthStep(mode);

  // Ilova ochilganda: saqlangan token bo'lsa — backend'dan haqiqiy holatni olamiz.
  useEffect(() => {
    if (!tokens.access) return;
    let cancelled = false;
    // Vaqtinchalik server/tarmoq xatosida (5xx, 0) qayta urinamiz — tokenni o'chirmaymiz.
    const meWithRetry = async () => {
      for (let i = 0; ; i++) {
        try {
          return await api.me();
        } catch (e) {
          const s = e instanceof ApiError ? e.status : 0;
          if (s === 401 || s === 403 || i >= 3) throw e;
          await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
        }
      }
    };
    meWithRetry()
      .then((me) => {
        if (cancelled) return;
        setUserProfile((prev) => profileFromMe(me, prev));
        if (OAUTH_RESULT === 'reset') {
          // "Parolni unutdingizmi?" — Google tasdig'idan keyin yangi parol
          setSession('anon');
          setAuthStep('newpass');
        } else if (me.business) {
          if (me.business.language) setLanguage(me.business.language);
          setBusinessId(me.business.id);
          setSession('ready');
          setAuthStep(null);
        } else {
          // Birinchi marta (Google) — biznes nomi → parol → turi
          setSession('anon');
          setAuthStep('name');
        }
      })
      .catch(() => {
        if (cancelled) return;
        tokens.clear();
        setSession('anon');
        setAuthStep('login');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Dashboard ma'lumotini yuklash (biznes, davr yoki qayta yuklash o'zgarganda)
  useEffect(() => {
    if (session !== 'ready' || !businessId) return;
    let cancelled = false;
    setDashLoading(true);
    setDashError('');
    api
      .dashboard(businessId, days)
      .then((d) => {
        if (!cancelled) setDash(d);
      })
      .catch(() => {
        if (!cancelled)
          setDashError(language === 'ru' ? 'Не удалось загрузить данные.' : 'Деректерді жүктеу мүмкін болмады.');
      })
      .finally(() => {
        if (!cancelled) setDashLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, businessId, days, reloadKey]);

  const metrics = dash ? buildMetrics(dash, language) : [];
  const revenueSeries = dash ? buildRevenueSeries(dash, language) : [];
  const customerData = dash ? buildSegments(dash, language) : [];
  const dayActiveData = dash ? buildWeekdays(dash, language) : [];
  const notifications = dash ? buildNotifications(dash, language) : [];
  const currencyCode = dash?.currency || 'KZT';
  const dateRange = rangeLabel(days, language);
  const retentionTarget = 40;
  const conversion =
    dash && dash.metrics.orders + dash.metrics.inquiries > 0
      ? Math.round((dash.metrics.orders / (dash.metrics.orders + dash.metrics.inquiries)) * 1000) / 10
      : null;

  const unreadCount = dash?.unread_notifications ?? 0;

  const handleMarkAllRead = async () => {
    if (!businessId) return;
    try {
      await api.markNotificationsRead(businessId);
      setReloadKey((k) => k + 1);
    } catch (e) {
      /* panel ochiq qoladi, keyingi yuklashda qayta uriniladi */
    }
  };

  const handleSetOrderStatus = async (orderId: string, status: 'inquiry' | 'confirmed' | 'cancelled') => {
    if (!businessId) return;
    await api.setOrderStatus(businessId, orderId, status);
    setReloadKey((k) => k + 1);
  };

  const handleToggleWidget = (id: string) => {
    setActiveWidgetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    // Open the tool in dedicated modal right away
    setActiveToolDemo(id);
  };

  const handleUpdateProfile = async (updated: UserProfile): Promise<string | null> => {
    // Do'kon nomi — REAL: bazaga yoziladi (avval faqat localStorage'da qolardi)
    if (businessId && updated.storeName && updated.storeName !== userProfile.storeName) {
      try {
        await api.updateBusiness(businessId, { brand_name: updated.storeName });
        setReloadKey((k) => k + 1);
      } catch (e) {
        const ru = language === 'ru';
        if (e instanceof ApiError && e.status === 409) return ru ? 'Это название уже занято' : 'Бұл атау бос емес';
        if (e instanceof ApiError && e.status === 400) return ru ? 'Слишком короткое название' : 'Атау тым қысқа';
        return ru ? 'Не удалось сохранить' : 'Сақталмады';
      }
    }
    setUserProfile(updated);
    try {
      localStorage.setItem('operon_user_profile', JSON.stringify(updated));
    } catch (e) {}
    return null;
  };

  const enterDashboard = (me: MeResponse, profile?: BusinessProfile) => {
    if (me.business) {
      if (me.business.language) setLanguage(me.business.language);
      setBusinessId(me.business.id);
    }
    setUserProfile((prev) => {
      const next = profileFromMe(me, prev, profile);
      try {
        localStorage.setItem('operon_user_profile', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setSession('ready');
    setAuthStep(null);
  };

  const handleLogout = () => {
    // Token va keshlangan profil tozalanadi — keyingi foydalanuvchi oldingisining
    // do'konini ko'rmasin.
    api.logout();
    try {
      localStorage.removeItem('operon_is_authenticated');
      localStorage.removeItem('operon_user_profile');
    } catch (e) {}
    setUserProfile(GUEST_PROFILE);
    setSession('anon');
    setBusinessId(null);
    setDash(null);
    setIsProfileOpen(false);
    setIsAvatarMenuOpen(false);
    setActiveToolDemo(null);
    setActivePhoneTool(null);
    setActiveTab('overview');
    setAuthStep('welcome');
  };

  const storeContext = buildStoreContext(dash, userProfile.storeName, dateRange, language);

  return (
    <div className="h-[100dvh] w-full bg-[#E9ECF2] flex justify-center text-slate-900 font-sans antialiased overflow-hidden">
      {/* Ilova: telefonda to'liq ekran, kompyuterda o'rtada mobil kenglikda */}
      <div className="w-full max-w-[480px] h-full bg-[#FAFAFC] flex flex-col relative sm:shadow-[0_0_40px_-10px_rgba(0,0,0,0.15)] pt-[env(safe-area-inset-top)]">
      {/* Brand Navigation */}
      <HeaderNav
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenFilter={() => setIsFilterOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => {
          openAuth('login');
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
      ) : activeTab === 'video' || activeTab === 'analytics' ? (
        // Pastki menyu: Video yaratish va Analitika (Заказы/Склад o'rniga, 2026-11-13)
        <div className="flex-1 overflow-hidden flex flex-col">
          <ToolDetailView
            key={activeTab}
            toolId={activeTab === 'video' ? 'video-creator' : 'analytics'}
            onBack={() => setActiveTab('overview')}
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

              {dashError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2">
                  <span>{dashError}</span>
                  <button onClick={() => setReloadKey((k) => k + 1)} className="font-bold underline shrink-0">
                    {language === 'ru' ? 'Повторить' : 'Қайталау'}
                  </button>
                </div>
              )}

              {!dash && !dashError && (
                <div className="py-16 flex justify-center">
                  <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {dash && (
                <div className={`space-y-3.5 transition-opacity ${dashLoading ? 'opacity-60' : ''}`}>
                  {/* 4 ta asosiy ko'rsatkich — Supabase'dan */}
                  <MetricCards metrics={metrics} onSelectMetric={() => setActivePhoneTool('orders-manager')} />

                  {activeWidgetIds.includes('conversion-rate') && (
                    <div className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-2xs">
                      <div>
                        <div className="text-[11.5px] font-medium text-slate-500">{t.conversionRate}</div>
                        <div className="text-lg font-bold text-slate-900">{conversion === null ? '—' : `${conversion}%`}</div>
                      </div>
                      <span className="text-[10.5px] text-slate-400 text-right max-w-[150px]">
                        {language === 'ru' ? 'продажи / (продажи + запросы)' : 'сатылым / (сатылым + сұрау)'}
                      </span>
                    </div>
                  )}

                  <ProfitChart
                    data={revenueSeries}
                    total={dash.metrics.revenue}
                    change={dash.metrics.revenue_change}
                    currency={currencyCode}
                    onOpenDetails={() => setActiveTab('analytics')}
                  />

                  <CustomerBreakdown
                    segments={customerData}
                    onSelectSegment={(seg) => {
                      setSelectedCustomerSeg(seg);
                      setIsCustomerDetailsOpen(true);
                    }}
                    onOpenMenu={() => setIsCustomerDetailsOpen(true)}
                  />

                  <DayActiveChart data={dayActiveData} detail={dash.activity} currency={currencyCode} />

                  <RetentionGauge
                    percentage={dash.retention}
                    target={retentionTarget}
                    detail={dash.retention_detail}
                    onShowDetails={() => setIsRetentionDetailsOpen(true)}
                  />
                </div>
              )}

            </>
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
              onOpenAuth={(mode) => {
                openAuth(mode || 'login');
              }}
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

      {/* Dedicated Standalone / Fullscreen Tool Modal for any requested tool */}
      <ToolDemoModal
        toolId={activeToolDemo}
        onClose={() => setActiveToolDemo(null)}
        storeContext={storeContext}
        onChangeTab={setActiveTab}
      />

      {/* Interactive Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        dateRange={dateRange}
        metrics={metrics}
        totalProfit={dash ? `${dash.metrics.revenue} ${currencyCode}` : '—'}
        retention={dash?.retention}
      />

      <DateRangeModal
        isOpen={isDateRangeOpen}
        onClose={() => setIsDateRangeOpen(false)}
        currentDays={days}
        onSelectDays={setDays}
      />

      <AddWidgetModal
        isOpen={isAddWidgetOpen}
        onClose={() => setIsAddWidgetOpen(false)}
        activeWidgetIds={activeWidgetIds}
        onToggleWidget={handleToggleWidget}
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
        rate={dash?.retention ?? 0}
        target={retentionTarget}
        detail={dash?.retention_detail}
        currency={currencyCode}
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
        onOpenAuth={(mode) => {
          openAuth(mode || 'login');
        }}
        onOpenOnboarding={() => setAuthStep('choose')}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />

      {/* Kirish → Ro'yxatdan o'tish → (Biznesni qo'shish | Biznes yaratish) → AI intervyu */}
      {authStep && session !== 'checking' && (
        <AuthFlow
          initialStep={authStep}
          onReady={(me) => enterDashboard(me)}
          onClose={session === 'ready' ? () => setAuthStep(null) : undefined}
        />
      )}

      {/* Quick Avatar Menu: Til va Ro'yxatdan o'tish (Avatar ustiga bosganda chiqadi) */}
      <AvatarQuickMenuModal
        isOpen={isAvatarMenuOpen}
        onClose={() => setIsAvatarMenuOpen(false)}
        userProfile={userProfile}
        onOpenAuth={(mode) => {
          openAuth(mode || 'login');
        }}
        onOpenProfileSettings={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
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

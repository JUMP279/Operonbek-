export interface MetricItem {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  change: string;
  isPositive: boolean;
  comparisonText: string;
  iconName: 'eye' | 'users' | 'mouse-pointer' | 'mail' | 'trending-up' | 'dollar-sign' | 'shopping-cart' | 'percent';
}

export interface CustomerSegment {
  id: string;
  name: string;
  count: string;
  numericCount: number;
  color: string;
  bgColor: string;
  percentage: number;
  icon: 'store' | 'network' | 'package';
}

export interface DayActiveData {
  day: string;
  shortDay: string;
  count: number;
  displayCount: string;
  isPeak?: boolean;
}

export interface ProfitDataPoint {
  date: string;
  displayDate: string;
  profit: number; // in thousands (K)
  orders: number;
  revenue: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  unread: boolean;
  type: 'order' | 'alert' | 'retention' | 'system';
}

export interface UserProfile {
  id: string; // Unique format like OPR-84920
  uniqueCode: string; // OPR-XXXXX
  name: string;
  email: string;
  storeName: string;
  businessType: 'Retailer' | 'Distributor' | 'Wholesaler' | 'Enterprise';
  role: string;
  avatarId: number;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  isVerified: boolean;
  onboardingCompleted?: boolean;
  businessData?: {
    category?: string;
    monthlyRevenue?: string;
    salesChannels?: string[];
    customerBase?: string;
    primaryGoal?: string;
    startupBudget?: string;
    targetAudience?: string;
    businessModel?: 'existing_business' | 'new_startup';
  };
  createdAt?: string;
}

export type OnboardingStep = 'select_catalog' | 'connect_business' | 'create_startup' | 'ai_advice' | 'completed';

export type Language = 'kk' | 'ru';

export type ActiveTab = 'overview' | 'video' | 'analytics' | 'profile';
export type ViewMode = 'single' | 'showcase' | 'full';

export interface BusinessWidget {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  category: string;
  description: string;
  iconName: string;
  gradient: string;
  defaultEnabled?: boolean;
  value?: string;
  change?: string;
}


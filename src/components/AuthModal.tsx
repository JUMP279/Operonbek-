import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Store,
  Phone,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Eye,
  EyeOff,
  UserCheck,
  Globe,
  Fingerprint
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { UserAvatarIcon, AVATAR_LIST } from './UserAvatar';
import { useLanguage } from '../context/LanguageContext';

export { UserAvatarIcon } from './UserAvatar';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile, isNewRegistration: boolean) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login'
}) => {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(5); // Default to a female or male stylish avatar
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Store name, Email, or Unique ID
  const [email, setEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [businessType, setBusinessType] = useState<'Retailer' | 'Distributor' | 'Wholesaler' | 'Enterprise'>('Retailer');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Generate Unique ID helper (OPR-XXXXX)
  const generateUniqueId = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `OPR-${randomNum}`;
  };

  const fillDemoData = () => {
    if (mode === 'login') {
      setLoginIdentifier('Operon Flagship Global');
      setPassword('operon2025Secure!');
    } else {
      setFullName('Madina Rahimova');
      setStoreName('Madina Boutique Tashkent');
      setEmail('madina.boutique@gmail.com');
      setBusinessType('Retailer');
      setPhone('+998 90 123 45 67');
      setPassword('operon2025Secure!');
      setSelectedAvatar(5); // Qiz bola avatari
    }
    setError('');
  };

  // 1-Click Social Sign-In (Google / Apple)
  const handleSocialAuth = (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    setError('');

    setTimeout(() => {
      setSocialLoading(null);
      const uniqueCode = generateUniqueId();
      const socialProfile: UserProfile = {
        id: uniqueCode,
        uniqueCode: uniqueCode,
        name: provider === 'google' ? 'Shohjahon Uralbayev' : 'Madina Rahimova',
        email: provider === 'google' ? 'shohjahonuralbayev5@gmail.com' : 'madina.apple@operon.io',
        storeName: 'Operon Global Store',
        businessType: 'Retailer',
        role: 'Store Owner & Lead Admin',
        avatarId: provider === 'google' ? 1 : 5,
        gender: provider === 'google' ? 'male' : 'female',
        phone: '+998 90 123 45 67',
        isVerified: true,
        onboardingCompleted: true,
        createdAt: new Date().toLocaleDateString()
      };

      try {
        localStorage.setItem('operon_user_profile', JSON.stringify(socialProfile));
        localStorage.setItem('operon_is_authenticated', 'true');
      } catch (err) {}

      onSuccess(socialProfile, false);
      onClose();
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!loginIdentifier.trim() || !password.trim()) {
        setError(
          language === 'ru'
            ? 'Введите название магазина, Email или ID и пароль.'
            : 'Дүкен атауын, Email немесе ID және құпиясөзді енгізіңіз.'
        );
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        // Load existing or generate for this session
        let existing: UserProfile | null = null;
        try {
          const raw = localStorage.getItem('operon_user_profile');
          if (raw) existing = JSON.parse(raw);
        } catch (err) {}

        const finalProfile: UserProfile = existing || {
          id: 'OPR-84920',
          uniqueCode: 'OPR-84920',
          name: 'Shohjahon Uralbayev',
          email: loginIdentifier.includes('@') ? loginIdentifier : 'shohjahonuralbayev5@gmail.com',
          storeName: loginIdentifier.includes('@') ? 'Operon Flagship Global' : loginIdentifier,
          businessType: 'Retailer',
          role: 'Store Owner & Lead Admin',
          avatarId: 1,
          phone: '+998 90 123 45 67',
          isVerified: true,
          onboardingCompleted: true,
          createdAt: new Date().toLocaleDateString()
        };

        try {
          localStorage.setItem('operon_user_profile', JSON.stringify(finalProfile));
          localStorage.setItem('operon_is_authenticated', 'true');
        } catch (err) {}

        // Enter directly to business
        onSuccess(finalProfile, false);
        onClose();
      }, 500);
    } else {
      // REGISTER
      if (!storeName.trim() || !password.trim()) {
        setError(
          language === 'ru'
            ? 'Пожалуйста, укажите название магазина и новый пароль.'
            : 'Дүкен атауын және жаңа құпиясөзді енгізіңіз.'
        );
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccessNotice(true);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        const uniqueCode = generateUniqueId();
        const av = AVATAR_LIST.find((a) => a.id === selectedAvatar);

        const newProfile: UserProfile = {
          id: uniqueCode,
          uniqueCode: uniqueCode,
          name: fullName.trim() || (av?.gender === 'female' ? 'Madina Rahimova' : 'Shohjahon Uralbayev'),
          email: email.trim() || `${(storeName || 'store').toLowerCase().replace(/\s+/g, '')}@operon.io`,
          storeName: storeName.trim(),
          businessType,
          role: 'Store Owner & Lead Admin',
          avatarId: selectedAvatar,
          gender: av?.gender || 'male',
          phone: phone.trim() || '+998 90 123 45 67',
          isVerified: true,
          onboardingCompleted: false,
          createdAt: new Date().toLocaleDateString()
        };

        try {
          localStorage.setItem('operon_user_profile', JSON.stringify(newProfile));
          localStorage.setItem('operon_is_authenticated', 'true');
        } catch (err) {}

        setTimeout(() => {
          onSuccess(newProfile, true); // true = triggers 2-catalog onboarding modal!
          setSuccessNotice(false);
          onClose();
        }, 900);
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L24.3923 8V20L14 26L3.6077 20V8L14 2Z" fill="#FFFFFF" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {mode === 'login' ? 'Operon tizimiga Kirish' : 'Yangi do‘konni Ro‘yxatdan o‘tkazish'}
              </h3>
              <p className="text-[11px] text-slate-400">Mobil Tahlil & AI Boshqaruv Tizimi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl my-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'login' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kirish (Sign In)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'register' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ro‘yxatdan o‘tish
          </button>
        </div>

        {/* Success Banner */}
        {successNotice ? (
          <div className="my-auto py-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Do‘koningiz ro‘yxatdan o‘tdi!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Unikal identifikatoringiz biriktirildi. Katalog tanlash oynasi ochilmoqda...
            </p>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar text-xs">
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-medium">
                {error}
              </div>
            )}

            {/* Quick 1-Click Social Sign-In Buttons */}
            {mode === 'login' && (
              <div className="space-y-2 pb-1">
                <div className="grid grid-cols-2 gap-2">
                  {/* Google Login */}
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('google')}
                    disabled={!!socialLoading}
                    className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-all active:scale-98"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.3 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 15.9C3.7 19.7 7.5 23 12 23z"
                      />
                    </svg>
                    <span>Google orqali</span>
                  </button>

                  {/* Apple / App Store Login */}
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('apple')}
                    disabled={!!socialLoading}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 text-xs font-semibold transition-all active:scale-98"
                  >
                    <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.77-11.89-14.2-6.53-9.89-11.84-20.9-15.94-33.04-4.1-12.14-6.15-23.77-6.15-34.9 0-14.44 3.59-26.68 10.77-36.72 7.18-10.05 16.32-15.2 27.42-15.46 4.35 0 9.49 1.15 15.42 3.45 5.92 2.3 9.94 3.49 12.05 3.57 1.76-.08 6.01-1.32 12.74-3.72 6.73-2.4 12.33-3.4 16.8-3.02 12.44.8 22.42 5.65 29.95 14.54-10.89 6.64-16.23 15.65-16.02 27.05.21 9.07 3.58 16.66 10.11 22.76 6.53 6.1 14.39 9.54 23.58 10.33-2.12 6.53-4.7 13.06-7.75 19.6zM119.22 33.04c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.96-10.45 19.98-12.18.96 7.6-1.57 14.73-7.59 21.39-6.02 6.66-13 10.47-20.95 11.43-.19-.94-.39-1.93-.39-2.97z" />
                    </svg>
                    <span>App Store</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center pt-2">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-2.5 text-[10px] uppercase font-bold text-slate-400 absolute">
                    Yoki do‘kon orqali
                  </span>
                </div>
              </div>
            )}

            {/* ================= REGISTER FIELDS ================= */}
            {mode === 'register' ? (
              <>
                {/* Avatar Selection with 4 options: 2 Female & 2 Male */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 block">
                      Profil Avatari (2 ta Qiz & 2 ta Erkak)
                    </label>
                    <span className="text-[10px] text-blue-600 font-bold">4 ta dizayn</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                    {AVATAR_LIST.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.id)}
                        className={`relative p-1.5 rounded-xl flex flex-col items-center gap-1 transition-all ${
                          selectedAvatar === av.id
                            ? 'bg-white ring-2 ring-blue-600 shadow-xs scale-105'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={av.label}
                      >
                        <UserAvatarIcon avatarId={av.id} size={42} showBadge />
                        <span className="text-[9.5px] font-bold text-slate-700 truncate max-w-[64px]">
                          {av.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Do'kon nomi */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Do‘kon yoki Brend nomi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Masalan: Modiy Brend, Global Store..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-900"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    * Boshqa tadbirkor ham xuddi shu nomni qo‘yishi mumkin, har biringizga unikal ID beriladi.
                  </p>
                </div>

                {/* Tadbirkor ismi */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Tadbirkor / Egasi ismi
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ism va Familiyangiz"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Business Type */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Biznes toifasi
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'Retailer', label: 'Retailer (Chakana savdo)' },
                      { id: 'Distributor', label: 'Distributor (Distribyutsiya)' },
                      { id: 'Wholesaler', label: 'Wholesaler (Ulgurji bozor)' },
                      { id: 'Enterprise', label: 'Enterprise (Katta tarmoq)' }
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBusinessType(b.id as any)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border text-left transition-all ${
                          businessType === b.id
                            ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold ring-1 ring-blue-600'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email / Phone */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="store@operon.io"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:border-blue-500 focus:bg-white text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:border-blue-500 focus:bg-white text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Yangi parol */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Yangi parol <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Yangi parol yarating"
                      className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:border-blue-500 focus:bg-white text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="w-7 h-7 text-slate-400 hover:text-slate-600 absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* ================= LOGIN FIELDS ================= */
              <>
                {/* Do'kon nomi, Email yoki ID */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Do‘kon nomi, Email yoki Unikal ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Do‘kon nomi yoki OPR-84920"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Parol */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Parol <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Parolingizni kiriting"
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="w-7 h-7 text-slate-400 hover:text-slate-600 absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Quick Demo Autofill Tool */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={fillDemoData}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                {t.demoFill}
              </button>

              {mode === 'login' && (
                <button type="button" className="text-[11px] text-slate-500 hover:text-slate-700">
                  {language === 'ru' ? 'Забыли пароль?' : 'Құпиясөзді ұмыттыңыз ба?'}
                </button>
              )}
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                id="btn-submit-auth"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Bajarilmoqda...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    {mode === 'login' ? 'Tizimga Kirish' : 'Ro‘yxatdan o‘tish va Katalog ochish'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            </div>

            {/* Bottom / Corner Switch Link */}
            <div className="pt-2 text-center border-t border-slate-100">
              {mode === 'login' ? (
                <p className="text-[11px] text-slate-500">
                  Hali hisobingiz yo‘qmi?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                    className="font-bold text-blue-600 hover:text-blue-700 underline ml-1"
                  >
                    Ro‘yxatdan o‘tish
                  </button>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Allaqachon do‘koningiz bormi?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="font-bold text-blue-600 hover:text-blue-700 underline ml-1"
                  >
                    Kirish
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

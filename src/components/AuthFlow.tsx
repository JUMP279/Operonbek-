import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Lock, Rocket, Store } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { api, ApiError, MeResponse, OnboardingMode } from '../lib/api';
import { OperonMark } from './HeaderNav';

// Oqim (2026-11-08):
//   Kirish ekrani: [Biznes nomi] [Parol] (Parolni unutdingizmi?) [Kirish]  ── yoki ──  [Google]
//   Birinchi marta: Google → "Biznesingiz nomi" → "Parol" → (Qo'shish | Yaratish) → dashboard.
//   Parolni unutdi: Google orqali tasdiq → "Yangi parol" → dashboard.
// 'register' va 'welcome' eski chaqiruvlar uchun — ikkalasi ham kirish ekranini ochadi.
export type AuthStep =
  | 'welcome'
  | 'login'
  | 'register'
  | 'name'
  | 'password'
  | 'choose'
  | 'finishing'
  | 'reset'
  | 'newpass';

interface AuthFlowProps {
  initialStep?: AuthStep;
  /** Kirish muvaffaqiyatli va biznesi bor — to'g'ridan-to'g'ri dashboardga. */
  onReady: (me: MeResponse) => void;
  /** Faqat allaqachon kirgan foydalanuvchi uchun (masalan, ikkinchi biznes qo'shishda). */
  onClose?: () => void;
}

const TEXT = {
  kk: {
    tagline: 'Бизнесіңізді басқаратын AI-оператор',
    bizName: 'Бизнес атауы',
    bizNamePh: 'Мысалы: Aru Coffee',
    password: 'Құпиясөз',
    login: 'Кіру',
    forgot: 'Құпиясөзді ұмыттыңыз ба?',
    or: 'немесе',
    google: 'Google арқылы кіру',
    firstTime: 'Алғаш рет пе? Google арқылы кіріңіз — содан кейін бизнес атауы мен құпиясөз ойлап табасыз.',
    back: 'Артқа',
    next: 'Әрі қарай',
    nameTitle: 'Бизнесіңіздің атауын енгізіңіз',
    nameSub: 'Келесі жолы осы атау мен құпиясөз арқылы кіресіз.',
    pwTitle: 'Құпиясөз ойлап табыңыз',
    pwSub: 'Кемінде 8 таңба. Оны ешкімге айтпаңыз.',
    pwNew: 'Жаңа құпиясөз',
    pwRepeat: 'Құпиясөзді қайталаңыз',
    chooseTitle: 'Қалай бастаймыз?',
    chooseSub: 'Бірін таңдаңыз — бизнесіңіз бірден ашылады.',
    addTitle: 'Бизнесті қосу',
    addDesc: 'Менің жұмыс істеп тұрған бизнесім бар — Kaspi, WB, Uzum немесе Instagram-да сатамын.',
    createTitle: 'Бизнес құру',
    createDesc: 'Менде идея бар, бизнесті нөлден бастағым келеді.',
    finishing: 'Operon бизнесіңізді ашып жатыр...',
    resetTitle: 'Құпиясөзді қалпына келтіру',
    resetSub: 'Тіркелген Google аккаунтыңыз арқылы растаңыз — содан кейін жаңа құпиясөз қоясыз.',
    resetBtn: 'Google арқылы растау',
    newpassTitle: 'Жаңа құпиясөз',
    save: 'Сақтау',
    errNetwork: 'Серверге қосылу мүмкін болмады. Интернетті тексеріп, қайталаңыз.',
    errLogin: 'Бизнес атауы немесе құпиясөз қате.',
    errFill: 'Бизнес атауы мен құпиясөзді енгізіңіз.',
    errNameShort: 'Атау кемінде 2 таңба болуы керек.',
    errNameTaken: 'Бұл атау бос емес. Басқасын жазыңыз (мысалы, қаланы қосыңыз).',
    errPwShort: 'Құпиясөз кемінде 8 таңба болуы керек.',
    errPwWeak: 'Құпиясөз тым қарапайым. Әріптер мен сандарды араластырыңыз.',
    errPwMatch: 'Құпиясөздер сәйкес емес.',
    errReauth: 'Қауіпсіздік үшін Google арқылы қайта растаңыз.',
    errGoogle: 'Google арқылы кіру сәтсіз аяқталды. Қайталап көріңіз.',
    errGeneric: 'Қате орын алды. Қайталап көріңіз.',
  },
  ru: {
    tagline: 'AI-оператор, который ведёт ваш бизнес',
    bizName: 'Название бизнеса',
    bizNamePh: 'Например: Aru Coffee',
    password: 'Пароль',
    login: 'Войти',
    forgot: 'Забыли пароль?',
    or: 'или',
    google: 'Войти через Google',
    firstTime: 'Впервые здесь? Войдите через Google — затем придумаете название бизнеса и пароль.',
    back: 'Назад',
    next: 'Далее',
    nameTitle: 'Введите название вашего бизнеса',
    nameSub: 'В следующий раз вы войдёте по этому названию и паролю.',
    pwTitle: 'Придумайте пароль',
    pwSub: 'Минимум 8 символов. Никому его не сообщайте.',
    pwNew: 'Новый пароль',
    pwRepeat: 'Повторите пароль',
    chooseTitle: 'С чего начнём?',
    chooseSub: 'Выберите вариант — ваш бизнес откроется сразу.',
    addTitle: 'Добавить бизнес',
    addDesc: 'У меня уже есть бизнес — продаю на Kaspi, WB, Uzum или в Instagram.',
    createTitle: 'Создать бизнес',
    createDesc: 'У меня есть идея, хочу запустить бизнес с нуля.',
    finishing: 'Operon открывает ваш бизнес...',
    resetTitle: 'Восстановление пароля',
    resetSub: 'Подтвердите вход через Google-аккаунт, с которым вы регистрировались, — затем задайте новый пароль.',
    resetBtn: 'Подтвердить через Google',
    newpassTitle: 'Новый пароль',
    save: 'Сохранить',
    errNetwork: 'Не удалось подключиться к серверу. Проверьте интернет и повторите.',
    errLogin: 'Неверное название бизнеса или пароль.',
    errFill: 'Введите название бизнеса и пароль.',
    errNameShort: 'Название должно быть не короче 2 символов.',
    errNameTaken: 'Это название уже занято. Укажите другое (например, добавьте город).',
    errPwShort: 'Пароль должен быть не короче 8 символов.',
    errPwWeak: 'Слишком простой пароль. Смешайте буквы и цифры.',
    errPwMatch: 'Пароли не совпадают.',
    errReauth: 'Для безопасности подтвердите вход через Google ещё раз.',
    errGoogle: 'Не удалось войти через Google. Попробуйте ещё раз.',
    errGeneric: 'Произошла ошибка. Попробуйте ещё раз.',
  },
};

const Logo = ({ size = 40 }: { size?: number }) => (
  <div className="shadow-md rounded-[22%]" style={{ width: size, height: size }}>
    <OperonMark size={size} />
  </div>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

const inputCls =
  'w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white text-sm text-slate-900';

export const AuthFlow: React.FC<AuthFlowProps> = ({ initialStep = 'login', onReady, onClose }) => {
  const { language, setLanguage } = useLanguage();
  const T = TEXT[language] || TEXT.ru;

  const norm = (s: AuthStep): AuthStep => (s === 'welcome' || s === 'register' ? 'login' : s);
  const [step, setStep] = useState<AuthStep>(norm(initialStep));
  const [bizName, setBizName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // name+password yig'ilgan bo'lsa — "choose" bosilganda setupAccount (birinchi sozlash),
  // aks holda (dashboard'dan yangi biznes qo'shish) onboardingQuick.
  const [setupMode, setSetupMode] = useState(false);

  useEffect(() => {
    setStep(norm(initialStep));
    setError('');
    if (initialStep === 'name') setSetupMode(true);
  }, [initialStep]);

  const go = (s: AuthStep) => {
    setError('');
    setStep(s);
  };

  const errorText = (e: unknown, fallback: string) => {
    if (e instanceof ApiError) {
      if (e.status === 0) return T.errNetwork;
      const map: Record<string, string> = {
        bad_credentials: T.errLogin,
        name_taken: T.errNameTaken,
        name_short: T.errNameShort,
        password_short: T.errPwShort,
        password_weak: T.errPwWeak,
        reauth_required: T.errReauth,
      };
      if (map[e.message]) return map[e.message];
    }
    return fallback;
  };

  const google = async (purpose: 'login' | 'reset') => {
    setBusy(true);
    setError('');
    try {
      await api.startGoogle(purpose);
    } catch (err) {
      setError(errorText(err, T.errGoogle));
      setBusy(false);
    }
  };

  // ── Kirish: biznes nomi + parol ─────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!bizName.trim() || !password) {
      setError(T.errFill);
      return;
    }
    setBusy(true);
    try {
      await api.loginBusiness(bizName.trim(), password);
      const me = await api.me();
      setPassword('');
      if (me.business) onReady(me);
      else {
        setSetupMode(true);
        go('name');
      }
    } catch (err) {
      setError(errorText(err, T.errLogin));
    } finally {
      setBusy(false);
    }
  };

  // ── Birinchi sozlash: nom ───────────────────────────────────────────────
  const handleName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const n = bizName.trim().replace(/\s+/g, ' ');
    if (n.length < 2) {
      setError(T.errNameShort);
      return;
    }
    setBusy(true);
    try {
      const r = await api.nameAvailable(n);
      if (!r.available) {
        setError(T.errNameTaken);
        return;
      }
      setBizName(n);
      setPassword('');
      setPassword2('');
      go('password');
    } catch (err) {
      setError(errorText(err, T.errGeneric));
    } finally {
      setBusy(false);
    }
  };

  const pwProblem = (): string => {
    if (password.length < 8) return T.errPwShort;
    if (new Set(password).size < 4) return T.errPwWeak;
    if (password !== password2) return T.errPwMatch;
    return '';
  };

  // ── Birinchi sozlash: parol ─────────────────────────────────────────────
  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const p = pwProblem();
    if (p) {
      setError(p);
      return;
    }
    setSetupMode(true);
    go('choose');
  };

  // ── Biznes turi tanlandi → yaratish ─────────────────────────────────────
  const chooseMode = async (m: OnboardingMode) => {
    setStep('finishing');
    setError('');
    try {
      if (setupMode) await api.setupAccount(bizName, password, m, language);
      else await api.onboardingQuick(m, language);
      setPassword('');
      setPassword2('');
      const me = await api.me();
      confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
      onReady(me);
    } catch (err) {
      const msg = errorText(err, T.errGeneric);
      setError(msg);
      // Nom band bo'lib qolgan bo'lsa — nom bosqichiga qaytaramiz
      if (err instanceof ApiError && err.message === 'name_taken') setStep('name');
      else if (err instanceof ApiError && err.message.startsWith('password_')) setStep('password');
      else setStep('choose');
    }
  };

  // ── Parolni tiklash: yangi parol ────────────────────────────────────────
  const handleNewPass = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = pwProblem();
    if (p) {
      setError(p);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.setNewPassword(password);
      setPassword('');
      setPassword2('');
      const me = await api.me();
      if (me.business) onReady(me);
      else {
        setSetupMode(true);
        go('name');
      }
    } catch (err) {
      setError(errorText(err, T.errGeneric));
    } finally {
      setBusy(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────
  const LangToggle = (
    <div className="flex items-center bg-white/80 rounded-xl p-0.5 border border-slate-200 shadow-2xs">
      {(['kk', 'ru'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLanguage(l)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            language === l ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {l === 'kk' ? 'ҚАЗ' : 'РУС'}
        </button>
      ))}
    </div>
  );

  const ErrorBox = error ? (
    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{error}</div>
  ) : null;

  const BackBtn = ({ to }: { to: AuthStep }) => (
    <button
      type="button"
      onClick={() => go(to)}
      className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
    >
      <ArrowLeft className="w-3.5 h-3.5" /> {T.back}
    </button>
  );

  const Spinner = <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;

  const PrimaryBtn = ({ label }: { label: string }) => (
    <button
      type="submit"
      disabled={busy}
      className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-all"
    >
      {busy ? (
        Spinner
      ) : (
        <>
          {label} <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );

  const GoogleBtn = ({ purpose, label }: { purpose: 'login' | 'reset'; label: string }) => (
    <button
      type="button"
      disabled={busy}
      onClick={() => google(purpose)}
      className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm border border-slate-200 flex items-center justify-center gap-2.5 disabled:opacity-60 active:scale-[0.98] transition-all"
    >
      <GoogleIcon /> {label}
    </button>
  );

  const PasswordInput = ({
    value,
    onChange,
    placeholder,
    autoComplete,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    autoComplete: string;
  }) => (
    <div className="relative">
      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );

  const NameInput = (
    <div className="relative">
      <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        autoComplete="username"
        value={bizName}
        maxLength={60}
        onChange={(e) => setBizName(e.target.value)}
        placeholder={T.bizNamePh}
        className={inputCls}
      />
    </div>
  );

  let body: React.ReactNode = null;

  if (step === 'login') {
    body = (
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="flex flex-col items-center text-center gap-2 pt-1 pb-1">
          <Logo size={52} />
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Operon</h1>
          <p className="text-sm text-slate-500">{T.tagline}</p>
        </div>
        {ErrorBox}
        <label className="block">
          <span className="text-xs font-semibold text-slate-700">{T.bizName}</span>
          <div className="mt-1">{NameInput}</div>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-700">{T.password}</span>
          <div className="mt-1">
            {PasswordInput({ value: password, onChange: setPassword, placeholder: '••••••••', autoComplete: 'current-password' })}
          </div>
        </label>
        <div className="flex justify-end -mt-1">
          <button type="button" onClick={() => go('reset')} className="text-xs font-semibold text-blue-600 hover:underline">
            {T.forgot}
          </button>
        </div>
        <PrimaryBtn label={T.login} />
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase">{T.or}</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <GoogleBtn purpose="login" label={T.google} />
        <p className="text-center text-[11px] text-slate-500 leading-relaxed px-2">{T.firstTime}</p>
      </form>
    );
  } else if (step === 'name') {
    body = (
      <form onSubmit={handleName} className="space-y-4">
        <div className="flex items-center gap-3 pt-1">
          <Logo size={40} />
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 leading-tight">{T.nameTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{T.nameSub}</p>
          </div>
        </div>
        {ErrorBox}
        {NameInput}
        <PrimaryBtn label={T.next} />
      </form>
    );
  } else if (step === 'password' || step === 'newpass') {
    const isNew = step === 'newpass';
    body = (
      <form onSubmit={isNew ? handleNewPass : handlePassword} className="space-y-4">
        {!isNew && <BackBtn to="name" />}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 leading-tight">{isNew ? T.newpassTitle : T.pwTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{T.pwSub}</p>
          </div>
        </div>
        {!isNew && bizName && (
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            {T.bizName}: <b className="text-slate-900">{bizName}</b>
          </div>
        )}
        {ErrorBox}
        {PasswordInput({ value: password, onChange: setPassword, placeholder: isNew ? T.pwNew : T.password, autoComplete: 'new-password' })}
        {PasswordInput({ value: password2, onChange: setPassword2, placeholder: T.pwRepeat, autoComplete: 'new-password' })}
        <PrimaryBtn label={isNew ? T.save : T.next} />
      </form>
    );
  } else if (step === 'reset') {
    body = (
      <div className="space-y-4">
        <BackBtn to="login" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">{T.resetTitle}</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{T.resetSub}</p>
        {ErrorBox}
        <GoogleBtn purpose="reset" label={T.resetBtn} />
      </div>
    );
  } else if (step === 'choose') {
    const Card = ({ m, icon, title, desc }: { m: OnboardingMode; icon: React.ReactNode; title: string; desc: string }) => (
      <button
        onClick={() => chooseMode(m)}
        className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 bg-white transition-all active:scale-[0.98] group"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
          </div>
        </div>
      </button>
    );
    body = (
      <div className="space-y-5">
        {setupMode && <BackBtn to="password" />}
        <div className="text-center space-y-1.5 pt-2">
          <h2 className="text-2xl font-extrabold text-slate-900">{T.chooseTitle}</h2>
          <p className="text-sm text-slate-500">{T.chooseSub}</p>
        </div>
        {ErrorBox}
        <Card m="add" icon={<Store className="w-6 h-6" />} title={T.addTitle} desc={T.addDesc} />
        <Card m="create" icon={<Rocket className="w-6 h-6" />} title={T.createTitle} desc={T.createDesc} />
      </div>
    );
  } else if (step === 'finishing') {
    body = (
      <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-700">{T.finishing}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-md flex items-center justify-between mb-3">
          {onClose && step !== 'finishing' ? (
            <button onClick={onClose} className="text-xs font-semibold text-slate-500 hover:text-slate-900">
              ✕
            </button>
          ) : (
            <span />
          )}
          {LangToggle}
        </div>
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-5 sm:p-6">{body}</div>
      </div>
    </div>
  );
};

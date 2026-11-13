import React, { useEffect, useRef, useState } from 'react';
import { Instagram, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';

// Instagram ulash (Instagram Login): backend imzolangan havola beradi → yangi oynada
// Instagram kirish → backend tokenni biznesga yozadi → bu karta holatni so'raydi.
export const InstagramConnectCard: React.FC<{ businessId?: string | null }> = ({ businessId }) => {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const [status, setStatus] = useState<{ connected: boolean; healthy?: boolean | null; username: string | null; telegram_url?: string | null } | null>(null);
  const [copied, setCopied] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');
  const [confirmOff, setConfirmOff] = useState(false);
  const [busyOff, setBusyOff] = useState(false);
  const pollRef = useRef<number | null>(null);

  const stop = () => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setWaiting(false);
  };

  const load = async () => {
    if (!businessId) return null;
    try {
      const s = await api.instagramStatus(businessId);
      setStatus({ connected: s.connected, healthy: s.healthy, username: s.username, telegram_url: s.telegram_url });
      return s;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    load();
    const onMsg = (e: MessageEvent) => {
      if (e.data === 'instagram_connected') {
        load();
        stop();
      }
    };
    window.addEventListener('message', onMsg);
    return () => {
      window.removeEventListener('message', onMsg);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const connect = async () => {
    if (!businessId || waiting) return;
    setError('');
    // Oyna DARHOL ochiladi (brauzer popup blokeri await'dan keyingi window.open'ni to'sadi)
    const win = window.open('', '_blank');
    try {
      const { login_url } = await api.instagramLink(businessId);
      if (win) win.location.href = login_url;
      else window.location.href = login_url;
    } catch {
      win?.close();
      setError(ru ? 'Не удалось получить ссылку. Попробуйте ещё раз.' : 'Сілтеме алынбады. Қайталап көріңіз.');
      return;
    }
    setWaiting(true);
    const started = Date.now();
    pollRef.current = window.setInterval(async () => {
      const s = await load();
      if ((s?.connected && s.healthy !== false) || Date.now() - started > 5 * 60 * 1000) stop();
    }, 3000);
  };

  // Profildan Instagram'ni uzish (ikki bosqichli tasdiq — tasodifan bosib yubormaslik uchun)
  const disconnect = async () => {
    if (!businessId || busyOff) return;
    setBusyOff(true);
    setError('');
    try {
      await api.instagramDisconnect(businessId);
      setConfirmOff(false);
      await load();
    } catch {
      setError(ru ? 'Не удалось отключить. Попробуйте ещё раз.' : 'Ажырату мүмкін болмады. Қайталап көріңіз.');
    } finally {
      setBusyOff(false);
    }
  };

  if (!businessId) return null;

  // Bazada ulangan, lekin Instagram'dan signal kelmasa — texnik nosozlik: qayta ulash taklif qilinadi
  const broken = !!status?.connected && status.healthy === false;
  const connected = !!status?.connected && !broken;
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-amber-400 text-white flex items-center justify-center shrink-0">
          <Instagram className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-900">Instagram</div>
          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
            {status === null ? (
              '…'
            ) : broken && !waiting ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="text-rose-700 font-semibold whitespace-normal">
                  {ru ? 'Техническая ошибка — переподключите Instagram' : 'Техникалық ақау — Instagram-ды қайта қосыңыз'}
                </span>
              </>
            ) : connected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-emerald-700 font-semibold">
                  {status.username ? `@${status.username}` : ru ? 'Подключён' : 'Қосылған'}
                </span>
              </>
            ) : waiting ? (
              ru ? 'Завершите вход в открывшемся окне…' : 'Ашылған терезеде кіруді аяқтаңыз…'
            ) : ru ? (
              'Не подключён'
            ) : (
              'Қосылмаған'
            )}
          </div>
        </div>
        {!connected && status !== null && (
          <button
            onClick={connect}
            disabled={waiting}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 active:scale-95 disabled:opacity-60 bg-pink-600 text-white"
          >
            {waiting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {ru ? 'Подключить' : 'Қосу'}
          </button>
        )}
      </div>
      {(connected || broken) && !waiting && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {!confirmOff ? (
            <>
              {connected && (
                <button onClick={connect}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95">
                  {ru ? 'Сменить аккаунт' : 'Аккаунтты ауыстыру'}
                </button>
              )}
              <button onClick={() => setConfirmOff(true)}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 active:scale-95">
                {ru ? 'Отключить' : 'Ажырату'}
              </button>
            </>
          ) : (
            <>
              <span className="text-[11px] text-slate-700 font-semibold">
                {ru ? 'Отключить Instagram? Посты и видео перестанут публиковаться.' : 'Instagram ажыратылсын ба? Посттар мен бейнелер жарияланбайды.'}
              </span>
              <button onClick={disconnect} disabled={busyOff}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-rose-600 text-white flex items-center gap-1 active:scale-95 disabled:opacity-60">
                {busyOff && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {ru ? 'Да, отключить' : 'Иә, ажырату'}
              </button>
              <button onClick={() => setConfirmOff(false)} disabled={busyOff}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 active:scale-95">
                {ru ? 'Отмена' : 'Болдырмау'}
              </button>
            </>
          )}
        </div>
      )}
      {!connected && status !== null && (
        <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-[11px] leading-snug text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">
            {ru ? 'Как подключить (1 минута):' : 'Қалай қосу керек (1 минут):'}
          </p>
          <p>
            1.{' '}
            {ru ? (
              <>Откроется страница <b>Instagram</b> — войдите в аккаунт магазина (не в личный).</>
            ) : (
              <><b>Instagram</b> беті ашылады — дүкен аккаунтына кіріңіз (жеке аккаунтқа емес).</>
            )}
          </p>
          <p>2. {ru ? <>Нажмите <b>«Разрешить»</b> — окно закроется само.</> : <><b>«Рұқсат беру»</b> батырмасын басыңыз — терезе өзі жабылады.</>}</p>
          <p className="text-slate-500">
            {ru
              ? '🔒 Пароль вводится только на сайте Instagram/Meta — Operon его не видит.'
              : '🔒 Құпиясөз тек Instagram/Meta сайтында енгізіледі — Operon оны көрмейді.'}
          </p>
          <p className="text-slate-500">
            {ru
              ? 'Нужен профессиональный аккаунт (Бизнес или Автор) — переключить можно в настройках Instagram.'
              : 'Кәсіби аккаунт керек (Бизнес не Автор) — Instagram баптауларында ауыстыруға болады.'}
          </p>
        </div>
      )}
      {connected && status?.telegram_url && (
        <div className="mt-3 rounded-xl bg-sky-50 border border-sky-100 p-2.5 text-[11px] leading-snug text-slate-700 space-y-1.5">
          <p className="font-bold text-slate-800">
            {ru ? 'Добавьте Telegram в профиль Instagram' : 'Telegram-ды Instagram профиліне қосыңыз'}
          </p>
          <p className="text-slate-500">
            {ru
              ? 'Instagram не разрешает приложениям менять профиль, поэтому это 1 шаг для вас: Instagram → Редактировать профиль → Ссылки → вставьте ссылку.'
              : 'Instagram қосымшаларға профильді өзгертуге рұқсат бермейді, сондықтан бұл сіз үшін 1 қадам: Instagram → Профильді өңдеу → Сілтемелер → сілтемені қойыңыз.'}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate bg-white border border-sky-100 rounded-lg px-2 py-1">{status.telegram_url}</code>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(status.telegram_url || '');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  /* clipboard ruxsati yo'q */
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold shrink-0"
            >
              {copied ? (ru ? 'Скопировано' : 'Көшірілді') : ru ? 'Копировать' : 'Көшіру'}
            </button>
          </div>
          <p className="text-slate-500">
            {ru ? 'Ссылка также добавляется в подписи к видео и в первый ответ клиенту в Direct.' : 'Сілтеме бейне жазбаларына және Direct-тегі алғашқы жауапқа да қосылады.'}
          </p>
        </div>
      )}
      {error && (
        <div className="mt-2 text-[11px] text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </div>
      )}
    </div>
  );
};

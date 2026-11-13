import React, { useEffect, useRef, useState } from 'react';
import { Send, Loader2, CheckCircle2, AlertCircle, Circle, Copy, Link2, MessageSquare, Bot } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, TelegramInfo } from '../lib/api';
import { OwnBotPanel } from './OwnBotPanel';

// Telegram ulash (2026-11-10): 1) imzolangan havola bilan botni ochib «Start» → bot egasining chatiga
// bog'lanadi; 2) botni kanalga ADMIN qilib qo'shish → kanal biznesga avtomatik yoziladi.
// Shundan keyin rejadagi post va videolar Telegram kanalga ham chiqadi.
export const TelegramConnectCard: React.FC<{ businessId?: string | null; storeName?: string }> = ({ businessId, storeName }) => {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const [info, setInfo] = useState<TelegramInfo | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');
  const [confirmOff, setConfirmOff] = useState(false);
  const [busyOff, setBusyOff] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    if (!info?.customer_link) return;
    try {
      await navigator.clipboard.writeText(info.customer_link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard yopiq */ }
  };
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
      const s = await api.telegramInfo(businessId);
      setInfo(s);
      return s;
    } catch {
      return null;
    }
  };

  // Ulanish jarayonida holatni har 3s tekshiramiz (10 daqiqagacha)
  const startPolling = () => {
    if (pollRef.current !== null) return;
    setWaiting(true);
    const started = Date.now();
    pollRef.current = window.setInterval(async () => {
      const s = await load();
      if (s?.connected || Date.now() - started > 10 * 60 * 1000) stop();
    }, 3000);
  };

  useEffect(() => {
    load().then((s) => {
      if (s && s.bot_linked && !s.connected) startPolling();
    });
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const openBot = async () => {
    if (!businessId) return;
    setError('');
    const win = window.open('', '_blank');   // popup blokeridan qochish: oyna darhol ochiladi
    try {
      const { deep_link } = await api.telegramLink(businessId);
      if (win) win.location.href = deep_link;
      else window.location.href = deep_link;
      startPolling();
    } catch {
      win?.close();
      setError(ru ? 'Не удалось получить ссылку. Попробуйте ещё раз.' : 'Сілтеме алынбады. Қайталап көріңіз.');
    }
  };

  const disconnect = async () => {
    if (!businessId || busyOff) return;
    setBusyOff(true);
    setError('');
    try {
      await api.telegramDisconnect(businessId);
      setConfirmOff(false);
      await load();
    } catch {
      setError(ru ? 'Не удалось отключить. Попробуйте ещё раз.' : 'Ажырату мүмкін болмады. Қайталап көріңіз.');
    } finally {
      setBusyOff(false);
    }
  };

  if (!businessId) return null;
  const connected = !!info?.connected;
  const bot = info?.bot_username ? `@${info.bot_username}` : (ru ? 'бота Operon' : 'Operon ботын');

  const Step: React.FC<{ done: boolean; n: number; children: React.ReactNode }> = ({ done, n, children }) => (
    <div className="flex gap-2 items-start">
      {done ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-px" /> : <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-px" />}
      <div className={`flex-1 ${done ? 'text-slate-400' : 'text-slate-700'}`}><b>{n}.</b> {children}</div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
          <Send className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-900">Telegram</div>
          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
            {info === null ? '…' : connected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-emerald-700 font-semibold">{info.channel}</span>
              </>
            ) : info.bot_linked ? (
              ru ? 'Бот подключён — осталось добавить в канал' : 'Бот қосылды — арнаға қосу қалды'
            ) : ru ? 'Не подключён' : 'Қосылмаған'}
          </div>
        </div>
        {!connected && info !== null && !info.bot_linked && (
          <button onClick={openBot}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 active:scale-95 bg-sky-600 text-white">
            {ru ? 'Подключить' : 'Қосу'}
          </button>
        )}
      </div>

      {!connected && info !== null && (
        <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-[11px] leading-snug space-y-1.5">
          <p className="font-bold text-slate-800">{ru ? 'Как подключить канал (2 шага):' : 'Арнаны қалай қосу керек (2 қадам):'}</p>
          <Step done={!!info.bot_linked} n={1}>
            {ru
              ? <>Нажмите «Подключить» — откроется {bot} в Telegram. Нажмите <b>«Start»</b>.</>
              : <>«Қосу» батырмасын басыңыз — Telegram-да {bot} ашылады. <b>«Start»</b> басыңыз.</>}
            {info.bot_linked && (
              <button onClick={openBot} className="ml-1 text-sky-700 font-bold">{ru ? 'Открыть снова' : 'Қайта ашу'}</button>
            )}
          </Step>
          <Step done={false} n={2}>
            {ru
              ? <>Откройте свой канал → Управление каналом → <b>Администраторы</b> → Добавить → найдите {bot} → включите <b>«Публикация сообщений»</b> → Сохранить.</>
              : <>Арнаңызды ашыңыз → Арнаны басқару → <b>Әкімшілер</b> → Қосу → {bot} табыңыз → <b>«Хабар жариялау»</b> құқығын қосыңыз → Сақтау.</>}
          </Step>
          {waiting && (
            <p className="text-sky-700 font-semibold flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />{ru ? 'Ждём подключения канала…' : 'Арнаның қосылуын күтудеміз…'}
            </p>
          )}
          <p className="text-slate-500">
            {ru
              ? 'После подключения посты и видео по плану будут выходить и в Instagram, и в Telegram-канал.'
              : 'Қосылғаннан кейін жоспардағы посттар мен бейнелер Instagram-ға да, Telegram арнаға да шығады.'}
          </p>
        </div>
      )}

      {info?.bot_linked && (
        <div className="mt-3 space-y-2">
          {info.customer_link && (
            <div className="rounded-xl bg-sky-50 border border-sky-100 p-2.5 text-[11px] leading-snug space-y-1.5">
              <p className="font-bold text-slate-800 flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5 text-sky-600" />{ru ? 'Ссылка для клиентов' : 'Клиенттерге арналған сілтеме'}</p>
              <div className="flex items-center gap-1.5">
                <code className="flex-1 min-w-0 truncate bg-white rounded-lg px-2 py-1.5 text-[11px] text-slate-700 border border-sky-100">{info.customer_link}</code>
                <button onClick={copyLink} className="shrink-0 px-2.5 py-1.5 rounded-lg bg-sky-600 text-white text-[11px] font-bold flex items-center gap-1 active:scale-95">
                  <Copy className="w-3.5 h-3.5" />{copied ? (ru ? 'Скопировано' : 'Көшірілді') : (ru ? 'Копировать' : 'Көшіру')}
                </button>
              </div>
              <p className="text-slate-500">
                {ru ? 'Поставьте её в шапку Instagram, описание канала и сторис. Клиент нажмёт — попадёт в чат вашего магазина: AI ответит, а заказ появится в «Заказах». Под каждым постом в канале уже есть кнопка «Заказать».'
                  : 'Оны Instagram профиліне, арна сипаттамасына және сторисқа қойыңыз. Клиент басса — дүкеніңіздің чатына түседі: AI жауап береді, тапсырыс «Тапсырыстар» бөлімінде шығады. Арнадағы әр посттың астында «Тапсырыс беру» батырмасы бар.'}
              </p>
            </div>
          )}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-[11px] leading-snug space-y-1">
            <p className="font-bold text-slate-800 flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-purple-600" />{ru ? 'Бот для вас (владельца)' : 'Сізге арналған бот (иесі)'}</p>
            <p className="text-slate-600">
              {ru ? <>В чате с {bot}: <b>/orders</b> — заказы, <b>/hot</b> — готовы купить, <b>/stats</b> — итоги дня, <b>/link</b> — ссылка. Новые заказы приходят с кнопками «Продано / Отмена». Ответьте (Reply) на уведомление — ответ уйдёт клиенту.</>
                : <>{bot} чатында: <b>/orders</b> — тапсырыстар, <b>/hot</b> — сатып алуға дайын, <b>/stats</b> — күн қорытындысы, <b>/link</b> — сілтеме. Жаңа тапсырыстар «Сатылды / Бас тарту» батырмаларымен келеді. Хабарламаға Reply жазсаңыз — жауап клиентке жетеді.</>}
            </p>
          </div>
          {connected && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-[11px] leading-snug space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                {info.comments_group ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <MessageSquare className="w-3.5 h-3.5 text-slate-400" />}
                {ru ? 'Ответы на комментарии в канале' : 'Арнадағы пікірлерге жауап'}
                {info.comments_group && <span className="font-semibold text-emerald-700">· {info.comments_group}</span>}
              </p>
              {!info.comments_group && (
                <p className="text-slate-600">
                  {ru ? <>Канал → Управление → <b>Обсуждение</b> → создайте или выберите группу. Затем в этой группе → Администраторы → добавьте {bot}. AI начнёт отвечать на комментарии под постами.</>
                    : <>Арна → Басқару → <b>Талқылау</b> → топ құрыңыз не таңдаңыз. Сосын сол топта → Әкімшілер → {bot} қосыңыз. AI посттар астындағы пікірлерге жауап бере бастайды.</>}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {info !== null && (
        <div className="mt-2">
          <OwnBotPanel businessId={businessId} ru={ru} info={info} storeName={storeName} onChanged={() => { load(); }} />
        </div>
      )}

      {connected && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {info?.channel_url && (
            <a href={info.channel_url} target="_blank" rel="noreferrer"
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200">
              {ru ? 'Открыть канал' : 'Арнаны ашу'}
            </a>
          )}
          {!confirmOff ? (
            <button onClick={() => setConfirmOff(true)}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 active:scale-95">
              {ru ? 'Отключить' : 'Ажырату'}
            </button>
          ) : (
            <>
              <span className="text-[11px] text-slate-700 font-semibold">
                {ru ? 'Отключить канал? Посты и видео перестанут выходить в Telegram.' : 'Арна ажыратылсын ба? Посттар мен бейнелер Telegram-ға шықпайды.'}
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
      {error && (
        <div className="mt-2 text-[11px] text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </div>
      )}
    </div>
  );
};

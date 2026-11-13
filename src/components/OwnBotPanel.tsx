import React, { useState } from 'react';
import { Bot, Loader2, CheckCircle2, AlertCircle, ExternalLink, Pencil } from 'lucide-react';
import { api, ApiError, TelegramInfo } from '../lib/api';

// Tadbirkorning O'Z boti (2026-11-13): Telegram'da bot ismi/rasmi hamma uchun bitta, shuning uchun do'kon
// nomi va logotipi bilan bot = tadbirkorning o'z boti (@BotFather, 1 daqiqa). Operon nom, logotip va
// webhook'ni o'zi qo'yadi; keyin mijozlar, kanal postlari va egaga xabarlar shu bot orqali (services/own_bot.py).
const T = {
  ru: {
    title: 'Свой бот с именем и логотипом магазина',
    intro: 'Сейчас клиенты пишут общему боту Operon. Подключите своего бота — клиенты увидят название и логотип вашего магазина.',
    s1: <>Откройте <b>@BotFather</b> в Telegram → <b>/newbot</b> → придумайте имя и адрес (должен заканчиваться на <b>bot</b>).</>,
    s2: <>BotFather пришлёт <b>токен</b> (вида 123456789:AA…) — скопируйте и вставьте сюда.</>,
    token: 'Токен от @BotFather', name: 'Имя бота (видят клиенты)', connect: 'Подключить бота',
    connected: 'Ваш бот', rename: 'Сменить имя', save: 'Сохранить', cancel: 'Отмена', off: 'Отключить своего бота',
    offConfirm: 'Отключить? Клиенты снова будут писать общему боту Operon.', yes: 'Да, отключить',
    after: 'Чтобы всё заработало:', a1: 'Откройте своего бота и нажмите «Start» — туда будут приходить заказы.',
    a2: (b: string) => <>В канале: Администраторы → добавьте <b>{b}</b> с правом «Публикация сообщений» (и в группе обсуждений, если есть).</>,
    openBot: 'Открыть бота', logoNote: 'Логотип берётся из профиля магазина (Бренд → логотип).',
    logoOk: 'Логотип установлен', nameLimit: 'Telegram позволяет менять имя бота не чаще нескольких раз в день.',
    err: 'Не удалось. Попробуйте ещё раз.',
  },
  kk: {
    title: 'Дүкен атауы мен логотипі бар өз ботыңыз',
    intro: 'Қазір клиенттер Operon-ның ортақ ботына жазады. Өз ботыңызды қосыңыз — клиенттер дүкеніңіздің атауы мен логотипін көреді.',
    s1: <>Telegram-да <b>@BotFather</b> ашыңыз → <b>/newbot</b> → атауы мен мекенжайын ойлап табыңыз (<b>bot</b> деп аяқталуы керек).</>,
    s2: <>BotFather <b>токен</b> жібереді (123456789:AA… түрінде) — көшіріп, осында қойыңыз.</>,
    token: '@BotFather токені', name: 'Бот атауы (клиенттер көреді)', connect: 'Ботты қосу',
    connected: 'Сіздің ботыңыз', rename: 'Атауын өзгерту', save: 'Сақтау', cancel: 'Болдырмау', off: 'Өз ботты ажырату',
    offConfirm: 'Ажыратылсын ба? Клиенттер қайтадан Operon-ның ортақ ботына жазады.', yes: 'Иә, ажырату',
    after: 'Бәрі жұмыс істеуі үшін:', a1: 'Ботыңызды ашып, «Start» басыңыз — тапсырыстар сонда келеді.',
    a2: (b: string) => <>Арнада: Әкімшілер → <b>{b}</b> қосыңыз, «Хабар жариялау» құқығымен (талқылау тобында да, бар болса).</>,
    openBot: 'Ботты ашу', logoNote: 'Логотип дүкен профилінен алынады (Бренд → логотип).',
    logoOk: 'Логотип орнатылды', nameLimit: 'Telegram бот атауын күніне бірнеше реттен жиі өзгертуге рұқсат бермейді.',
    err: 'Болмады. Қайталап көріңіз.',
  },
};

export const OwnBotPanel: React.FC<{
  businessId: string; ru: boolean; info: TelegramInfo; storeName?: string; onChanged: () => void;
}> = ({ businessId, ru, info, storeName, onChanged }) => {
  const L = T[ru ? 'ru' : 'kk'];
  const own = info.own_bot || null;
  const [token, setToken] = useState('');
  const [name, setName] = useState(storeName || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ownerLink, setOwnerLink] = useState<string | null>(null);
  const [logoOk, setLogoOk] = useState<boolean | null>(null);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [confirmOff, setConfirmOff] = useState(false);

  // Backend aniq sabab qaytaradi ("Неверный токен…"); tarmoq xatosida — umumiy matn
  const msg = (e: unknown) => (e instanceof ApiError && e.status >= 400 && e.message ? e.message : L.err);

  const connect = async () => {
    if (!token.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const r = await api.ownBotConnect(businessId, token.trim(), name.trim() || undefined);
      setOwnerLink(r.owner_link);
      setLogoOk(r.logo_set);
      setToken('');
      onChanged();
    } catch (e) {
      setError(msg(e));
    } finally {
      setBusy(false);
    }
  };

  const rename = async () => {
    if (newName.trim().length < 2 || busy) return;
    setBusy(true);
    setError('');
    try {
      await api.ownBotRename(businessId, newName.trim());
      setEditing(false);
      onChanged();
    } catch (e) {
      setError(msg(e));
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    setError('');
    try {
      await api.ownBotDisconnect(businessId);
      setConfirmOff(false);
      setOwnerLink(null);
      onChanged();
    } catch (e) {
      setError(msg(e));
    } finally {
      setBusy(false);
    }
  };

  const input = 'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[12px] outline-none focus:border-violet-400';

  return (
    <div className="rounded-xl bg-violet-50/60 border border-violet-100 p-2.5 text-[11px] leading-snug space-y-2">
      <p className="font-bold text-slate-800 flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-violet-600" />{L.title}</p>

      {!own && (
        <>
          <p className="text-slate-600">{L.intro}</p>
          <p className="text-slate-700"><b>1.</b> {L.s1}</p>
          <p className="text-slate-700"><b>2.</b> {L.s2}</p>
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder={L.token} className={input}
            autoComplete="off" spellCheck={false} />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={L.name} maxLength={64} className={input} />
          <p className="text-slate-500">{L.logoNote}</p>
          <button onClick={connect} disabled={busy || !token.trim()}
            className="w-full h-9 rounded-lg bg-violet-600 text-white text-[12px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.99] disabled:opacity-60">
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{L.connect}
          </button>
        </>
      )}

      {own && (
        <>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 truncate">{own.name}</p>
              <p className="text-slate-500 truncate">@{own.username}</p>
            </div>
            <a href={`https://t.me/${own.username}`} target="_blank" rel="noreferrer"
              className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white border border-violet-100 text-violet-700 font-bold flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" />{L.openBot}
            </a>
          </div>
          {logoOk && <p className="text-emerald-700 font-semibold">✓ {L.logoOk}</p>}

          {(ownerLink || !info.bot_linked) && (
            <div className="rounded-lg bg-white border border-violet-100 p-2 space-y-1">
              <p className="font-bold text-slate-800">{L.after}</p>
              <p className="text-slate-700">
                <b>1.</b> {L.a1}{' '}
                {ownerLink && <a href={ownerLink} target="_blank" rel="noreferrer" className="text-violet-700 font-bold">{L.openBot} →</a>}
              </p>
              <p className="text-slate-700"><b>2.</b> {L.a2(`@${own.username}`)}</p>
            </div>
          )}

          {editing ? (
            <div className="space-y-1.5">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={64} className={input} autoFocus />
              <p className="text-slate-500">{L.nameLimit}</p>
              <div className="flex gap-2">
                <button onClick={rename} disabled={busy || newName.trim().length < 2}
                  className="px-3 py-1.5 rounded-lg bg-violet-600 text-white font-bold flex items-center gap-1 disabled:opacity-60">
                  {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{L.save}
                </button>
                <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold">{L.cancel}</button>
              </div>
            </div>
          ) : confirmOff ? (
            <div className="space-y-1.5">
              <p className="text-slate-700 font-semibold">{L.offConfirm}</p>
              <div className="flex gap-2">
                <button onClick={disconnect} disabled={busy}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold flex items-center gap-1 disabled:opacity-60">
                  {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{L.yes}
                </button>
                <button onClick={() => setConfirmOff(false)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold">{L.cancel}</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setNewName(own.name || ''); setEditing(true); }}
                className="px-3 py-1.5 rounded-lg bg-white border border-violet-100 text-violet-700 font-bold flex items-center gap-1">
                <Pencil className="w-3.5 h-3.5" />{L.rename}
              </button>
              <button onClick={() => setConfirmOff(true)}
                className="px-3 py-1.5 rounded-lg bg-white border border-rose-100 text-rose-700 font-bold">{L.off}</button>
            </div>
          )}
        </>
      )}

      {error && (
        <p className="text-rose-600 flex items-start gap-1"><AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />{error}</p>
      )}
    </div>
  );
};

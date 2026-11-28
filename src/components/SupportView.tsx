import { isUz } from '../context/LanguageContext';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, LifeBuoy, Loader2, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, SupportThread } from '../lib/api';

// FindLead qo'llab-quvvatlashi (services/support_desk.py) — saytdagi cabinet/Support.tsx bilan bir xil.
export const SupportView: React.FC<{ onBack: () => void; storeContext?: { businessId?: string } }> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();
  const k = language === 'kk';
  const bid = storeContext?.businessId;
  const [th, setTh] = useState<SupportThread | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const load = () => { if (bid) api.supportThread(bid).then(setTh).catch(() => setTh((x) => x || { messages: [], unread: 0 })); };
  useEffect(() => {
    load();
    const id = window.setInterval(load, 15000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bid]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [th?.messages.length]);
  const when = (iso?: string) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString(k ? 'kk-KZ' : 'ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };
  const send = async () => {
    const v = text.trim();
    if (!v || !bid) return;
    setBusy(true);
    setErr('');
    try {
      await api.supportSend(bid, v);
      setText('');
      load();
    } catch {
      setErr((isUz() ? "Yuborib bo'lmadi. Qaytadan urinib ko'ring." : k ? 'Жіберілмеді. Қайталап көріңіз.' : 'Не удалось отправить. Попробуйте ещё раз.'));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] font-sans text-slate-900 w-full">
      <div className="bg-white border-b border-slate-200/80 px-3 py-2.5 shrink-0 flex items-center gap-2">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="text-sm font-black flex items-center gap-1.5"><LifeBuoy className="w-4 h-4 text-purple-600" />{(isUz() ? "Yordam" : k ? 'Қолдау' : 'Поддержка')}</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <p className="text-[11px] text-slate-500 text-center">{(isUz() ? "FindLead jamoasiga yozing — shu yerda va Telegramda javob beramiz." : k ? 'FindLead командасына жазыңыз — осында және Telegram-да жауап береміз.' : 'Напишите команде FindLead — ответим здесь и в Telegram.')}</p>
        {!th && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-purple-600 animate-spin" /></div>}
        {th?.messages.map((m) => (
          <div key={m.id || m.at} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed whitespace-pre-line ${m.from === 'me' ? 'bg-slate-800 text-white' : 'bg-purple-50 border border-purple-100'}`}>
              {m.from !== 'me' && <p className="text-[10px] font-bold text-purple-700 mb-0.5">FindLead</p>}
              {m.text}
              <p className={`text-[9.5px] mt-0.5 ${m.from === 'me' ? 'text-white/50' : 'text-slate-400'}`}>{when(m.at)}</p>
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="bg-white border-t border-slate-200 p-2.5 shrink-0">
        {err && <p className="text-[11px] text-rose-600 mb-1.5">{err}</p>}
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            placeholder={(isUz() ? "FindLead jamoasiga xabar…" : k ? 'FindLead командасына хабар…' : 'Сообщение для команды FindLead…')}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-[12.5px] outline-none focus:border-purple-400" />
          <button onClick={send} disabled={busy || !text.trim()} className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

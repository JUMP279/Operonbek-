import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, ChevronDown, Download, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { useLanguage } from '../context/LanguageContext';
import { api, GrowthChecklist } from '../lib/api';

// "Рост подписчиков" (2026-11-14) — saytdagi bilan bir manba: GET /growth/{id} (services/growth_playbook.py).
export const GrowthView: React.FC<{ onBack?: () => void; storeContext?: { businessId?: string } }> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();
  const ru = language !== 'kk';
  const businessId = storeContext?.businessId;
  const [data, setData] = useState<GrowthChecklist | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) return;
    api.growth(businessId, ru ? 'ru' : 'kk').then(setData).catch(() => setError(ru ? 'Не удалось загрузить.' : 'Жүктелмеді.'));
  }, [businessId, ru]);

  useEffect(() => {
    if (data?.channel_url) QRCode.toDataURL(data.channel_url, { width: 640, margin: 2 }).then(setQr).catch(() => setQr(null));
  }, [data?.channel_url]);

  const toggle = async (id: string, done: boolean) => {
    if (!data || !businessId) return;
    setData({ ...data, items: data.items.map((i) => (i.id === id ? { ...i, done } : i)), done: data.done + (done ? 1 : -1) });
    try {
      await api.setGrowthDone(businessId, id, done);
    } catch {
      /* ignore */
    }
  };

  const groups: { id: string; t: string }[] = [
    { id: 'base', t: ru ? 'Основа' : 'Негіз' }, { id: 'instagram', t: 'Instagram' },
    { id: 'telegram', t: 'Telegram' }, { id: 'growth', t: ru ? 'Ускорение' : 'Жеделдету' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-800" /></button>
        <h2 className="text-[16px] font-bold text-slate-900">{ru ? 'Рост подписчиков' : 'Жазылушы өсуі'}</h2>
        <span className="w-8" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 no-scrollbar">
        {error && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>}
        {!data && !error && <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div>}
        {data && (
          <>
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white">
              <div className="flex items-center justify-between text-[12px] text-white/60"><span>{ru ? 'Выполнено' : 'Орындалды'}</span><b className="text-white text-[15px]">{data.done}/{data.total}</b></div>
              <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${(data.done / Math.max(1, data.total)) * 100}%` }} /></div>
              <p className="mt-2 text-[11px] text-white/60 leading-snug">{ru ? 'План на основе 11 видео и подкастов о продвижении. Operon уже пишет контент по этим правилам.' : 'Жылжыту туралы 11 видео мен подкаст негізіндегі жоспар. Operon контентті осы ережелермен жазады.'}</p>
            </div>
            {groups.map((g) => {
              const items = data.items.filter((i) => i.group === g.id);
              if (!items.length) return null;
              return (
                <div key={g.id} className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1">
                  <div className="text-[12px] font-black text-slate-900 px-1">{g.t}</div>
                  {items.map((i) => (
                    <div key={i.id} className="py-2 border-t border-slate-100 first:border-t-0">
                      <div className="flex items-start gap-2.5">
                        <button onClick={() => i.kind === 'manual' && toggle(i.id, !i.done)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${i.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'}`}>
                          {i.done && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setOpen(open === i.id ? null : i.id)} className="flex-1 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[12.5px] font-semibold ${i.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{i.title}</span>
                            {i.kind === 'auto' && <span className="text-[9px] font-bold text-slate-400 bg-slate-100 rounded px-1">AUTO</span>}
                            <ChevronDown className={`w-3.5 h-3.5 ml-auto text-slate-400 ${open === i.id ? 'rotate-180' : ''}`} />
                          </div>
                          {open === i.id && <p className="mt-1.5 text-[11.5px] text-slate-600 leading-relaxed">{i.how}</p>}
                        </button>
                      </div>
                      {open === i.id && i.id === 'offline_qr' && data.channel_url && qr && (
                        <div className="mt-2 ml-7 flex items-center gap-3">
                          <img src={qr} alt="QR" className="w-24 h-24 rounded-lg border border-slate-200" />
                          <a href={qr} download="telegram-qr.png" className="text-[11.5px] font-bold text-blue-600 flex items-center gap-1"><Download className="w-3.5 h-3.5" />{ru ? 'Скачать QR' : 'QR жүктеу'}</a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 space-y-1.5">
              <div className="text-[12px] font-black text-rose-700 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" />{ru ? 'Чего не делать' : 'Не істемеу керек'}</div>
              {data.warnings.map((w, i) => <p key={i} className="text-[11px] text-slate-700 leading-snug">✕ {w}</p>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

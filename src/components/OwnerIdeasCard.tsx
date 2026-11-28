import { isUz } from '../context/LanguageContext';
import React, { useEffect, useState } from 'react';
import { Check, Lightbulb, Loader2, Plus, Wand2, X } from 'lucide-react';
import { api, ApiError, OwnerIdea } from '../lib/api';
import { formatDay } from '../lib/format';

// "Мои идеи" (2026-11-14): tadbirkor o'z g'oyasini yozadi — rejadagi keyingi video/post shu bo'yicha
// tayyorlanadi; "Сейчас" — eng yaqin tayyorlanmagan slotga darhol qo'llash. Backend: /ideas (services/owner_ideas.py)
export const OwnerIdeasCard: React.FC<{ businessId: string; kind: 'video' | 'post'; lang: 'uz' | 'ru' | 'kk'; onApplied?: () => void }> = ({ businessId, kind, lang, onApplied }) => {
  const ru = lang !== 'kk';
  const [ideas, setIdeas] = useState<OwnerIdea[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState<string>('');
  const [msg, setMsg] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.ownerIdeas(businessId, kind).then((r) => setIdeas(r.ideas)).catch(() => {});
  }, [businessId, kind]);

  const pending = ideas.filter((i) => i.status === 'new');
  const used = ideas.filter((i) => i.status === 'used').slice(0, 5);
  const what = kind === 'video' ? ((isUz() ? "video" : ru ? 'видео' : 'видео')) : ((isUz() ? "post" : ru ? 'пост' : 'пост'));

  const add = async () => {
    const v = text.trim();
    if (v.length < 3) return;
    setBusy('add');
    setMsg('');
    try {
      setIdeas((await api.addOwnerIdea(businessId, kind, v)).ideas);
      setText('');
      setMsg((isUz() ? `G'oya qo'shildi — keyingi ${what}ni FindLead shu g'oya asosida tayyorlaydi.` : ru ? `Идея добавлена — следующее ${what} FindLead сделает по ней.` : `Идея қосылды — FindLead келесі ${what}ты соған сай жасайды.`));
    } catch (e) {
      setMsg(e instanceof ApiError && e.message === 'too_many' ? ((isUz() ? "Navbatda juda ko'p g'oyalar bor." : ru ? 'Слишком много идей в очереди.' : 'Кезекте идея тым көп.')) : ((isUz() ? "Saqlab bo'lmadi." : ru ? 'Не удалось сохранить.' : 'Сақталмады.')));
    } finally {
      setBusy('');
    }
  };

  const remove = async (id: string) => {
    setBusy(id);
    try {
      await api.deleteOwnerIdea(businessId, id);
      setIdeas((x) => x.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    } finally {
      setBusy('');
    }
  };

  const apply = async (id: string) => {
    setBusy(id);
    setMsg('');
    try {
      const r = await api.applyOwnerIdea(businessId, id);
      setIdeas(r.ideas);
      setMsg((isUz() ? `Tayyor: ${what} ${formatDay(r.scheduled_at, lang)} uchun sizning g'oyangiz bo'yicha qayta yozildi.` : ru ? `Готово: ${what} на ${formatDay(r.scheduled_at, lang)} переписан по вашей идее.` : `Дайын: ${formatDay(r.scheduled_at, lang)} күнгі ${what} идеяңызға сай қайта жазылды.`));
      onApplied?.();
    } catch (e) {
      const m = e instanceof ApiError ? e.message : '';
      setMsg(m === 'no_slot' ? ((isUz() ? "Rejada bo'sh slot yo'q — g'oya navbatda qoladi." : ru ? 'Нет свободного слота в плане — идея останется в очереди.' : 'Жоспарда бос орын жоқ — идея кезекте қалады.'))
        : e instanceof ApiError && e.status === 402 ? ((isUz() ? "Tarif muddati tugadi." : ru ? 'Срок тарифа истёк.' : 'Тариф мерзімі бітті.'))
        : ((isUz() ? "AI ulgurmadi — qayta urinib ko'ring." : ru ? 'AI не успел — попробуйте ещё раз.' : 'AI үлгермеді — қайталап көріңіз.')));
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 space-y-2.5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 text-left">
        <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0"><Lightbulb className="w-4 h-4" /></span>
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-black text-slate-900">{(isUz() ? "Mening g'oyalarim" : ru ? 'Мои идеи' : 'Менің идеяларым')}{pending.length ? ` · ${pending.length}` : ''}</span>
          <span className="block text-[11px] text-slate-600 leading-snug">
            {(isUz() ? `${kind === 'video' ? 'Video' : 'Post'} uchun g'oyangiz bormi? Yozing — FindLead shunga ko'ra tayyorlaydi.` : ru ? `Есть идея для ${kind === 'video' ? 'видео' : 'поста'}? Напишите — FindLead сделает по ней.` : `${kind === 'video' ? 'Видеоға' : 'Постқа'} идеяңыз бар ма? Жазыңыз — FindLead соған сай жасайды.`)}
          </span>
        </span>
        <Plus className={`w-4 h-4 text-amber-700 transition-transform ${open ? 'rotate-45' : ''}`} />
      </button>

      {open && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder={kind === 'video'
              ? ((isUz() ? "Masalan: sviter jinsi shim va yubka bilan qanday mos kelishini ko'rsating" : ru ? 'Например: покажите, как свитер сочетается с джинсами и юбкой' : 'Мысалы: свитердің джинсы мен юбкамен қалай үйлесетінін көрсетіңіз'))
              : ((isUz() ? "Masalan: shu hafta oxirida −15% chegirma haqida post" : ru ? 'Например: пост о скидке −15% в эти выходные' : 'Мысалы: осы демалыстағы −15% жеңілдік туралы пост'))}
            className="w-full p-3 bg-white border border-amber-200 rounded-xl text-[13px] outline-none focus:border-amber-500 resize-none"
          />
          <button onClick={add} disabled={busy === 'add' || text.trim().length < 3}
            className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-[13px] font-bold disabled:opacity-40 flex items-center justify-center gap-1.5">
            {busy === 'add' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {(isUz() ? "G'oya qo'shish" : ru ? 'Добавить идею' : 'Идея қосу')}
          </button>
        </>
      )}

      {msg && <p className="text-[11.5px] text-amber-900 bg-white/70 rounded-xl px-3 py-2">{msg}</p>}

      {pending.length > 0 && (
        <div className="space-y-1.5">
          {pending.map((i, n) => (
            <div key={i.id} className="bg-white rounded-xl p-2.5 flex items-start gap-2 border border-amber-100">
              <span className="text-[10px] font-black text-amber-600 mt-0.5 shrink-0">#{n + 1}</span>
              <p className="flex-1 text-[12px] text-slate-800 leading-snug whitespace-pre-wrap">{i.text}</p>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => apply(i.id)} disabled={!!busy} title={(isUz() ? "Hozir qilish" : ru ? 'Сделать сейчас' : 'Қазір жасау')}
                  className="text-[10.5px] font-bold text-amber-700 flex items-center gap-1 disabled:opacity-40">
                  {busy === i.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}{(isUz() ? "Hozir" : ru ? 'Сейчас' : 'Қазір')}
                </button>
                <button onClick={() => remove(i.id)} disabled={!!busy} className="text-slate-300 hover:text-rose-600 self-end"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
          <p className="text-[10.5px] text-slate-500 px-1">{(isUz() ? `G'oyalar navbat bilan olinadi: №1 — keyingi ${what}da.` : ru ? `Идеи берутся по очереди: №1 — в следующее ${what}.` : `Идеялар кезекпен алынады: №1 — келесі ${what}қа.`)}</p>
        </div>
      )}

      {used.length > 0 && (
        <div className="space-y-1">
          {used.map((i) => (
            <div key={i.id} className="flex items-start gap-1.5 text-[11px] text-slate-500 px-1">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="line-clamp-1 flex-1">{i.text}</span>
              {i.scheduled_at && <span className="shrink-0">{formatDay(i.scheduled_at, lang)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

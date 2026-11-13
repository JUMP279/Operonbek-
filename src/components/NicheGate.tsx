import React, { useState } from 'react';
import { Compass, Loader2 } from 'lucide-react';
import { api, BrandStatus } from '../lib/api';

// Mahsulot qo'shilmagan va yo'nalish hali aytilmagan bo'lsa — post/video'dan oldin bir marta so'raladi.
const NICHES = {
  ru: ['Одежда', 'Обувь', 'Мебель', 'Косметика', 'Продукты питания', 'Электроника', 'Детские товары', 'Цветы', 'Аксессуары', 'Услуги'],
  kk: ['Киім', 'Аяқ киім', 'Жиһаз', 'Косметика', 'Азық-түлік', 'Электроника', 'Балалар тауарлары', 'Гүлдер', 'Аксессуарлар', 'Қызметтер'],
};

const T = {
  ru: {
    title: 'В каком направлении готовить контент?',
    hint: 'Товары ещё не добавлены — AI будет продвигать название вашего магазина в этом направлении. Посты, видео и картинки будут по этой теме.',
    other: 'Другое направление', save: 'Продолжить', error: 'Не удалось сохранить. Попробуйте ещё раз.',
  },
  kk: {
    title: 'Контентті қай бағытта дайындайық?',
    hint: 'Тауарлар әлі қосылмаған — AI дүкеніңіздің атауын осы бағытта дамытады. Посттар, бейнелер мен суреттер осы тақырыпта болады.',
    other: 'Басқа бағыт', save: 'Жалғастыру', error: 'Сақталмады. Қайталап көріңіз.',
  },
};

export const NicheGate: React.FC<{ businessId: string; lang: 'ru' | 'kk'; onDone: (s: BrandStatus) => void }> = ({
  businessId, lang, onDone,
}) => {
  const L = T[lang];
  const [pick, setPick] = useState('');
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const value = (custom.trim() || pick).trim();

  const save = async () => {
    if (value.length < 2) return;
    setSaving(true);
    setError('');
    try {
      onDone(await api.setNiche(businessId, value));
    } catch {
      setError(L.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-purple-200 rounded-2xl p-3.5 space-y-3">
      <div>
        <h2 className="text-sm font-black flex items-center gap-1.5"><Compass className="w-4 h-4 text-purple-600" />{L.title}</h2>
        <p className="text-[11px] text-slate-500 mt-1">{L.hint}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {NICHES[lang].map((n) => (
          <button key={n} onClick={() => { setPick(n); setCustom(''); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border active:scale-95 ${
              pick === n && !custom ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-200'}`}>
            {n}
          </button>
        ))}
      </div>
      <input value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={80} placeholder={L.other}
        className="w-full rounded-xl border border-slate-200 p-2.5 text-[12.5px] outline-none focus:border-purple-400" />
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
      <button onClick={save} disabled={saving || value.length < 2}
        className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-50">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}{L.save}
      </button>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';

// Profil: biznes logotipi. Yuklangan logotip har post rasmining burchagida chiqadi.
const T = {
  ru: {
    title: 'Логотип', hint: 'Логотип появится на картинках ваших постов.', add: 'Загрузить логотип',
    change: 'Заменить', remove: 'Удалить', error: 'Не удалось загрузить (PNG, JPG или WEBP, до 5 МБ)',
  },
  kk: {
    title: 'Логотип', hint: 'Логотип посттарыңыздың суреттерінде көрінеді.', add: 'Логотип жүктеу',
    change: 'Ауыстыру', remove: 'Жою', error: 'Жүктелмеді (PNG, JPG немесе WEBP, 5 МБ дейін)',
  },
};

export const LogoCard: React.FC<{ businessId?: string }> = ({ businessId }) => {
  const { language } = useLanguage();
  const L = T[language === 'ru' ? 'ru' : 'kk'];
  const [logo, setLogo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!businessId) return;
    api.brand(businessId).then((b) => setLogo(b.logo_url)).catch(() => {});
  }, [businessId]);

  if (!businessId) return null;

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true);
    setError('');
    try {
      setLogo((await api.uploadLogo(businessId, f)).logo_url);
    } catch {
      setError(L.error);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      setLogo((await api.deleteLogo(businessId)).logo_url);
    } catch {
      setError(L.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex items-center gap-3">
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onFile} />
      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
        {busy ? <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
          : logo ? <img src={logo} alt="" className="w-full h-full object-contain" />
          : <ImagePlus className="w-5 h-5 text-slate-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-black">{L.title}</p>
        <p className="text-[11px] text-slate-500">{error || L.hint}</p>
        <div className="flex gap-3 mt-1">
          <button onClick={() => fileRef.current?.click()} disabled={busy} className="text-[11.5px] font-bold text-purple-700">
            {logo ? L.change : L.add}
          </button>
          {logo && (
            <button onClick={remove} disabled={busy} className="text-[11.5px] font-bold text-rose-600 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" />{L.remove}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

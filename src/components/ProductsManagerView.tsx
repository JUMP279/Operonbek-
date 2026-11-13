import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ImagePlus,
  Loader2,
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, ApiError, Product } from '../lib/api';
import { formatMoney } from '../lib/format';

export interface ProductsManagerViewProps {
  onBack: () => void;
  storeContext?: { businessId?: string; currency?: string };
}

const T = {
  ru: {
    back: 'Назад', title: 'Товары', add: 'Добавить товар', empty: 'Товаров пока нет',
    emptyHint: 'Пока товаров нет, AI продвигает ваш бренд — название магазина и направление.',
    name: 'Название *', price: 'Цена', desc: 'Описание', descPh: 'Коротко о товаре — AI использует это в постах и видео.',
    stock: 'Остаток', photo: 'Фото товара', photoAdd: 'Загрузить фото', photoHint: 'Своё фото делает рекламу убедительнее.',
    active: 'В продаже', inactive: 'Скрыт',
    save: 'Сохранить', cancel: 'Отмена', edit: 'Изменить', del: 'Удалить', delConfirm: 'Удалить товар?',
    newTitle: 'Новый товар', editTitle: 'Изменить товар', noPrice: 'Цена не указана',
    errors: { network: 'Нет связи с сервером', generic: 'Что-то пошло не так. Попробуйте ещё раз.', name: 'Укажите название', image: 'Не удалось загрузить фото (JPG, PNG, WEBP, до 8 МБ)' },
  },
  kk: {
    back: 'Артқа', title: 'Тауарлар', add: 'Тауар қосу', empty: 'Әзірге тауар жоқ',
    emptyHint: 'Тауар жоқ кезде AI брендіңізді — дүкен атауын және бағытын дамытады.',
    name: 'Атауы *', price: 'Бағасы', desc: 'Сипаттама', descPh: 'Тауар туралы қысқаша — AI мұны посттар мен бейнелерде қолданады.',
    stock: 'Қалдық', photo: 'Тауар суреті', photoAdd: 'Сурет жүктеу', photoHint: 'Өз суретіңіз жарнаманы сенімдірек етеді.',
    active: 'Сатылымда', inactive: 'Жасырын',
    save: 'Сақтау', cancel: 'Бас тарту', edit: 'Өзгерту', del: 'Жою', delConfirm: 'Тауарды жою керек пе?',
    newTitle: 'Жаңа тауар', editTitle: 'Тауарды өзгерту', noPrice: 'Бағасы көрсетілмеген',
    errors: { network: 'Сервермен байланыс жоқ', generic: 'Бірдеңе дұрыс болмады. Қайталап көріңіз.', name: 'Атауын жазыңыз', image: 'Сурет жүктелмеді (JPG, PNG, WEBP, 8 МБ дейін)' },
  },
};

interface Form {
  id: string | null;
  name: string;
  price: string;
  description: string;
  stock: string;
  image_url: string;
  is_active: boolean;
}

const EMPTY: Form = { id: null, name: '', price: '', description: '', stock: '', image_url: '', is_active: true };

export const ProductsManagerView: React.FC<ProductsManagerViewProps> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();
  const lang: 'ru' | 'kk' = language === 'ru' ? 'ru' : 'kk';
  const L = T[lang];
  const businessId = storeContext?.businessId;
  const currency = storeContext?.currency || 'KZT';

  const [items, setItems] = useState<Product[] | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const errText = (e: unknown) => (e instanceof ApiError && e.status === 0 ? L.errors.network : L.errors.generic);

  const load = async () => {
    if (!businessId) return;
    try {
      setItems((await api.products(businessId)).products);
    } catch (e) {
      setError(errText(e));
      setItems([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const openEdit = (p: Product) =>
    setForm({
      id: p.id, name: p.name, price: p.price != null ? String(p.price) : '', description: p.description || '',
      stock: p.stock != null ? String(p.stock) : '', image_url: p.image_url || '', is_active: p.is_active,
    });

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !businessId || !form) return;
    setUploading(true);
    setError('');
    try {
      const { image_url } = await api.uploadProductImage(businessId, f);
      setForm((x) => (x ? { ...x, image_url } : x));
    } catch {
      setError(L.errors.image);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form || !businessId) return;
    if (!form.name.trim()) {
      setError(L.errors.name);
      return;
    }
    setSaving(true);
    setError('');
    const body = {
      name: form.name.trim(),
      price: form.price.trim() || null,
      description: form.description.trim() || null,
      image_url: form.image_url || null,
      stock: Math.max(0, parseInt(form.stock, 10) || 0),
      is_active: form.is_active,
    };
    try {
      if (form.id) await api.updateProduct(form.id, body);
      else await api.createProduct(businessId, body);
      setForm(null);
      await load();
    } catch (e) {
      setError(errText(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setConfirmDel(null);
    try {
      await api.deleteProduct(id);
      setItems((xs) => (xs || []).filter((x) => x.id !== id));
    } catch (e) {
      setError(errText(e));
    }
  };

  const input = 'w-full rounded-xl border border-slate-200 p-2.5 text-[12.5px] outline-none focus:border-purple-400';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-x-hidden font-sans text-slate-900 w-full max-w-full">
      <div className="bg-white border-b border-slate-200/80 px-3 py-2.5 shrink-0 w-full flex items-center gap-2">
        <button onClick={form ? () => setForm(null) : onBack} title={L.back}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 active:scale-95">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5 truncate">
          <Package className="w-4 h-4 text-purple-600 shrink-0" />
          <span>{form ? (form.id ? L.editTitle : L.newTitle) : L.title}</span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 w-full space-y-3 pb-16">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-3.5 py-2.5 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span className="flex-1">{error}</span>
            <button onClick={() => setError('')}><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {!form && (
          <>
            <button onClick={() => setForm({ ...EMPTY })} disabled={!businessId}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-[13px] font-bold flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60">
              <Plus className="w-4 h-4" />{L.add}
            </button>

            {items === null && (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-purple-600 animate-spin" /></div>
            )}
            {items && items.length === 0 && (
              <div className="text-center py-8 space-y-1.5">
                <p className="text-sm font-bold text-slate-700">{L.empty}</p>
                <p className="text-[11.5px] text-slate-500 px-4">{L.emptyHint}</p>
              </div>
            )}
            {items && items.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200/90 rounded-2xl p-3 flex gap-3">
                {p.image_url ? (
                  <img src={p.image_url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-bold leading-snug truncate">{p.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.is_active ? L.active : L.inactive}
                    </span>
                  </div>
                  <p className="text-[12px] font-semibold text-purple-700">
                    {p.price != null ? formatMoney(p.price, currency, lang) : L.noPrice}
                  </p>
                  {p.description && <p className="text-[11px] text-slate-500 line-clamp-2">{p.description}</p>}
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => openEdit(p)} className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                      <Pencil className="w-3.5 h-3.5" />{L.edit}
                    </button>
                    {confirmDel === p.id ? (
                      <button onClick={() => remove(p.id)} className="text-[11px] font-bold text-rose-600">{L.delConfirm}</button>
                    ) : (
                      <button onClick={() => setConfirmDel(p.id)} className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" />{L.del}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {form && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500">{L.name}</p>
              <input value={form.name} maxLength={200} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
            </div>
            <div className="flex gap-2">
              <div className="space-y-1 flex-1">
                <p className="text-[11px] font-bold text-slate-500">{L.price} ({currency === 'KZT' ? '₸' : currency})</p>
                <input value={form.price} inputMode="numeric" onChange={(e) => setForm({ ...form, price: e.target.value })} className={input} />
              </div>
              <div className="space-y-1 w-28">
                <p className="text-[11px] font-bold text-slate-500">{L.stock}</p>
                <input value={form.stock} inputMode="numeric" onChange={(e) => setForm({ ...form, stock: e.target.value })} className={input} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500">{L.photo}</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              {form.image_url ? (
                <div className="relative w-28">
                  <img src={form.image_url} alt="" className="w-28 h-28 rounded-xl object-cover" />
                  <button onClick={() => setForm({ ...form, image_url: '' })}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-[12px] font-bold text-slate-600 flex items-center justify-center gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}{L.photoAdd}
                </button>
              )}
              <p className="text-[10.5px] text-slate-400">{L.photoHint}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500">{L.desc}</p>
              <textarea value={form.description} rows={3} maxLength={2000} placeholder={L.descPh}
                onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${input} resize-none`} />
            </div>
            <label className="flex items-center gap-2 text-[12px] font-semibold">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              {L.active}
            </label>
            <div className="flex gap-2">
              <button onClick={() => setForm(null)}
                className="flex-1 py-2.5 rounded-xl text-[12px] font-bold bg-slate-100 text-slate-700">{L.cancel}</button>
              <button onClick={save} disabled={saving || uploading}
                className="flex-1 py-2.5 rounded-xl text-[12px] font-bold bg-purple-600 text-white flex items-center justify-center gap-1.5 disabled:opacity-60">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}{L.save}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Megaphone,
  CheckCircle2,
  Package,
  Boxes,
  DollarSign,
  X,
  Upload,
  Sparkles,
  Camera,
  Check,
  Tag
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  colors: string[];
  image?: string;
  status: 'Aktiv' | 'Nofaol';
  isPromoting?: boolean;
}

export interface ProductsManagerViewProps {
  onBack: () => void;
  storeContext?: any;
}

const PRESET_COLORS = [
  'Qora',
  'Oq',
  'Kulrang',
  'Qizil',
  'Ko\'k',
  'Yashil',
  'Sariq',
  'Jigarrang',
  'Pushti',
  'Bej'
];

const PRESET_CATEGORIES = [
  'Kiyim-kechak',
  'O\'yinchoqlar',
  'Aksessuarlar',
  'Elektronika',
  'Poyabzal',
  'Kosmetika va Parfyum'
];

export const ProductsManagerView: React.FC<ProductsManagerViewProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Products state
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: 'p-1005',
      code: '#1005',
      name: 'Qo\'g\'irchoq',
      category: 'Kiyim-kechak',
      description: 'Qizlar uchun chiroyli qo\'g\'irchoqlarimiz bor',
      price: 70000,
      stock: 45,
      colors: ['Qora', 'Oq'],
      image: 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=600&auto=format&fit=crop&q=80',
      status: 'Aktiv',
      isPromoting: false
    },
    {
      id: 'p-1004',
      code: '#1004',
      name: 'Labubu',
      category: 'Kiyim-kechak',
      description: 'Maxsulotimiz sifatli va kafolatlangan',
      price: 20000,
      stock: 9,
      colors: ['Qora', 'Oq', 'Kulrang'],
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80',
      status: 'Aktiv',
      isPromoting: true
    }
  ]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState('Barchasi');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Barchasi');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formCategory, setFormCategory] = useState('Kiyim-kechak');
  const [formDescription, setFormDescription] = useState('');
  const [formColors, setFormColors] = useState<string[]>([]);
  const [customColorInput, setCustomColorInput] = useState('');
  const [formImage, setFormImage] = useState<string>('');

  // Open modal for new product
  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setFormName('');
    setFormPrice('');
    setFormStock('10');
    setFormCategory('Kiyim-kechak');
    setFormDescription('');
    setFormColors([]);
    setCustomColorInput('');
    setFormImage('');
    setIsModalOpen(true);
  };

  // Open modal for edit product
  const handleOpenEditModal = (product: ProductItem) => {
    setEditingProductId(product.id);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormStock(product.stock.toString());
    setFormCategory(product.category);
    setFormDescription(product.description);
    setFormColors([...product.colors]);
    setCustomColorInput('');
    setFormImage(product.image || '');
    setIsModalOpen(true);
  };

  // Toggle Color Chip
  const handleToggleColor = (color: string) => {
    if (formColors.includes(color)) {
      setFormColors(formColors.filter((c) => c !== color));
    } else {
      setFormColors([...formColors, color]);
    }
  };

  // Add Custom Color
  const handleAddCustomColor = () => {
    if (customColorInput.trim() && !formColors.includes(customColorInput.trim())) {
      setFormColors([...formColors, customColorInput.trim()]);
      setCustomColorInput('');
    }
  };

  // Image Upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const parsedPrice = parseInt(formPrice.replace(/\D/g, ''), 10) || 0;
    const parsedStock = parseInt(formStock.replace(/\D/g, ''), 10) || 0;

    if (editingProductId) {
      // Edit existing
      setProducts(
        products.map((p) =>
          p.id === editingProductId
            ? {
                ...p,
                name: formName.trim(),
                category: formCategory,
                description: formDescription.trim(),
                price: parsedPrice,
                stock: parsedStock,
                colors: formColors.length > 0 ? formColors : ['Standart'],
                image: formImage || p.image
              }
            : p
        )
      );
    } else {
      // Create new
      const newId = 'p-' + (1000 + products.length + 1);
      const newProduct: ProductItem = {
        id: newId,
        code: '#' + (1000 + products.length + 1),
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim() || 'Sifatli va qulay mahsulot',
        price: parsedPrice,
        stock: parsedStock,
        colors: formColors.length > 0 ? formColors : ['Standart'],
        image: formImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        status: 'Aktiv',
        isPromoting: false
      };
      setProducts([newProduct, ...products]);
    }

    setIsModalOpen(false);
  };

  // Toggle Promotion
  const handleTogglePromote = (productId: string) => {
    setProducts(
      products.map((p) => (p.id === productId ? { ...p, isPromoting: !p.isPromoting } : p))
    );
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId));
  };

  // Filtered Products
  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.colors.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'Barchasi' || item.category === selectedCategory;

    let matchesPrice = true;
    if (selectedPriceFilter === '< 50k') matchesPrice = item.price < 50000;
    if (selectedPriceFilter === '50k - 150k') matchesPrice = item.price >= 50000 && item.price <= 150000;
    if (selectedPriceFilter === '> 150k') matchesPrice = item.price > 150000;

    let matchesStatus = true;
    if (selectedStatusFilter === 'Aktiv') matchesStatus = item.status === 'Aktiv';
    if (selectedStatusFilter === 'Reklamada') matchesStatus = !!item.isPromoting;

    return matchesSearch && matchesCategory && matchesPrice && matchesStatus;
  });

  // Calculate stats
  const totalModels = products.length;
  const activeModels = products.filter((p) => p.status === 'Aktiv').length;
  const totalInventoryValue = products.reduce((acc, curr) => acc + curr.price * curr.stock, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-x-hidden select-none font-sans text-slate-900 w-full max-w-full">
      {/* 1. TOP HEADER - 100% Mobile Safe */}
      <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 shrink-0 shadow-2xs w-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all shrink-0 active:scale-95 border border-slate-200"
              title={language === 'ru' ? 'Назад' : 'Артқа'}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight uppercase truncate">
                {language === 'ru' ? 'МОИ ТОВАРЫ' : 'МЕНІҢ ТАУАРЛАРЫМ'}
              </h1>
              <p className="text-[10.5px] text-slate-500 truncate">
                {language === 'ru' ? 'Каталог товаров и управление складом' : 'Тауарлар каталогы және қойманы басқару'}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ru' ? 'Добавить' : 'Қосу'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN SCROLLABLE CONTAINER */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 pb-24 w-full">
        
        {/* Quick Add Product Button (Full width banner) */}
        <button
          onClick={handleOpenAddModal}
          className="w-full py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ru' ? '+ Добавить новый товар' : '+ Жаңа тауар қосу'}</span>
        </button>

        {/* A. SEARCH AND FILTERS BAR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-2.5">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ru' ? 'Поиск по названию, цвету или описанию...' : 'Атауы, түсі немесе сипаттамасы бойынша іздеу...'}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-500 transition-all placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns - Clean vertical stack */}
          <div className="flex flex-col gap-1.5">
            {/* Category Filter */}
            <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-slate-500 font-bold shrink-0 text-[11px]">
                {language === 'ru' ? 'Категория:' : 'Санат:'}
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold outline-none w-full cursor-pointer text-right text-[11.5px] truncate"
              >
                <option value="Barchasi">{language === 'ru' ? 'Все' : 'Барлығы'}</option>
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price & Status Filters Row */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* Price Filter */}
              <div className="flex items-center justify-between gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-slate-500 font-bold shrink-0 text-[10.5px]">
                  {language === 'ru' ? 'Цена:' : 'Бағасы:'}
                </span>
                <select
                  value={selectedPriceFilter}
                  onChange={(e) => setSelectedPriceFilter(e.target.value)}
                  className="bg-transparent text-slate-800 font-semibold outline-none w-full cursor-pointer text-right text-[11px] truncate"
                >
                  <option value="Barchasi">{language === 'ru' ? 'Все' : 'Барлығы'}</option>
                  <option value="< 50k">&lt; 50k</option>
                  <option value="50k - 150k">50k-150k</option>
                  <option value="> 150k">&gt; 150k</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center justify-between gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-slate-500 font-bold shrink-0 text-[10.5px]">
                  {language === 'ru' ? 'Статус:' : 'Күйі:'}
                </span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-800 font-semibold outline-none w-full cursor-pointer text-right text-[11px] truncate"
                >
                  <option value="Barchasi">{language === 'ru' ? 'Все' : 'Барлығы'}</option>
                  <option value="Aktiv">{language === 'ru' ? 'Активен' : 'Белсенді'}</option>
                  <option value="Reklamada">{language === 'ru' ? 'В рекламе' : 'Жарнамада'}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* B. PRODUCT CARDS LIST (1-Column Stack for 100% Mobile Safety) */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              {language === 'ru' ? 'Товары не найдены' : 'Тауарлар табылмады'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {language === 'ru' ? 'По заданным критериям ничего не найдено' : 'Көрсетілген өлшемдер бойынша тауар жоқ'}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yangi mahsulot qo'shish</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5 w-full">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between transition-all hover:border-purple-300 w-full"
              >
                <div>
                  {/* Card Image Area */}
                  <div className="relative w-full h-40 bg-slate-100 overflow-hidden flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-400">
                        <ImageIcon className="w-7 h-7" />
                        <span className="text-[10px] font-medium">Rasm yo'q</span>
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-2xs border border-slate-200/60">
                        {product.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500 text-white shadow-2xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>Aktiv</span>
                      </span>
                    </div>

                    {/* Code Badge */}
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-600 text-white shadow-2xs">
                        {product.code}
                      </span>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-3 space-y-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug font-normal">
                        {product.description}
                      </p>
                    </div>

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between pt-0.5">
                      <div className="text-sm font-black text-purple-700">
                        {product.price.toLocaleString()} so'm
                      </div>
                      <div className="text-[10.5px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {product.stock} dona
                      </div>
                    </div>

                    {/* Color Chips */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {product.colors.map((c, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-3 pt-0 space-y-1.5">
                  {/* Promotion Button */}
                  <button
                    onClick={() => handleTogglePromote(product.id)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 ${
                      product.isPromoting
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>{product.isPromoting ? 'Reklama qilinmoqda ✓' : 'Reklama qil'}</span>
                  </button>

                  {/* Edit and Delete Row */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(product)}
                      className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Tahrirlash</span>
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-200 active:scale-95 shrink-0"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* C. BOTTOM STATS SUMMARY BAR (Single column list, never overlapping) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-2 mt-4">
          <div className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
            📊 Ombor Hisoboti
          </div>

          {/* Stat 1 */}
          <div className="flex items-center gap-2.5 p-2.5 bg-purple-50/70 border border-purple-100 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Boxes className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
              <div className="text-[11px] font-bold text-purple-900 leading-tight">
                Ombordagi barcha tovarlar
              </div>
              <div className="text-xs font-black text-purple-700 shrink-0">
                {totalModels} ta model
              </div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center gap-2.5 p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
              <div className="text-[11px] font-bold text-emerald-900 leading-tight">
                Xarid uchun faol assortiment
              </div>
              <div className="text-xs font-black text-emerald-700 shrink-0">
                {activeModels} ta model
              </div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex items-center gap-2.5 p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
              <div className="text-[11px] font-bold text-blue-900 leading-tight">
                Baholangan ombor qiymati
              </div>
              <div className="text-xs font-black text-blue-700 shrink-0 truncate">
                {totalInventoryValue.toLocaleString()} UZS
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. YANGI MAHSULOT QO'SHISH / TAHRIRLASH MODAL           */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-3.5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                  {editingProductId ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
                </h3>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveProduct} className="p-3.5 overflow-y-auto space-y-3.5 flex-1">
              
              {/* 1. Mahsulot nomi */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  Mahsulot nomi *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Masalan: Premium Oversize Futbolka V2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-500 font-medium"
                />
              </div>

              {/* 2. Narxi va Miqdori (2 columns) */}
              <div className="grid grid-cols-2 gap-2">
                {/* Narxi */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-800 block">
                    Narxi (so'm) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="180000"
                      className="w-full pl-2.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-500 font-medium"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">
                      UZS
                    </span>
                  </div>
                </div>

                {/* Ombordagi miqdori */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-800 block">
                    Miqdori (dona) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="10"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              {/* 3. Kategoriya */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  Kategoriya
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-500 font-medium cursor-pointer"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Mahsulot rasmi (ixtiyoriy) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Mahsulot rasmi (ixtiyoriy)
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center gap-2.5">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {formImage ? (
                      <img src={formImage} alt="Upload preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-[0.98]"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Telefondan rasm yuklash</span>
                  </button>
                </div>

                {/* AI Rasm Maslahati */}
                <div className="p-2 bg-amber-50/90 border border-amber-200/80 rounded-xl text-[10.5px] text-amber-900 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-amber-600 font-bold shrink-0">💡</span>
                  <span>
                    <strong>Maslahat:</strong> O'z rasmingizni qo'ysangiz reklama ancha ishonarli chiqadi. Rasm qo'yilmasa, AI avtomatik rasm tanlaydi.
                  </span>
                </div>
              </div>

              {/* 5. Mavjud ranglar (Chips) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Mavjud ranglar (Chips)
                </label>

                {/* Custom Color Input */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomColor();
                      }
                    }}
                    placeholder="Rang yozing..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-purple-700"
                  >
                    Qo'shish
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {PRESET_COLORS.map((col) => {
                    const isSelected = formColors.includes(col);
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => handleToggleColor(col)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {col} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Status */}
                <div className="text-[10.5px] text-slate-400">
                  {formColors.length > 0 ? (
                    <span className="text-purple-700 font-bold">
                      Tanlangan: {formColors.join(', ')}
                    </span>
                  ) : (
                    <em>Ranglar kiritilmagan</em>
                  )}
                </div>
              </div>

              {/* 6. Mahsulot tavsifi */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  Mahsulot tavsifi
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Mahsulot haqida matn qoldiring. Bu orqali AI tili va sotish taktikasi optimallashadi."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-500 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Modal Bottom Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-xs transition-all active:scale-[0.98]"
                >
                  Saqlash
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

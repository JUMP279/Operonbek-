import React from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChannel: string;
  onChangeChannel: (channel: string) => void;
  currency: string;
  onChangeCurrency: (currency: string) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  selectedChannel,
  onChangeChannel,
  currency,
  onChangeCurrency
}) => {
  const { t, language } = useLanguage();
  if (!isOpen) return null;

  const channels = [
    { id: 'All Channels', label: language === 'ru' ? 'Все каналы' : 'Барлық арналар' },
    { id: 'Online Store (Direct)', label: language === 'ru' ? 'Интернет-магазин (Direct)' : 'Интернет-дүкен (Direct)' },
    { id: 'B2B Wholesale Hub', label: language === 'ru' ? 'B2B Оптовый хаб' : 'B2B Көтерме сауда хабы' },
    { id: 'Partner Marketplaces', label: language === 'ru' ? 'Маркетплейсы партнеров' : 'Серіктес маркетплейстер' },
    { id: 'Mobile App', label: language === 'ru' ? 'Мобильное приложение' : 'Мобильді қолданба' }
  ];

  const currencies = [
    { code: 'KZT', symbol: '₸', name: language === 'ru' ? 'Казахстанский тенге (₸)' : 'Қазақстан теңгесі (₸)' },
    { code: 'RUB', symbol: '₽', name: language === 'ru' ? 'Российский рубль (₽)' : 'Ресей рублі (₽)' },
    { code: 'USD', symbol: '$', name: 'US Dollar ($)' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.filter}</h3>
              <p className="text-xs text-slate-400">Customize display metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 space-y-4">
          {/* Sales Channels */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">{t.salesChannel}</label>
            <div className="space-y-1.5">
              {channels.map((ch) => {
                const isSelected = selectedChannel === ch.id || (selectedChannel === 'All Channels' && ch.id === 'All Channels');
                return (
                  <button
                    key={ch.id}
                    onClick={() => onChangeChannel(ch.id)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-medium border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-slate-100 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{ch.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">{t.currencyLabel}</label>
            <div className="grid grid-cols-3 gap-2">
              {currencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => onChangeCurrency(c.code)}
                  className={`p-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-0.5 transition-all ${
                    currency === c.code
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{c.code}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
        >
          {t.applyFilter}
        </button>
      </div>
    </div>
  );
};

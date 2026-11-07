import React from 'react';
import { Store, Network, Package, MoreHorizontal } from 'lucide-react';
import { CustomerSegment } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CustomerBreakdownProps {
  segments: CustomerSegment[];
  onSelectSegment?: (segment: CustomerSegment) => void;
  onOpenMenu?: () => void;
}

export const CustomerBreakdown: React.FC<CustomerBreakdownProps> = ({
  segments,
  onSelectSegment,
  onOpenMenu
}) => {
  const { t } = useLanguage();

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'store':
        return <Store className="w-3.5 h-3.5 text-blue-600" strokeWidth={2.2} />;
      case 'network':
        return <Network className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.2} />;
      case 'package':
        return <Package className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.2} />;
      default:
        return <Store className="w-3.5 h-3.5 text-blue-600" strokeWidth={2.2} />;
    }
  };

  const getLocalizedSegmentName = (seg: CustomerSegment) => {
    if (seg.id === 'retailers' || seg.id === 'retailer') return t.retailer;
    if (seg.id === 'distributors' || seg.id === 'distributor') return t.distributor;
    if (seg.id === 'wholesalers' || seg.id === 'wholesaler') return t.wholesaler;
    if (seg.id === 'enterprise') return t.enterprise;
    return seg.name;
  };

  return (
    <div
      id="card-customers"
      className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-xs hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[14px] font-bold text-slate-900">{t.customerBreakdown}</span>
        <button
          id="btn-customers-menu"
          onClick={onOpenMenu}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          title="Customer Options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Segments list */}
      <div className="flex flex-col gap-3.5">
        {segments.map((seg) => (
          <div
            key={seg.id}
            id={`customer-seg-${seg.id}`}
            onClick={() => onSelectSegment?.(seg)}
            className="flex flex-col gap-1.5 cursor-pointer group"
          >
            {/* Stat Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: seg.bgColor }}
                >
                  {getIcon(seg.icon)}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {seg.count}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {seg.percentage}%
              </span>
            </div>

            <div className="text-[11.5px] text-slate-500 font-normal pl-8 -mt-1">
              {getLocalizedSegmentName(seg)}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden ml-8">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(8, seg.percentage))}%`,
                  backgroundColor: seg.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

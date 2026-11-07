import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface StatusBarProps {
  time?: string;
  isDark?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ time = '9:41', isDark = false }) => {
  return (
    <div className={`w-full px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold select-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <span className="tracking-tight text-[13px] font-medium">{time}</span>
      <div className="flex items-center gap-1.5">
        {/* Cellular bars */}
        <div className="flex items-end gap-[1.5px] h-2.5">
          <div className="w-[3px] h-1 bg-current rounded-xs opacity-90" />
          <div className="w-[3px] h-1.5 bg-current rounded-xs opacity-90" />
          <div className="w-[3px] h-2 bg-current rounded-xs opacity-90" />
          <div className="w-[3px] h-2.5 bg-current rounded-xs opacity-90" />
        </div>
        {/* Wifi */}
        <Wifi className="w-3.5 h-3.5 ml-0.5" strokeWidth={2.4} />
        {/* Battery */}
        <div className="flex items-center gap-0.5 ml-0.5">
          <div className="w-5 h-2.5 border border-current rounded-xs p-[1px] flex items-center">
            <div className="w-full h-full bg-current rounded-[1px]" />
          </div>
          <div className="w-[1.5px] h-1 bg-current rounded-r-xs opacity-70" />
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { ToolDetailView } from './ToolDetailView';
import { BottomNavBar } from './BottomNavBar';
import { ActiveTab } from '../types';

export interface ToolDemoModalProps {
  toolId: string | null;
  onClose: () => void;
  storeContext?: any;
  onChangeTab?: (tab: ActiveTab) => void;
}

export const ToolDemoModal: React.FC<ToolDemoModalProps> = ({
  toolId,
  onClose,
  storeContext,
  onChangeTab
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTab, setCurrentTab] = useState<ActiveTab>('profile');

  if (!toolId) return null;

  const handleTabClick = (tab: ActiveTab) => {
    setCurrentTab(tab);
    if (onChangeTab) {
      onChangeTab(tab);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Mobile/Tablet Adaptive Container */}
      <div
        className={`w-full bg-[#FAFBFD] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'h-full sm:h-[96vh] sm:max-w-4xl sm:rounded-3xl border border-slate-200'
            : 'h-full sm:h-[820px] sm:max-w-[410px] sm:rounded-[44px] sm:border-[5px] sm:border-slate-800'
        }`}
      >
        {/* Top Desktop Expand / Close Controls for windowed view */}
        <div className="hidden sm:flex items-center justify-between px-4 py-1.5 bg-slate-900 text-white text-[11px] font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 cursor-pointer" onClick={onClose} />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" onClick={() => setIsFullscreen(!isFullscreen)} />
            <span className="text-slate-300 ml-2">OPERON OS - Full Tool View</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition-colors"
              title={isFullscreen ? 'Свернуть' : 'Развернуть'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* The Full Screen Tool View */}
        <ToolDetailView
          toolId={toolId}
          onBack={onClose}
          storeContext={storeContext}
          showHeaderClose={true}
        />

        {/* Fixed Bottom Navigation Bar at the Bottom (with 4 icons + home indicator bar) */}
        <BottomNavBar
          activeTab={currentTab}
          onChangeTab={handleTabClick}
        />
      </div>
    </div>
  );
};

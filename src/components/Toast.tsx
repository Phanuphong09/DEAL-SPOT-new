import React from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 inset-x-4 max-w-sm mx-auto bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl z-50 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
          <span className="material-symbols-outlined text-[18px]">check</span>
        </div>
        <span className="text-[13px] font-medium leading-snug truncate">{message}</span>
      </div>
      <span className="text-[11px] font-bold text-orange-300 uppercase tracking-wider shrink-0">
        DealSpot
      </span>
    </div>
  );
};

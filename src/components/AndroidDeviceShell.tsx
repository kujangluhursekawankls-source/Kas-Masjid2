import React, { useState } from 'react';
import { Smartphone, Monitor, Sparkles } from 'lucide-react';
import { AndroidStatusBar } from './AndroidStatusBar';

interface AndroidDeviceShellProps {
  children: React.ReactNode;
}

export const AndroidDeviceShell: React.FC<AndroidDeviceShellProps> = ({ children }) => {
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(() => {
    // Default to true on larger screens if screen is wide enough
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 flex flex-col items-center justify-start sm:p-4 select-none">
      {/* Desktop Mode Switcher Bar */}
      <div className="hidden md:flex items-center justify-between w-full max-w-4xl py-2 px-4 mb-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-white">Kas Masjid • Khusus Android PWA</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setDeviceFrameMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition ${
              deviceFrameMode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulasi HP Android</span>
          </button>

          <button
            onClick={() => setDeviceFrameMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition ${
              !deviceFrameMode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Layar Penuh</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceFrameMode
            ? 'max-w-[420px] rounded-[42px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden relative bg-slate-50'
            : 'max-w-md w-full bg-slate-50 min-h-screen shadow-2xl relative'
        }`}
        style={deviceFrameMode ? { height: '880px', maxHeight: '92vh' } : {}}
      >
        {/* Android Real Status Bar */}
        <AndroidStatusBar />

        {/* Scrollable Android Screen Content */}
        <div
          className={`w-full overflow-y-auto ${
            deviceFrameMode ? 'h-[calc(100%-30px)]' : 'min-h-[calc(100vh-30px)]'
          } flex flex-col justify-between`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

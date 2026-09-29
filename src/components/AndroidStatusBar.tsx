import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Bell } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWA';

export const AndroidStatusBar: React.FC = () => {
  const [time, setTime] = useState('');
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-emerald-950 text-emerald-100 text-[11px] font-semibold px-4 pt-1.5 pb-1 flex items-center justify-between select-none tracking-tight z-50 border-b border-emerald-900/40">
      {/* Left: Clock */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-white font-mono">{time || '08:00'}</span>
        <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Center: Camera Cutout hole punch for simulator */}
      <div className="hidden sm:flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800 shadow-inner" />
      </div>

      {/* Right: Android Status Icons */}
      <div className="flex items-center gap-1.5 text-emerald-200">
        {!isOnline ? (
          <span className="text-[10px] text-amber-300 font-bold px-1 rounded bg-amber-900/60">
            Offline
          </span>
        ) : (
          <Signal className="w-3.5 h-3.5 text-emerald-300" />
        )}
        <Wifi className="w-3.5 h-3.5 text-emerald-300" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px] font-mono">100%</span>
          <Battery className="w-3.5 h-3.5 text-emerald-300" />
        </div>
      </div>
    </div>
  );
};

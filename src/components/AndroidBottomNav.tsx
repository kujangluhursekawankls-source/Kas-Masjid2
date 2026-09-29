import React, { useState } from 'react';
import {
  Home,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Grid,
  FileSpreadsheet,
  MessageCircle,
  Database,
  Settings,
  HelpCircle,
  ShieldCheck,
  FolderTree,
  X,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface AndroidBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const [showDrawer, setShowDrawer] = useState(false);

  const mainTabs = [
    { id: 'dashboard' as ActiveTab, label: 'Beranda', icon: Home },
    { id: 'buku-kas' as ActiveTab, label: 'Buku Kas', icon: BookOpen },
    { id: 'pemasukan' as ActiveTab, label: 'Masuk', icon: ArrowDownLeft, isIncome: true },
    { id: 'pengeluaran' as ActiveTab, label: 'Keluar', icon: ArrowUpRight, isExpense: true },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setActiveTab(tab);
    setShowDrawer(false);
  };

  const moreMenuItems: { id: ActiveTab; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'laporan', label: 'Laporan Keuangan', icon: FileSpreadsheet, color: 'bg-emerald-100 text-emerald-800', desc: 'Rekap PDF, Excel & Ringkasan' },
    { id: 'whatsapp', label: 'Kirim WhatsApp', icon: MessageCircle, color: 'bg-emerald-100 text-emerald-800', desc: 'Bagikan format resmi ke jamaah' },
    { id: 'master-pengurus', label: 'Pengurus & DKM', icon: ShieldCheck, color: 'bg-blue-100 text-blue-800', desc: 'Ketua, bendahara, marbot & tim' },
    { id: 'master-kategori', label: 'Kategori Kas', icon: FolderTree, color: 'bg-amber-100 text-amber-800', desc: 'Atur pos penerimaan & biaya' },
    { id: 'backup', label: 'Backup & Restore', icon: Database, color: 'bg-indigo-100 text-indigo-800', desc: 'Ekspor JSON, Excel & amankan data' },
    { id: 'pengaturan', label: 'Pengaturan Masjid', icon: Settings, color: 'bg-slate-100 text-slate-800', desc: 'Nama masjid, logo & banner' },
    { id: 'panduan', label: 'Panduan Aplikasi', icon: HelpCircle, color: 'bg-purple-100 text-purple-800', desc: 'Petunjuk lengkap & tanya jawab' },
  ];

  const isMoreActive = [
    'laporan',
    'whatsapp',
    'master-pengurus',
    'master-kategori',
    'backup',
    'pengaturan',
    'panduan',
  ].includes(activeTab);

  return (
    <>
      {/* Android Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe select-none">
        <div className="max-w-md mx-auto flex items-center justify-around px-1 pt-1.5 pb-1">
          {mainTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className="flex-1 flex flex-col items-center justify-center py-1 group transition active:scale-95"
              >
                {/* Material 3 active pill indicator */}
                <div
                  className={`w-12 h-7 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? item.isExpense
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-800'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span
                  className={`text-[10px] mt-0.5 tracking-tight font-medium ${
                    isActive
                      ? item.isExpense
                        ? 'text-rose-700 font-bold'
                        : 'text-emerald-800 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More Menu Tab */}
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              setShowDrawer(true);
            }}
            className="flex-1 flex flex-col items-center justify-center py-1 group transition active:scale-95"
          >
            <div
              className={`w-12 h-7 rounded-full flex items-center justify-center transition-all ${
                isMoreActive ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight font-medium ${
                isMoreActive ? 'text-emerald-800 font-bold' : 'text-slate-500'
              }`}
            >
              Lainnya
            </span>
          </button>
        </div>

        {/* Android Home Bar / Gesture indicator */}
        <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto my-1 pointer-events-none" />
      </nav>

      {/* Android Bottom Sheet Drawer for "Lainnya" */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs">
          <div
            className="fixed inset-0 bg-transparent"
            onClick={() => setShowDrawer(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Android Drag Handle */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto my-3 flex-shrink-0" />

            <div className="px-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-slate-900">Menu & Fitur Lengkap</h2>
                <p className="text-xs text-slate-500">Pilih modul aplikasi yang ingin dibuka</p>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                const isCurrent = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-2xl transition text-left ${
                      isCurrent
                        ? 'bg-emerald-50 border border-emerald-200 font-semibold'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1.5">
              <div className="font-medium text-slate-600">Kas Masjid Android PWA &bull; Versi 1.0.0</div>
              <div className="text-[11px] text-slate-500">
                Created by{' '}
                <a
                  href="https://wa.me/628179015181?text=Halo%20Jamhur,%20saya%20pengguna%20aplikasi%20Kas%20Masjid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
                  <span>Jamhur (08179015181)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

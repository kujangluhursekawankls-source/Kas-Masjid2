import React from 'react';
import {
  Building2,
  Download,
  WifiOff,
  Home,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Menu,
  ShieldCheck,
  FolderTree,
  FileSpreadsheet,
  MessageCircle,
  Database,
  Settings,
  HelpCircle,
  X,
} from 'lucide-react';
import { ActiveTab, PengaturanMasjid } from '../types';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWA';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pengaturan: PengaturanMasjid;
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pengaturan,
  showMobileMenu,
  setShowMobileMenu,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showIOSModal, setShowIOSModal] = React.useState(false);

  const navItems: { id: ActiveTab; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'buku-kas', label: 'Buku Kas', icon: BookOpen },
    { id: 'pemasukan', label: 'Pemasukan', icon: ArrowDownLeft },
    { id: 'pengeluaran', label: 'Pengeluaran', icon: ArrowUpRight },
    { id: 'laporan', label: 'Laporan', icon: FileSpreadsheet },
    { id: 'whatsapp', label: 'Kirim WA', icon: MessageCircle },
    { id: 'master-pengurus', label: 'Pengurus', icon: ShieldCheck },
    { id: 'master-kategori', label: 'Kategori', icon: FolderTree },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
    { id: 'panduan', label: 'Panduan', icon: HelpCircle },
  ];

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-emerald-900 text-white shadow-md border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Mosque Title */}
            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => setActiveTab('dashboard')}
            >
              {pengaturan.logoMasjid ? (
                <img
                  src={pengaturan.logoMasjid}
                  alt="Logo"
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 bg-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-800 border border-emerald-600 flex items-center justify-center text-amber-400 shadow-inner">
                  <Building2 className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg leading-tight tracking-wide text-white">
                    {pengaturan.namaMasjid || 'Kas Masjid'}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-700 text-emerald-200 border border-emerald-600">
                    PWA
                  </span>
                </div>
                <p className="text-xs text-emerald-200 truncate max-w-[200px] sm:max-w-xs">
                  {pengaturan.alamat || 'Sistem Pembukuan & Keuangan'}
                </p>
              </div>
            </div>

            {/* Right Action Icons: Online Status & PWA Install */}
            <div className="flex items-center gap-2 sm:gap-3">
              {!isOnline && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 text-xs font-medium">
                  <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                  <span className="hidden sm:inline">Mode Offline</span>
                </div>
              )}

              {/* Install PWA Button */}
              {!isInstalled && isInstallable && (
                <button
                  onClick={install}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition shadow-sm"
                  title="Install Aplikasi Kas Masjid di Android"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  <span className="hidden sm:inline">Install di HP</span>
                </button>
              )}

              {!isInstalled && isIOS && (
                <button
                  onClick={() => setShowIOSModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-medium border border-emerald-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Install iOS</span>
                </button>
              )}

              {/* Mobile Drawer Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 transition lg:hidden"
                aria-label="Buka Menu"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden lg:block bg-emerald-950/70 border-t border-emerald-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 py-1.5 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-emerald-200 hover:bg-emerald-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu Modal */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="relative w-72 max-w-full bg-slate-900 text-white flex flex-col h-full shadow-2xl z-10">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-emerald-400" />
                <span className="font-bold text-white text-base">Menu Navigasi</span>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold shadow'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span>Versi Aplikasi</span>
                <span className="font-semibold text-emerald-400">1.0.0 (PWA)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span>Status Penyimpanan</span>
                <span className="text-emerald-400">Tersimpan Lokal</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Android Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
            activeTab === 'dashboard' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('buku-kas')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
            activeTab === 'buku-kas' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>Buku Kas</span>
        </button>

        <button
          onClick={() => setActiveTab('pemasukan')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
            activeTab === 'pemasukan' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-0.5">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <span>Masuk</span>
        </button>

        <button
          onClick={() => setActiveTab('pengeluaran')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
            activeTab === 'pengeluaran' ? 'text-rose-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 mb-0.5">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <span>Keluar</span>
        </button>

        <button
          onClick={() => setShowMobileMenu(true)}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold text-slate-500 hover:text-slate-800`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>Lainnya</span>
        </button>
      </nav>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Pasang di iPhone / iPad</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              1. Buka halaman ini di browser <strong>Safari</strong>.<br />
              2. Tekan tombol <strong>Bagikan (Share)</strong> di bagian bawah layar.<br />
              3. Pilih menu <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};

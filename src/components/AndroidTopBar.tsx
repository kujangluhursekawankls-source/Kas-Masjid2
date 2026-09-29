import React, { useState } from 'react';
import {
  Building2,
  ArrowLeft,
  MoreVertical,
  Download,
  Settings,
  Database,
  HelpCircle,
  FileSpreadsheet,
  Users,
  FolderTree,
  Share2,
  MessageCircle,
  Cloud,
  User,
  LogOut,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { ActiveTab, PengaturanMasjid, UserProfile } from '../types';
import { usePWAInstall } from '../hooks/usePWA';

interface AndroidTopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pengaturan: PengaturanMasjid;
  saldo?: number;
  onOpenWhatsApp?: () => void;
  currentUserProfile?: UserProfile | null;
  currentMasjidId?: string | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const AndroidTopBar: React.FC<AndroidTopBarProps> = ({
  activeTab,
  setActiveTab,
  pengaturan,
  saldo,
  onOpenWhatsApp,
  currentUserProfile,
  currentMasjidId,
  onOpenAuth,
  onLogout,
}) => {
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return pengaturan.namaMasjid || 'Kas Masjid';
      case 'buku-kas':
        return 'Buku Kas Umum';
      case 'pemasukan':
        return 'Pemasukan Kas';
      case 'pengeluaran':
        return 'Pengeluaran Kas';
      case 'laporan':
        return 'Laporan Keuangan';
      case 'whatsapp':
        return 'Kirim Laporan WA';
      case 'master-pengurus':
        return 'Pengurus DKM';
      case 'master-kategori':
        return 'Kategori Kas';
      case 'backup':
        return 'Backup & Restore';
      case 'pengaturan':
        return 'Pengaturan Masjid';
      case 'panduan':
        return 'Panduan Aplikasi';
      default:
        return 'Kas Masjid';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-white shadow-md border-b border-emerald-800">
      <div className="px-3.5 py-2.5 flex items-center justify-between">
        {/* Left: Back Button or Mosque Avatar */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          {activeTab !== 'dashboard' ? (
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                setActiveTab('dashboard');
              }}
              className="p-1.5 -ml-1 rounded-full text-white hover:bg-emerald-800 active:scale-95 transition"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : pengaturan.logoMasjid ? (
            <img
              src={pengaturan.logoMasjid}
              alt="Logo"
              className="w-9 h-9 rounded-full object-cover border-2 border-emerald-400 bg-white flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-emerald-800 border border-emerald-700 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-base font-bold text-white tracking-tight truncate leading-tight">
              {getPageTitle()}
            </h1>
            <p className="text-[11px] text-emerald-200 truncate">
              {activeTab === 'dashboard'
                ? pengaturan.alamat || 'Sistem Pembukuan Kas Android'
                : 'Aplikasi Kas Masjid Android'}
            </p>
          </div>
        </div>

        {/* Right: Install & Overflow Menu */}
        <div className="flex items-center gap-1.5 flex-shrink-0 relative">
          {/* Cloud Sync / Account Button */}
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition active:scale-95 cursor-pointer ${
                currentUserProfile
                  ? 'bg-emerald-800/90 border-emerald-600/70 text-emerald-100 hover:bg-emerald-800'
                  : 'bg-emerald-700 border-emerald-500 text-white hover:bg-emerald-600'
              }`}
              title={currentUserProfile ? `Terhubung: ${currentUserProfile.email} (${currentMasjidId})` : 'Masuk / Daftar Akun Cloud'}
            >
              {currentUserProfile ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <Cloud className="w-3.5 h-3.5 text-emerald-200" />
                  <span className="max-w-[70px] sm:max-w-[100px] truncate text-[11px]">
                    {currentMasjidId || 'Online'}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-white" />
                  <span className="text-[11px]">Masuk</span>
                </>
              )}
            </button>
          )}

          {!isInstalled && isInstallable && (
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(15);
                install();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 active:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition"
              title="Install Aplikasi di Android"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              <span>Install</span>
            </button>
          )}

          <button
            onClick={() => setShowOverflowMenu(!showOverflowMenu)}
            className="p-2 rounded-full hover:bg-emerald-800 text-emerald-100 transition active:scale-95"
            aria-label="Menu Lainnya"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Android Overflow Menu Dropdown */}
          {showOverflowMenu && (
            <>
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setShowOverflowMenu(false)}
              />
              <div className="absolute right-0 top-11 z-50 w-60 rounded-2xl bg-white text-slate-800 shadow-2xl border border-slate-200 py-2 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                {/* Account & Multi-Masjid Header */}
                {onOpenAuth && (
                  <>
                    <button
                      onClick={() => {
                        onOpenAuth();
                        setShowOverflowMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100/70 text-left transition border-b border-emerald-100 text-emerald-900"
                    >
                      <div className="flex items-center gap-2.5">
                        <Cloud className="w-4 h-4 text-emerald-700" />
                        <div>
                          <p className="font-bold text-xs">Akun & Multi-Masjid</p>
                          <p className="text-[10px] text-emerald-700">
                            {currentUserProfile ? `Kode: ${currentMasjidId || '-'}` : 'Belum Masuk Akun Cloud'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                        {currentUserProfile ? 'Aktif' : 'Login'}
                      </span>
                    </button>
                    <div className="my-1" />
                  </>
                )}

                <button
                  onClick={() => {
                    setActiveTab('pengaturan');
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 text-left transition"
                >
                  <Settings className="w-4 h-4 text-emerald-700" />
                  <span>Pengaturan Masjid</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('master-pengurus');
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 text-left transition"
                >
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>Data Pengurus & DKM</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('master-kategori');
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 text-left transition"
                >
                  <FolderTree className="w-4 h-4 text-emerald-700" />
                  <span>Kategori Pemasukan & Biaya</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('backup');
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 text-left transition"
                >
                  <Database className="w-4 h-4 text-emerald-700" />
                  <span>Backup & Restore Data</span>
                </button>

                <button
                  onClick={() => {
                    if (onOpenWhatsApp) {
                      onOpenWhatsApp();
                    } else {
                      setActiveTab('whatsapp');
                    }
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 text-left transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                  <span>Kirim Laporan ke WhatsApp</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setActiveTab('panduan');
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 text-left transition"
                >
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span>Panduan & FAQ</span>
                </button>

                <a
                  href="https://wa.me/628179015181?text=Halo%20Jamhur,%20saya%20pengguna%20aplikasi%20Kas%20Masjid"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowOverflowMenu(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 text-left transition text-emerald-700 font-semibold"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Created by Jamhur (WA)</span>
                </a>

                {currentUserProfile && onLogout && (
                  <>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={() => {
                        onLogout();
                        setShowOverflowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 text-left transition text-rose-600 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Keluar Akun ({currentUserProfile.email})</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

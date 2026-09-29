/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  TransaksiPemasukan,
  TransaksiPengeluaran,
  Pengurus,
  KategoriPemasukan,
  KategoriPengeluaran,
  PengaturanMasjid,
} from './types';
import { dbService, DEFAULT_PENGATURAN } from './services/db';
import { useOnlineStatus, usePWAInstall } from './hooks/usePWA';
import { AndroidDeviceShell } from './components/AndroidDeviceShell';
import { AndroidTopBar } from './components/AndroidTopBar';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { AndroidFAB } from './components/AndroidFAB';
import { DashboardView } from './components/DashboardView';
import { BukuKasView } from './components/BukuKasView';
import { PemasukanView } from './components/PemasukanView';
import { PengeluaranView } from './components/PengeluaranView';
import { LaporanView } from './components/LaporanView';
import { WhatsAppView } from './components/WhatsAppView';
import { MasterPengurusView } from './components/MasterPengurusView';
import { MasterKategoriView } from './components/MasterKategoriView';
import { BackupRestoreView } from './components/BackupRestoreView';
import { PengaturanMasjidView } from './components/PengaturanMasjidView';
import { PanduanView } from './components/PanduanView';
import {
  WifiOff,
  Download,
  Building2,
  Loader2,
  MessageCircle,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Core Data States (Empty by default per prompt rules)
  const [pemasukan, setPemasukan] = useState<TransaksiPemasukan[]>([]);
  const [pengeluaran, setPengeluaran] = useState<TransaksiPengeluaran[]>([]);
  const [pengurus, setPengurus] = useState<Pengurus[]>([]);
  const [kategoriPemasukan, setKategoriPemasukan] = useState<KategoriPemasukan[]>([]);
  const [kategoriPengeluaran, setKategoriPengeluaran] = useState<KategoriPengeluaran[]>([]);
  const [pengaturan, setPengaturan] = useState<PengaturanMasjid>(DEFAULT_PENGATURAN);
  const [isLoading, setIsLoading] = useState(true);

  // Trigger modal flags for quick actions
  const [openAddPemasukan, setOpenAddPemasukan] = useState(false);
  const [openAddPengeluaran, setOpenAddPengeluaran] = useState(false);

  // WhatsApp Message Preset state (when initiated from reports)
  const [whatsAppPreset, setWhatsAppPreset] = useState<string>('');

  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Load all data from DB
  const loadAllData = useCallback(async () => {
    try {
      const [
        inData,
        outData,
        pengurusData,
        katInData,
        katOutData,
        pengaturanData,
      ] = await Promise.all([
        dbService.getPemasukan(),
        dbService.getPengeluaran(),
        dbService.getPengurus(),
        dbService.getKategoriPemasukan(),
        dbService.getKategoriPengeluaran(),
        dbService.getPengaturan(),
      ]);

      setPemasukan(inData);
      setPengeluaran(outData);
      setPengurus(pengurusData);
      setKategoriPemasukan(katInData);
      setKategoriPengeluaran(katOutData);
      setPengaturan(pengaturanData);
    } catch (e) {
      console.error('Failed to load initial data', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Data Persistence Handlers
  const handleSavePemasukan = async (items: TransaksiPemasukan[]) => {
    setPemasukan(items);
    await dbService.savePemasukan(items);
  };

  const handleSavePengeluaran = async (items: TransaksiPengeluaran[]) => {
    setPengeluaran(items);
    await dbService.savePengeluaran(items);
  };

  const handleSavePengurus = async (items: Pengurus[]) => {
    setPengurus(items);
    await dbService.savePengurus(items);
  };

  const handleSaveKategoriPemasukan = async (items: KategoriPemasukan[]) => {
    setKategoriPemasukan(items);
    await dbService.saveKategoriPemasukan(items);
  };

  const handleSaveKategoriPengeluaran = async (items: KategoriPengeluaran[]) => {
    setKategoriPengeluaran(items);
    await dbService.saveKategoriPengeluaran(items);
  };

  const handleSavePengaturan = async (data: PengaturanMasjid) => {
    setPengaturan(data);
    await dbService.savePengaturan(data);
  };

  // Quick Action navigation to add income/expense
  const triggerAddPemasukan = () => {
    setActiveTab('pemasukan');
    setOpenAddPemasukan(true);
  };

  const triggerAddPengeluaran = () => {
    setActiveTab('pengeluaran');
    setOpenAddPengeluaran(true);
  };

  const handleOpenWhatsAppFromLaporan = (text: string) => {
    setWhatsAppPreset(text);
    setActiveTab('whatsapp');
  };

  // Totals for badge calculation
  const totalIn = pemasukan.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
  const totalOut = pengeluaran.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
  const totalSaldo = totalIn - totalOut;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-700 flex items-center justify-center text-amber-400 mb-4 shadow-xl animate-pulse">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Kas Masjid Android</h1>
        <p className="text-xs text-emerald-300 mt-1 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Menyiapkan database Android lokal aman...</span>
        </p>
      </div>
    );
  }

  return (
    <AndroidDeviceShell>
      <div className="relative min-h-full flex flex-col bg-slate-50 text-slate-900 pb-20 select-none sm:select-auto">
        {/* Android Material 3 Top App Bar */}
        <AndroidTopBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pengaturan={pengaturan}
          saldo={totalSaldo}
        />

        {/* Offline Toast Banner */}
        {!isOnline && (
          <div className="bg-amber-600 text-white text-[11px] font-medium py-1 px-3 text-center flex items-center justify-center gap-1.5 shadow-xs">
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            <span>Mode Offline Android Aktif &bull; Data tersimpan aman di HP</span>
          </div>
        )}

        {/* Main Android Screen Content */}
        <main className="flex-1 w-full px-3 py-3.5 max-w-full overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              pemasukan={pemasukan}
              pengeluaran={pengeluaran}
              pengaturan={pengaturan}
              setActiveTab={setActiveTab}
              onOpenAddPemasukan={triggerAddPemasukan}
              onOpenAddPengeluaran={triggerAddPengeluaran}
            />
          )}

          {activeTab === 'buku-kas' && (
            <BukuKasView
              pemasukan={pemasukan}
              pengeluaran={pengeluaran}
              pengaturan={pengaturan}
            />
          )}

          {activeTab === 'pemasukan' && (
            <PemasukanView
              pemasukan={pemasukan}
              kategoriList={kategoriPemasukan}
              pengurusList={pengurus}
              pengaturan={pengaturan}
              onSave={handleSavePemasukan}
              isModalOpenExternal={openAddPemasukan}
              onCloseModalExternal={() => setOpenAddPemasukan(false)}
            />
          )}

          {activeTab === 'pengeluaran' && (
            <PengeluaranView
              pengeluaran={pengeluaran}
              kategoriList={kategoriPengeluaran}
              pengurusList={pengurus}
              pengaturan={pengaturan}
              onSave={handleSavePengeluaran}
              isModalOpenExternal={openAddPengeluaran}
              onCloseModalExternal={() => setOpenAddPengeluaran(false)}
            />
          )}

          {activeTab === 'laporan' && (
            <LaporanView
              pemasukan={pemasukan}
              pengeluaran={pengeluaran}
              kategoriPemasukan={kategoriPemasukan}
              kategoriPengeluaran={kategoriPengeluaran}
              pengaturan={pengaturan}
              onOpenWhatsAppModal={handleOpenWhatsAppFromLaporan}
            />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppView
              pemasukan={pemasukan}
              pengeluaran={pengeluaran}
              pengaturan={pengaturan}
              presetText={whatsAppPreset}
              onClearPreset={() => setWhatsAppPreset('')}
            />
          )}

          {activeTab === 'master-pengurus' && (
            <MasterPengurusView
              pengurus={pengurus}
              onSave={handleSavePengurus}
            />
          )}

          {activeTab === 'master-kategori' && (
            <MasterKategoriView
              kategoriPemasukan={kategoriPemasukan}
              kategoriPengeluaran={kategoriPengeluaran}
              onSavePemasukan={handleSaveKategoriPemasukan}
              onSavePengeluaran={handleSaveKategoriPengeluaran}
            />
          )}

          {activeTab === 'backup' && (
            <BackupRestoreView
              pemasukan={pemasukan}
              pengeluaran={pengeluaran}
              pengurus={pengurus}
              kategoriPemasukan={kategoriPemasukan}
              kategoriPengeluaran={kategoriPengeluaran}
              pengaturan={pengaturan}
              onRefreshAll={loadAllData}
            />
          )}

          {activeTab === 'pengaturan' && (
            <PengaturanMasjidView
              pengaturan={pengaturan}
              onSave={handleSavePengaturan}
            />
          )}

          {activeTab === 'panduan' && <PanduanView />}

          {/* Footer - Created by Jamhur */}
          <footer className="w-full text-center pt-5 pb-2 text-xs text-slate-500">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-xs">
              <span>Created by</span>
              <a
                href="https://wa.me/628179015181?text=Halo%20Jamhur,%20saya%20pengguna%20aplikasi%20Kas%20Masjid"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Jamhur</span>
                <span className="text-[10px] text-emerald-600 font-semibold">(WA: 08179015181)</span>
              </a>
            </div>
          </footer>
        </main>

        {/* Floating Action Button (Android FAB) on non-form tabs */}
        {activeTab !== 'panduan' && activeTab !== 'backup' && activeTab !== 'pengaturan' && (
          <AndroidFAB
            onOpenAddPemasukan={triggerAddPemasukan}
            onOpenAddPengeluaran={triggerAddPengeluaran}
            onOpenWhatsApp={() => setActiveTab('whatsapp')}
          />
        )}

        {/* Floating PWA Install Bar for Android */}
        {!isInstalled && isInstallable && activeTab !== 'panduan' && (
          <div className="no-print fixed bottom-20 left-3 right-3 z-30 bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700 flex items-center justify-between gap-2.5 backdrop-blur-md">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-amber-300 flex-shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold leading-tight truncate">Pasang di Layar Utama HP</div>
                <div className="text-[10px] text-slate-300 truncate">Akses cepat seperti APK Android</div>
              </div>
            </div>
            <button
              onClick={install}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap shadow-sm transition flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          </div>
        )}

        {/* Android Material 3 Bottom Navigation Bar */}
        <AndroidBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </AndroidDeviceShell>
  );
}

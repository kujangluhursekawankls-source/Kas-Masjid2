import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  HardDrive,
  Trash2,
  Lock,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  TransaksiPemasukan,
  TransaksiPengeluaran,
  Pengurus,
  KategoriPemasukan,
  KategoriPengeluaran,
  PengaturanMasjid,
  BackupData,
} from '../types';
import { dbService, formatTanggalIndo } from '../services/db';
import { exportMasterDataExcel } from '../services/exportService';

interface BackupRestoreViewProps {
  pemasukan: TransaksiPemasukan[];
  pengeluaran: TransaksiPengeluaran[];
  pengurus: Pengurus[];
  kategoriPemasukan: KategoriPemasukan[];
  kategoriPengeluaran: KategoriPengeluaran[];
  pengaturan: PengaturanMasjid;
  onRefreshAll: () => Promise<void>;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  pemasukan,
  pengeluaran,
  pengurus,
  kategoriPemasukan,
  kategoriPengeluaran,
  pengaturan,
  onRefreshAll,
}) => {
  const [lastBackupDate, setLastBackupDate] = useState<string>('-');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [safetyBackupExists, setSafetyBackupExists] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('km_last_backup_date');
    if (saved) {
      setLastBackupDate(new Date(saved).toLocaleString('id-ID'));
    }
    const safety = localStorage.getItem('km_safety_backup_before_restore');
    if (safety) {
      setSafetyBackupExists(true);
    }
  }, []);

  // Calculate approximate database size in KB/MB
  const estimatedSize = React.useMemo(() => {
    try {
      const dataStr = JSON.stringify({
        pemasukan,
        pengeluaran,
        pengurus,
        kategoriPemasukan,
        kategoriPengeluaran,
        pengaturan,
      });
      const bytes = new Blob([dataStr]).size;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } catch {
      return '~0 KB';
    }
  }, [pemasukan, pengeluaran, pengurus, kategoriPemasukan, kategoriPengeluaran, pengaturan]);

  const updateBackupTimestamp = () => {
    const now = new Date().toISOString();
    localStorage.setItem('km_last_backup_date', now);
    setLastBackupDate(new Date(now).toLocaleString('id-ID'));
  };

  // 1. Backup JSON / Database
  const handleBackupJSON = async () => {
    try {
      setIsProcessing(true);
      const data = await dbService.exportFullBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `Backup_KasMasjid_${(pengaturan.namaMasjid || 'Masjid').replace(/\s+/g, '_')}_${Date.now()}.json`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      updateBackupTimestamp();
      setStatusMessage({ type: 'success', text: `Backup JSON (${filename}) berhasil diunduh.` });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: `Gagal membuat backup JSON: ${e?.message || e}` });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Backup Excel Multi-Sheet
  const handleBackupExcel = () => {
    try {
      setIsProcessing(true);
      exportMasterDataExcel(pengurus, pemasukan, pengeluaran, pengaturan);
      updateBackupTimestamp();
      setStatusMessage({ type: 'success', text: 'Backup Excel multi-sheet berhasil diunduh.' });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: `Gagal membuat backup Excel: ${e?.message || e}` });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Restore JSON
  const handleRestoreJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setStatusMessage(null);

      const text = await file.text();
      const parsed = JSON.parse(text) as BackupData;

      if (!parsed || (!parsed.pemasukan && !parsed.pengeluaran && !parsed.pengurus)) {
        throw new Error('Struktur file JSON tidak valid sebagai backup Kas Masjid.');
      }

      const res = await dbService.importFullBackup(parsed);
      await onRefreshAll();
      setSafetyBackupExists(true);
      setStatusMessage({ type: 'success', text: res.message });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Gagal restore data: ${err?.message || err}` });
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // 4. Restore Excel
  const handleRestoreExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setStatusMessage(null);

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);

      // Look for sheets
      const inSheet = workbook.Sheets['Pemasukan'];
      const outSheet = workbook.Sheets['Pengeluaran'];
      const pengurusSheet = workbook.Sheets['Pengurus'];

      const restoredIn: TransaksiPemasukan[] = [];
      const restoredOut: TransaksiPengeluaran[] = [];
      const restoredPengurus: Pengurus[] = [];

      if (inSheet) {
        const rows: any[] = XLSX.utils.sheet_to_json(inSheet, { header: 1 });
        // find header row
        const dataRows = rows.slice(4); // usually after headers
        dataRows.forEach((r, idx) => {
          if (r && r[1] && r[6]) {
            restoredIn.push({
              id: `in_xls_${Date.now()}_${idx}`,
              tanggal: String(r[1]).trim(),
              nomorTransaksi: String(r[2] || `KM-IN-${idx}`).trim(),
              kategoriId: '',
              kategoriNama: String(r[3] || 'Umum').trim(),
              sumberDana: String(r[4] || 'Donatur').trim(),
              uraian: String(r[5] || '').trim(),
              nominal: Number(r[6]) || 0,
              namaPetugas: String(r[7] || '').trim(),
              createdAt: new Date().toISOString(),
            });
          }
        });
      }

      if (outSheet) {
        const rows: any[] = XLSX.utils.sheet_to_json(outSheet, { header: 1 });
        const dataRows = rows.slice(4);
        dataRows.forEach((r, idx) => {
          if (r && r[1] && r[5]) {
            restoredOut.push({
              id: `out_xls_${Date.now()}_${idx}`,
              tanggal: String(r[1]).trim(),
              nomorTransaksi: String(r[2] || `KM-OUT-${idx}`).trim(),
              kategoriId: '',
              kategoriNama: String(r[3] || 'Operasional').trim(),
              uraian: String(r[4] || '').trim(),
              nominal: Number(r[5]) || 0,
              namaPenanggungJawab: String(r[6] || '').trim(),
              createdAt: new Date().toISOString(),
            });
          }
        });
      }

      if (pengurusSheet) {
        const rows: any[] = XLSX.utils.sheet_to_json(pengurusSheet, { header: 1 });
        const dataRows = rows.slice(2);
        dataRows.forEach((r, idx) => {
          if (r && r[1]) {
            restoredPengurus.push({
              id: `pengurus_xls_${Date.now()}_${idx}`,
              nama: String(r[1]).trim(),
              jabatan: String(r[2] || 'Pengurus').trim(),
              telepon: String(r[3] || '').trim(),
              alamat: String(r[4] || '').trim(),
              statusAktif: String(r[5]).toLowerCase().includes('aktif') && !String(r[5]).toLowerCase().includes('non'),
              createdAt: new Date().toISOString(),
            });
          }
        });
      }

      // Auto backup current before restoring
      const current = await dbService.exportFullBackup();
      localStorage.setItem('km_safety_backup_before_restore', JSON.stringify(current));
      setSafetyBackupExists(true);

      if (restoredIn.length > 0) await dbService.savePemasukan(restoredIn);
      if (restoredOut.length > 0) await dbService.savePengeluaran(restoredOut);
      if (restoredPengurus.length > 0) await dbService.savePengurus(restoredPengurus);

      await onRefreshAll();
      setStatusMessage({
        type: 'success',
        text: `Restore Excel berhasil! ${restoredIn.length} pemasukan, ${restoredOut.length} pengeluaran, ${restoredPengurus.length} pengurus berhasil diimpor.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Gagal restore file Excel: ${err?.message || err}` });
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Safety Backup restore
  const handleRestoreSafetyBackup = async () => {
    try {
      const saved = localStorage.getItem('km_safety_backup_before_restore');
      if (!saved) return;
      const parsed = JSON.parse(saved);
      await dbService.importFullBackup(parsed);
      await onRefreshAll();
      setStatusMessage({ type: 'success', text: 'Safety Backup sebelumnya berhasil dipulihkan!' });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: `Gagal memulihkan safety backup: ${e?.message || e}` });
    }
  };

  // Clear Database
  const handleClearAllData = async () => {
    try {
      setIsProcessing(true);
      await dbService.clearAllData();
      await onRefreshAll();
      setShowClearConfirm(false);
      setStatusMessage({ type: 'success', text: 'Database berhasil dikosongkan. Kondisi awal bersih.' });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: `Gagal mengosongkan data: ${e?.message || e}` });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Backup & Restore Database Kas</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Amankan data keuangan masjid secara berkala ke komputer, flashdisk, atau Google Drive agar terhindar dari kehilangan data.
          </p>
        </div>
      </div>

      {/* Status Alert if any */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-3 border shadow-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span className="font-medium flex-1">{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Database Status Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tanggal Backup Terakhir
          </span>
          <div className="text-sm sm:text-base font-bold text-slate-900 mt-1">
            {lastBackupDate}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Disarankan backup setiap pekan</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Jumlah Transaksi
          </span>
          <div className="text-lg font-bold text-emerald-800 mt-1">
            {pemasukan.length + pengeluaran.length} Transaksi
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {pemasukan.length} masuk, {pengeluaran.length} keluar
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Master Data
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {pengurus.length + kategoriPemasukan.length + kategoriPengeluaran.length} Data
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {pengurus.length} pengurus, {kategoriPemasukan.length + kategoriPengeluaran.length} kategori
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Perkiraan Ukuran File
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1">{estimatedSize}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Sangat ringan & cepat disimpan</p>
        </div>
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Backup Data */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Download className="w-5 h-5 text-emerald-700" />
            <h2 className="font-bold text-sm text-slate-900">1. Unduh Cadangan (Backup)</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pilih format cadangan yang Anda inginkan. File hasil unduhan berisi seluruh data transaksi, kategori, pengurus, dan profil masjid.
          </p>

          <div className="space-y-3 pt-2">
            {/* Backup JSON */}
            <button
              onClick={handleBackupJSON}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-900 transition"
            >
              <div className="flex items-center gap-3 text-left">
                <FileJson className="w-6 h-6 text-emerald-700 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs">Backup Database Lengkap (.JSON)</div>
                  <div className="text-[11px] text-emerald-700">
                    Format resmi Kas Masjid, menyertakan foto kuitansi & pengaturan.
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-emerald-700" />
            </button>

            {/* Backup Excel */}
            <button
              onClick={handleBackupExcel}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/70 text-teal-900 transition"
            >
              <div className="flex items-center gap-3 text-left">
                <FileSpreadsheet className="w-6 h-6 text-teal-700 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs">Backup Data Excel (.XLSX)</div>
                  <div className="text-[11px] text-teal-700">
                    File spreadsheet Excel lengkap (Sheet Pemasukan, Pengeluaran, Pengurus).
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-teal-700" />
            </button>
          </div>
        </div>

        {/* Panel 2: Restore Data */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Upload className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-sm text-slate-900">2. Pulihkan Data (Restore)</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Muat kembali file cadangan yang telah Anda unduh sebelumnya. Sistem secara otomatis membuat cadangan darurat (Safety Backup) sebelum menimpa data.
          </p>

          <div className="space-y-3 pt-2">
            {/* Restore JSON */}
            <label className="w-full flex items-center justify-between p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-amber-900 transition cursor-pointer">
              <div className="flex items-center gap-3 text-left">
                <FileJson className="w-6 h-6 text-amber-700 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs">Restore dari File JSON (.JSON)</div>
                  <div className="text-[11px] text-amber-700">
                    Pilih file backup JSON dari komputer atau HP Anda.
                  </div>
                </div>
              </div>
              <Upload className="w-4 h-4 text-amber-700" />
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleRestoreJSON}
                className="hidden"
                disabled={isProcessing}
              />
            </label>

            {/* Restore Excel */}
            <label className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition cursor-pointer">
              <div className="flex items-center gap-3 text-left">
                <FileSpreadsheet className="w-6 h-6 text-slate-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs">Restore dari File Excel (.XLSX)</div>
                  <div className="text-[11px] text-slate-500">
                    Impor transaksi dari template Excel Kas Masjid.
                  </div>
                </div>
              </div>
              <Upload className="w-4 h-4 text-slate-600" />
              <input
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleRestoreExcel}
                className="hidden"
                disabled={isProcessing}
              />
            </label>
          </div>

          {/* Safety Backup rollback button if available */}
          {safetyBackupExists && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleRestoreSafetyBackup}
                className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Pulihkan ke Kondisi Sebelum Restore Terakhir</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Kosongkan Seluruh Database</span>
          </h3>
          <p className="text-xs text-rose-600 mt-1 max-w-xl">
            Menghapus seluruh transaksi, pengurus, dan kategori untuk memulai pembukuan dari nol dalam kondisi bersih.
          </p>
        </div>

        <button
          onClick={() => setShowClearConfirm(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition whitespace-nowrap self-start sm:self-auto"
        >
          Kosongkan Database
        </button>
      </div>

      {/* Confirmation Modal for Reset */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hapus Seluruh Data Kas?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Seluruh data transaksi ({pemasukan.length + pengeluaran.length}), pengurus ({pengurus.length}), dan kategori akan terhapus dan database kembali kosong.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleClearAllData}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Ya, Bersihkan Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

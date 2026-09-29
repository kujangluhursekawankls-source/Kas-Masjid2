import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Download,
  List,
  Table,
} from 'lucide-react';
import {
  TransaksiPemasukan,
  TransaksiPengeluaran,
  PengaturanMasjid,
  BukuKasItem,
} from '../types';
import { formatRupiah, formatTanggalIndo } from '../services/db';
import { exportBukuKasPDF, exportBukuKasExcel } from '../services/exportService';

interface BukuKasViewProps {
  pemasukan: TransaksiPemasukan[];
  pengeluaran: TransaksiPengeluaran[];
  pengaturan: PengaturanMasjid;
}

export const BukuKasView: React.FC<BukuKasViewProps> = ({
  pemasukan,
  pengeluaran,
  pengaturan,
}) => {
  const [filterMode, setFilterMode] = useState<'semua' | 'harian' | 'mingguan' | 'bulanan' | 'tahunan' | 'custom'>('bulanan');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()));
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Combine and sort chronologically (oldest to newest for running balance)
  const allTransactions = useMemo(() => {
    const combined: Array<{
      id: string;
      tanggal: string;
      nomorTransaksi: string;
      jenis: 'pemasukan' | 'pengeluaran';
      kategori: string;
      uraian: string;
      pemasukan: number;
      pengeluaran: number;
      petugas: string;
      lampiranFoto?: string;
      createdAt: string;
    }> = [];

    pemasukan.forEach((item) => {
      combined.push({
        id: item.id,
        tanggal: item.tanggal,
        nomorTransaksi: item.nomorTransaksi,
        jenis: 'pemasukan',
        kategori: item.kategoriNama,
        uraian: item.uraian,
        pemasukan: item.nominal,
        pengeluaran: 0,
        petugas: item.namaPetugas,
        lampiranFoto: item.lampiranFoto,
        createdAt: item.createdAt,
      });
    });

    pengeluaran.forEach((item) => {
      combined.push({
        id: item.id,
        tanggal: item.tanggal,
        nomorTransaksi: item.nomorTransaksi,
        jenis: 'pengeluaran',
        kategori: item.kategoriNama,
        uraian: item.uraian,
        pemasukan: 0,
        pengeluaran: item.nominal,
        petugas: item.namaPenanggungJawab,
        lampiranFoto: item.lampiranFoto,
        createdAt: item.createdAt,
      });
    });

    // Sort ascending by date, then by createdAt
    return combined.sort((a, b) => {
      if (a.tanggal !== b.tanggal) return a.tanggal.localeCompare(b.tanggal);
      return a.createdAt.localeCompare(b.createdAt);
    });
  }, [pemasukan, pengeluaran]);

  // Determine date boundary based on filter
  const { dateStart, dateEnd, periodeLabel } = useMemo(() => {
    if (filterMode === 'semua') {
      return { dateStart: '', dateEnd: '', periodeLabel: 'Semua Periode' };
    }
    if (filterMode === 'harian') {
      return {
        dateStart: selectedDate,
        dateEnd: selectedDate,
        periodeLabel: formatTanggalIndo(selectedDate),
      };
    }
    if (filterMode === 'mingguan') {
      const d = new Date(selectedDate);
      const day = d.getDay();
      const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diffToMonday));
      const sunday = new Date(d.setDate(monday.getDate() + 6));
      const sStart = monday.toISOString().split('T')[0];
      const sEnd = sunday.toISOString().split('T')[0];
      return {
        dateStart: sStart,
        dateEnd: sEnd,
        periodeLabel: `${formatTanggalIndo(sStart)} - ${formatTanggalIndo(sEnd)}`,
      };
    }
    if (filterMode === 'bulanan') {
      const parts = selectedMonth.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const sStart = `${selectedMonth}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const sEnd = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;
      const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1));
      return {
        dateStart: sStart,
        dateEnd: sEnd,
        periodeLabel: `Bulan ${monthName}`,
      };
    }
    if (filterMode === 'tahunan') {
      const sStart = `${selectedYear}-01-01`;
      const sEnd = `${selectedYear}-12-31`;
      return {
        dateStart: sStart,
        dateEnd: sEnd,
        periodeLabel: `Tahun ${selectedYear}`,
      };
    }
    if (filterMode === 'custom') {
      return {
        dateStart: customStart,
        dateEnd: customEnd,
        periodeLabel: customStart && customEnd ? `${formatTanggalIndo(customStart)} - ${formatTanggalIndo(customEnd)}` : 'Rentang Kustom',
      };
    }
    return { dateStart: '', dateEnd: '', periodeLabel: '' };
  }, [filterMode, selectedDate, selectedMonth, selectedYear, customStart, customEnd]);

  // Calculate Saldo Awal (all transactions strictly before dateStart)
  const saldoAwal = useMemo(() => {
    if (!dateStart) return 0;
    return allTransactions
      .filter((t) => t.tanggal < dateStart)
      .reduce((sum, t) => sum + (t.pemasukan - t.pengeluaran), 0);
  }, [allTransactions, dateStart]);

  // Filtered transactions for this period with running balance
  const { filteredItems, totalMasuk, totalKeluar, saldoAkhir } = useMemo(() => {
    let running = saldoAwal;
    let tIn = 0;
    let tOut = 0;

    const list = allTransactions.filter((t) => {
      if (dateStart && t.tanggal < dateStart) return false;
      if (dateEnd && t.tanggal > dateEnd) return false;
      return true;
    });

    const itemsWithBalance: BukuKasItem[] = list.map((t) => {
      running = running + t.pemasukan - t.pengeluaran;
      tIn += t.pemasukan;
      tOut += t.pengeluaran;
      return {
        id: t.id,
        tanggal: t.tanggal,
        nomorTransaksi: t.nomorTransaksi,
        jenis: t.jenis,
        kategori: t.kategori,
        uraian: t.uraian,
        pemasukan: t.pemasukan,
        pengeluaran: t.pengeluaran,
        saldoBerjalan: running,
        petugas: t.petugas,
      };
    });

    return {
      filteredItems: itemsWithBalance,
      totalMasuk: tIn,
      totalKeluar: tOut,
      saldoAkhir: running,
    };
  }, [allTransactions, dateStart, dateEnd, saldoAwal]);

  const handlePrintPDF = () => {
    exportBukuKasPDF(
      filteredItems,
      pengaturan,
      periodeLabel,
      saldoAwal,
      totalMasuk,
      totalKeluar,
      saldoAkhir
    );
  };

  const handleExportExcel = () => {
    exportBukuKasExcel(
      filteredItems,
      pengaturan,
      saldoAwal,
      totalMasuk,
      totalKeluar,
      saldoAkhir
    );
  };

  return (
    <div className="w-full space-y-4 pb-16">
      {/* Header Banner & Action Buttons */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 truncate">Buku Kas Umum Masjid</h1>
            <p className="text-[11px] text-slate-500 truncate">
              Saldo awal, mutasi, dan saldo berjalan otomatis
            </p>
          </div>
        </div>

        {/* Action Buttons: 2 Columns Grid on Mobile (min-h-[46px]) */}
        <div className="grid grid-cols-2 gap-2 w-full pt-1">
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              handleExportExcel();
            }}
            className="flex items-center justify-center gap-1.5 min-h-[46px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 text-xs font-semibold border border-slate-200 transition text-center shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span className="truncate">Download Excel</span>
          </button>
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              handlePrintPDF();
            }}
            className="flex items-center justify-center gap-1.5 min-h-[46px] px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-xs font-semibold shadow-xs transition text-center"
          >
            <Printer className="w-4 h-4 text-emerald-200 flex-shrink-0" />
            <span className="truncate">Download PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Parameters */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        {/* Mode Selector - Horizontal Scroll for Android */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(['bulanan', 'harian', 'mingguan', 'tahunan', 'semua', 'custom'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setFilterMode(mode);
              }}
              className={`px-3 py-2 min-h-[38px] rounded-xl text-xs font-semibold whitespace-nowrap transition capitalize flex-shrink-0 ${
                filterMode === mode
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode === 'custom' ? 'Kustom' : mode}
            </button>
          ))}
        </div>

        {/* Parameter Inputs */}
        <div className="flex flex-col gap-2 pt-1 text-xs">
          {filterMode === 'bulanan' && (
            <div className="flex items-center gap-2 w-full">
              <span className="text-slate-500 font-medium whitespace-nowrap">Bulan:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
              />
            </div>
          )}

          {(filterMode === 'harian' || filterMode === 'mingguan') && (
            <div className="flex items-center gap-2 w-full">
              <span className="text-slate-500 font-medium whitespace-nowrap">Tanggal:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
              />
            </div>
          )}

          {filterMode === 'tahunan' && (
            <div className="flex items-center gap-2 w-full">
              <span className="text-slate-500 font-medium whitespace-nowrap">Tahun:</span>
              <input
                type="number"
                min="2000"
                max="2100"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
              />
            </div>
          )}

          {filterMode === 'custom' && (
            <div className="grid grid-cols-2 gap-2 w-full">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Mulai</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full min-h-[42px] px-2 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Sampai</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full min-h-[42px] px-2 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
            <span>Periode Terpilih:</span>
            <strong className="text-emerald-800">{periodeLabel}</strong>
          </div>
        </div>
      </div>

      {/* Saldo Summary Cards for this Period */}
      <div className="grid grid-cols-2 gap-2.5 w-full">
        {/* Saldo Awal */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">
            Saldo Awal
          </span>
          <div className="text-sm font-bold text-slate-800 mt-1 truncate">
            {formatRupiah(saldoAwal)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">Sebelum periode</p>
        </div>

        {/* Saldo Akhir */}
        <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block truncate">
            Saldo Akhir
          </span>
          <div className="text-sm font-extrabold text-emerald-900 mt-1 truncate">
            {formatRupiah(saldoAkhir)}
          </div>
          <p className="text-[10px] text-emerald-600 mt-0.5 truncate">Posisi berjalan</p>
        </div>

        {/* Total Pemasukan */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block truncate">
            Pemasukan (+)
          </span>
          <div className="text-sm font-bold text-emerald-700 mt-1 truncate">
            {formatRupiah(totalMasuk)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">Total masuk</p>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block truncate">
            Pengeluaran (-)
          </span>
          <div className="text-sm font-bold text-rose-700 mt-1 truncate">
            {formatRupiah(totalKeluar)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">Total keluar</p>
        </div>
      </div>

      {/* Main Buku Kas Card / List View (Android Mobile Friendly) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">Rincian Buku Kas</h2>
          <span className="text-[11px] text-slate-500 font-medium">
            {filteredItems.length} Catatan
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <FileSpreadsheet className="w-9 h-9 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Tidak ada transaksi di periode ini</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Buku kas periode {periodeLabel} masih kosong.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Row Saldo Awal */}
            {dateStart && (
              <div className="p-3 bg-slate-50/70 border-b border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">SALDO AWAL PERIODE</span>
                  <span className="font-extrabold text-slate-800">{formatRupiah(saldoAwal)}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Saldo kas yang dibawa dari tanggal sebelumnya</p>
              </div>
            )}

            {filteredItems.map((item, idx) => (
              <div key={item.id} className="p-3 hover:bg-slate-50 transition space-y-1.5">
                {/* Header: No, Tanggal, No Transaksi */}
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-700">{formatTanggalIndo(item.tanggal)}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{item.nomorTransaksi}</span>
                </div>

                {/* Uraian & Kategori */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 leading-snug line-clamp-2">
                      {item.uraian}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {item.kategori}
                      </span>
                      {item.petugas && (
                        <span className="text-[10px] text-slate-400">
                          PJ: {item.petugas}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mutasi Nominal */}
                  <div className="text-right flex-shrink-0">
                    {item.pemasukan > 0 ? (
                      <span className="text-xs font-bold text-emerald-700 block">
                        + {formatRupiah(item.pemasukan)}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-600 block">
                        - {formatRupiah(item.pengeluaran)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Baris: Saldo Berjalan */}
                <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-slate-100 text-[11px]">
                  <span className="text-slate-400">Saldo Berjalan:</span>
                  <span className="font-extrabold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {formatRupiah(item.saldoBerjalan)}
                  </span>
                </div>
              </div>
            ))}

            {/* Total Footer Summary */}
            <div className="p-3.5 bg-slate-50 border-t-2 border-slate-200 text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-600">
                <span>Total Pemasukan Periode Ini:</span>
                <span className="font-bold text-emerald-800">+ {formatRupiah(totalMasuk)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Total Pengeluaran Periode Ini:</span>
                <span className="font-bold text-rose-700">- {formatRupiah(totalKeluar)}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 text-slate-900 font-extrabold text-sm">
                <span>Saldo Akhir Kas:</span>
                <span className="text-emerald-900">{formatRupiah(saldoAkhir)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  MessageCircle,
  Calendar,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  FileCheck,
} from 'lucide-react';
import {
  TransaksiPemasukan,
  TransaksiPengeluaran,
  KategoriPemasukan,
  KategoriPengeluaran,
  PengaturanMasjid,
} from '../types';
import { formatRupiah, formatTanggalIndo } from '../services/db';
import {
  exportPemasukanExcel,
  exportPengeluaranExcel,
  exportBukuKasPDF,
  createWhatsAppSummaryMessage,
} from '../services/exportService';

interface LaporanViewProps {
  pemasukan: TransaksiPemasukan[];
  pengeluaran: TransaksiPengeluaran[];
  kategoriPemasukan: KategoriPemasukan[];
  kategoriPengeluaran: KategoriPengeluaran[];
  pengaturan: PengaturanMasjid;
  onOpenWhatsAppModal: (text: string) => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  pemasukan,
  pengeluaran,
  kategoriPemasukan,
  kategoriPengeluaran,
  pengaturan,
  onOpenWhatsAppModal,
}) => {
  const [activeTab, setActiveTab] = useState<'keseluruhan' | 'pemasukan' | 'pengeluaran'>('keseluruhan');
  
  // Date filters
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedKategori, setSelectedKategori] = useState('ALL');

  // Filtered Pemasukan
  const filteredPemasukan = useMemo(() => {
    return pemasukan.filter((item) => {
      const matchStart = !startDate || item.tanggal >= startDate;
      const matchEnd = !endDate || item.tanggal <= endDate;
      const matchCat = selectedKategori === 'ALL' || item.kategoriId === selectedKategori;
      return matchStart && matchEnd && matchCat;
    });
  }, [pemasukan, startDate, endDate, selectedKategori]);

  // Filtered Pengeluaran
  const filteredPengeluaran = useMemo(() => {
    return pengeluaran.filter((item) => {
      const matchStart = !startDate || item.tanggal >= startDate;
      const matchEnd = !endDate || item.tanggal <= endDate;
      const matchCat = selectedKategori === 'ALL' || item.kategoriId === selectedKategori;
      return matchStart && matchEnd && matchCat;
    });
  }, [pengeluaran, startDate, endDate, selectedKategori]);

  // Keseluruhan Metrics
  const totalMasukPeriode = useMemo(() => {
    return filteredPemasukan.reduce((sum, item) => sum + item.nominal, 0);
  }, [filteredPemasukan]);

  const totalKeluarPeriode = useMemo(() => {
    return filteredPengeluaran.reduce((sum, item) => sum + item.nominal, 0);
  }, [filteredPengeluaran]);

  // Saldo awal prior to startDate
  const saldoAwal = useMemo(() => {
    if (!startDate) return 0;
    const inBefore = pemasukan
      .filter((item) => item.tanggal < startDate)
      .reduce((sum, item) => sum + item.nominal, 0);
    const outBefore = pengeluaran
      .filter((item) => item.tanggal < startDate)
      .reduce((sum, item) => sum + item.nominal, 0);
    return inBefore - outBefore;
  }, [pemasukan, pengeluaran, startDate]);

  const saldoAkhir = saldoAwal + totalMasukPeriode - totalKeluarPeriode;

  // Breakdown by Category
  const breakdownPemasukan = useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredPemasukan.forEach((item) => {
      map[item.kategoriNama] = (map[item.kategoriNama] || 0) + item.nominal;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredPemasukan]);

  const breakdownPengeluaran = useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredPengeluaran.forEach((item) => {
      map[item.kategoriNama] = (map[item.kategoriNama] || 0) + item.nominal;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredPengeluaran]);

  // Quick WhatsApp generation
  const handleKirimWhatsApp = () => {
    const periodeStr = `${formatTanggalIndo(startDate)} s/d ${formatTanggalIndo(endDate)}`;
    const msg = createWhatsAppSummaryMessage(
      pengaturan,
      saldoAkhir,
      totalMasukPeriode,
      totalKeluarPeriode,
      filteredPemasukan.length + filteredPengeluaran.length,
      periodeStr
    );
    onOpenWhatsAppModal(msg);
  };

  const handleExportPDF = () => {
    const combined: any[] = [];
    filteredPemasukan.forEach((item) => {
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
        createdAt: item.createdAt,
      });
    });
    filteredPengeluaran.forEach((item) => {
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
        createdAt: item.createdAt,
      });
    });
    combined.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    let runBal = saldoAwal;
    const items = combined.map((c) => {
      runBal += c.pemasukan - c.pengeluaran;
      return { ...c, saldoBerjalan: runBal };
    });

    const periode = `${formatTanggalIndo(startDate)} - ${formatTanggalIndo(endDate)}`;
    exportBukuKasPDF(
      items,
      pengaturan,
      periode,
      saldoAwal,
      totalMasukPeriode,
      totalKeluarPeriode,
      saldoAkhir
    );
  };

  return (
    <div className="w-full space-y-4 pb-16">
      {/* Header Banner & Global Action Buttons */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 truncate">Laporan Keuangan Kas</h1>
            <p className="text-[11px] text-slate-500 truncate">
              Laporan pertanggungjawaban kas transparan & cetak PDF
            </p>
          </div>
        </div>

        {/* Global Action Buttons (2 Columns Grid on Mobile) */}
        <div className="grid grid-cols-2 gap-2 w-full pt-1">
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              handleKirimWhatsApp();
            }}
            className="flex items-center justify-center gap-1.5 min-h-[46px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-semibold shadow-xs transition text-center"
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Kirim WhatsApp</span>
          </button>
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              handleExportPDF();
            }}
            className="flex items-center justify-center gap-1.5 min-h-[46px] px-3 py-2 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white rounded-xl text-xs font-semibold shadow-xs transition text-center"
          >
            <Printer className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        {/* Sub-tab Switcher (Mobile Tab Pills) */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(5);
              setActiveTab('keseluruhan');
            }}
            className={`py-2 px-1 rounded-lg text-xs font-semibold transition text-center truncate ${
              activeTab === 'keseluruhan' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Kas Umum
          </button>
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(5);
              setActiveTab('pemasukan');
            }}
            className={`py-2 px-1 rounded-lg text-xs font-semibold transition text-center truncate ${
              activeTab === 'pemasukan' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(5);
              setActiveTab('pengeluaran');
            }}
            className={`py-2 px-1 rounded-lg text-xs font-semibold transition text-center truncate ${
              activeTab === 'pengeluaran' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Pengeluaran
          </button>
        </div>

        {/* Date Filters */}
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">Mulai Dari:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full min-h-[42px] px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">Sampai:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full min-h-[42px] px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
              />
            </div>
          </div>

          {activeTab !== 'keseluruhan' && (
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">Pilih Kategori:</label>
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                className="w-full min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 bg-white"
              >
                <option value="ALL">Semua Kategori</option>
                {activeTab === 'pemasukan'
                  ? kategoriPemasukan.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))
                  : kategoriPengeluaran.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tab 1: Laporan Kas Keseluruhan */}
      {activeTab === 'keseluruhan' && (
        <div className="space-y-3 w-full">
          {/* Summary Box */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">
                Saldo Awal
              </span>
              <div className="text-sm font-bold text-slate-800 mt-1 truncate">
                {formatRupiah(saldoAwal)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{formatTanggalIndo(startDate)}</p>
            </div>

            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block truncate">
                Saldo Akhir
              </span>
              <div className="text-sm font-extrabold text-emerald-900 mt-1 truncate">
                {formatRupiah(saldoAkhir)}
              </div>
              <p className="text-[10px] text-emerald-600 mt-0.5 truncate">{formatTanggalIndo(endDate)}</p>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block truncate">
                Total Masuk
              </span>
              <div className="text-sm font-bold text-emerald-800 mt-1 truncate">
                {formatRupiah(totalMasukPeriode)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{filteredPemasukan.length} transaksi</p>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block truncate">
                Total Keluar
              </span>
              <div className="text-sm font-bold text-rose-700 mt-1 truncate">
                {formatRupiah(totalKeluarPeriode)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{filteredPengeluaran.length} transaksi</p>
            </div>
          </div>

          {/* Breakdown Per Kategori */}
          <div className="space-y-3">
            {/* Pemasukan Breakdown */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  <span>Pemasukan per Kategori</span>
                </h3>
                <span className="text-xs font-bold text-emerald-800">
                  {formatRupiah(totalMasukPeriode)}
                </span>
              </div>

              {breakdownPemasukan.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2 text-center">
                  Tidak ada pemasukan pada periode ini
                </p>
              ) : (
                <div className="space-y-2">
                  {breakdownPemasukan.map(([cat, val]) => {
                    const pct = totalMasukPeriode > 0 ? Math.round((val / totalMasukPeriode) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-700 truncate max-w-[180px]">{cat}</span>
                          <span className="font-bold text-slate-900">
                            {formatRupiah(val)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="bg-emerald-600 h-full rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pengeluaran Breakdown */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                  <span>Pengeluaran per Kategori</span>
                </h3>
                <span className="text-xs font-bold text-rose-700">
                  {formatRupiah(totalKeluarPeriode)}
                </span>
              </div>

              {breakdownPengeluaran.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2 text-center">
                  Tidak ada pengeluaran pada periode ini
                </p>
              ) : (
                <div className="space-y-2">
                  {breakdownPengeluaran.map(([cat, val]) => {
                    const pct = totalKeluarPeriode > 0 ? Math.round((val / totalKeluarPeriode) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-700 truncate max-w-[180px]">{cat}</span>
                          <span className="font-bold text-slate-900">
                            {formatRupiah(val)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="bg-rose-500 h-full rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Laporan Pemasukan (Android Card View) */}
      {activeTab === 'pemasukan' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-xs text-slate-800">Daftar Pemasukan</h3>
              <p className="text-[11px] text-emerald-800 font-extrabold">{formatRupiah(totalMasukPeriode)}</p>
            </div>
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                exportPemasukanExcel(filteredPemasukan, pengaturan);
              }}
              className="flex items-center gap-1.5 min-h-[44px] px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-xs font-semibold text-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <span>Unduh Excel</span>
            </button>
          </div>

          {filteredPemasukan.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400 italic">
              Tidak ada transaksi pemasukan pada rentang filter ini.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPemasukan.map((item) => (
                <div key={item.id} className="p-3 hover:bg-slate-50 transition space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">{formatTanggalIndo(item.tanggal)}</span>
                    <span className="font-mono text-[10px] text-slate-400">{item.nomorTransaksi}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 line-clamp-2">{item.uraian}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold">
                          {item.kategoriNama}
                        </span>
                        {item.sumberDana && (
                          <span className="text-[10px] text-slate-500 truncate">
                            Sumber: {item.sumberDana}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 flex-shrink-0">
                      + {formatRupiah(item.nominal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Laporan Pengeluaran (Android Card View) */}
      {activeTab === 'pengeluaran' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-xs text-slate-800">Daftar Pengeluaran</h3>
              <p className="text-[11px] text-rose-700 font-extrabold">{formatRupiah(totalKeluarPeriode)}</p>
            </div>
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                exportPengeluaranExcel(filteredPengeluaran, pengaturan);
              }}
              className="flex items-center gap-1.5 min-h-[44px] px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-xs font-semibold text-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
              <span>Unduh Excel</span>
            </button>
          </div>

          {filteredPengeluaran.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400 italic">
              Tidak ada transaksi pengeluaran pada rentang filter ini.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPengeluaran.map((item) => (
                <div key={item.id} className="p-3 hover:bg-slate-50 transition space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">{formatTanggalIndo(item.tanggal)}</span>
                    <span className="font-mono text-[10px] text-slate-400">{item.nomorTransaksi}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 line-clamp-2">{item.uraian}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-semibold">
                          {item.kategoriNama}
                        </span>
                        {item.namaPenanggungJawab && (
                          <span className="text-[10px] text-slate-500 truncate">
                            PJ: {item.namaPenanggungJawab}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-rose-700 flex-shrink-0">
                      - {formatRupiah(item.nominal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

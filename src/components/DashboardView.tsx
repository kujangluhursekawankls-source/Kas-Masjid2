import React, { useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  Calendar,
  PlusCircle,
  MinusCircle,
  FileSpreadsheet,
  MessageCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Lock,
  LogIn,
} from 'lucide-react';
import {
  TransaksiPemasukan,
  TransaksiPengeluaran,
  PengaturanMasjid,
  ActiveTab,
  UserProfile,
} from '../types';
import { formatRupiah, formatTanggalIndo } from '../services/db';

interface DashboardViewProps {
  pemasukan: TransaksiPemasukan[];
  pengeluaran: TransaksiPengeluaran[];
  pengaturan: PengaturanMasjid;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddPemasukan: () => void;
  onOpenAddPengeluaran: () => void;
  currentUserProfile?: UserProfile | null;
  onOpenAuth?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pemasukan,
  pengeluaran,
  pengaturan,
  setActiveTab,
  onOpenAddPemasukan,
  onOpenAddPengeluaran,
  currentUserProfile,
  onOpenAuth,
}) => {
  // Calculations
  const totalPemasukan = useMemo(
    () => pemasukan.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0),
    [pemasukan]
  );

  const totalPengeluaran = useMemo(
    () => pengeluaran.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0),
    [pengeluaran]
  );

  const saldoKas = totalPemasukan - totalPengeluaran;
  const jumlahTransaksi = pemasukan.length + pengeluaran.length;

  // Bulan Berjalan
  const currentMonthPrefix = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, []);

  const currentMonthName = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());
  }, []);

  const pemasukanBulanIni = useMemo(() => {
    return pemasukan
      .filter((item) => item.tanggal?.startsWith(currentMonthPrefix))
      .reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
  }, [pemasukan, currentMonthPrefix]);

  const pengeluaranBulanIni = useMemo(() => {
    return pengeluaran
      .filter((item) => item.tanggal?.startsWith(currentMonthPrefix))
      .reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
  }, [pengeluaran, currentMonthPrefix]);

  const surplusBulanIni = pemasukanBulanIni - pengeluaranBulanIni;

  // Combined Recent Transactions (last 6)
  const recentTransactions = useMemo(() => {
    const list: Array<{
      id: string;
      tanggal: string;
      nomor: string;
      jenis: 'masuk' | 'keluar';
      kategori: string;
      uraian: string;
      nominal: number;
      pj: string;
    }> = [];

    pemasukan.forEach((item) => {
      list.push({
        id: item.id,
        tanggal: item.tanggal,
        nomor: item.nomorTransaksi,
        jenis: 'masuk',
        kategori: item.kategoriNama,
        uraian: item.uraian,
        nominal: item.nominal,
        pj: item.namaPetugas,
      });
    });

    pengeluaran.forEach((item) => {
      list.push({
        id: item.id,
        tanggal: item.tanggal,
        nomor: item.nomorTransaksi,
        jenis: 'keluar',
        kategori: item.kategoriNama,
        uraian: item.uraian,
        nominal: item.nominal,
        pj: item.namaPenanggungJawab,
      });
    });

    return list
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
      .slice(0, 6);
  }, [pemasukan, pengeluaran]);

  // Monthly Chart Data (Last 6 months)
  const monthlyChartData = useMemo(() => {
    const months: { [key: string]: { label: string; masuk: number; keluar: number } } = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(d);
      months[key] = { label, masuk: 0, keluar: 0 };
    }

    pemasukan.forEach((item) => {
      const key = item.tanggal?.slice(0, 7);
      if (key && months[key]) {
        months[key].masuk += Number(item.nominal) || 0;
      }
    });

    pengeluaran.forEach((item) => {
      const key = item.tanggal?.slice(0, 7);
      if (key && months[key]) {
        months[key].keluar += Number(item.nominal) || 0;
      }
    });

    return Object.values(months);
  }, [pemasukan, pengeluaran]);

  const maxChartValue = useMemo(() => {
    const vals = monthlyChartData.flatMap((d) => [d.masuk, d.keluar]);
    const max = Math.max(...vals, 100000);
    return max;
  }, [monthlyChartData]);

  // Top Categories Breakdown
  const categoryBreakdownIn = useMemo(() => {
    const map: { [key: string]: number } = {};
    pemasukan.forEach((item) => {
      const cat = item.kategoriNama || 'Lain-lain';
      map[cat] = (map[cat] || 0) + (Number(item.nominal) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [pemasukan]);

  const categoryBreakdownOut = useMemo(() => {
    const map: { [key: string]: number } = {};
    pengeluaran.forEach((item) => {
      const cat = item.kategoriNama || 'Lain-lain';
      map[cat] = (map[cat] || 0) + (Number(item.nominal) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [pengeluaran]);

  return (
    <div className="w-full space-y-4 pb-16">
      {/* Mosque Banner or Header */}
      {pengaturan.fotoMasjid ? (
        <div className="relative rounded-2xl overflow-hidden shadow-md h-40 bg-emerald-950">
          <img
            src={pengaturan.fotoMasjid}
            alt="Masjid"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent flex flex-col justify-end p-4 text-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              SISTEM KAS & KEUANGAN TERBUKA
            </span>
            <h1 className="text-xl font-bold tracking-tight leading-tight">
              {pengaturan.namaMasjid || 'Kas Masjid'}
            </h1>
            <p className="text-xs text-slate-300 truncate mt-0.5">
              {pengaturan.alamat || 'Alamat Masjid Belum Diatur'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-emerald-700/20 blur-xl pointer-events-none" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              Sistem Kas Keuangan Terbuka
            </span>
          </div>
          <h1 className="text-xl font-bold mt-1 text-white tracking-tight">
            {pengaturan.namaMasjid ? `Kas ${pengaturan.namaMasjid}` : 'Buku Kas Masjid'}
          </h1>
          <p className="text-xs text-emerald-100/90 mt-1 line-clamp-2">
            {pengaturan.alamat || 'Laporan keuangan transparan, akuntabel, dan siap cetak kuitansi PDF.'}
          </p>
        </div>
      )}

      {/* Banner / Notice saat Log Out (Kondisi 0 & Anti Bocor Data) */}
      {!currentUserProfile && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-amber-950">
                Mode Kas Terkunci (Kondisi 0)
              </h4>
              <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                Anda sedang dalam posisi keluar (log out). Data kas dikosongkan (Rp 0) untuk menjaga privasi & mencegah kebocoran data. Silakan masuk untuk membuka pembukuan kas masjid Anda.
              </p>
            </div>
          </div>
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk ke Akun Masjid</span>
            </button>
          )}
        </div>
      )}

      {/* Vertical Stack Cards (Khusus Android per instruksi) */}
      <div className="flex flex-col space-y-3 w-full">
        {/* Card 1: Saldo Kas Saat Ini (Hero Card) */}
        <div className="w-full bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 rounded-2xl p-4 text-white shadow-md relative overflow-hidden border border-emerald-700/50">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-600/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-700/80 flex items-center justify-center text-amber-300">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Saldo Kas Saat Ini
              </span>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200">
              {jumlahTransaksi} Transaksi
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              {formatRupiah(saldoKas)}
            </div>
            <p className="text-xs text-emerald-200/90 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Akumulasi saldo kas akhir masjid terverifikasi</span>
            </p>
          </div>
        </div>

        {/* Card 2: Total Pemasukan */}
        <div className="w-full bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-100">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Pemasukan
              </span>
              <div className="text-xl font-extrabold text-emerald-700 tracking-tight leading-tight mt-0.5">
                {formatRupiah(totalPemasukan)}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {pemasukan.length} transaksi pemasukan tercatat
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div className="w-full bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center flex-shrink-0 border border-rose-100">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Pengeluaran
              </span>
              <div className="text-xl font-extrabold text-rose-600 tracking-tight leading-tight mt-0.5">
                {formatRupiah(totalPengeluaran)}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {pengeluaran.length} transaksi pengeluaran tercatat
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Bulan Berjalan */}
        <div className="w-full bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Bulan Ini ({currentMonthName})
              </span>
            </div>
            <span className={`text-xs font-bold ${surplusBulanIni >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              Surplus: {formatRupiah(surplusBulanIni)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100/80">
              <span className="text-slate-500 text-[11px] block">Masuk Bulan Ini:</span>
              <span className="font-bold text-emerald-800 text-sm">{formatRupiah(pemasukanBulanIni)}</span>
            </div>
            <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-100/80">
              <span className="text-slate-500 text-[11px] block">Keluar Bulan Ini:</span>
              <span className="font-bold text-rose-700 text-sm">{formatRupiah(pengeluaranBulanIni)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Aksi Cepat - 2 Columns Grid x 2 Rows with min 48px touch height */}
      <div className="w-full bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Aksi Cepat Pengurus
          </h2>
          <span className="text-[11px] text-slate-400">Pilih Aksi</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              onOpenAddPemasukan();
            }}
            className="flex items-center justify-center gap-2 min-h-[50px] p-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-semibold text-xs transition shadow-xs text-center"
          >
            <PlusCircle className="w-4 h-4 text-emerald-200 flex-shrink-0" />
            <span className="truncate">Catat Pemasukan</span>
          </button>

          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              onOpenAddPengeluaran();
            }}
            className="flex items-center justify-center gap-2 min-h-[50px] p-3 rounded-xl bg-rose-700 hover:bg-rose-800 active:scale-98 text-white font-semibold text-xs transition shadow-xs text-center"
          >
            <MinusCircle className="w-4 h-4 text-rose-200 flex-shrink-0" />
            <span className="truncate">Catat Pengeluaran</span>
          </button>

          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              setActiveTab('buku-kas');
            }}
            className="flex items-center justify-center gap-2 min-h-[50px] p-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 font-semibold text-xs transition border border-slate-200 text-center"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-600 flex-shrink-0" />
            <span className="truncate">Buku Kas & Cetak</span>
          </button>

          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              setActiveTab('whatsapp');
            }}
            className="flex items-center justify-center gap-2 min-h-[50px] p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-98 text-emerald-800 font-semibold text-xs transition border border-emerald-200 text-center"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate">Kirim WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Monthly Chart (Khusus Tampilan Android) */}
      <div className="w-full bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Grafik Kas 6 Bulan Terakhir</h2>
            <p className="text-[11px] text-slate-500">Pemasukan vs Pengeluaran</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
              Masuk
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
              Keluar
            </span>
          </div>
        </div>

        {/* SVG Bar Chart with Safe Mobile Sizing */}
        <div className="h-44 w-full flex items-end justify-between gap-1.5 pt-4 pb-2 px-1 border-b border-slate-100">
          {monthlyChartData.map((item, idx) => {
            const masukHeight = Math.max(4, Math.round((item.masuk / maxChartValue) * 120));
            const keluarHeight = Math.max(4, Math.round((item.keluar / maxChartValue) * 120));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-0.5">
                  <div
                    style={{ height: `${masukHeight}px` }}
                    className="w-1/2 max-w-[14px] bg-emerald-600 rounded-t transition-all"
                  />
                  <div
                    style={{ height: `${keluarHeight}px` }}
                    className="w-1/2 max-w-[14px] bg-rose-500 rounded-t transition-all"
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-semibold mt-1">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-2.5 flex justify-between items-center text-[11px] text-slate-400">
          <span>Skala Maksimal</span>
          <span className="font-semibold text-slate-600">{formatRupiah(maxChartValue)}</span>
        </div>
      </div>

      {/* Category Breakdown (Transparency) */}
      <div className="w-full bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-700" />
            <h2 className="font-bold text-slate-900 text-sm">Transparansi Kategori Kas</h2>
          </div>
          <button
            onClick={() => setActiveTab('laporan')}
            className="text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5"
          >
            <span>Rincian</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Top Inflow */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1.5">
              Pemasukan Terbesar
            </span>
            {categoryBreakdownIn.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Belum ada data transaksi pemasukan</p>
            ) : (
              <div className="space-y-2">
                {categoryBreakdownIn.slice(0, 3).map(([cat, val]) => {
                  const pct = totalPemasukan > 0 ? Math.round((val / totalPemasukan) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-700 font-medium truncate">{cat}</span>
                        <span className="font-bold text-emerald-800">{formatRupiah(val)} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Outflow */}
          <div className="border-t border-slate-100 pt-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block mb-1.5">
              Pengeluaran Terbesar
            </span>
            {categoryBreakdownOut.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Belum ada data transaksi pengeluaran</p>
            ) : (
              <div className="space-y-2">
                {categoryBreakdownOut.slice(0, 3).map(([cat, val]) => {
                  const pct = totalPengeluaran > 0 ? Math.round((val / totalPengeluaran) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-700 font-medium truncate">{cat}</span>
                        <span className="font-bold text-rose-700">{formatRupiah(val)} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
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

      {/* Histori Transaksi Terkini (Android Card View) */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Histori Transaksi Terkini</h2>
            <p className="text-[11px] text-slate-500">Pembaruan kas terbaru</p>
          </div>
          <button
            onClick={() => setActiveTab('buku-kas')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
          >
            <span>Semua</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-semibold text-slate-700">Database Kas Masih Bersih (Kosong)</h3>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
              Belum ada transaksi kas yang dicatat. Silakan gunakan tombol di bawah untuk mencatat pemasukan atau pengeluaran pertama.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-3.5">
              <button
                onClick={onOpenAddPemasukan}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition"
              >
                + Catat Pemasukan
              </button>
              <button
                onClick={onOpenAddPengeluaran}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold transition"
              >
                + Catat Pengeluaran
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((item) => (
              <div
                key={item.id}
                className="p-3 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.jenis === 'masuk'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.jenis === 'masuk' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {item.kategori || (item.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{item.uraian || '-'}</p>
                    <p className="text-[10px] text-slate-400">
                      {formatTanggalIndo(item.tanggal)} &bull; {item.pj}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-xs font-extrabold block ${
                      item.jenis === 'masuk' ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {item.jenis === 'masuk' ? '+' : '-'} {formatRupiah(item.nominal)}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.nomor}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  MessageCircle,
  Copy,
  Check,
  Send,
  Calendar,
  Wallet,
  Building2,
  FileText,
  Printer,
  Download,
  Share2,
} from 'lucide-react';
import {
  TransaksiPemasukan,
  TransaksiPengeluaran,
  PengaturanMasjid,
} from '../types';
import { formatRupiah, formatTanggalIndo } from '../services/db';
import { exportBukuKasPDF } from '../services/exportService';

interface WhatsAppViewProps {
  pemasukan: TransaksiPemasukan[];
  pengeluaran: TransaksiPengeluaran[];
  pengaturan: PengaturanMasjid;
  presetText?: string;
  onClearPreset?: () => void;
}

export const WhatsAppView: React.FC<WhatsAppViewProps> = ({
  pemasukan,
  pengeluaran,
  pengaturan,
  presetText,
  onClearPreset,
}) => {
  const [reportType, setReportType] = useState<'ringkasan' | 'bulanan' | 'tahunan'>('ringkasan');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()));
  const [targetPhone, setTargetPhone] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate Message Text based on selected type
  const generatedMessage = React.useMemo(() => {
    if (presetText) return presetText;

    const masjid = (pengaturan.namaMasjid || 'Masjid / Mushola').toUpperCase();
    const tglSekarang = formatTanggalIndo(new Date().toISOString().split('T')[0]);

    if (reportType === 'ringkasan') {
      const totalMasuk = pemasukan.reduce((sum, item) => sum + item.nominal, 0);
      const totalKeluar = pengeluaran.reduce((sum, item) => sum + item.nominal, 0);
      const saldo = totalMasuk - totalKeluar;

      return `*LAPORAN KAS & KEUANGAN MASJID*
🕌 *${masjid}*
📅 Tanggal: ${tglSekarang}
───────────────────────
💰 *SALDO KAS SAAT INI:*
👉 *${formatRupiah(saldo)}*

📈 *Total Pemasukan:* ${formatRupiah(totalMasuk)} (${pemasukan.length} transaksi)
📉 *Total Pengeluaran:* ${formatRupiah(totalKeluar)} (${pengeluaran.length} transaksi)
───────────────────────
Jazakumullah Khairan Katsiran kepada seluruh jamaah & muhsinin atas infaq, shadaqah, dan donasi terbaiknya. Semoga menjadi amal jariyah yang berlipat ganda. Aamiin.

Mengetahui:
👤 Ketua DKM: *${pengaturan.namaKetua || '-'}*
👤 Bendahara: *${pengaturan.namaBendahara || '-'}*

_Kas Masjid Android - Transparansi & Akuntabel_`;
    }

    if (reportType === 'bulanan') {
      const inMonth = pemasukan.filter((item) => item.tanggal?.startsWith(selectedMonth));
      const outMonth = pengeluaran.filter((item) => item.tanggal?.startsWith(selectedMonth));

      const totalInMonth = inMonth.reduce((sum, item) => sum + item.nominal, 0);
      const totalOutMonth = outMonth.reduce((sum, item) => sum + item.nominal, 0);
      const surplus = totalInMonth - totalOutMonth;

      const [y, m] = selectedMonth.split('-');
      const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(
        new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1)
      );

      // Top 3 in
      const inCats: { [k: string]: number } = {};
      inMonth.forEach((i) => (inCats[i.kategoriNama] = (inCats[i.kategoriNama] || 0) + i.nominal));
      const topIn = Object.entries(inCats).sort((a, b) => b[1] - a[1]).slice(0, 3);

      // Top 3 out
      const outCats: { [k: string]: number } = {};
      outMonth.forEach((i) => (outCats[i.kategoriNama] = (outCats[i.kategoriNama] || 0) + i.nominal));
      const topOut = Object.entries(outCats).sort((a, b) => b[1] - a[1]).slice(0, 3);

      return `*LAPORAN KAS BULANAN*
🕌 *${masjid}*
🗓️ *Periode: ${monthName}*
───────────────────────
📈 *Pemasukan Kas:* ${formatRupiah(totalInMonth)}
📉 *Pengeluaran Kas:* ${formatRupiah(totalOutMonth)}
⚖️ *Surplus/Defisit:* ${surplus >= 0 ? '+' : ''}${formatRupiah(surplus)}

📌 *Pemasukan Terbesar:*
${topIn.length === 0 ? '- Belum ada data' : topIn.map(([c, v]) => `• ${c}: ${formatRupiah(v)}`).join('\n')}

📌 *Pengeluaran Terbesar:*
${topOut.length === 0 ? '- Belum ada data' : topOut.map(([c, v]) => `• ${c}: ${formatRupiah(v)}`).join('\n')}
───────────────────────
Terima kasih atas segala dukungan dan amanah jamaah sekalian.

Pengurus DKM:
👤 Ketua: *${pengaturan.namaKetua || '-'}*
👤 Bendahara: *${pengaturan.namaBendahara || '-'}*`;
    }

    if (reportType === 'tahunan') {
      const inYear = pemasukan.filter((item) => item.tanggal?.startsWith(selectedYear));
      const outYear = pengeluaran.filter((item) => item.tanggal?.startsWith(selectedYear));

      const sumIn = inYear.reduce((sum, item) => sum + item.nominal, 0);
      const sumOut = outYear.reduce((sum, item) => sum + item.nominal, 0);

      return `*LAPORAN TAHUNAN KAS MASJID*
🕌 *${masjid}*
🗓️ *Tahun Buku: ${selectedYear}*
───────────────────────
📈 *Total Penerimaan (${selectedYear}):* ${formatRupiah(sumIn)}
📉 *Total Pengeluaran (${selectedYear}):* ${formatRupiah(sumOut)}
⚖️ *Saldo Bersih Tahun Ini:* ${formatRupiah(sumIn - sumOut)}
📊 *Total Transaksi:* ${inYear.length + outYear.length} catatan
───────────────────────
Semoga Allah senantiasa melimpahkan berkah dan kemakmuran untuk masjid dan seluruh jamaah.

Ditetapkan oleh Pengurus:
👤 Ketua DKM: *${pengaturan.namaKetua || '-'}*
👤 Bendahara: *${pengaturan.namaBendahara || '-'}*`;
    }

    return '';
  }, [presetText, reportType, pemasukan, pengeluaran, pengaturan, selectedMonth, selectedYear]);

  const [messageDraft, setMessageDraft] = useState(generatedMessage);

  React.useEffect(() => {
    setMessageDraft(generatedMessage);
  }, [generatedMessage]);

  const handleCopy = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    navigator.clipboard.writeText(messageDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWA = () => {
    if (navigator.vibrate) navigator.vibrate(15);
    let cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageDraft)}`
      : `https://wa.me/?text=${encodeURIComponent(messageDraft)}`;
    window.open(url, '_blank');
  };

  const handleDownloadPDFForWA = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    const combined: any[] = [];
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
        createdAt: item.createdAt,
      });
    });
    combined.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    let runBal = 0;
    const items = combined.map((c) => {
      runBal += c.pemasukan - c.pengeluaran;
      return { ...c, saldoBerjalan: runBal };
    });

    const totalIn = pemasukan.reduce((sum, item) => sum + item.nominal, 0);
    const totalOut = pengeluaran.reduce((sum, item) => sum + item.nominal, 0);

    exportBukuKasPDF(
      items,
      pengaturan,
      'Laporan Kas Lengkap untuk Lampiran WhatsApp',
      0,
      totalIn,
      totalOut,
      totalIn - totalOut
    );
  };

  return (
    <div className="w-full space-y-4 pb-16">
      {/* Header Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 truncate">Kirim Laporan ke WhatsApp</h1>
            <p className="text-[11px] text-slate-500 truncate">
              Format pesan otomatis, rapi, dan siap dibagikan ke grup jamaah
            </p>
          </div>
        </div>

        {presetText && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 italic">Laporan khusus dari filter</span>
            <button
              onClick={onClearPreset}
              className="text-xs text-emerald-700 underline font-semibold"
            >
              Reset ke Standar
            </button>
          </div>
        )}
      </div>

      {/* Pilihan Jenis Laporan Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Pilih Format Pesan WhatsApp
        </h2>

        <div className="space-y-2">
          <button
            onClick={() => {
              if (onClearPreset) onClearPreset();
              setReportType('ringkasan');
            }}
            className={`w-full p-3 min-h-[50px] rounded-xl border text-left text-xs transition ${
              reportType === 'ringkasan' && !presetText
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <Wallet className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>1. Ringkasan Keuangan Kas Saat Ini</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Saldo akhir, total masuk & keluar, ucapan doa untuk donatur.
            </p>
          </button>

          <button
            onClick={() => {
              if (onClearPreset) onClearPreset();
              setReportType('bulanan');
            }}
            className={`w-full p-3 min-h-[50px] rounded-xl border text-left text-xs transition ${
              reportType === 'bulanan' && !presetText
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <Calendar className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>2. Laporan Mutasi Kas Bulanan</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rekap pemasukan vs pengeluaran dan kategori terbesar bulan ini.
            </p>
          </button>

          <button
            onClick={() => {
              if (onClearPreset) onClearPreset();
              setReportType('tahunan');
            }}
            className={`w-full p-3 min-h-[50px] rounded-xl border text-left text-xs transition ${
              reportType === 'tahunan' && !presetText
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <Building2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>3. Laporan Kas Tahunan (LPJ)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rekap tahunan lengkap untuk rapat pengurus DKM akhir tahun.
            </p>
          </button>
        </div>

        {/* Date Selector if needed */}
        {reportType === 'bulanan' && (
          <div className="pt-1">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Pilih Bulan yang Dilaporkan:
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>
        )}

        {reportType === 'tahunan' && (
          <div className="pt-1">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Pilih Tahun Buku:
            </label>
            <input
              type="number"
              min="2000"
              max="2100"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>
        )}

        {/* Target Phone */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Nomor WhatsApp Tujuan (Opsional)
          </label>
          <input
            type="tel"
            placeholder="08xxxxxxxxxx (Kosongkan jika ingin memilih di WA)"
            value={targetPhone}
            onChange={(e) => setTargetPhone(e.target.value)}
            className="w-full min-h-[42px] px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Jika dikosongkan, Anda dapat langsung memilih kontak/grup jamaah di WhatsApp.
          </p>
        </div>
      </div>

      {/* Preview Box & Send Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Pratinjau Pesan WhatsApp
          </h2>
          <span className="text-[10px] text-slate-400">Bisa diedit sebelum kirim</span>
        </div>

        {/* WhatsApp Chat Bubble */}
        <div className="bg-[#e5ddd5] p-3 rounded-2xl shadow-inner">
          <div className="bg-[#dcf8c6] rounded-xl p-3 shadow-xs border border-emerald-200/50">
            <textarea
              rows={11}
              value={messageDraft}
              onChange={(e) => setMessageDraft(e.target.value)}
              className="w-full bg-transparent border-0 resize-none text-xs font-sans leading-relaxed text-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Action Buttons: 2 Columns Grid on Mobile (min-h-[48px]) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 active:scale-98 text-xs font-semibold text-slate-700 transition text-center shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>

          <button
            onClick={handleSendWA}
            className="flex items-center justify-center gap-2 min-h-[48px] px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold shadow-xs transition text-center"
          >
            <Send className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Kirim di WA</span>
          </button>
        </div>

        {/* Extra Option: Download PDF to attach in WA */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={handleDownloadPDFForWA}
            className="w-full flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 text-xs font-semibold border border-slate-200 transition"
          >
            <Download className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Unduh Lampiran Dokumen PDF untuk WA</span>
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-1">
            Tips: Unduh PDF lalu lampirkan file di grup WhatsApp bersamaan dengan teks ringkasan di atas.
          </p>
        </div>
      </div>
    </div>
  );
};

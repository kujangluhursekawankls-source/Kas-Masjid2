import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet,
  MessageCircle,
  Database,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Download,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWA';

export const PanduanView: React.FC = () => {
  const { install, isInstallable, isInstalled, isIOS } = usePWAInstall();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const guides = [
    {
      id: 'install',
      title: 'Cara Menginstall Aplikasi Kas Masjid di Android & iOS',
      icon: Smartphone,
      color: 'text-amber-600 bg-amber-50',
      steps: [
        'Buka aplikasi web ini melalui browser Google Chrome (di Android) atau Safari (di iPhone).',
        'Di Android: Tekan tombol "Install di HP" di bagian atas layar atau menu titik tiga browser lalu pilih "Tambahkan ke Layar Utama" (Install app).',
        'Di iPhone/iPad: Tekan ikon Bagikan (Share) di browser Safari, lalu gulir ke bawah dan pilih "Tambah ke Layar Utama" (Add to Home Screen).',
        'Aplikasi Kas Masjid akan terpasang di layar HP Anda dengan ikon dan nama resmi seperti aplikasi Android dari Play Store, serta dapat dibuka tanpa kuota (offline).',
      ],
    },
    {
      id: 'pemasukan',
      title: 'Cara Menambah & Mencatat Pemasukan Kas',
      icon: ArrowDownLeft,
      color: 'text-emerald-600 bg-emerald-50',
      steps: [
        'Buka menu "Pemasukan" atau tekan tombol hijau "Catat Pemasukan" di Dashboard.',
        'Pilih tanggal transaksi dan kategori pemasukan (misal: Kotak Amal Jumat, Zakat Maal, Donatur Tetap).',
        'Tuliskan sumber dana (nama donatur atau nama kotak) dan uraian penjelasan penerimaan.',
        'Masukkan nominal angka penerimaan rupiah.',
        'Pilih nama petugas penerima dan Anda dapat memotret kuitansi atau bukti transfer.',
        'Tekan "Simpan Transaksi". Anda langsung dapat mencetak kuitansi tanda terima PDF resmi dengan menekan ikon printer.',
      ],
    },
    {
      id: 'pengeluaran',
      title: 'Cara Menambah & Mencatat Pengeluaran Kas',
      icon: ArrowUpRight,
      color: 'text-rose-600 bg-rose-50',
      steps: [
        'Buka menu "Pengeluaran" atau tekan tombol merah "Catat Pengeluaran" di Dashboard.',
        'Pilih tanggal pengeluaran dan kategori biaya (misal: Listrik PLN, Honor Khatib, Kebersihan).',
        'Tuliskan uraian keperluan penggunaan dana secara jelas.',
        'Masukkan nominal rupiah yang dibayarkan dan nama penanggung jawab / penerima.',
        'Ambil foto nota, bon pembelian, atau kuitansi fisik sebagai bukti otentik.',
        'Tekan "Simpan Pengeluaran". Anda dapat mencetak Voucher Kas Keluar PDF untuk arsip DKM.',
      ],
    },
    {
      id: 'buku-kas',
      title: 'Cara Membaca Buku Kas & Saldo Berjalan',
      icon: FileSpreadsheet,
      color: 'text-blue-600 bg-blue-50',
      steps: [
        'Buka menu "Buku Kas". Sistem secara otomatis menghitung Saldo Awal, Total Pemasukan, Total Pengeluaran, dan Saldo Berjalan.',
        'Gunakan tombol filter: Harian, Mingguan, Bulanan, Tahunan, atau Kustom untuk menyaring periode kas yang diinginkan.',
        'Tekan "Cetak PDF Resmi" untuk menghasilkan dokumen cetak dengan kop surat masjid, tanggal cetak, dan tanda tangan Ketua DKM & Bendahara.',
        'Tekan "Ekspor Excel" untuk mengunduh laporan ke file Excel (.xlsx).',
      ],
    },
    {
      id: 'whatsapp',
      title: 'Cara Mengirim Laporan Kas ke WhatsApp Jamaah',
      icon: MessageCircle,
      color: 'text-emerald-700 bg-emerald-50',
      steps: [
        'Buka menu "Kirim WA" dari navigasi.',
        'Pilih format laporan yang ingin dikirim: Ringkasan Saat Ini, Laporan Bulanan, atau Laporan Tahunan.',
        'Pesan otomatis terformat indah dengan emoji Islami, rincian kas, dan nama DKM.',
        'Tekan tombol "Buka & Kirim di WhatsApp" untuk langsung memilih grup WhatsApp jamaah atau kontak DKM.',
      ],
    },
    {
      id: 'backup-restore',
      title: 'Cara Backup & Restore Database',
      icon: Database,
      color: 'text-indigo-600 bg-indigo-50',
      steps: [
        'Buka menu "Backup & Restore".',
        'Untuk membuat cadangan: Tekan "Backup Database Lengkap (.JSON)" atau "Backup Data Excel (.XLSX)". Simpan file yang terunduh di tempat yang aman (Google Drive atau flashdisk).',
        'Untuk memulihkan data: Tekan tombol Restore lalu pilih file backup JSON yang Anda miliki.',
        'Sistem otomatis membuat cadangan darurat (Safety Backup) sebelum menimpa data untuk menjamin keamanan.',
      ],
    },
  ];

  const faqs = [
    {
      q: 'Apakah aplikasi ini memerlukan koneksi internet untuk digunakan?',
      a: 'Tidak. Aplikasi Kas Masjid dirancang dengan arsitektur Progressive Web App (PWA) dan teknologi database lokal browser (IndexedDB). Anda dapat mencatat pemasukan, pengeluaran, dan mencetak laporan kapan saja tanpa memerlukan koneksi internet.',
    },
    {
      q: 'Apakah data saya aman dan tidak akan hilang jika browser ditutup?',
      a: 'Ya, data tersimpan secara permanen pada memori perangkat browser Anda. Namun demikian, kami sangat menyarankan pengurus untuk rutin mengunduh Backup JSON atau Excel setiap pekan melalui menu Backup & Restore agar memiliki arsip di Google Drive atau flashdisk.',
    },
    {
      q: 'Apakah database pada awal penggunaan benar-benar bersih tanpa dummy data?',
      a: 'Ya, sesuai standar integritas aplikasi, seluruh database awal dalam kondisi kosong tanpa data contoh atau transaksi tiruan. Pengurus dapat mulai menginput data riil dari masjid masing-masing.',
    },
    {
      q: 'Bagaimana cara mengganti nama masjid, logo, dan nama ketua DKM?',
      a: 'Buka menu "Pengaturan" di navigasi atas atau samping. Isi nama masjid, alamat, nomor telepon, logo masjid, serta nama Ketua DKM dan Bendahara. Data tersebut akan otomatis tampil di setiap laporan PDF dan kuitansi.',
    },
    {
      q: 'Bisakah aplikasi ini diinstall di HP pengurus lainnya?',
      a: 'Bisa. Buka alamat web aplikasi di HP pengurus yang lain, lalu tekan "Install di HP". Anda juga dapat membagikan file backup JSON dari HP utama agar data kas di HP pengurus lain sinkron.',
    },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Panduan Lengkap Kas Masjid</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Petunjuk operasional lengkap, cara kerja fitur, instalasi Android PWA, dan tanya jawab umum.
          </p>
        </div>

        {!isInstalled && isInstallable && (
          <button
            onClick={install}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Pasang di Android Sekarang</span>
          </button>
        )}
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((g) => {
          const Icon = g.icon;
          return (
            <div
              key={g.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${g.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-900 text-sm">{g.title}</h2>
              </div>

              <ol className="space-y-2 text-xs text-slate-600 pl-4 list-decimal marker:text-emerald-700 marker:font-bold leading-relaxed">
                {g.steps.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-bold text-sm text-slate-900">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          <p className="text-xs text-slate-500">Jawaban seputar teknis, keamanan, dan penggunaan aplikasi</p>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="py-3">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-800 hover:text-emerald-800 transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                  )}
                </button>
                {isOpen && (
                  <div className="mt-2 text-xs text-slate-600 leading-relaxed pl-1">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Developer / Creator Card */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-2xl p-4 text-white shadow-sm flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            Pengembang Aplikasi
          </span>
          <h3 className="text-sm font-bold text-white mt-0.5">
            Created by Jamhur
          </h3>
          <p className="text-[11px] text-emerald-200 mt-0.5">
            Bantuan teknis, saran, dan konsultasi aplikasi Kas Masjid
          </p>
        </div>

        <a
          href="https://wa.me/628179015181?text=Halo%20Jamhur,%20saya%20pengguna%20aplikasi%20Kas%20Masjid"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-sm transition flex-shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat WA</span>
        </a>
      </div>
    </div>
  );
};

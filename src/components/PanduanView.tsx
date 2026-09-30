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
  Cloud,
  FolderTree,
  KeyRound,
  Lock,
  Camera,
  Layers,
  Sparkles,
  Printer,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWA';

export const PanduanView: React.FC = () => {
  const { install, isInstallable, isInstalled } = usePWAInstall();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const guides = [
    {
      id: 'akun-cloud',
      title: '1. Pendaftaran Akun Cloud, Login & Lupa Password',
      icon: Cloud,
      color: 'text-sky-600 bg-sky-50',
      badge: 'Fitur Cloud Terbaru',
      steps: [
        'Tekan tombol "Masuk" di pojok kanan atas layar aplikasi.',
        'Untuk membuat akun masjid baru: Pilih tab "Daftar Baru", masukkan Nama Masjid, Nama Pengurus, Email, dan Kata Sandi (minimal 6 karakter). Atau gunakan tombol "Masuk Cepat dengan Akun Google (1-Klik)" yang langsung aktif tanpa perlu setting apapun.',
        'Sistem otomatis membuatkan database online tersendiri dan Kode Masjid unik (misal: MSJ-A1B2C3).',
        'Fitur Lupa Password: Jika Anda lupa kata sandi akun, pilih tab "Masuk" lalu klik tulisan "Lupa Kata Sandi?". Masukkan email Anda dan tekan "Kirim Link Reset Kata Sandi". Tautan untuk membuat sandi baru akan langsung dikirim ke email Anda.',
      ],
    },
    {
      id: 'multi-masjid',
      title: '2. Berbagi Akses Pengurus & Multi-Masjid',
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-50',
      badge: 'Kolaborasi DKM',
      steps: [
        'Setiap masjid memiliki "Kode Masjid" unik yang tertera di bar atas aplikasi setelah login.',
        'Ketua DKM atau Bendahara dapat membagikan Kode Masjid tersebut kepada pengurus lain (misal: Sekretaris atau Anggota DKM).',
        'Pengurus lain cukup membuka aplikasi di HP masing-masing, login, lalu pilih tab "Kode Masjid" dan masukkan kode tersebut.',
        'Semua pengurus yang terhubung akan melihat data kas yang sama secara real-time. Setiap kali ada pengurus yang mencatat transaksi, HP pengurus lainnya langsung terupdate otomatis!',
      ],
    },
    {
      id: 'kategori',
      title: '3. Master Kategori Kas (Mandiri & Terpisah Per Masjid)',
      icon: FolderTree,
      color: 'text-teal-600 bg-teal-50',
      badge: 'Data Aman Terisolasi',
      steps: [
        'Buka menu "Master Kategori" untuk mengelola pos-pos pemasukan dan pengeluaran masjid Anda.',
        'Pos kategori ini 100% terisolasi untuk akun masjid Anda dan tidak akan bercampur atau bertabrakan dengan masjid lain.',
        'Kategori tersimpan permanen di cloud server, sehingga saat Anda log out dan login kembali, seluruh kategori Anda tetap tersimpan utuh dan tidak hilang.',
        'Tekan tombol "Muat Kategori Standar" jika ingin mengisi otomatis dengan pos khas masjid seperti Kotak Amal Jumat, Infaq Tarawih, Zakat Maal, Wakaf, Honor Khatib, Listrik/PLN, Bisyarah Marbot, dll.',
        'Anda bebas menambah, mengedit nama, atau menghapus kategori sesuai kebutuhan khas masjid Anda.',
      ],
    },
    {
      id: 'pemasukan',
      title: '4. Pencatatan Pemasukan Kas (Foto Bersifat Opsional)',
      icon: ArrowDownLeft,
      color: 'text-emerald-600 bg-emerald-50',
      badge: 'Tanpa Foto Tetap Tersimpan',
      steps: [
        'Buka menu "Pemasukan" atau tekan tombol hijau "Catat Pemasukan".',
        'Pilih tanggal transaksi dan pos kategori pemasukan (misal: Kotak Amal Shalat Jumat, Donatur Tetap).',
        'Ketikkan sumber dana (nama donatur atau nama kotak infaq) dan uraian keterangan.',
        'Masukkan nominal rupiah yang diterima.',
        'Lampiran Foto bersifat OPSIONAL: Jika ada foto kuitansi atau bukti transfer, Anda dapat memotretnya. Jika TIDAK ADA FOTO, transaksi tetap 100% tersimpan aman di riwayat dan buku kas!',
        'Tekan "Simpan Transaksi". Anda langsung dapat mencetak Kuitansi Tanda Terima resmi PDF dengan menekan ikon printer.',
      ],
    },
    {
      id: 'pengeluaran',
      title: '5. Pencatatan Pengeluaran Kas (Bukti Nota Opsional)',
      icon: ArrowUpRight,
      color: 'text-rose-600 bg-rose-50',
      badge: 'Arsip Otomatis',
      steps: [
        'Buka menu "Pengeluaran" atau tekan tombol merah "Catat Pengeluaran".',
        'Pilih tanggal transaksi dan pos kategori biaya (misal: Operasional Listrik PLN, Bisyarah Marbot, Honor Khatib).',
        'Ketikkan rincian uraian keperluan pengeluaran kas.',
        'Masukkan nominal rupiah dan nama penanggung jawab / penerima dana.',
        'Lampiran Foto nota/bon bersifat OPSIONAL: Anda dapat memotret struk atau bon belanja jika ada. Jika tidak ada bukti foto, transaksi tetap tersimpan dengan sempurna di riwayat pembukuan.',
        'Tekan "Simpan Pengeluaran". Anda dapat mencetak Voucher Kas Keluar resmi PDF untuk arsip DKM.',
      ],
    },
    {
      id: 'buku-kas',
      title: '6. Buku Kas Umum & Ekspor Laporan Resmi (PDF & Excel)',
      icon: FileSpreadsheet,
      color: 'text-blue-600 bg-blue-50',
      badge: 'Otomatis Real-Time',
      steps: [
        'Buka menu "Buku Kas" untuk melihat mutasi kas secara kronologis beserta Saldo Awal, Total Masuk, Total Keluar, dan Saldo Berjalan.',
        'Gunakan tombol filter periode: Harian, Mingguan, Bulanan, Tahunan, atau Rentang Tanggal Kustom.',
        'Tekan tombol "Download PDF" untuk menghasilkan lembar laporan kas resmi lengkap dengan kop surat masjid, rincian mutasi, dan kolom tanda tangan Ketua DKM & Bendahara.',
        'Tekan tombol "Download Excel" untuk mengunduh arsip spreadsheet (.xlsx) yang siap diolah lebih lanjut.',
      ],
    },
    {
      id: 'whatsapp',
      title: '7. Kirim Laporan Kas ke WhatsApp Jamaah',
      icon: MessageCircle,
      color: 'text-emerald-700 bg-emerald-50',
      badge: 'Transparansi Jamaah',
      steps: [
        'Buka menu "Kirim WA" pada navigasi.',
        'Pilih model format: Ringkasan Saldo Terkini, Laporan Bulanan, atau Laporan Tahunan.',
        'Sistem otomatis menyusun pesan teks yang rapi dan sopan dengan emoji Islami, rincian penerimaan, pengeluaran, dan saldo kas masjid.',
        'Tekan tombol "Buka & Kirim di WhatsApp" untuk langsung membagikannya ke grup WhatsApp jamaah atau pengurus masjid.',
      ],
    },
    {
      id: 'install',
      title: '8. Pasang Aplikasi di HP Android & iPhone (PWA Offline)',
      icon: Smartphone,
      color: 'text-amber-600 bg-amber-50',
      badge: 'Bisa Tanpa Internet',
      steps: [
        'Buka link aplikasi di browser Google Chrome (Android) atau Safari (iPhone).',
        'Di Android: Tekan tombol "Install di HP" di bagian atas layar atau menu titik tiga browser lalu pilih "Tambahkan ke Layar Utama" (Install App).',
        'Di iPhone: Tekan ikon Bagikan (Share) di Safari, gulir ke bawah lalu pilih "Add to Home Screen".',
        'Aplikasi akan muncul di layar utama HP Anda seperti aplikasi Play Store, cepat dibuka, dan tetap dapat digunakan menginput data kas saat kuota habis atau offline!',
      ],
    },
  ];

  const faqs = [
    {
      q: 'Apakah pos kategori kas saya bisa tertukar dengan masjid lain?',
      a: 'Sama sekali tidak. Setiap akun masjid memiliki ruang penyimpanan kategori mandiri di cloud database Google Firestore. Kategori yang Anda tambahkan, ubah, atau hapus hanya berlaku untuk masjid Anda dan tidak akan pernah bertabrakan atau terlihat oleh masjid lain.',
    },
    {
      q: 'Kenapa sebelumnya saat input kategori lalu logout dan login datanya hilang?',
      a: 'Sebelumnya kategori kas hanya tersimpan di cache lokal browser. Sekarang sistem telah diperbarui dengan sinkronisasi Cloud Real-Time. Setiap kali Anda menambah atau mengedit kategori, data langsung tersimpan permanen di cloud server masjid Anda, sehingga kapan pun Anda log out dan login kembali, datanya tetap utuh 100%.',
    },
    {
      q: 'Apakah wajib melampirkan foto saat mencatat pemasukan atau pengeluaran?',
      a: 'Tidak wajib. Lampiran foto kuitansi atau nota bersifat opsional. Transaksi yang dicatat tanpa foto tetap 100% tersimpan aman di riwayat kas, buku kas umum, dan laporan resmi PDF/Excel.',
    },
    {
      q: 'Bagaimana jika saya lupa kata sandi akun pengurus?',
      a: 'Sangat mudah. Pada pop-up menu "Masuk", klik tombol "Lupa Kata Sandi?". Masukkan alamat email yang terdaftar dan klik "Kirim Link Reset Kata Sandi". Buka kotak masuk email Anda dan klik tautan untuk membuat kata sandi yang baru.',
    },
    {
      q: 'Bagaimana cara mengajak bendahara atau pengurus lain mengelola kas bersama?',
      a: 'Cukup beritahukan "Kode Masjid" Anda (contoh: MSJ-78912) kepada pengurus lain. Pengurus tersebut tinggal membuka aplikasi, login, lalu memasukkan kode tersebut pada tab "Kode Masjid". Otomatis HP mereka akan tersambung ke pembukuan kas masjid Anda.',
    },
    {
      q: 'Apakah aplikasi tetap bisa dipakai saat tidak ada koneksi internet (offline)?',
      a: 'Bisa. Aplikasi Kas Masjid dirancang dengan teknologi PWA dan penyimpanan lokal cerdas. Anda tetap dapat membuka aplikasi dan mencatat kas saat offline. Begitu perangkat Anda tersambung kembali ke internet, data kas akan otomatis disinkronkan ke server cloud Google Firestore.',
    },
    {
      q: 'Bagaimana cara mengganti nama masjid, alamat, logo, dan nama Ketua DKM?',
      a: 'Buka menu "Pengaturan" di bilah samping atau menu atas. Anda dapat mengubah nama masjid, alamat, nomor telepon, logo masjid, rekening bank, serta nama Ketua DKM dan Bendahara. Informasi ini otomatis tampil di kop surat laporan resmi PDF dan kuitansi.',
    },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Panduan Operasional Kas Masjid</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Panduan lengkap fitur cloud, multi-masjid, buku kas, kategori terisolasi, cetak laporan, dan tanya jawab.
          </p>
        </div>

        {!isInstalled && isInstallable && (
          <button
            onClick={install}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Pasang di HP Android</span>
          </button>
        )}
      </div>

      {/* Cloud & Realtime Highlight Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Sistem Cloud Google Firestore Aktif</h3>
            <p className="text-xs text-emerald-100">
              Kategori kas, riwayat transaksi (dengan/tanpa foto), dan profil masjid tersimpan aman di server online.
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 rounded-xl text-xs font-semibold self-start sm:self-auto border border-white/20">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
          <span>Status Sinkron Real-Time</span>
        </div>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {guides.map((g) => {
          const Icon = g.icon;
          return (
            <div
              key={g.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${g.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="font-bold text-slate-900 text-sm leading-snug">{g.title}</h2>
                  </div>
                  {g.badge && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex-shrink-0">
                      {g.badge}
                    </span>
                  )}
                </div>

                <ol className="space-y-2 text-xs text-slate-600 pl-4 list-decimal marker:text-emerald-700 marker:font-bold leading-relaxed pt-2">
                  {g.steps.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ol>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            <h2 className="font-bold text-sm text-slate-900">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Jawaban praktis seputar akun, kategori kas, bukti foto, dan keamanan data</p>
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
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      ?
                    </span>
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                  )}
                </button>
                {isOpen && (
                  <div className="mt-2 text-xs text-slate-600 leading-relaxed pl-7">
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

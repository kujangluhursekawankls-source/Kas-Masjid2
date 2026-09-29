# Aplikasi Pembukuan Kas Masjid Modern (Android PWA Ready)

Aplikasi pencatatan dan pelaporan keuangan kas masjid berbasis web progresif (PWA), dirancang khusus dengan antarmuka yang sangat nyaman diakses melalui smartphone Android, tablet, maupun komputer.

> **Pengembang**: Created by **Jamhur**  
> **Kontak WhatsApp**: [08179015181](https://wa.me/628179015181?text=Halo%20Jamhur,%20saya%20pengguna%20aplikasi%20Kas%20Masjid)

---

## 🌟 Fitur Utama

1. **Dashboard Metrik Keuangan Vertikal & Responsif**:
   - Saldo Kas Berjalan (Real-time).
   - Total Pemasukan & Pengeluaran Kas.
   - Ringkasan Surplus/Defisit Bulan Berjalan.
   - Tombol Aksi Cepat Sentuh (*Quick Action Thumb Buttons*).

2. **Buku Kas Umum (BKU)**:
   - Pencatatan mutasi kas masuk dan keluar secara kronologis.
   - Perhitungan saldo berjalan otomatis di setiap baris transaksi.
   - Filter fleksibel: Harian, Mingguan, Bulanan, Tahunan, Custom Tanggal, dan Semua.

3. **Manajemen Pemasukan (Infaq, Zakat, Sedekah, Kotak Amal)**:
   - Pencatatan per pos penerimaan kas masjid.
   - Filter pencarian nama/nomor dan rentang tanggal tanpa terpotong.
   - **Cetak Kuitansi Tanda Terima Resmi (PDF)** lengkap dengan logo dan tanda tangan.

4. **Manajemen Pengeluaran (Operasional, Kebersihan, Honor, Renovasi)**:
   - Form pencatatan lengkap dengan penanggung jawab (PJ).
   - Lampiran foto bukti nota / struk belanja.
   - **Cetak Voucher Kas Keluar Resmi (PDF)**.

5. **Ekspor Laporan Resmi (100% Berfungsi)**:
   - **Unduh PDF Resmi**: Lengkap dengan Kop Surat Masjid, logo, tabel bergaris rapi, total nominal terbilang, tanggal cetak, dan tanda tangan Ketua DKM & Bendahara.
   - **Unduh Excel (.XLSX)**: Format lembar kerja siap pakai untuk arsip administrasi.
   - **Format Teks WhatsApp**: Pembuat rekapitulasi mutasi kas otomatis untuk dibagikan ke grup WhatsApp jamaah masjid.

6. **PWA & Offline Capability**:
   - Dapat diinstal langsung di layar utama (*Homescreen*) smartphone Android seperti aplikasi Play Store.
   - Tetap dapat digunakan saat jaringan internet masjid terputus (*Offline First* dengan IndexedDB/LocalStorage).

7. **Keamanan & Backup Data**:
   - Backup seluruh data kas, pengurus, dan kategori ke dalam format file `.JSON`.
   - Restore / pemulihan data instan kapan saja tanpa khawatir data hilang.

---

## 🚀 Panduan Menjalankan di Komputer Lokal

### Prasyarat:
- Pastikan telah menginstal [Node.js](https://nodejs.org) (versi 18 ke atas) dan `npm`.

### Langkah-langkah:
1. **Clone repositori ini**:
   ```bash
   git clone https://github.com/USERNAME_ANDA/NAMA_REPOSITORI.git
   cd NAMA_REPOSITORI
   ```

2. **Instal seluruh dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Buka peramban Anda di `http://localhost:3000` (atau port yang ditampilkan di terminal).

4. **Build untuk Produksi**:
   ```bash
   npm run build
   ```
   Folder `dist` siap diunggah ke hosting mana pun (Vercel, Netlify, Cloudflare Pages, Firebase Hosting, atau cPanel).

---

## 📱 Panduan Deploy Gratis ke Vercel / Netlify
1. Hubungkan akun GitHub Anda ke [Vercel](https://vercel.com) atau [Netlify](https://netlify.com).
2. Pilih repositori kas masjid ini.
3. Gunakan pengaturan build default:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Klik **Deploy**. Website kas masjid Anda langsung aktif dan dapat diakses publik dengan tautan HTTPS gratis!

---

## 👨‍💻 Pengembang
- **Nama**: Jamhur
- **Nomor WhatsApp**: [08179015181](https://wa.me/628179015181?text=Halo%20Jamhur,%20saya%20pengguna%20aplikasi%20Kas%20Masjid)
- **Lisensi**: MIT License (Bebas digunakan dan dikembangkan untuk kemakmuran masjid).

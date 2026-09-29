import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  BukuKasItem,
  TransaksiPemasukan,
  TransaksiPengeluaran,
  PengaturanMasjid,
  Pengurus,
} from '../types';
import { formatRupiah, formatTanggalIndo } from './db';

// Helper to safely execute autoTable regardless of ESM / CJS bundler format
export function renderAutoTable(doc: jsPDF, options: any) {
  if (typeof (doc as any).autoTable === 'function') {
    (doc as any).autoTable(options);
  } else if (typeof autoTable === 'function') {
    autoTable(doc, options);
  } else if (typeof (autoTable as any)?.default === 'function') {
    (autoTable as any).default(doc, options);
  }
}

export function exportBukuKasPDF(
  items: BukuKasItem[],
  pengaturan: PengaturanMasjid,
  periodeJudul: string,
  saldoAwal: number,
  totalMasuk: number,
  totalKeluar: number,
  saldoAkhir: number
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header / Kop Masjid
  doc.setFillColor(6, 95, 70); // #065f46
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent bar under header
  doc.setFillColor(217, 119, 6); // amber-600
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  // Embed Mosque Logo if available
  if (pengaturan.logoMasjid && pengaturan.logoMasjid.startsWith('data:image')) {
    try {
      const format = pengaturan.logoMasjid.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(pengaturan.logoMasjid, format, 14, 4, 20, 20);
    } catch (e) {
      console.warn('Failed to embed logo in PDF', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text((pengaturan.namaMasjid || 'KAS MASJID').toUpperCase(), pageWidth / 2, 11, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(220, 252, 231);
  const alamatText = [pengaturan.alamat, pengaturan.telepon ? `Telp: ${pengaturan.telepon}` : '']
    .filter(Boolean)
    .join(' | ');
  doc.text(alamatText || 'Laporan Pembukuan Kas Keuangan', pageWidth / 2, 18, { align: 'center' });

  // Title
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('BUKU KAS UMUM MASJID', pageWidth / 2, 38, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Periode: ${periodeJudul}`, pageWidth / 2, 44, { align: 'center' });

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 48, pageWidth - 28, 20, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Saldo Awal:', 20, 56);
  doc.text('Total Masuk:', 65, 56);
  doc.text('Total Keluar:', 115, 56);
  doc.text('Saldo Akhir:', 160, 56);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatRupiah(saldoAwal), 20, 62);
  doc.setTextColor(5, 150, 105);
  doc.text(`+ ${formatRupiah(totalMasuk)}`, 65, 62);
  doc.setTextColor(220, 38, 38);
  doc.text(`- ${formatRupiah(totalKeluar)}`, 115, 62);
  doc.setTextColor(6, 95, 70);
  doc.text(formatRupiah(saldoAkhir), 160, 62);

  // Table Data
  const tableRows = items.map((item, idx) => [
    idx + 1,
    formatTanggalIndo(item.tanggal),
    item.nomorTransaksi,
    item.kategori,
    item.uraian,
    item.pemasukan > 0 ? formatRupiah(item.pemasukan) : '-',
    item.pengeluaran > 0 ? formatRupiah(item.pengeluaran) : '-',
    formatRupiah(item.saldoBerjalan),
  ]);

  renderAutoTable(doc, {
    startY: 72,
    head: [['No', 'Tanggal', 'No. Transaksi', 'Kategori', 'Uraian', 'Pemasukan', 'Pengeluaran', 'Saldo']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 95, 70],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 24 },
      2: { cellWidth: 26 },
      3: { cellWidth: 24 },
      4: { cellWidth: 'auto' },
      5: { halign: 'right', cellWidth: 24, textColor: [5, 150, 105] },
      6: { halign: 'right', cellWidth: 24, textColor: [220, 38, 38] },
      7: { halign: 'right', cellWidth: 25, fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
    foot: [
      [
        '',
        '',
        '',
        '',
        'TOTAL',
        formatRupiah(totalMasuk),
        formatRupiah(totalKeluar),
        formatRupiah(saldoAkhir),
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'right',
    },
  });

  // Tanda Tangan
  const finalY = ((doc as any).lastAutoTable?.finalY ?? 180) + 14;
  const ttdY = finalY > 240 ? 20 : finalY;
  if (finalY > 240) doc.addPage();

  const printDate = formatTanggalIndo(new Date().toISOString().split('T')[0]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Dicetak pada: ${printDate}`, 14, ttdY);

  // Ketua DKM
  doc.text('Mengetahui,', 30, ttdY + 8);
  doc.text('Ketua DKM / Pengurus', 30, ttdY + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`( ${pengaturan.namaKetua || '..........................'} )`, 30, ttdY + 35);

  // Bendahara
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Bendahara Kas,', pageWidth - 70, ttdY + 8);
  doc.text('Penanggung Jawab Keuangan', pageWidth - 70, ttdY + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`( ${pengaturan.namaBendahara || '..........................'} )`, pageWidth - 70, ttdY + 35);

  doc.save(`Buku_Kas_${pengaturan.namaMasjid.replace(/\s+/g, '_') || 'Masjid'}_${Date.now()}.pdf`);
}

export function exportKuitansiPemasukanPDF(
  item: TransaksiPemasukan,
  pengaturan: PengaturanMasjid
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Border frame
  doc.setDrawColor(6, 95, 70);
  doc.setLineWidth(1);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Header band
  doc.setFillColor(6, 95, 70);
  doc.rect(8, 8, pageWidth - 16, 22, 'F');

  // Embed Mosque Logo if available
  let textStartX = 14;
  if (pengaturan.logoMasjid && pengaturan.logoMasjid.startsWith('data:image')) {
    try {
      const format = pengaturan.logoMasjid.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(pengaturan.logoMasjid, format, 12, 9, 18, 18);
      textStartX = 34;
    } catch (e) {
      console.warn('Failed to embed logo in receipt', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text((pengaturan.namaMasjid || 'KAS MASJID').toUpperCase(), textStartX, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(220, 252, 231);
  doc.text(pengaturan.alamat || 'Alamat Masjid', textStartX, 23);

  // Right Header badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('BUKTI PENERIMAAN KAS / INFAQ', pageWidth - 14, 16, { align: 'right' });
  doc.setFontSize(9);
  doc.text(item.nomorTransaksi, pageWidth - 14, 23, { align: 'right' });

  // Fields
  let y = 40;
  const leftX = 16;
  const colX = 54;

  const addRow = (label: string, value: string, isBold = false) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(label, leftX, y);
    doc.text(':', colX - 4, y);

    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value || '-', colX, y);
    y += 8;
  };

  addRow('Tanggal Transaksi', formatTanggalIndo(item.tanggal));
  addRow('Telah Terima Dari', item.sumberDana || 'Hamba Allah');
  addRow('Kategori Kas', item.kategoriNama);
  addRow('Uraian / Keterangan', item.uraian);
  
  // Nominal Highlight Box
  y += 4;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(leftX, y - 5, pageWidth - 32, 14, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(6, 95, 70);
  doc.text(`JUMLAH: ${formatRupiah(item.nominal)}`, leftX + 4, y + 4);

  // Signatures
  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Penyetor / Donatur,', 30, y);
  doc.text('Petugas Penerima,', pageWidth - 60, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`( ${item.sumberDana || 'Donatur'} )`, 30, y + 20);
  doc.text(`( ${item.namaPetugas || pengaturan.namaBendahara || 'Petugas'} )`, pageWidth - 60, y + 20);

  doc.save(`Kuitansi_${item.nomorTransaksi}.pdf`);
}

export function exportVoucherPengeluaranPDF(
  item: TransaksiPengeluaran,
  pengaturan: PengaturanMasjid
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Border frame
  doc.setDrawColor(185, 28, 28);
  doc.setLineWidth(1);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Header band
  doc.setFillColor(185, 28, 28);
  doc.rect(8, 8, pageWidth - 16, 22, 'F');

  // Embed Mosque Logo if available
  let textStartX = 14;
  if (pengaturan.logoMasjid && pengaturan.logoMasjid.startsWith('data:image')) {
    try {
      const format = pengaturan.logoMasjid.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(pengaturan.logoMasjid, format, 12, 9, 18, 18);
      textStartX = 34;
    } catch (e) {
      console.warn('Failed to embed logo in voucher', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text((pengaturan.namaMasjid || 'KAS MASJID').toUpperCase(), textStartX, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(254, 226, 226);
  doc.text(pengaturan.alamat || 'Alamat Masjid', textStartX, 23);

  // Right Header badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('VOUCHER KAS KELUAR', pageWidth - 14, 16, { align: 'right' });
  doc.setFontSize(9);
  doc.text(item.nomorTransaksi, pageWidth - 14, 23, { align: 'right' });

  // Fields
  let y = 40;
  const leftX = 16;
  const colX = 54;

  const addRow = (label: string, value: string, isBold = false) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(label, leftX, y);
    doc.text(':', colX - 4, y);

    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value || '-', colX, y);
    y += 8;
  };

  addRow('Tanggal Transaksi', formatTanggalIndo(item.tanggal));
  addRow('Penanggung Jawab', item.namaPenanggungJawab);
  addRow('Kategori Biaya', item.kategoriNama);
  addRow('Keperluan / Uraian', item.uraian);

  // Nominal Box
  y += 4;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(leftX, y - 5, pageWidth - 32, 14, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(185, 28, 28);
  doc.text(`NOMINAL DIBAYARKAN: ${formatRupiah(item.nominal)}`, leftX + 4, y + 4);

  // Signatures
  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Penerima / Pelaksana,', 30, y);
  doc.text('Bendahara Kas,', pageWidth - 60, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`( ${item.namaPenanggungJawab || 'Pelaksana'} )`, 30, y + 20);
  doc.text(`( ${pengaturan.namaBendahara || 'Bendahara'} )`, pageWidth - 60, y + 20);

  doc.save(`Voucher_${item.nomorTransaksi}.pdf`);
}

export function exportBukuKasExcel(
  items: BukuKasItem[],
  pengaturan: PengaturanMasjid,
  saldoAwal: number,
  totalMasuk: number,
  totalKeluar: number,
  saldoAkhir: number
) {
  const wb = XLSX.utils.book_new();

  const data = [
    [pengaturan.namaMasjid || 'KAS MASJID'],
    ['LAPORAN BUKU KAS UMUM'],
    [pengaturan.alamat || ''],
    [''],
    ['Ringkasan Kas:'],
    ['Saldo Awal', saldoAwal],
    ['Total Pemasukan', totalMasuk],
    ['Total Pengeluaran', totalKeluar],
    ['Saldo Akhir', saldoAkhir],
    [''],
    ['No', 'Tanggal', 'No Transaksi', 'Jenis', 'Kategori', 'Uraian', 'Pemasukan (Rp)', 'Pengeluaran (Rp)', 'Saldo (Rp)', 'Petugas / PJ'],
    ...items.map((item, idx) => [
      idx + 1,
      item.tanggal,
      item.nomorTransaksi,
      item.jenis.toUpperCase(),
      item.kategori,
      item.uraian,
      item.pemasukan,
      item.pengeluaran,
      item.saldoBerjalan,
      item.petugas,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Buku Kas');
  XLSX.writeFile(wb, `Buku_Kas_${Date.now()}.xlsx`);
}

export function exportPemasukanExcel(
  items: TransaksiPemasukan[],
  pengaturan: PengaturanMasjid
) {
  const wb = XLSX.utils.book_new();
  const data = [
    [pengaturan.namaMasjid || 'KAS MASJID'],
    ['LAPORAN TRANSAKSI PEMASUKAN KAS'],
    [''],
    ['No', 'Tanggal', 'No Transaksi', 'Kategori', 'Sumber Dana', 'Uraian', 'Nominal (Rp)', 'Petugas Penerima'],
    ...items.map((item, idx) => [
      idx + 1,
      item.tanggal,
      item.nomorTransaksi,
      item.kategoriNama,
      item.sumberDana,
      item.uraian,
      item.nominal,
      item.namaPetugas,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Pemasukan');
  XLSX.writeFile(wb, `Laporan_Pemasukan_${Date.now()}.xlsx`);
}

export function exportPengeluaranExcel(
  items: TransaksiPengeluaran[],
  pengaturan: PengaturanMasjid
) {
  const wb = XLSX.utils.book_new();
  const data = [
    [pengaturan.namaMasjid || 'KAS MASJID'],
    ['LAPORAN TRANSAKSI PENGELUARAN KAS'],
    [''],
    ['No', 'Tanggal', 'No Transaksi', 'Kategori', 'Uraian', 'Nominal (Rp)', 'Penanggung Jawab'],
    ...items.map((item, idx) => [
      idx + 1,
      item.tanggal,
      item.nomorTransaksi,
      item.kategoriNama,
      item.uraian,
      item.nominal,
      item.namaPenanggungJawab,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Pengeluaran');
  XLSX.writeFile(wb, `Laporan_Pengeluaran_${Date.now()}.xlsx`);
}

export function exportMasterDataExcel(
  pengurus: Pengurus[],
  pemasukan: TransaksiPemasukan[],
  pengeluaran: TransaksiPengeluaran[],
  pengaturan: PengaturanMasjid
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Pengurus
  const dataPengurus = [
    ['DAFTAR PENGURUS MASJID'],
    ['No', 'Nama', 'Jabatan', 'No Telepon', 'Alamat', 'Status Aktif'],
    ...pengurus.map((p, i) => [i + 1, p.nama, p.jabatan, p.telepon, p.alamat, p.statusAktif ? 'Aktif' : 'Non-Aktif']),
  ];
  const wsPengurus = XLSX.utils.aoa_to_sheet(dataPengurus);
  XLSX.utils.book_append_sheet(wb, wsPengurus, 'Pengurus');

  // Sheet 2: Pemasukan
  const dataIn = [
    ['No', 'Tanggal', 'No Transaksi', 'Kategori', 'Sumber Dana', 'Uraian', 'Nominal (Rp)', 'Petugas'],
    ...pemasukan.map((item, idx) => [idx + 1, item.tanggal, item.nomorTransaksi, item.kategoriNama, item.sumberDana, item.uraian, item.nominal, item.namaPetugas]),
  ];
  const wsIn = XLSX.utils.aoa_to_sheet(dataIn);
  XLSX.utils.book_append_sheet(wb, wsIn, 'Pemasukan');

  // Sheet 3: Pengeluaran
  const dataOut = [
    ['No', 'Tanggal', 'No Transaksi', 'Kategori', 'Uraian', 'Nominal (Rp)', 'Penanggung Jawab'],
    ...pengeluaran.map((item, idx) => [idx + 1, item.tanggal, item.nomorTransaksi, item.kategoriNama, item.uraian, item.nominal, item.namaPenanggungJawab]),
  ];
  const wsOut = XLSX.utils.aoa_to_sheet(dataOut);
  XLSX.utils.book_append_sheet(wb, wsOut, 'Pengeluaran');

  XLSX.writeFile(wb, `Backup_Excel_KasMasjid_${Date.now()}.xlsx`);
}

// --- WhatsApp Message Generator ---
export function createWhatsAppSummaryMessage(
  pengaturan: PengaturanMasjid,
  saldoSaatIni: number,
  totalMasuk: number,
  totalKeluar: number,
  jumlahTransaksi: number,
  periode = 'Saat Ini'
): string {
  const masjid = pengaturan.namaMasjid || 'Masjid / Mushola';
  const tgl = formatTanggalIndo(new Date().toISOString().split('T')[0]);

  return `*LAPORAN KAS & KEUANGAN*
🕌 *${masjid.toUpperCase()}*
📅 Per Tanggal: ${tgl}
📌 Periode: ${periode}
──────────────────────
💰 *Saldo Kas Saat Ini:*
👉 *${formatRupiah(saldoSaatIni)}*

📈 *Total Pemasukan:* ${formatRupiah(totalMasuk)}
📉 *Total Pengeluaran:* ${formatRupiah(totalKeluar)}
📊 *Jumlah Transaksi:* ${jumlahTransaksi} transaksi
──────────────────────
Jazakumullah Khairan Katsiran kepada seluruh jamaah, donatur, dan dermawan yang telah menginfaqkan hartanya di jalan Allah Subhanahu Wa Ta'ala. Semoga Allah melipatgandakan pahala dan rezeki yang berkah. Aamiin.

Mengetahui:
👤 Ketua DKM: *${pengaturan.namaKetua || '-'}*
👤 Bendahara: *${pengaturan.namaBendahara || '-'}*

_Dihasilkan otomatis oleh Aplikasi Kas Masjid Android PWA_`;
}

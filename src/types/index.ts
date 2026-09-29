export interface Pengurus {
  id: string;
  nama: string;
  jabatan: string;
  telepon: string;
  alamat: string;
  statusAktif: boolean;
  createdAt: string;
}

export interface KategoriPemasukan {
  id: string;
  nama: string;
  keterangan: string;
  createdAt: string;
}

export interface KategoriPengeluaran {
  id: string;
  nama: string;
  keterangan: string;
  createdAt: string;
}

export interface TransaksiPemasukan {
  id: string;
  nomorTransaksi: string;
  tanggal: string; // YYYY-MM-DD
  kategoriId: string;
  kategoriNama: string;
  sumberDana: string;
  uraian: string;
  nominal: number;
  namaPetugas: string;
  lampiranFoto?: string; // base64 data URI
  createdAt: string;
  updatedAt?: string;
}

export interface TransaksiPengeluaran {
  id: string;
  nomorTransaksi: string;
  tanggal: string; // YYYY-MM-DD
  kategoriId: string;
  kategoriNama: string;
  uraian: string;
  nominal: number;
  namaPenanggungJawab: string;
  lampiranFoto?: string; // base64 data URI
  createdAt: string;
  updatedAt?: string;
}

export interface PengaturanMasjid {
  namaMasjid: string;
  logoMasjid?: string;
  fotoMasjid?: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  namaKetua: string;
  namaBendahara: string;
  rekeningBank?: string;
  namaBank?: string;
  atasNamaRekening?: string;
}

export interface BukuKasItem {
  id: string;
  tanggal: string;
  nomorTransaksi: string;
  jenis: 'pemasukan' | 'pengeluaran';
  kategori: string;
  uraian: string;
  pemasukan: number;
  pengeluaran: number;
  saldoBerjalan: number;
  petugas: string;
  lampiranFoto?: string;
}

export interface BackupData {
  version: string;
  appName: string;
  exportedAt: string;
  pengaturan: PengaturanMasjid;
  pengurus: Pengurus[];
  kategoriPemasukan: KategoriPemasukan[];
  kategoriPengeluaran: KategoriPengeluaran[];
  pemasukan: TransaksiPemasukan[];
  pengeluaran: TransaksiPengeluaran[];
}

export type ActiveTab = 
  | 'dashboard'
  | 'buku-kas'
  | 'pemasukan'
  | 'pengeluaran'
  | 'master-pengurus'
  | 'master-kategori'
  | 'laporan'
  | 'whatsapp'
  | 'backup'
  | 'pengaturan'
  | 'panduan';

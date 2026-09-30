import {
  Pengurus,
  KategoriPemasukan,
  KategoriPengeluaran,
  TransaksiPemasukan,
  TransaksiPengeluaran,
  PengaturanMasjid,
  BackupData,
} from '../types';

const DB_NAME = 'KasMasjidDB';
const DB_VERSION = 1;

export const DEFAULT_PENGATURAN: PengaturanMasjid = {
  namaMasjid: '',
  logoMasjid: '',
  fotoMasjid: '',
  alamat: '',
  telepon: '',
  email: '',
  website: '',
  namaKetua: '',
  namaBendahara: '',
  rekeningBank: '',
  namaBank: '',
  atasNamaRekening: '',
};

export const DEFAULT_KATEGORI_PEMASUKAN: KategoriPemasukan[] = [
  { id: 'kat_in_1', nama: 'Kotak Amal Shalat Jumat', keterangan: 'Infaq dari kotak tromol / keliling shalat Jumat', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'kat_in_2', nama: 'Kotak Amal Harian / Tromol', keterangan: 'Kotak infaq tetap di dalam ruang masjid', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'kat_in_3', nama: 'Infaq Tarawih & Ramadhan', keterangan: 'Penerimaan khusus bulan suci Ramadhan', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'kat_in_4', nama: 'Zakat Maal & Zakat Fitrah', keterangan: 'Penerimaan zakat titipan jamaah', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'kat_in_5', nama: 'Wakaf Pembangunan Masjid', keterangan: 'Donasi perluasan atau renovasi fisik', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'kat_in_6', nama: 'Donatur Tetap / Bulanan', keterangan: 'Sumbangan rutin dari donatur terdaftar', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'kat_in_7', nama: 'Infaq Anak Yatim & Dhuafa', keterangan: 'Dana titipan santunan sosial', createdAt: '2025-01-01T00:00:00.000Z' },
];

export const DEFAULT_KATEGORI_PENGELUARAN: KategoriPengeluaran[] = [
  { id: 'kat_out_1', nama: 'Operasional Listrik & PLN', keterangan: 'Tagihan listrik dan token masjid', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'kat_out_2', nama: 'Operasional Air & PDAM', keterangan: 'Tagihan air tempat wudhu dan toilet', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'kat_out_3', nama: 'Honor Khatib & Ustadz', keterangan: 'Bisyarah khatib Jumat dan penceramah kajian', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'kat_out_4', nama: 'Bisyarah Marbot & Kebersihan', keterangan: 'Uang lelah penjaga dan kebersihan masjid', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'kat_out_5', nama: 'Perbaikan & Renovasi', keterangan: 'Biaya pemeliharaan AC, sound system, cat, atap', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'kat_out_6', nama: 'Santunan Yatim & Kaum Dhuafa', keterangan: 'Penyaluran bantuan sosial', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'kat_out_7', nama: 'Konsumsi Pengajian & Takjil', keterangan: 'Snack kajian, buka puasa bersama, rapat', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'kat_out_8', nama: 'Perlengkapan & Kebersihan', keterangan: 'Sapu, pel, sabun cuci tangan, karbol, tisu', createdAt: '2025-01-01T00:00:00.000Z' },
];

class DatabaseService {
  private db: IDBDatabase | null = null;
  private isReadyPromise: Promise<void>;

  constructor() {
    this.isReadyPromise = this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('pemasukan')) {
          db.createObjectStore('pemasukan', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pengeluaran')) {
          db.createObjectStore('pengeluaran', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pengurus')) {
          db.createObjectStore('pengurus', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('kategoriPemasukan')) {
          db.createObjectStore('kategoriPemasukan', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('kategoriPengeluaran')) {
          db.createObjectStore('kategoriPengeluaran', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pengaturan')) {
          db.createObjectStore('pengaturan', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = (error) => {
        console.warn('IndexedDB failed to open, falling back to localStorage', error);
        resolve();
      };
    });
  }

  public async isReady() {
    await this.isReadyPromise;
  }

  // --- Generic IDB Methods with localStorage fallback ---

  private async getAllFromStore<T>(storeName: string): Promise<T[]> {
    await this.isReady();
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const transaction = this.db!.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.getAll();
          request.onsuccess = () => resolve((request.result as T[]) || []);
          request.onerror = () => resolve(this.getFromLocalStorage<T[]>(storeName, []));
        } catch {
          resolve(this.getFromLocalStorage<T[]>(storeName, []));
        }
      });
    }
    return this.getFromLocalStorage<T[]>(storeName, []);
  }

  private async saveAllToStore<T extends { id: string }>(storeName: string, items: T[]): Promise<void> {
    await this.isReady();
    this.saveToLocalStorage(storeName, items);

    if (this.db) {
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db!.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          store.clear();
          for (const item of items) {
            store.put(item);
          }
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        } catch (err) {
          console.warn('IDB write failed, using local storage fallback', err);
          resolve();
        }
      });
    }
  }

  private getFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(`km_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private saveToLocalStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`km_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  public async clearAllLocalData(): Promise<void> {
    await this.isReady();
    if (this.db) {
      const storeNames = ['pemasukan', 'pengeluaran', 'pengurus', 'kategoriPemasukan', 'kategoriPengeluaran', 'pengaturan'];
      try {
        const tx = this.db.transaction(storeNames, 'readwrite');
        for (const s of storeNames) {
          if (this.db.objectStoreNames.contains(s)) {
            tx.objectStore(s).clear();
          }
        }
      } catch (e) {
        console.warn('IDB clear error:', e);
      }
    }
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('km_') || k.startsWith('kategori'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('LocalStorage clear error:', e);
    }
  }

  // --- Pemasukan ---
  public async getPemasukan(): Promise<TransaksiPemasukan[]> {
    return this.getAllFromStore<TransaksiPemasukan>('pemasukan');
  }

  public async savePemasukan(items: TransaksiPemasukan[]): Promise<void> {
    await this.saveAllToStore('pemasukan', items);
  }

  // --- Pengeluaran ---
  public async getPengeluaran(): Promise<TransaksiPengeluaran[]> {
    return this.getAllFromStore<TransaksiPengeluaran>('pengeluaran');
  }

  public async savePengeluaran(items: TransaksiPengeluaran[]): Promise<void> {
    await this.saveAllToStore('pengeluaran', items);
  }

  // --- Pengurus ---
  public async getPengurus(): Promise<Pengurus[]> {
    return this.getAllFromStore<Pengurus>('pengurus');
  }

  public async savePengurus(items: Pengurus[]): Promise<void> {
    await this.saveAllToStore('pengurus', items);
  }

  // --- Kategori Pemasukan ---
  public async getKategoriPemasukan(masjidId?: string): Promise<KategoriPemasukan[]> {
    const storeKey = masjidId ? `kategoriPemasukan_${masjidId}` : 'kategoriPemasukan';
    const local = this.getFromLocalStorage<KategoriPemasukan[]>(storeKey, []);
    if (local && local.length > 0) return local;

    const fromIdb = await this.getAllFromStore<KategoriPemasukan>('kategoriPemasukan');
    if (fromIdb && fromIdb.length > 0) return fromIdb;

    return DEFAULT_KATEGORI_PEMASUKAN;
  }

  public async saveKategoriPemasukan(items: KategoriPemasukan[], masjidId?: string): Promise<void> {
    const storeKey = masjidId ? `kategoriPemasukan_${masjidId}` : 'kategoriPemasukan';
    this.saveToLocalStorage(storeKey, items);
    await this.saveAllToStore('kategoriPemasukan', items);
  }

  // --- Kategori Pengeluaran ---
  public async getKategoriPengeluaran(masjidId?: string): Promise<KategoriPengeluaran[]> {
    const storeKey = masjidId ? `kategoriPengeluaran_${masjidId}` : 'kategoriPengeluaran';
    const local = this.getFromLocalStorage<KategoriPengeluaran[]>(storeKey, []);
    if (local && local.length > 0) return local;

    const fromIdb = await this.getAllFromStore<KategoriPengeluaran>('kategoriPengeluaran');
    if (fromIdb && fromIdb.length > 0) return fromIdb;

    return DEFAULT_KATEGORI_PENGELUARAN;
  }

  public async saveKategoriPengeluaran(items: KategoriPengeluaran[], masjidId?: string): Promise<void> {
    const storeKey = masjidId ? `kategoriPengeluaran_${masjidId}` : 'kategoriPengeluaran';
    this.saveToLocalStorage(storeKey, items);
    await this.saveAllToStore('kategoriPengeluaran', items);
  }

  // --- Pengaturan ---
  public async getPengaturan(): Promise<PengaturanMasjid> {
    await this.isReady();
    if (this.db) {
      try {
        const item = await new Promise<{ key: string; data: PengaturanMasjid } | undefined>((resolve) => {
          const transaction = this.db!.transaction('pengaturan', 'readonly');
          const store = transaction.objectStore('pengaturan');
          const req = store.get('config');
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(undefined);
        });
        if (item && item.data) {
          return { ...DEFAULT_PENGATURAN, ...item.data };
        }
      } catch {
        // fallback
      }
    }
    const local = this.getFromLocalStorage<PengaturanMasjid>('pengaturan', DEFAULT_PENGATURAN);
    return { ...DEFAULT_PENGATURAN, ...local };
  }

  public async savePengaturan(data: PengaturanMasjid): Promise<void> {
    await this.isReady();
    this.saveToLocalStorage('pengaturan', data);
    if (this.db) {
      try {
        const transaction = this.db.transaction('pengaturan', 'readwrite');
        const store = transaction.objectStore('pengaturan');
        store.put({ key: 'config', data });
      } catch (e) {
        console.warn('Failed to save settings to IDB:', e);
      }
    }
  }

  // --- Backup & Restore ---
  public async exportFullBackup(): Promise<BackupData> {
    const [
      pemasukan,
      pengeluaran,
      pengurus,
      kategoriPemasukan,
      kategoriPengeluaran,
      pengaturan,
    ] = await Promise.all([
      this.getPemasukan(),
      this.getPengeluaran(),
      this.getPengurus(),
      this.getKategoriPemasukan(),
      this.getKategoriPengeluaran(),
      this.getPengaturan(),
    ]);

    return {
      version: '1.0.0',
      appName: 'Kas Masjid PWA',
      exportedAt: new Date().toISOString(),
      pengaturan,
      pengurus,
      kategoriPemasukan,
      kategoriPengeluaran,
      pemasukan,
      pengeluaran,
    };
  }

  public async importFullBackup(data: BackupData): Promise<{ success: boolean; message: string }> {
    if (!data || typeof data !== 'object') {
      throw new Error('Format file tidak valid atau data kosong.');
    }

    // Auto-create safety backup before restoring
    try {
      const current = await this.exportFullBackup();
      this.saveToLocalStorage('safety_backup_before_restore', current);
    } catch {
      // ignore
    }

    const pemasukan = Array.isArray(data.pemasukan) ? data.pemasukan : [];
    const pengeluaran = Array.isArray(data.pengeluaran) ? data.pengeluaran : [];
    const pengurus = Array.isArray(data.pengurus) ? data.pengurus : [];
    const kategoriPemasukan = Array.isArray(data.kategoriPemasukan) ? data.kategoriPemasukan : [];
    const kategoriPengeluaran = Array.isArray(data.kategoriPengeluaran) ? data.kategoriPengeluaran : [];
    const pengaturan = data.pengaturan ? { ...DEFAULT_PENGATURAN, ...data.pengaturan } : DEFAULT_PENGATURAN;

    await Promise.all([
      this.savePemasukan(pemasukan),
      this.savePengeluaran(pengeluaran),
      this.savePengurus(pengurus),
      this.saveKategoriPemasukan(kategoriPemasukan),
      this.saveKategoriPengeluaran(kategoriPengeluaran),
      this.savePengaturan(pengaturan),
    ]);

    return {
      success: true,
      message: `Restore berhasil! ${pemasukan.length} pemasukan, ${pengeluaran.length} pengeluaran, ${pengurus.length} pengurus berhasil dipulihkan.`,
    };
  }

  public async clearAllData(): Promise<void> {
    await Promise.all([
      this.savePemasukan([]),
      this.savePengeluaran([]),
      this.savePengurus([]),
      this.saveKategoriPemasukan([]),
      this.saveKategoriPengeluaran([]),
      this.savePengaturan(DEFAULT_PENGATURAN),
    ]);
  }
}

export const dbService = new DatabaseService();

// --- Formatting & Utility Functions ---

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateNomorPemasukan(tanggal: string, existingList: TransaksiPemasukan[]): string {
  const cleanDate = tanggal.replace(/-/g, '');
  const prefix = `KM-IN-${cleanDate}-`;
  const countToday = existingList.filter((item) => item.tanggal === tanggal).length + 1;
  return `${prefix}${String(countToday).padStart(3, '0')}`;
}

export function generateNomorPengeluaran(tanggal: string, existingList: TransaksiPengeluaran[]): string {
  const cleanDate = tanggal.replace(/-/g, '');
  const prefix = `KM-OUT-${cleanDate}-`;
  const countToday = existingList.filter((item) => item.tanggal === tanggal).length + 1;
  return `${prefix}${String(countToday).padStart(3, '0')}`;
}

export function compressImageFile(file: File, maxDim = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

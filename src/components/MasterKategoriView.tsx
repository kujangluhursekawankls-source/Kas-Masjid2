import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  X,
  Sparkles,
} from 'lucide-react';
import { KategoriPemasukan, KategoriPengeluaran } from '../types';

interface MasterKategoriViewProps {
  kategoriPemasukan: KategoriPemasukan[];
  kategoriPengeluaran: KategoriPengeluaran[];
  onSavePemasukan: (items: KategoriPemasukan[]) => Promise<void>;
  onSavePengeluaran: (items: KategoriPengeluaran[]) => Promise<void>;
}

export const MasterKategoriView: React.FC<MasterKategoriViewProps> = ({
  kategoriPemasukan,
  kategoriPengeluaran,
  onSavePemasukan,
  onSavePengeluaran,
}) => {
  const [tab, setTab] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; nama: string; keterangan: string } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; nama: string } | null>(null);

  // Form Fields
  const [formNama, setFormNama] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formError, setFormError] = useState('');

  const currentList = tab === 'pemasukan' ? kategoriPemasukan : kategoriPengeluaran;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormNama('');
    setFormKeterangan('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: { id: string; nama: string; keterangan: string }) => {
    setEditingItem(item);
    setFormNama(item.nama);
    setFormKeterangan(item.keterangan || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      setFormError('Nama kategori wajib diisi.');
      return;
    }

    if (tab === 'pemasukan') {
      const newItem: KategoriPemasukan = {
        id: editingItem ? editingItem.id : `kat_in_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        nama: formNama.trim(),
        keterangan: formKeterangan.trim(),
        createdAt: new Date().toISOString(),
      };
      let updated: KategoriPemasukan[];
      if (editingItem) {
        updated = kategoriPemasukan.map((k) => (k.id === editingItem.id ? newItem : k));
      } else {
        updated = [...kategoriPemasukan, newItem];
      }
      await onSavePemasukan(updated);
    } else {
      const newItem: KategoriPengeluaran = {
        id: editingItem ? editingItem.id : `kat_out_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        nama: formNama.trim(),
        keterangan: formKeterangan.trim(),
        createdAt: new Date().toISOString(),
      };
      let updated: KategoriPengeluaran[];
      if (editingItem) {
        updated = kategoriPengeluaran.map((k) => (k.id === editingItem.id ? newItem : k));
      } else {
        updated = [...kategoriPengeluaran, newItem];
      }
      await onSavePengeluaran(updated);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    if (tab === 'pemasukan') {
      const updated = kategoriPemasukan.filter((k) => k.id !== itemToDelete.id);
      await onSavePemasukan(updated);
    } else {
      const updated = kategoriPengeluaran.filter((k) => k.id !== itemToDelete.id);
      await onSavePengeluaran(updated);
    }
    setItemToDelete(null);
  };

  // Helper: Populate standard categories on explicit user click
  const handlePopulateStandardCategories = async () => {
    const standardPemasukan: KategoriPemasukan[] = [
      { id: 'kat_in_1', nama: 'Kotak Amal Shalat Jumat', keterangan: 'Infaq dari kotak tromol / keliling shalat Jumat', createdAt: new Date().toISOString() },
      { id: 'kat_in_2', nama: 'Kotak Amal Harian / Tromol', keterangan: 'Kotak infaq tetap di dalam ruang masjid', createdAt: new Date().toISOString() },
      { id: 'kat_in_3', nama: 'Infaq Tarawih & Ramadhan', keterangan: 'Penerimaan khusus bulan suci Ramadhan', createdAt: new Date().toISOString() },
      { id: 'kat_in_4', nama: 'Zakat Maal & Zakat Fitrah', keterangan: 'Penerimaan zakat titipan jamaah', createdAt: new Date().toISOString() },
      { id: 'kat_in_5', nama: 'Wakaf Pembangunan Masjid', keterangan: 'Donasi perluasan atau renovasi fisik', createdAt: new Date().toISOString() },
      { id: 'kat_in_6', nama: 'Donatur Tetap / Bulanan', keterangan: 'Sumbangan rutin dari donatur terdaftar', createdAt: new Date().toISOString() },
      { id: 'kat_in_7', nama: 'Infaq Anak Yatim & Dhuafa', keterangan: 'Dana titipan santunan sosial', createdAt: new Date().toISOString() },
    ];

    const standardPengeluaran: KategoriPengeluaran[] = [
      { id: 'kat_out_1', nama: 'Operasional Listrik & PLN', keterangan: 'Tagihan listrik dan token masjid', createdAt: new Date().toISOString() },
      { id: 'kat_out_2', nama: 'Operasional Air & PDAM', keterangan: 'Tagihan air tempat wudhu dan toilet', createdAt: new Date().toISOString() },
      { id: 'kat_out_3', nama: 'Honor Khatib & Ustadz', keterangan: 'Bisyarah khatib Jumat dan penceramah kajian', createdAt: new Date().toISOString() },
      { id: 'kat_out_4', nama: 'Bisyarah Marbot & Kebersihan', keterangan: 'Uang lelah penjaga dan kebersihan masjid', createdAt: new Date().toISOString() },
      { id: 'kat_out_5', nama: 'Perbaikan & Renovasi', keterangan: 'Biaya pemeliharaan AC, sound system, cat, atap', createdAt: new Date().toISOString() },
      { id: 'kat_out_6', nama: 'Santunan Yatim & Kaum Dhuafa', keterangan: 'Penyaluran bantuan sosial', createdAt: new Date().toISOString() },
      { id: 'kat_out_7', nama: 'Konsumsi Pengajian & Takjil', keterangan: 'Snack kajian, buka puasa bersama, rapat', createdAt: new Date().toISOString() },
      { id: 'kat_out_8', nama: 'Perlengkapan & Kebersihan', keterangan: 'Sapu, pel, sabun cuci tangan, karbol, tisu', createdAt: new Date().toISOString() },
    ];

    await onSavePemasukan(standardPemasukan);
    await onSavePengeluaran(standardPengeluaran);
  };

  const filtered = currentList.filter(
    (k) =>
      k.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.keterangan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <FolderTree className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Master Kategori Kas</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Atur pos-pos kategori pemasukan dan pengeluaran agar pembukuan rapi dan mudah dianalisis.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori {tab === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</span>
        </button>
      </div>

      {/* Tabs and Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setTab('pemasukan');
                setSearchTerm('');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                tab === 'pemasukan' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <span>Kategori Pemasukan ({kategoriPemasukan.length})</span>
            </button>
            <button
              onClick={() => {
                setTab('pengeluaran');
                setSearchTerm('');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                tab === 'pengeluaran' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span>Kategori Pengeluaran ({kategoriPengeluaran.length})</span>
            </button>
          </div>

          {/* Quick populate button if database categories are empty */}
          {kategoriPemasukan.length === 0 && kategoriPengeluaran.length === 0 && (
            <button
              onClick={handlePopulateStandardCategories}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-semibold transition"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Gunakan Kategori Standar Masjid</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={`Cari kategori ${tab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Belum ada kategori {tab}</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Silakan tambahkan nama kategori baru atau gunakan template kategori standar masjid.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{item.nama}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.keterangan || 'Tidak ada keterangan khusus.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                    title="Edit Kategori"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setItemToDelete({ id: item.id, nama: item.nama })}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div
              className={`text-white px-5 py-4 flex items-center justify-between ${
                tab === 'pemasukan' ? 'bg-emerald-800' : 'bg-rose-700'
              }`}
            >
              <h3 className="font-bold text-base flex items-center gap-2">
                <FolderTree className="w-5 h-5" />
                <span>
                  {editingItem ? 'Edit Kategori' : 'Tambah Kategori'}{' '}
                  {tab === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    tab === 'pemasukan'
                      ? 'Contoh: Kotak Amal Jumat, Zakat Maal'
                      : 'Contoh: Operasional Listrik & PLN, Honor Khatib'
                  }
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan alokasi atau sumber kategori..."
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition ${
                    tab === 'pemasukan'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hapus Kategori?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Anda yakin ingin menghapus kategori <strong>{itemToDelete.nama}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

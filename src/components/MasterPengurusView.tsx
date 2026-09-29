import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  UserCheck,
  AlertTriangle,
  X,
  Users,
} from 'lucide-react';
import { Pengurus } from '../types';

interface MasterPengurusViewProps {
  pengurus: Pengurus[];
  onSave: (items: Pengurus[]) => Promise<void>;
}

export const MasterPengurusView: React.FC<MasterPengurusViewProps> = ({
  pengurus,
  onSave,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pengurus | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Pengurus | null>(null);

  // Form Fields
  const [formNama, setFormNama] = useState('');
  const [formJabatan, setFormJabatan] = useState('Pengurus');
  const [formTelepon, setFormTelepon] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formStatusAktif, setFormStatusAktif] = useState(true);
  const [formError, setFormError] = useState('');

  const jabatanPreset = [
    'Ketua DKM',
    'Wakil Ketua DKM',
    'Sekretaris',
    'Wakil Sekretaris',
    'Bendahara',
    'Wakil Bendahara',
    'Seksi Peribadatan & Dakwah',
    'Seksi Pembangunan & Sarpras',
    'Seksi Sosial & Kesejahteraan',
    'Seksi Humas & Kepemudaan (RISMA)',
    'Imam Rawatib',
    'Muadzin / Bilal',
    'Marbot Masjid',
    'Penasehat / Pembina',
  ];

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormNama('');
    setFormJabatan('Ketua DKM');
    setFormTelepon('');
    setFormAlamat('');
    setFormStatusAktif(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Pengurus) => {
    setEditingItem(item);
    setFormNama(item.nama);
    setFormJabatan(item.jabatan);
    setFormTelepon(item.telepon);
    setFormAlamat(item.alamat);
    setFormStatusAktif(item.statusAktif);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      setFormError('Nama pengurus tidak boleh kosong.');
      return;
    }
    if (!formJabatan.trim()) {
      setFormError('Jabatan pengurus tidak boleh kosong.');
      return;
    }

    const newItem: Pengurus = {
      id: editingItem ? editingItem.id : `pengurus_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      nama: formNama.trim(),
      jabatan: formJabatan.trim(),
      telepon: formTelepon.trim(),
      alamat: formAlamat.trim(),
      statusAktif: formStatusAktif,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
    };

    let updatedList: Pengurus[];
    if (editingItem) {
      updatedList = pengurus.map((p) => (p.id === editingItem.id ? newItem : p));
    } else {
      updatedList = [...pengurus, newItem];
    }

    await onSave(updatedList);
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const updated = pengurus.filter((p) => p.id !== itemToDelete.id);
    await onSave(updated);
    setItemToDelete(null);
  };

  const toggleStatus = async (item: Pengurus) => {
    const updated = pengurus.map((p) =>
      p.id === item.id ? { ...p, statusAktif: !p.statusAktif } : p
    );
    await onSave(updated);
  };

  const filteredList = useMemo(() => {
    return pengurus.filter((p) => {
      const matchSearch =
        p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.telepon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.alamat.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'ACTIVE' && p.statusAktif) ||
        (filterStatus === 'INACTIVE' && !p.statusAktif);

      return matchSearch && matchStatus;
    });
  }, [pengurus, searchTerm, filterStatus]);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Master Data Pengurus & DKM</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data Dewan Kemakmuran Masjid (DKM), susunan kepengurusan, kontak, dan penanggung jawab kas.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengurus</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama pengurus, jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'ALL' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Semua ({pengurus.length})
          </button>
          <button
            onClick={() => setFilterStatus('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'ACTIVE' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Aktif ({pengurus.filter((p) => p.statusAktif).length})
          </button>
          <button
            onClick={() => setFilterStatus('INACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'INACTIVE' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Non-Aktif ({pengurus.filter((p) => !p.statusAktif).length})
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Belum ada data pengurus</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {pengurus.length === 0
              ? 'Database pengurus masih kosong. Masukkan nama Ketua DKM, Bendahara, dan pengurus lainnya.'
              : 'Tidak ada pengurus yang sesuai dengan pencarian.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold"
          >
            + Tambah Pengurus Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-4 border transition hover:shadow-md relative flex flex-col justify-between ${
                item.statusAktif ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {item.jabatan}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5">{item.nama}</h3>
                  </div>

                  <button
                    onClick={() => toggleStatus(item)}
                    className={`p-1 rounded-full text-xs transition ${
                      item.statusAktif
                        ? 'text-emerald-700 hover:bg-emerald-50'
                        : 'text-slate-400 hover:bg-slate-200'
                    }`}
                    title={item.statusAktif ? 'Klik untuk non-aktifkan' : 'Klik untuk aktifkan'}
                  >
                    {item.statusAktif ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  {item.telepon ? (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <a
                        href={`https://wa.me/${item.telepon.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline font-mono"
                      >
                        {item.telepon}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 italic">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Tidak ada no telepon</span>
                    </div>
                  )}

                  {item.alamat ? (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{item.alamat}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Status: {item.statusAktif ? 'Aktif' : 'Non-Aktif'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                    title="Edit Pengurus"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setItemToDelete(item)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                    title="Hapus Pengurus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <span>{editingItem ? 'Edit Data Pengurus' : 'Tambah Pengurus Baru'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-200 hover:text-white">
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
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: H. Ahmad Subarjo, S.Pd.I"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan Pengurus <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  <select
                    value={formJabatan}
                    onChange={(e) => setFormJabatan(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                  >
                    {jabatanPreset.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                    <option value="Lainnya">Lainnya (Ketik Manual)</option>
                  </select>
                  {!jabatanPreset.includes(formJabatan) && (
                    <input
                      type="text"
                      placeholder="Ketik jabatan spesifik..."
                      value={formJabatan}
                      onChange={(e) => setFormJabatan(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp / Telepon
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formTelepon}
                  onChange={(e) => setFormTelepon(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Tempat Tinggal
                </label>
                <textarea
                  rows={2}
                  placeholder="Alamat domisili pengurus..."
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="statusAktifCheck"
                  checked={formStatusAktif}
                  onChange={(e) => setFormStatusAktif(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="statusAktifCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Status Pengurus Masih Aktif
                </label>
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Pengurus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hapus Data Pengurus?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Anda yakin ingin menghapus <strong>{itemToDelete.nama}</strong> ({itemToDelete.jabatan})? Tindakan ini tidak dapat dibatalkan.
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

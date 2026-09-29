import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  FileText,
  Printer,
  Camera,
  X,
  Upload,
  Calendar,
  DollarSign,
  User,
  Tag,
  AlertTriangle,
  ArrowDownLeft,
} from 'lucide-react';
import {
  TransaksiPemasukan,
  KategoriPemasukan,
  Pengurus,
  PengaturanMasjid,
} from '../types';
import {
  formatRupiah,
  formatTanggalIndo,
  getTodayString,
  generateNomorPemasukan,
  compressImageFile,
} from '../services/db';
import { exportKuitansiPemasukanPDF } from '../services/exportService';

interface PemasukanViewProps {
  pemasukan: TransaksiPemasukan[];
  kategoriList: KategoriPemasukan[];
  pengurusList: Pengurus[];
  pengaturan: PengaturanMasjid;
  onSave: (items: TransaksiPemasukan[]) => Promise<void>;
  isModalOpenExternal?: boolean;
  onCloseModalExternal?: () => void;
}

export const PemasukanView: React.FC<PemasukanViewProps> = ({
  pemasukan,
  kategoriList,
  pengurusList,
  pengaturan,
  onSave,
  isModalOpenExternal,
  onCloseModalExternal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransaksiPemasukan | null>(null);
  const [detailItem, setDetailItem] = useState<TransaksiPemasukan | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TransaksiPemasukan | null>(null);

  // Form Fields
  const [formTanggal, setFormTanggal] = useState(getTodayString());
  const [formNomor, setFormNomor] = useState('');
  const [formKategoriId, setFormKategoriId] = useState('');
  const [formSumberDana, setFormSumberDana] = useState('');
  const [formUraian, setFormUraian] = useState('');
  const [formNominal, setFormNominal] = useState<number | ''>('');
  const [formPetugas, setFormPetugas] = useState('');
  const [formFoto, setFormFoto] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState('');

  // Sync external open trigger
  React.useEffect(() => {
    if (isModalOpenExternal) {
      handleOpenAdd();
    }
  }, [isModalOpenExternal]);

  const handleOpenAdd = () => {
    const today = getTodayString();
    setEditingItem(null);
    setFormTanggal(today);
    setFormNomor(generateNomorPemasukan(today, pemasukan));
    setFormKategoriId(kategoriList[0]?.id || '');
    setFormSumberDana('');
    setFormUraian('');
    setFormNominal('');
    setFormPetugas(pengaturan.namaBendahara || pengurusList[0]?.nama || '');
    setFormFoto(undefined);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TransaksiPemasukan) => {
    setEditingItem(item);
    setFormTanggal(item.tanggal);
    setFormNomor(item.nomorTransaksi);
    setFormKategoriId(item.kategoriId);
    setFormSumberDana(item.sumberDana);
    setFormUraian(item.uraian);
    setFormNominal(item.nominal);
    setFormPetugas(item.namaPetugas);
    setFormFoto(item.lampiranFoto);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDateChange = (newDate: string) => {
    setFormTanggal(newDate);
    if (!editingItem) {
      setFormNomor(generateNomorPemasukan(newDate, pemasukan));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await compressImageFile(e.target.files[0], 800, 0.7);
        setFormFoto(compressed);
      } catch (err) {
        console.error('Failed to compress image', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNominal || Number(formNominal) <= 0) {
      setFormError('Nominal transaksi harus lebih dari 0.');
      return;
    }
    if (!formUraian.trim()) {
      setFormError('Uraian transaksi tidak boleh kosong.');
      return;
    }

    const kategoriObj = kategoriList.find((k) => k.id === formKategoriId);
    const kategoriNama = kategoriObj?.nama || 'Umum';

    const newItem: TransaksiPemasukan = {
      id: editingItem ? editingItem.id : `in_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      nomorTransaksi: formNomor.trim() || generateNomorPemasukan(formTanggal, pemasukan),
      tanggal: formTanggal,
      kategoriId: formKategoriId,
      kategoriNama,
      sumberDana: formSumberDana.trim() || 'Hamba Allah',
      uraian: formUraian.trim(),
      nominal: Number(formNominal),
      namaPetugas: formPetugas.trim() || pengaturan.namaBendahara || 'Petugas Kas',
      lampiranFoto: formFoto,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedList: TransaksiPemasukan[];
    if (editingItem) {
      updatedList = pemasukan.map((item) => (item.id === editingItem.id ? newItem : item));
    } else {
      updatedList = [newItem, ...pemasukan];
    }

    await onSave(updatedList);
    setIsModalOpen(false);
    if (onCloseModalExternal) onCloseModalExternal();
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const updated = pemasukan.filter((item) => item.id !== itemToDelete.id);
    await onSave(updated);
    setItemToDelete(null);
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return pemasukan.filter((item) => {
      const matchSearch =
        item.nomorTransaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.uraian.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sumberDana.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategoriNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaPetugas.toLowerCase().includes(searchTerm.toLowerCase());

      const matchKategori = selectedKategori === 'ALL' || item.kategoriId === selectedKategori;
      const matchStart = !startDate || item.tanggal >= startDate;
      const matchEnd = !endDate || item.tanggal <= endDate;

      return matchSearch && matchKategori && matchStart && matchEnd;
    });
  }, [pemasukan, searchTerm, selectedKategori, startDate, endDate]);

  const totalFilteredNominal = useMemo(() => {
    return filteredList.reduce((sum, item) => sum + item.nominal, 0);
  }, [filteredList]);

  return (
    <div className="space-y-4 pb-20 lg:pb-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
              <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">Transaksi Pemasukan Kas</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Catat donasi, kotak amal Jumat, zakat, infaq tarawih, wakaf, dan penerimaan kas lainnya.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl text-xs font-semibold shadow-xs transition w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pemasukan</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        {/* Row 1: Search & Kategori */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari uraian, nomor, sumber dana..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-[42px] pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Kategori Filter */}
          <div>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-emerald-600 transition"
            >
              <option value="ALL">Semua Kategori Pemasukan</option>
              {kategoriList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Rentang Tanggal (Mulai & Sampai) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-100">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 block">
              Dari Tanggal:
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full min-h-[42px] px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-emerald-600 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 block">
              Sampai Tanggal:
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full min-h-[42px] px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-emerald-600 transition"
              />
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span>Menampilkan <strong>{filteredList.length}</strong> transaksi</span>
            {(searchTerm || selectedKategori !== 'ALL' || startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedKategori('ALL');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold underline"
              >
                Reset Filter
              </button>
            )}
          </div>
          <div className="text-emerald-800 font-extrabold text-xs sm:text-sm">
            Total Terfilter: {formatRupiah(totalFilteredNominal)}
          </div>
        </div>
      </div>

      {/* Table / Android List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center">
            <ArrowDownLeft className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada data pemasukan</p>
            <p className="text-xs text-slate-400 mt-1">
              {pemasukan.length === 0
                ? 'Database pemasukan masih kosong. Tekan tombol Tambah Pemasukan untuk mencatat.'
                : 'Tidak ada transaksi yang cocok dengan kata kunci atau filter tanggal.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 hover:bg-slate-50/90 transition flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.kategoriNama}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {item.nomorTransaksi}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 line-clamp-2">
                        {item.uraian}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        <span>Dari: {item.sumberDana || 'Hamba Allah'}</span> • <span>{formatTanggalIndo(item.tanggal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xs sm:text-sm font-extrabold text-emerald-800">
                      + {formatRupiah(item.nominal)}
                    </div>
                    {item.lampiranFoto && (
                      <button
                        onClick={() => setDetailItem(item)}
                        className="text-[10px] text-emerald-700 underline font-semibold mt-0.5 inline-block"
                      >
                        Lihat Foto
                      </button>
                    )}
                  </div>
                </div>

                {/* Android Action Buttons Row */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs text-slate-500">
                  <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    PJ: {item.namaPetugas || 'Petugas'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => exportKuitansiPemasukanPDF(item, pengaturan)}
                      className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1 transition"
                      title="Cetak Kuitansi (PDF)"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Kuitansi</span>
                    </button>
                    <button
                      onClick={() => setDetailItem(item)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                      title="Detail"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Android Bottom Sheet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Android Drag Handle */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto my-2.5 flex-shrink-0" />

            <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-300" />
                <span>{editingItem ? 'Edit Pemasukan Kas' : 'Catat Pemasukan Kas'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseModalExternal) onCloseModalExternal();
                }}
                className="text-emerald-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Tanggal & No Transaksi */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. Transaksi
                  </label>
                  <input
                    type="text"
                    required
                    value={formNomor}
                    onChange={(e) => setFormNomor(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-mono bg-slate-50 focus:outline-emerald-600 text-[11px]"
                  />
                </div>
              </div>

              {/* Kategori & Sumber Dana */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  {kategoriList.length === 0 ? (
                    <div className="text-[10px] text-amber-700 p-1.5 bg-amber-50 rounded-lg border border-amber-200">
                      Isi di master kategori.
                    </div>
                  ) : (
                    <select
                      value={formKategoriId}
                      onChange={(e) => setFormKategoriId(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600"
                    >
                      {kategoriList.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sumber Dana / Donatur
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kotak Amal Jumat"
                    value={formSumberDana}
                    onChange={(e) => setFormSumberDana(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Uraian */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Uraian / Keterangan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Keterangan rinci pemasukan..."
                  value={formUraian}
                  onChange={(e) => setFormUraian(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              {/* Nominal & Petugas */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nominal (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="0"
                    value={formNominal}
                    onChange={(e) => setFormNominal(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 font-bold text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                  />
                  {formNominal !== '' && (
                    <div className="text-[10px] font-semibold text-emerald-800 mt-0.5">
                      {formatRupiah(Number(formNominal))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Petugas Penerima
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Bendahara / Petugas"
                    value={formPetugas}
                    onChange={(e) => setFormPetugas(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Lampiran Bukti Foto */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lampiran Bukti Foto
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Ambil Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {formFoto && (
                    <div className="flex items-center gap-2">
                      <img
                        src={formFoto}
                        alt="Preview"
                        className="w-9 h-9 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setFormFoto(undefined)}
                        className="text-[11px] text-rose-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onCloseModalExternal) onCloseModalExternal();
                  }}
                  className="px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-700 active:bg-emerald-800 text-white shadow-sm transition"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Simpan Pemasukan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Android Bottom Sheet */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto -mt-2 mb-2" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Detail Transaksi Masuk
                </span>
                <h3 className="font-bold text-slate-900 text-sm">{detailItem.nomorTransaksi}</h3>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Tanggal:</span>
                <span className="font-medium text-slate-800">{formatTanggalIndo(detailItem.tanggal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Kategori:</span>
                <span className="font-medium text-slate-800">{detailItem.kategoriNama}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Sumber Dana:</span>
                <span className="font-medium text-slate-800">{detailItem.sumberDana}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Uraian:</span>
                <span className="font-medium text-slate-800 text-right max-w-[200px]">{detailItem.uraian}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Petugas:</span>
                <span className="font-medium text-slate-800">{detailItem.namaPetugas}</span>
              </div>
              <div className="flex justify-between py-2 items-center bg-emerald-50 px-3 rounded-xl">
                <span className="font-semibold text-emerald-900">Total Nominal:</span>
                <span className="font-extrabold text-sm text-emerald-800">
                  {formatRupiah(detailItem.nominal)}
                </span>
              </div>
            </div>

            {detailItem.lampiranFoto && (
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">Bukti Foto:</span>
                <img
                  src={detailItem.lampiranFoto}
                  alt="Bukti Foto"
                  className="w-full max-h-48 object-contain rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => exportKuitansiPemasukanPDF(detailItem, pengaturan)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition w-full justify-center"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Kuitansi Penerimaan (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Bottom Sheet */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto -mt-2 mb-2" />
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hapus Transaksi Pemasukan?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Anda yakin ingin menghapus nomor transaksi <strong>{itemToDelete.nomorTransaksi}</strong> ({formatRupiah(itemToDelete.nominal)})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 flex-1"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex-1"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

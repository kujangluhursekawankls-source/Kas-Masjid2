import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  FileText,
  Printer,
  Camera,
  X,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import {
  TransaksiPengeluaran,
  KategoriPengeluaran,
  Pengurus,
  PengaturanMasjid,
} from '../types';
import {
  formatRupiah,
  formatTanggalIndo,
  getTodayString,
  generateNomorPengeluaran,
  compressImageFile,
} from '../services/db';
import { exportVoucherPengeluaranPDF } from '../services/exportService';

interface PengeluaranViewProps {
  pengeluaran: TransaksiPengeluaran[];
  kategoriList: KategoriPengeluaran[];
  pengurusList: Pengurus[];
  pengaturan: PengaturanMasjid;
  onSave: (items: TransaksiPengeluaran[]) => Promise<void>;
  isModalOpenExternal?: boolean;
  onCloseModalExternal?: () => void;
}

export const PengeluaranView: React.FC<PengeluaranViewProps> = ({
  pengeluaran,
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
  const [editingItem, setEditingItem] = useState<TransaksiPengeluaran | null>(null);
  const [detailItem, setDetailItem] = useState<TransaksiPengeluaran | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TransaksiPengeluaran | null>(null);

  // Form Fields
  const [formTanggal, setFormTanggal] = useState(getTodayString());
  const [formNomor, setFormNomor] = useState('');
  const [formKategoriId, setFormKategoriId] = useState('');
  const [formUraian, setFormUraian] = useState('');
  const [formNominal, setFormNominal] = useState<number | ''>('');
  const [formPenanggungJawab, setFormPenanggungJawab] = useState('');
  const [formFoto, setFormFoto] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    if (isModalOpenExternal) {
      handleOpenAdd();
    }
  }, [isModalOpenExternal]);

  const handleOpenAdd = () => {
    const today = getTodayString();
    setEditingItem(null);
    setFormTanggal(today);
    setFormNomor(generateNomorPengeluaran(today, pengeluaran));
    setFormKategoriId(kategoriList[0]?.id || '');
    setFormUraian('');
    setFormNominal('');
    setFormPenanggungJawab(pengaturan.namaBendahara || pengurusList[0]?.nama || '');
    setFormFoto(undefined);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TransaksiPengeluaran) => {
    setEditingItem(item);
    setFormTanggal(item.tanggal);
    setFormNomor(item.nomorTransaksi);
    setFormKategoriId(item.kategoriId);
    setFormUraian(item.uraian);
    setFormNominal(item.nominal);
    setFormPenanggungJawab(item.namaPenanggungJawab);
    setFormFoto(item.lampiranFoto);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDateChange = (newDate: string) => {
    setFormTanggal(newDate);
    if (!editingItem) {
      setFormNomor(generateNomorPengeluaran(newDate, pengeluaran));
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

    const newItem: TransaksiPengeluaran = {
      id: editingItem ? editingItem.id : `out_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      nomorTransaksi: formNomor.trim() || generateNomorPengeluaran(formTanggal, pengeluaran),
      tanggal: formTanggal,
      kategoriId: formKategoriId,
      kategoriNama,
      uraian: formUraian.trim(),
      nominal: Number(formNominal),
      namaPenanggungJawab: formPenanggungJawab.trim() || 'Penanggung Jawab',
      lampiranFoto: formFoto,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedList: TransaksiPengeluaran[];
    if (editingItem) {
      updatedList = pengeluaran.map((item) => (item.id === editingItem.id ? newItem : item));
    } else {
      updatedList = [newItem, ...pengeluaran];
    }

    await onSave(updatedList);
    setIsModalOpen(false);
    if (onCloseModalExternal) onCloseModalExternal();
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const updated = pengeluaran.filter((item) => item.id !== itemToDelete.id);
    await onSave(updated);
    setItemToDelete(null);
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return pengeluaran.filter((item) => {
      const matchSearch =
        item.nomorTransaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.uraian.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategoriNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaPenanggungJawab.toLowerCase().includes(searchTerm.toLowerCase());

      const matchKategori = selectedKategori === 'ALL' || item.kategoriId === selectedKategori;
      const matchStart = !startDate || item.tanggal >= startDate;
      const matchEnd = !endDate || item.tanggal <= endDate;

      return matchSearch && matchKategori && matchStart && matchEnd;
    });
  }, [pengeluaran, searchTerm, selectedKategori, startDate, endDate]);

  const totalFilteredNominal = useMemo(() => {
    return filteredList.reduce((sum, item) => sum + item.nominal, 0);
  }, [filteredList]);

  return (
    <div className="space-y-4 pb-20 lg:pb-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold flex-shrink-0">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">Transaksi Pengeluaran Kas</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Catat operasional listrik, air, honor ustadz / khatib, kebersihan, renovasi, santunan yatim, dan kebutuhan masjid lainnya.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 bg-rose-700 hover:bg-rose-800 active:scale-98 text-white rounded-xl text-xs font-semibold shadow-xs transition w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengeluaran</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        {/* Row 1: Search & Kategori */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari uraian, nomor transaksi, atau PJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-[42px] pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-rose-600 focus:ring-1 focus:ring-rose-600 transition"
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
              className="w-full min-h-[42px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-rose-600 transition"
            >
              <option value="ALL">Semua Kategori Pengeluaran</option>
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
                className="w-full min-h-[42px] px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-rose-600 transition"
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
                className="w-full min-h-[42px] px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-rose-600 transition"
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
                className="text-[11px] text-rose-700 hover:text-rose-800 font-semibold underline"
              >
                Reset Filter
              </button>
            )}
          </div>
          <div className="text-rose-700 font-extrabold text-xs sm:text-sm">
            Total Terfilter: {formatRupiah(totalFilteredNominal)}
          </div>
        </div>
      </div>

      {/* Table / List View (Android Mobile Cards) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center">
            <ArrowUpRight className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada data pengeluaran</p>
            <p className="text-xs text-slate-400 mt-1">
              {pengeluaran.length === 0
                ? 'Database pengeluaran masih kosong. Tekan tombol Tambah Pengeluaran untuk mencatat.'
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
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
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
                        <span>PJ: {item.namaPenanggungJawab || 'Pengurus'}</span> &bull; <span>{formatTanggalIndo(item.tanggal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xs sm:text-sm font-extrabold text-rose-600">
                      - {formatRupiah(item.nominal)}
                    </div>
                    {item.lampiranFoto && (
                      <button
                        type="button"
                        onClick={() => setDetailItem(item)}
                        className="text-[10px] text-rose-700 underline font-semibold mt-0.5 inline-block"
                      >
                        Lihat Nota
                      </button>
                    )}
                  </div>
                </div>

                {/* Android Action Buttons Row */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs text-slate-500">
                  <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    PJ: {item.namaPenanggungJawab || 'Pengurus'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => exportVoucherPengeluaranPDF(item, pengaturan)}
                      className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-semibold flex items-center gap-1 transition"
                      title="Cetak Voucher (PDF)"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Voucher</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailItem(item)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                      title="Detail"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
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

            <div className="bg-rose-700 text-white px-5 py-3.5 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-rose-300" />
                <span>{editingItem ? 'Edit Transaksi Pengeluaran' : 'Catat Pengeluaran Kas'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseModalExternal) onCloseModalExternal();
                }}
                className="text-rose-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Tanggal & No Transaksi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Transaksi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Transaksi (Otomatis)
                  </label>
                  <input
                    type="text"
                    required
                    value={formNomor}
                    onChange={(e) => setFormNomor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-slate-50 focus:outline-rose-600"
                  />
                </div>
              </div>

              {/* Kategori & Penanggung Jawab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Pengeluaran <span className="text-rose-500">*</span>
                  </label>
                  {kategoriList.length === 0 ? (
                    <div className="text-xs text-amber-700 p-2 bg-amber-50 rounded-lg border border-amber-200">
                      Belum ada kategori pengeluaran. Isi nama kategori di master kategori.
                    </div>
                  ) : (
                    <select
                      value={formKategoriId}
                      onChange={(e) => setFormKategoriId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-rose-600"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penanggung Jawab / Penerima
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Pengurus / Pelaksana"
                    value={formPenanggungJawab}
                    onChange={(e) => setFormPenanggungJawab(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-rose-600"
                  />
                </div>
              </div>

              {/* Uraian Keperluan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uraian Keperluan / Rincian Pengeluaran <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Pembayaran listrik masjid bulan ini, honor khatib shalat Jumat..."
                  value={formUraian}
                  onChange={(e) => setFormUraian(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-rose-600"
                />
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Pengeluaran (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="0"
                  value={formNominal}
                  onChange={(e) => setFormNominal(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-rose-600"
                />
                {formNominal !== '' && (
                  <div className="text-[11px] font-semibold text-rose-700 mt-1">
                    {formatRupiah(Number(formNominal))}
                  </div>
                )}
              </div>

              {/* Lampiran Bukti Foto Nota */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lampiran Bukti Nota / Bon / Kwitansi Fisik
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700">
                    <Camera className="w-4 h-4 text-rose-600" />
                    <span>Pilih / Foto Nota</span>
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
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setFormFoto(undefined)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Hapus Foto
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onCloseModalExternal) onCloseModalExternal();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white shadow-sm transition"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Simpan Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  Detail Transaksi Keluar
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
                <span className="text-slate-500">Penanggung Jawab:</span>
                <span className="font-medium text-slate-800">{detailItem.namaPenanggungJawab}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Keperluan:</span>
                <span className="font-medium text-slate-800 text-right max-w-[200px]">{detailItem.uraian}</span>
              </div>
              <div className="flex justify-between py-2 items-center bg-rose-50 px-3 rounded-xl">
                <span className="font-semibold text-rose-900">Total Nominal:</span>
                <span className="font-extrabold text-sm text-rose-700">
                  {formatRupiah(detailItem.nominal)}
                </span>
              </div>
            </div>

            {detailItem.lampiranFoto && (
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">Bukti Nota / Kwitansi:</span>
                <img
                  src={detailItem.lampiranFoto}
                  alt="Bukti Nota"
                  className="w-full max-h-52 object-contain rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => exportVoucherPengeluaranPDF(detailItem, pengaturan)}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Voucher Keluar</span>
              </button>
            </div>
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
              <h3 className="font-bold text-slate-900 text-base">Hapus Transaksi Pengeluaran?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Anda yakin ingin menghapus nomor transaksi <strong>{itemToDelete.nomorTransaksi}</strong> ({formatRupiah(itemToDelete.nominal)})? Tindakan ini tidak dapat dibatalkan.
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
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

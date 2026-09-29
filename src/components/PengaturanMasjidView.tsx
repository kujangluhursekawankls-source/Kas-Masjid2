import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Camera,
  Upload,
  Save,
  CheckCircle,
  AlertTriangle,
  User,
  Shield,
  CreditCard,
  Globe,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { PengaturanMasjid } from '../types';
import { compressImageFile } from '../services/db';

interface PengaturanMasjidViewProps {
  pengaturan: PengaturanMasjid;
  onSave: (data: PengaturanMasjid) => Promise<void>;
}

export const PengaturanMasjidView: React.FC<PengaturanMasjidViewProps> = ({
  pengaturan,
  onSave,
}) => {
  const [formData, setFormData] = useState<PengaturanMasjid>({ ...pengaturan });
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof PengaturanMasjid, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await compressImageFile(e.target.files[0], 400, 0.8);
        handleChange('logoMasjid', compressed);
      } catch (err) {
        console.error('Error compressing logo', err);
      }
    }
  };

  const handleUploadFotoMasjid = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await compressImageFile(e.target.files[0], 1200, 0.8);
        handleChange('fotoMasjid', compressed);
      } catch (err) {
        console.error('Error compressing mosque banner', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Pengaturan Masjid & Organisasi</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data profil, logo, ketua DKM, dan bendahara otomatis tercetak pada kop surat, laporan PDF, kuitansi, dan WhatsApp.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Identitas Masjid / Mushola / Yayasan
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Masjid / Mushola / Majelis <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Masjid Jami' Al-Ikhlas"
                value={formData.namaMasjid}
                onChange={(e) => handleChange('namaMasjid', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Lengkap
              </label>
              <textarea
                rows={2}
                placeholder="Jl. Raya Masjid No. 12, RT 02/05, Kelurahan..."
                value={formData.alamat}
                onChange={(e) => handleChange('alamat', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.telepon}
                  onChange={(e) => handleChange('telepon', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Masjid
                </label>
                <input
                  type="email"
                  placeholder="info@masjid.id"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website / Media Sosial
              </label>
              <input
                type="text"
                placeholder="https://masjid.or.id atau @masjid_official"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
              />
            </div>

            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 pt-4">
              Penandatangan Resmi Laporan Kas
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Ketua DKM / Pengurus <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: H. Ahmad Syukri, S.Ag"
                  value={formData.namaKetua}
                  onChange={(e) => handleChange('namaKetua', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
                <span className="text-[10px] text-slate-400">Tampil di tanda tangan laporan & PDF</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Bendahara Kas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: M. Ridwan, S.E"
                  value={formData.namaBendahara}
                  onChange={(e) => handleChange('namaBendahara', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
                <span className="text-[10px] text-slate-400">Tampil di kuitansi & tanda tangan</span>
              </div>
            </div>

            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 pt-4">
              Rekening Bank Infaq / Donasi (Opsional)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Bank
                </label>
                <input
                  type="text"
                  placeholder="BSI / BCA / Mandiri"
                  value={formData.namaBank || ''}
                  onChange={(e) => handleChange('namaBank', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  placeholder="1234567890"
                  value={formData.rekeningBank || ''}
                  onChange={(e) => handleChange('rekeningBank', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Atas Nama Rekening
                </label>
                <input
                  type="text"
                  placeholder="DKM Masjid..."
                  value={formData.atasNamaRekening || ''}
                  onChange={(e) => handleChange('atasNamaRekening', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Media / Photo Uploads */}
          <div className="space-y-6">
            {/* Logo Masjid */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Logo Masjid
              </h2>
              <div className="flex items-center gap-4">
                {formData.logoMasjid ? (
                  <img
                    src={formData.logoMasjid}
                    alt="Logo Masjid"
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 bg-white"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400">
                    <Building2 className="w-8 h-8" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadLogo}
                      className="hidden"
                    />
                  </label>
                  {formData.logoMasjid && (
                    <button
                      type="button"
                      onClick={() => handleChange('logoMasjid', '')}
                      className="block text-[11px] text-rose-600 hover:underline"
                    >
                      Hapus Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Foto Masjid / Banner */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Foto Masjid / Banner
              </h2>
              {formData.fotoMasjid ? (
                <div className="relative rounded-xl overflow-hidden h-32 border border-slate-200 bg-slate-100">
                  <img
                    src={formData.fotoMasjid}
                    alt="Foto Masjid"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange('fotoMasjid', '')}
                    className="absolute top-2 right-2 px-2 py-1 bg-black/60 hover:bg-black/80 text-white rounded text-[10px] font-semibold"
                  >
                    Hapus Foto
                  </button>
                </div>
              ) : (
                <div className="h-28 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-3">
                  <Building2 className="w-6 h-6 mb-1 text-slate-300" />
                  <span>Belum ada foto banner masjid</span>
                </div>
              )}

              <label className="cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upload Foto Masjid</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFotoMasjid}
                  className="hidden"
                />
              </label>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

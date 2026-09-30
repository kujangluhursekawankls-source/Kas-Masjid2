import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  Building2,
  User,
  LogIn,
  UserPlus,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  LogOut,
  Copy,
  Check,
} from 'lucide-react';
import { cloudService } from '../services/cloudService';
import { UserProfile, PengaturanMasjid } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: UserProfile | null;
  onSuccess: (profile: UserProfile | null) => void;
  defaultMode?: 'login' | 'register' | 'join';
  onLogout?: () => Promise<void>;
  pengaturan?: PengaturanMasjid;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUserProfile,
  onSuccess,
  defaultMode = 'login',
  onLogout,
  pengaturan,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(
    defaultMode === 'join' ? 'login' : defaultMode
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [namaMasjid, setNamaMasjid] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedKode, setCopiedKode] = useState(false);

  if (!isOpen) return null;

  // Logout handler when user is already logged in
  const handleLogoutAction = async () => {
    setLoading(true);
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await cloudService.logoutUser();
      }
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKode = (kode: string) => {
    navigator.clipboard.writeText(kode);
    setCopiedKode(true);
    setTimeout(() => setCopiedKode(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsOperationNotAllowed(false);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Email dan kata sandi wajib diisi.');
        }
        if (password.length < 6) {
          throw new Error('Kata sandi minimal 6 karakter.');
        }

        const res = await cloudService.registerWithEmail(
          email.trim(),
          password.trim(),
          displayName.trim() || 'Pengurus DKM',
          namaMasjid.trim() || 'Masjid Jami'
        );

        onSuccess(res.profile);
        onClose();
      } else if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Email dan kata sandi wajib diisi.');
        }

        await cloudService.loginWithEmail(email.trim(), password.trim());
        onSuccess(null);
        onClose();
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          throw new Error('Masukkan alamat email akun Anda.');
        }

        await cloudService.sendPasswordReset(email.trim());
        setSuccessMsg(
          `Tautan reset kata sandi telah dikirim ke ${email}. Silakan periksa Kotak Masuk (Inbox) atau folder Spam email Anda.`
        );
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      let message = 'Terjadi kesalahan saat memproses data.';
      if (err instanceof Error) {
        if (err.message.includes('auth/operation-not-allowed')) {
          setIsOperationNotAllowed(true);
          message =
            'Pendaftaran Email/Password di Firebase belum diaktifkan (Status: Disabled). Anda bisa langsung klik tombol Google di atas (1-Klik langsung masuk), atau aktifkan Email/Password di Firebase Console.';
        } else if (err.message.includes('auth/email-already-in-use')) {
          message = 'Email ini sudah terdaftar. Silakan pilih tab "Masuk" di atas.';
        } else if (
          err.message.includes('auth/invalid-credential') ||
          err.message.includes('auth/user-not-found') ||
          err.message.includes('auth/wrong-password')
        ) {
          message = 'Email atau kata sandi tidak cocok. Silakan periksa kembali atau gunakan fitur Lupa Kata Sandi.';
        } else if (err.message.includes('auth/weak-password')) {
          message = 'Kata sandi terlalu pendek (minimal 6 karakter).';
        } else if (err.message.includes('auth/invalid-email')) {
          message = 'Format alamat email tidak valid.';
        } else {
          message = err.message;
        }
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsOperationNotAllowed(false);
    setLoading(true);
    try {
      await cloudService.loginWithGoogle();
      onSuccess(null);
      onClose();
    } catch (err: unknown) {
      console.error('Google login error:', err);
      setErrorMsg('Gagal masuk dengan Google. Pastikan jendela popup tidak diblokir browser Anda.');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // RENDER 1: JIKA USER SUDAH LOGIN -> HANYA TAMPILKAN MENU LOG OUT
  // ========================================================
  if (currentUserProfile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-emerald-100 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Akun Pengurus Masjid</h2>
                <p className="text-xs text-emerald-100">Sesi Aktif Terhubung</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Info Akun & Hanya Menu Log Out */}
          <div className="p-6 space-y-5">
            {/* Status Online Banner */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-emerald-900">Terhubung ke Cloud Database</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-200/60 text-emerald-800 font-bold text-[10px]">
                ONLINE
              </span>
            </div>

            {/* Profile Info Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                  {currentUserProfile.displayName
                    ? currentUserProfile.displayName.charAt(0).toUpperCase()
                    : 'P'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-slate-900 truncate">
                    {currentUserProfile.displayName || 'Pengurus DKM'}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{currentUserProfile.email}</p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {currentUserProfile.role === 'ketua' ? 'Ketua DKM' : 'Bendahara / Pengurus Kas'}
                  </span>
                </div>
              </div>

              {/* Detail Masjid & Kode */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Masjid Aktif:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[180px]">
                    {pengaturan?.namaMasjid || 'Masjid Jami'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Kode Masjid:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">
                      {currentUserProfile.masjidId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyKode(currentUserProfile.masjidId)}
                      className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                      title="Salin Kode Masjid"
                    >
                      {copiedKode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Catatan Keamanan Logout */}
            <div className="text-[11px] text-slate-500 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 leading-relaxed">
              💡 <b>Keamanan Kas:</b> Saat Anda keluar (log out), beranda aplikasi akan otomatis kembali ke <b>kondisi 0 (Rp 0)</b> untuk mencegah kebocoran data.
            </div>

            {/* SATU-SATUNYA MENU AKSI KETIKA LOGIN: TOMBOL LOG OUT */}
            <button
              type="button"
              onClick={handleLogoutAction}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/25 flex items-center justify-center gap-2.5 transition active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses Keluar...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Keluar dari Akun (Log Out)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER 2: JIKA POSISI BELUM LOGIN -> TAMPILKAN LOGIN / DAFTAR
  // ========================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-emerald-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Building2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {mode === 'forgot' ? 'Lupa Kata Sandi' : 'Masuk Akun Kas Masjid'}
              </h2>
              <p className="text-xs text-emerald-100">
                {mode === 'forgot' ? 'Pemulihan Akun Pengurus' : 'Sinkronisasi Cloud Real-Time'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        {mode !== 'forgot' ? (
          <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
                setIsOperationNotAllowed(false);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
                setIsOperationNotAllowed(false);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Daftar Baru
            </button>
          </div>
        ) : (
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Menu Masuk
            </button>
            <span className="text-[11px] text-slate-400">Reset Password</span>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Google 1-Click Login Option */}
          {(mode === 'login' || mode === 'register') && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl font-bold text-xs text-slate-800 bg-emerald-50/50 hover:bg-emerald-100/70 border-2 border-emerald-300/80 flex items-center justify-center gap-2.5 shadow-sm transition active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Masuk Cepat dengan Akun Google (1-Klik Langsung)
              </button>
              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Atau isi formulir email
                </span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p className="font-semibold">{errorMsg}</p>
                {isOperationNotAllowed && (
                  <div className="pt-2 border-t border-rose-200 space-y-2">
                    <p className="text-[11px] text-rose-800">
                      <b>Solusi Instan:</b> Klik tombol hijau di atas <i>&quot;Masuk Cepat dengan Akun Google&quot;</i> untuk langsung masuk seketika.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{successMsg}</p>
            </div>
          )}

          {/* Form Register inputs */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Masjid / Mushola <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Masjid Jami' Al-Ikhlas"
                    value={namaMasjid}
                    onChange={(e) => setNamaMasjid(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap Pengurus <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: H. Jamhur"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Alamat Email <span className="text-emerald-600">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Password input */}
          {(mode === 'register' || mode === 'login') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Kata Sandi (Password) <span className="text-emerald-600">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline cursor-pointer"
                  >
                    Lupa Kata Sandi?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Mode Forgot Password Instructions */}
          {mode === 'forgot' && (
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Masukkan alamat email yang terdaftar. Sistem akan mengirimkan link untuk membuat kata sandi baru ke email Anda.
            </p>
          )}

          {/* Action Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : mode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" />
                Daftar & Buat Profil Masjid
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                Masuk ke Aplikasi
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Kirim Link Reset Kata Sandi
              </>
            )}
          </button>

          {/* Footer note */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Data kas tersimpan aman di Google Cloud Firestore.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

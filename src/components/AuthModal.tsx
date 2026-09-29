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
  Sparkles,
  Layers,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { cloudService } from '../services/cloudService';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: UserProfile | null;
  onSuccess: (profile: UserProfile | null) => void;
  defaultMode?: 'login' | 'register' | 'join';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUserProfile,
  onSuccess,
  defaultMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'join' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [namaMasjid, setNamaMasjid] = useState('');
  const [kodeMasjid, setKodeMasjid] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
      } else if (mode === 'join') {
        if (!currentUserProfile) {
          throw new Error('Silakan masuk terlebih dahulu sebelum menghubungkan kode masjid.');
        }
        if (!kodeMasjid.trim()) {
          throw new Error('Masukkan Kode Masjid yang valid.');
        }

        await cloudService.switchOrJoinMasjid(currentUserProfile.id, kodeMasjid.trim());
        onSuccess(null);
        onClose();
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      let message = 'Terjadi kesalahan saat memproses data.';
      if (err instanceof Error) {
        if (err.message.includes('auth/operation-not-allowed')) {
          setIsOperationNotAllowed(true);
          message =
            'Pendaftaran Email/Password di Firebase belum diaktifkan (Status: Disabled). Anda bisa langsung klik tombol Google di bawah ini (1-Klik langsung masuk tanpa ribet!), atau aktifkan Email/Password di Firebase Console.';
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
                {mode === 'forgot' ? 'Lupa Kata Sandi' : 'Akun & Multi-Masjid'}
              </h2>
              <p className="text-xs text-emerald-100">
                {mode === 'forgot' ? 'Pemulihan Akun Pengurus' : 'Sinkronisasi Cloud Real-Time'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
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
            {currentUserProfile && (
              <button
                type="button"
                onClick={() => {
                  setMode('join');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setIsOperationNotAllowed(false);
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'join'
                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100/50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Kode Masjid
              </button>
            )}
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
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Menu Masuk
            </button>
            <span className="text-[11px] text-slate-400">Reset Password</span>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Google 1-Click Login Option (Prominently placed at top for fast experience) */}
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
                    <p className="text-[11px] text-slate-600">
                      Metode Email/Password di Firebase Console belum diaktifkan. Anda bisa mengaktifkannya dengan membuka console atau klik tombol Google di atas.
                    </p>
                    <a
                      href="https://console.firebase.google.com/project/gen-lang-client-0128738987/authentication/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition"
                    >
                      Buka Firebase Console Sign-in method <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900">Email Terkirim!</p>
                <p className="mt-0.5 text-emerald-700">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Mode Register */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Masjid Anda <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Masjid Jami Al-Ikhlas"
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

          {/* Email input (used in register, login, forgot) */}
          {mode !== 'join' && (
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
          )}

          {/* Password input (used in register, login) */}
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

          {/* Mode Join */}
          {mode === 'join' && (
            <div className="space-y-3">
              <div className="bg-teal-50/70 border border-teal-200/60 rounded-2xl p-3 text-xs text-teal-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  Gabung ke masjid lain menggunakan <b>Kode Masjid</b> (contoh: <code>MSJ-ABC123</code>) yang diberikan oleh Ketua/Bendahara.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kode Masjid <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MSJ-78912"
                    value={kodeMasjid}
                    onChange={(e) => setKodeMasjid(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono tracking-wider uppercase bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
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
            ) : mode === 'forgot' ? (
              <>
                <Mail className="w-4 h-4" />
                Kirim Link Reset Kata Sandi
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Hubungkan ke Masjid Ini
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

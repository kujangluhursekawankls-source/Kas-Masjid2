import React, { useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, X, MessageCircle } from 'lucide-react';

interface AndroidFABProps {
  onOpenAddPemasukan: () => void;
  onOpenAddPengeluaran: () => void;
  onOpenWhatsApp: () => void;
}

export const AndroidFAB: React.FC<AndroidFABProps> = ({
  onOpenAddPemasukan,
  onOpenAddPengeluaran,
  onOpenWhatsApp,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-30 flex flex-col items-end select-none">
      {/* Speed Dial Options */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 mb-3 animate-in fade-in slide-in-from-bottom-3 duration-150">
          {/* Kirim WhatsApp */}
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap">
              Kirim Ringkasan WA
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenWhatsApp();
              }}
              className="w-11 h-11 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition"
              title="Kirim Ringkasan WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Catat Pengeluaran */}
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap">
              Catat Pengeluaran (-)
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAddPengeluaran();
              }}
              className="w-11 h-11 rounded-full bg-rose-600 text-white shadow-lg flex items-center justify-center hover:bg-rose-700 active:scale-95 transition"
              title="Tambah Pengeluaran Kas"
            >
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Catat Pemasukan */}
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap">
              Catat Pemasukan (+)
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAddPemasukan();
              }}
              className="w-11 h-11 rounded-full bg-emerald-700 text-white shadow-lg flex items-center justify-center hover:bg-emerald-800 active:scale-95 transition"
              title="Tambah Pemasukan Kas"
            >
              <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* Main Material 3 Floating Action Button */}
      <button
        onClick={toggle}
        className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-white transition-all transform active:scale-90 ${
          isOpen ? 'bg-slate-800 rotate-45' : 'bg-emerald-700 hover:bg-emerald-800'
        }`}
        aria-label="Aksi Cepat Transaksi"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};

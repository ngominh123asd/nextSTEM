import React from 'react';

interface SuccessPopupProps {
  successMessage: string | null | undefined;
}

export default function SuccessPopup({ successMessage }: SuccessPopupProps) {
  if (!successMessage) return null;

  return (
    <>
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/20 p-8 max-w-sm w-full mx-4 text-center animate-[popIn_0.35s_ease-out]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="material-symbols-outlined text-white text-3xl">check_circle</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#1E3A8A] mb-2">Thành công!</h3>
          <p className="text-slate-500 font-medium text-sm">{successMessage}</p>
          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-[shrink_2s_linear_forwards]" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  );
}

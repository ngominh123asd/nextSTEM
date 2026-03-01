import React from 'react';
import GlassSurface from '../../../components/GlassSurface';
import type { MobileAuthProps } from '../types';

export default function MobileAuth({
  loginEmail, setLoginEmail, loginPass, setLoginPass,
  showLoginPass, setShowLoginPass,
  regName, setRegName, regEmail, setRegEmail,
  regPass, setRegPass, regConfirm, setRegConfirm,
  showRegPass, setShowRegPass, showRegConfirm, setShowRegConfirm,
  agreeTerms, setAgreeTerms,
  handleLogin, handleRegister,
  displayError, isRegister, setIsRegister, loading,
}: MobileAuthProps) {
  return (
    <div className="lg:hidden absolute inset-0 z-30 flex flex-col overflow-y-auto"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 30%, #f5f0ff 60%, #eef4ff 100%)' }}>

      {/* Mobile header banner */}
      <div className="relative h-48 flex-shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#2E4DA7] to-[#4361C4]" />
        <div className="absolute w-40 h-40 -top-10 -right-10 rounded-full bg-white/5 blur-2xl" />
        <button onClick={() => {/* handled by parent onClose */}}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20
            flex items-center justify-center text-white/80">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </button>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/images/about.jpg" alt="nextSTEM" className="w-28 h-28 object-contain drop-shadow-xl" />
        </div>
        <div className="absolute bottom-4 left-6">
          <h2 className="text-xl font-extrabold text-white">
            {isRegister ? 'Join Us Today' : 'Welcome Back'}
          </h2>
          <p className="text-blue-200/90 text-xs font-medium">
            {isRegister ? 'Khám phá tri thức cùng nextSTEM' : 'Tiếp tục hành trình học tập'}
          </p>
        </div>
      </div>

      {/* Mobile form */}
      <div className="flex-1 px-6 py-6">
        {/* Tab switcher */}
        <div className="flex mb-6 p-1 bg-white/50 backdrop-blur-xl rounded-2xl border border-white/60">
          <button onClick={() => setIsRegister(false)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
              ${!isRegister ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>
            Đăng nhập
          </button>
          <button onClick={() => setIsRegister(true)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
              ${isRegister ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>
            Đăng ký
          </button>
        </div>

        {/* Mobile Login */}
        {!isRegister && (
          <form onSubmit={handleLogin} className="space-y-4">
            {displayError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50/80 border border-red-200/60 text-red-600 text-sm font-medium">
                <span className="material-symbols-outlined text-lg">error</span>
                {displayError}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A8A] mb-1.5">Email</label>
              <input type="text" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1E3A8A] mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input type={showLoginPass ? 'text' : 'password'} value={loginPass} onChange={e => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300 transition-all pr-12" />
                <button type="button" onClick={() => setShowLoginPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-xl">{showLoginPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <button type="submit" className="hidden" />
            <GlassSurface
              width="100%"
              height={52}
              borderRadius={16}
              className={`cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-500/25 ${loading ? 'opacity-70 pointer-events-none' : ''}`}
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              onClick={handleLogin}
            >
              <span className="text-white font-bold text-base flex items-center gap-2">
                {loading ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</> : 'Đăng nhập'}
              </span>
            </GlassSurface>
            <div className="flex gap-3">
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-slate-200/80 bg-white/60 text-sm font-semibold text-slate-700">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-slate-200/80 bg-white/60 text-sm font-semibold text-slate-700">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
            </div>
          </form>
        )}

        {/* Mobile Register */}
        {isRegister && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            {displayError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50/80 border border-red-200/60 text-red-600 text-sm font-medium">
                <span className="material-symbols-outlined text-lg">error</span>
                {displayError}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A8A] mb-1">Họ và tên</label>
              <input type="text" value={regName} onChange={e => setRegName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1E3A8A] mb-1">Email</label>
              <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1E3A8A] mb-1">Mật khẩu</label>
              <div className="relative">
                <input type={showRegPass ? 'text' : 'password'} value={regPass} onChange={e => setRegPass(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300 transition-all pr-12" />
                <button type="button" onClick={() => setShowRegPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-xl">{showRegPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1E3A8A] mb-1">Xác nhận mật khẩu</label>
              <div className="relative">
                <input type={showRegConfirm ? 'text' : 'password'} value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300 transition-all pr-12" />
                <button type="button" onClick={() => setShowRegConfirm(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-xl">{showRegConfirm ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <div onClick={() => setAgreeTerms(v => !v)}
                className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
                  ${agreeTerms ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white/60'}`}>
                {agreeTerms && <span className="material-symbols-outlined text-white text-sm">check</span>}
              </div>
              <span className="text-xs text-slate-500">Đồng ý <span className="text-blue-600 font-semibold">Điều khoản</span> & <span className="text-blue-600 font-semibold">Chính sách</span></span>
            </label>
            <GlassSurface
              width="100%"
              height={52}
              borderRadius={16}
              className={`cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-500/25 ${loading ? 'opacity-70 pointer-events-none' : ''}`}
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              onClick={handleRegister}
            >
              <span className="text-white font-bold text-base flex items-center gap-2">
                {loading ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</> : 'Đăng ký'}
              </span>
            </GlassSurface>
            <div className="flex gap-3">
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-slate-200/80 bg-white/60 text-sm font-semibold text-slate-700">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-slate-200/80 bg-white/60 text-sm font-semibold text-slate-700">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

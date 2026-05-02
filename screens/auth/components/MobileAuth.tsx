import React from 'react';
import GlassSurface from '../../../components/GlassSurface';
import SocialAuthButtons from './SocialAuthButtons';
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
  onClose, onOAuthLogin,
}: MobileAuthProps) {
  return (
    <div className="lg:hidden absolute inset-0 z-30 flex flex-col overflow-y-auto"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 30%, #f5f0ff 60%, #eef4ff 100%)' }}>

      {/* Mobile header banner */}
      <div className="relative h-48 flex-shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#2E4DA7] to-[#4361C4]" />
        <div className="absolute w-40 h-40 -top-10 -right-10 rounded-full bg-white/5 blur-2xl" />
        <button onClick={onClose}
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
              ${!isRegister ? 'bg-gradient-to-r from-[#1152d4] to-[#2E6AE6] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500'}`}>
            Đăng nhập
          </button>
          <button onClick={() => setIsRegister(true)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
              ${isRegister ? 'bg-gradient-to-r from-[#1152d4] to-[#2E6AE6] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500'}`}>
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
            <SocialAuthButtons onOAuthLogin={onOAuthLogin} loading={loading} />
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
            <SocialAuthButtons onOAuthLogin={onOAuthLogin} loading={loading} />
          </form>
        )}
      </div>
    </div>
  );
}

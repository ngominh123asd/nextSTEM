import React from 'react';
import GlassSurface from '../../../components/GlassSurface';
import SocialAuthButtons from './SocialAuthButtons';
import type { LoginFormProps } from '../types';

export default function LoginForm({
  loginEmail, setLoginEmail, loginPass, setLoginPass,
  showLoginPass, setShowLoginPass, rememberMe, setRememberMe,
  handleLogin, displayError, isRegister, loading, toggle,
  onOAuthLogin,
}: LoginFormProps) {
  return (
    <div className={`absolute inset-y-0 right-0 w-1/2 flex flex-col px-10 lg:px-14 overflow-y-auto pt-12 pb-8
      transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]
      ${isRegister ? 'opacity-0 pointer-events-none translate-x-8' : 'opacity-100 pointer-events-auto translate-x-0'}`}>

      <h1 className="text-3xl font-extrabold text-[#1E3A8A] mb-2">Chào mừng bạn quay lại!</h1>
      <form onSubmit={handleLogin} className="space-y-5">
        {/* Error message */}
        {displayError && !isRegister && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50/80 border border-red-200/60 text-red-600 text-sm font-medium">
            <span className="material-symbols-outlined text-lg">error</span>
            {displayError}
          </div>
        )}
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-[#1E3A8A] mb-1.5">Tên tài khoản (hoặc địa chỉ email)</label>
          <input type="text" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
            placeholder="example@gmail.com"
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300 transition-all" />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-[#1E3A8A] mb-1.5">Mật khẩu</label>
          <div className="relative">
            <input type={showLoginPass ? 'text' : 'password'} value={loginPass} onChange={e => setLoginPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300 transition-all pr-12" />
            <button type="button" onClick={() => setShowLoginPass(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <span className="material-symbols-outlined text-xl">{showLoginPass ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div onClick={() => setRememberMe(v => !v)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
                ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white/60'}`}>
              {rememberMe && <span className="material-symbols-outlined text-white text-sm">check</span>}
            </div>
            <span className="text-sm text-slate-600 font-medium">Lưu thông tin đăng nhập</span>
          </label>
          <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Quên tài khoản?
          </button>
        </div>

        {/* Cloudflare badge (decorative) */}
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">check</span>
            </div>
            <span className="text-sm text-slate-500 font-medium">Đã xác minh bảo mật</span>
          </div>
        </div>

        {/* Hidden submit button for Enter key */}
        <button type="submit" className="hidden" />

        {/* Submit */}
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
      </form>

      {/* Bottom Layout to fill space evenly */}
      <div className="mt-auto pt-6">
        {/* Divider */}
        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px bg-slate-200/80" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hoặc đăng nhập bằng</span>
          <div className="flex-1 h-px bg-slate-200/80" />
        </div>

      {/* Social */}
      <SocialAuthButtons onOAuthLogin={onOAuthLogin} loading={loading} />

      {/* Switch */}
      <p className="text-center text-sm text-slate-500 mt-6">
        Chưa có tài khoản?{' '}
        <button onClick={toggle} className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
          Đăng ký ngay
        </button>
      </p>
      </div>
    </div>
  );
}

import React from 'react';
import GlassSurface from '../../../components/GlassSurface';
import type { RegisterFormProps } from '../types';

export default function RegisterForm({
  regName, setRegName, regEmail, setRegEmail,
  regPass, setRegPass, regConfirm, setRegConfirm,
  showRegPass, setShowRegPass, showRegConfirm, setShowRegConfirm,
  agreeTerms, setAgreeTerms,
  handleRegister, displayError, isRegister, loading, toggle,
}: RegisterFormProps) {
  return (
    <div className={`absolute inset-y-0 left-0 w-1/2 overflow-y-auto px-10 lg:px-14 py-12
      transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]
      ${isRegister ? 'opacity-100 pointer-events-auto translate-x-0' : 'opacity-0 pointer-events-none -translate-x-8'}`}>

      <h1 className="text-3xl font-extrabold text-[#1E3A8A] mb-2">Tạo tài khoản mới</h1>
      <p className="text-slate-500 font-medium mb-5">Bắt đầu hành trình chinh phục tri thức ngay hôm nay</p>

      <form onSubmit={handleRegister} className="space-y-3.5">
        {/* Error message */}
        {displayError && isRegister && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50/80 border border-red-200/60 text-red-600 text-sm font-medium">
            <span className="material-symbols-outlined text-lg">error</span>
            {displayError}
          </div>
        )}
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-[#1E3A8A] mb-1">Họ và tên</label>
          <input type="text" value={regName} onChange={e => setRegName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300 transition-all" />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-[#1E3A8A] mb-1">Email</label>
          <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
            placeholder="example@gmail.com"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300 transition-all" />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-[#1E3A8A] mb-1">Mật khẩu</label>
          <div className="relative">
            <input type={showRegPass ? 'text' : 'password'} value={regPass} onChange={e => setRegPass(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300 transition-all pr-12" />
            <button type="button" onClick={() => setShowRegPass(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <span className="material-symbols-outlined text-xl">{showRegPass ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-[#1E3A8A] mb-1">Xác nhận mật khẩu</label>
          <div className="relative">
            <input type={showRegConfirm ? 'text' : 'password'} value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300 transition-all pr-12" />
            <button type="button" onClick={() => setShowRegConfirm(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <span className="material-symbols-outlined text-xl">{showRegConfirm ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <div onClick={() => setAgreeTerms(v => !v)}
            className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
              ${agreeTerms ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white/60'}`}>
            {agreeTerms && <span className="material-symbols-outlined text-white text-sm">check</span>}
          </div>
          <span className="text-sm text-slate-500 leading-relaxed">
            Tôi đồng ý với <button type="button" className="text-blue-600 font-semibold hover:underline">Điều khoản sử dụng</button> và <button type="button" className="text-blue-600 font-semibold hover:underline">Chính sách bảo mật</button>
          </span>
        </label>

        {/* Submit */}
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
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-3">
        <div className="flex-1 h-px bg-slate-200/80" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hoặc đăng ký bằng</span>
        <div className="flex-1 h-px bg-slate-200/80" />
      </div>

      {/* Social */}
      <div className="flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-sm
          hover:bg-white/80 hover:border-slate-300 transition-all font-semibold text-slate-700 text-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </button>
        <button className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-sm
          hover:bg-white/80 hover:border-slate-300 transition-all font-semibold text-slate-700 text-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </button>
      </div>

      {/* Switch */}
      <p className="text-center text-sm text-slate-500 mt-3">
        Đã có tài khoản?{' '}
        <button onClick={toggle} className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
          Đăng nhập
        </button>
      </p>
    </div>
  );
}

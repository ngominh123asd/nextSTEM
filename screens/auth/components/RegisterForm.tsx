import React from 'react';
import GlassSurface from '../../../components/GlassSurface';
import SocialAuthButtons from './SocialAuthButtons';
import type { RegisterFormProps } from '../types';

export default function RegisterForm({
  regName, setRegName, regEmail, setRegEmail,
  regPass, setRegPass, regConfirm, setRegConfirm,
  showRegPass, setShowRegPass, showRegConfirm, setShowRegConfirm,
  agreeTerms, setAgreeTerms,
  handleRegister, displayError, isRegister, loading, toggle,
  onOAuthLogin,
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
      <SocialAuthButtons onOAuthLogin={onOAuthLogin} loading={loading} />

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

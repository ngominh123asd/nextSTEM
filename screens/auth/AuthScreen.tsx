import React, { useState } from 'react';
import type { AuthProps } from './types';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SlidingPanel from './components/SlidingPanel';
import MobileAuth from './components/MobileAuth';
import SuccessPopup from './components/SuccessPopup';

export default function AuthScreen({ onLogin, onRegister, onClose, error, loading, onClearError, successMessage }: AuthProps) {
  const [isRegister, setIsRegister] = useState(false);

  /* ── Login form state ── */
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  /* ── Register form state ── */
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!loginEmail.trim() || !loginPass.trim()) {
      setLocalError('Vui lòng nhập email và mật khẩu');
      return;
    }
    onLogin(loginEmail, loginPass);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!regName.trim() || !regEmail.trim() || !regPass.trim()) {
      setLocalError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (regPass !== regConfirm) {
      setLocalError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (regPass.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    onRegister({ name: regName, email: regEmail, password: regPass });
  };

  const displayError = error || localError;

  const toggle = () => {
    setLocalError(null);
    onClearError?.();
    setIsRegister(v => !v);
  };

  const loginFormProps = {
    loginEmail, setLoginEmail, loginPass, setLoginPass,
    showLoginPass, setShowLoginPass, rememberMe, setRememberMe,
    handleLogin, displayError, isRegister, loading, toggle,
  };

  const registerFormProps = {
    regName, setRegName, regEmail, setRegEmail,
    regPass, setRegPass, regConfirm, setRegConfirm,
    showRegPass, setShowRegPass, showRegConfirm, setShowRegConfirm,
    agreeTerms, setAgreeTerms,
    handleRegister, displayError, isRegister, loading, toggle,
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #e8eeff 0%, #f0f4ff 30%, #f5f0ff 60%, #eef4ff 100%)', isolation: 'isolate' }}>

      {/* Ambient decorations */}
      <div className="absolute w-[500px] h-[500px] -top-32 -left-32 rounded-full bg-blue-200/25 blur-3xl pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bottom-0 right-0 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/15 blur-3xl pointer-events-none" />

      {/* ── Close button ── */}
      <button onClick={onClose}
        className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/60 backdrop-blur-xl border border-white/80 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-all shadow-lg">
        <span className="material-symbols-outlined text-xl">close</span>
      </button>

      {/* ── Main Card Container ── */}
      <div className="relative w-[960px] max-w-[95vw] h-[700px] max-h-[92vh] rounded-[2rem] overflow-hidden
        bg-white border border-slate-200/80 shadow-[0_24px_80px_rgba(30,58,138,0.12)]">

        {/* ── Desktop: LOGIN FORM (right side) ── */}
        <LoginForm {...loginFormProps} />

        {/* ── Desktop: REGISTER FORM (left side) ── */}
        <RegisterForm {...registerFormProps} />

        {/* ── Desktop: SLIDING PANEL ── */}
        <SlidingPanel isRegister={isRegister} onClose={onClose} />

        {/* ── MOBILE: Stacked layout ── */}
        <MobileAuth
          {...loginFormProps}
          {...registerFormProps}
          setIsRegister={setIsRegister}
        />
      </div>

      {/* ── Success Popup ── */}
      <SuccessPopup successMessage={successMessage} />
    </div>
  );
}

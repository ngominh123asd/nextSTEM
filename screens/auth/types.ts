import React from 'react';

export interface AuthProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (data: { name: string; email: string; password: string }) => void;
  onClose: () => void;
  error?: string | null;
  loading?: boolean;
  onClearError?: () => void;
  successMessage?: string | null;
}

/** Shared form state passed to sub-components */
export interface LoginFormProps {
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  loginPass: string;
  setLoginPass: (v: string) => void;
  showLoginPass: boolean;
  setShowLoginPass: React.Dispatch<React.SetStateAction<boolean>>;
  rememberMe: boolean;
  setRememberMe: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogin: (e: React.FormEvent) => void;
  displayError: string | null | undefined;
  isRegister: boolean;
  loading?: boolean;
  toggle: () => void;
}

export interface RegisterFormProps {
  regName: string;
  setRegName: (v: string) => void;
  regEmail: string;
  setRegEmail: (v: string) => void;
  regPass: string;
  setRegPass: (v: string) => void;
  regConfirm: string;
  setRegConfirm: (v: string) => void;
  showRegPass: boolean;
  setShowRegPass: React.Dispatch<React.SetStateAction<boolean>>;
  showRegConfirm: boolean;
  setShowRegConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  agreeTerms: boolean;
  setAgreeTerms: React.Dispatch<React.SetStateAction<boolean>>;
  handleRegister: (e: React.FormEvent) => void;
  displayError: string | null | undefined;
  isRegister: boolean;
  loading?: boolean;
  toggle: () => void;
}

export interface SlidingPanelProps {
  isRegister: boolean;
  onClose: () => void;
}

export interface MobileAuthProps extends LoginFormProps, RegisterFormProps {
  setIsRegister: React.Dispatch<React.SetStateAction<boolean>>;
}

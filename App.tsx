import React, { useState, useEffect } from 'react';
import Landing from './screens/landing/Landing';
import Onboarding from './screens/onboarding/Onboarding';
import Dashboard from './screens/dashboard/Dashboard';
import AuthScreen from './screens/auth/AuthScreen';
import AboutScreen from './screens/AboutScreen';
import AdminDashboard from './screens/admin/AdminDashboard';
import {
  apiLogin, apiRegister, apiLogout, apiGetMe, apiOnboarding,
  apiGoogleLogin, apiFacebookLogin,
  setToken, getToken,
  type UserData as ApiUser,
} from './lib/api';

type Screen = 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'about' | 'admin';

interface UserData {
  name: string;
  email: string;
  goals: string[];
  grade: string;
  school: string;
  subjects: string;
  interests: string[];
}

function apiUserToLocal(u: ApiUser): UserData {
  return {
    name: u.name,
    email: u.email,
    goals: u.goals ?? [],
    grade: u.grade ?? '',
    school: u.school ?? '',
    subjects: u.subjects ?? '',
    interests: u.interests ?? [],
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('user');

  /* ── Auto-dismiss error after 4s ── */
  useEffect(() => {
    if (!authError) return;
    const t = setTimeout(() => setAuthError(null), 4000);
    return () => clearTimeout(t);
  }, [authError]);

  /* ── Auto-login if token exists ── */
  useEffect(() => {
    const token = getToken();
    if (!token) { setInitializing(false); return; }
    apiGetMe()
      .then(user => {
        const local = apiUserToLocal(user);
        setUserData(local);
        setUserRole(user.role || 'user');
        // If admin, go to admin dashboard
        if (user.role === 'admin' || user.role === 'super_admin') {
          setScreen('admin');
        }
        // If onboarding incomplete, go to onboarding
        else if (!local.grade && local.goals.length === 0) {
          setScreen('onboarding');
        } else {
          setScreen('dashboard');
        }
      })
      .catch(() => { setToken(null); })
      .finally(() => setInitializing(false));
  }, []);

  const openOnboarding = () => {
    localStorage.removeItem('mbti_completed');
    localStorage.removeItem('mbti_answers');
    setScreen('onboarding');
  };
  const openAuth = () => { setAuthError(null); setScreen('auth'); };
  const openAbout = () => setScreen('about');

  const handleOnboardingComplete = async (data: any) => {
    try {
      if (getToken()) {
        const updated = await apiOnboarding({
          name: data.name,
          goals: data.goals,
          grade: data.grade,
          school: data.school,
          subjects: data.subjects,
          interests: data.interests,
        });
        setUserData(apiUserToLocal(updated));

        // Sync certificates & projects to Portfolio API
        const { apiCreateCertificate, apiCreateProject, apiUploadCertFile } = await import('./lib/api');

        // Upload cert files and create cert records
        for (const cert of (data.certs || [])) {
          let fileUrl: string | null = null;
          // If there's a file, upload it first
          if (cert.fileName && cert._file) {
            try {
              const uploaded = await apiUploadCertFile(cert._file);
              fileUrl = uploaded.file_url;
            } catch (e) { console.warn('Cert file upload failed:', e); }
          }
          try {
            await apiCreateCertificate({
              title: cert.title,
              score: cert.score || null,
              date: cert.date || null,
              organisation: cert.organisation || null,
              file_url: fileUrl,
            });
          } catch (e) { console.warn('Create cert failed:', e); }
        }

        // Create project records
        for (const proj of (data.projects || [])) {
          try {
            await apiCreateProject({
              title: proj.title,
              description: proj.description || null,
              category: proj.category || null,
              status: proj.status,
              progress: proj.progress,
            });
          } catch (e) { console.warn('Create project failed:', e); }
        }
      } else {
        setUserData(data);
      }
      setScreen('dashboard');
    } catch {
      // Fallback – still go to dashboard with local data
      setUserData(data);
      setScreen('dashboard');
    }
  };

  const handleLogin = async (email: string, password: string, rememberMe: boolean = true) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const { access_token } = await apiLogin(email, password);
      setToken(access_token, rememberMe);
      const user = await apiGetMe();
      const local = apiUserToLocal(user);
      setUserData(local);
      setUserRole(user.role || 'user');
      // If admin, go to admin dashboard
      if (user.role === 'admin' || user.role === 'super_admin') {
        setScreen('admin');
      }
      // If onboarding incomplete, go to onboarding
      else if (!local.grade && local.goals.length === 0) {
        setScreen('onboarding');
      } else {
        setScreen('dashboard');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Đăng nhập thất bại');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (data: { name: string; email: string; password: string }) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const { access_token } = await apiRegister(data.name, data.email, data.password);
      setToken(access_token);
      const user = await apiGetMe();
      setUserData(apiUserToLocal(user));
      setUserRole(user.role || 'user');
      setSuccessMsg('Đăng ký thành công! Chào mừng bạn đến với nextSTEM!');
      setTimeout(() => {
        setSuccessMsg(null);
        setScreen('onboarding');
      }, 2000);
    } catch (err: any) {
      setAuthError(err.message || 'Đăng ký thất bại');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook', token: string) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const loginMethod = provider === 'google' ? apiGoogleLogin : apiFacebookLogin;
      const { access_token } = await loginMethod(token);
      setToken(access_token);
      const user = await apiGetMe();
      const local = apiUserToLocal(user);
      setUserData(local);
      setUserRole(user.role || 'user');
      
      if (user.role === 'admin' || user.role === 'super_admin') {
        setScreen('admin');
      } else if (!local.grade && local.goals.length === 0) {
        setScreen('onboarding');
      } else {
        setScreen('dashboard');
      }
    } catch (err: any) {
      setAuthError(err.message || `Đăng nhập ${provider} thất bại`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    setToken(null);
    setUserData(null);
    localStorage.removeItem('mbti_completed');
    localStorage.removeItem('mbti_answers');
    setScreen('landing');
  };

  if (initializing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8eeff 0%, #f0f4ff 30%, #f5f0ff 60%, #eef4ff 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (screen === 'admin') {
    return <AdminDashboard onBack={handleLogout} onSwitchToUser={() => setScreen('dashboard')} userName={userData?.name} userEmail={userData?.email} />;
  }

  if (screen === 'dashboard' && userData) {
    return (
      <Dashboard
        userData={userData}
        onLogout={handleLogout}
        userRole={userRole}
        onOpenAdmin={() => setScreen('admin')}
      />
    );
  }

  if (screen === 'onboarding') {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        onClose={() => setScreen('landing')}
        initialData={userData ?? undefined}
      />
    );
  }

  return (
    <>
      <Landing onStartDemo={openOnboarding} onOpenAuth={openAuth} onOpenAbout={openAbout} />
      {screen === 'about' && (
        <AboutScreen
          onClose={() => setScreen('landing')}
          onStartDemo={openOnboarding}
        />
      )}
      {screen === 'auth' && (
        <AuthScreen
          onLogin={handleLogin}
          onRegister={handleRegister}
          onOAuthLogin={handleOAuthLogin}
          onClose={() => setScreen('landing')}
          error={authError}
          loading={authLoading}
          onClearError={() => setAuthError(null)}
          successMessage={successMsg}
        />
      )}
    </>
  );
}
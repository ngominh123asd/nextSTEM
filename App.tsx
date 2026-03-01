import React, { useState, useEffect } from 'react';
import Landing from './screens/landing/Landing';
import Onboarding from './screens/Onboarding';
import Dashboard from './screens/dashboard/Dashboard';
import AuthScreen from './screens/auth/AuthScreen';
import AboutScreen from './screens/AboutScreen';
import AdminDashboard from './screens/admin/AdminDashboard';
import {
  apiLogin, apiRegister, apiLogout, apiGetMe, apiOnboarding,
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

  const openOnboarding = () => setScreen('onboarding');
  const openAuth = () => { setAuthError(null); setScreen('auth'); };
  const openAbout = () => setScreen('about');

  const handleOnboardingComplete = async (data: UserData) => {
    try {
      const updated = await apiOnboarding({
        name: data.name,
        goals: data.goals,
        grade: data.grade,
        school: data.school,
        subjects: data.subjects,
        interests: data.interests,
      });
      setUserData(apiUserToLocal(updated));
      setScreen('dashboard');
    } catch {
      // Fallback – still go to dashboard with local data
      setUserData(data);
      setScreen('dashboard');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const { access_token } = await apiLogin(email, password);
      setToken(access_token);
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

  const handleLogout = async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    setToken(null);
    setUserData(null);
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
    return <AdminDashboard onBack={() => setScreen('dashboard')} onSwitchToUser={() => setScreen('dashboard')} userName={userData?.name} userEmail={userData?.email} />;
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

  return (
    <>
      <Landing onStartDemo={openOnboarding} onOpenAuth={openAuth} onOpenAbout={openAbout} onOpenSpeed={() => {}} />
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
          onClose={() => setScreen('landing')}
          error={authError}
          loading={authLoading}
          onClearError={() => setAuthError(null)}
          successMessage={successMsg}
        />
      )}
      {screen === 'onboarding' && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          onClose={() => setScreen('landing')}
          initialData={userData ?? undefined}
        />
      )}
    </>
  );
}
import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

interface SocialAuthButtonsProps {
  onOAuthLogin: (provider: 'google' | 'facebook', token: string) => void;
  loading?: boolean;
}

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';

export default function SocialAuthButtons({ onOAuthLogin, loading }: SocialAuthButtonsProps) {
  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // The token response contains access_token, but we need id_token for standard verify or we can use access_token to fetch user info.
      // Wait, useGoogleLogin (implicit flow) returns access_token. We need to verify it.
      // Wait, for standard backend verification, we usually use implicit flow to get access_token, or use code flow to get id_token.
      // Actually, if we send access_token to backend, backend can verify it by calling Google API.
      // But our backend uses `id_token.verify_oauth2_token`. To get id_token from useGoogleLogin, we must use `flow: 'auth-code'` or use the `<GoogleLogin />` component.
      // Let's use `useGoogleLogin` with `flow: 'implicit'` but request `id_token`?
      // No, `useGoogleLogin` does not return id_token.
      // Let's modify to use `access_token` and verify it via google userinfo endpoint on backend, OR just pass access_token.
      // Wait, let's just pass `tokenResponse.access_token` and handle it in the backend, OR change backend to verify access_token.
      // Actually, `@react-oauth/google` provides `useGoogleLogin` which by default returns an `access_token`.
      // Let's pass the access_token.
      onOAuthLogin('google', tokenResponse.access_token);
    },
    onError: (error) => console.error('Google Login Failed', error),
  });

  const responseFacebook = (response: any) => {
    if (response.accessToken) {
      onOAuthLogin('facebook', response.accessToken);
    } else {
      console.error('Facebook Login Failed', response);
    }
  };

  return (
    <div className="flex gap-3">
      <button
        type="button"
        disabled={loading}
        onClick={() => loginWithGoogle()}
        className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-sm
          hover:bg-white/80 hover:border-slate-300 transition-all font-semibold text-slate-700 text-sm disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
        Google
      </button>

      <FacebookLogin
        appId={FACEBOOK_APP_ID}
        fields="name,email,picture"
        callback={responseFacebook}
        render={renderProps => (
          <button
            type="button"
            disabled={loading || renderProps.isDisabled}
            onClick={renderProps.onClick}
            className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-sm
              hover:bg-white/80 hover:border-slate-300 transition-all font-semibold text-slate-700 text-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            Facebook
          </button>
        )}
      />
    </div>
  );
}

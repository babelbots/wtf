import React, { useState } from 'react';
import { Mail, Lock, Dumbbell, ArrowLeft } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail, loginWithApple } from '../lib/firebase';

interface LoginScreenProps {
  onBack?: () => void;
}

export function LoginScreen({ onBack }: LoginScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const backgrounds = [
    '/bg_crossfit_1_1783526187355.jpg',
    '/bg_crossfit_2_1783526197644.jpg',
    '/bg_crossfit_3_1783526207597.jpg'
  ];

  const bgIndex = new Date().getDay() % backgrounds.length;

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate.');
    }
  };

  const handleAppleLogin = async () => {
    try {
      setError(null);
      await loginWithApple();
    } catch (err: any) {
      setError(err.message || 'Failed to login with Apple.');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden">

      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {backgrounds.map((bg, idx) => (
          <div 
            key={bg}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${idx === bgIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
            style={{ backgroundImage: `url('${bg}')` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/40 to-background/95" />
      </div>

      {/* Content Layer */}
      <main className="relative z-10 w-full max-w-md flex flex-col items-center">
        
        {/* Brand Header */}
        <header className="text-center mb-10 animate-in slide-in-from-top duration-700 relative w-full">
          {onBack && (
            <button 
              onClick={onBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full glass-panel hover:bg-white/10 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-on-surface" />
            </button>
          )}
          <div className="inline-flex items-center justify-center p-4 bg-secondary-container rounded-full mb-6 shadow-glow mx-auto">
            <Dumbbell className="text-secondary w-8 h-8" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-background mb-2 tracking-tight">
            WOD the FAQ
          </h1>
          <p className="text-lg text-on-surface-variant max-w-[320px] font-medium mx-auto">
            Log in to track your suffering.
          </p>
        </header>

        {/* Login/Register Card */}
        <section className="w-full glass-card rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 delay-150">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-on-surface">Welcome Back</h2>
            <p className="text-on-surface-variant mt-2">Use your Google account to continue.</p>
          </div>

          {/* Divider */}

          {error && <div className="text-error text-sm text-center mb-4">{error}</div>}

          {/* Social Logins */}
          <div className="flex justify-center">
            <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-2 h-14 glass-panel rounded-full hover:bg-white/10 transition-colors active:scale-95">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span className="font-bold text-sm">Continue with Google</span>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <div className="mt-6 flex gap-6 justify-center opacity-60">
            <a href="#" className="text-xs font-bold hover:opacity-100 transition-opacity">Privacy</a>
            <a href="#" className="text-xs font-bold hover:opacity-100 transition-opacity">Terms</a>
            <a href="#" className="text-xs font-bold hover:opacity-100 transition-opacity">Support</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

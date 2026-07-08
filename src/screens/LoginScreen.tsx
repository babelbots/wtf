import React, { useState, useEffect } from 'react';
import { Mail, Lock, Dumbbell } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, loginWithApple } from '../lib/firebase';

export function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bgIndex, setBgIndex] = useState(0);

  const backgrounds = [
    '/bg_crossfit_1_1783526187355.jpg',
    '/bg_crossfit_2_1783526197644.jpg',
    '/bg_crossfit_3_1783526207597.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await loginWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login with email.');
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
        <header className="text-center mb-10 animate-in slide-in-from-top duration-700">
          <div className="inline-flex items-center justify-center mb-6 shadow-glow">
            <img src="/logo_wtf_1783526217144.jpg" alt="WTF Logo" className="w-24 h-24 rounded-full border-2 border-secondary object-cover" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-background mb-2 tracking-tight">
            WOD the FAQ
          </h1>
          <p className="text-lg text-on-surface-variant max-w-[320px] font-medium mx-auto">
            Log in to track your suffering.
          </p>
        </header>

        {/* Login Card */}
        <section className="w-full glass-card rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 delay-150">
          <form className="space-y-6" onSubmit={handleEmailLogin}>
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary-light ml-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline-variant group-focus-within:text-secondary transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="beast@mode.com"
                  className="w-full h-14 pl-12 pr-4 bg-surface-container rounded-xl border-2 border-transparent focus:border-secondary focus:ring-0 text-on-surface placeholder:text-outline-variant transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary-light ml-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline-variant group-focus-within:text-secondary transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-4 bg-surface-container rounded-xl border-2 border-transparent focus:border-secondary focus:ring-0 text-on-surface placeholder:text-outline-variant transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a href="#" className="text-xs font-bold text-secondary hover:text-secondary/80 transition-colors">
                Forgot your PR?
              </a>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full h-14 bg-secondary text-on-secondary font-bold text-lg rounded-full shadow-glow hover:scale-[1.02] active:scale-95 transition-all duration-200 uppercase tracking-wide"
            >
              Log In
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-outline-variant opacity-30"></div>
            <span className="mx-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Or crush it with</span>
            <div className="flex-grow border-t border-outline-variant opacity-30"></div>
          </div>

          {error && <div className="text-error text-sm text-center mb-4">{error}</div>}

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 h-14 glass-panel rounded-full hover:bg-white/10 transition-colors active:scale-95">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span className="font-bold text-sm">Google</span>
            </button>
            <button type="button" onClick={handleAppleLogin} className="flex items-center justify-center gap-2 h-14 glass-panel rounded-full hover:bg-white/10 transition-colors active:scale-95">
              <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.844-1.026 1.403-2.454 1.247-3.83-1.182.052-2.61.792-3.467 1.792-.767.883-1.442 2.35-1.26 3.688 1.312.104 2.636-.623 3.48-1.65z"></path>
              </svg>
              <span className="font-bold text-sm">Apple</span>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant font-medium">
            New to the pain? <a href="#" className="text-secondary font-bold hover:underline">Join the box</a>
          </p>
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

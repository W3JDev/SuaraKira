import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MicIcon, WalletIcon, SparklesIcon, LoaderIcon } from '../components/Icons';

interface AuthPageProps {
  onLogin: (email: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('boss@nasilemak.com');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin(email);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Left Panel: Brand & Value Prop (Hidden on small mobile, visible on tablet+) */}
      <div className="hidden md:flex flex-col justify-between w-full md:w-1/2 lg:w-5/12 bg-emerald-900 dark:bg-emerald-950 text-white p-12 relative overflow-hidden">
        
        {/* Abstract Background Pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800 dark:bg-emerald-900 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 dark:bg-emerald-800 rounded-full blur-3xl opacity-30 translate-y-1/3 -translate-x-1/3"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center">
               <MicIcon className="w-5 h-5 text-emerald-900" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SuaraKira</h1>
          </div>
          
          <div className="space-y-8">
            <h2 className="text-4xl font-bold leading-tight">
              Focus on your food, <br/>
              <span className="text-emerald-400">we handle the numbers.</span>
            </h2>
            <p className="text-emerald-100 text-lg opacity-90 max-w-sm">
              The AI-powered accountant built specifically for Malaysian hawkers. 
              Voice-first, effortless, and powerful.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
           <div className="flex items-center gap-4 text-sm font-medium text-emerald-200">
              <div className="flex items-center gap-2">
                 <MicIcon className="w-4 h-4" /> Voice Recording
              </div>
              <div className="w-1 h-1 bg-emerald-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                 <WalletIcon className="w-4 h-4" /> Profit Tracking
              </div>
              <div className="w-1 h-1 bg-emerald-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                 <SparklesIcon className="w-4 h-4" /> AI Insights
              </div>
           </div>
           <p className="text-xs text-emerald-400/60">© 2024 w3jdev · w3jdev.com</p>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative">
        
        {/* Mobile Logo */}
        <div className="md:hidden absolute top-8 left-6 flex items-center gap-2">
           <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
               <MicIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">SuaraKira</h1>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              {isLogin ? 'Enter your details to access your dashboard.' : 'Start your 30-day free trial today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="boss@nasilemak.com"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {!isLogin && (
               <div className="flex items-start gap-2 pt-2">
                 <input type="checkbox" required className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                 <p className="text-xs text-slate-500 dark:text-slate-400">I agree to the <span className="text-emerald-600 dark:text-emerald-400 font-medium">Terms of Service</span> and <span className="text-emerald-600 dark:text-emerald-400 font-medium">Privacy Policy</span>.</p>
               </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <LoaderIcon className="w-4 h-4 animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-50 dark:bg-slate-900 text-slate-400">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
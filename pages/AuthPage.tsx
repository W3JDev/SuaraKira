import React, { useState } from "react";
import { motion } from "framer-motion";
import { MicIcon, WalletIcon, SparklesIcon, LoaderIcon } from "../components/Icons";
import { signIn, signUp } from "../services/supabase";

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName, role);
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      setIsLoading(false);
    }
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
              Your AI Finance Assistant.<br />
              <span className="text-emerald-400">Track in under 10 seconds.</span>
            </h2>
            <p className="text-emerald-100 text-lg opacity-90 max-w-sm">
              AI-native personal and business finance tracker. Just type or speak naturally—no accounting knowledge needed.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4 text-sm font-medium text-emerald-200">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" /> NLP AI
            </div>
            <div className="w-1 h-1 bg-emerald-600 rounded-full"></div>
            <div className="flex items-center gap-2">
              <MicIcon className="w-4 h-4" /> Type or Speak
            </div>
            <div className="w-1 h-1 bg-emerald-600 rounded-full"></div>
            <div className="flex items-center gap-2">
              <WalletIcon className="w-4 h-4" /> Smart Insights
            </div>
          </div>
          <p className="text-xs text-emerald-400/60">© 2026 w3jdev · w3jdev.com</p>
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
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              {isLogin
                ? "Enter your details to access your dashboard."
                : "Start tracking personal or business finances in under 10 seconds."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ahmad bin Ali"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="boss@nasilemak.com"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Account Type
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "staff")}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin / Owner</option>
                </select>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  I agree to the{" "}
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Privacy Policy
                  </span>
                  .
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <LoaderIcon className="w-4 h-4 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

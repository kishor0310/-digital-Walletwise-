import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Wallet,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('megasree@email.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      {/* Top Brand & Theme Toggle */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative px-4">
        <button
          onClick={toggleTheme}
          className="absolute right-4 top-0 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs"
          title="Toggle light / dark mode"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link to="/" className="inline-flex items-center space-x-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/25">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Wallet<span className="text-teal-500">Wise</span>
          </span>
        </Link>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Sign in to your digital wallet
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Academic DBMS Demonstration Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 py-8 px-6 sm:px-10 rounded-2xl shadow-sm sm:shadow-md">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Accounts */}
          <div className="mb-6 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-teal-500" />
              <span>One-Click Academic Demo Logins:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('megasree@email.com', 'password123')}
                className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition text-left ${
                  email === 'megasree@email.com'
                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-400 text-teal-700 dark:text-teal-300 font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div>Mega Sree</div>
                <div className="text-[10px] text-slate-400 font-normal">Standard User</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('admin@walletwise.com', 'admin123')}
                className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition text-left ${
                  email === 'admin@walletwise.com'
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-700 dark:text-purple-300 font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div>Admin</div>
                <div className="text-[10px] text-slate-400 font-normal">System Admin</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-teal-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Authenticating with Bcrypt...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have a wallet yet?{' '}
            <Link to="/register" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

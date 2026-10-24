import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DemoAlertBanner from '../components/DemoAlertBanner';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Wallet,
  Calendar,
  Lock,
  Sun,
  Moon,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

export default function ProfilePage() {
  const { user, wallet } = useAuth();
  const { theme, isDark, toggleTheme, setExplicitTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(wallet?.wallet_number || 'WW1123456789');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          User Profile & Security
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Account identity and associated digital wallet properties
        </p>
      </div>

      <DemoAlertBanner />

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white dark:bg-teal-600 flex items-center justify-center font-black text-xl shadow-md">
              {user?.fullName?.slice(0, 2).toUpperCase() || 'MS'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {user?.fullName || 'Mega Sree'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email || 'megasree@email.com'}
              </p>
              <div className="inline-flex items-center space-x-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Role: {user?.role || 'USER'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Simulated KYC Verified</span>
            </span>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 font-semibold block mb-1">Full Name</span>
            <span className="text-slate-900 dark:text-white font-bold text-sm">
              {user?.fullName || 'Mega Sree'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 font-semibold block mb-1">Registered Email</span>
            <span className="text-slate-900 dark:text-white font-bold text-sm">
              {user?.email || 'megasree@email.com'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 font-semibold block mb-1">Phone Number</span>
            <span className="text-slate-900 dark:text-white font-bold text-sm">
              {user?.phone || '+91 98765 43210'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold block mb-1">Wallet Number</span>
              <button
                onClick={handleCopyWallet}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                title="Copy"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <span className="text-slate-900 dark:text-white font-mono font-bold text-sm">
              {wallet?.wallet_number || 'WW1123456789'}
            </span>
          </div>
        </div>

        {/* Theme Settings row (Specific to user prompt: convert dark mode into light mode) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Theme Appearance</h4>
            <p className="text-xs text-slate-400">Toggle between clean Light Mode (default) and Dark Mode</p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setExplicitTheme('light')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                !isDark
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light Mode</span>
            </button>
            <button
              onClick={() => setExplicitTheme('dark')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isDark
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

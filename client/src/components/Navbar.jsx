import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useVoice } from '../context/VoiceContext';
import {
  Menu,
  Sun,
  Moon,
  Mic,
  Shield,
  Bell,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ setMobileOpen }) {
  const { user } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const { startListening, setIsAssistantOpen, isListening } = useVoice();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return 'WW';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 h-18 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center space-x-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen?.(prev => !prev)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.fullName || 'Mega Sree'}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Here's what's happening with your wallet today.
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5">
        {/* Voice Assistant Trigger in Navbar */}
        <button
          onClick={() => {
            setIsAssistantOpen(true);
            startListening();
          }}
          className={`relative p-2.5 rounded-xl border transition flex items-center space-x-1.5 ${
            isListening
              ? 'bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-slate-700'
          }`}
          title="WiseVoice Assistant"
        >
          <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-semibold hidden md:inline">Voice</span>
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* User Profile Pill */}
        <div
          onClick={() => navigate('/dashboard/profile')}
          className="flex items-center space-x-2.5 pl-2 py-1 pr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
        >
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-teal-600 flex items-center justify-center font-bold text-xs shadow-sm">
            {getInitials(user?.fullName || 'Mega Sree')}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {user?.fullName || 'Mega Sree'}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-400 leading-tight">
              {user?.role === 'ADMIN' ? 'Administrator' : 'User'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Wallet,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  CheckCircle2,
  Database,
  Layers,
  Sparkles,
  TrendingUp,
  CreditCard,
  Sun,
  Moon,
  Bot
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-teal-500 selection:text-white relative overflow-hidden">
      {/* Background Teal Waves / Glowing Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none">
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-teal-500/15 blur-[120px]" />
        <div className="absolute top-[100px] right-[-50px] w-[450px] h-[450px] rounded-full bg-cyan-500/15 blur-[100px]" />
      </div>

      {/* Navigation Header */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Wallet<span className="text-teal-400">Wise</span>
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-teal-400 transition">Features</a>
          <a href="#database" className="hover:text-teal-400 transition">DBMS Schema</a>
          <a href="#security" className="hover:text-teal-400 transition">Security</a>
          <Link to="/database-schema" className="text-teal-400 hover:text-teal-300 font-semibold flex items-center space-x-1">
            <Database className="w-3.5 h-3.5" />
            <span>ER Diagram</span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm shadow-lg shadow-teal-500/25 transition flex items-center space-x-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm shadow-lg shadow-teal-500/25 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section matching Reference Image */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headlines & Actions */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Academic DBMS Full-Stack Project</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your Digital Wallet, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-sky-400">
              Smarter & Safer
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Send money, pay bills, track your expenses — all in one place. WalletWise makes your financial life simple, secure and effortless with atomic database transactions and an intelligent voice assistant.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              to="/dashboard"
              className="px-7 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-extrabold text-base shadow-xl shadow-teal-500/30 transition transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/database-schema"
              className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-base transition flex items-center space-x-2"
            >
              <Database className="w-4 h-4 text-teal-400" />
              <span>Explore DBMS Schema</span>
            </Link>
          </div>

          {/* Key Trust Badges */}
          <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-800 max-w-lg mx-auto lg:mx-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">Secure</div>
                <div className="text-[11px] text-slate-400">ACID Transactions</div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">Fast</div>
                <div className="text-[11px] text-slate-400">Realtime Sync</div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Bot className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">WiseVoice</div>
                <div className="text-[11px] text-slate-400">Voice Assistant</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Realistic Phone Mockup matching Reference Image */}
        <div className="lg:col-span-5 flex justify-center relative">
          <div className="relative w-[320px] sm:w-[340px] bg-slate-950 border-[6px] border-slate-800 rounded-[44px] shadow-2xl p-4 overflow-hidden shadow-teal-500/10 transform hover:scale-[1.02] transition duration-300">
            {/* Phone Speaker Notch */}
            <div className="w-32 h-4 bg-slate-800 rounded-b-2xl mx-auto mb-3" />

            {/* In-Phone App Interface */}
            <div className="bg-slate-900 rounded-3xl p-4 text-white space-y-4 border border-slate-800">
              {/* App Header */}
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-sm tracking-tight">WalletWise</span>
                </div>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold">
                  Demo Live
                </span>
              </div>

              {/* In-Phone Wallet Balance Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900 shadow-md">
                <div className="text-[11px] text-teal-200">Total Balance</div>
                <div className="text-2xl font-extrabold tracking-tight mt-0.5">
                  ₹ 5,280.00
                </div>
                <div className="text-[10px] text-teal-300/80 mt-1 font-mono">
                  Wallet No: WW1123456789
                </div>
              </div>

              {/* In-Phone Action Buttons (3 round circles) */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <Link
                  to="/dashboard/add-money"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-teal-600/30 border border-slate-700/80 transition"
                >
                  <div className="w-8 h-8 mx-auto rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mb-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300">Add Money</span>
                </Link>

                <Link
                  to="/dashboard/transfer"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-teal-600/30 border border-slate-700/80 transition"
                >
                  <div className="w-8 h-8 mx-auto rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-1">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300">Transfer</span>
                </Link>

                <Link
                  to="/dashboard/bills"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-teal-600/30 border border-slate-700/80 transition"
                >
                  <div className="w-8 h-8 mx-auto rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center mb-1">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300">Pay Bills</span>
                </Link>
              </div>

              {/* In-Phone Recent Transactions matching reference */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-300">Recent Transactions</div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">Money Transfer</div>
                    <div className="text-[10px] text-slate-400">Today, 10:34 AM</div>
                  </div>
                  <span className="font-bold text-rose-400">- ₹500.00</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">Bill Payment</div>
                    <div className="text-[10px] text-slate-400">Yesterday, 04:15 PM</div>
                  </div>
                  <span className="font-bold text-rose-400">- ₹795.00</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">Money Added</div>
                    <div className="text-[10px] text-slate-400">Yesterday, 11:30 AM</div>
                  </div>
                  <span className="font-bold text-emerald-400">+ ₹2,000.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-20 bg-slate-950/80 border-t border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Engineered with Real Relational DBMS Concepts
            </h2>
            <p className="mt-4 text-base text-slate-400">
              WalletWise was architected to fulfill comprehensive academic DBMS requirements: normalized schemas, foreign keys, ACID transactions, and double-entry ledgers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Atomic Money Transfers</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Peer-to-peer transfers execute inside an isolated database transaction. If the recipient credit fails, the sender debit is automatically rolled back.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Double-Entry Ledger</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every transaction automatically generates balanced CREDIT and DEBIT records in the transaction_entries table for mathematical auditability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">WiseVoice AI Assistant</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Speak naturally to check your balance, deposit simulated funds, initiate transfers, pay utility bills, or switch between light and dark themes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>WalletWise — Academic DBMS Digital Wallet Project. Simulated demonstration environment.</p>
      </footer>
    </div>
  );
}

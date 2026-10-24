import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import DemoAlertBanner from '../components/DemoAlertBanner';
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  PlusCircle,
  ArrowRightLeft,
  Receipt,
  Clock,
  Lock,
  Calendar,
  IndianRupee,
  Activity
} from 'lucide-react';

export default function WalletPage() {
  const { user, wallet, refreshWallet } = useAuth();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [details, setDetails] = useState({
    balance: 5280.00,
    walletNumber: 'WW1123456789',
    walletStatus: 'ACTIVE',
    totalAdded: 7000.00,
    totalSpent: 3720.00,
    currency: 'INR',
    createdAt: '15 Oct 2026, 10:30 AM',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getWallet();
        if (res.success && res.wallet) {
          setDetails({
            balance: parseFloat(res.wallet.balance || 5280),
            walletNumber: res.wallet.wallet_number || 'WW1123456789',
            walletStatus: res.wallet.wallet_status || 'ACTIVE',
            totalAdded: parseFloat(res.wallet.totalAdded || 7000),
            totalSpent: parseFloat(res.wallet.totalSpent || 3720),
            currency: res.wallet.currency || 'INR',
            createdAt: res.wallet.created_at || '15 Oct 2026, 10:30 AM',
          });
        }
      } catch (e) {
        console.warn('Error loading wallet details:', e);
      }
    }
    loadData();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(details.walletNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Wallet Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time simulated relational database wallet inspection
          </p>
        </div>

        <button
          onClick={() => refreshWallet()}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Activity className="w-3.5 h-3.5 text-teal-500" />
          <span>Sync State</span>
        </button>
      </div>

      <DemoAlertBanner />

      {/* Primary Wallet Balance Card matching Reference Image (top-right) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Wallet Balance
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                ₹ {details.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Wallet No: {details.walletNumber}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                  title="Copy Wallet Number"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-center">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{details.walletStatus}</span>
            </span>
          </div>
        </div>

        {/* Quick action buttons row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => navigate('/dashboard/add-money')}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Demo Money</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/transfer')}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-sm transition"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer Funds</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/bills')}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition"
          >
            <Receipt className="w-4 h-4" />
            <span>Pay Utility Bills</span>
          </button>
        </div>
      </div>

      {/* Wallet Details Card matching Reference Image */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">
          Wallet Details
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Total Added</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ₹ {details.totalAdded.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Total Spent</span>
            <span className="font-bold text-rose-500">
              ₹ {details.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Currency</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {details.currency}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Created At</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {details.createdAt}
            </span>
          </div>
        </div>
      </div>

      {/* Security & DBMS Architecture Note */}
      <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start space-x-3 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Relational Integrity Guarantee:
          </span>{' '}
          Wallets have a unique constraint on <code>user_id</code> and strict decimal precision constraints (<code>DECIMAL(15,2)</code>). Negative balances are prevented at both the database schema check constraint and application layer levels.
        </div>
      </div>
    </div>
  );
}

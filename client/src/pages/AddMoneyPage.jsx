import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { api } from '../services/api';
import DemoAlertBanner from '../components/DemoAlertBanner';
import confetti from 'canvas-confetti';
import {
  PlusCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Wallet,
  ShieldCheck,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function AddMoneyPage() {
  const { wallet, refreshWallet } = useAuth();
  const { prefilledAction, setPrefilledAction, speakText } = useVoice();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Demo wallet top-up');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  // Check if Voice Assistant pre-filled this
  useEffect(() => {
    if (prefilledAction && prefilledAction.type === 'ADD_MONEY') {
      setAmount(prefilledAction.amount?.toString() || '500');
      setPrefilledAction(null);
    }
  }, [prefilledAction]);

  const presetAmounts = [100, 500, 1000, 2000];

  const handlePreset = (val) => {
    setAmount(val.toString());
    setError('');
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (numAmount > 50000) {
      setError('Maximum simulated deposit limit is ₹50,000.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.addMoney(numAmount, description);
      if (res.success) {
        setSuccess(res);
        await refreshWallet();

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        speakText(`Successfully added ₹${numAmount} to your wallet. Updated balance is ₹${res.newBalance.toLocaleString('en-IN')}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to add money.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Add Demo Money
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Simulate a wallet deposit backed by atomic SQL database transactions
        </p>
      </div>

      <DemoAlertBanner />

      {/* Main Form Card matching Reference Image (mid-left) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Demo Funds Credited Successfully!</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Reference: <strong className="font-mono">{success.referenceNumber}</strong> | Added: <strong>₹{parseFloat(success.amount).toLocaleString('en-IN')}</strong> | New Balance: <strong>₹{parseFloat(success.newBalance).toLocaleString('en-IN')}</strong>
            </p>
            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 underline"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  setSuccess(null);
                  setAmount('');
                }}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Add More
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleAddMoney} className="space-y-6">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                max="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-lg font-bold pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition"
                required
              />
            </div>
          </div>

          {/* Quick preset chips matching Reference Image (+100, +500, +1,000, +2,000) */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Quick presets:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {presetAmounts.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handlePreset(val)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1 ${
                    amount === val.toString()
                      ? 'bg-teal-500 border-teal-500 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>+ ₹{val.toLocaleString('en-IN')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Deposit Note / Method
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Demo UPI / Net Banking top-up"
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition"
            />
          </div>

          {/* Submit Button matching Reference Image (teal) */}
          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full py-3.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-teal-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Processing Transaction...</span>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Add Money</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* DBMS ACID Info */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-500" />
          <span>DBMS Transaction Processing:</span>
        </div>
        <p>
          Executing this adds a row to <code>transactions</code> (type: <code>ADD_MONEY</code>), creates a balanced <code>CREDIT</code> record in <code>transaction_entries</code>, atomically updates <code>wallets.balance</code>, and inserts an audit log.
        </p>
      </div>
    </div>
  );
}

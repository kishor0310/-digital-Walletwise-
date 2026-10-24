import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { api } from '../services/api';
import ReceiptModal from '../components/ReceiptModal';
import DemoAlertBanner from '../components/DemoAlertBanner';
import confetti from 'canvas-confetti';
import {
  Send,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
  User,
  ShieldCheck,
  Receipt,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function TransferPage() {
  const { wallet, refreshWallet } = useAuth();
  const { prefilledAction, setPrefilledAction, speakText } = useVoice();
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState('arun@email.com');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Project resource fee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // Check if Voice Assistant pre-filled this
  useEffect(() => {
    if (prefilledAction && prefilledAction.type === 'TRANSFER') {
      if (prefilledAction.recipient) setRecipient(prefilledAction.recipient);
      if (prefilledAction.amount) setAmount(prefilledAction.amount.toString());
      setPrefilledAction(null);
    }
  }, [prefilledAction]);

  const syntheticContacts = [
    { name: 'Arun', email: 'arun@email.com', wallet: 'WW2234567890' },
    { name: 'Priya', email: 'priya@email.com', wallet: 'WW3345678901' },
    { name: 'Admin', email: 'admin@walletwise.com', wallet: 'WW1000000001' },
  ];

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setError('');

    const num = parseFloat(amount);
    if (!recipient.trim()) {
      setError('Please provide a recipient email or wallet number.');
      return;
    }
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid positive transfer amount.');
      return;
    }
    if (wallet && num > wallet.balance) {
      setError(`Insufficient wallet balance. You have ₹${wallet.balance.toFixed(2)}, required ₹${num.toFixed(2)}.`);
      return;
    }

    setShowConfirm(true);
  };

  const handleExecuteTransfer = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.transferFunds(recipient.trim(), parseFloat(amount), description.trim());
      if (res.success) {
        setShowConfirm(false);
        await refreshWallet();

        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}

        const receiptData = {
          referenceNumber: res.referenceNumber,
          dateTime: new Date().toLocaleString(),
          type: 'Money Transfer',
          amount: res.amount,
          sender: 'Mega Sree (megasree@email.com)',
          recipient: res.recipient ? `${res.recipient.name} (${res.recipient.email})` : recipient,
          status: 'SUCCESS',
          description,
        };

        setReceipt(receiptData);
        speakText(`Transferred ₹${amount} successfully to ${res.recipient?.name || recipient}.`);
      }
    } catch (err) {
      setShowConfirm(false);
      setError(err.message || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Transfer Money
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Atomic peer-to-peer wallet transfer with deadlock prevention
        </p>
      </div>

      <DemoAlertBanner />

      {/* Main Transfer Form Card matching Reference Image (mid) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleInitialSubmit} className="space-y-6">
          {/* Recipient Input matching Reference Image */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Recipient Email or User ID
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter email or user ID"
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition font-medium"
              required
            />

            {/* Quick Demo Recipient Pills */}
            <div className="flex items-center space-x-2 mt-2.5">
              <span className="text-[11px] text-slate-400">Synthetic users:</span>
              {syntheticContacts.map((c) => (
                <button
                  key={c.email}
                  type="button"
                  onClick={() => setRecipient(c.email)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full border transition ${
                    recipient === c.email
                      ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 border-teal-300 dark:border-teal-700 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input matching Reference Image */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Amount (₹)
              </label>
              <span className="text-xs text-slate-400">
                Available: <strong className="text-slate-700 dark:text-slate-200">₹{parseFloat(wallet?.balance || 5280).toFixed(2)}</strong>
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-lg font-bold pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition"
                required
              />
            </div>
          </div>

          {/* Description Optional matching Reference Image */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note"
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition resize-none"
            />
          </div>

          {/* Primary Action matching Reference Image (Continue) */}
          <button
            type="submit"
            disabled={!recipient || !amount}
            className="w-full py-3.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-teal-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center mb-3">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Confirm Transfer</h3>
              <p className="text-xs text-slate-500">Atomic database transaction</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">₹{parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee:</span>
                <span className="font-bold text-emerald-600">₹0.00 (Free Demo)</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold shadow-md shadow-teal-500/20"
              >
                {loading ? 'Executing...' : 'Confirm & Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Transaction Receipt Modal on Success */}
      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

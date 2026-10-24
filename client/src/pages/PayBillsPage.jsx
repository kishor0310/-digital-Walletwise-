import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { api } from '../services/api';
import ReceiptModal from '../components/ReceiptModal';
import DemoAlertBanner from '../components/DemoAlertBanner';
import confetti from 'canvas-confetti';
import {
  Receipt,
  Zap,
  Droplet,
  Wifi,
  Flame,
  Phone,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ArrowRight
} from 'lucide-react';

export default function PayBillsPage() {
  const { wallet, refreshWallet } = useAuth();
  const { prefilledAction, setPrefilledAction, speakText } = useVoice();
  const navigate = useNavigate();

  const [category, setCategory] = useState('Electricity');
  const [provider, setProvider] = useState('Tamil Nadu Electricity Board (TNEB)');
  const [customerReference, setCustomerReference] = useState('EB-CONSUMER-991204');
  const [amount, setAmount] = useState('795');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  const categories = [
    { name: 'Electricity', icon: Zap },
    { name: 'Water', icon: Droplet },
    { name: 'Broadband & Internet', icon: Wifi },
    { name: 'Piped Gas', icon: Flame },
    { name: 'Mobile Postpaid', icon: Phone },
    { name: 'Education Fees', icon: GraduationCap },
  ];

  const providerMap = {
    'Electricity': [
      'Tamil Nadu Electricity Board (TNEB)',
      'Bangalore Electricity Supply (BESCOM)',
      'Tata Power Distribution',
      'Adani Electricity Mumbai',
      'BSES Rajdhani Power Delhi',
    ],
    'Water': [
      'Chennai Metro Water Supply (CMWSSB)',
      'Bangalore Water Supply (BWSSB)',
      'Delhi Jal Board (DJB)',
      'Municipal Corporation of Greater Mumbai (MCGM)',
    ],
    'Broadband & Internet': [
      'Airtel Xstream Fiber',
      'JioFiber Broadband',
      'ACT Fibernet',
      'Tata Play Fiber',
      'BSNL Bharat Fiber',
    ],
    'Piped Gas': [
      'Indraprastha Gas Limited (IGL)',
      'Mahanagar Gas Limited (MGL)',
      'Adani Total Gas',
      'Gujarat Gas Limited',
    ],
    'Mobile Postpaid': [
      'Jio Postpaid Plus',
      'Airtel Postpaid',
      'Vodafone Idea (Vi)',
      'BSNL Mobile',
    ],
    'Education Fees': [
      'Anna University Examination / Term Fees',
      'Delhi University Tuition Fees',
      'National Institute of Technology (NIT)',
      'Kendriya Vidyalaya Sangathan (KVS)',
    ],
  };

  // Sync provider on category change
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const providers = providerMap[cat] || ['Standard Utility Provider'];
    setProvider(providers[0]);
  };

  // Handle voice assistant pre-fill
  useEffect(() => {
    if (prefilledAction && prefilledAction.type === 'BILL') {
      if (prefilledAction.category) {
        handleCategoryChange(prefilledAction.category);
      }
      setPrefilledAction(null);
    }
  }, [prefilledAction]);

  const handlePayBill = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!category || !provider || !customerReference.trim()) {
      setError('Please fill in all bill details.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid bill amount.');
      return;
    }
    if (wallet && numAmount > wallet.balance) {
      setError(`Insufficient wallet balance. You have ₹${wallet.balance.toFixed(2)}, required ₹${numAmount.toFixed(2)}.`);
      return;
    }

    try {
      setLoading(true);
      const res = await api.payBill(category, provider, customerReference.trim(), numAmount);
      if (res.success) {
        await refreshWallet();

        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}

        const receiptData = {
          referenceNumber: res.referenceNumber,
          dateTime: new Date().toLocaleString(),
          type: 'Bill Payment',
          amount: res.amount,
          sender: 'Mega Sree (megasree@email.com)',
          recipient: `${res.providerName} (${res.category})`,
          status: 'SUCCESS',
          description: `Customer Ref: ${res.customerReference}`,
        };

        setReceipt(receiptData);
        speakText(`Successfully paid ₹${numAmount} for ${category} bill to ${provider}.`);
      }
    } catch (err) {
      setError(err.message || 'Bill payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pay Bills
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Simulate verified utility bill payments with relational table normalization
        </p>
      </div>

      <DemoAlertBanner />

      {/* Main Pay Bill Card matching Reference Image (mid) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePayBill} className="space-y-6">
          {/* Category Dropdown matching Reference Image */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition font-medium"
            >
              {categories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Provider / Company matching Reference Image */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Provider / Company
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition font-medium"
            >
              {(providerMap[category] || []).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Reference matching Reference Image */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Customer Reference
            </label>
            <input
              type="text"
              value={customerReference}
              onChange={(e) => setCustomerReference(e.target.value)}
              placeholder="Enter reference number"
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition font-mono"
              required
            />
          </div>

          {/* Amount (₹) matching Reference Image */}
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

          {/* Primary Action matching Reference Image (Pay Bill) */}
          <button
            type="submit"
            disabled={loading || !amount || !customerReference}
            className="w-full py-3.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-teal-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Verifying & Deducting...</span>
            ) : (
              <>
                <Receipt className="w-4 h-4" />
                <span>Pay Bill</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Official Transaction Receipt on Payment */}
      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

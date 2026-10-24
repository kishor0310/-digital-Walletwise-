import React from 'react';
import { X, Printer, CheckCircle2, AlertCircle, ArrowDownLeft, ArrowUpRight, ShieldCheck, Wallet } from 'lucide-react';

export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  const isSuccess = receipt.status === 'SUCCESS';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Printable Section */}
        <div id="printable-receipt" className="p-6">
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="inline-flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-md shadow-teal-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Wallet<span className="text-teal-600 dark:text-teal-400">Wise</span>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Transaction Receipt</h2>
            <p className="text-xs text-slate-400 mt-0.5">Official Academic DBMS Transaction Slip</p>
          </div>

          {/* Amount Display */}
          <div className="py-5 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl my-4 border border-slate-100 dark:border-slate-800">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Total Amount</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              ₹ {parseFloat(receipt.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="inline-flex items-center space-x-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{receipt.status || 'SUCCESS'}</span>
            </div>
          </div>

          {/* Key-Value Details */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Transaction Reference</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs">
                {receipt.referenceNumber || receipt.reference_number || 'TXN00125'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Date & Time</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                {receipt.dateTime || receipt.created_at || '22 Oct 2026, 10:34 AM'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Transaction Type</span>
              <span className="font-semibold text-teal-600 dark:text-teal-400 text-xs">
                {receipt.type || receipt.transaction_type || 'Money Transfer'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Sender</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 text-xs text-right max-w-[200px] truncate">
                {receipt.sender || receipt.sender_name || 'Mega Sree (megasree@email.com)'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Recipient</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 text-xs text-right max-w-[200px] truncate">
                {receipt.recipient || receipt.receiver_name || receipt.bill_provider || 'Arun (arun@email.com)'}
              </span>
            </div>

            {receipt.description && (
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Note</span>
                <span className="italic text-slate-700 dark:text-slate-300 text-xs text-right max-w-[200px] truncate">
                  {receipt.description}
                </span>
              </div>
            )}
          </div>

          {/* Academic Disclaimer matching reference */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              <span>This is a demo transaction. No real money is involved.</span>
            </p>
          </div>
        </div>

        {/* Footer Actions (hidden in print) */}
        <div className="no-print p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold text-sm shadow-md shadow-teal-500/20 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}

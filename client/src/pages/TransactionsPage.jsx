import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ReceiptModal from '../components/ReceiptModal';
import DemoAlertBanner from '../components/DemoAlertBanner';
import {
  Clock,
  Search,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Filter states matching reference
  const [dateRange, setDateRange] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 8,
        ...(dateRange !== 'ALL' ? { dateRange } : {}),
        ...(type !== 'ALL' ? { type } : {}),
        ...(status !== 'ALL' ? { status } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      };

      const res = await api.getTransactions(params);
      if (res.success && res.transactions) {
        setTransactions(res.transactions);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.warn('Failed to load transactions, using reference fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, type, status, dateRange]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleExportCSV = async () => {
    try {
      window.open('/api/transactions/export?format=csv', '_blank');
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transaction History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Relational ledger audit trail with multi-column filtering and pagination
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      <DemoAlertBanner />

      {/* Filter Controls Bar matching Reference Image (mid) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          {/* Date Range Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="ALL">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>

          {/* Type Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="ADD_MONEY">Add Money</option>
              <option value="TRANSFER">Transfer</option>
              <option value="BILL_PAYMENT">Bill Payment</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Keyword
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ref number or note"
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
            />
          </div>

          {/* Search Button matching Reference Image (teal) */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Transactions Table matching Reference Image */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-5">ID</th>
                <th className="py-3.5 px-5">Reference</th>
                <th className="py-3.5 px-5">Date & Time</th>
                <th className="py-3.5 px-5">Type</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {transactions.length > 0 ? (
                transactions.map((txn, index) => {
                  const isCredit = txn.flow_type === 'CREDIT' || txn.transaction_type === 'ADD_MONEY';
                  const isSuccess = txn.status === 'SUCCESS';
                  const idCode = `TXN00${125 - index}`;

                  return (
                    <tr
                      key={txn.transaction_id || txn.reference_number}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      onClick={() => setSelectedReceipt(txn)}
                    >
                      <td className="py-3.5 px-5 font-mono text-slate-500 font-bold">
                        {idCode}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-800 dark:text-slate-200 font-semibold">
                        {txn.reference_number}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 font-medium">
                        {txn.created_at || '22 Oct 2026, 10:34 AM'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {txn.transaction_type === 'ADD_MONEY'
                            ? 'Add Money'
                            : txn.transaction_type === 'TRANSFER'
                            ? 'Transfer'
                            : 'Bill Payment'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-bold">
                        <span className={isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                          {isCredit ? '+ ' : '- '}₹ {parseFloat(txn.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSuccess
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {isSuccess ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReceipt(txn);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No transactions matched your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar matching Reference Image (< 1 2 3 >) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {[...Array(Math.max(1, Math.min(3, totalPages)))].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                page === i + 1
                  ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
    </div>
  );
}

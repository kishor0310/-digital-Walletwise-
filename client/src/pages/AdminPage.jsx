import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DemoAlertBanner from '../components/DemoAlertBanner';
import {
  Users,
  Wallet,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Search,
  Activity,
  Layers,
  History,
  Lock,
  Unlock,
  Check,
  AlertCircle
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'audit'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 12,
    totalWallets: 12,
    totalVolume: 15200.00,
    successfulTransactions: 28,
    failedTransactions: 3,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [message, setMessage] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [dashRes, usersRes, auditRes] = await Promise.all([
        api.getAdminDashboard().catch(() => null),
        api.getAdminUsers().catch(() => null),
        api.getAdminAuditLogs().catch(() => null),
      ]);

      if (dashRes?.stats) {
        setStats(dashRes.stats);
        if (dashRes.recentTransactions) {
          setRecentTransactions(dashRes.recentTransactions);
        }
      }

      if (usersRes?.users) {
        setUsersList(usersRes.users);
      }

      if (auditRes?.logs) {
        setAuditLogs(auditRes.logs);
      }
    } catch (e) {
      console.warn('Admin load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await api.updateUserStatus(userId, nextStatus);
      if (res.success) {
        setMessage(`Updated user status to ${nextStatus}`);
        setTimeout(() => setMessage(''), 3000);
        loadAdminData();
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrator Control Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Admin Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            System governance, wallet supervision, and ACID ledger audit logs
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Users ({usersList.length || 4})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      <DemoAlertBanner />

      {message && (
        <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs font-semibold text-teal-800 dark:text-teal-200">
          {message}
        </div>
      )}

      {/* 5 Stats Cards matching Reference Image (mid-right) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {stats.totalUsers || 12}
          </div>
        </div>

        {/* Total Wallets */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Wallets</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {stats.totalWallets || 12}
          </div>
        </div>

        {/* Total Volume */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Volume</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
            ₹ {parseFloat(stats.totalVolume || 15200).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Successful */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Successful</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.successfulTransactions || 28}
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Failed</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-500 mt-2">
            {stats.failedTransactions || 3}
          </div>
        </div>
      </div>

      {/* Tab: Overview (Recent Transactions matching Reference) */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-400">System-wide ledger monitoring</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-5">ID</th>
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((t, idx) => {
                    const isCredit = t.transaction_type === 'ADD_MONEY';
                    const isSuccess = t.status === 'SUCCESS';
                    return (
                      <tr key={t.transaction_id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-5 font-mono text-slate-600 dark:text-slate-400 font-bold">
                          {t.reference_number || `TXN00${125 - idx}`}
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200">
                          {t.sender_name || t.receiver_name || 'Mega Sree'}
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                          {t.transaction_type === 'ADD_MONEY'
                            ? 'Add Money'
                            : t.transaction_type === 'TRANSFER'
                            ? 'Transfer'
                            : 'Bill Payment'}
                        </td>
                        <td className="py-3.5 px-5 font-bold">
                          <span className={isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                            {isCredit ? '+ ' : '- '}₹ {parseFloat(t.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                      </tr>
                    );
                  })
                ) : (
                  <>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-600">TXN00125</td>
                      <td className="py-3.5 px-5 font-semibold">Mega Sree</td>
                      <td className="py-3.5 px-5">Transfer</td>
                      <td className="py-3.5 px-5 font-bold text-rose-500">- ₹500.00</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Success
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-600">TXN00124</td>
                      <td className="py-3.5 px-5 font-semibold">Arun</td>
                      <td className="py-3.5 px-5">Bill Payment</td>
                      <td className="py-3.5 px-5 font-bold text-rose-500">- ₹795.00</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Success
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-600">TXN00123</td>
                      <td className="py-3.5 px-5 font-semibold">Priya</td>
                      <td className="py-3.5 px-5">Add Money</td>
                      <td className="py-3.5 px-5 font-bold text-emerald-600">+ ₹2,000.00</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Success
                        </span>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">User & Wallet Control</h3>
              <p className="text-xs text-slate-400">Lock, suspend, or reactivate user accounts</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5">Email & Phone</th>
                  <th className="py-3 px-5">Wallet No</th>
                  <th className="py-3 px-5">Balance</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {usersList.map((u) => (
                  <tr key={u.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                      {u.full_name} <span className="text-[10px] font-normal text-slate-400">({u.role})</span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400">
                      <div>{u.email}</div>
                      <div className="text-[10px] text-slate-400">{u.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-600 dark:text-slate-300">
                      {u.wallet_number || 'N/A'}
                    </td>
                    <td className="py-3.5 px-5 font-extrabold text-slate-900 dark:text-white">
                      ₹ {parseFloat(u.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.account_status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.account_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u.user_id, u.account_status)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                            u.account_status === 'ACTIVE'
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.account_status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Security Audit Trail</h3>
            <p className="text-xs text-slate-400">Immutable chronological record of administrative and financial operations</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5">Actor</th>
                  <th className="py-3 px-5">Action</th>
                  <th className="py-3 px-5">Entity</th>
                  <th className="py-3 px-5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {auditLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-5 text-slate-500 whitespace-nowrap">
                      {log.created_at}
                    </td>
                    <td className="py-3 px-5 font-semibold text-slate-800 dark:text-slate-200">
                      {log.actor_name || 'System'}
                    </td>
                    <td className="py-3 px-5 font-mono font-bold text-teal-600 dark:text-teal-400">
                      {log.action}
                    </td>
                    <td className="py-3 px-5 text-slate-600 dark:text-slate-300">
                      {log.entity_type} #{log.entity_id}
                    </td>
                    <td className="py-3 px-5 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

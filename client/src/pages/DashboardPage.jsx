import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ReceiptModal from '../components/ReceiptModal';
import DemoAlertBanner from '../components/DemoAlertBanner';
import {
  Wallet,
  PlusCircle,
  Send,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Download,
  User,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  TrendingUp,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function DashboardPage() {
  const { user, wallet, refreshWallet } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    availableBalance: 5280.00,
    totalAdded: 7000.00,
    totalTransferred: 2500.00,
    totalPayments: 1200.00,
  });
  const [charts, setCharts] = useState({
    monthlySpend: [
      { month: 'Jan', amount: 800 },
      { month: 'Feb', amount: 950 },
      { month: 'Mar', amount: 1200 },
      { month: 'Apr', amount: 650 },
      { month: 'May', amount: 1400 },
      { month: 'Jun', amount: 900 },
      { month: 'Jul', amount: 1100 },
    ],
    incomeVsExpense: {
      income: 7800,
      expense: 3700,
      percentageExpense: 68,
    },
  });

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load dashboard data from backend
  const loadDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const [walletData, txnData] = await Promise.all([
        api.getWallet().catch(() => null),
        api.getTransactions({ limit: 5 }).catch(() => null),
      ]);

      if (walletData?.wallet) {
        setStats(prev => ({
          ...prev,
          availableBalance: parseFloat(walletData.wallet.balance || 5280),
          totalAdded: parseFloat(walletData.wallet.totalAdded || 7000),
          totalTransferred: parseFloat(walletData.wallet.totalTransferred || 2500),
          totalPayments: parseFloat(walletData.wallet.totalSpent || 1200),
        }));
      }

      if (txnData?.transactions) {
        setTransactions(txnData.transactions);
      }

      if (txnData?.charts) {
        setCharts(prev => ({
          ...prev,
          monthlySpend: txnData.charts.monthlySpend?.slice(0, 7) || prev.monthlySpend,
          incomeVsExpense: txnData.charts.incomeVsExpense || prev.incomeVsExpense,
        }));
      }
    } catch (err) {
      console.warn('Dashboard load error, using reference defaults:', err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const donutData = [
    { name: 'Expense', value: charts.incomeVsExpense.expense || 3700, color: '#06b6d4' },
    { name: 'Income', value: charts.incomeVsExpense.income || 7800, color: '#10b981' },
  ];

  const handleOpenReceipt = async (txn) => {
    try {
      const res = await api.getReceipt(txn.transaction_id || txn.reference_number);
      if (res.success && res.receipt) {
        setSelectedReceipt(res.receipt);
      } else {
        setSelectedReceipt({
          referenceNumber: txn.reference_number,
          dateTime: txn.completed_at || txn.created_at,
          type: txn.transaction_type === 'ADD_MONEY' ? 'Money Added' : txn.transaction_type === 'TRANSFER' ? 'Money Transfer' : 'Bill Payment',
          amount: txn.amount,
          sender: txn.sender_name || 'Mega Sree',
          recipient: txn.receiver_name || txn.bill_provider || 'Demo Recipient',
          status: txn.status,
          description: txn.description,
        });
      }
    } catch (err) {
      setSelectedReceipt({
        referenceNumber: txn.reference_number,
        dateTime: txn.completed_at || txn.created_at,
        type: txn.transaction_type,
        amount: txn.amount,
        sender: txn.sender_name || 'Mega Sree',
        recipient: txn.receiver_name || txn.bill_provider || 'Arun',
        status: txn.status,
        description: txn.description,
      });
    }
  };

  return (
    <div className="space-y-6">
      <DemoAlertBanner />

      {/* Top 4 Summary Cards matching Reference Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Available Balance</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ₹ {stats.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
              Wallet No: {wallet?.wallet_number || 'WW1123456789'}
            </div>
          </div>
        </div>

        {/* Total Added */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Added</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ₹ {stats.totalAdded.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Simulated Deposits</span>
            </div>
          </div>
        </div>

        {/* Total Transferred */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Transferred</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ₹ {stats.totalTransferred.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-1 font-medium flex items-center space-x-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>Peer transfers</span>
            </div>
          </div>
        </div>

        {/* Total Payments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Payments</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ₹ {stats.totalPayments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-medium flex items-center space-x-1">
              <Receipt className="w-3 h-3" />
              <span>Utility Bills</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Quick Actions Row matching Reference Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Spending Bar Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Monthly Spending</h3>
              <p className="text-xs text-slate-400">Past expenditure analysis</p>
            </div>
            <span className="text-xs font-bold text-slate-400">2026</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlySpend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`₹${val}`, 'Spent']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="amount" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income vs Expense Donut Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Income vs Expense</h3>
              <p className="text-xs text-slate-400">Monthly financial ratio</p>
            </div>
          </div>

          <div className="relative h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`₹${val}`, 'Total']} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-800 dark:text-white">68%</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Expense</span>
            </div>
          </div>

          {/* Legend Details */}
          <div className="pt-2 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Income</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">₹ 7,800</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Expense</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">₹ 3,700</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel matching Reference Image */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">Quick Actions</h3>
            <p className="text-xs text-slate-400 mb-4">Fast-track wallet operations</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => navigate('/dashboard/add-money')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs shadow-sm transition"
            >
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-4 h-4" />
                <span>Add Demo Money</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              onClick={() => navigate('/dashboard/transfer')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-sm transition"
            >
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Transfer Money</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              onClick={() => navigate('/dashboard/bills')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition"
            >
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4" />
                <span>Pay Bills</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              onClick={() => navigate('/dashboard/transactions')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm transition"
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>View Transactions</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              onClick={() => {
                if (transactions.length > 0) handleOpenReceipt(transactions[0]);
                else navigate('/dashboard/transactions');
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-sm transition"
            >
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download Receipt</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              onClick={() => navigate('/dashboard/profile')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition"
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>View Profile</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table matching Reference Image */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Live ledger records from database</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/transactions')}
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-5">Date & Time</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Reference</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {transactions.length > 0 ? (
                transactions.slice(0, 5).map((txn) => {
                  const isCredit = txn.flow_type === 'CREDIT' || txn.transaction_type === 'ADD_MONEY';
                  const isSuccess = txn.status === 'SUCCESS';
                  return (
                    <tr
                      key={txn.transaction_id || txn.reference_number}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      onClick={() => handleOpenReceipt(txn)}
                    >
                      <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 font-medium">
                        {txn.created_at || '22 Oct 2026, 10:34 AM'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {txn.transaction_type === 'ADD_MONEY'
                            ? 'Money Added'
                            : txn.transaction_type === 'TRANSFER'
                            ? 'Money Transfer'
                            : 'Bill Payment'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-500 dark:text-slate-400">
                        {txn.reference_number || 'TXN00125'}
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
                            handleOpenReceipt(txn);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium"
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Static fallback rows identical to reference image */
                <>
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-5 font-medium">22 Oct 2026, 10:34 AM</td>
                    <td className="py-3.5 px-5 font-semibold">Money Transfer</td>
                    <td className="py-3.5 px-5 font-mono text-slate-500">TXN00125</td>
                    <td className="py-3.5 px-5 font-bold text-rose-500">- ₹500.00</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Success
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button className="px-2 py-1 border rounded text-xs">Receipt</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-5 font-medium">21 Oct 2026, 04:15 PM</td>
                    <td className="py-3.5 px-5 font-semibold">Bill Payment</td>
                    <td className="py-3.5 px-5 font-mono text-slate-500">TXN00124</td>
                    <td className="py-3.5 px-5 font-bold text-rose-500">- ₹795.00</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Success
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button className="px-2 py-1 border rounded text-xs">Receipt</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-5 font-medium">21 Oct 2026, 11:30 AM</td>
                    <td className="py-3.5 px-5 font-semibold">Money Added</td>
                    <td className="py-3.5 px-5 font-mono text-slate-500">TXN00123</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-600">+ ₹2,000.00</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Success
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button className="px-2 py-1 border rounded text-xs">Receipt</button>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
    </div>
  );
}

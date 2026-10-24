import React, { useState } from 'react';
import DemoAlertBanner from '../components/DemoAlertBanner';
import {
  Database,
  Layers,
  Key,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Table,
  Cpu,
  Server,
  FileCode,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function DatabaseSchemaPage() {
  const [activeTab, setActiveTab] = useState('schema'); // 'schema' | 'erd' | 'queries' | 'acid'

  const tables = [
    {
      name: 'users',
      badge: 'Master Entity',
      color: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
      tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      columns: [
        { name: 'user_id', type: 'INTEGER', key: 'PK', desc: 'Auto-increment Primary Key' },
        { name: 'full_name', type: 'VARCHAR(100)', key: 'NOT NULL', desc: 'User registered name' },
        { name: 'email', type: 'VARCHAR(150)', key: 'UNIQUE', desc: 'Unique account identifier' },
        { name: 'phone', type: 'VARCHAR(20)', key: 'UNIQUE', desc: 'Optional contact number' },
        { name: 'password_hash', type: 'VARCHAR(255)', key: 'NOT NULL', desc: 'Bcrypt hashed password' },
        { name: 'role', type: "ENUM('USER','ADMIN')", key: 'DEFAULT USER', desc: 'Role-based access' },
        { name: 'account_status', type: "ENUM('ACTIVE','SUSPENDED')", key: 'DEFAULT ACTIVE', desc: 'Account state' },
        { name: 'created_at', type: 'DATETIME', key: 'TIMESTAMP', desc: 'Creation time' },
      ],
    },
    {
      name: 'wallets',
      badge: 'Core Entity (1:1 with users)',
      color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
      tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
      columns: [
        { name: 'wallet_id', type: 'INTEGER', key: 'PK', desc: 'Primary Key' },
        { name: 'user_id', type: 'INTEGER', key: 'FK, UNIQUE', desc: 'References users(user_id) 1:1' },
        { name: 'wallet_number', type: 'VARCHAR(20)', key: 'UNIQUE', desc: 'Synthetic wallet identifier (WW...)' },
        { name: 'balance', type: 'DECIMAL(15,2)', key: 'CHECK (>= 0)', desc: 'Real-money precision storage' },
        { name: 'currency', type: 'CHAR(3)', key: 'DEFAULT INR', desc: 'Currency code' },
        { name: 'wallet_status', type: "ENUM('ACTIVE','FROZEN')", key: 'DEFAULT ACTIVE', desc: 'Wallet state' },
        { name: 'updated_at', type: 'DATETIME', key: 'TIMESTAMP', desc: 'Last balance update' },
      ],
    },
    {
      name: 'transactions',
      badge: 'Transaction Master Record',
      color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
      tagColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
      columns: [
        { name: 'transaction_id', type: 'INTEGER', key: 'PK', desc: 'Primary Key' },
        { name: 'reference_number', type: 'VARCHAR(30)', key: 'UNIQUE', desc: 'Unique transaction reference' },
        { name: 'idempotency_key', type: 'VARCHAR(64)', key: 'UNIQUE', desc: 'Prevents duplicate submissions' },
        { name: 'sender_wallet_id', type: 'INTEGER', key: 'FK (NULLABLE)', desc: 'References wallets(wallet_id)' },
        { name: 'receiver_wallet_id', type: 'INTEGER', key: 'FK (NULLABLE)', desc: 'References wallets(wallet_id)' },
        { name: 'transaction_type', type: "ENUM('ADD','TRANSFER','BILL')", key: 'NOT NULL', desc: 'Transaction category' },
        { name: 'amount', type: 'DECIMAL(15,2)', key: 'CHECK (> 0)', desc: 'Transacted amount' },
        { name: 'description', type: 'TEXT', key: 'NULLABLE', desc: 'User / system note' },
        { name: 'status', type: "ENUM('SUCCESS','FAILED')", key: 'DEFAULT SUCCESS', desc: 'Final execution state' },
        { name: 'completed_at', type: 'DATETIME', key: 'TIMESTAMP', desc: 'Atomic commit time' },
      ],
    },
    {
      name: 'transaction_entries',
      badge: 'Double-Entry Ledger Sub-ledger',
      color: 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20',
      tagColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
      columns: [
        { name: 'entry_id', type: 'INTEGER', key: 'PK', desc: 'Primary Key' },
        { name: 'transaction_id', type: 'INTEGER', key: 'FK', desc: 'References transactions(transaction_id)' },
        { name: 'wallet_id', type: 'INTEGER', key: 'FK', desc: 'References wallets(wallet_id)' },
        { name: 'entry_type', type: "ENUM('CREDIT','DEBIT')", key: 'NOT NULL', desc: 'Double-entry accounting effect' },
        { name: 'amount', type: 'DECIMAL(15,2)', key: 'NOT NULL', desc: 'Ledger entry impact' },
        { name: 'created_at', type: 'DATETIME', key: 'TIMESTAMP', desc: 'Posting time' },
      ],
    },
    {
      name: 'bill_payments',
      badge: 'Utility Settlement',
      color: 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20',
      tagColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
      columns: [
        { name: 'bill_payment_id', type: 'INTEGER', key: 'PK', desc: 'Primary Key' },
        { name: 'transaction_id', type: 'INTEGER', key: 'FK, UNIQUE', desc: 'References transactions 1:1' },
        { name: 'user_id', type: 'INTEGER', key: 'FK', desc: 'References users(user_id)' },
        { name: 'category', type: 'VARCHAR(50)', key: 'NOT NULL', desc: 'Electricity, Water, Gas, etc.' },
        { name: 'provider_name', type: 'VARCHAR(100)', key: 'NOT NULL', desc: 'Utility company name' },
        { name: 'customer_reference', type: 'VARCHAR(50)', key: 'NOT NULL', desc: 'Consumer ID / Account No' },
        { name: 'amount', type: 'DECIMAL(15,2)', key: 'NOT NULL', desc: 'Billed amount' },
        { name: 'payment_date', type: 'DATETIME', key: 'TIMESTAMP', desc: 'Settlement timestamp' },
      ],
    },
    {
      name: 'audit_logs',
      badge: 'Compliance & Audit Trail',
      color: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20',
      tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
      columns: [
        { name: 'log_id', type: 'INTEGER', key: 'PK', desc: 'Primary Key' },
        { name: 'actor_user_id', type: 'INTEGER', key: 'FK (NULLABLE)', desc: 'User who performed action' },
        { name: 'action', type: 'VARCHAR(50)', key: 'NOT NULL', desc: 'e.g. USER_LOGIN, TRANSFER_FUNDS' },
        { name: 'entity_type', type: 'VARCHAR(50)', key: 'NOT NULL', desc: 'USER, WALLET, TRANSACTION' },
        { name: 'entity_id', type: 'VARCHAR(50)', key: 'NULLABLE', desc: 'ID of affected record' },
        { name: 'details', type: 'TEXT', key: 'NULLABLE', desc: 'Contextual audit payload' },
        { name: 'created_at', type: 'DATETIME', key: 'TIMESTAMP', desc: 'Action timestamp' },
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold mb-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Academic DBMS Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Database Schema & Relational ERD
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Fully normalized 3NF schema, referential integrity constraints, and double-entry ledger
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'schema'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Tables & Schema
          </button>
          <button
            onClick={() => setActiveTab('erd')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'erd'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            ER Diagram
          </button>
          <button
            onClick={() => setActiveTab('acid')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'acid'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            ACID Guarantees
          </button>
        </div>
      </div>

      <DemoAlertBanner />

      {/* Tab: Schema Tables matching Reference Image */}
      {activeTab === 'schema' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <div
                key={table.name}
                className={`bg-white dark:bg-slate-900 border-2 ${table.color} rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                    <div className="flex items-center space-x-2">
                      <Table className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      <h3 className="font-mono font-extrabold text-slate-900 dark:text-white text-base">
                        {table.name}
                      </h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${table.tagColor}`}>
                      {table.badge}
                    </span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    {table.columns.map((col) => (
                      <div
                        key={col.name}
                        className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-start justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {col.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">{col.desc}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-semibold text-slate-500 block">
                            {col.type}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                              col.key.includes('PK')
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : col.key.includes('FK')
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {col.key}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: ER Diagram matching Reference Image */}
      {activeTab === 'erd' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Entity Relationship & Cardinality Map
            </h3>
            <p className="text-xs text-slate-500">
              Visualizing Primary Keys (PK), Foreign Keys (FK), and Relational Constraints
            </p>
          </div>

          {/* Interactive ERD Diagram Blocks */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <div className="min-w-[700px] flex flex-col items-center space-y-8 py-4">
              {/* Row 1: Users & Wallets (1:1) */}
              <div className="flex items-center space-x-12">
                <div className="w-56 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-400 text-xs shadow-sm">
                  <div className="font-bold text-blue-900 dark:text-blue-200 font-mono text-sm border-b pb-1 mb-2">
                    users (Master)
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 space-y-0.5 font-mono text-[11px]">
                    <div>🔑 user_id (PK)</div>
                    <div>email (UNIQUE)</div>
                    <div>full_name, phone</div>
                    <div>role, account_status</div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-full border border-teal-300 dark:border-teal-700">
                    1 : 1 (One-to-One)
                  </span>
                  <div className="w-16 h-0.5 bg-teal-400 my-1"></div>
                  <span className="text-[10px] text-slate-400 font-mono">user_id FK</span>
                </div>

                <div className="w-56 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-400 text-xs shadow-sm">
                  <div className="font-bold text-emerald-900 dark:text-emerald-200 font-mono text-sm border-b pb-1 mb-2">
                    wallets
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 space-y-0.5 font-mono text-[11px]">
                    <div>🔑 wallet_id (PK)</div>
                    <div>🔗 user_id (FK, UNIQUE)</div>
                    <div>wallet_number (UNIQUE)</div>
                    <div>balance (DECIMAL 15,2)</div>
                  </div>
                </div>
              </div>

              {/* Connecting downward link */}
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
                <span>1 : N (One-to-Many through sender/receiver roles)</span>
              </div>

              {/* Row 2: Transactions & Ledger */}
              <div className="flex items-center space-x-12">
                <div className="w-64 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 text-xs shadow-sm">
                  <div className="font-bold text-amber-900 dark:text-amber-200 font-mono text-sm border-b pb-1 mb-2">
                    transactions
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 space-y-0.5 font-mono text-[11px]">
                    <div>🔑 transaction_id (PK)</div>
                    <div>reference_number (UNIQUE)</div>
                    <div>🔗 sender_wallet_id (FK)</div>
                    <div>🔗 receiver_wallet_id (FK)</div>
                    <div>amount, status, type</div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-300 dark:border-cyan-700">
                    1 : N
                  </span>
                  <div className="w-16 h-0.5 bg-cyan-400 my-1"></div>
                  <span className="text-[10px] text-slate-400 font-mono">transaction_id FK</span>
                </div>

                <div className="w-64 p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border-2 border-cyan-400 text-xs shadow-sm">
                  <div className="font-bold text-cyan-900 dark:text-cyan-200 font-mono text-sm border-b pb-1 mb-2">
                    transaction_entries
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 space-y-0.5 font-mono text-[11px]">
                    <div>🔑 entry_id (PK)</div>
                    <div>🔗 transaction_id (FK)</div>
                    <div>🔗 wallet_id (FK)</div>
                    <div>entry_type (CREDIT / DEBIT)</div>
                    <div>amount</div>
                  </div>
                </div>
              </div>

              {/* Row 3: Utility Bills & Audit Logs */}
              <div className="flex items-center space-x-12">
                <div className="w-60 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400 text-xs shadow-sm">
                  <div className="font-bold text-rose-900 dark:text-rose-200 font-mono text-sm border-b pb-1 mb-2">
                    bill_payments
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 space-y-0.5 font-mono text-[11px]">
                    <div>🔑 bill_payment_id (PK)</div>
                    <div>🔗 transaction_id (FK, UNIQUE)</div>
                    <div>🔗 user_id (FK)</div>
                    <div>category, provider_name</div>
                    <div>customer_reference</div>
                  </div>
                </div>

                <div className="w-60 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/60 border-2 border-purple-400 text-xs shadow-sm">
                  <div className="font-bold text-purple-900 dark:text-purple-200 font-mono text-sm border-b pb-1 mb-2">
                    audit_logs
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 space-y-0.5 font-mono text-[11px]">
                    <div>🔑 log_id (PK)</div>
                    <div>🔗 actor_user_id (FK)</div>
                    <div>action, entity_type</div>
                    <div>details, created_at</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: ACID Properties & Normalization */}
      {activeTab === 'acid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-teal-500" />
              <span>ACID Transaction Implementation</span>
            </h3>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <strong className="text-slate-900 dark:text-white block font-bold">Atomicity (All-or-Nothing):</strong>
                Peer-to-peer transfers execute debit and credit updates in a single atomic transaction. If recipient credit fails, sender debit is rolled back immediately.
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <strong className="text-slate-900 dark:text-white block font-bold">Consistency:</strong>
                Enforced by check constraints (<code>balance &gt;= 0.0</code>) and foreign key cascades. Total sum of debits strictly equals total credits in <code>transaction_entries</code>.
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <strong className="text-slate-900 dark:text-white block font-bold">Isolation:</strong>
                Deadlock prevention is achieved by sorting wallet IDs in ascending numerical order (<code>Math.min(idA, idB)</code>) prior to locking rows.
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <strong className="text-slate-900 dark:text-white block font-bold">Durability:</strong>
                Persistent disk commits with Write-Ahead Logging (WAL) and relational storage prevent transaction loss on crash.
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-500" />
              <span>Database Normalization (3NF & BCNF)</span>
            </h3>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <strong className="text-slate-900 dark:text-white block font-bold">1NF (First Normal Form):</strong>
                All column attributes are atomic. No multivalued composite arrays or repeating groups are stored.
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <strong className="text-slate-900 dark:text-white block font-bold">2NF (Second Normal Form):</strong>
                Every non-prime attribute is fully functionally dependent on the primary key, eliminating partial dependencies.
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <strong className="text-slate-900 dark:text-white block font-bold">3NF (Third Normal Form):</strong>
                Transitive dependencies are eliminated. Bill payment details and provider catalogs are separated from generic transfer transactions.
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <strong className="text-slate-900 dark:text-white block font-bold">BCNF (Boyce-Codd Normal Form):</strong>
                For every functional dependency X -&gt; Y, X is a superkey. Wallets uniquely map 1:1 with users via unique constraints.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tech Stack & Key Features matching Reference Image (bottom-right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {/* Tech Stack List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-teal-500" />
            <span>Tech Stack</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-semibold text-slate-800 dark:text-slate-200">React.js + Vite</span>
              <span className="text-slate-500 font-mono">Frontend Client</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Tailwind CSS</span>
              <span className="text-slate-500 font-mono">Styling & Light Mode</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Node.js + Express</span>
              <span className="text-slate-500 font-mono">RESTful API Backend</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-semibold text-slate-800 dark:text-slate-200">MySQL / SQLite</span>
              <span className="text-slate-500 font-mono">Relational DBMS</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-semibold text-slate-800 dark:text-slate-200">JWT + Bcrypt</span>
              <span className="text-slate-500 font-mono">Authentication</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Recharts</span>
              <span className="text-slate-500 font-mono">Analytical Charts</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Web Speech API</span>
              <span className="text-slate-500 font-mono">WiseVoice Assistant</span>
            </div>
          </div>
        </div>

        {/* Key Features matching Reference Image */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Key Features</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Secure authentication with JWT & bcrypt password hashing</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Complete wallet management (add demo funds, transfer, pay bills)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Atomic database transactions with automatic rollback support</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Relational database with constraints, indexing, and normalization</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>SQL queries, joins, aggregations, views, and audit logging</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Admin dashboard with user and transaction supervision</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Printable transaction receipts and CSV export reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Intelligent hands-free AI Voice Assistant (WiseVoice)</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-right">
            <span className="text-xs font-semibold text-slate-400 italic block">
              Build Smarter • Manage Better
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Wallet<span className="text-teal-500">Wise</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

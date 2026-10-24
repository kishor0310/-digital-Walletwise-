const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

// Database configuration
const DB_DIALECT = process.env.DB_DIALECT || 'sqlite';
const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'walletwise.db');

let sqliteDb = null;
let mysqlPool = null;

if (DB_DIALECT === 'mysql' && process.env.DB_HOST) {
  const mysql = require('mysql2/promise');
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'walletwise_db',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
  });
  console.log(`[DB] Configured for MySQL at ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
} else {
  // SQLite persistent relational database
  sqliteDb = new Database(DB_PATH);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');
  console.log(`[DB] Persistent SQLite relational database initialized at: ${DB_PATH}`);
}

/**
 * Initialize Schema and Seeds
 */
async function initDatabase() {
  if (sqliteDb) {
    // Create tables in SQLite
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER' CHECK(role IN ('USER', 'ADMIN')),
        account_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(account_status IN ('ACTIVE', 'SUSPENDED', 'CLOSED')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS wallets (
        wallet_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        wallet_number TEXT NOT NULL UNIQUE,
        balance REAL NOT NULL DEFAULT 0.00 CHECK (balance >= 0.0),
        currency TEXT NOT NULL DEFAULT 'INR',
        wallet_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(wallet_status IN ('ACTIVE', 'FROZEN', 'CLOSED')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS transactions (
        transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference_number TEXT NOT NULL UNIQUE,
        idempotency_key TEXT UNIQUE,
        sender_wallet_id INTEGER,
        receiver_wallet_id INTEGER,
        transaction_type TEXT NOT NULL CHECK(transaction_type IN ('ADD_MONEY', 'TRANSFER', 'BILL_PAYMENT')),
        amount REAL NOT NULL CHECK(amount > 0.0),
        description TEXT,
        status TEXT NOT NULL DEFAULT 'SUCCESS' CHECK(status IN ('SUCCESS', 'FAILED', 'PENDING')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (sender_wallet_id) REFERENCES wallets(wallet_id) ON DELETE SET NULL,
        FOREIGN KEY (receiver_wallet_id) REFERENCES wallets(wallet_id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS transaction_entries (
        entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER NOT NULL,
        wallet_id INTEGER NOT NULL,
        entry_type TEXT NOT NULL CHECK(entry_type IN ('CREDIT', 'DEBIT')),
        amount REAL NOT NULL CHECK(amount > 0.0),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
        FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS bill_payments (
        bill_payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER NOT NULL UNIQUE,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        provider_name TEXT NOT NULL,
        customer_reference TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0.0),
        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_user_id INTEGER,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (actor_user_id) REFERENCES users(user_id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_wallets_number ON wallets(wallet_number);
      CREATE INDEX IF NOT EXISTS idx_txn_ref ON transactions(reference_number);
      CREATE INDEX IF NOT EXISTS idx_entries_wallet ON transaction_entries(wallet_id);
    `);

    // Check if seeded
    const userCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
      console.log('[DB] Seeding demonstration data...');
      const salt = bcrypt.genSaltSync(10);
      const userHash = bcrypt.hashSync('password123', salt);
      const adminHash = bcrypt.hashSync('admin123', salt);

      const insertUser = sqliteDb.prepare(`
        INSERT INTO users (user_id, full_name, email, phone, password_hash, role, account_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertUser.run(1, 'System Administrator', 'admin@walletwise.com', '+91 98765 00000', adminHash, 'ADMIN', 'ACTIVE', '2026-10-01 09:00:00');
      insertUser.run(2, 'Mega Sree', 'megasree@email.com', '+91 98765 43210', userHash, 'USER', 'ACTIVE', '2026-10-15 10:30:00');
      insertUser.run(3, 'Arun', 'arun@email.com', '+91 98765 43211', userHash, 'USER', 'ACTIVE', '2026-10-16 11:15:00');
      insertUser.run(4, 'Priya', 'priya@email.com', '+91 98765 43212', userHash, 'USER', 'ACTIVE', '2026-10-17 14:20:00');

      const insertWallet = sqliteDb.prepare(`
        INSERT INTO wallets (wallet_id, user_id, wallet_number, balance, currency, wallet_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      insertWallet.run(1, 1, 'WW1000000001', 50000.00, 'INR', 'ACTIVE', '2026-10-01 09:00:00');
      insertWallet.run(2, 2, 'WW1123456789', 5280.00, 'INR', 'ACTIVE', '2026-10-15 10:30:00');
      insertWallet.run(3, 3, 'WW2234567890', 3450.00, 'INR', 'ACTIVE', '2026-10-16 11:15:00');
      insertWallet.run(4, 4, 'WW3345678901', 6120.00, 'INR', 'ACTIVE', '2026-10-17 14:20:00');

      const insertTxn = sqliteDb.prepare(`
        INSERT INTO transactions (transaction_id, reference_number, idempotency_key, sender_wallet_id, receiver_wallet_id, transaction_type, amount, description, status, created_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertTxn.run(121, 'BILL123456', 'idemp_bill_121', 2, null, 'BILL_PAYMENT', 499.00, 'Broadband Internet Bill (Failed network response)', 'FAILED', '2026-10-19 14:45:00', '2026-10-19 14:45:05');
      insertTxn.run(122, 'TRF654321', 'idemp_trf_122', 4, 2, 'TRANSFER', 300.00, 'Lunch contribution', 'SUCCESS', '2026-10-20 19:12:00', '2026-10-20 19:12:02');
      insertTxn.run(123, 'ADD456789', 'idemp_add_123', null, 2, 'ADD_MONEY', 2000.00, 'Demo wallet top-up via UPI', 'SUCCESS', '2026-10-21 11:30:00', '2026-10-21 11:30:01');
      insertTxn.run(124, 'BILL907654', 'idemp_bill_124', 2, null, 'BILL_PAYMENT', 795.00, 'Electricity bill payment - TNEB', 'SUCCESS', '2026-10-21 16:15:00', '2026-10-21 16:15:03');
      insertTxn.run(125, 'TRF123456', 'idemp_trf_125', 2, 3, 'TRANSFER', 500.00, 'Project resource fee', 'SUCCESS', '2026-10-22 10:34:00', '2026-10-22 10:34:02');

      const insertEntry = sqliteDb.prepare(`
        INSERT INTO transaction_entries (entry_id, transaction_id, wallet_id, entry_type, amount, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      insertEntry.run(1, 122, 4, 'DEBIT', 300.00, '2026-10-20 19:12:02');
      insertEntry.run(2, 122, 2, 'CREDIT', 300.00, '2026-10-20 19:12:02');
      insertEntry.run(3, 123, 2, 'CREDIT', 2000.00, '2026-10-21 11:30:01');
      insertEntry.run(4, 124, 2, 'DEBIT', 795.00, '2026-10-21 16:15:03');
      insertEntry.run(5, 125, 2, 'DEBIT', 500.00, '2026-10-22 10:34:02');
      insertEntry.run(6, 125, 3, 'CREDIT', 500.00, '2026-10-22 10:34:02');

      const insertBill = sqliteDb.prepare(`
        INSERT INTO bill_payments (bill_payment_id, transaction_id, user_id, category, provider_name, customer_reference, amount, payment_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertBill.run(1, 124, 2, 'Electricity', 'Tamil Nadu Electricity Board (TNEB)', 'EB-CONSUMER-991204', 795.00, '2026-10-21 16:15:00');

      const insertAudit = sqliteDb.prepare(`
        INSERT INTO audit_logs (log_id, actor_user_id, action, entity_type, entity_id, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertAudit.run(1, 1, 'SYSTEM_INITIALIZATION', 'SYSTEM', '1', 'Initial database schema and synthetic wallets populated', '2026-10-01 09:00:00');
      insertAudit.run(2, 2, 'USER_LOGIN', 'USER', '2', 'User logged in successfully from demo client', '2026-10-21 10:00:00');
      insertAudit.run(3, 2, 'ADD_MONEY', 'WALLET', '2', 'Simulated addition of 2000.00 INR to wallet WW1123456789', '2026-10-21 11:30:01');
      insertAudit.run(4, 2, 'BILL_PAYMENT', 'BILL', '1', 'Paid 795.00 INR for Electricity (TNEB)', '2026-10-21 16:15:03');
      insertAudit.run(5, 2, 'TRANSFER_FUNDS', 'TRANSACTION', '125', 'Transferred 500.00 INR to Arun (WW2234567890)', '2026-10-22 10:34:02');

      console.log('[DB] Seeding completed successfully. Demo users: megasree@email.com, admin@walletwise.com');
    }
  } else if (mysqlPool) {
    // MySQL initialization
    console.log('[DB] Connecting to MySQL and verifying tables...');
  }
}

/**
 * Universal Database Wrapper for Parameterized Queries
 */
const db = {
  get: async (sql, params = []) => {
    if (sqliteDb) {
      return sqliteDb.prepare(sql).get(...params);
    }
    const [rows] = await mysqlPool.execute(sql, params);
    return rows[0] || null;
  },

  all: async (sql, params = []) => {
    if (sqliteDb) {
      return sqliteDb.prepare(sql).all(...params);
    }
    const [rows] = await mysqlPool.execute(sql, params);
    return rows;
  },

  run: async (sql, params = []) => {
    if (sqliteDb) {
      const result = sqliteDb.prepare(sql).run(...params);
      return { insertId: result.lastInsertRowid, affectedRows: result.changes };
    }
    const [result] = await mysqlPool.execute(sql, params);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
  },

  /**
   * Execute callback inside an ACID transaction with automatic commit / rollback
   */
  transaction: async (fn) => {
    if (sqliteDb) {
      const runTxn = sqliteDb.transaction(fn);
      return runTxn();
    }
    const connection = await mysqlPool.getConnection();
    await connection.beginTransaction();
    try {
      const result = await fn(connection);
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  getRawSqlite: () => sqliteDb,
  getMysqlPool: () => mysqlPool,
  initDatabase,
  getDialect: () => (mysqlPool ? 'mysql' : 'sqlite')
};

module.exports = db;

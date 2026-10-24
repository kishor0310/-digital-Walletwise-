# WalletWise — Digital Wallet Management System 💳

> **Academic DBMS Project**  
> A full-stack, secure, responsive digital wallet web application engineered with real relational database management concepts, ACID transactions, double-entry ledger bookkeeping, light/dark mode, and an intelligent hands-free AI voice assistant (**WiseVoice**).

---

## 🌟 Key Features

1. **Light Mode Primary Experience (with Dark Mode toggle)**:
   - Designed with a clean, high-contrast fintech aesthetic matching the visual reference.
   - One-click Sun/Moon toggle in the navigation bar and profile page.

2. **WiseVoice AI Voice Assistant**:
   - Hands-free digital wallet management using the browser Web Speech API (Speech Recognition + Speech Synthesis).
   - Natural voice commands:
     - *"What is my balance?"*
     - *"Add 500 rupees"*
     - *"Transfer 200 to Arun"*
     - *"Pay electricity bill"*
     - *"Show transaction history"*
     - *"Switch to light mode"* / *"Switch to dark mode"*
     - *"Show database schema"*

3. **Core Wallet Functionalities**:
   - **Wallet Overview**: Real-time balance display (₹ 5,280.00), synthetic wallet numbering (`WW1123456789`), deposit & expenditure statistics.
   - **Add Demo Money**: Instant simulated deposit with quick presets (`+ ₹100`, `+ ₹500`, `+ ₹1,000`, `+ ₹2,000`), celebratory confetti, and atomic ledger credit.
   - **Transfer Funds**: Atomic peer-to-peer transfers with deadlock prevention, self-transfer rejection, and debit/credit ledger records.
   - **Pay Utility Bills**: Dynamic provider catalogs for Electricity (TNEB, Bescom, Tata Power), Water, Broadband, Gas, Mobile, and Education.
   - **Transaction Receipts**: Official printable receipt slips with reference numbers, status badge, and print layout.
   - **Search & Filtering**: Multi-column filters by date range, transaction type, status, and keyword search with pagination.

4. **Administration & Security**:
   - **Admin Dashboard**: System metrics (Total Users, Total Wallets, Total Volume, Success/Failure counters).
   - **User Management**: Administrative ability to inspect, activate, or suspend user accounts and freeze associated wallets.
   - **Audit Logs**: Immutable chronological record of system and user operations.
   - **Security**: Bcrypt password hashing, JWT stateless authentication, input validation, and SQL injection prevention via parameterized queries.

---

## 🗄️ Relational DBMS Architecture

WalletWise demonstrates core academic DBMS principles:

- **Atomicity & Rollback**: Transfers update sender and receiver balances in a single isolated transaction. If either operation fails, the entire transaction rolls back.
- **Double-Entry Ledger (`transaction_entries`)**: Every monetary movement creates balanced `CREDIT` and `DEBIT` ledger rows.
- **Referential Integrity**: Strict Foreign Key constraints across `users`, `wallets`, `transactions`, `transaction_entries`, `bill_payments`, and `audit_logs`.
- **Database Normalization**: Normalized to 3NF/BCNF to prevent insert, update, and deletion anomalies.

### Entity Relationship (ER) Summary
- `users` (1) ── (1) `wallets`
- `wallets` (1) ── (N) `transactions` (Sender / Receiver roles)
- `transactions` (1) ── (N) `transaction_entries`
- `wallets` (1) ── (N) `transaction_entries`
- `transactions` (1) ── (1) `bill_payments`
- `users` (1) ── (N) `bill_payments`
- `users` (1) ── (N) `audit_logs`

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, Canvas-Confetti
- **Backend**: Node.js, Express.js, JWT, Bcryptjs, Express Rate Limit, Helmet, CORS
- **Database**: SQLite (better-sqlite3) / MySQL (mysql2 driver)
- **Audio / AI**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm

### 1. Clone & Setup
```bash
git clone https://github.com/kishor0310/-digital-Walletwise-.git
cd -digital-Walletwise-
```

### 2. Backend Setup
```bash
cd server
npm install
node src/app.js
```
*The server will initialize the persistent database, seed demonstration data, and listen on `http://localhost:5001`.*

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```
*Open `http://localhost:5173/` in your browser.*

---

## 👤 Demonstration Credentials

Pre-seeded accounts available on the login page:

| Role | Email | Password | Initial Balance |
| :--- | :--- | :--- | :--- |
| **Standard User** | `megasree@email.com` | `password123` | ₹ 5,280.00 |
| **Administrator** | `admin@walletwise.com` | `admin123` | ₹ 50,000.00 |
| **Peer User** | `arun@email.com` | `password123` | ₹ 3,450.00 |
| **Peer User** | `priya@email.com` | `password123` | ₹ 6,120.00 |

---

## 📜 Academic Disclaimer
*WalletWise is built as an academic demonstration for college DBMS coursework. All transactions, accounts, and currency values are simulated demo records. No real financial services or payment gateways are accessed.*

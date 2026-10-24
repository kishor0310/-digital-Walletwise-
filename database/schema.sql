-- ============================================================================
-- WALLETWISE - DIGITAL WALLET MANAGEMENT SYSTEM
-- Relational Database Management System (RDBMS) Schema
-- Database: walletwise_db (MySQL 8.0+ compatible / ANSI SQL)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `walletwise_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `walletwise_db`;

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `bill_payments`;
DROP TABLE IF EXISTS `transaction_entries`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `wallets`;
DROP TABLE IF EXISTS `users`;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- Stores credentials, role (USER/ADMIN), and basic user profile information.
-- ----------------------------------------------------------------------------
CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(20) UNIQUE NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  `account_status` ENUM('ACTIVE', 'SUSPENDED', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. WALLETS TABLE
-- Represents the virtual balance account for each user.
-- Strict 1:1 relationship with users table enforced by UNIQUE(`user_id`).
-- ----------------------------------------------------------------------------
CREATE TABLE `wallets` (
  `wallet_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `wallet_number` VARCHAR(30) NOT NULL UNIQUE,
  `balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `wallet_status` ENUM('ACTIVE', 'FROZEN', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_wallets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_wallet_balance_non_negative` CHECK (`balance` >= 0.00),
  INDEX `idx_wallets_number` (`wallet_number`),
  INDEX `idx_wallets_user` (`user_id`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. TRANSACTIONS TABLE
-- Master journal for all fund movements (ADD_MONEY, TRANSFER, BILL_PAYMENT).
-- ----------------------------------------------------------------------------
CREATE TABLE `transactions` (
  `transaction_id` INT AUTO_INCREMENT PRIMARY KEY,
  `reference_number` VARCHAR(50) NOT NULL UNIQUE,
  `idempotency_key` VARCHAR(100) UNIQUE NULL,
  `sender_wallet_id` INT NULL,
  `receiver_wallet_id` INT NULL,
  `transaction_type` ENUM('ADD_MONEY', 'TRANSFER', 'BILL_PAYMENT') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `description` VARCHAR(255) NULL,
  `status` ENUM('SUCCESS', 'FAILED', 'PENDING') NOT NULL DEFAULT 'SUCCESS',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL,
  CONSTRAINT `fk_txn_sender_wallet` FOREIGN KEY (`sender_wallet_id`) REFERENCES `wallets` (`wallet_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_txn_receiver_wallet` FOREIGN KEY (`receiver_wallet_id`) REFERENCES `wallets` (`wallet_id`) ON DELETE SET NULL,
  CONSTRAINT `chk_txn_amount_positive` CHECK (`amount` > 0.00),
  INDEX `idx_txn_ref` (`reference_number`),
  INDEX `idx_txn_type` (`transaction_type`),
  INDEX `idx_txn_status` (`status`),
  INDEX `idx_txn_created_at` (`created_at`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. TRANSACTION_ENTRIES TABLE
-- Double-entry bookkeeping ledger storing individual DEBIT and CREDIT lines.
-- Enforces integrity: every TRANSFER produces 1 DEBIT and 1 CREDIT entry.
-- ----------------------------------------------------------------------------
CREATE TABLE `transaction_entries` (
  `entry_id` INT AUTO_INCREMENT PRIMARY KEY,
  `transaction_id` INT NOT NULL,
  `wallet_id` INT NOT NULL,
  `entry_type` ENUM('CREDIT', 'DEBIT') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_entries_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`transaction_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_entries_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`wallet_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_entry_amount_positive` CHECK (`amount` > 0.00),
  INDEX `idx_entries_wallet` (`wallet_id`),
  INDEX `idx_entries_txn` (`transaction_id`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. BILL_PAYMENTS TABLE
-- Specific utility bill records linked to utility categories, providers & ref.
-- ----------------------------------------------------------------------------
CREATE TABLE `bill_payments` (
  `bill_payment_id` INT AUTO_INCREMENT PRIMARY KEY,
  `transaction_id` INT NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `provider_name` VARCHAR(100) NOT NULL,
  `customer_reference` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `payment_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_bill_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`transaction_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bill_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_bill_amount_positive` CHECK (`amount` > 0.00),
  INDEX `idx_bills_user` (`user_id`),
  INDEX `idx_bills_category` (`category`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. AUDIT_LOGS TABLE
-- Security & compliance audit trail for sensitive administrative and user events.
-- ----------------------------------------------------------------------------
CREATE TABLE `audit_logs` (
  `log_id` INT AUTO_INCREMENT PRIMARY KEY,
  `actor_user_id` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` VARCHAR(50) NULL,
  `details` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  INDEX `idx_audit_actor` (`actor_user_id`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_created_at` (`created_at`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. SQL VIEWS (Academic DBMS Requirement)
-- Useful aggregated views for reporting, dashboards, and audit reviews
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `v_user_wallet_summary` AS
SELECT 
  u.user_id,
  u.full_name,
  u.email,
  u.role,
  u.account_status,
  w.wallet_id,
  w.wallet_number,
  w.balance,
  w.currency,
  w.wallet_status,
  COALESCE((
    SELECT SUM(te.amount) 
    FROM transaction_entries te 
    JOIN transactions t ON te.transaction_id = t.transaction_id 
    WHERE te.wallet_id = w.wallet_id AND te.entry_type = 'CREDIT' AND t.status = 'SUCCESS'
  ), 0.00) AS total_credited,
  COALESCE((
    SELECT SUM(te.amount) 
    FROM transaction_entries te 
    JOIN transactions t ON te.transaction_id = t.transaction_id 
    WHERE te.wallet_id = w.wallet_id AND te.entry_type = 'DEBIT' AND t.status = 'SUCCESS'
  ), 0.00) AS total_debited
FROM users u
LEFT JOIN wallets w ON u.user_id = w.user_id;

CREATE OR REPLACE VIEW `v_recent_transactions_expanded` AS
SELECT 
  t.transaction_id,
  t.reference_number,
  t.transaction_type,
  t.amount,
  t.description,
  t.status,
  t.created_at,
  sender_u.full_name AS sender_name,
  sender_u.email AS sender_email,
  receiver_u.full_name AS receiver_name,
  receiver_u.email AS receiver_email,
  bp.category AS bill_category,
  bp.provider_name AS bill_provider,
  bp.customer_reference AS bill_customer_ref
FROM transactions t
LEFT JOIN wallets sender_w ON t.sender_wallet_id = sender_w.wallet_id
LEFT JOIN users sender_u ON sender_w.user_id = sender_u.user_id
LEFT JOIN wallets receiver_w ON t.receiver_wallet_id = receiver_w.wallet_id
LEFT JOIN users receiver_u ON receiver_w.user_id = receiver_u.user_id
LEFT JOIN bill_payments bp ON t.transaction_id = bp.transaction_id;

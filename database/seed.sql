-- ============================================================================
-- WALLETWISE - DEMONSTRATION SEED DATA
-- Pre-populates synthetic accounts, wallets, transactions & audit logs
-- All passwords hashed with bcrypt (cost 10) for demo password: "password123"
-- Admin password: "admin123"
-- ============================================================================

USE `walletwise_db`;

-- Passwords:
-- 'password123' -> $2a$10$wT8K8Uj25n1UvgXQjP1K.e.8mYJ3v5X9.sSZZ0Qh5eY0M2W3lO0Gy
-- 'admin123'    -> $2a$10$eO1c8tS1V5qXG5tqJcZ0.eR/e.Q2D4y4O/gqM4Rk.Y2sW7W0oN.kK

-- 1. Insert Users
INSERT INTO `users` (`user_id`, `full_name`, `email`, `phone`, `password_hash`, `role`, `account_status`, `created_at`) VALUES
(1, 'System Administrator', 'admin@walletwise.com', '+91 98765 00000', '$2a$10$eO1c8tS1V5qXG5tqJcZ0.eR/e.Q2D4y4O/gqM4Rk.Y2sW7W0oN.kK', 'ADMIN', 'ACTIVE', '2026-10-01 09:00:00'),
(2, 'Mega Sree', 'megasree@email.com', '+91 98765 43210', '$2a$10$wT8K8Uj25n1UvgXQjP1K.e.8mYJ3v5X9.sSZZ0Qh5eY0M2W3lO0Gy', 'USER', 'ACTIVE', '2026-10-15 10:30:00'),
(3, 'Arun', 'arun@email.com', '+91 98765 43211', '$2a$10$wT8K8Uj25n1UvgXQjP1K.e.8mYJ3v5X9.sSZZ0Qh5eY0M2W3lO0Gy', 'USER', 'ACTIVE', '2026-10-16 11:15:00'),
(4, 'Priya', 'priya@email.com', '+91 98765 43212', '$2a$10$wT8K8Uj25n1UvgXQjP1K.e.8mYJ3v5X9.sSZZ0Qh5eY0M2W3lO0Gy', 'USER', 'ACTIVE', '2026-10-17 14:20:00');

-- 2. Insert Wallets
-- Mega Sree (wallet_id 2): Balance 5280.00 matching reference dashboard!
INSERT INTO `wallets` (`wallet_id`, `user_id`, `wallet_number`, `balance`, `currency`, `wallet_status`, `created_at`) VALUES
(1, 1, 'WW1000000001', 50000.00, 'INR', 'ACTIVE', '2026-10-01 09:00:00'),
(2, 2, 'WW1123456789', 5280.00, 'INR', 'ACTIVE', '2026-10-15 10:30:00'),
(3, 3, 'WW2234567890', 3450.00, 'INR', 'ACTIVE', '2026-10-16 11:15:00'),
(4, 4, 'WW3345678901', 6120.00, 'INR', 'ACTIVE', '2026-10-17 14:20:00');

-- 3. Insert Transactions matching reference image
INSERT INTO `transactions` (`transaction_id`, `reference_number`, `idempotency_key`, `sender_wallet_id`, `receiver_wallet_id`, `transaction_type`, `amount`, `description`, `status`, `created_at`, `completed_at`) VALUES
(121, 'BILL123456', 'idemp_bill_121', 2, NULL, 'BILL_PAYMENT', 499.00, 'Broadband Internet Bill (Failed network response)', 'FAILED', '2026-10-19 14:45:00', '2026-10-19 14:45:05'),
(122, 'TRF654321', 'idemp_trf_122', 4, 2, 'TRANSFER', 300.00, 'Lunch contribution', 'SUCCESS', '2026-10-20 19:12:00', '2026-10-20 19:12:02'),
(123, 'ADD456789', 'idemp_add_123', NULL, 2, 'ADD_MONEY', 2000.00, 'Demo wallet top-up via UPI', 'SUCCESS', '2026-10-21 11:30:00', '2026-10-21 11:30:01'),
(124, 'BILL907654', 'idemp_bill_124', 2, NULL, 'BILL_PAYMENT', 795.00, 'Electricity bill payment - TNEB', 'SUCCESS', '2026-10-21 16:15:00', '2026-10-21 16:15:03'),
(125, 'TRF123456', 'idemp_trf_125', 2, 3, 'TRANSFER', 500.00, 'Project resource fee', 'SUCCESS', '2026-10-22 10:34:00', '2026-10-22 10:34:02');

-- 4. Insert Double-Entry Transaction Ledger Entries
-- TXN 122 (Priya to Mega Sree 300.00)
INSERT INTO `transaction_entries` (`entry_id`, `transaction_id`, `wallet_id`, `entry_type`, `amount`, `created_at`) VALUES
(1, 122, 4, 'DEBIT', 300.00, '2026-10-20 19:12:02'),
(2, 122, 2, 'CREDIT', 300.00, '2026-10-20 19:12:02');

-- TXN 123 (Add Money to Mega Sree 2000.00)
INSERT INTO `transaction_entries` (`entry_id`, `transaction_id`, `wallet_id`, `entry_type`, `amount`, `created_at`) VALUES
(3, 123, 2, 'CREDIT', 2000.00, '2026-10-21 11:30:01');

-- TXN 124 (Bill payment from Mega Sree 795.00)
INSERT INTO `transaction_entries` (`entry_id`, `transaction_id`, `wallet_id`, `entry_type`, `amount`, `created_at`) VALUES
(4, 124, 2, 'DEBIT', 795.00, '2026-10-21 16:15:03');

-- TXN 125 (Mega Sree to Arun 500.00)
INSERT INTO `transaction_entries` (`entry_id`, `transaction_id`, `wallet_id`, `entry_type`, `amount`, `created_at`) VALUES
(5, 125, 2, 'DEBIT', 500.00, '2026-10-22 10:34:02'),
(6, 125, 3, 'CREDIT', 500.00, '2026-10-22 10:34:02');

-- 5. Insert Bill Payments
INSERT INTO `bill_payments` (`bill_payment_id`, `transaction_id`, `user_id`, `category`, `provider_name`, `customer_reference`, `amount`, `payment_date`) VALUES
(1, 124, 2, 'Electricity', 'Tamil Nadu Electricity Board (TNEB)', 'EB-CONSUMER-991204', 795.00, '2026-10-21 16:15:00');

-- 6. Insert Audit Logs
INSERT INTO `audit_logs` (`log_id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `details`, `created_at`) VALUES
(1, 1, 'SYSTEM_INITIALIZATION', 'SYSTEM', '1', 'Initial database schema and synthetic wallets populated', '2026-10-01 09:00:00'),
(2, 2, 'USER_LOGIN', 'USER', '2', 'User logged in successfully from demo client', '2026-10-21 10:00:00'),
(3, 2, 'ADD_MONEY', 'WALLET', '2', 'Simulated addition of 2000.00 INR to wallet WW1123456789', '2026-10-21 11:30:01'),
(4, 2, 'BILL_PAYMENT', 'BILL', '1', 'Paid 795.00 INR for Electricity (TNEB)', '2026-10-21 16:15:03'),
(5, 2, 'TRANSFER_FUNDS', 'TRANSACTION', '125', 'Transferred 500.00 INR to Arun (WW2234567890)', '2026-10-22 10:34:02');

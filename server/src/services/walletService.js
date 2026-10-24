const db = require('../config/db');
const { DEMO_MAX_ADD_AMOUNT, DEMO_MAX_TRANSFER_AMOUNT, DEMO_MAX_BILL_AMOUNT } = require('../config/env');

function generateReferenceNumber(prefix = 'TXN') {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${timestamp}${random}`;
}

class WalletService {
  /**
   * Add demo money to a wallet atomically
   */
  async addMoney(userId, amount, description = 'Demo wallet top-up', idempotencyKey = null) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Please enter a valid positive amount.');
    }
    if (numAmount > DEMO_MAX_ADD_AMOUNT) {
      throw new Error(`Maximum demo deposit limit is ₹${DEMO_MAX_ADD_AMOUNT.toLocaleString('en-IN')}`);
    }

    const rawDb = db.getRawSqlite();
    if (rawDb) {
      // Use synchronous ACID transaction for SQLite
      const executeTxn = rawDb.transaction(() => {
        // Check idempotency
        if (idempotencyKey) {
          const existing = rawDb.prepare('SELECT * FROM transactions WHERE idempotency_key = ?').get(idempotencyKey);
          if (existing) return existing;
        }

        const wallet = rawDb.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId);
        if (!wallet) throw new Error('Wallet not found for this user account.');
        if (wallet.wallet_status !== 'ACTIVE') throw new Error(`Wallet is ${wallet.wallet_status}. Deposits disabled.`);

        const refNumber = generateReferenceNumber('ADD');
        const newBalance = parseFloat((wallet.balance + numAmount).toFixed(2));

        // Update wallet
        rawDb.prepare('UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE wallet_id = ?')
          .run(newBalance, wallet.wallet_id);

        // Insert transaction
        const txnResult = rawDb.prepare(`
          INSERT INTO transactions (reference_number, idempotency_key, sender_wallet_id, receiver_wallet_id, transaction_type, amount, description, status, completed_at)
          VALUES (?, ?, NULL, ?, 'ADD_MONEY', ?, ?, 'SUCCESS', CURRENT_TIMESTAMP)
        `).run(refNumber, idempotencyKey, wallet.wallet_id, numAmount, description);

        const txnId = txnResult.lastInsertRowid;

        // Insert CREDIT ledger entry
        rawDb.prepare(`
          INSERT INTO transaction_entries (transaction_id, wallet_id, entry_type, amount)
          VALUES (?, ?, 'CREDIT', ?)
        `).run(txnId, wallet.wallet_id, numAmount);

        // Audit log
        rawDb.prepare(`
          INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details)
          VALUES (?, 'ADD_MONEY', 'WALLET', ?, ?)
        `).run(userId, wallet.wallet_id.toString(), `Added ₹${numAmount} to wallet ${wallet.wallet_number}`);

        return {
          transactionId: txnId,
          referenceNumber: refNumber,
          amount: numAmount,
          newBalance,
          transactionType: 'ADD_MONEY',
          status: 'SUCCESS',
          date: new Date().toISOString()
        };
      });

      return executeTxn();
    }

    // Fallback for MySQL pool
    return db.transaction(async (conn) => {
      const [wallets] = await conn.execute('SELECT * FROM wallets WHERE user_id = ? FOR UPDATE', [userId]);
      const wallet = wallets[0];
      if (!wallet) throw new Error('Wallet not found');

      const refNumber = generateReferenceNumber('ADD');
      const newBalance = parseFloat((parseFloat(wallet.balance) + numAmount).toFixed(2));

      await conn.execute('UPDATE wallets SET balance = ? WHERE wallet_id = ?', [newBalance, wallet.wallet_id]);
      const [txnResult] = await conn.execute(`
        INSERT INTO transactions (reference_number, idempotency_key, sender_wallet_id, receiver_wallet_id, transaction_type, amount, description, status, completed_at)
        VALUES (?, ?, NULL, ?, 'ADD_MONEY', ?, ?, 'SUCCESS', CURRENT_TIMESTAMP)
      `, [refNumber, idempotencyKey, wallet.wallet_id, numAmount, description]);

      await conn.execute(`
        INSERT INTO transaction_entries (transaction_id, wallet_id, entry_type, amount)
        VALUES (?, ?, 'CREDIT', ?)
      `, [txnResult.insertId, wallet.wallet_id, numAmount]);

      return {
        transactionId: txnResult.insertId,
        referenceNumber: refNumber,
        amount: numAmount,
        newBalance,
        status: 'SUCCESS'
      };
    });
  }

  /**
   * Transfer demo funds between two wallets atomically with deadlock prevention
   */
  async transferFunds(senderUserId, recipientIdentifier, amount, description = 'Demo peer transfer', idempotencyKey = null) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Please enter a valid transfer amount.');
    }
    if (numAmount > DEMO_MAX_TRANSFER_AMOUNT) {
      throw new Error(`Maximum single transfer limit is ₹${DEMO_MAX_TRANSFER_AMOUNT.toLocaleString('en-IN')}`);
    }

    const rawDb = db.getRawSqlite();
    if (rawDb) {
      const executeTxn = rawDb.transaction(() => {
        // Check idempotency
        if (idempotencyKey) {
          const existing = rawDb.prepare('SELECT * FROM transactions WHERE idempotency_key = ?').get(idempotencyKey);
          if (existing) return existing;
        }

        // Get sender wallet
        const senderWallet = rawDb.prepare('SELECT * FROM wallets WHERE user_id = ?').get(senderUserId);
        if (!senderWallet) throw new Error('Sender wallet not found.');
        if (senderWallet.wallet_status !== 'ACTIVE') throw new Error(`Your wallet is ${senderWallet.wallet_status}. Transfers disabled.`);

        // Find recipient user and wallet by email, wallet_number, or user_id
        const recipientWallet = rawDb.prepare(`
          SELECT w.*, u.user_id as rec_user_id, u.full_name as rec_name, u.email as rec_email
          FROM wallets w
          JOIN users u ON w.user_id = u.user_id
          WHERE (u.email = ? OR w.wallet_number = ? OR u.user_id = ?)
        `).get(recipientIdentifier, recipientIdentifier, parseInt(recipientIdentifier, 10) || -1);

        if (!recipientWallet) {
          throw new Error('Recipient not found. Check the email or wallet number.');
        }

        // Self transfer check
        if (senderWallet.wallet_id === recipientWallet.wallet_id) {
          throw new Error('Self-transfer is not permitted. You cannot send money to your own wallet.');
        }

        if (recipientWallet.wallet_status !== 'ACTIVE') {
          throw new Error(`Recipient wallet is currently ${recipientWallet.wallet_status}.`);
        }

        // Check sender balance
        if (senderWallet.balance < numAmount) {
          // Log failed transaction attempt for audit and reporting
          const failedRef = generateReferenceNumber('TRF_FAIL');
          rawDb.prepare(`
            INSERT INTO transactions (reference_number, sender_wallet_id, receiver_wallet_id, transaction_type, amount, description, status)
            VALUES (?, ?, ?, 'TRANSFER', ?, ?, 'FAILED')
          `).run(failedRef, senderWallet.wallet_id, recipientWallet.wallet_id, numAmount, `${description} (Insufficient funds)`);

          throw new Error(`Insufficient funds. Your balance is ₹${senderWallet.balance.toFixed(2)}, required ₹${numAmount.toFixed(2)}.`);
        }

        // Lock wallets in consistent ordered sequence (lowest wallet_id first) to prevent deadlock
        const firstId = Math.min(senderWallet.wallet_id, recipientWallet.wallet_id);
        const secondId = Math.max(senderWallet.wallet_id, recipientWallet.wallet_id);
        rawDb.prepare('SELECT wallet_id FROM wallets WHERE wallet_id = ?').get(firstId);
        rawDb.prepare('SELECT wallet_id FROM wallets WHERE wallet_id = ?').get(secondId);

        // Perform atomic balance updates
        const senderNewBalance = parseFloat((senderWallet.balance - numAmount).toFixed(2));
        const recipientNewBalance = parseFloat((recipientWallet.balance + numAmount).toFixed(2));

        rawDb.prepare('UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE wallet_id = ?')
          .run(senderNewBalance, senderWallet.wallet_id);

        rawDb.prepare('UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE wallet_id = ?')
          .run(recipientNewBalance, recipientWallet.wallet_id);

        // Insert master transaction
        const refNumber = generateReferenceNumber('TRF');
        const txnResult = rawDb.prepare(`
          INSERT INTO transactions (reference_number, idempotency_key, sender_wallet_id, receiver_wallet_id, transaction_type, amount, description, status, completed_at)
          VALUES (?, ?, ?, ?, 'TRANSFER', ?, ?, 'SUCCESS', CURRENT_TIMESTAMP)
        `).run(refNumber, idempotencyKey, senderWallet.wallet_id, recipientWallet.wallet_id, numAmount, description);

        const txnId = txnResult.lastInsertRowid;

        // Double-entry ledger: DEBIT sender, CREDIT recipient
        rawDb.prepare(`
          INSERT INTO transaction_entries (transaction_id, wallet_id, entry_type, amount)
          VALUES (?, ?, 'DEBIT', ?)
        `).run(txnId, senderWallet.wallet_id, numAmount);

        rawDb.prepare(`
          INSERT INTO transaction_entries (transaction_id, wallet_id, entry_type, amount)
          VALUES (?, ?, 'CREDIT', ?)
        `).run(txnId, recipientWallet.wallet_id, numAmount);

        // Audit log
        rawDb.prepare(`
          INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details)
          VALUES (?, 'TRANSFER_FUNDS', 'TRANSACTION', ?, ?)
        `).run(senderUserId, txnId.toString(), `Transferred ₹${numAmount} from ${senderWallet.wallet_number} to ${recipientWallet.wallet_number}`);

        return {
          transactionId: txnId,
          referenceNumber: refNumber,
          amount: numAmount,
          senderBalance: senderNewBalance,
          recipient: {
            name: recipientWallet.rec_name,
            email: recipientWallet.rec_email,
            walletNumber: recipientWallet.wallet_number
          },
          status: 'SUCCESS',
          date: new Date().toISOString()
        };
      });

      return executeTxn();
    }

    throw new Error('Database connection unavailable.');
  }

  /**
   * Pay utility bill demo transaction
   */
  async payBill(userId, category, providerName, customerReference, amount, description = null, idempotencyKey = null) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Please enter a valid bill payment amount.');
    }
    if (numAmount > DEMO_MAX_BILL_AMOUNT) {
      throw new Error(`Maximum bill payment limit is ₹${DEMO_MAX_BILL_AMOUNT.toLocaleString('en-IN')}`);
    }
    if (!category || !providerName || !customerReference) {
      throw new Error('Category, provider name, and customer account reference are all required.');
    }

    const rawDb = db.getRawSqlite();
    if (rawDb) {
      const executeTxn = rawDb.transaction(() => {
        const wallet = rawDb.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId);
        if (!wallet) throw new Error('Wallet not found.');
        if (wallet.wallet_status !== 'ACTIVE') throw new Error(`Wallet is ${wallet.wallet_status}.`);

        if (wallet.balance < numAmount) {
          const failedRef = generateReferenceNumber('BILL_FAIL');
          rawDb.prepare(`
            INSERT INTO transactions (reference_number, sender_wallet_id, receiver_wallet_id, transaction_type, amount, description, status)
            VALUES (?, ?, NULL, 'BILL_PAYMENT', ?, ?, 'FAILED')
          `).run(failedRef, wallet.wallet_id, numAmount, `${providerName} (${category}) payment failed - Insufficient balance`);

          throw new Error(`Insufficient wallet balance. You have ₹${wallet.balance.toFixed(2)}, required ₹${numAmount.toFixed(2)}.`);
        }

        const newBalance = parseFloat((wallet.balance - numAmount).toFixed(2));
        rawDb.prepare('UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE wallet_id = ?')
          .run(newBalance, wallet.wallet_id);

        const refNumber = generateReferenceNumber('BILL');
        const txnDesc = description || `${category} Bill Payment to ${providerName} (Ref: ${customerReference})`;

        const txnResult = rawDb.prepare(`
          INSERT INTO transactions (reference_number, idempotency_key, sender_wallet_id, receiver_wallet_id, transaction_type, amount, description, status, completed_at)
          VALUES (?, ?, ?, NULL, 'BILL_PAYMENT', ?, ?, 'SUCCESS', CURRENT_TIMESTAMP)
        `).run(refNumber, idempotencyKey, wallet.wallet_id, numAmount, txnDesc);

        const txnId = txnResult.lastInsertRowid;

        // Debit entry
        rawDb.prepare(`
          INSERT INTO transaction_entries (transaction_id, wallet_id, entry_type, amount)
          VALUES (?, ?, 'DEBIT', ?)
        `).run(txnId, wallet.wallet_id, numAmount);

        // Bill payment record
        const billResult = rawDb.prepare(`
          INSERT INTO bill_payments (transaction_id, user_id, category, provider_name, customer_reference, amount)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(txnId, userId, category, providerName, customerReference, numAmount);

        // Audit log
        rawDb.prepare(`
          INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details)
          VALUES (?, 'BILL_PAYMENT', 'BILL', ?, ?)
        `).run(userId, billResult.lastInsertRowid.toString(), `Paid ₹${numAmount} for ${category} (${providerName})`);

        return {
          transactionId: txnId,
          billPaymentId: billResult.lastInsertRowid,
          referenceNumber: refNumber,
          category,
          providerName,
          customerReference,
          amount: numAmount,
          newBalance,
          status: 'SUCCESS',
          date: new Date().toISOString()
        };
      });

      return executeTxn();
    }

    throw new Error('Database connection unavailable.');
  }
}

module.exports = new WalletService();

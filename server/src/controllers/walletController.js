const db = require('../config/db');
const walletService = require('../services/walletService');

const walletController = {
  /**
   * Get wallet summary including total added, transferred, and payments (matching reference dashboard!)
   */
  async getWallet(req, res) {
    try {
      const userId = req.user.user_id;

      const wallet = await db.get(
        'SELECT wallet_id, user_id, wallet_number, balance, currency, wallet_status, created_at, updated_at FROM wallets WHERE user_id = ?',
        [userId]
      );

      if (!wallet) {
        return res.status(404).json({ success: false, message: 'Wallet not found.' });
      }

      // Compute aggregates from persisted double-entry ledger and transactions
      // 1. Total Added (all successful ADD_MONEY into this wallet)
      const addedRow = await db.get(`
        SELECT COALESCE(SUM(amount), 0) as total_added
        FROM transactions
        WHERE receiver_wallet_id = ? AND transaction_type = 'ADD_MONEY' AND status = 'SUCCESS'
      `, [wallet.wallet_id]);

      // 2. Total Transferred (all successful transfers sent by this wallet)
      const transferredRow = await db.get(`
        SELECT COALESCE(SUM(amount), 0) as total_transferred
        FROM transactions
        WHERE sender_wallet_id = ? AND transaction_type = 'TRANSFER' AND status = 'SUCCESS'
      `, [wallet.wallet_id]);

      // 3. Total Payments (all successful bill payments sent by this wallet)
      const paymentsRow = await db.get(`
        SELECT COALESCE(SUM(amount), 0) as total_payments
        FROM transactions
        WHERE sender_wallet_id = ? AND transaction_type = 'BILL_PAYMENT' AND status = 'SUCCESS'
      `, [wallet.wallet_id]);

      // 4. Total Spent = total transferred + total payments
      const totalSpent = (parseFloat(transferredRow?.total_transferred || 0) + parseFloat(paymentsRow?.total_payments || 0));

      return res.status(200).json({
        success: true,
        wallet: {
          ...wallet,
          totalAdded: parseFloat(addedRow?.total_added || 0),
          totalTransferred: parseFloat(transferredRow?.total_transferred || 0),
          totalPayments: parseFloat(paymentsRow?.total_payments || 0),
          totalSpent
        }
      });
    } catch (error) {
      console.error('[getWallet Error]', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve wallet information.' });
    }
  },

  /**
   * Get current balance
   */
  async getBalance(req, res) {
    try {
      const wallet = await db.get(
        'SELECT wallet_id, wallet_number, balance, currency, wallet_status FROM wallets WHERE user_id = ?',
        [req.user.user_id]
      );
      if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found.' });

      return res.status(200).json({
        success: true,
        balance: wallet.balance,
        currency: wallet.currency,
        walletNumber: wallet.wallet_number,
        status: wallet.wallet_status
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve balance.' });
    }
  },

  /**
   * Add demo money
   */
  async addMoney(req, res) {
    try {
      const { amount, description, idempotencyKey } = req.body;
      const result = await walletService.addMoney(req.user.user_id, amount, description, idempotencyKey);
      return res.status(200).json({
        success: true,
        message: `Successfully added ₹${result.amount.toFixed(2)} to your demo wallet.`,
        transaction: result
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
};

module.exports = walletController;

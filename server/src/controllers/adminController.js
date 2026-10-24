const db = require('../config/db');

const adminController = {
  /**
   * Get system-wide stats matching the Admin Dashboard in reference image
   */
  async getDashboard(req, res) {
    try {
      // Total users
      const userCountRow = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['USER']);
      // Total wallets
      const walletCountRow = await db.get('SELECT COUNT(*) as count FROM wallets');
      // Total volume
      const volumeRow = await db.get('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = ?', ['SUCCESS']);
      // Successful & Failed
      const successRow = await db.get('SELECT COUNT(*) as count FROM transactions WHERE status = ?', ['SUCCESS']);
      const failedRow = await db.get('SELECT COUNT(*) as count FROM transactions WHERE status = ?', ['FAILED']);

      // Recent 10 transactions system-wide
      const recentTransactions = await db.all(`
        SELECT 
          t.transaction_id,
          t.reference_number,
          t.transaction_type,
          t.amount,
          t.status,
          t.created_at,
          COALESCE(su.full_name, 'External') as sender_name,
          COALESCE(ru.full_name, bp.provider_name, 'External') as receiver_name
        FROM transactions t
        LEFT JOIN wallets sw ON t.sender_wallet_id = sw.wallet_id
        LEFT JOIN users su ON sw.user_id = su.user_id
        LEFT JOIN wallets rw ON t.receiver_wallet_id = rw.wallet_id
        LEFT JOIN users ru ON rw.user_id = ru.user_id
        LEFT JOIN bill_payments bp ON t.transaction_id = bp.transaction_id
        ORDER BY t.created_at DESC
        LIMIT 10
      `);

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers: (userCountRow?.count || 0) + 1, // Include all demo users
          totalWallets: walletCountRow?.count || 0,
          totalVolume: parseFloat(volumeRow?.total || 0),
          successfulTransactions: successRow?.count || 0,
          failedTransactions: failedRow?.count || 0
        },
        recentTransactions
      });
    } catch (error) {
      console.error('[Admin Dashboard Error]', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve admin dashboard stats.' });
    }
  },

  /**
   * List all users with wallet details
   */
  async getUsers(req, res) {
    try {
      const users = await db.all(`
        SELECT 
          u.user_id,
          u.full_name,
          u.email,
          u.phone,
          u.role,
          u.account_status,
          u.created_at,
          w.wallet_id,
          w.wallet_number,
          w.balance,
          w.wallet_status
        FROM users u
        LEFT JOIN wallets w ON u.user_id = w.user_id
        ORDER BY u.user_id ASC
      `);

      return res.status(200).json({ success: true, users });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
    }
  },

  /**
   * Update user status (ACTIVE / SUSPENDED)
   */
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['ACTIVE', 'SUSPENDED', 'CLOSED'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid account status.' });
      }

      await db.run('UPDATE users SET account_status = ? WHERE user_id = ?', [status, id]);

      // If user is suspended, freeze wallet
      const walletStatus = status === 'ACTIVE' ? 'ACTIVE' : 'FROZEN';
      await db.run('UPDATE wallets SET wallet_status = ? WHERE user_id = ?', [walletStatus, id]);

      await db.run(
        'INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.user_id, 'UPDATE_USER_STATUS', 'USER', id.toString(), `Changed status to ${status}`]
      );

      return res.status(200).json({ success: true, message: `User status changed to ${status}.` });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to update user status.' });
    }
  },

  /**
   * List transactions for admin
   */
  async getTransactions(req, res) {
    try {
      const transactions = await db.all(`
        SELECT 
          t.*,
          su.full_name as sender_name,
          su.email as sender_email,
          ru.full_name as receiver_name,
          ru.email as receiver_email,
          bp.category as bill_category,
          bp.provider_name as bill_provider
        FROM transactions t
        LEFT JOIN wallets sw ON t.sender_wallet_id = sw.wallet_id
        LEFT JOIN users su ON sw.user_id = su.user_id
        LEFT JOIN wallets rw ON t.receiver_wallet_id = rw.wallet_id
        LEFT JOIN users ru ON rw.user_id = ru.user_id
        LEFT JOIN bill_payments bp ON t.transaction_id = bp.transaction_id
        ORDER BY t.created_at DESC
        LIMIT 50
      `);

      return res.status(200).json({ success: true, transactions });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve transactions.' });
    }
  },

  /**
   * List audit logs
   */
  async getAuditLogs(req, res) {
    try {
      const logs = await db.all(`
        SELECT 
          al.*,
          u.full_name as actor_name,
          u.email as actor_email,
          u.role as actor_role
        FROM audit_logs al
        LEFT JOIN users u ON al.actor_user_id = u.user_id
        ORDER BY al.created_at DESC
        LIMIT 100
      `);

      return res.status(200).json({ success: true, logs });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
    }
  }
};

module.exports = adminController;

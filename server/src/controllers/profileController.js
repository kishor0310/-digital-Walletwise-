const db = require('../config/db');

const profileController = {
  async getProfile(req, res) {
    try {
      const user = await db.get(
        'SELECT user_id, full_name, email, phone, role, account_status, created_at FROM users WHERE user_id = ?',
        [req.user.user_id]
      );
      const wallet = await db.get(
        'SELECT wallet_id, wallet_number, balance, currency, wallet_status, created_at FROM wallets WHERE user_id = ?',
        [req.user.user_id]
      );

      return res.status(200).json({ success: true, profile: { ...user, wallet } });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
    }
  },

  async updateProfile(req, res) {
    try {
      const { fullName, phone } = req.body;
      if (!fullName) {
        return res.status(400).json({ success: false, message: 'Full name is required.' });
      }

      await db.run(
        'UPDATE users SET full_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [fullName.trim(), phone ? phone.trim() : null, req.user.user_id]
      );

      await db.run(
        'INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.user_id, 'PROFILE_UPDATE', 'USER', req.user.user_id.toString(), 'Updated profile information']
      );

      return res.status(200).json({ success: true, message: 'Profile updated successfully.' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
  }
};

module.exports = profileController;

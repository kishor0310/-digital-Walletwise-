const walletService = require('../services/walletService');
const db = require('../config/db');

const transferController = {
  /**
   * Transfer funds to recipient
   */
  async transfer(req, res) {
    try {
      const { recipient, amount, description, idempotencyKey } = req.body;
      if (!recipient) {
        return res.status(400).json({ success: false, message: 'Please specify recipient email, wallet number, or user ID.' });
      }

      const result = await walletService.transferFunds(
        req.user.user_id,
        recipient.trim(),
        amount,
        description ? description.trim() : 'Peer-to-peer demo transfer',
        idempotencyKey
      );

      return res.status(200).json({
        success: true,
        message: `Transferred ₹${result.amount.toFixed(2)} to ${result.recipient.name} successfully.`,
        transfer: result
      });
    } catch (error) {
      console.error('[Transfer Error]', error);
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * Get single transfer details
   */
  async getTransferById(req, res) {
    try {
      const transferId = req.params.id;
      const transfer = await db.get(`
        SELECT t.*, 
               sw.wallet_number as sender_wallet_number, su.full_name as sender_name, su.email as sender_email,
               rw.wallet_number as receiver_wallet_number, ru.full_name as receiver_name, ru.email as receiver_email
        FROM transactions t
        LEFT JOIN wallets sw ON t.sender_wallet_id = sw.wallet_id
        LEFT JOIN users su ON sw.user_id = su.user_id
        LEFT JOIN wallets rw ON t.receiver_wallet_id = rw.wallet_id
        LEFT JOIN users ru ON rw.user_id = ru.user_id
        WHERE t.transaction_id = ? AND (sw.user_id = ? OR rw.user_id = ?)
      `, [transferId, req.user.user_id, req.user.user_id]);

      if (!transfer) {
        return res.status(404).json({ success: false, message: 'Transfer record not found.' });
      }

      return res.status(200).json({ success: true, transfer });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve transfer.' });
    }
  }
};

module.exports = transferController;

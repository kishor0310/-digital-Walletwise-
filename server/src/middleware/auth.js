const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const db = require('../config/db');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await db.get(
      'SELECT user_id, full_name, email, phone, role, account_status FROM users WHERE user_id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }

    if (user.account_status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: `Account is ${user.account_status}. Please contact support.` });
    }

    const wallet = await db.get(
      'SELECT wallet_id, wallet_number, balance, currency, wallet_status FROM wallets WHERE user_id = ?',
      [user.user_id]
    );

    req.user = user;
    req.wallet = wallet;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrative privileges required.' });
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

function generateWalletNumber() {
  const digits = Math.floor(1000000000 + Math.random() * 9000000000);
  return `WW${digits}`;
}

const authController = {
  /**
   * Register a new user and automatically provision an associated wallet
   */
  async register(req, res) {
    try {
      const { fullName, email, password, phone } = req.body;

      if (!fullName || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide full name, email, and password.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }

      // Check existing email
      const existingUser = await db.get('SELECT user_id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const walletNumber = generateWalletNumber();

      const rawDb = db.getRawSqlite();
      let createdUser = null;

      if (rawDb) {
        const createAccount = rawDb.transaction(() => {
          // 1. Insert User
          const userResult = rawDb.prepare(`
            INSERT INTO users (full_name, email, phone, password_hash, role, account_status)
            VALUES (?, ?, ?, ?, 'USER', 'ACTIVE')
          `).run(fullName.trim(), email.toLowerCase().trim(), phone ? phone.trim() : null, passwordHash);

          const userId = userResult.lastInsertRowid;

          // 2. Create Initial Wallet with Demo ₹1,000 Welcome credit
          const initialDemoBalance = 1000.00;
          const walletResult = rawDb.prepare(`
            INSERT INTO wallets (user_id, wallet_number, balance, currency, wallet_status)
            VALUES (?, ?, ?, 'INR', 'ACTIVE')
          `).run(userId, walletNumber, initialDemoBalance);

          // 3. Record Initial Credit in transactions and entries
          const refNumber = `ADD${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
          const txnResult = rawDb.prepare(`
            INSERT INTO transactions (reference_number, receiver_wallet_id, transaction_type, amount, description, status, completed_at)
            VALUES (?, ?, 'ADD_MONEY', ?, 'Welcome demo credit', 'SUCCESS', CURRENT_TIMESTAMP)
          `).run(refNumber, walletResult.lastInsertRowid, initialDemoBalance);

          rawDb.prepare(`
            INSERT INTO transaction_entries (transaction_id, wallet_id, entry_type, amount)
            VALUES (?, ?, 'CREDIT', ?)
          `).run(txnResult.lastInsertRowid, walletResult.lastInsertRowid, initialDemoBalance);

          // 4. Audit Log
          rawDb.prepare(`
            INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details)
            VALUES (?, 'USER_REGISTERED', 'USER', ?, 'New user registered with wallet')
          `).run(userId, userId.toString());

          return {
            userId,
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            role: 'USER',
            wallet: {
              walletNumber,
              balance: initialDemoBalance,
              currency: 'INR'
            }
          };
        });

        createdUser = createAccount();
      }

      const token = jwt.sign(
        { userId: createdUser.userId, email: createdUser.email, role: createdUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Demo wallet initialized with ₹1,000 credit.',
        token,
        user: createdUser
      });
    } catch (error) {
      console.error('[Register Error]', error);
      return res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
    }
  },

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password.' });
      }

      const user = await db.get(
        'SELECT * FROM users WHERE email = ?',
        [email.toLowerCase().trim()]
      );

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (user.account_status !== 'ACTIVE') {
        return res.status(403).json({ success: false, message: `Account is ${user.account_status}. Please contact an administrator.` });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const wallet = await db.get(
        'SELECT wallet_id, wallet_number, balance, currency, wallet_status FROM wallets WHERE user_id = ?',
        [user.user_id]
      );

      const token = jwt.sign(
        { userId: user.user_id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Audit Log
      await db.run(
        'INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [user.user_id, 'USER_LOGIN', 'USER', user.user_id.toString(), 'Successful user login']
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          userId: user.user_id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          wallet: wallet || null
        }
      });
    } catch (error) {
      console.error('[Login Error]', error);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  /**
   * Get current authenticated user + wallet
   */
  async getMe(req, res) {
    return res.status(200).json({
      success: true,
      user: {
        userId: req.user.user_id,
        fullName: req.user.full_name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        accountStatus: req.user.account_status,
        wallet: req.wallet
      }
    });
  },

  /**
   * Logout user (client-side token removal)
   */
  async logout(req, res) {
    if (req.user) {
      await db.run(
        'INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.user_id, 'USER_LOGOUT', 'USER', req.user.user_id.toString(), 'User logged out']
      );
    }
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  }
};

module.exports = authController;

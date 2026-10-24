const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PORT } = require('./config/env');
const db = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const transferRoutes = require('./routes/transferRoutes');
const billRoutes = require('./routes/billRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'healthy',
    system: 'WalletWise - Digital Wallet Management System',
    timestamp: new Date().toISOString(),
    database: db.getDialect(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// Global 404 handler
app.use((req, res) => {
  return res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

// Initialize database and start listening
async function startServer() {
  try {
    await db.initDatabase();
    app.listen(PORT, () => {
      console.log(`[WalletWise Server] Running on http://localhost:${PORT}`);
      console.log(`[Health Endpoint] http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to initialize WalletWise server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

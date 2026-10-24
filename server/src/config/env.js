require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'walletwise_academic_jwt_secret_token_2026_xyz',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB_DIALECT: process.env.DB_DIALECT || 'sqlite',
  DEMO_MAX_ADD_AMOUNT: 50000,
  DEMO_MAX_TRANSFER_AMOUNT: 25000,
  DEMO_MAX_BILL_AMOUNT: 20000
};

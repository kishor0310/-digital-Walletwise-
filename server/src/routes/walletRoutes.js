const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, walletController.getWallet);
router.get('/balance', requireAuth, walletController.getBalance);
router.post('/add-money', requireAuth, walletController.addMoney);

module.exports = router;

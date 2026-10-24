const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, transactionController.getTransactions);
router.get('/export', requireAuth, transactionController.exportTransactions);
router.get('/:id', requireAuth, transactionController.getTransactionById);
router.get('/:id/receipt', requireAuth, transactionController.getReceipt);

module.exports = router;

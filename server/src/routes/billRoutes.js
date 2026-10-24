const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { requireAuth } = require('../middleware/auth');

router.get('/categories', billController.getCategories);
router.get('/providers', billController.getProviders);
router.post('/pay', requireAuth, billController.payBill);

module.exports = router;

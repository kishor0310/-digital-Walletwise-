const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth, requireAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.get('/transactions', adminController.getTransactions);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;

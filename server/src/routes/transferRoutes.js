const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, transferController.transfer);
router.get('/:id', requireAuth, transferController.getTransferById);

module.exports = router;

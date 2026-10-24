const walletService = require('../services/walletService');

const BILL_CATALOG = {
  'Electricity': [
    { id: 'tneb', name: 'Tamil Nadu Electricity Board (TNEB)', refLabel: 'Consumer Number (10 digits)' },
    { id: 'bescom', name: 'Bangalore Electricity Supply (BESCOM)', refLabel: 'Consumer Account ID' },
    { id: 'tatapower', name: 'Tata Power - Mumbai / Delhi', refLabel: 'Customer ID' },
    { id: 'adani', name: 'Adani Electricity Mumbai Limited', refLabel: 'Consumer Number' }
  ],
  'Broadband & Internet': [
    { id: 'airtel_broadband', name: 'Airtel Xstream Fiber', refLabel: 'DSL / Landline Number' },
    { id: 'jio_fiber', name: 'JioFiber Broadband', refLabel: 'Service ID / Registered Mobile' },
    { id: 'act_fiber', name: 'ACT Fibernet', refLabel: 'Account Number' }
  ],
  'Mobile Recharge': [
    { id: 'jio_prepaid', name: 'Jio Prepaid / Postpaid', refLabel: '10-Digit Mobile Number' },
    { id: 'airtel_mobile', name: 'Airtel Prepaid / Postpaid', refLabel: '10-Digit Mobile Number' },
    { id: 'vi_mobile', name: 'Vodafone Idea (Vi)', refLabel: '10-Digit Mobile Number' }
  ],
  'Water Utility': [
    { id: 'cmwssb', name: 'Chennai Metro Water (CMWSSB)', refLabel: 'Consumer Service Number' },
    { id: 'djb', name: 'Delhi Jal Board', refLabel: 'K Number' },
    { id: 'bwssb', name: 'Bangalore Water Supply (BWSSB)', refLabel: 'Consumer ID' }
  ],
  'DTH & Cable': [
    { id: 'tataplay', name: 'Tata Play (Tata Sky)', refLabel: 'Subscriber ID / Mobile' },
    { id: 'airteldth', name: 'Airtel Digital TV', refLabel: 'Customer ID' },
    { id: 'sundirect', name: 'Sun Direct DTH', refLabel: 'Smart Card Number' }
  ]
};

const billController = {
  getCategories(req, res) {
    return res.status(200).json({
      success: true,
      categories: Object.keys(BILL_CATALOG)
    });
  },

  getProviders(req, res) {
    const { category } = req.query;
    if (category && BILL_CATALOG[category]) {
      return res.status(200).json({
        success: true,
        category,
        providers: BILL_CATALOG[category]
      });
    }

    return res.status(200).json({
      success: true,
      catalog: BILL_CATALOG
    });
  },

  async payBill(req, res) {
    try {
      const { category, providerName, customerReference, amount, description, idempotencyKey } = req.body;
      const result = await walletService.payBill(
        req.user.user_id,
        category,
        providerName,
        customerReference,
        amount,
        description,
        idempotencyKey
      );

      return res.status(200).json({
        success: true,
        message: `Paid ₹${result.amount.toFixed(2)} to ${result.providerName} successfully.`,
        receipt: result
      });
    } catch (error) {
      console.error('[PayBill Error]', error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }
};

module.exports = billController;

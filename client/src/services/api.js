const API_BASE = '/api';

/**
 * Universal API Request Helper with JWT token injection
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('walletwise_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        // Token expired or invalid
        localStorage.removeItem('walletwise_token');
        localStorage.removeItem('walletwise_user');
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (fullName, email, password, phone) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, phone }),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request('/auth/me'),

  // Wallet
  getWallet: () => request('/wallet'),
  getBalance: () => request('/wallet/balance'),
  addMoney: (amount, description = 'Demo wallet top-up') =>
    request('/wallet/add-money', {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    }),

  // Transfers
  transferFunds: (recipient, amount, description) =>
    request('/transfers', {
      method: 'POST',
      body: JSON.stringify({ recipient, amount, description }),
    }),

  // Bills
  getBillCategories: () => request('/bills/categories'),
  getBillProviders: (category) =>
    request(`/bills/providers?category=${encodeURIComponent(category || '')}`),
  payBill: (category, providerName, customerReference, amount, description) =>
    request('/bills/pay', {
      method: 'POST',
      body: JSON.stringify({
        category,
        providerName,
        customerReference,
        amount,
        description,
      }),
    }),

  // Transactions
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/transactions${query ? `?${query}` : ''}`);
  },

  getTransactionById: (id) => request(`/transactions/${id}`),
  getReceipt: (id) => request(`/transactions/${id}/receipt`),
  
  // Profile
  getProfile: () => request('/profile'),
  updateProfile: (data) =>
    request('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Admin
  getAdminDashboard: () => request('/admin/dashboard'),
  getAdminUsers: () => request('/admin/users'),
  updateUserStatus: (id, status) =>
    request(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getAdminTransactions: () => request('/admin/transactions'),
  getAdminAuditLogs: () => request('/admin/audit-logs'),

  // Health
  checkHealth: () => request('/health'),
};

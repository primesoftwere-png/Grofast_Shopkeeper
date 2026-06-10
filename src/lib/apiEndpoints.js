// ========================================
// AUTHENTICATION APIs (6 APIs)
// ========================================
export const AUTH_ENDPOINTS = {
  REGISTER: '/api/admin/shopkeeper/register', // Single step registration
  LOGIN: '/api/shopkeeper/auth/login',
  PROFILE: '/api/shopkeeper/auth/profile',
  SHOP_UPDATE: '/api/shopkeeper/auth/shop/update',
  TOGGLE_STATUS: '/api/shopkeeper/auth/shop/toggle-status',
};

// ========================================
// ORDER MANAGEMENT APIs (7 APIs)
// ========================================
export const ORDER_ENDPOINTS = {
  ALL: '/api/shopkeeper/orders',
  PENDING: '/api/shopkeeper/orders/pending',
  STATS: '/api/shopkeeper/orders/stats',
  DETAILS: (orderId) => `/api/shopkeeper/orders/${orderId}`,
  ACCEPT: '/api/shopkeeper/orders/accept',
  READY: '/api/shopkeeper/orders/ready',
  CANCEL: '/api/shopkeeper/orders/cancel',
};

// ========================================
// PRODUCT MANAGEMENT APIs (7 APIs)
// ========================================
export const PRODUCT_ENDPOINTS = {
  ADD: '/api/shopkeeper/product/add-product',
  ALL: '/api/shopkeeper/product/get-all-products',
  BY_USER: (userId) => `/api/shopkeeper/product/get-products/${userId}`,
  BY_ID: (productId) => `/api/shopkeeper/product/get-product/${productId}`,
  UPDATE: (productId) => `/api/shopkeeper/product/update-product/${productId}`,
  DELETE: (productId) => `/api/shopkeeper/product/delete-product/${productId}`,
  BY_CATEGORY: (categoryId, userId) => `/api/shopkeeper/product/get-product/${categoryId}/${userId}`,
};

// ========================================
// CATEGORY MANAGEMENT APIs (6 APIs)
// ========================================
export const CATEGORY_ENDPOINTS = {
  ADD: '/api/shopkeeper/category/add-category',
  ALL: '/api/shopkeeper/category/get-categories',
  BY_ID: (categoryId) => `/api/shopkeeper/category/get-category/${categoryId}`,
  UPDATE: (categoryId) => `/api/shopkeeper/category/update-category/${categoryId}`,
  DELETE: (categoryId) => `/api/shopkeeper/category/delete-category/${categoryId}`,
  WITH_PRODUCTS: (userId) => `/api/shopkeeper/category/get-all-categories-with-products/${userId}`,
};

// ========================================
// INVENTORY MANAGEMENT APIs (6 APIs)
// ========================================
export const INVENTORY_ENDPOINTS = {
  ALL: '/api/shopkeeper/inventory',
  UPDATE_STOCK: (productId) => `/api/shopkeeper/inventory/${productId}/stock`,
  LOW_STOCK: '/api/shopkeeper/inventory/low-stock',
  OUT_OF_STOCK: '/api/shopkeeper/inventory/out-of-stock',
  LOGS: '/api/shopkeeper/inventory/logs',
  BULK_UPDATE: '/api/shopkeeper/inventory/bulk-update',
};

// ========================================
// SETTINGS & PROFILE APIs (5 APIs)
// ========================================
export const SETTINGS_ENDPOINTS = {
  ALL: '/api/shopkeeper/settings',
  BUSINESS_HOURS: '/api/shopkeeper/settings/business-hours',
  BANK_DETAILS: '/api/shopkeeper/settings/bank-details',
  PROFILE: '/api/shopkeeper/settings/profile',
  LOCATION: '/api/shopkeeper/settings/location',
  CHANGE_PASSWORD: '/api/auth/change-password',
};

// ========================================
// INCOME APIs (4 APIs)
// ========================================
export const INCOME_ENDPOINTS = {
  OVERVIEW: '/api/shopkeeper/income/overview',
  DAILY: '/api/shopkeeper/income/daily',
  BY_PAYMENT_MODE: '/api/shopkeeper/income/by-payment-mode',
  TRANSACTIONS: '/api/shopkeeper/income/transactions',
};

// ========================================
// SETTLEMENT APIs (4 APIs)
// ========================================
export const SETTLEMENT_ENDPOINTS = {
  REQUEST: '/api/shopkeeper/settlement/request',
  LIST: '/api/shopkeeper/settlement/list',
  SUMMARY: '/api/shopkeeper/settlement/summary',
  CANCEL: (settlementId) => `/api/shopkeeper/settlement/${settlementId}/cancel`,
};

// ========================================
// WALLET APIs (2 APIs)
// ========================================
export const WALLET_ENDPOINTS = {
  DETAILS: '/api/shopkeeper/wallet',
  PAYOUT: '/api/shopkeeper/wallet/payout',
};

// ========================================
// ADVERTISEMENT APIs (5 APIs)
// ========================================
export const ADVERTISEMENT_ENDPOINTS = {
  CREATE: '/api/shopkeeper/advertisement/create',
  LIST: '/api/shopkeeper/advertisement/list',
  DETAILS: (id) => `/api/shopkeeper/advertisement/${id}`,
  UPDATE: (id) => `/api/shopkeeper/advertisement/${id}`,
  DELETE: (id) => `/api/shopkeeper/advertisement/${id}`,
};

// ========================================
// TOTAL: 52 SHOPKEEPER APIs
// ========================================

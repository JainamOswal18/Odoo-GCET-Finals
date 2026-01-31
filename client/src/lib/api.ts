// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
import { transformKeysToCamelCase } from './utils';

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    profile: '/auth/profile',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  users: {
    list: '/auth/users',
    activate: (id: string) => `/auth/users/${id}/activate`,
    deactivate: (id: string) => `/auth/users/${id}/deactivate`,
  },
  contacts: '/contacts',
  products: '/products',
  analyticalAccounts: '/analytical-accounts',
  budgets: '/budgets',
  purchaseOrders: '/purchase-orders',
  salesOrders: '/sales-orders',
  invoices: '/invoices',
  bills: '/bills',
  payments: '/payments',
  reports: '/reports',
  portal: '/portal',
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function for API requests with auth
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('shiv_auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(buildApiUrl(endpoint), {
    ...options,
    headers,
  });
};

// ============================================================================
// API SERVICE FUNCTIONS
// ============================================================================

// Generic API helper
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || error.message || 'API request failed');
  }
  const data = await response.json();
  // Transform snake_case keys to camelCase
  return transformKeysToCamelCase<T>(data);
};

// Helper to extract data array from paginated responses (with transformation)
const extractDataArray = <T>(response: any, key: string): T[] => {
  // Backend wraps arrays like: { contacts: [], pagination: {} }
  // Keys are already transformed to camelCase by handleApiResponse
  const camelKey = key; // Already in the correct case after transformation

  if (response[camelKey] && Array.isArray(response[camelKey])) {
    return response[camelKey];
  }
  // Fallback for non-paginated responses that might return direct arrays
  if (Array.isArray(response)) {
    return response;
  }
  return [];
};

// ============================================================================
// CONTACTS API
// ============================================================================
export const contactsApi = {
  getAll: async (): Promise<any[]> => {
    const response = await apiRequest(API_ENDPOINTS.contacts);
    const data = await handleApiResponse(response);
    return extractDataArray(data, 'contacts');
  },
  getById: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.contacts}/${id}`);
    return handleApiResponse(response);
  },
  create: async (data: any) => {
    const response = await apiRequest(API_ENDPOINTS.contacts, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  update: async (id: string, data: any) => {
    const response = await apiRequest(`${API_ENDPOINTS.contacts}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  delete: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.contacts}/${id}`, {
      method: 'DELETE',
    });
    return handleApiResponse(response);
  },
};

// ============================================================================
// PRODUCTS API
// ============================================================================
export const productsApi = {
  getAll: async (): Promise<any[]> => {
    const response = await apiRequest(API_ENDPOINTS.products);
    const data = await handleApiResponse(response);
    return extractDataArray(data, 'products');
  },
  getById: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.products}/${id}`);
    return handleApiResponse(response);
  },
  create: async (data: any) => {
    const response = await apiRequest(API_ENDPOINTS.products, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  update: async (id: string, data: any) => {
    const response = await apiRequest(`${API_ENDPOINTS.products}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  delete: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.products}/${id}`, {
      method: 'DELETE',
    });
    return handleApiResponse(response);
  },
};

// ============================================================================
// ANALYTICAL ACCOUNTS API
// ============================================================================
export const analyticalAccountsApi = {
  getAll: async (): Promise<any[]> => {
    const response = await apiRequest(API_ENDPOINTS.analyticalAccounts);
    const data = await handleApiResponse(response);
    return extractDataArray(data, 'accounts');
  },
  getById: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.analyticalAccounts}/${id}`);
    return handleApiResponse(response);
  },
  create: async (data: any) => {
    const response = await apiRequest(API_ENDPOINTS.analyticalAccounts, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  update: async (id: string, data: any) => {
    const response = await apiRequest(`${API_ENDPOINTS.analyticalAccounts}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  delete: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.analyticalAccounts}/${id}`, {
      method: 'DELETE',
    });
    return handleApiResponse(response);
  },
};

// ============================================================================
// BUDGETS API
// ============================================================================
export const budgetsApi = {
  getAll: async (): Promise<any[]> => {
    const response = await apiRequest(API_ENDPOINTS.budgets);
    const data = await handleApiResponse(response);
    return extractDataArray(data, 'budgets');
  },
  getById: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.budgets}/${id}`);
    return handleApiResponse(response);
  },
  create: async (data: any) => {
    const response = await apiRequest(API_ENDPOINTS.budgets, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  update: async (id: string, data: any) => {
    const response = await apiRequest(`${API_ENDPOINTS.budgets}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  delete: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.budgets}/${id}`, {
      method: 'DELETE',
    });
    return handleApiResponse(response);
  },
};

// ============================================================================
// AUTO ANALYTICAL MODELS API
// ============================================================================
export const autoAnalyticalModelsApi = {
  getAll: async (): Promise<any[]> => {
    const response = await apiRequest('/auto-analytical-models');
    const data = await handleApiResponse(response);
    return extractDataArray(data, 'models');
  },
  getById: async (id: string) => {
    const response = await apiRequest(`/auto-analytical-models/${id}`);
    return handleApiResponse(response);
  },
  create: async (data: any) => {
    const response = await apiRequest('/auto-analytical-models', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  update: async (id: string, data: any) => {
    const response = await apiRequest(`/auto-analytical-models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  delete: async (id: string) => {
    const response = await apiRequest(`/auto-analytical-models/${id}`, {
      method: 'DELETE',
    });
    return handleApiResponse(response);
  },
};

// ============================================================================
// PURCHASE ORDERS API
// ============================================================================
export const purchaseOrdersApi = {
  getAll: async () => {
    const response = await apiRequest(API_ENDPOINTS.purchaseOrders);
    const data = await handleApiResponse(response);
    return extractDataArray(data, 'orders');
  },
  getById: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.purchaseOrders}/${id}`);
    return handleApiResponse(response);
  },
  create: async (data: any) => {
    const response = await apiRequest(API_ENDPOINTS.purchaseOrders, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  update: async (id: string, data: any) => {
    const response = await apiRequest(`${API_ENDPOINTS.purchaseOrders}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  delete: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.purchaseOrders}/${id}`, {
      method: 'DELETE',
    });
    return handleApiResponse(response);
  },
  confirm: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.purchaseOrders}/${id}/confirm`, {
      method: 'POST',
    });
    return handleApiResponse(response);
  },
};

// ============================================================================
// VENDOR BILLS API
// ============================================================================
export const billsApi = {
  getAll: async () => {
    const response = await apiRequest(API_ENDPOINTS.bills);
    const data = await handleApiResponse(response);
    return extractDataArray(data, 'bills');
  },
  getById: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.bills}/${id}`);
    return handleApiResponse(response);
  },
  create: async (data: any) => {
    const response = await apiRequest(API_ENDPOINTS.bills, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  update: async (id: string, data: any) => {
    const response = await apiRequest(`${API_ENDPOINTS.bills}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  delete: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.bills}/${id}`, {
      method: 'DELETE',
    });
    return handleApiResponse(response);
  },
  confirm: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.bills}/${id}/confirm`, {
      method: 'POST',
    });
    return handleApiResponse(response);
  },
};

// ============================================================================
// SALES ORDERS API
// ============================================================================
export const salesOrdersApi = {
  getAll: async () => {
    const response = await apiRequest(API_ENDPOINTS.salesOrders);
    const data = await handleApiResponse(response);
    return extractDataArray(data, 'orders');
  },
  getById: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.salesOrders}/${id}`);
    return handleApiResponse(response);
  },
  create: async (data: any) => {
    const response = await apiRequest(API_ENDPOINTS.salesOrders, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  update: async (id: string, data: any) => {
    const response = await apiRequest(`${API_ENDPOINTS.salesOrders}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  delete: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.salesOrders}/${id}`, {
      method: 'DELETE',
    });
    return handleApiResponse(response);
  },
  confirm: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.salesOrders}/${id}/confirm`, {
      method: 'POST',
    });
    return handleApiResponse(response);
  },
};

// ============================================================================
// CUSTOMER INVOICES API
// ============================================================================
export const invoicesApi = {
  getAll: async () => {
    const response = await apiRequest(API_ENDPOINTS.invoices);
    const data = await handleApiResponse(response);
    return extractDataArray(data, 'invoices');
  },
  getById: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.invoices}/${id}`);
    return handleApiResponse(response);
  },
  create: async (data: any) => {
    const response = await apiRequest(API_ENDPOINTS.invoices, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  update: async (id: string, data: any) => {
    const response = await apiRequest(`${API_ENDPOINTS.invoices}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  delete: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.invoices}/${id}`, {
      method: 'DELETE',
    });
    return handleApiResponse(response);
  },
  confirm: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.invoices}/${id}/confirm`, {
      method: 'POST',
    });
    return handleApiResponse(response);
  },
};

// ============================================================================
// PAYMENTS API
// ============================================================================
export const paymentsApi = {
  getAll: async () => {
    const response = await apiRequest(API_ENDPOINTS.payments);
    const data = await handleApiResponse(response);
    return extractDataArray(data, 'payments');
  },
  getById: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.payments}/${id}`);
    return handleApiResponse(response);
  },
  create: async (data: any) => {
    const response = await apiRequest(API_ENDPOINTS.payments, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  update: async (id: string, data: any) => {
    const response = await apiRequest(`${API_ENDPOINTS.payments}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleApiResponse(response);
  },
  delete: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.payments}/${id}`, {
      method: 'DELETE',
    });
    return handleApiResponse(response);
  },
  confirm: async (id: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.payments}/${id}/confirm`, {
      method: 'POST',
    });
    return handleApiResponse(response);
  },
};

// ============================================================================
// REPORTS API
// ============================================================================
export const reportsApi = {
  getDashboardStats: async () => {
    const response = await apiRequest(`${API_ENDPOINTS.reports}/dashboard`);
    return handleApiResponse(response);
  },
  getBudgetAnalysis: async () => {
    const response = await apiRequest(`${API_ENDPOINTS.reports}/budget-analysis`);
    return handleApiResponse(response);
  },
};

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
  const token = localStorage.getItem('token');
  
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

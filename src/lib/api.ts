const API_BASE = '/api';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, name: string) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  me: () => apiFetch('/auth/me'),

  // Public
  funds: () => apiFetch('/funds'),
  cryptoAddresses: () => apiFetch('/platform/crypto-addresses'),
  bankDetails: () => apiFetch('/platform/bank-details'),

  // User
  portfolio: () => apiFetch('/user/portfolio'),
  deposit: (amount: number, method: string, paymentDetails?: string) =>
    apiFetch('/user/deposits', { method: 'POST', body: JSON.stringify({ amount, method, paymentDetails }) }),
  withdraw: (amount: number, method: string, destination: string) =>
    apiFetch('/user/withdrawals', { method: 'POST', body: JSON.stringify({ amount, method, destination }) }),
  invest: (fundId: number, amount: number) =>
    apiFetch('/user/investments', { method: 'POST', body: JSON.stringify({ fundId, amount }) }),
  divest: (holdingId: number, amount: number) =>
    apiFetch('/user/divestments', { method: 'POST', body: JSON.stringify({ holdingId, amount }) }),

  // Admin
  dashboard: () => apiFetch('/admin/dashboard'),
  adminUsers: (search?: string, limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (limit) params.set('limit', String(limit));
    if (offset) params.set('offset', String(offset));
    return apiFetch(`/admin/users?${params.toString()}`);
  },
  adminTransactions: (type?: string, status?: string, limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (status) params.set('status', status);
    if (limit) params.set('limit', String(limit));
    if (offset) params.set('offset', String(offset));
    return apiFetch(`/admin/transactions?${params.toString()}`);
  },
  approveTx: (id: number, adminNotes?: string) =>
    apiFetch(`/admin/transactions/${id}/approve`, { method: 'POST', body: JSON.stringify({ adminNotes }) }),
  rejectTx: (id: number, adminNotes?: string) =>
    apiFetch(`/admin/transactions/${id}/reject`, { method: 'POST', body: JSON.stringify({ adminNotes }) }),
  adminFunds: () => apiFetch('/admin/funds'),
  adminSettings: () => apiFetch('/admin/settings'),
  updateSettings: (settings: any) =>
    apiFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) }),
};

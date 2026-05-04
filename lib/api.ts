import axios, { AxiosError } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Token storage helpers ────────────────────────────────────────────────────
export const TokenStore = {
  getAccess:   () => (typeof window !== 'undefined' ? localStorage.getItem('go_access') : null),
  getRefresh:  () => (typeof window !== 'undefined' ? localStorage.getItem('go_refresh') : null),
  setTokens:   (access: string, refresh: string) => {
    localStorage.setItem('go_access', access);
    localStorage.setItem('go_refresh', refresh);
  },
  clear: () => {
    localStorage.removeItem('go_access');
    localStorage.removeItem('go_refresh');
  },
};

// ─── Request interceptor — attach token ──────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = TokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — refresh on 401 ───────────────────────────────────
let isRefreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !original?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original!.headers!.Authorization = `Bearer ${token}`;
          return api(original!);
        });
      }
      original!._retry = true;
      isRefreshing = true;
      const refresh = TokenStore.getRefresh();
      if (!refresh) {
        TokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refresh });
        TokenStore.setTokens(data.access_token, data.refresh_token);
        processQueue(null, data.access_token);
        original!.headers!.Authorization = `Bearer ${data.access_token}`;
        return api(original!);
      } catch (e) {
        processQueue(e);
        TokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth endpoints ──────────────────────────────────────────────────────────
export const authApi = {
  login: (phone: string, password: string) =>
    api.post('/auth/login', { phone, password }),
  logout: (refresh_token: string) =>
    api.post('/auth/logout', { refresh_token }),
  me: () => api.get('/auth/me'),
};

// ─── Admin endpoints ─────────────────────────────────────────────────────────
export const adminApi = {
  dashboard:    () => api.get('/admin/dashboard'),
  blockUser:    (id: string, block: boolean) => api.patch(`/admin/users/${id}/block?block=${block}`),
  updateConfig: (key: string, value: string, description?: string) =>
    api.patch(`/admin/config/${key}`, { value, description }),
  adjustCredits: (driver_id: string, credits_delta: number, note?: string) =>
    api.post('/payments/credits/adjust', { driver_id, credits_delta, note }),
};

// ─── User endpoints ──────────────────────────────────────────────────────────
export const usersApi = {
  list:   (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  getOne: (id: string)  => api.get(`/admin/users/${id}`),
  block:  (id: string, block: boolean) => api.patch(`/admin/users/${id}/block?block=${block}`),
};

// ─── Driver endpoints ─────────────────────────────────────────────────────────
export const driversApi = {
  list:      (params?: Record<string, unknown>) => api.get('/admin/drivers', { params }),
  getOne:    (id: string)  => api.get(`/admin/drivers/${id}`),
  block:     (id: string, block: boolean) => api.patch(`/admin/users/${id}/block?block=${block}`),
  pending:   (params?: Record<string, unknown>) => api.get('/moderation/drivers/pending', { params }),
  reviewDoc: (docId: string, status: 'approved' | 'rejected', rejection_reason?: string) =>
    api.patch(`/moderation/documents/${docId}/review`, { status, rejection_reason }),
};

// ─── Order endpoints ──────────────────────────────────────────────────────────
export const ordersApi = {
  list:      (params?: Record<string, unknown>) => api.get('/admin/orders', { params }),
  getOne:    (id: string)  => api.get(`/admin/orders/${id}`),
  cancel:    (id: string, reason: string) => api.post(`/orders/${id}/cancel`, { reason }),
};

// ─── Vehicle endpoints ────────────────────────────────────────────────────────
export const vehiclesApi = {
  list:   () => api.get('/vehicles/'),
  create: (data: { name: string; description?: string; price_per_km: number }) =>
    api.post('/vehicles/', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/vehicles/${id}`, data),
};

// ─── Ads endpoints ────────────────────────────────────────────────────────────
export const adsApi = {
  list:        () => api.get('/ads/active'),
  create:      (data: Record<string, unknown>) => api.post('/ads/', data),
  uploadImage: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/ads/${id}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── Referral endpoints ───────────────────────────────────────────────────────
export const referralsApi = {
  list: (params?: Record<string, unknown>) => api.get('/admin/referrals', { params }),
};

// ─── Config endpoints ─────────────────────────────────────────────────────────
export const configApi = {
  list:   () => api.get('/admin/configs'),
  update: (key: string, value: string, description?: string) =>
    api.patch(`/admin/config/${key}`, { value, description }),
};

export default api;

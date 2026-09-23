import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL });

export const tokenStore = {
  getAccess: () => localStorage.getItem('crm_access_token'),
  getRefresh: () => localStorage.getItem('crm_refresh_token'),
  set: (accessToken, refreshToken) => {
    localStorage.setItem('crm_access_token', accessToken);
    if (refreshToken) localStorage.setItem('crm_refresh_token', refreshToken);
  },
  clear: () => {
    localStorage.removeItem('crm_access_token');
    localStorage.removeItem('crm_refresh_token');
  },
};

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];

const flushQueue = (error, token) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status !== 401 || original._retry || original.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        })
        .catch((err) => Promise.reject(err));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = tokenStore.getRefresh();
      if (!refreshToken) throw error;

      const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefresh } = data.data;
      tokenStore.set(accessToken, newRefresh);

      flushQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      tokenStore.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

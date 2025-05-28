import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '@/store/user'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true,
  paramsSerializer: {
    indexes: null, // no brackets at all
  },
});

let isRefreshing = false;
let refreshQueue: ((token?: string) => void)[] = [];

const processQueue = (token?: string) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

const refreshToken = async () => {
  try {
    const res = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
    if (res.status === 200 && res.data?.code === 0) {
      console.log('axios res:', res.data, res)
      return res.data;
    } else {
      throw new Error("Failed to refresh token");
    }
  } catch (err) {
    throw err;
  }
};

instance.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res?.code !== 0) {
      // toast.warning(res.message || 'Client error');
      return Promise.reject(res);
    }
    return res.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    console.log('axios error:', error)

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const data = await refreshToken();
          console.log('axios refresh:', data)
          const setUser = useUserStore.getState().setUser;
          setUser(data.user);
          processQueue();
          return instance(originalRequest);
        } catch (err) {
          useUserStore.getState().clearUser();
          location.href = "/login";
          // toast.error("Session expired. Please log in again.");
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve) => {
        refreshQueue.push(() => resolve(instance(originalRequest)));
      });
    }

    console.log('axios error 2:', error)

    // @ts-ignore
    // toast.error(error.response?.data?.message || error.message || "Unknown error");
    return Promise.reject(error);
  }
);

export default instance;
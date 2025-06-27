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
let refreshQueue: (() => void)[] = [];

const processQueue = () => {
  refreshQueue.forEach((cb) => cb());
  refreshQueue = [];
};

const refreshToken = async () => {
  try {
    const res = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
    if (res.status === 201) {
      return;
    }
    throw new Error("Failed to refresh token");
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
          await refreshToken();
          // 处理队列中的请求并返回当前请求的新实例
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
        refreshQueue.push(() => {
          resolve(instance(originalRequest));
        });
      });
    }

    console.log('axios error 2:', error)

    // @ts-ignore
    // toast.error(error.response?.data?.message || error.message || "Unknown error");
    return Promise.reject(error);
  }
);

export default instance;
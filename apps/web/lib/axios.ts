import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth'

const { setUser, clearUser } = useAuth();

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 10000,
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;
let subscribers: (() => void)[] = [];

function onRefreshed() {
  subscribers.forEach(cb => cb());
  subscribers = [];
}

function addSubscriber(cb: () => void) {
  subscribers.push(cb);
}

function refreshTokenRequest() {
  return axios.post('/api/auth/refresh', {}, { withCredentials: true });
}

instance.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res?.code !== 0) {
      toast.warning(res.message || 'Client error');
      return Promise.reject(res);
    }
    return res.data;
  },
  async (err) => {
    const { response } = err;
    const message = response?.data?.message || 'Server error';

    if (response?.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshTokenRequest()
          .then((res) => {
            if (res.data?.code === 0) {
              // 👇 更新 user 状态
              setUser(res.data.user);
              onRefreshed();
              return;
            } else {
              throw new Error('Refresh token error');
            }
          })
          .catch(() => {
            clearUser();
            location.href = '/login';
            toast.warning('Token expired, please login again');
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      return new Promise((resolve, reject) => {
        addSubscriber(() => {
          resolve(instance(err.config));
        });
      });
    }

    toast.error(message);
    return Promise.reject(err);
  }
);

export default instance;
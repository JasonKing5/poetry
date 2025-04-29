import axios from "axios"
import { toast } from 'sonner';

const instance = axios.create({
  baseURL: "/api",
  timeout: 10000,
})

let isRefreshing = false
let refreshPromise: Promise<any> | null = null
let subscribers: ((token: string) => void)[] = []

function onRefreshed(token: string) {
  subscribers.forEach(cb => cb(token))
  subscribers = []
}

function addSubscriber(cb: (token: string) => void) {
  subscribers.push(cb)
}

function refreshTokenRequest() {
  const refreshToken = localStorage.getItem('refreshToken')
  return axios.post('/api/auth/refresh', { refreshToken })
}

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res?.code !== 0) {
      toast.warning(res.message || '操作失败');
      return Promise.reject(res);
    }
    return res.data;
  },
  async (err) => {
    console.error("API error:", err)
    if (err?.response?.data?.code === 401) {
      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = refreshTokenRequest()
          .then(res => {
            const data = res.data
            if (data?.code === 0 && data?.data?.token) {
              window.dispatchEvent(new CustomEvent('tokenUpdated', { detail: { token: data.data.token } }))
              onRefreshed(data.data.token)
              return data.data.token
            } else {
              throw new Error('刷新 token 失败')
            }
          })
          .catch(e => {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            location.href = '/login'
            toast.warning('登录状态已失效，请重新登录')
            return Promise.reject(e)
          })
          .finally(() => {
            isRefreshing = false
            refreshPromise = null
          })
      }
      return Promise.reject(err);
    }
    const message =
      err?.response?.data?.message || err?.message || '服务器错误';
    toast.error(message);
    return Promise.reject(err);
  }
)

export default instance
import axios from 'axios';

const http = axios.create({ baseURL: '/api' });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (username, password) => http.post('/auth/login', { username, password }),
};

export const speedTestApi = {
  run:     ()                         => http.post('/speedtest/run'),
  history: (params)                   => http.get('/speedtest/history', { params }),
  recent:  (count = 50)               => http.get('/speedtest/recent', { params: { count } }),
};

export const cronApi = {
  get:    ()               => http.get('/cron'),
  update: (schedule, enabled) => http.put('/cron', { schedule, enabled }),
};

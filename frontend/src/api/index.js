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
  async runStreaming(onEvent) {
    const token = localStorage.getItem('token');
    const res   = await fetch('/api/speedtest/run', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Speed test request failed');

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try { onEvent(JSON.parse(line.slice(6))); } catch {}
        }
      }
    }
  },
  history: (params)     => http.get('/speedtest/history', { params }),
  recent:  (count = 50) => http.get('/speedtest/recent', { params: { count } }),
};

export const cronApi = {
  get:    ()               => http.get('/cron'),
  update: (schedule, enabled) => http.put('/cron', { schedule, enabled }),
};

export const settingsApi = {
  get:    ()             => http.get('/settings'),
  update: (testDuration) => http.put('/settings', { testDuration }),
};

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authApi } from '../api/index.js';
import router from '../router/index.js';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'));

  async function login(username, password) {
    const { data } = await authApi.login(username, password);
    token.value = data.token;
    localStorage.setItem('token', data.token);
    router.push('/');
  }

  function logout() {
    token.value = null;
    localStorage.removeItem('token');
    router.push('/login');
  }

  return { token, login, logout };
});

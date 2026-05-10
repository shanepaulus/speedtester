<template>
  <div class="login-page">
    <div class="login-card card">
      <div class="login-logo">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        <h1>SpeedTester</h1>
      </div>

      <form @submit.prevent="submit">
        <div class="field">
          <label>Username</label>
          <input v-model="username" type="text" placeholder="Enter username" autocomplete="username" required />
        </div>
        <div class="field">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="Enter password" autocomplete="current-password" required />
        </div>

        <p v-if="error" class="login-error">{{ error }}</p>

        <button type="submit" class="btn-primary full-width" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.js';

const auth     = useAuthStore();
const username = ref('');
const password = ref('');
const loading  = ref(false);
const error    = ref('');

async function submit() {
  loading.value = true;
  error.value   = '';
  try {
    await auth.login(username.value, password.value);
  } catch (err) {
    error.value = err.response?.data?.error ?? 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.login-card {
  width: 100%;
  max-width: 380px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.login-logo {
  display: flex;
  align-items: center;
  gap: .75rem;
  justify-content: center;
}
.login-logo h1 {
  font-size: 1.4rem;
  font-weight: 700;
}
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: .35rem;
}
.field label {
  font-size: .8rem;
  font-weight: 600;
  color: var(--text-muted);
}
.field input { width: 100%; }
.full-width  { width: 100%; padding: .65rem 1rem; font-size: .95rem; }
.login-error {
  font-size: .8rem;
  color: var(--danger);
  text-align: center;
}
</style>

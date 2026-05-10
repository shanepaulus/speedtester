<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6">
    <div class="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 flex flex-col gap-6">

      <div class="flex items-center justify-center gap-3">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-50">SpeedTester</h1>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Username</label>
          <input
            v-model="username" type="text" placeholder="Enter username"
            autocomplete="username" required
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors w-full"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Password</label>
          <input
            v-model="password" type="password" placeholder="Enter password"
            autocomplete="current-password" required
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors w-full"
          />
        </div>

        <p v-if="error" class="text-xs text-red-500 text-center">{{ error }}</p>

        <button
          type="submit" :disabled="loading"
          class="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer border-0 mt-1"
        >{{ loading ? 'Signing in…' : 'Sign in' }}</button>
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

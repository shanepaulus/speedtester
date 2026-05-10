<template>
  <nav class="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">

      <RouterLink to="/" class="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50 no-underline shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        SpeedTester
      </RouterLink>

      <div class="flex gap-1 flex-1">
        <RouterLink to="/" class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors no-underline" active-class="!text-blue-600 dark:!text-blue-400 !bg-blue-50 dark:!bg-blue-950">Dashboard</RouterLink>
        <RouterLink to="/history" class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors no-underline" active-class="!text-blue-600 dark:!text-blue-400 !bg-blue-50 dark:!bg-blue-950">History</RouterLink>
        <RouterLink to="/settings" class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors no-underline" active-class="!text-blue-600 dark:!text-blue-400 !bg-blue-50 dark:!bg-blue-950">Settings</RouterLink>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-0 cursor-pointer"
          :title="dark ? 'Light mode' : 'Dark mode'"
          @click="toggle"
        >
          <svg v-if="dark" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>

        <button
          class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          @click="auth.logout()"
        >Sign out</button>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth.js';
import { useTheme } from '../composables/useTheme.js';

const auth = useAuthStore();
const { dark, toggle } = useTheme();
</script>

<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors">
    <AppNav v-if="isAuthenticated" />
    <RouterView />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import AppNav from './components/AppNav.vue';
import { useAuthStore } from './stores/auth.js';

const auth = useAuthStore();
const isAuthenticated = computed(() => !!auth.token);
</script>

<template>
  <AppNav v-if="isAuthenticated" />
  <RouterView />
</template>

<script setup>
import { computed } from 'vue';
import AppNav from './components/AppNav.vue';
import { useAuthStore } from './stores/auth.js';

const auth = useAuthStore();
const isAuthenticated = computed(() => !!auth.token);
</script>

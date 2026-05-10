<template>
  <nav class="nav">
    <div class="nav-inner">
      <RouterLink to="/" class="nav-brand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        SpeedTester
      </RouterLink>

      <div class="nav-links">
        <RouterLink to="/" class="nav-link">Dashboard</RouterLink>
        <RouterLink to="/history" class="nav-link">History</RouterLink>
      </div>

      <div class="nav-actions">
        <button class="btn-ghost icon-btn" :title="dark ? 'Light mode' : 'Dark mode'" @click="toggle">
          <svg v-if="dark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        <button class="btn-ghost" @click="auth.logout()">Sign out</button>
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

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(8px);
}
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 2rem;
}
.nav-brand {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text);
  text-decoration: none;
}
.nav-links {
  display: flex;
  gap: .25rem;
  flex: 1;
}
.nav-link {
  padding: .4rem .75rem;
  border-radius: 8px;
  color: var(--text-muted);
  font-size: .875rem;
  font-weight: 500;
  transition: background var(--transition), color var(--transition);
}
.nav-link:hover,
.nav-link.router-link-active {
  background: var(--accent-soft);
  color: var(--accent);
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: .5rem;
}
.icon-btn {
  padding: .4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

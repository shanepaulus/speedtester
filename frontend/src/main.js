import { createApp } from 'vue';
import { createPinia } from 'pinia';
import VueApexCharts from 'vue3-apexcharts';
import App from './App.vue';
import router from './router/index.js';
import './style.css';

createApp(App).use(createPinia()).use(router).use(VueApexCharts).mount('#app');

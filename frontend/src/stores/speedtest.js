import { defineStore } from 'pinia';
import { ref } from 'vue';
import { speedTestApi } from '../api/index.js';

export const useSpeedTestStore = defineStore('speedtest', () => {
  const running  = ref(false);
  const recent   = ref([]);
  const error    = ref(null);

  async function runTest() {
    running.value = true;
    error.value   = null;
    try {
      const { data } = await speedTestApi.run();
      recent.value.unshift(data);
    } catch (err) {
      error.value = err.response?.data?.detail ?? err.message;
    } finally {
      running.value = false;
    }
  }

  async function fetchRecent(count = 50) {
    const { data } = await speedTestApi.recent(count);
    recent.value = data;
  }

  return { running, recent, error, runTest, fetchRecent };
});

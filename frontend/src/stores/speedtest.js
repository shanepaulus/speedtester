import { defineStore } from 'pinia';
import { ref } from 'vue';
import { speedTestApi } from '../api/index.js';

export const useSpeedTestStore = defineStore('speedtest', () => {
  const running      = ref(false);
  const recent       = ref([]);
  const error        = ref(null);
  const phase        = ref(null);
  const liveSpeed    = ref(0);
  const livePing     = ref(null);
  const liveJitter   = ref(null);

  async function runTest() {
    running.value   = true;
    error.value     = null;
    liveSpeed.value = 0;
    livePing.value  = null;
    liveJitter.value = null;
    phase.value     = 'ping';

    try {
      await speedTestApi.runStreaming((event) => {
        phase.value = event.phase;

        if (event.phase === 'download' || event.phase === 'upload') {
          liveSpeed.value = event.value ?? 0;
        }
        if (event.phase === 'ping_done') {
          livePing.value   = event.ping;
          liveJitter.value = event.jitter;
        }
        if (event.phase === 'done' && event.result) {
          recent.value.unshift(event.result);
        }
        if (event.phase === 'error') {
          error.value = event.error;
        }
      });
    } catch (err) {
      error.value = err.message;
    } finally {
      running.value    = false;
      phase.value      = null;
      liveSpeed.value  = 0;
    }
  }

  async function fetchRecent(count = 50) {
    const { data } = await speedTestApi.recent(count);
    recent.value = data;
  }

  return { running, recent, error, phase, liveSpeed, livePing, liveJitter, runTest, fetchRecent };
});

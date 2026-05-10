<template>
  <div class="max-w-6xl mx-auto px-6 py-8">
    <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">Settings</h2>

    <div class="flex flex-col gap-4 max-w-xl">

      <!-- Test Duration -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Test Duration</span>
          <span class="text-xs text-slate-400 dark:text-slate-500">per phase (download &amp; upload)</span>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-4">
            <input
              v-model.number="duration" type="range" min="1" max="30"
              step="1"
              class="flex-1 accent-blue-500 cursor-pointer"
              @change="durationError = ''"
            />
            <div class="flex items-center gap-1.5 w-24 shrink-0">
              <input
                v-model.number="duration" type="number" min="1"
                max="60"
                class="w-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-center text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors"
                @input="durationError = ''"
              />
              <span class="text-sm text-slate-400">s</span>
            </div>
          </div>

          <div class="flex gap-2 flex-wrap">
            <button
              v-for="preset in durationPresets" :key="preset"
              class="px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer"
              :class="duration === preset
                ? 'bg-blue-50 dark:bg-blue-950 border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500'"
              @click="duration = preset; durationError = ''"
            >{{ preset }}s</button>
          </div>

          <p v-if="durationError" class="text-xs text-red-500">{{ durationError }}</p>

          <button
            :disabled="savingDuration"
            class="self-start px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors cursor-pointer border-0"
            @click="saveDuration"
          >{{ savingDuration ? 'Saving…' : 'Save' }}</button>
        </div>
      </div>

      <!-- Scheduled Tests -->
      <CronConfig />

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CronConfig from '../components/CronConfig.vue';
import { settingsApi } from '../api/index.js';

const duration        = ref(5);
const savingDuration  = ref(false);
const durationError   = ref('');
const durationPresets = [3, 5, 10, 15, 30];

async function load() {
  const { data } = await settingsApi.get();
  duration.value = data.test_duration_seconds;
}

async function saveDuration() {
  const val = duration.value;
  if (!Number.isInteger(val) || val < 1 || val > 60) {
    durationError.value = 'Must be between 1 and 60 seconds';
    return;
  }
  savingDuration.value = true;
  durationError.value  = '';
  try {
    const { data } = await settingsApi.update(val);
    duration.value = data.test_duration_seconds;
  } catch (err) {
    durationError.value = err.response?.data?.error ?? 'Failed to save';
  } finally {
    savingDuration.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <span class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Scheduled Tests</span>
      <label class="relative inline-flex items-center cursor-pointer">
        <input v-model="form.enabled" type="checkbox" class="sr-only peer" @change="save" />
        <div class="w-10 h-5 rounded-full bg-slate-200 dark:bg-slate-700 peer-checked:bg-blue-500 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"></div>
      </label>
    </div>

    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="p in presets" :key="p.value"
          class="px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer"
          :class="form.schedule === p.value
            ? 'bg-blue-50 dark:bg-blue-950 border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400'
            : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500'"
          @click="selectPreset(p.value)"
        >{{ p.label }}</button>
      </div>

      <div class="flex gap-2">
        <input
          v-model="form.schedule"
          placeholder="cron expression e.g. 0 * * * *"
          spellcheck="false"
          class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors"
          @input="scheduleError = ''"
        />
        <button
          :disabled="saving"
          class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors cursor-pointer border-0"
          @click="save"
        >{{ saving ? 'Saving…' : 'Apply' }}</button>
      </div>

      <p v-if="scheduleError" class="text-xs text-red-500">{{ scheduleError }}</p>

      <p v-if="config" class="text-xs text-slate-400 dark:text-slate-500">
        Status:
        <span
          class="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
          :class="config.enabled ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'"
        >{{ config.enabled ? 'Active' : 'Paused' }}</span>
        &nbsp;·&nbsp; <code class="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">{{ config.schedule }}</code>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { cronApi } from '../api/index.js';

const presets = [
  { label: 'Every hour',    value: '0 * * * *'   },
  { label: 'Every 6 hours', value: '0 */6 * * *'  },
  { label: 'Daily (noon)',  value: '0 12 * * *'   },
  { label: 'Every 30 min',  value: '*/30 * * * *' },
];

const config        = ref(null);
const form          = ref({ schedule: '0 * * * *', enabled: false });
const saving        = ref(false);
const scheduleError = ref('');

async function load() {
  const { data } = await cronApi.get();
  config.value = data;
  form.value   = { schedule: data.schedule, enabled: !!data.enabled };
}

function selectPreset(value) {
  form.value.schedule = value;
  scheduleError.value = '';
}

async function save() {
  saving.value = true;
  scheduleError.value = '';
  try {
    const { data } = await cronApi.update(form.value.schedule, form.value.enabled);
    config.value = data;
  } catch (err) {
    scheduleError.value = err.response?.data?.error ?? 'Failed to save';
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

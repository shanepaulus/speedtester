<template>
  <div class="card cron-card">
    <div class="cron-header">
      <span class="section-title">Scheduled Tests</span>
      <label class="toggle">
        <input type="checkbox" v-model="form.enabled" @change="save" />
        <span class="toggle-track"></span>
      </label>
    </div>

    <div class="cron-body">
      <div class="preset-list">
        <button
          v-for="p in presets"
          :key="p.value"
          class="preset-btn"
          :class="{ active: form.schedule === p.value }"
          @click="selectPreset(p.value)"
        >
          {{ p.label }}
        </button>
      </div>

      <div class="cron-input-row">
        <input
          v-model="form.schedule"
          placeholder="cron expression e.g. 0 * * * *"
          spellcheck="false"
          @input="scheduleError = ''"
        />
        <button class="btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Saving…' : 'Apply' }}
        </button>
      </div>

      <p v-if="scheduleError" class="cron-error">{{ scheduleError }}</p>

      <p v-if="config" class="cron-status">
        Status:
        <span :class="config.enabled ? 'badge badge-green' : 'badge badge-red'">
          {{ config.enabled ? 'Active' : 'Paused' }}
        </span>
        &nbsp;·&nbsp; Next run based on: <code>{{ config.schedule }}</code>
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

<style scoped>
.cron-card   { padding: 1.25rem 1.5rem; }
.cron-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.cron-body   { display: flex; flex-direction: column; gap: .75rem; }

.preset-list {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
}
.preset-btn {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: .3rem .75rem;
  font-size: .8rem;
  border-radius: 99px;
}
.preset-btn:hover  { border-color: var(--accent); color: var(--accent); }
.preset-btn.active { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }

.cron-input-row {
  display: flex;
  gap: .5rem;
}
.cron-input-row input { flex: 1; font-family: monospace; }

.cron-error  { font-size: .8rem; color: var(--danger); }
.cron-status { font-size: .8rem; color: var(--text-muted); }
.cron-status code { font-family: monospace; background: var(--surface-2); padding: .1rem .3rem; border-radius: 4px; }

.toggle { position: relative; display: inline-flex; align-items: center; cursor: pointer; }
.toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
.toggle-track {
  width: 40px;
  height: 22px;
  background: var(--border);
  border-radius: 99px;
  transition: background var(--transition);
  position: relative;
}
.toggle-track::after {
  content: '';
  position: absolute;
  top: 3px; left: 3px;
  width: 16px; height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform var(--transition);
}
.toggle input:checked ~ .toggle-track              { background: var(--accent); }
.toggle input:checked ~ .toggle-track::after       { transform: translateX(18px); }
</style>

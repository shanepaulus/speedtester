<template>
  <div class="max-w-6xl mx-auto px-6 py-8 bg-slate-100 dark:bg-slate-950 min-h-screen">

    <!-- Header -->
    <div class="flex items-start justify-between mb-6 gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Dashboard</h2>
        <p v-if="latest && !store.running" class="text-xs text-slate-400 mt-1">Last test: {{ formatDate(latest.timestamp) }}</p>
        <p v-if="store.running" class="text-xs text-blue-400 mt-1">{{ phaseLabel }}</p>
      </div>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer border-0 shrink-0"
        :disabled="store.running" @click="run"
      >
        <svg v-if="!store.running" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span v-if="store.running" class="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
        {{ store.running ? 'Running…' : 'Run test' }}
      </button>
    </div>

    <!-- Live gauge panel -->
    <Transition name="gauge">
      <div v-if="store.running" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6 shadow-sm">
        <div class="flex items-center justify-center gap-12 flex-wrap">
          <SpeedGauge
            :value="gauge.value"
            :max="gaugeMax"
            :color="gauge.color"
            :label="gauge.label"
            unit="Mbps"
          />
          <div class="flex flex-col gap-4">
            <div v-if="store.livePing != null" class="flex flex-col gap-0.5">
              <span class="text-xs font-semibold uppercase tracking-widest text-slate-400">Ping</span>
              <span class="text-2xl font-bold tabular-nums text-amber-400">{{ store.livePing.toFixed(1) }} <small class="text-xs text-slate-400 font-normal">ms</small></span>
            </div>
            <div v-if="store.liveJitter != null" class="flex flex-col gap-0.5">
              <span class="text-xs font-semibold uppercase tracking-widest text-slate-400">Jitter</span>
              <span class="text-2xl font-bold tabular-nums text-violet-400">{{ store.liveJitter.toFixed(1) }} <small class="text-xs text-slate-400 font-normal">ms</small></span>
            </div>
            <div class="flex flex-col gap-2 mt-1">
              <div v-for="step in steps" :key="step.key" class="flex items-center gap-2 text-xs">
                <span
                  class="w-2 h-2 rounded-full transition-all duration-300"
                  :class="{
                    'bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.25)]': stepActive(step.key),
                    'bg-emerald-500': stepDone(step.key),
                    'bg-slate-700': !stepActive(step.key) && !stepDone(step.key),
                  }"
                ></span>
                <span :class="{
                  'text-slate-50 font-semibold': stepActive(step.key),
                  'text-emerald-400': stepDone(step.key),
                  'text-slate-500': !stepActive(step.key) && !stepDone(step.key),
                }">{{ step.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Error -->
    <div v-if="store.error" class="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400 mb-6">
      {{ store.error }}
    </div>

    <!-- Metric cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard label="Download" :value="latest?.download" unit="Mbps" color="var(--download)" :sub="latest?.isp ?? ''" />
      <MetricCard label="Upload"   :value="latest?.upload"   unit="Mbps" color="var(--upload)"   />
      <MetricCard label="Ping"     :value="latest?.ping"     unit="ms"   color="var(--ping)"     :sub="latest?.server_location ?? ''" />
      <MetricCard label="Jitter"   :value="latest?.jitter"   unit="ms"   color="var(--jitter)"   />
    </div>

    <!-- Charts -->
    <div v-if="hasData" class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <SpeedChart title="Throughput" :labels="labels" :datasets="throughputDatasets" unit=" Mbps" />
      <SpeedChart title="Latency"    :labels="labels" :datasets="latencyDatasets"    unit=" ms"  />
    </div>

  </div>
</template>

<script setup>
import { computed, ref, reactive, watch, onMounted } from 'vue';
import MetricCard from '../components/MetricCard.vue';
import SpeedChart from '../components/SpeedChart.vue';
import SpeedGauge from '../components/SpeedGauge.vue';
import { useSpeedTestStore } from '../stores/speedtest.js';

const store = useSpeedTestStore();
const peakDownload = ref(0);

const latest  = computed(() => store.recent[0] ?? null);
const hasData = computed(() => store.recent.length > 1);
const sorted  = computed(() => [...store.recent].sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
const labels  = computed(() => sorted.value.map(r => formatLabel(r.timestamp)));

// Frozen gauge state — updates during the test, holds the last value while the
// panel fades out instead of snapping to 0 when phase/liveSpeed clear in finally.
const gauge = reactive({ value: 0, color: '#10b981', label: 'Download' });

watch([() => store.phase, () => store.liveSpeed], ([phase, speed]) => {
  if (!phase || phase === 'done' || phase === 'error') return;
  if (phase === 'upload') {
    gauge.color = '#3b82f6';
    gauge.label = 'Upload';
    gauge.value = speed;
  } else if (phase === 'download') {
    if (speed > peakDownload.value) peakDownload.value = speed;
    gauge.color = '#10b981';
    gauge.label = 'Download';
    gauge.value = speed;
  }
});

const gaugeMax = computed(() => {
  const base = Math.max(peakDownload.value, latest.value?.download ?? 0, 100);
  return Math.ceil(base / 100) * 100;
});

const PHASE_ORDER = ['ping', 'ping_done', 'download', 'upload', 'done'];
const phaseIndex  = computed(() => PHASE_ORDER.indexOf(store.phase ?? ''));

const steps = [
  { key: 'ping',     label: 'Ping' },
  { key: 'download', label: 'Download' },
  { key: 'upload',   label: 'Upload' },
];

function stepDone(step) {
  return phaseIndex.value > ({ ping: 1, download: 3, upload: 4 }[step]);
}
function stepActive(step) {
  const map = { ping: 0, download: 2, upload: 3 };
  return phaseIndex.value === map[step] || (step === 'ping' && phaseIndex.value === 1);
}

const phaseLabel = computed(() => ({
  ping:      'Measuring ping…',
  ping_done: 'Ping done, starting download…',
  download:  'Testing download speed…',
  upload:    'Testing upload speed…',
  done:      'Done!',
}[store.phase] ?? 'Starting…'));

const throughputDatasets = computed(() => [
  { label: 'Download', data: sorted.value.map(r => r.download), borderColor: '#10b981', fill: true, tension: .4 },
  { label: 'Upload',   data: sorted.value.map(r => r.upload),   borderColor: '#3b82f6', fill: true, tension: .4 },
]);
const latencyDatasets = computed(() => [
  { label: 'Ping',   data: sorted.value.map(r => r.ping),   borderColor: '#f59e0b', fill: true, tension: .4 },
  { label: 'Jitter', data: sorted.value.map(r => r.jitter), borderColor: '#8b5cf6', fill: true, tension: .4 },
]);

function formatLabel(ts) {
  return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatDate(ts) {
  return new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

async function run() {
  peakDownload.value = 0;
  gauge.value = 0; gauge.color = '#10b981'; gauge.label = 'Download';
  await store.runTest();
}

onMounted(() => store.fetchRecent(50));
</script>

<style scoped>
.gauge-enter-active, .gauge-leave-active { transition: opacity .3s, transform .3s; }
.gauge-enter-from, .gauge-leave-to       { opacity: 0; transform: translateY(-8px); }
</style>

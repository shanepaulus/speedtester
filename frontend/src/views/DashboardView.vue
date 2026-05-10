<template>
  <div class="page">

    <div class="dash-header">
      <div>
        <h2 class="dash-title">Dashboard</h2>
        <p v-if="latest" class="dash-sub">Last test: {{ formatDate(latest.timestamp) }}</p>
      </div>
      <button class="btn-primary run-btn" :disabled="store.running" @click="run">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        {{ store.running ? 'Running test…' : 'Run test' }}
      </button>
    </div>

    <div v-if="store.running" class="running-banner">
      <div class="spinner"></div>
      Measuring your connection speed — this takes ~30 seconds…
    </div>

    <div v-if="store.error" class="error-banner">
      {{ store.error }}
    </div>

    <div class="metrics-grid">
      <MetricCard label="Download" :value="latest?.download" unit="Mbps" color="var(--download)" :sub="latest?.isp ?? ''" />
      <MetricCard label="Upload"   :value="latest?.upload"   unit="Mbps" color="var(--upload)"   />
      <MetricCard label="Ping"     :value="latest?.ping"     unit="ms"   color="var(--ping)"     :sub="latest?.server_location ?? ''" />
      <MetricCard label="Jitter"   :value="latest?.jitter"   unit="ms"   color="var(--jitter)"   />
    </div>

    <div v-if="hasData" class="charts-grid">
      <SpeedChart
        title="Throughput"
        :labels="labels"
        :datasets="throughputDatasets"
        unit=" Mbps"
      />
      <SpeedChart
        title="Latency"
        :labels="labels"
        :datasets="latencyDatasets"
        unit=" ms"
      />
    </div>

    <CronConfig />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import MetricCard from '../components/MetricCard.vue';
import SpeedChart from '../components/SpeedChart.vue';
import CronConfig from '../components/CronConfig.vue';
import { useSpeedTestStore } from '../stores/speedtest.js';

const store = useSpeedTestStore();

const latest  = computed(() => store.recent[0] ?? null);
const hasData = computed(() => store.recent.length > 1);

const sorted  = computed(() => [...store.recent].sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
const labels  = computed(() => sorted.value.map(r => formatLabel(r.timestamp)));

const throughputDatasets = computed(() => [
  {
    label: 'Download',
    data: sorted.value.map(r => r.download),
    borderColor: 'var(--download)',
    backgroundColor: 'rgba(16,185,129,.1)',
    fill: true,
    tension: .4,
    pointRadius: 3,
  },
  {
    label: 'Upload',
    data: sorted.value.map(r => r.upload),
    borderColor: 'var(--upload)',
    backgroundColor: 'rgba(59,130,246,.1)',
    fill: true,
    tension: .4,
    pointRadius: 3,
  },
]);

const latencyDatasets = computed(() => [
  {
    label: 'Ping',
    data: sorted.value.map(r => r.ping),
    borderColor: 'var(--ping)',
    backgroundColor: 'rgba(245,158,11,.1)',
    fill: true,
    tension: .4,
    pointRadius: 3,
  },
  {
    label: 'Jitter',
    data: sorted.value.map(r => r.jitter),
    borderColor: 'var(--jitter)',
    backgroundColor: 'rgba(139,92,246,.1)',
    fill: true,
    tension: .4,
    pointRadius: 3,
  },
]);

function formatLabel(ts) {
  return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts) {
  return new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

async function run() {
  await store.runTest();
}

onMounted(() => store.fetchRecent(50));
</script>

<style scoped>
.dash-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}
.dash-title { font-size: 1.5rem; font-weight: 700; }
.dash-sub   { font-size: .82rem; color: var(--text-muted); margin-top: .25rem; }
.run-btn    { display: flex; align-items: center; gap: .4rem; padding: .55rem 1.25rem; white-space: nowrap; }

.running-banner {
  display: flex;
  align-items: center;
  gap: .75rem;
  background: var(--accent-soft);
  border: 1px solid var(--accent);
  border-radius: var(--radius);
  padding: .85rem 1.25rem;
  color: var(--accent);
  font-size: .875rem;
  margin-bottom: 1.5rem;
}
.error-banner {
  background: #fee2e2;
  border: 1px solid var(--danger);
  border-radius: var(--radius);
  padding: .85rem 1.25rem;
  color: var(--danger);
  font-size: .875rem;
  margin-bottom: 1.5rem;
}
:root.dark .error-banner { background: #450a0a; }

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
@media (max-width: 768px) {
  .charts-grid { grid-template-columns: 1fr; }
}

.spinner {
  width: 16px; height: 16px;
  border: 2px solid var(--accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin .6s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>

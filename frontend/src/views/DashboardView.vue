<template>
  <div class="page">

    <div class="dash-header">
      <div>
        <h2 class="dash-title">Dashboard</h2>
        <p v-if="latest && !store.running" class="dash-sub">Last test: {{ formatDate(latest.timestamp) }}</p>
        <p v-if="store.running" class="dash-sub running-sub">{{ phaseLabel }}</p>
      </div>
      <button class="btn-primary run-btn" :disabled="store.running" @click="run">
        <svg v-if="!store.running" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        <span v-if="store.running" class="btn-spinner"></span>
        {{ store.running ? 'Running…' : 'Run test' }}
      </button>
    </div>

    <!-- Live gauge panel -->
    <Transition name="gauge">
      <div v-if="store.running" class="gauge-panel card">
        <div class="gauges-row">
          <SpeedGauge
            :value="store.phase === 'upload' ? store.liveSpeed : downloadForGauge"
            :max="gaugeMax"
            :color="store.phase === 'upload' ? 'var(--upload)' : 'var(--download)'"
            :label="store.phase === 'upload' ? 'Upload' : 'Download'"
            unit="Mbps"
          />
          <div class="live-meta">
            <div class="live-stat" v-if="store.livePing != null">
              <span class="live-label">Ping</span>
              <span class="live-val" style="color:var(--ping)">{{ store.livePing.toFixed(1) }} <small>ms</small></span>
            </div>
            <div class="live-stat" v-if="store.liveJitter != null">
              <span class="live-label">Jitter</span>
              <span class="live-val" style="color:var(--jitter)">{{ store.liveJitter.toFixed(1) }} <small>ms</small></span>
            </div>
            <div class="live-steps">
              <div class="step" :class="{ done: stepDone('ping'), active: stepActive('ping') }">
                <span class="step-dot"></span> Ping
              </div>
              <div class="step" :class="{ done: stepDone('download'), active: stepActive('download') }">
                <span class="step-dot"></span> Download
              </div>
              <div class="step" :class="{ done: stepDone('upload'), active: stepActive('upload') }">
                <span class="step-dot"></span> Upload
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="store.error" class="error-banner">{{ store.error }}</div>

    <div class="metrics-grid">
      <MetricCard label="Download" :value="latest?.download" unit="Mbps" color="var(--download)" :sub="latest?.isp ?? ''" />
      <MetricCard label="Upload"   :value="latest?.upload"   unit="Mbps" color="var(--upload)"   />
      <MetricCard label="Ping"     :value="latest?.ping"     unit="ms"   color="var(--ping)"     :sub="latest?.server_location ?? ''" />
      <MetricCard label="Jitter"   :value="latest?.jitter"   unit="ms"   color="var(--jitter)"   />
    </div>

    <div v-if="hasData" class="charts-grid">
      <SpeedChart title="Throughput" :labels="labels" :datasets="throughputDatasets" unit=" Mbps" />
      <SpeedChart title="Latency"    :labels="labels" :datasets="latencyDatasets"    unit=" ms"  />
    </div>

    <CronConfig />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import MetricCard from '../components/MetricCard.vue';
import SpeedChart from '../components/SpeedChart.vue';
import SpeedGauge from '../components/SpeedGauge.vue';
import CronConfig from '../components/CronConfig.vue';
import { useSpeedTestStore } from '../stores/speedtest.js';

const store = useSpeedTestStore();

const peakDownload = ref(0);

const latest  = computed(() => store.recent[0] ?? null);
const hasData = computed(() => store.recent.length > 1);

const sorted  = computed(() => [...store.recent].sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
const labels  = computed(() => sorted.value.map(r => formatLabel(r.timestamp)));

const downloadForGauge = computed(() => {
  if (store.phase === 'download') {
    if (store.liveSpeed > peakDownload.value) peakDownload.value = store.liveSpeed;
    return store.liveSpeed;
  }
  return 0;
});

const gaugeMax = computed(() => {
  const base = Math.max(peakDownload.value, latest.value?.download ?? 0, 100);
  return Math.ceil(base / 100) * 100;
});

const PHASE_ORDER = ['ping', 'ping_done', 'download', 'upload', 'done'];
const phaseIndex  = computed(() => PHASE_ORDER.indexOf(store.phase ?? ''));

function stepDone(step) {
  const map = { ping: 1, download: 3, upload: 4 };
  return phaseIndex.value > map[step];
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
  { label: 'Download', data: sorted.value.map(r => r.download), borderColor: 'var(--download)', backgroundColor: 'rgba(16,185,129,.1)', fill: true, tension: .4, pointRadius: 3 },
  { label: 'Upload',   data: sorted.value.map(r => r.upload),   borderColor: 'var(--upload)',   backgroundColor: 'rgba(59,130,246,.1)', fill: true, tension: .4, pointRadius: 3 },
]);
const latencyDatasets = computed(() => [
  { label: 'Ping',   data: sorted.value.map(r => r.ping),   borderColor: 'var(--ping)',   backgroundColor: 'rgba(245,158,11,.1)',  fill: true, tension: .4, pointRadius: 3 },
  { label: 'Jitter', data: sorted.value.map(r => r.jitter), borderColor: 'var(--jitter)', backgroundColor: 'rgba(139,92,246,.1)', fill: true, tension: .4, pointRadius: 3 },
]);

function formatLabel(ts) {
  return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatDate(ts) {
  return new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

async function run() {
  peakDownload.value = 0;
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
.dash-title  { font-size: 1.5rem; font-weight: 700; }
.dash-sub    { font-size: .82rem; color: var(--text-muted); margin-top: .25rem; }
.running-sub { color: var(--accent); }
.run-btn     { display: flex; align-items: center; gap: .4rem; padding: .55rem 1.25rem; white-space: nowrap; }

/* Gauge panel */
.gauge-panel {
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  background: var(--surface);
}
.gauges-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}
.live-meta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.live-stat  { display: flex; flex-direction: column; gap: .15rem; }
.live-label { font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--text-muted); }
.live-val   { font-size: 1.4rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.live-val small { font-size: .7rem; color: var(--text-muted); font-weight: 400; }

.live-steps { display: flex; flex-direction: column; gap: .5rem; }
.step {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .82rem;
  color: var(--text-muted);
}
.step-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--border);
  transition: background .3s;
}
.step.active .step-dot { background: var(--accent); box-shadow: 0 0 0 3px rgba(96,165,250,.25); }
.step.done   .step-dot { background: var(--download); }
.step.active { color: var(--text); font-weight: 600; }
.step.done   { color: var(--download); }

/* Gauge enter/leave */
.gauge-enter-active, .gauge-leave-active { transition: opacity .3s, transform .3s; }
.gauge-enter-from, .gauge-leave-to       { opacity: 0; transform: translateY(-8px); }

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
@media (max-width: 768px) { .charts-grid { grid-template-columns: 1fr; } }

.btn-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>

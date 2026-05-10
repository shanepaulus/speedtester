<template>
  <div class="page">
    <div class="history-header">
      <h2 class="dash-title">History</h2>
      <span class="badge badge-green" v-if="total > 0">{{ total }} results</span>
    </div>

    <div class="card table-card">
      <div v-if="loading" class="table-loading">Loading…</div>

      <div v-else-if="rows.length === 0" class="table-empty">
        No results yet. Run your first speed test from the dashboard.
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date / Time</th>
              <th class="num">Download</th>
              <th class="num">Upload</th>
              <th class="num">Ping</th>
              <th class="num">Jitter</th>
              <th class="num">Loss</th>
              <th>Server</th>
              <th>ISP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td class="mono">{{ formatDate(row.timestamp) }}</td>
              <td class="num" style="color:var(--download)">{{ row.download }} <small>Mbps</small></td>
              <td class="num" style="color:var(--upload)">{{ row.upload }} <small>Mbps</small></td>
              <td class="num" style="color:var(--ping)">{{ row.ping.toFixed(1) }} <small>ms</small></td>
              <td class="num" style="color:var(--jitter)">{{ row.jitter.toFixed(1) }} <small>ms</small></td>
              <td class="num">{{ row.packet_loss }}%</td>
              <td>{{ row.server_name ?? '—' }}<br><small>{{ row.server_location ?? '' }}</small></td>
              <td>{{ row.isp ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="total > pageSize" class="pagination">
        <button class="btn-ghost" :disabled="offset === 0" @click="prev">← Prev</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button class="btn-ghost" :disabled="offset + pageSize >= total" @click="next">Next →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { speedTestApi } from '../api/index.js';

const rows     = ref([]);
const total    = ref(0);
const loading  = ref(false);
const offset   = ref(0);
const pageSize = 25;

const page       = computed(() => Math.floor(offset.value / pageSize) + 1);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

async function load() {
  loading.value = true;
  try {
    const { data } = await speedTestApi.history({ limit: pageSize, offset: offset.value });
    rows.value  = data.rows;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

function prev() { offset.value = Math.max(0, offset.value - pageSize); load(); }
function next() { offset.value += pageSize; load(); }

function formatDate(ts) {
  return new Date(ts).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' });
}

onMounted(load);
</script>

<style scoped>
.history-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.dash-title { font-size: 1.5rem; font-weight: 700; }

.table-card { overflow: hidden; }
.table-wrap { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: .85rem;
}
thead th {
  text-align: left;
  padding: .75rem 1rem;
  font-size: .72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
thead th.num { text-align: right; }
tbody tr { border-bottom: 1px solid var(--border); transition: background var(--transition); }
tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: var(--surface-2); }
tbody td { padding: .75rem 1rem; vertical-align: middle; }
tbody td.num   { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
tbody td.mono  { font-family: monospace; font-size: .8rem; white-space: nowrap; }
tbody td small { font-size: .7rem; font-weight: 400; color: var(--text-muted); }

.table-loading,
.table-empty {
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--text-muted);
  font-size: .9rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: .75rem 1rem;
  border-top: 1px solid var(--border);
  font-size: .85rem;
  color: var(--text-muted);
}
</style>

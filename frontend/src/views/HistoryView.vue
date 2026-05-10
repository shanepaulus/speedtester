<template>
  <div class="max-w-6xl mx-auto px-6 py-8">

    <div class="flex items-center gap-3 mb-6">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">History</h2>
      <span v-if="total > 0" class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">{{ total }} results</span>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">

      <div v-if="loading" class="py-16 text-center text-sm text-slate-400">Loading…</div>

      <div v-else-if="rows.length === 0" class="py-16 text-center text-sm text-slate-400">
        No results yet. Run your first speed test from the dashboard.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800">
              <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">Date / Time</th>
              <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Download</th>
              <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Upload</th>
              <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Ping</th>
              <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Jitter</th>
              <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Loss</th>
              <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Server</th>
              <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">ISP</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows" :key="row.id"
              class="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td class="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ formatDate(row.timestamp) }}</td>
              <td class="px-4 py-3 text-right font-semibold tabular-nums text-emerald-500">{{ row.download }} <span class="text-xs font-normal text-slate-400">Mbps</span></td>
              <td class="px-4 py-3 text-right font-semibold tabular-nums text-blue-500">{{ row.upload }} <span class="text-xs font-normal text-slate-400">Mbps</span></td>
              <td class="px-4 py-3 text-right font-semibold tabular-nums text-amber-500">{{ row.ping.toFixed(1) }} <span class="text-xs font-normal text-slate-400">ms</span></td>
              <td class="px-4 py-3 text-right font-semibold tabular-nums text-violet-500">{{ row.jitter.toFixed(1) }} <span class="text-xs font-normal text-slate-400">ms</span></td>
              <td class="px-4 py-3 text-right tabular-nums text-slate-500 dark:text-slate-400">{{ row.packet_loss }}%</td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">
                {{ row.server_name ?? '—' }}
                <div class="text-xs text-slate-400">{{ row.server_location ?? '' }}</div>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ row.isp ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="total > pageSize" class="flex items-center justify-center gap-4 px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-400">
        <button
          class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-transparent text-slate-500 dark:text-slate-400 text-sm"
          :disabled="offset === 0" @click="prev"
        >← Prev</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button
          class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-transparent text-slate-500 dark:text-slate-400 text-sm"
          :disabled="offset + pageSize >= total" @click="next"
        >Next →</button>
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

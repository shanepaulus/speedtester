<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <span class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{{ title }}</span>
      <div class="flex items-center gap-4">
        <span v-for="ds in series" :key="ds.name" class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span class="w-2.5 h-2.5 rounded-full" :style="{ background: colorFor(ds.name) }"></span>
          {{ ds.name }}
        </span>
      </div>
    </div>
    <apexchart type="area" :height="220" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTheme } from '../composables/useTheme.js';

const props = defineProps({
  title:    { type: String, required: true },
  labels:   { type: Array,  required: true },
  datasets: { type: Array,  required: true },
  unit:     { type: String, default: '' },
});

const { dark } = useTheme();

const COLORS = {
  Download: '#10b981',
  Upload:   '#3b82f6',
  Ping:     '#f59e0b',
  Jitter:   '#8b5cf6',
};

function colorFor(name) {
  return COLORS[name] ?? '#64748b';
}

const series = computed(() =>
  props.datasets.map(ds => ({ name: ds.label, data: ds.data }))
);

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    background: 'transparent',
    toolbar: { show: false },
    animations: { enabled: true, speed: 400, animateGradually: { enabled: false } },
    sparkline: { enabled: false },
  },
  theme: { mode: dark.value ? 'dark' : 'light' },
  colors: props.datasets.map(ds => ds.borderColor?.replace('var(--download)', '#10b981')
    .replace('var(--upload)', '#3b82f6')
    .replace('var(--ping)', '#f59e0b')
    .replace('var(--jitter)', '#8b5cf6') ?? '#64748b'),
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 0,
      opacityFrom: 0.35,
      opacityTo: 0.0,
      stops: [0, 100],
    },
  },
  dataLabels: { enabled: false },
  markers: { size: 0, hover: { size: 5 } },
  grid: {
    borderColor: dark.value ? '#1e293b' : '#f1f5f9',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { left: 0, right: 0 },
  },
  xaxis: {
    categories: props.labels,
    labels: {
      style: { colors: dark.value ? '#475569' : '#94a3b8', fontSize: '11px' },
      maxHeight: 32,
      rotate: 0,
      hideOverlappingLabels: true,
      show: true,
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  },
  yaxis: {
    labels: {
      style: { colors: dark.value ? '#475569' : '#94a3b8', fontSize: '11px' },
      formatter: v => v.toFixed(0) + props.unit,
    },
  },
  tooltip: {
    theme: dark.value ? 'dark' : 'light',
    x: { show: true },
    y: { formatter: v => v.toFixed(2) + props.unit },
    style: { fontSize: '12px' },
  },
  legend: { show: false },
}));
</script>

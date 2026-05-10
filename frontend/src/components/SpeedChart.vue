<template>
  <div class="card chart-card">
    <div class="chart-header">
      <span class="section-title">{{ title }}</span>
      <div class="chart-legend">
        <span v-for="ds in datasets" :key="ds.label" class="legend-item">
          <span class="legend-dot" :style="{ background: ds.borderColor }"></span>
          {{ ds.label }}
        </span>
      </div>
    </div>
    <div class="chart-wrap">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Filler,
} from 'chart.js';
import { useTheme } from '../composables/useTheme.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const props = defineProps({
  title:    { type: String, required: true },
  labels:   { type: Array,  required: true },
  datasets: { type: Array,  required: true },
  unit:     { type: String, default: '' },
});

const { dark } = useTheme();

const chartData = computed(() => ({ labels: props.labels, datasets: props.datasets }));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 300 },
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: dark.value ? '#1e293b' : '#fff',
      borderColor:     dark.value ? '#334155' : '#e2e8f0',
      borderWidth: 1,
      titleColor:  dark.value ? '#f1f5f9' : '#1e293b',
      bodyColor:   dark.value ? '#94a3b8' : '#64748b',
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}${props.unit}`,
      },
    },
  },
  scales: {
    x: {
      grid:   { color: dark.value ? '#334155' : '#f1f5f9' },
      ticks:  { color: dark.value ? '#94a3b8' : '#64748b', maxTicksLimit: 8, font: { size: 11 } },
    },
    y: {
      grid:    { color: dark.value ? '#334155' : '#f1f5f9' },
      ticks:   { color: dark.value ? '#94a3b8' : '#64748b', font: { size: 11 } },
      beginAtZero: true,
    },
  },
}));
</script>

<style scoped>
.chart-card  { padding: 1.25rem 1.5rem; }
.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.chart-legend {
  display: flex;
  gap: 1rem;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: .35rem;
  font-size: .78rem;
  color: var(--text-muted);
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.chart-wrap { height: 220px; }
</style>

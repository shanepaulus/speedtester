<template>
  <div class="card metric-card">
    <div class="metric-label">{{ label }}</div>
    <div class="metric-value" :style="{ color }">
      {{ formatted }}
      <span class="metric-unit">{{ unit }}</span>
    </div>
    <div v-if="sub" class="metric-sub">{{ sub }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label:  { type: String, required: true },
  value:  { type: Number, default: null },
  unit:   { type: String, default: '' },
  color:  { type: String, default: 'var(--text)' },
  sub:    { type: String, default: null },
});

const formatted = computed(() =>
  props.value == null ? '—' : props.value.toFixed(props.unit === 'ms' ? 1 : 2)
);
</script>

<style scoped>
.metric-card {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: .25rem;
}
.metric-label {
  font-size: .75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--text-muted);
}
.metric-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.metric-unit {
  font-size: .9rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-left: .2rem;
}
.metric-sub {
  font-size: .75rem;
  color: var(--text-muted);
  margin-top: .25rem;
}
</style>

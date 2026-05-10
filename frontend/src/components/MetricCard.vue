<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col gap-1">
    <div class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{{ label }}</div>
    <div class="text-3xl font-bold tabular-nums leading-tight" :style="{ color }">
      {{ formatted }}<span class="text-sm font-medium text-slate-400 dark:text-slate-500 ml-1">{{ unit }}</span>
    </div>
    <div v-if="sub" class="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{{ sub }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  value: { type: Number, default: null },
  unit:  { type: String, default: '' },
  color: { type: String, default: 'inherit' },
  sub:   { type: String, default: null },
});

const formatted = computed(() =>
  props.value == null ? '—' : props.value.toFixed(props.unit === 'ms' ? 1 : 2)
);
</script>

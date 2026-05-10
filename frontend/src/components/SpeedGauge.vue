<template>
  <div class="flex flex-col items-center gap-1">
    <svg viewBox="0 0 200 130" class="w-full max-w-[260px] drop-shadow-lg" aria-hidden="true">
      <g v-for="(mark, i) in ticks" :key="i">
        <line :x1="mark.x1" :y1="mark.y1" :x2="mark.x2" :y2="mark.y2" stroke="#334155" stroke-width="1.5" stroke-linecap="round"/>
        <text v-if="mark.label != null" :x="mark.lx" :y="mark.ly" text-anchor="middle" dominant-baseline="middle" font-size="7" fill="#64748b">{{ mark.label }}</text>
      </g>

      <path d="M 18 115 A 82 82 0 1 0 182 115" fill="none" stroke="#1e293b" stroke-width="10" stroke-linecap="round"/>
      <path d="M 18 115 A 82 82 0 1 0 182 115" fill="none" :stroke="color" stroke-width="10" stroke-linecap="round"
            :stroke-dasharray="ARC_LEN" :stroke-dashoffset="dashOffset"/>

      <line x1="100" y1="115" :x2="needleX" :y2="needleY" stroke="rgba(0,0,0,.2)" stroke-width="4" stroke-linecap="round" transform="translate(1,2)"/>
      <line x1="100" y1="115" :x2="needleX" :y2="needleY" :stroke="color" stroke-width="2.5" stroke-linecap="round"/>

      <circle cx="100" cy="115" r="6" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
      <circle cx="100" cy="115" r="3" :fill="color"/>
    </svg>

    <div class="flex items-baseline gap-1">
      <span class="text-4xl font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-slate-50">{{ displayValue }}</span>
      <span class="text-sm text-slate-400 font-medium">{{ unit }}</span>
    </div>
    <div class="text-xs uppercase tracking-widest font-semibold text-slate-500">{{ label }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';

const ARC_LEN = Math.PI * 82;

const props = defineProps({
  value: { type: Number, default: 0 },
  max:   { type: Number, default: 200 },
  unit:  { type: String, default: 'Mbps' },
  label: { type: String, default: '' },
  color: { type: String, default: '#10b981' },
});

const smooth = ref(props.value);
let target = props.value, raf = null, lastTs = null;

function tick(ts) {
  const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0;
  lastTs = ts;
  const diff = target - smooth.value;
  smooth.value += diff * (1 - Math.exp(-8 * dt));
  if (Math.abs(diff) > 0.05) raf = requestAnimationFrame(tick);
  else { smooth.value = target; raf = null; }
}

function startAnim() {
  if (raf) return;
  lastTs = null;
  raf = requestAnimationFrame(tick);
}

watch(() => props.value, v => { target = v; startAnim(); });
onUnmounted(() => { if (raf) cancelAnimationFrame(raf); });

const clamped     = computed(() => Math.min(Math.max(smooth.value, 0), props.max));
const dashOffset  = computed(() => ARC_LEN * (1 - clamped.value / props.max));
const angle       = computed(() => Math.PI - (clamped.value / props.max) * Math.PI);
const needleX     = computed(() => 100 + 72 * Math.cos(angle.value));
const needleY     = computed(() => 115 - 72 * Math.sin(angle.value));
const displayValue = computed(() => smooth.value.toFixed(1));

const ticks = computed(() => {
  const result = [], CX = 100, CY = 115, R = 82;
  for (let i = 0; i <= 5; i++) {
    const theta = Math.PI - (i / 5) * Math.PI;
    result.push({
      x1: CX + (R - 6) * Math.cos(theta), y1: CY - (R - 6) * Math.sin(theta),
      x2: CX + (R + 1) * Math.cos(theta), y2: CY - (R + 1) * Math.sin(theta),
      lx: CX + (R - 16) * Math.cos(theta), ly: CY - (R - 16) * Math.sin(theta),
      label: Math.round(props.max * (i / 5)),
    });
  }
  return result;
});
</script>

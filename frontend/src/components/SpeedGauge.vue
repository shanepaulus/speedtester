<template>
  <div class="gauge-wrap">
    <svg viewBox="0 0 200 130" class="gauge-svg" aria-hidden="true">
      <!-- Tick marks -->
      <g v-for="(tick, i) in ticks" :key="i">
        <line
          :x1="tick.x1" :y1="tick.y1"
          :x2="tick.x2" :y2="tick.y2"
          stroke="var(--border)" stroke-width="1.5" stroke-linecap="round"
        />
        <text
          v-if="tick.label != null"
          :x="tick.lx" :y="tick.ly"
          text-anchor="middle" dominant-baseline="middle"
          font-size="7" fill="var(--text-muted)"
        >{{ tick.label }}</text>
      </g>

      <!-- Background arc -->
      <path
        d="M 18 115 A 82 82 0 1 0 182 115"
        fill="none" stroke="var(--border)" stroke-width="10" stroke-linecap="round"
      />

      <!-- Colored fill arc -->
      <path
        d="M 18 115 A 82 82 0 1 0 182 115"
        fill="none" :stroke="color" stroke-width="10" stroke-linecap="round"
        :stroke-dasharray="ARC_LEN"
        :stroke-dashoffset="dashOffset"
      />

      <!-- Needle shadow -->
      <line
        x1="100" y1="115" :x2="needleX" :y2="needleY"
        stroke="rgba(0,0,0,.15)" stroke-width="4" stroke-linecap="round"
        transform="translate(1,2)"
      />

      <!-- Needle -->
      <line
        x1="100" y1="115" :x2="needleX" :y2="needleY"
        :stroke="color" stroke-width="2.5" stroke-linecap="round"
      />

      <!-- Center cap -->
      <circle cx="100" cy="115" r="6" fill="var(--surface)" stroke="var(--border)" stroke-width="1.5"/>
      <circle cx="100" cy="115" r="3" :fill="color"/>
    </svg>

    <div class="gauge-reading">
      <span class="gauge-num">{{ displayValue }}</span>
      <span class="gauge-unit">{{ unit }}</span>
    </div>
    <div class="gauge-label">{{ label }}</div>
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
  color: { type: String, default: 'var(--download)' },
});

const smooth = ref(props.value);
let   target = props.value;
let   raf    = null;
let   lastTs = null;

function tick(ts) {
  const dt      = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0;
  lastTs        = ts;
  const diff    = target - smooth.value;
  smooth.value += diff * (1 - Math.exp(-8 * dt));
  if (Math.abs(diff) > 0.05) {
    raf = requestAnimationFrame(tick);
  } else {
    smooth.value = target;
    raf = null;
  }
}

function startAnim() {
  if (raf) return;
  lastTs = null;
  raf = requestAnimationFrame(tick);
}

watch(() => props.value, (v) => {
  target = v;
  startAnim();
});

onUnmounted(() => { if (raf) cancelAnimationFrame(raf); });

const clamped    = computed(() => Math.min(Math.max(smooth.value, 0), props.max));
const dashOffset = computed(() => ARC_LEN * (1 - clamped.value / props.max));
const angle      = computed(() => Math.PI - (clamped.value / props.max) * Math.PI);
const needleX    = computed(() => 100 + 72 * Math.cos(angle.value));
const needleY    = computed(() => 115 - 72 * Math.sin(angle.value));
const displayValue = computed(() => smooth.value.toFixed(1));

const ticks = computed(() => {
  const result = [];
  const CX = 100, CY = 115, R = 82;
  for (let i = 0; i <= 5; i++) {
    const frac  = i / 5;
    const theta = Math.PI - frac * Math.PI;
    result.push({
      x1: CX + (R - 6)  * Math.cos(theta), y1: CY - (R - 6)  * Math.sin(theta),
      x2: CX + (R + 1)  * Math.cos(theta), y2: CY - (R + 1)  * Math.sin(theta),
      lx: CX + (R - 16) * Math.cos(theta), ly: CY - (R - 16) * Math.sin(theta),
      label: Math.round(props.max * frac),
    });
  }
  return result;
});
</script>

<style scoped>
.gauge-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .25rem;
}
.gauge-svg {
  width: 100%;
  max-width: 260px;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,.08));
}
.gauge-reading {
  display: flex;
  align-items: baseline;
  gap: .3rem;
  line-height: 1;
}
.gauge-num   { font-size: 2.6rem; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
.gauge-unit  { font-size: .9rem; color: var(--text-muted); font-weight: 500; }
.gauge-label { font-size: .78rem; color: var(--text-muted); letter-spacing: .04em; text-transform: uppercase; font-weight: 600; }
</style>

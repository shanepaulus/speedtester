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
        fill="none"
        stroke="var(--border)"
        stroke-width="10"
        stroke-linecap="round"
      />

      <!-- Colored fill arc -->
      <path
        d="M 18 115 A 82 82 0 1 0 182 115"
        fill="none"
        :stroke="color"
        stroke-width="10"
        stroke-linecap="round"
        :stroke-dasharray="ARC_LEN"
        :stroke-dashoffset="dashOffset"
        class="fill-arc"
      />

      <!-- Needle shadow -->
      <line
        x1="100" y1="115"
        :x2="needleX" :y2="needleY"
        stroke="rgba(0,0,0,.15)" stroke-width="4" stroke-linecap="round"
        transform="translate(1,2)"
      />

      <!-- Needle -->
      <line
        x1="100" y1="115"
        :x2="needleX" :y2="needleY"
        :stroke="color"
        stroke-width="2.5"
        stroke-linecap="round"
        class="needle"
      />

      <!-- Center cap -->
      <circle cx="100" cy="115" r="6" fill="var(--surface)" stroke="var(--border)" stroke-width="1.5"/>
      <circle cx="100" cy="115" r="3" :fill="color"/>
    </svg>

    <!-- Value readout -->
    <div class="gauge-reading">
      <span class="gauge-num">{{ displayValue }}</span>
      <span class="gauge-unit">{{ unit }}</span>
    </div>
    <div class="gauge-label">{{ label }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const ARC_LEN = Math.PI * 82;

const props = defineProps({
  value: { type: Number, default: 0 },
  max:   { type: Number, default: 200 },
  unit:  { type: String, default: 'Mbps' },
  label: { type: String, default: '' },
  color: { type: String, default: 'var(--download)' },
});

const clamped = computed(() => Math.min(Math.max(props.value, 0), props.max));

const dashOffset = computed(() => ARC_LEN * (1 - clamped.value / props.max));

const angle = computed(() => (Math.PI - (clamped.value / props.max) * Math.PI));
const needleX = computed(() => 100 + 72 * Math.cos(angle.value));
const needleY = computed(() => 115 - 72 * Math.sin(angle.value));

const displayValue = computed(() => props.value.toFixed(props.unit === 'ms' ? 1 : 1));

const ticks = computed(() => {
  const result = [];
  const CX = 100, CY = 115, R = 82;
  const count = 5;
  for (let i = 0; i <= count; i++) {
    const frac  = i / count;
    const theta = Math.PI - frac * Math.PI;
    const cos   = Math.cos(theta), sin = Math.sin(theta);
    const isMajor = i % 1 === 0;
    result.push({
      x1:    CX + (R - 6)  * cos,
      y1:    CY - (R - 6)  * sin,
      x2:    CX + (R + 1)  * cos,
      y2:    CY - (R + 1)  * sin,
      lx:    CX + (R - 16) * cos,
      ly:    CY - (R - 16) * sin,
      label: isMajor ? Math.round(props.max * frac) : null,
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
.fill-arc {
  transition: stroke-dashoffset .25s ease-out;
}
.needle {
  transition: x2 .25s ease-out, y2 .25s ease-out;
}
.gauge-reading {
  display: flex;
  align-items: baseline;
  gap: .3rem;
  line-height: 1;
}
.gauge-num  {
  font-size: 2.6rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -.02em;
}
.gauge-unit  { font-size: .9rem; color: var(--text-muted); font-weight: 500; }
.gauge-label { font-size: .78rem; color: var(--text-muted); letter-spacing: .04em; text-transform: uppercase; font-weight: 600; }
</style>

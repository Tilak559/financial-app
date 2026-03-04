<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  selectedIndex: { type: Number, default: -1 },
})

const maxVal = computed(() => {
  const m = Math.max(...props.data.flatMap((d) => [d.income, d.expenses]), 1)
  return Math.ceil(m / 2000) * 2000
})

const yTicks = computed(() => {
  const step = maxVal.value / 4
  return [0, step, step * 2, step * 3, maxVal.value]
})

const chartLeft = 12
const chartRight = 4
const chartTop = 8
const chartBottom = 16
const chartW = 100 - chartLeft - chartRight
const chartH = 100 - chartTop - chartBottom

function heightPct(val) {
  return (val / maxVal.value) * chartH
}

function formatTick(val) {
  if (val >= 1000) return (val / 1000).toFixed(0) + 'k'
  return String(val)
}

const groupWidth = computed(() => chartW / props.data.length)
const barGap = 0.5
const barGroupFrac = 0.45
const barGroupWidth = computed(() => groupWidth.value * barGroupFrac)
const barPairWidth = computed(() => (barGroupWidth.value - barGap) / 2)
const barGroupOffset = computed(() => (groupWidth.value - barGroupWidth.value) / 2)

function labelLeftPct(i) {
  return chartLeft + (i + 0.5) * groupWidth.value
}
</script>

<template>
  <div class="w-full">
    <div class="flex gap-4 h-48">
      <div class="flex flex-col justify-between text-right shrink-0 py-0.5" style="width: 2.5rem;">
        <template v-for="(tick, i) in yTicks.slice().reverse()" :key="i">
          <span class="text-xs text-[var(--textMuted)] tabular-nums">{{ formatTick(tick) }}</span>
        </template>
      </div>
      <div class="flex-1 min-w-0 relative">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="w-full h-full block">
          <defs>
            <linearGradient id="barIncome" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="rgba(0, 200, 83, 0.85)" />
              <stop offset="100%" stop-color="rgba(0, 200, 83, 1)" />
            </linearGradient>
            <linearGradient id="barExpenses" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="rgba(75, 85, 99, 0.9)" />
              <stop offset="100%" stop-color="rgba(107, 114, 128, 0.95)" />
            </linearGradient>
          </defs>
          <g :transform="`translate(${chartLeft}, ${chartTop})`">
            <g v-for="(_, i) in yTicks.slice(1)" :key="'grid-' + i">
              <line
                :y1="(i * chartH) / (yTicks.length - 1)"
                :y2="(i * chartH) / (yTicks.length - 1)"
                :x1="0"
                :x2="chartW"
                stroke="var(--border)"
                stroke-width="0.3"
                stroke-dasharray="1 1.5"
              />
            </g>
            <g v-for="(d, i) in data" :key="d.month">
              <g :transform="`translate(${i * groupWidth + barGroupOffset}, 0)`">
                <rect
                  :x="0"
                  :y="chartH - heightPct(d.income)"
                  :width="barPairWidth"
                  :height="heightPct(d.income)"
                  fill="url(#barIncome)"
                  rx="2"
                  ry="2"
                />
                <rect
                  :x="barPairWidth + barGap"
                  :y="chartH - heightPct(d.expenses)"
                  :width="barPairWidth"
                  :height="heightPct(d.expenses)"
                  fill="url(#barExpenses)"
                  rx="2"
                  ry="2"
                />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
    <div class="flex mt-2 gap-4" style="padding-left: 2.5rem;">
      <div class="flex-1 min-w-0 relative h-5">
        <span
          v-for="(d, i) in data"
          :key="d.month"
          class="absolute text-xs text-[var(--textMuted)] whitespace-nowrap -translate-x-1/2"
          :style="{ left: labelLeftPct(i) + '%', top: 0 }"
        >{{ d.month }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  labels: { type: Array, default: () => [] },
  series: { type: Array, default: () => [] },
})

const colors = ['var(--accent)', 'rgba(59, 130, 246, 0.9)', 'rgba(251, 146, 60, 0.9)']

const chartLeft = 10
const chartRight = 4
const chartTop = 8
const chartBottom = 20
const chartW = 100 - chartLeft - chartRight
const chartH = 100 - chartTop - chartBottom

const allValues = computed(() =>
  props.series.flatMap((s) => s.values)
)

const minVal = computed(() => {
  const m = Math.min(...allValues.value, 0)
  return Math.floor(m / 5000) * 5000
})

const maxVal = computed(() => {
  const m = Math.max(...allValues.value, 1)
  return Math.ceil(m / 5000) * 5000
})

const yTicks = computed(() => {
  const step = (maxVal.value - minVal.value) / 4
  return [minVal.value, minVal.value + step, minVal.value + step * 2, minVal.value + step * 3, maxVal.value]
})

function yPos(val) {
  const range = maxVal.value - minVal.value
  if (range <= 0) return chartTop + chartH / 2
  return chartTop + chartH - ((val - minVal.value) / range) * chartH
}

function xPos(i) {
  const n = props.labels.length
  if (n <= 1) return chartLeft + chartW / 2
  return chartLeft + (i / (n - 1)) * chartW
}

function pathD(values) {
  if (!values.length) return ''
  const pts = values.map((v, i) => `${xPos(i)},${yPos(v)}`)
  return `M ${pts.join(' L ')}`
}

function formatTick(val) {
  if (val >= 1000) return (val / 1000).toFixed(0) + 'k'
  return String(val)
}
</script>

<template>
  <div class="w-full">
    <div class="flex gap-4 h-52">
      <div class="flex flex-col justify-between text-right shrink-0 py-0.5" style="width: 2.5rem;">
        <template v-for="(tick, i) in yTicks.slice().reverse()" :key="i">
          <span class="text-xs text-[var(--textMuted)] tabular-nums">{{ formatTick(tick) }}</span>
        </template>
      </div>
      <div class="flex-1 min-w-0 relative">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="w-full h-full block">
          <defs>
            <linearGradient id="lineGradAll" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.2" />
              <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="lineGradUSA" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="rgba(59, 130, 246, 0.3)" />
              <stop offset="100%" stop-color="rgba(59, 130, 246, 0)" />
            </linearGradient>
            <linearGradient id="lineGradIndia" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="rgba(251, 146, 60, 0.3)" />
              <stop offset="100%" stop-color="rgba(251, 146, 60, 0)" />
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
            <g v-for="(s, idx) in series" :key="s.name">
              <path
                v-if="s.values.length"
                :d="pathD(s.values) + ' L ' + xPos(s.values.length - 1) + ',' + chartTop + chartH + ' L ' + xPos(0) + ',' + chartTop + chartH + ' Z'"
                :fill="idx === 0 ? 'url(#lineGradAll)' : idx === 1 ? 'url(#lineGradUSA)' : 'url(#lineGradIndia)'"
              />
              <path
                v-if="s.values.length"
                :d="pathD(s.values)"
                fill="none"
                :stroke="colors[idx % colors.length]"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
    <div class="flex mt-2 gap-4" style="padding-left: 2.5rem;">
      <div class="flex-1 min-w-0 relative h-5 flex items-end">
        <template v-for="(label, i) in labels" :key="i">
          <span
            class="absolute text-xs text-[var(--textMuted)] whitespace-nowrap -translate-x-1/2"
            :style="{ left: (chartLeft + (i / (labels.length - 1 || 1)) * chartW) + '%', bottom: 0 }"
          >{{ label }}</span>
        </template>
      </div>
    </div>
    <div class="flex flex-wrap gap-4 mt-4" style="padding-left: 2.5rem;">
      <div
        v-for="(s, idx) in series"
        :key="s.name"
        class="flex items-center gap-2"
      >
        <span
          class="w-3 h-0.5 rounded shrink-0"
          :style="{ background: colors[idx % colors.length] }"
        />
        <span class="text-xs text-[var(--textMuted)]">{{ s.name }}</span>
      </div>
    </div>
  </div>
</template>

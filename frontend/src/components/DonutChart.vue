<script setup>
import { computed } from 'vue'

const props = defineProps({
  segments: { type: Array, required: true },
  centerLabel: { type: String, default: '' },
  centerSublabel: { type: String, default: '' },
})

const emit = defineEmits(['edit'])

const total = computed(() => props.segments.reduce((s, seg) => s + seg.value, 0) || 1)
const outer = 40
const inner = 28

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

const paths = computed(() => {
  let startDeg = -90
  return props.segments.map((seg) => {
    const fraction = seg.value / total.value
    const endDeg = startDeg + fraction * 360
    const [x1o, y1o] = polar(50, 50, outer, startDeg)
    const [x2o, y2o] = polar(50, 50, outer, endDeg)
    const [x1i, y1i] = polar(50, 50, inner, startDeg)
    const [x2i, y2i] = polar(50, 50, inner, endDeg)
    const large = fraction > 0.5 ? 1 : 0
    const d = `M ${x1o} ${y1o} A ${outer} ${outer} 0 ${large} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${inner} ${inner} 0 ${large} 0 ${x1i} ${y1i} Z`
    startDeg = endDeg
    return { d, color: seg.color }
  })
})
</script>

<template>
  <div class="relative h-64 w-full max-w-sm mx-auto flex items-center justify-center">
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <path
        v-for="(p, i) in paths"
        :key="i"
        :d="p.d"
        :fill="p.color"
        stroke="var(--card)"
        stroke-width="0.8"
      />
    </svg>
    <div
      v-if="centerLabel || centerSublabel"
      class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
    >
      <span class="text-xl md:text-2xl font-bold text-[var(--text)]">{{ centerLabel }}</span>
      <span class="text-xs md:text-sm text-[var(--textMuted)] mt-0.5">{{ centerSublabel }}</span>
    </div>
    <button
      type="button"
      class="absolute top-0 right-0 p-2 rounded-lg text-[var(--textMuted)] hover:bg-[var(--border)] hover:text-[var(--text)]"
      aria-label="Edit categories"
      @click="emit('edit')"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
defineOptions({ name: 'SummaryCard' })

defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  detail: { type: String, default: '' },
  detailVariant: { type: String, default: 'muted' },
})
</script>

<template>
  <div class="card p-5">
    <p class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-2">
      {{ title }}
    </p>
    <p class="text-2xl md:text-3xl font-bold text-[var(--text)] tracking-tight tabular-nums">
      {{ value }}
    </p>
    <p
      v-if="detail"
      :class="[
        'text-sm mt-1 tabular-nums',
        detailVariant === 'accent' ? 'text-accent' : detailVariant === 'negative' ? 'text-[var(--negative)]' : 'text-[var(--textMuted)]'
      ]"
    >
      {{ detail }}
    </p>
  </div>
</template>

<script setup>
defineOptions({
  name: 'SourceSummaryCard',
})
defineProps({
  title: { type: String, required: true },
  items: { type: Array, default: () => [] },
  amountKey: { type: String, required: true },
  emptyMessage: { type: String, default: 'No data' },
  amountVariant: { type: String, default: 'default' },
  formatAmount: { type: Function, required: true },
})
</script>

<template>
  <div class="card p-5">
    <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-3">{{ title }}</h3>
    <ul>
      <li
        v-for="s in items"
        :key="s.source"
        class="flex justify-between items-center text-sm py-2 border-b border-[var(--border)] last:border-b-0"
      >
        <span class="text-[var(--text)]">{{ s.source }}</span>
        <span
          :class="[
            'tabular-nums',
            amountVariant === 'negative' ? 'text-[var(--negative)]' : 'text-[var(--text)]'
          ]"
        >
          {{ formatAmount(s[amountKey]) }}
        </span>
      </li>
    </ul>
    <p v-if="!items.length" class="text-sm text-[var(--textMuted)]">{{ emptyMessage }}</p>
  </div>
</template>

<script setup>
defineOptions({
  name: 'RegionPageHeader',
})
defineProps({
  regionOptions: { type: Array, required: true },
  currencyOptions: { type: Array, required: true },
  selectedRegion: { type: String, required: true },
  currency: { type: String, required: true },
  multiRegion: { type: Boolean, default: true },
  singleCountryLabel: { type: String, default: 'USA' },
})
const emit = defineEmits(['update:selectedRegion', 'update:currency'])
</script>

<template>
  <div v-if="multiRegion" class="flex flex-wrap items-center justify-between gap-4 mb-5">
    <div class="flex gap-1 border-b border-[var(--border)]">
      <button
        v-for="r in regionOptions"
        :key="r.id"
        type="button"
        @click="emit('update:selectedRegion', r.id)"
        :class="[
          'px-3 py-2 text-sm font-medium transition-colors -mb-px',
          selectedRegion === r.id
            ? 'text-accent border-b-2 border-accent'
            : 'text-[var(--textMuted)] hover:text-[var(--text)]'
        ]"
      >
        {{ r.label }}
      </button>
    </div>
    <div v-if="selectedRegion === 'all'" class="flex items-center gap-2">
      <span class="text-xs text-[var(--textMuted)]">Currency</span>
      <select
        :value="currency"
        class="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text)] min-w-[8rem]"
        @change="emit('update:currency', $event.target.value)"
      >
        <option v-for="c in currencyOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
      </select>
    </div>
  </div>
  <div v-else class="mb-5 py-2">
    <p class="text-sm text-[var(--textMuted)]">Showing {{ singleCountryLabel }}. To change country, go to Settings &gt; Display.</p>
  </div>
</template>

<script setup>
defineOptions({
  name: 'PageContainer',
})
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <div class="w-full min-w-0 flex flex-col gap-5 p-5 lg:max-w-7xl lg:mx-auto">
    <h2 v-if="title" class="text-base md:text-lg font-semibold text-[var(--text)]">{{ title }}</h2>
    <slot />
  </div>
</template>

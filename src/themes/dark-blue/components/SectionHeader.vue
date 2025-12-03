<template>
  <div class="mb-12 text-center max-w-2xl mx-auto">
    <div
      v-if="icon"
      :class="[
        'w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4',
        dark ? 'bg-white/10 text-secondary' : 'bg-secondary/10 text-secondary'
      ]"
    >
      <component :is="icon" class="w-6 h-6" />
    </div>
    <h2 :class="['text-3xl md:text-4xl font-bold mb-3', dark ? 'text-white' : 'text-primary']">
      {{ title }}
    </h2>
    <p :class="['text-lg', dark ? 'text-slate-300' : 'text-text-muted']">
      {{ subtitle }}
    </p>
    <div class="w-24 h-1 bg-secondary mx-auto mt-6 rounded-full"></div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
  dark: {
    type: Boolean,
    default: false,
  },
})
</script>


<template>
  <div class="mb-12 text-center max-w-2xl mx-auto">
    <div
      v-if="icon"
      :class="[
        'w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4',
        dark ? 'bg-white/10 text-indigo-600' : 'bg-indigo-100 text-indigo-600'
      ]"
    >
      <component :is="icon" class="w-6 h-6" />
    </div>
    <h2 :class="['text-3xl md:text-4xl font-bold mb-3', dark ? 'text-white' : 'text-slate-900']">
      {{ title }}
    </h2>
    <p :class="['text-lg', dark ? 'text-slate-300' : 'text-slate-500']">
      {{ subtitle }}
    </p>
    <div :class="['w-24 h-1 mx-auto mt-6 rounded-full', dark ? 'bg-indigo-400' : 'bg-indigo-600']"></div>
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


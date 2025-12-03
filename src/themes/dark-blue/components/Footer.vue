<template>
  <footer class="bg-primary text-white pt-16 pb-8 border-t border-white/10">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center mb-12">
        <div class="mb-6 md:mb-0 text-center md:text-left">
          <h3 class="text-2xl font-bold mb-2">{{ profile?.name || 'Creator' }}</h3>
          <p class="text-slate-400">{{ profile?.tagline || 'Exploring the world, one frame at a time.' }}</p>
        </div>
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="flex gap-6">
            <a href="#" class="text-slate-400 hover:text-secondary transition-colors">Contact</a>
            <a href="#" class="text-slate-400 hover:text-secondary transition-colors">Terms</a>
            <a href="#" class="text-slate-400 hover:text-secondary transition-colors">Privacy</a>
          </div>
          <div class="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 w-full md:w-auto flex justify-center">
            <CurrencySelector is-footer />
          </div>
        </div>
      </div>
      <div class="text-center text-slate-600 text-sm">
        © 2024 My3Pai. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<script setup>
import CurrencySelector from './CurrencySelector.vue'

defineProps({
  profile: {
    type: Object,
    default: null,
  },
})
</script>


<template>
  <div class="group cursor-pointer" @click="$emit('click')">
    <div class="relative h-64 rounded-2xl overflow-hidden mb-4">
      <img
        :src="post.image"
        :alt="post.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div
        v-if="post.category"
        class="absolute top-4 left-4 bg-white/90 backdrop-blur text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
      >
        {{ post.category }}
      </div>
    </div>
    <div class="flex items-center gap-3 mb-2 text-sm text-text-muted">
      <span>{{ post.date }}</span>
      <span class="w-1 h-1 bg-text-light rounded-full"></span>
      <span>{{ post.readTime }} read</span>
      <span v-if="post.isPremium" class="text-yellow-500 font-bold flex items-center gap-1">
        <Star class="w-3 h-3 fill-yellow-500" /> Premium
      </span>
    </div>
    <h3 class="text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors line-clamp-2">
      {{ post.title }}
    </h3>
    <p class="text-text-muted line-clamp-2">{{ post.preview }}</p>
  </div>
</template>

<script setup>
import { Star } from 'lucide-vue-next'

defineProps({
  post: {
    type: Object,
    required: true,
  },
})

defineEmits(['click'])
</script>


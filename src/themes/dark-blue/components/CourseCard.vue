<template>
  <div class="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 group flex flex-col h-full hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-300">
    <div class="relative h-48 overflow-hidden">
      <img
        :src="course.coverImage || course.image"
        :alt="course.title"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div
        v-if="course.isPremium"
        class="absolute top-4 right-4 bg-primary/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
      >
        <Star class="w-3 h-3 fill-yellow-400 text-yellow-400" />
        PREMIUM
      </div>
    </div>
    <div class="p-6 flex-1 flex flex-col">
      <div v-if="course.students" class="flex items-center gap-2 mb-3">
        <Users class="w-4 h-4 text-secondary" />
        <span class="text-xs font-semibold text-text-light">{{ course.students }} students enrolled</span>
      </div>
      <h3 class="text-xl font-bold text-primary mb-2 leading-tight">{{ course.title }}</h3>
      <p class="text-text-muted text-sm mb-6 flex-1">{{ course.description }}</p>

      <div class="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
        <PriceDisplay :amount="course.price" class="text-2xl font-bold text-primary" />
        <button
          @click="handleAddToCart"
          class="bg-secondary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20 active:scale-95"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Star, Users } from 'lucide-vue-next'
import PriceDisplay from './PriceDisplay.vue'

const props = defineProps({
  course: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['add-to-cart'])

const handleAddToCart = () => {
  emit('add-to-cart', {
    id: props.course.id,
    title: props.course.title,
    price: props.course.price || 0,
    image: props.course.coverImage || props.course.image,
    type: 'course',
  })
}
</script>


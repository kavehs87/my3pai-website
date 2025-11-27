<template>
  <section id="training" class="space-y-6">
    <div class="flex items-center gap-2">
      <div class="p-2 bg-purple-100 rounded-lg">
        <GraduationCap class="w-5 h-5 text-purple-600" />
      </div>
      <h2 class="text-2xl font-bold text-slate-900">Training &amp; Masterclasses</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <article
        v-for="pkg in MASTERCLASSES"
        :key="pkg.id"
        class="group bg-white rounded-2xl p-2 shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col md:flex-row gap-4"
      >
        <div class="relative w-full md:w-1/3 h-48 md:h-auto rounded-xl overflow-hidden shrink-0">
          <img :src="pkg.image" :alt="pkg.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div class="py-2 px-2 md:py-4 md:pr-4 flex flex-col flex-grow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Course</span>
            <div class="flex items-center gap-1">
              <Star class="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span class="text-xs text-slate-400">5.0</span>
            </div>
          </div>
          <h3 class="font-bold text-lg text-slate-900 mb-2">
            {{ pkg.title }}
          </h3>
          <p class="text-sm text-slate-500 mb-4 line-clamp-2">
            {{ pkg.description }}
          </p>
          <div class="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
            <span class="text-lg font-bold text-slate-900">\${{ pkg.price }}</span>
            <div class="flex items-center gap-2">
              <button class="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors" aria-label="Save masterclass">
                <Heart class="w-4 h-4" />
              </button>
              <button
                class="text-sm font-bold bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors shadow-lg shadow-purple-600/20 active:scale-95"
                @click="$emit('add-to-cart')"
              >
                <ShoppingCart class="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { GraduationCap, Star, ShoppingCart, Heart } from 'lucide-vue-next'
import { MASTERCLASSES } from '../constants'

defineEmits(['add-to-cart'])
</script>


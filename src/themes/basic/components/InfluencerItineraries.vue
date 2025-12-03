<template>
  <section id="itineraries" class="space-y-6">
    <div class="flex items-center gap-2">
      <div class="p-2 bg-blue-100 rounded-lg">
        <Map class="w-5 h-5 text-blue-600" />
      </div>
      <h2 class="text-2xl font-bold text-slate-900">Curated Itineraries</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
        v-for="pkg in ITINERARIES"
        :key="pkg.id"
        class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-100 hover:border-slate-200 relative top-0 hover:-top-1"
      >
        <div class="relative h-48 overflow-hidden bg-slate-100">
          <img :src="pkg.image" :alt="pkg.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-sm border border-slate-100">
            {{ pkg.type }}
          </div>
          <div
            v-if="pkg.discount"
            class="absolute top-3 right-3 bg-rose-500 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1"
          >
            <Tag class="w-3 h-3" />
            {{ pkg.discount }}
          </div>
        </div>
        <div class="p-6 flex flex-col flex-grow">
          <div class="flex items-center gap-1 mb-2">
            <Star v-for="n in 4" :key="n" class="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span class="text-xs text-slate-300 ml-1">(4.9)</span>
          </div>
          <h3 class="font-bold text-lg text-slate-900 mb-2 leading-snug">
            {{ pkg.title }}
          </h3>
          <p class="text-sm text-slate-500 mb-6 line-clamp-2">
            {{ pkg.description }}
          </p>
          <div class="flex items-center justify-between mt-auto gap-3">
            <span class="text-xl font-bold text-slate-900">\${{ pkg.price }}</span>
            <div class="flex items-center gap-2">
              <button class="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-rose-200 hover:text-rose-500 transition-colors" aria-label="Save itinerary">
                <Heart class="w-4 h-4" />
              </button>
              <button
                class="bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-bold shadow-lg shadow-slate-900/10 active:scale-95"
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
import { Map, Star, Tag, ShoppingCart, Heart } from 'lucide-vue-next'
import { ITINERARIES } from '../constants'

defineEmits(['add-to-cart'])
</script>


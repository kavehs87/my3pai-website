<template>
  <section id="countries" class="space-y-6">
    <div class="flex items-baseline justify-between">
      <h2 class="text-2xl font-bold text-blue-900">Destinations</h2>
      <span class="text-xs font-mono text-gray-600 font-bold">{{ COUNTRIES.length }} COUNTRIES VISITED</span>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <article
        v-for="country in COUNTRIES"
        :key="country.id"
        class="group relative rounded-3xl overflow-hidden cursor-pointer h-80 w-full shadow-md hover:shadow-xl transition-shadow"
        @click="selectCountry(country)"
      >
        <img :src="country.image" :alt="country.name" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/80 group-hover:via-black/20 group-hover:to-black/90 transition-all duration-300" />
        <div class="absolute top-4 left-4 flex gap-2">
          <span class="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/30 shadow-lg">
            {{ country.flagCode }}
          </span>
          <span
            v-if="country.mapDiscount"
            class="bg-rose-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
          >
            <Tag class="w-3 h-3" />
            {{ country.mapDiscount }}
          </span>
        </div>
        <div v-if="country.mapPrice" class="absolute top-4 right-4 group-hover:scale-110 transition-transform">
          <span class="bg-white text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            \${{ country.mapPrice }} <span class="font-normal text-slate-500">| Map</span>
          </span>
        </div>
        <div class="absolute bottom-0 left-0 p-6 w-full">
          <div class="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3 class="text-3xl font-bold text-white mb-2 leading-none drop-shadow-md">{{ country.name }}</h3>
            <p class="text-sm text-slate-100 mb-4 line-clamp-2 leading-relaxed font-medium drop-shadow-sm">
              {{ country.description }}
            </p>
            <div class="flex items-center justify-between pt-3 border-t border-white/20">
              <div class="flex items-center gap-2">
                <MapPin class="w-4 h-4 text-white" />
                <span class="text-xs font-bold uppercase tracking-widest text-white">{{ country.pointsOfInterestCount }} Spots Included</span>
              </div>
              <div class="bg-white/20 p-2 rounded-full group-hover:bg-white group-hover:text-black transition-colors text-white">
                <ArrowUpRight class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div
      v-if="selectedCountry"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div class="bg-white rounded-3xl w-full max-w-lg h-[70vh] flex flex-col shadow-2xl overflow-hidden relative border border-white/20">
        <div class="absolute top-4 right-4 z-10">
          <button
            class="bg-black/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/40 transition-colors"
            @click="selectedCountry = null"
            aria-label="Close modal"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="h-56 shrink-0 relative">
          <img :src="selectedCountry.image" :alt="selectedCountry.name" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div class="absolute bottom-6 left-6 text-white max-w-[80%]">
            <h2 class="text-3xl font-bold mb-2">{{ selectedCountry.name }}</h2>
            <p class="text-sm text-white/90 leading-snug">
              {{ selectedCountry.description }}
            </p>
          </div>
        </div>
        <div class="flex-grow overflow-y-auto p-6 bg-white">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Curated Locations</h4>
            <span class="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">{{ selectedCountry.pointsOfInterestCount }} total</span>
          </div>
          <div class="grid grid-cols-1 gap-3">
            <article
              v-for="poi in selectedCountry.pois"
              :key="poi.name"
              class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div>
                <h5 class="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                  {{ poi.name }}
                </h5>
                <div class="flex flex-wrap gap-1.5 mt-1.5">
                  <span
                    v-for="tag in poi.tags"
                    :key="tag"
                    class="text-[10px] font-bold uppercase tracking-wide text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>
              <div class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                <MapPin class="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </article>
          </div>
        </div>
        <div class="p-4 bg-white border-t border-slate-100">
          <button
            class="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            @click="onAddMapToCart"
          >
            <ShoppingCart class="w-5 h-5" />
            <span class="text-base">Add Map to Cart</span>
            <div class="bg-white/20 px-2 py-1 rounded text-white font-bold ml-auto flex items-center gap-2">
              <span v-if="selectedCountry.mapPrice" class="text-slate-300 font-normal line-through text-xs">\${{ selectedCountry.mapPrice + 10 }}</span>
              <span v-if="selectedCountry.mapPrice">\${{ selectedCountry.mapPrice }}</span>
              <span v-else>Included</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { MapPin, X, ArrowUpRight, Tag, ShoppingCart } from 'lucide-vue-next'
import { COUNTRIES } from '@/shared/influencer/constants'

const emits = defineEmits(['add-to-cart'])
const selectedCountry = ref(null)

const selectCountry = (country) => {
  selectedCountry.value = country
}

const onAddMapToCart = () => {
  emits('add-to-cart')
  selectedCountry.value = null
}
</script>


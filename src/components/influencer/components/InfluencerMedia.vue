<template>
  <section id="media" class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
    <div class="flex flex-col md:flex-row justify-between gap-6 md:items-end">
      <div class="max-w-xl">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
            Creative Shop
          </span>
        </div>
        <h2 class="text-3xl font-bold text-slate-900 mb-3">Digital Assets &amp; Stock</h2>
        <p class="text-slate-500 text-base leading-relaxed">
          Elevate your content with my professional-grade materials.
          Purchase <span class="text-slate-900 font-medium">4K drone footage</span>,
          <span class="text-slate-900 font-medium"> RAW photo packs</span>, and
          <span class="text-slate-900 font-medium"> Cinematic LUTs</span>.
          All assets come with a royalty-free commercial license.
        </p>
        <div class="flex flex-wrap gap-4 mt-4 text-xs font-medium text-slate-500">
          <span class="flex items-center gap-1"><Check class="w-3 h-3 text-green-500" /> Instant Download</span>
          <span class="flex items-center gap-1"><Check class="w-3 h-3 text-green-500" /> Commercial Use</span>
          <span class="flex items-center gap-1"><Check class="w-3 h-3 text-green-500" /> High Bitrate</span>
        </div>
      </div>
      <button class="shrink-0 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center gap-2">
        Browse Full Library <ArrowUpRight class="w-4 h-4" />
      </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
        v-for="asset in MEDIA_ASSETS"
        :key="asset.id"
        class="group relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all bg-slate-50"
      >
        <div class="aspect-video overflow-hidden relative">
          <img :src="asset.image" :alt="asset.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 shadow-sm">
            <component :is="typeIcons[asset.type] ?? Sliders" class="w-3 h-3" />
            {{ asset.type }}
          </div>
        </div>
        <div class="p-5">
          <h3 class="font-bold text-slate-900 mb-1">{{ asset.title }}</h3>
          <p class="text-xs text-slate-500 mb-4 line-clamp-2">
            {{ asset.description }}
          </p>
          <div class="flex items-center justify-between pt-4 border-t border-slate-200/60">
            <div class="flex flex-col">
              <span class="text-[10px] font-bold uppercase text-slate-400">License</span>
              <span class="text-lg font-bold text-slate-900">\${{ asset.price }}</span>
            </div>
            <button
              class="bg-white border border-slate-200 text-slate-900 p-2.5 rounded-lg hover:bg-slate-900 hover:text-white transition-colors"
              aria-label="Add asset to cart"
              @click="$emit('add-to-cart')"
            >
              <ShoppingCart class="w-4 h-4" />
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ArrowUpRight, Film, Image as ImageIcon, Sliders, ShoppingCart, Check } from 'lucide-vue-next'
import { MEDIA_ASSETS } from '../constants'

defineEmits(['add-to-cart'])

const typeIcons = {
  Video: Film,
  Photo: ImageIcon,
  Preset: Sliders,
}
</script>


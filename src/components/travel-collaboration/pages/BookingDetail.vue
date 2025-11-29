<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 h-full overflow-y-auto">
    <button @click="$router.back()" class="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors">
      <ArrowLeft class="w-4 h-4" /> Back to map
    </button>

    <div v-if="!offer" class="p-8">Offer not found</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Col - Content -->
      <div class="lg:col-span-2 space-y-8">
        
        <!-- Gallery -->
        <div class="aspect-video w-full bg-slate-200 rounded-2xl overflow-hidden relative shadow-sm">
          <img :src="imageUrl" class="w-full h-full object-cover" alt="Detail" />
          <div class="absolute bottom-4 right-4 bg-black/50 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
            <Camera class="w-3 h-3" /> 5 photos
          </div>
        </div>

        <!-- Header -->
        <div>
          <div class="flex items-center gap-3 mb-3">
            <span class="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold uppercase rounded-full tracking-wider">{{ offer.type }}</span>
            <div class="flex items-center text-yellow-500 text-sm font-medium">
              <Star class="w-4 h-4 fill-current" />
              <span class="ml-1">{{ offer.user.stats?.rating }}</span>
              <span class="text-slate-400 ml-1">({{ offer.user.stats?.reviewCount }} reviews)</span>
            </div>
          </div>
          <h1 class="text-3xl font-bold text-slate-900 mb-2">{{ offer.title }}</h1>
          <div class="flex items-center gap-2 text-slate-500">
            <MapPin class="w-4 h-4" />
            <span>Shibuya City, Tokyo</span>
          </div>
        </div>

        <!-- Creator Profile -->
        <div class="flex items-center gap-4 p-6 border border-slate-100 rounded-2xl bg-white shadow-sm">
          <img :src="offer.user.avatarUrl" class="w-16 h-16 rounded-full object-cover" alt="Creator" />
          <div>
            <h3 class="font-bold text-slate-900 flex items-center gap-2">
              {{ offer.user.name }} 
              <Shield v-if="offer.user.isVerified" class="w-4 h-4 text-green-500 fill-current" />
            </h3>
            <p class="text-sm text-slate-500">Joined 2021 • Response time: 1hr</p>
          </div>
          <button class="ml-auto px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            View Profile
          </button>
        </div>

        <!-- Description -->
        <div>
          <h3 class="text-lg font-bold text-slate-900 mb-3">About this session</h3>
          <p class="text-slate-600 leading-relaxed whitespace-pre-line">{{ offer.description }}</p>
          <p class="text-slate-600 leading-relaxed mt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <!-- Gear -->
        <div v-if="offer.gearIncluded && offer.gearIncluded.length > 0">
          <h3 class="text-lg font-bold text-slate-900 mb-3">Gear included</h3>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="gear in offer.gearIncluded" 
              :key="gear" 
              class="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg font-medium"
            >
              {{ gear }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right Col - Sticky Booking Widget -->
      <div class="lg:col-span-1">
        <div class="sticky top-24 bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
          <div class="flex items-end justify-between mb-6">
            <div>
              <span class="text-3xl font-bold text-slate-900">${{ offer.price.amount }}</span>
              <span class="text-slate-500 text-sm font-medium">/{{ offer.price.unit }}</span>
            </div>
          </div>

          <div class="space-y-4 mb-6">
            <div class="border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-primary-500 transition-colors">
              <div class="text-xs text-slate-400 font-bold uppercase mb-1">Date</div>
              <div class="font-medium text-slate-900">Oct 14, 2023</div>
            </div>
            <div class="border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-primary-500 transition-colors">
              <div class="text-xs text-slate-400 font-bold uppercase mb-1">Time</div>
              <div class="font-medium text-slate-900">10:00 AM - 11:00 AM</div>
            </div>
          </div>

          <button class="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 mb-4">
            Request to Book
          </button>

          <p class="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
            <Shield class="w-3 h-3" /> Secure payment via Escrow
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Star, Shield, Clock, MapPin, Camera } from 'lucide-vue-next'
import { MOCK_OFFERS } from '@/data/travelCollaboration/constants.js'

export default {
  name: 'BookingDetail',
  components: {
    ArrowLeft,
    Star,
    Shield,
    Clock,
    MapPin,
    Camera
  },
  setup() {
    const route = useRoute()
    const offer = computed(() => {
      return MOCK_OFFERS.find(o => o.id === route.params.id)
    })

    const imageUrl = computed(() => {
      return offer.value?.imageUrl || `https://picsum.photos/seed/${route.params.id}/1200/800`
    })

    return {
      offer,
      imageUrl
    }
  }
}
</script>


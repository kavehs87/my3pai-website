<template>
  <div :class="[
    'bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col relative w-full',
    isExpanded ? 'ring-2 ring-purple-500/10' : ''
  ]">
    <!-- Cover Image -->
    <div class="h-28 bg-slate-200 relative overflow-hidden flex-shrink-0">
      <img 
        :src="creator.coverUrl" 
        alt="Cover" 
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
      
      <!-- Availability Badge - Top Left -->
      <div class="absolute top-3 left-3 z-10">
        <div v-if="creator.availability.status === 'AVAILABLE'" class="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border border-green-200">
          <CheckCircle class="w-3 h-3" /> Available
        </div>
        <div v-else-if="creator.availability.status === 'BOOKED'" class="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border border-orange-200">
          <Clock class="w-3 h-3" /> Booked {{ creator.availability.until ? `until ${creator.availability.until}` : '' }}
        </div>
        <div v-else-if="creator.availability.status === 'BUSY'" class="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border border-red-200">
          <AlertCircle class="w-3 h-3" /> Busy
        </div>
      </div>
    </div>

    <!-- Content Wrapper -->
    <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col items-center text-center">
      
      <!-- Avatar (Centered) -->
      <div class="absolute -top-10 left-1/2 -translate-x-1/2">
        <div class="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
          <img :src="creator.avatarUrl" :alt="creator.name" class="w-full h-full object-cover" />
        </div>
      </div>

      <!-- Name, Handle & Location (Always Visible) -->
      <div class="mb-4 w-full">
        <h3 class="text-lg font-bold text-slate-900 flex items-center justify-center gap-1.5 leading-tight">
          {{ creator.name }}
          <Shield v-if="creator.isVerified" class="w-4 h-4 text-blue-500 fill-current" />
        </h3>
        <div class="flex items-center justify-center gap-2 text-sm text-slate-500 mt-1">
           <a 
              :href="`https://instagram.com/${cleanHandle}`"
              target="_blank"
              rel="noopener noreferrer"
              @click.stop
              class="font-medium hover:text-slate-800 hover:underline transition-colors"
           >
              {{ creator.handle }}
           </a>
           <span class="text-slate-300">•</span>
           <span class="flex items-center gap-1 text-xs uppercase tracking-wide">
             <MapPin class="w-3 h-3" /> {{ creator.location }}
           </span>
        </div>
      </div>

      <!-- Stats Row (Always Visible) -->
      <div class="flex items-center justify-center gap-6 py-3 border border-slate-100 bg-slate-50/50 rounded-xl w-full mb-2">
        <div class="text-center">
           <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Followers</div>
           <div class="font-bold text-slate-900 text-sm">{{ creator.metrics.followers }}</div>
        </div>
        <div class="w-px h-8 bg-slate-200"></div>
        <div class="text-center">
           <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Engage</div>
           <div class="font-bold text-green-600 text-sm">{{ creator.metrics.engagement }}</div>
        </div>
        <div class="w-px h-8 bg-slate-200"></div>
        <div class="text-center">
           <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Avg Likes</div>
           <div class="font-bold text-slate-900 text-sm">{{ creator.metrics.avgLikes }}</div>
        </div>
      </div>

      <!-- Collapsed State Toggle -->
      <button 
        v-if="!isExpanded"
        @click="isExpanded = true"
        class="w-full mt-2 pt-2 flex flex-col items-center gap-1 group/expand border-t border-slate-50 transition-colors"
      >
         <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover/expand:text-purple-600 transition-colors">View Details</span>
         <ChevronDown class="w-4 h-4 text-slate-300 group-hover/expand:text-purple-600 transition-colors" />
      </button>

      <!-- Expanded Content -->
      <div v-if="isExpanded" class="w-full animate-in slide-in-from-top-2 fade-in duration-300">
        <!-- Bio -->
        <p class="text-sm text-slate-600 line-clamp-3 mb-5 mt-4 px-1 leading-relaxed">
          {{ creator.bio }}
        </p>

        <!-- Tags -->
        <div class="flex flex-wrap justify-center gap-1.5 mb-5">
            <span 
              v-for="tag in creator.tags" 
              :key="tag" 
              class="px-2.5 py-1 bg-white text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-200 shadow-sm"
            >
                {{ tag }}
            </span>
        </div>

        <!-- Portfolio Preview -->
        <div v-if="creator.portfolio && creator.portfolio.length > 0" class="w-full mb-5 border-t border-slate-50 pt-4">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-left px-1">Featured Work</div>
          <div class="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide snap-x">
            <a
              v-for="(img, i) in creator.portfolio"
              :key="i"
              :href="`https://instagram.com/${cleanHandle}`"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-100 snap-start shadow-sm"
              @click.stop
            >
              <img :src="img" class="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Portfolio" />
            </a>
          </div>
        </div>

        <!-- Social Icons -->
        <div class="flex justify-center gap-5 text-slate-400 mb-5 w-full">
            <a 
              v-if="creator.platforms.includes('Instagram')"
              :href="`https://instagram.com/${cleanHandle}`" 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Instagram"
              class="hover:text-pink-600 transition-colors p-2 hover:bg-pink-50 rounded-full"
              @click.stop
            >
              <Instagram class="w-5 h-5" />
            </a>
            <a 
              v-if="creator.platforms.includes('YouTube')"
              :href="`https://youtube.com/@${cleanHandle}`" 
              target="_blank" 
              rel="noopener noreferrer" 
              title="YouTube"
              class="hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
              @click.stop
            >
              <Youtube class="w-5 h-5" />
            </a>
            <a 
              v-if="creator.platforms.includes('TikTok')"
              :href="`https://tiktok.com/@${cleanHandle}`" 
              target="_blank" 
              rel="noopener noreferrer" 
              title="TikTok"
              class="hover:text-black transition-colors p-2 hover:bg-slate-100 rounded-full"
              @click.stop
            >
              <Music class="w-5 h-5" />
            </a>
        </div>

        <!-- Action Buttons -->
        <div class="mt-auto grid grid-cols-2 gap-3 w-full">
          <button 
            @click.stop="$emit('hangout-click')"
            class="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors group/btn shadow-sm"
          >
            <Coffee class="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            Request Hangout
          </button>
          <button 
            @click.stop="$emit('business-click')"
            class="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5"
          >
            <Briefcase class="w-4 h-4" />
            Business
          </button>
        </div>

        <!-- Collapse Toggle -->
        <button 
          @click="isExpanded = false"
          class="w-full mt-3 flex justify-center text-slate-300 hover:text-slate-500 transition-colors pb-1"
        >
          <ChevronUp class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { Shield, Instagram, Youtube, Briefcase, Coffee, CheckCircle, Clock, AlertCircle, Music, MapPin, ChevronDown, ChevronUp } from 'lucide-vue-next'

export default {
  name: 'CreatorCard',
  components: {
    Shield,
    Instagram,
    Youtube,
    Briefcase,
    Coffee,
    CheckCircle,
    Clock,
    AlertCircle,
    Music,
    MapPin,
    ChevronDown,
    ChevronUp
  },
  props: {
    creator: {
      type: Object,
      required: true
    }
  },
  emits: ['business-click', 'hangout-click'],
  setup(props) {
    const isExpanded = ref(false)
    const cleanHandle = computed(() => props.creator.handle.replace('@', ''))

    return {
      isExpanded,
      cleanHandle
    }
  }
}
</script>


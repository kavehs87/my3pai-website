<template>
  <div class="relative w-full h-full overflow-hidden bg-slate-100 group select-none">
    <!-- Map Background Placeholder -->
    <div 
      class="absolute inset-0 w-full h-full transition-transform duration-700 ease-out"
      :style="{ transform: `scale(${1 + (zoom - 1) * 0.2})` }"
    >
      <img 
        src="https://picsum.photos/1200/800?grayscale&blur=2" 
        alt="Map Background"
        :class="[
          'w-full h-full object-cover transition-opacity duration-500',
          isOfflineReady ? 'opacity-100 grayscale-[20%]' : 'opacity-80'
        ]"
        @error="handleImageError"
      />
    </div>
    
    <div class="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-50/20 pointer-events-none" />

    <!-- Radar Effect -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
       <div 
         class="w-64 h-64 bg-primary-500/5 rounded-full animate-pulse border border-primary-500/20" 
         :style="{ transform: `scale(${zoom})` }"
       ></div>
       <div class="absolute top-1/2 left-1/2 w-4 h-4 bg-primary-600 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-lg z-0"></div>
    </div>

    <!-- Offline Status -->
    <div v-if="isOfflineReady" class="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur border border-green-200 shadow-sm px-3 py-1.5 rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
      <WifiOff class="w-3.5 h-3.5 text-green-600" />
      <span class="text-xs font-semibold text-green-700">Offline Ready</span>
    </div>

    <!-- Map Layers Filter Control -->
    <div class="absolute top-4 left-4 z-30">
      <div class="relative">
        <button 
          @click="showFilters = !showFilters"
          :class="[
            'p-2 rounded-lg shadow-md transition-all flex items-center gap-2 font-medium text-sm',
            showFilters ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
          ]"
        >
          <Layers class="w-4 h-4" />
          <span class="hidden sm:inline">Map Layers</span>
        </button>

        <div v-if="showFilters" class="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 origin-top-left">
          <div class="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 mb-1">Filter Visibility</div>
          
          <button 
            @click="toggleCategory('CREATOR')"
            class="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-center gap-2 text-sm text-slate-700">
              <div :class="[
                'w-6 h-6 rounded-full flex items-center justify-center',
                visibleCategories.CREATOR ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-400'
              ]">
                <Crown class="w-3 h-3" />
              </div>
              Influencers
            </div>
            <Check v-if="visibleCategories.CREATOR" class="w-3.5 h-3.5 text-purple-600" />
          </button>

          <button 
            @click="toggleCategory('CAMPAIGN')"
            class="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-center gap-2 text-sm text-slate-700">
              <div :class="[
                'w-6 h-6 rounded-full flex items-center justify-center',
                visibleCategories.CAMPAIGN ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-400'
              ]">
                <Briefcase class="w-3 h-3" />
              </div>
              Business
            </div>
            <Check v-if="visibleCategories.CAMPAIGN" class="w-3.5 h-3.5 text-orange-600" />
          </button>

          <div class="h-px bg-slate-100 my-1"></div>

          <button 
            @click="toggleCategory('MEETUP')"
            class="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-center gap-2 text-sm text-slate-700">
              <div :class="[
                'w-6 h-6 rounded-full flex items-center justify-center',
                visibleCategories.MEETUP ? 'bg-accent-500 text-white' : 'bg-slate-200 text-slate-400'
              ]">
                <Users class="w-3 h-3" />
              </div>
              Meetups
            </div>
            <Check v-if="visibleCategories.MEETUP" class="w-3.5 h-3.5 text-accent-600" />
          </button>

          <button 
            @click="toggleCategory('SESSION')"
            class="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-center gap-2 text-sm text-slate-700">
              <div :class="[
                'w-6 h-6 rounded-full flex items-center justify-center',
                visibleCategories.SESSION ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-400'
              ]">
                <Camera class="w-3 h-3" />
              </div>
              Sessions
            </div>
            <Check v-if="visibleCategories.SESSION" class="w-3.5 h-3.5 text-primary-600" />
          </button>
        </div>
      </div>
    </div>

    <!-- Zoom & Download Controls -->
    <div class="absolute bottom-24 md:bottom-8 right-4 md:right-8 flex flex-col gap-2 z-30">
      <button 
        @click="handleDownloadMap"
        :disabled="isDownloading || isOfflineReady"
        :class="[
          'p-2 rounded-lg shadow-lg transition-all flex items-center justify-center relative group',
          isOfflineReady 
            ? 'bg-green-500 text-white hover:bg-green-600' 
            : 'bg-white text-slate-700 hover:bg-slate-50'
        ]"
      >
         <Loader2 v-if="isDownloading" class="w-5 h-5 animate-spin text-primary-600" />
         <Check v-else-if="isOfflineReady" class="w-5 h-5" />
         <Download v-else class="w-5 h-5" />
         <div class="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
           {{ isOfflineReady ? `${cityName} downloaded` : isDownloading ? `Downloading ${cityName}...` : `Download ${cityName}` }}
         </div>
      </button>

      <div class="h-px bg-slate-200/50 my-1 mx-2"></div>

      <button @click="handleZoom(0.5)" class="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 text-slate-700">
        <Plus class="w-5 h-5" />
      </button>
      <button @click="handleZoom(-0.5)" class="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 text-slate-700">
        <Minus class="w-5 h-5" />
      </button>
    </div>

    <!-- Render Clusters/Markers -->
    <template v-for="(cluster, index) in clusters" :key="`cluster-${index}`">
      <button
        v-if="cluster.length === 1"
        :key="cluster[0].id"
        @click="onItemSelect(cluster[0].id)"
        :style="{ top: `${cluster[0].y}%`, left: `${cluster[0].x}%` }"
        :class="[
          'absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-spring',
          activeItemId === cluster[0].id ? 'z-50 scale-125' : 'hover:scale-110 z-20'
        ]"
      >
        <template v-if="activeItemId === cluster[0].id">
          <span 
            :class="[
              'absolute inset-0 -m-2 rounded-full opacity-40 animate-ping',
              getMarkerStyle(cluster[0].type, cluster[0].category).bgColor
            ]"
          ></span>
          <span 
            :class="[
              'absolute inset-0 -m-1 rounded-full opacity-20 animate-pulse',
              getMarkerStyle(cluster[0].type, cluster[0].category).bgColor
            ]"
          ></span>
        </template>

        <div :class="[
          'absolute bottom-full mb-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 bg-white rounded-lg shadow-xl text-[11px] font-bold text-slate-800 transition-all transform origin-bottom',
          activeItemId === cluster[0].id ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'
        ]">
          {{ cluster[0].priceDisplay ? cluster[0].priceDisplay : cluster[0].title }}
          <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white"></div>
        </div>

        <template v-if="cluster[0].category === 'CAMPAIGN'">
          <div :class="[
            'relative w-10 h-10 rounded-full border-2 overflow-hidden shadow-lg transition-colors bg-white',
            activeItemId === cluster[0].id 
              ? `${getMarkerStyle(cluster[0].type, cluster[0].category).borderColor} ring-4 ${getMarkerStyle(cluster[0].type, cluster[0].category).ringColor}` 
              : 'border-white'
          ]">
            <div class="w-full h-full bg-slate-50 flex items-center justify-center p-1">
              <img :src="cluster[0].avatarUrl" alt="" class="w-full h-full object-contain rounded-md" />
            </div>
            <div :class="[
              'absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center',
              getMarkerStyle(cluster[0].type, cluster[0].category).badgeColor
            ]">
              <Briefcase class="w-3 h-3 text-white" />
            </div>
          </div>
        </template>
        <template v-else>
          <div :class="[
            'relative w-10 h-10 rounded-full border-2 overflow-hidden shadow-lg transition-colors bg-white',
            activeItemId === cluster[0].id 
              ? `${getMarkerStyle(cluster[0].type, cluster[0].category).borderColor} ring-4 ${getMarkerStyle(cluster[0].type, cluster[0].category).ringColor}` 
              : 'border-white'
          ]">
            <img :src="cluster[0].avatarUrl" alt="" class="w-full h-full object-cover" />
            <div :class="[
              'absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center',
              getMarkerStyle(cluster[0].type, cluster[0].category).badgeColor
            ]">
              <Crown v-if="cluster[0].category === 'CREATOR'" class="w-3 h-3 text-white" />
              <Users v-else-if="cluster[0].type === 'MEETUP'" class="w-3 h-3 text-white" />
              <Camera v-else class="w-3 h-3 text-white" />
            </div>
          </div>
        </template>

        <div :class="[
          'absolute top-full left-1/2 -translate-x-1/2 w-0.5 bg-slate-800/40 rounded-full',
          activeItemId === cluster[0].id ? 'h-4' : 'h-2'
        ]"></div>
      </button>

      <button
        v-else
        @click="handleZoom(0.5)"
        :style="{ top: `${cluster.reduce((sum, p) => sum + p.y, 0) / cluster.length}%`, left: `${cluster.reduce((sum, p) => sum + p.x, 0) / cluster.length}%` }"
        class="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 transition-transform hover:scale-110 active:scale-95"
      >
         <div class="relative">
            <div class="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-lg border-4 border-white shadow-xl">
               {{ cluster.length }}
            </div>
            <div class="absolute -inset-1 border border-slate-800/20 rounded-full -z-10"></div>
            <div class="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-primary-500 flex items-center justify-center text-[8px] font-bold text-white">+</div>
         </div>
      </button>
    </template>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { Plus, Minus, Download, Check, Loader2, WifiOff, Briefcase, Crown, Layers, Users, Camera } from 'lucide-vue-next'

const BASE_LAT = 35.6580
const BASE_LNG = 139.7016
const BASE_ZOOM_SCALE = 800

export default {
  name: 'InteractiveMap',
  components: {
    Plus,
    Minus,
    Download,
    Check,
    Loader2,
    WifiOff,
    Briefcase,
    Crown,
    Layers,
    Users,
    Camera
  },
  props: {
    activeItemId: {
      type: String,
      default: null
    },
    items: {
      type: Array,
      required: true
    },
    cityName: {
      type: String,
      default: 'Current Area'
    }
  },
  emits: ['item-select'],
  setup(props, { emit }) {
    const zoom = ref(1)
    const isOfflineReady = ref(false)
    const isDownloading = ref(false)
    const showFilters = ref(false)
    const visibleCategories = ref({
      CREATOR: true,
      CAMPAIGN: true,
      MEETUP: true,
      SESSION: true
    })

    const getRawPosition = (lat, lng, scale) => {
      const y = 50 - (lat - BASE_LAT) * scale
      const x = 50 + (lng - BASE_LNG) * scale
      return { x, y }
    }

    const visibleItems = computed(() => {
      return props.items.filter(item => {
        if (item.category === 'CREATOR') return visibleCategories.value.CREATOR
        if (item.category === 'CAMPAIGN') return visibleCategories.value.CAMPAIGN
        if (item.category === 'OFFER') {
          if (item.type === 'MEETUP') return visibleCategories.value.MEETUP
          return visibleCategories.value.SESSION
        }
        return true
      })
    })

    const clusters = computed(() => {
      const currentScale = BASE_ZOOM_SCALE * zoom.value
      
      const projectedItems = visibleItems.value.map(item => {
        const { x, y } = getRawPosition(item.coords[0], item.coords[1], currentScale)
        return { ...item, x, y }
      })

      const result = []
      const processed = new Set()

      projectedItems.forEach(current => {
        if (processed.has(current.id)) return

        const cluster = [current]
        processed.add(current.id)

        projectedItems.forEach(candidate => {
          if (processed.has(candidate.id)) return

          const dist = Math.sqrt(
            Math.pow(current.x - candidate.x, 2) + 
            Math.pow(current.y - candidate.y, 2)
          )

          if (dist < 8) {
            cluster.push(candidate)
            processed.add(candidate.id)
          }
        })

        result.push(cluster)
      })

      return result
    })

    const handleZoom = (delta) => {
      zoom.value = Math.max(0.5, Math.min(3, zoom.value + delta))
    }

    const handleDownloadMap = () => {
      if (isOfflineReady.value) return
      isDownloading.value = true
      setTimeout(() => {
        isDownloading.value = false
        isOfflineReady.value = true
      }, 2500)
    }

    const toggleCategory = (category) => {
      visibleCategories.value[category] = !visibleCategories.value[category]
    }

    const getMarkerStyle = (type, category) => {
      switch (category) {
        case 'CAMPAIGN':
          return {
            borderColor: 'border-orange-500',
            bgColor: 'bg-orange-500',
            ringColor: 'ring-orange-500/20',
            badgeColor: 'bg-orange-500',
            icon: Briefcase
          }
        case 'CREATOR':
          return {
            borderColor: 'border-purple-500',
            bgColor: 'bg-purple-500',
            ringColor: 'ring-purple-500/20',
            badgeColor: 'bg-purple-500',
            icon: Crown
          }
        case 'OFFER':
          if (type === 'MEETUP') {
            return {
              borderColor: 'border-white',
              bgColor: 'bg-accent-500',
              ringColor: 'ring-accent-500/20',
              badgeColor: 'bg-accent-500',
              icon: Users
            }
          } else {
            return {
              borderColor: 'border-primary-500',
              bgColor: 'bg-primary-500',
              ringColor: 'ring-primary-500/20',
              badgeColor: 'bg-primary-500',
              icon: Camera
            }
          }
        default:
          return {
            borderColor: 'border-slate-500',
            bgColor: 'bg-slate-500',
            ringColor: 'ring-slate-500/20',
            badgeColor: 'bg-slate-500',
            icon: null
          }
      }
    }

    const onItemSelect = (id) => {
      emit('item-select', id)
    }

    const handleImageError = (e) => {
      e.target.src = 'https://picsum.photos/1200/800?grayscale&blur=2'
    }

    return {
      zoom,
      isOfflineReady,
      isDownloading,
      showFilters,
      visibleCategories,
      visibleItems,
      clusters,
      handleZoom,
      handleDownloadMap,
      toggleCategory,
      getMarkerStyle,
      onItemSelect,
      handleImageError
    }
  }
}
</script>


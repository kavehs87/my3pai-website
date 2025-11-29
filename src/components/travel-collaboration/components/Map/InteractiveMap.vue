<template>
  <div class="relative w-full h-full overflow-hidden bg-slate-100 group select-none">
    <!-- Google Maps Container -->
    <div ref="mapEl" class="absolute inset-0 w-full h-full"></div>
    
    <div v-if="loadError" class="absolute inset-0 flex items-center justify-center bg-slate-100 z-50">
      <div class="text-center p-4">
        <div class="text-red-500 mb-2">⚠️</div>
        <p class="text-sm text-slate-600">Google Maps failed to load. Please check your API key configuration.</p>
      </div>
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

      <button @click="handleZoomIn" class="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 text-slate-700">
        <Plus class="w-5 h-5" />
      </button>
      <button @click="handleZoomOut" class="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 text-slate-700">
        <Minus class="w-5 h-5" />
      </button>
    </div>

    <!-- Markers are rendered via Google Maps API -->
  </div>
</template>

<script>
import { Plus, Minus, Download, Check, Loader2, WifiOff, Briefcase, Crown, Layers, Users, Camera } from 'lucide-vue-next'

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
  beforeCreate() {
    // Store map instance non-reactively to avoid Vue Proxy issues
    this.map = null
    this.markers = []
    this.AdvancedMarkerElement = null
  },
  data() {
    return {
      isOfflineReady: false,
      isDownloading: false,
      showFilters: false,
      loadError: false,
      visibleCategories: {
        CREATOR: true,
        CAMPAIGN: true,
        MEETUP: true,
        SESSION: true
      }
    }
  },
  computed: {
    visibleItems() {
      return this.items.filter(item => {
        if (item.category === 'CREATOR') return this.visibleCategories.CREATOR
        if (item.category === 'CAMPAIGN') return this.visibleCategories.CAMPAIGN
        if (item.category === 'OFFER') {
          if (item.type === 'MEETUP') return this.visibleCategories.MEETUP
          return this.visibleCategories.SESSION
        }
        return true
      })
    }
  },
  watch: {
    visibleItems: {
      handler() {
        this.updateMarkers()
      },
      deep: true
    },
    activeItemId() {
      this.updateMarkers()
    }
  },
  mounted() {
    this.initGoogleMaps()
  },
  beforeUnmount() {
    this.clearMarkers()
  },
  methods: {
    initGoogleMaps() {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.Map) {
        this.createMap()
        return
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        this.loadError = true
        return
      }

      // Load Google Maps script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=marker`
      script.async = true
      script.defer = true
      script.onload = () => this.createMap()
      script.onerror = () => { this.loadError = true }
      document.head.appendChild(script)
    },

    createMap() {
      try {
        if (!window.google?.maps) {
          this.loadError = true
          return
        }

        // Calculate center from items or use default
        let center = { lat: 35.6580, lng: 139.7016 }
        if (this.visibleItems.length > 0) {
          const lats = this.visibleItems.map(item => item.coords[0])
          const lngs = this.visibleItems.map(item => item.coords[1])
          center = {
            lat: (Math.min(...lats) + Math.max(...lats)) / 2,
            lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
          }
        }

        const mapId = import.meta.env.VITE_GOOGLE_MAP_ID || null
        const options = {
          center,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false,
          disableDefaultUI: true
        }
        if (mapId) options.mapId = mapId

        this.map = new window.google.maps.Map(this.$refs.mapEl, options)

        // Check for Advanced Markers
        const useAdvanced = import.meta.env.VITE_USE_ADVANCED_MARKERS === 'true'
        this.AdvancedMarkerElement = (useAdvanced && mapId && window.google?.maps?.marker?.AdvancedMarkerElement) 
          ? window.google.maps.marker.AdvancedMarkerElement 
          : null

        // Wait for map to be ready
        window.google.maps.event.addListenerOnce(this.map, 'idle', () => {
          this.updateMarkers()
        })

        // Fit bounds to show all markers
        this.fitBounds()
      } catch (e) {
        console.error('Google Maps init failed', e)
        this.loadError = true
      }
    },

    createMarkerElement(item) {
      const style = this.getMarkerStyle(item.type, item.category)
      const wrapper = document.createElement('div')
      wrapper.className = 'relative cursor-pointer transform transition-all duration-300'
      if (this.activeItemId === item.id) {
        wrapper.classList.add('scale-125', 'z-50')
      }

      // Create marker content
      const markerDiv = document.createElement('div')
      markerDiv.className = `relative w-10 h-10 rounded-full border-2 overflow-hidden shadow-lg transition-colors bg-white ${
        this.activeItemId === item.id 
          ? `${style.borderColor} ring-4 ${style.ringColor}` 
          : 'border-white'
      }`

      if (item.category === 'CAMPAIGN') {
        const inner = document.createElement('div')
        inner.className = 'w-full h-full bg-slate-50 flex items-center justify-center p-1'
        const img = document.createElement('img')
        img.src = item.avatarUrl
        img.alt = ''
        img.className = 'w-full h-full object-contain rounded-md'
        inner.appendChild(img)
        markerDiv.appendChild(inner)
      } else {
        const img = document.createElement('img')
        img.src = item.avatarUrl
        img.alt = ''
        img.className = 'w-full h-full object-cover'
        markerDiv.appendChild(img)
      }

      // Badge
      const badge = document.createElement('div')
      badge.className = `absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${style.badgeColor}`
      
      const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      iconSvg.setAttribute('width', '12')
      iconSvg.setAttribute('height', '12')
      iconSvg.setAttribute('viewBox', '0 0 24 24')
      iconSvg.setAttribute('fill', 'none')
      iconSvg.setAttribute('stroke', 'white')
      iconSvg.setAttribute('stroke-width', '2')
      iconSvg.setAttribute('stroke-linecap', 'round')
      iconSvg.setAttribute('stroke-linejoin', 'round')
      iconSvg.innerHTML = this.getIconPath(item.category, item.type)
      badge.appendChild(iconSvg)
      markerDiv.appendChild(badge)

      // Pin tail
      const tail = document.createElement('div')
      tail.className = `absolute top-full left-1/2 -translate-x-1/2 w-0.5 bg-slate-800/40 rounded-full ${
        this.activeItemId === item.id ? 'h-4' : 'h-2'
      }`
      markerDiv.appendChild(tail)

      wrapper.appendChild(markerDiv)

      // Tooltip
      if (item.priceDisplay || item.title) {
        const tooltip = document.createElement('div')
        tooltip.className = `absolute bottom-full mb-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 bg-white rounded-lg shadow-xl text-[11px] font-bold text-slate-800 transition-all transform origin-bottom pointer-events-none ${
          this.activeItemId === item.id 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-75 translate-y-2'
        }`
        tooltip.textContent = item.priceDisplay || item.title
        const arrow = document.createElement('div')
        arrow.className = 'absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white'
        tooltip.appendChild(arrow)
        wrapper.appendChild(tooltip)

        // Show tooltip on hover
        wrapper.addEventListener('mouseenter', () => {
          tooltip.classList.remove('opacity-0', 'scale-75', 'translate-y-2')
          tooltip.classList.add('opacity-100', 'scale-100', 'translate-y-0')
        })
        wrapper.addEventListener('mouseleave', () => {
          if (this.activeItemId !== item.id) {
            tooltip.classList.remove('opacity-100', 'scale-100', 'translate-y-0')
            tooltip.classList.add('opacity-0', 'scale-75', 'translate-y-2')
          }
        })
      }

      // Active state rings
      if (this.activeItemId === item.id) {
        const ping = document.createElement('span')
        ping.className = `absolute inset-0 -m-2 rounded-full opacity-40 animate-ping ${style.bgColor}`
        wrapper.appendChild(ping)
        const pulse = document.createElement('span')
        pulse.className = `absolute inset-0 -m-1 rounded-full opacity-20 animate-pulse ${style.bgColor}`
        wrapper.appendChild(pulse)
      }

      return wrapper
    },

    getIconPath(category, type) {
      // Lucide icon SVG paths
      if (category === 'CAMPAIGN') {
        // Briefcase icon
        return '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect x="4" y="6" width="16" height="14" rx="2"/>'
      } else if (category === 'CREATOR') {
        // Crown icon (simplified)
        return '<path d="M12 6l-2 4 2-1 2 1-2-4z"/><path d="M5 14l2-6 2 6"/><path d="M19 14l-2-6-2 6"/><path d="M3 20h18"/><path d="M4 16h16"/>'
      } else if (type === 'MEETUP') {
        // Users icon
        return '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
      } else {
        // Camera icon
        return '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>'
      }
    },

    updateMarkers() {
      if (!this.map || !window.google?.maps) return

      this.clearMarkers()

      this.visibleItems.forEach(item => {
        const position = {
          lat: item.coords[0],
          lng: item.coords[1]
        }

        if (this.AdvancedMarkerElement) {
          // Use Advanced Markers
          const markerElement = this.createMarkerElement(item)
          const marker = new this.AdvancedMarkerElement({
            map: this.map,
            position,
            content: markerElement,
            title: item.title || item.priceDisplay || 'Marker'
          })

          markerElement.addEventListener('click', () => {
            this.$emit('item-select', item.id)
          })

          this.markers.push(marker)
        } else {
          // Fallback to standard markers
          const markerElement = this.createMarkerElement(item)
          const iconSvg = this.createStandardMarkerIcon(item)
          
          const marker = new window.google.maps.Marker({
            map: this.map,
            position,
            icon: iconSvg,
            title: item.title || item.priceDisplay || 'Marker',
            optimized: false
          })

          marker.addListener('click', () => {
            this.$emit('item-select', item.id)
          })

          this.markers.push(marker)
        }
      })

      this.fitBounds()
    },

    createStandardMarkerIcon(item) {
      const style = this.getMarkerStyle(item.type, item.category)
      const size = 40
      const iconSvg = `
        <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="white" stroke="${this.getColorFromClass(style.borderColor)}" stroke-width="2"/>
          <image href="${item.avatarUrl}" x="4" y="4" width="32" height="32" clip-path="circle(16px at center)"/>
        </svg>
      `
      return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(iconSvg),
        scaledSize: new window.google.maps.Size(size, size),
        anchor: new window.google.maps.Point(size / 2, size / 2)
      }
    },

    getColorFromClass(className) {
      const colorMap = {
        'border-orange-500': '#f97316',
        'border-purple-500': '#8b5cf6',
        'border-primary-500': '#6366f1',
        'border-accent-500': '#10b981'
      }
      return colorMap[className] || '#64748b'
    },

    clearMarkers() {
      this.markers.forEach(marker => {
        if (marker.setMap) marker.setMap(null)
      })
      this.markers = []
    },

    fitBounds() {
      if (!this.map || !window.google?.maps || this.visibleItems.length === 0) return

      const bounds = new window.google.maps.LatLngBounds()
      this.visibleItems.forEach(item => {
        bounds.extend({
          lat: item.coords[0],
          lng: item.coords[1]
        })
      })
      this.map.fitBounds(bounds)
    },

    handleZoomIn() {
      if (this.map) {
        const currentZoom = this.map.getZoom()
        this.map.setZoom(currentZoom + 1)
      }
    },

    handleZoomOut() {
      if (this.map) {
        const currentZoom = this.map.getZoom()
        this.map.setZoom(currentZoom - 1)
      }
    },

    handleDownloadMap() {
      if (this.isOfflineReady) return
      this.isDownloading = true
      setTimeout(() => {
        this.isDownloading = false
        this.isOfflineReady = true
      }, 2500)
    },

    toggleCategory(category) {
      this.visibleCategories[category] = !this.visibleCategories[category]
    },

    getMarkerStyle(type, category) {
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
  }
}
</script>


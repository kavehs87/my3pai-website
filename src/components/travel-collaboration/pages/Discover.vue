<template>
  <div class="flex h-[calc(100vh-64px)] overflow-hidden">
    
    <!-- Sidebar List -->
    <div :class="[
      'flex-col bg-white border-r border-slate-200 w-full md:w-[450px] lg:w-[500px] z-10 shadow-xl md:shadow-none transition-all duration-300 absolute md:relative h-full',
      viewMode === 'map' ? 'translate-y-full md:translate-y-0 opacity-0 md:opacity-100' : 'translate-y-0 opacity-100'
    ]">
      
      <!-- List Header & Filters -->
      <div class="p-4 border-b border-slate-100 bg-white/95 backdrop-blur z-20 sticky top-0 space-y-4">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Good morning, Alex.</h1>
          <p class="text-sm text-slate-500">
             {{ filteredItems.length }} opportunities active in <span class="text-primary-600 font-medium">{{ activeTrip?.destination.city }}</span>.
          </p>
        </div>

        <!-- Search Input -->
        <div class="relative">
           <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search map results..."
             class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
             v-model="searchQuery"
           />
        </div>

        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           <button
             v-for="f in filterOptions"
             :key="f.id"
             @click="filterType = f.id"
             :class="[
               'px-3 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap',
               filterType === f.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
             ]"
           >
             {{ f.label }}
           </button>
        </div>
      </div>

      <!-- Scrollable List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 pb-24 md:pb-4">
        <template v-if="filteredItems.length > 0">
           <template v-for="item in filteredItems" :key="item.id">
             <div 
               v-if="item.category === 'OFFER'"
               :class="[
                 activeItemId === item.id ? 'ring-2 ring-primary-500 rounded-2xl' : ''
               ]"
               @mouseenter="setActiveItemId(item.id)"
               @mouseleave="setActiveItemId(null)"
             >
               <OfferCard 
                 :offer="item.originalData" 
                 :active="activeItemId === item.id"
                 @hover="setActiveItemId(item.id)"
                 @leave="setActiveItemId(null)"
               />
             </div>
             <div 
               v-else-if="item.category === 'CREATOR'"
               :class="[
                 activeItemId === item.id ? 'ring-2 ring-purple-500 rounded-2xl' : ''
               ]"
               @mouseenter="setActiveItemId(item.id)"
               @mouseleave="setActiveItemId(null)"
             >
               <CreatorCard :creator="item.originalData" />
             </div>
             <div 
               v-else-if="item.category === 'CAMPAIGN'"
               :class="[
                 activeItemId === item.id ? 'ring-2 ring-orange-500 rounded-2xl' : ''
               ]"
               @mouseenter="setActiveItemId(item.id)"
               @mouseleave="setActiveItemId(null)"
             >
               <CampaignCard :campaign="item.originalData" />
             </div>
           </template>
        </template>
        <div v-else class="text-center py-12 text-slate-400 text-sm">
          <Search class="w-8 h-8 mx-auto mb-2 opacity-50" />
          No results found
        </div>
        
        <div v-if="filteredItems.length > 0" class="text-center py-8 text-slate-400 text-sm">
          End of results in {{ activeTrip?.destination.city }}
        </div>
      </div>
    </div>

    <!-- Map Area -->
    <div class="flex-1 relative h-full bg-slate-100">
      <InteractiveMap 
        :items="filteredItems"
        :active-item-id="activeItemId"
        :city-name="activeTrip?.destination.city"
        @item-select="setActiveItemId"
      />

      <!-- Mobile Toggle Button -->
      <div class="md:hidden absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex gap-2 bg-white/90 backdrop-blur border border-slate-200 p-1 rounded-full shadow-lg">
         <button 
           @click="viewMode = 'list'"
           :class="[
             'px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2',
             viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-600'
           ]"
         >
           <List class="w-4 h-4" /> List
         </button>
         <button 
           @click="viewMode = 'map'"
           :class="[
             'px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2',
             viewMode === 'map' ? 'bg-slate-900 text-white' : 'text-slate-600'
           ]"
         >
           <MapIcon class="w-4 h-4" /> Map
         </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { List, Map as MapIcon, Search } from 'lucide-vue-next'
import { useTrip } from '@/composables/useTrip'
import { MOCK_OFFERS, MOCK_CREATORS, MOCK_CAMPAIGNS } from '@/data/travelCollaboration/constants.js'
import InteractiveMap from '../components/Map/InteractiveMap.vue'
import OfferCard from '../components/Cards/OfferCard.vue'
import CreatorCard from '../components/Cards/CreatorCard.vue'
import CampaignCard from '../components/Cards/CampaignCard.vue'

export default {
  name: 'Discover',
  components: {
    List,
    MapIcon,
    Search,
    InteractiveMap,
    OfferCard,
    CreatorCard,
    CampaignCard
  },
  setup() {
    const { activeTrip } = useTrip()
    const activeItemId = ref(null)
    const viewMode = ref('both')
    const filterType = ref('ALL')
    const searchQuery = ref('')

    const filterOptions = [
      { id: 'ALL', label: 'All Activity' },
      { id: 'MEETUP', label: 'Meetups' },
      { id: 'INFLUENCER', label: 'Influencers' },
      { id: 'BUSINESS', label: 'Business Ads' },
      { id: 'SESSION', label: 'Sessions' },
    ]

    const allMapItems = computed(() => {
      const offers = MOCK_OFFERS.map(o => ({
        id: o.id,
        category: 'OFFER',
        type: o.type,
        coords: o.coords,
        title: o.title,
        avatarUrl: o.user.avatarUrl || '',
        priceDisplay: o.price.amount > 0 ? `$${o.price.amount}` : 'Free',
        originalData: o
      }))

      const creators = MOCK_CREATORS.map(c => ({
        id: c.id,
        category: 'CREATOR',
        type: 'INFLUENCER',
        coords: c.coords,
        title: c.name,
        avatarUrl: c.avatarUrl,
        priceDisplay: c.metrics.followers,
        originalData: c
      }))

      const campaigns = MOCK_CAMPAIGNS.map(c => ({
        id: c.id,
        category: 'CAMPAIGN',
        type: 'ADVERTISEMENT',
        coords: c.coords,
        title: c.brand.name,
        avatarUrl: c.brand.logoUrl,
        priceDisplay: 'Perks',
        originalData: c
      }))

      return [...offers, ...creators, ...campaigns]
    })

    const filteredItems = computed(() => {
      return allMapItems.value.filter(item => {
        if (filterType.value !== 'ALL') {
          if (filterType.value === 'INFLUENCER' && item.category !== 'CREATOR') return false
          if (filterType.value === 'BUSINESS' && item.category !== 'CAMPAIGN') return false
          if (['SESSION', 'MEETUP', 'SERVICE'].includes(filterType.value) && item.type !== filterType.value) return false
        }

        if (searchQuery.value) {
          const q = searchQuery.value.toLowerCase()
          const matches = item.title.toLowerCase().includes(q)
          if (!matches) return false
        }

        return true
      })
    })

    const setActiveItemId = (id) => {
      activeItemId.value = id
    }

    return {
      activeTrip,
      activeItemId,
      viewMode,
      filterType,
      searchQuery,
      filterOptions,
      filteredItems,
      setActiveItemId
    }
  }
}
</script>


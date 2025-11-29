<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full overflow-y-auto">
    
    <!-- Header -->
    <div class="mb-8 relative">
      <div class="flex items-center gap-3 mb-2">
         <div class="p-2 bg-orange-100 text-orange-600 rounded-lg">
           <Briefcase class="w-6 h-6" />
         </div>
         <span class="font-bold text-orange-600 uppercase tracking-wider text-xs">For Business & Creators</span>
      </div>
      <h1 class="text-3xl font-bold text-slate-900 mb-2">Brand Campaigns</h1>
      <p class="text-slate-500 max-w-2xl">
        Apply for exclusive opportunities from top travel brands. Exchange your reach for free stays, dining experiences, and paid sponsorships.
      </p>
    </div>

    <!-- Filters Toolbar -->
    <div class="flex flex-col md:flex-row gap-4 mb-8 sticky top-0 bg-slate-50 z-20 py-2">
      <!-- Search -->
      <div class="flex-1 relative min-w-[200px]">
         <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
         <input 
           type="text" 
           placeholder="Search hotels, restaurants, perks..." 
           class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white shadow-sm"
           v-model="searchQuery"
         />
         <button 
           v-if="searchQuery"
           @click="searchQuery = ''"
           class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
         >
           <X class="w-4 h-4" />
         </button>
      </div>
      
      <!-- Dropdowns & Date Picker -->
      <div class="flex flex-wrap gap-2 items-center">
        
        <!-- Date Range Inputs -->
        <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm min-w-fit">
          <Calendar class="w-4 h-4 text-slate-400" />
          <input 
            type="date" 
            class="text-sm font-medium text-slate-700 bg-transparent focus:outline-none w-[110px]"
            v-model="startDate"
            placeholder="Start"
          />
          <span class="text-slate-300">-</span>
          <input 
            type="date" 
            class="text-sm font-medium text-slate-700 bg-transparent focus:outline-none w-[110px]"
            v-model="endDate"
            placeholder="End"
          />
        </div>

        <div class="relative min-w-[160px]">
          <select 
            class="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
            v-model="platformFilter"
          >
            <option value="ALL">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="YouTube">YouTube</option>
          </select>
          <Filter class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        <div class="relative min-w-[180px]">
          <select 
            class="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
            v-model="followerFilter"
          >
            <option value="ALL">Any Follower Count</option>
            <option value="10000">I have &lt; 10k</option>
            <option value="50000">I have &lt; 50k</option>
            <option value="100000">I have &lt; 100k</option>
            <option value="1000000">I have 1M+</option>
          </select>
          <Filter class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        <button 
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors whitespace-nowrap"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
      <template v-if="filteredCampaigns.length > 0">
        <CampaignCard 
          v-for="campaign in filteredCampaigns" 
          :key="campaign.id" 
          :campaign="campaign" 
        />
      </template>
      <div v-else class="col-span-full py-16 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4 text-slate-300">
           <Briefcase class="w-8 h-8" />
        </div>
        <h3 class="text-lg font-bold text-slate-900">No campaigns found</h3>
        <p class="text-slate-500 max-w-md mx-auto mt-2">
          Try adjusting your date range or filters to see more results.
        </p>
        <button 
          @click="clearFilters"
          class="mt-6 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Clear Filters
        </button>
      </div>
      
      <!-- Call to Action for Business -->
      <div class="col-span-full mt-8 p-8 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-900/10">
         <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2 py-0.5 rounded bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider">Business</span>
              <h3 class="text-xl font-bold">Launch your own Campaign</h3>
            </div>
            <p class="text-slate-400 max-w-lg text-sm md:text-base">
              Connect with verified creators in {{ filteredCampaigns.length > 0 ? filteredCampaigns[0].location : 'your city' }} to boost your brand presence.
            </p>
         </div>
         <button class="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors whitespace-nowrap shadow-lg">
           Post Opportunity
         </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { Briefcase, Search, Filter, X, Calendar } from 'lucide-vue-next'
import { MOCK_CAMPAIGNS } from '@/data/travelCollaboration/constants.js'
import CampaignCard from '../components/Cards/CampaignCard.vue'

export default {
  name: 'Campaigns',
  components: {
    Briefcase,
    Search,
    Filter,
    X,
    Calendar,
    CampaignCard
  },
  setup() {
    const platformFilter = ref('ALL')
    const followerFilter = ref('ALL')
    const searchQuery = ref('')
    const startDate = ref('')
    const endDate = ref('')

    const filteredCampaigns = computed(() => {
      return MOCK_CAMPAIGNS.filter(c => {
        if (searchQuery.value) {
          const q = searchQuery.value.toLowerCase()
          const matches = 
            c.title.toLowerCase().includes(q) || 
            c.brand.name.toLowerCase().includes(q) ||
            c.location.toLowerCase().includes(q)
          if (!matches) return false
        }

        if (platformFilter.value !== 'ALL' && !c.requirements.platforms.includes(platformFilter.value)) {
          return false
        }
        
        if (followerFilter.value !== 'ALL') {
          const userFollowerCount = Number(followerFilter.value)
          if (c.requirements.minFollowers > userFollowerCount) return false
        }

        if (startDate.value) {
          if (c.dates.end < startDate.value) return false
        }
        if (endDate.value) {
          if (c.dates.start > endDate.value) return false
        }
        
        return true
      })
    })

    const hasActiveFilters = computed(() => {
      return platformFilter.value !== 'ALL' || followerFilter.value !== 'ALL' || searchQuery.value !== '' || startDate.value !== '' || endDate.value !== ''
    })

    const clearFilters = () => {
      platformFilter.value = 'ALL'
      followerFilter.value = 'ALL'
      startDate.value = ''
      endDate.value = ''
      searchQuery.value = ''
    }

    return {
      platformFilter,
      followerFilter,
      searchQuery,
      startDate,
      endDate,
      filteredCampaigns,
      hasActiveFilters,
      clearFilters
    }
  }
}
</script>


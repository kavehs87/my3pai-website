<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full overflow-y-auto">
    
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
         <div class="p-2 bg-purple-100 text-purple-600 rounded-lg">
           <Crown class="w-6 h-6" />
         </div>
         <span class="font-bold text-purple-600 uppercase tracking-wider text-xs">Top Creators</span>
      </div>
      <h1 class="text-3xl font-bold text-slate-900 mb-2">Find Influencers</h1>
      <p class="text-slate-500 max-w-2xl">
        Discover and collaborate with top-tier content creators in your area. Request meetups or send business proposals directly.
      </p>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-col xl:flex-row gap-4 mb-8 sticky top-0 bg-slate-50 z-20 py-2">
       
       <!-- Search -->
       <div class="relative flex-1 min-w-[240px]">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search name, handle, tag..." 
            class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm"
            v-model="searchQuery"
          />
       </div>

       <div class="flex flex-wrap gap-2 items-center flex-1">
          <!-- Location (Where) -->
          <div class="relative min-w-[180px] flex-1">
            <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Where? (e.g. Tokyo)" 
              class="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm text-sm"
              v-model="locationFilter"
            />
          </div>

          <!-- Dates (When) -->
          <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm min-w-fit flex-1 xl:flex-none">
            <Calendar class="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input 
              type="date" 
              class="text-sm font-medium text-slate-700 bg-transparent focus:outline-none w-full xl:w-[110px]"
              v-model="startDate"
            />
            <span class="text-slate-300">-</span>
            <input 
              type="date" 
              class="text-sm font-medium text-slate-700 bg-transparent focus:outline-none w-full xl:w-[110px]"
              v-model="endDate"
            />
          </div>

          <!-- Availability Filter -->
          <div class="relative min-w-[160px] flex-1 xl:flex-none">
              <select 
                class="w-full appearance-none pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm text-sm font-medium"
                v-model="availabilityFilter"
              >
                <option value="ALL">Any Availability</option>
                <option value="AVAILABLE">Available for Collabs</option>
              </select>
              <Clock class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <!-- Niche Filter -->
          <div class="relative min-w-[140px] flex-1 xl:flex-none">
              <select 
                class="w-full appearance-none pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm text-sm font-medium"
                v-model="nicheFilter"
              >
                <option value="ALL">All Niches</option>
                <option value="Travel">Travel</option>
                <option value="Food">Food</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Tech">Tech</option>
                <option value="Fashion">Fashion</option>
              </select>
              <SlidersHorizontal class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <button 
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            title="Clear Filters"
          >
            <X class="w-5 h-5" />
          </button>
       </div>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24 items-start">
      <template v-if="filteredCreators.length > 0">
        <CreatorCard 
          v-for="creator in filteredCreators" 
          :key="creator.id" 
          :creator="creator" 
          @business-click="setSelectedCreator(creator)"
          @hangout-click="setSelectedHangoutCreator(creator)"
        />
      </template>
      <div v-else class="col-span-full py-16 text-center text-slate-400">
        <Search class="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>No influencers found matching your criteria.</p>
        <button @click="clearFilters" class="text-primary-600 font-bold mt-2 hover:underline">Clear Filters</button>
      </div>
    </div>

    <!-- Business Proposal Modal -->
    <Teleport to="body">
      <div v-if="selectedCreator" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          
          <!-- Modal Header -->
          <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
            <div class="flex items-center gap-3">
              <img :src="selectedCreator.avatarUrl" class="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
              <div>
                <h3 class="font-bold text-slate-900 leading-tight">Proposal for {{ selectedCreator.name }}</h3>
                <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Business Collaboration</p>
              </div>
            </div>
            <button 
              @click="selectedCreator = null" 
              class="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Content -->
          <div v-if="proposalSent" class="p-12 flex flex-col items-center text-center justify-center h-full">
            <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
              <CheckCircle class="w-10 h-10" />
            </div>
            <h3 class="text-2xl font-bold text-slate-900 mb-2">Proposal Sent!</h3>
            <p class="text-slate-500 mb-8 max-w-xs">
              We've notified {{ selectedCreator.name }} about your opportunity. You'll receive a response in your inbox soon.
            </p>
          </div>
          <form v-else @submit.prevent="handleSendProposal" class="p-6 space-y-5 overflow-y-auto">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Campaign Title</label>
              <input 
                type="text" 
                placeholder="e.g. Summer Hotel Launch Campaign"
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Details & Concept</label>
              <textarea 
                rows="3"
                placeholder="Describe your brand and what you're looking for..."
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium resize-none"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase mb-1.5">
                  <FileText class="w-3.5 h-3.5" /> Deliverables
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. 1 Reel, 3 Stories"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                />
              </div>
              <div>
                <label class="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase mb-1.5">
                  <Gift class="w-3.5 h-3.5" /> Compensation
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. $500 + 2 Night Stay"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                />
              </div>
            </div>
            
            <div class="pt-2">
              <button 
                type="submit"
                class="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Send class="w-4 h-4" /> Send Proposal
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Hangout Request Modal -->
    <Teleport to="body">
      <div v-if="selectedHangoutCreator" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
          
          <!-- Modal Header -->
          <div class="p-4 border-b border-indigo-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white rounded-full shadow-sm text-indigo-600">
                <Coffee class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-slate-900">Hangout Request</h3>
                <p class="text-xs text-indigo-600 font-medium">with {{ selectedHangoutCreator.name.split(' ')[0] }}</p>
              </div>
            </div>
            <button 
              @click="selectedHangoutCreator = null" 
              class="w-8 h-8 rounded-full bg-white/50 text-slate-500 flex items-center justify-center hover:bg-white transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Content -->
          <div v-if="hangoutSent" class="p-8 flex flex-col items-center text-center justify-center h-full min-h-[300px]">
            <div class="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <CheckCircle class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">Request Sent!</h3>
            <p class="text-sm text-slate-500 mb-6">
              Fingers crossed! If {{ selectedHangoutCreator.name.split(' ')[0] }} is interested, they'll message you back.
            </p>
            <button @click="selectedHangoutCreator = null" class="text-indigo-600 font-bold text-sm hover:underline">Close</button>
          </div>
          <form v-else @submit.prevent="handleSendHangout" class="p-5 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Activity Vibe</label>
              <select class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white">
                <option>Coffee & Chat</option>
                <option>Photo Walk</option>
                <option>Food / Lunch</option>
                <option>Explore the City</option>
                <option>Nightlife / Drinks</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">When?</label>
              <input 
                type="datetime-local" 
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Personal Message</label>
              <textarea 
                rows="3"
                :placeholder="`Hi ${selectedHangoutCreator.name.split(' ')[0]}! I love your content about...`"
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium resize-none"
              ></textarea>
            </div>
            
            <div class="pt-2">
              <button 
                type="submit"
                class="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 shadow-indigo-200"
              >
                <Send class="w-4 h-4" /> Send Request
              </button>
              <p class="text-center text-[10px] text-slate-400 mt-3">
                Friendly reminder: This is for casual networking & fun.
              </p>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { Search, Crown, SlidersHorizontal, MapPin, Calendar, X, CheckCircle, Send, FileText, Gift, Coffee, Clock } from 'lucide-vue-next'
import { MOCK_CREATORS } from '@/data/travelCollaboration/constants.js'
import CreatorCard from '../components/Cards/CreatorCard.vue'

export default {
  name: 'Influencers',
  components: {
    Search,
    Crown,
    SlidersHorizontal,
    MapPin,
    Calendar,
    X,
    CheckCircle,
    Send,
    FileText,
    Gift,
    Coffee,
    Clock,
    CreatorCard
  },
  setup() {
    const searchQuery = ref('')
    const nicheFilter = ref('ALL')
    const locationFilter = ref('')
    const availabilityFilter = ref('ALL')
    const startDate = ref('')
    const endDate = ref('')
    const selectedCreator = ref(null)
    const proposalSent = ref(false)
    const selectedHangoutCreator = ref(null)
    const hangoutSent = ref(false)

    const filteredCreators = computed(() => {
      return MOCK_CREATORS.filter(c => {
        if (searchQuery.value) {
          const q = searchQuery.value.toLowerCase()
          const matches = 
            c.name.toLowerCase().includes(q) || 
            c.handle.toLowerCase().includes(q) ||
            c.tags.some(t => t.toLowerCase().includes(q))
          if (!matches) return false
        }

        if (nicheFilter.value !== 'ALL') {
          if (!c.tags.includes(nicheFilter.value)) return false
        }

        if (locationFilter.value) {
          if (!c.location.toLowerCase().includes(locationFilter.value.toLowerCase())) return false
        }

        if (availabilityFilter.value === 'AVAILABLE') {
          if (c.availability.status !== 'AVAILABLE') return false
        }

        return true
      })
    })

    const hasActiveFilters = computed(() => {
      return searchQuery.value || nicheFilter.value !== 'ALL' || locationFilter.value || availabilityFilter.value !== 'ALL' || startDate.value || endDate.value
    })

    const clearFilters = () => {
      searchQuery.value = ''
      nicheFilter.value = 'ALL'
      locationFilter.value = ''
      availabilityFilter.value = 'ALL'
      startDate.value = ''
      endDate.value = ''
    }

    const handleSendProposal = (e) => {
      e.preventDefault()
      proposalSent.value = true
      setTimeout(() => {
        proposalSent.value = false
        selectedCreator.value = null
      }, 2500)
    }

    const handleSendHangout = (e) => {
      e.preventDefault()
      hangoutSent.value = true
      setTimeout(() => {
        hangoutSent.value = false
        selectedHangoutCreator.value = null
      }, 2500)
    }

    const setSelectedCreator = (creator) => {
      selectedCreator.value = creator
    }

    const setSelectedHangoutCreator = (creator) => {
      selectedHangoutCreator.value = creator
    }

    return {
      searchQuery,
      nicheFilter,
      locationFilter,
      availabilityFilter,
      startDate,
      endDate,
      selectedCreator,
      proposalSent,
      selectedHangoutCreator,
      hangoutSent,
      filteredCreators,
      hasActiveFilters,
      clearFilters,
      handleSendProposal,
      handleSendHangout,
      setSelectedCreator,
      setSelectedHangoutCreator
    }
  }
}
</script>


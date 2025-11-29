<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full overflow-y-auto">
    
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
         <div class="p-2 bg-blue-100 text-blue-600 rounded-lg">
           <Presentation class="w-6 h-6" />
         </div>
         <span class="font-bold text-blue-600 uppercase tracking-wider text-xs">Workshops & Activities</span>
      </div>
      <h1 class="text-2xl font-bold text-slate-900 mb-2">Explore Sessions</h1>
      <p class="text-slate-500 max-w-2xl">
        Discover workshops and creative sessions organized by fellow travelers and locals. Join yoga sessions, photography classes, cooking workshops, and more.
      </p>
      
      <div class="mt-6 flex flex-col gap-4">
        <div class="flex flex-col md:flex-row gap-4 items-center">
          <!-- Search Input -->
          <div class="relative flex-1 w-full">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
              type="text" 
              placeholder="Search for yoga, photography, workshops..." 
              class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm transition-shadow"
              v-model="searchQuery"
              />
          </div>

          <!-- Filters & Sort -->
          <div class="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <!-- Rating Filter -->
              <div class="relative group">
                  <select 
                  class="appearance-none pl-9 pr-8 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer text-sm font-medium min-w-[140px]"
                  v-model="minRating"
                  >
                  <option :value="0">Any Rating</option>
                  <option :value="4.5">4.5+ Stars</option>
                  <option :value="4.8">4.8+ Stars</option>
                  <option :value="5">5.0 Stars</option>
                  </select>
                  <Star class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 fill-current" />
              </div>

              <!-- Sort Dropdown -->
              <div class="relative">
                  <select 
                  class="appearance-none pl-9 pr-8 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer text-sm font-medium min-w-[160px]"
                  v-model="sortBy"
                  >
                  <option value="relevant">Most Relevant</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Rated</option>
                  </select>
                  <SlidersHorizontal class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
          </div>
        </div>

        <!-- Popular Categories -->
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           <button
              v-for="cat in categories"
              :key="cat"
              @click="selectedCategory = cat"
              :class="[
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border',
                selectedCategory === cat 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              ]"
           >
              {{ cat }}
           </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
      <template v-if="filteredAndSortedOffers.length > 0">
        <OfferCard 
          v-for="offer in filteredAndSortedOffers" 
          :key="offer.id" 
          :offer="offer" 
        />
      </template>
      <div v-else class="col-span-full py-20 text-center">
        <div class="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
           <Search class="w-8 h-8 text-slate-400" />
        </div>
        <h3 class="text-lg font-semibold text-slate-900">No sessions found</h3>
        <p class="text-slate-500">Try adjusting your category filter or search terms.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { Search, Star, SlidersHorizontal, Presentation } from 'lucide-vue-next'
import { MOCK_OFFERS } from '@/data/travelCollaboration/constants.js'
import OfferCard from '../components/Cards/OfferCard.vue'

export default {
  name: 'Sessions',
  components: {
    Search,
    Star,
    SlidersHorizontal,
    Presentation,
    OfferCard
  },
  setup() {
    const searchQuery = ref('')
    const sortBy = ref('relevant')
    const minRating = ref(0)
    const selectedCategory = ref('All')

    const categories = ['All', 'Photography', 'Wellness', 'Food', 'Art', 'Outdoor']

    const filteredAndSortedOffers = computed(() => {
      let result = MOCK_OFFERS.filter(o => o.type !== 'MEETUP')

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(o => 
          o.title.toLowerCase().includes(q) || 
          o.description.toLowerCase().includes(q) ||
          o.user.name?.toLowerCase().includes(q)
        )
      }

      if (selectedCategory.value !== 'All') {
          const cat = selectedCategory.value.toLowerCase()
          result = result.filter(o => 
              o.title.toLowerCase().includes(cat) || 
              o.description.toLowerCase().includes(cat) ||
              (cat === 'wellness' && o.title.toLowerCase().includes('yoga')) ||
              (cat === 'art' && (o.title.toLowerCase().includes('pottery') || o.title.toLowerCase().includes('calligraphy')))
          )
      }

      if (minRating.value > 0) {
        result = result.filter(o => (o.user.stats?.rating || 0) >= minRating.value)
      }

      if (sortBy.value === 'price_asc') {
        result.sort((a, b) => a.price.amount - b.price.amount)
      } else if (sortBy.value === 'price_desc') {
        result.sort((a, b) => b.price.amount - a.price.amount)
      } else if (sortBy.value === 'rating_desc') {
        result.sort((a, b) => (b.user.stats?.rating || 0) - (a.user.stats?.rating || 0))
      }

      return result
    })

    return {
      searchQuery,
      sortBy,
      minRating,
      selectedCategory,
      categories,
      filteredAndSortedOffers
    }
  }
}
</script>


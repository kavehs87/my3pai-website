<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
    
    <!-- Header & Main Tabs -->
    <div class="flex flex-col md:flex-row items-end md:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 mb-1">
          Meetups & Community
        </h1>
        <div class="flex flex-wrap items-center gap-3">
          <p class="text-slate-500">Find your squad or meet locals in Tokyo.</p>
          <button 
            @click="showHangoutRequestModal = true"
            class="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-200 hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <Plus class="w-3.5 h-3.5" /> Request Hangout
          </button>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="flex bg-slate-100/50 p-1 rounded-xl">
        <button 
          @click="activeTab = 'EXPLORE'"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all',
            activeTab === 'EXPLORE' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
          ]"
        >
          <Grid class="w-4 h-4" /> Explore
        </button>
        <button 
          @click="activeTab = 'MATCH'"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all',
            activeTab === 'MATCH' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
          ]"
        >
          <Sparkles class="w-4 h-4" /> Matchmaking
        </button>
        <button 
          @click="activeTab = 'CALENDAR'"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all',
            activeTab === 'CALENDAR' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
          ]"
        >
          <CalendarIcon class="w-4 h-4" /> Calendar
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="flex-1 overflow-y-auto min-h-0">
      
      <div v-if="activeTab === 'EXPLORE'" class="pb-24 animate-in fade-in duration-300">
        <!-- Filters & Search Toolbar -->
        <div class="flex flex-col lg:flex-row gap-4 mb-8 items-center justify-between sticky top-0 bg-slate-50 z-20 py-2">
          <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
            
            <!-- Segmented Control Type Toggle -->
            <div class="flex items-center p-1 bg-slate-200/60 rounded-xl w-full sm:w-auto">
              <button
                @click="typeFilter = 'ALL'"
                :class="[
                  'flex-1 sm:flex-none px-5 py-1.5 rounded-lg text-sm font-bold transition-all',
                  typeFilter === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                All
              </button>
              <button
                @click="typeFilter = '1:1'"
                :class="[
                  'flex-1 sm:flex-none px-5 py-1.5 rounded-lg text-sm font-bold transition-all',
                  typeFilter === '1:1' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                1-on-1
              </button>
              <button
                @click="typeFilter = 'GROUP'"
                :class="[
                  'flex-1 sm:flex-none px-5 py-1.5 rounded-lg text-sm font-bold transition-all',
                  typeFilter === 'GROUP' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                Groups
              </button>
            </div>
            
            <!-- Cost Filter -->
            <div class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm text-slate-600 w-full sm:w-auto">
              <Filter class="w-4 h-4 text-slate-400" />
              <span class="font-medium whitespace-nowrap">Cost:</span>
              <select
                v-model="priceFilter"
                class="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer w-full py-1"
              >
                <option value="ALL">Any Price</option>
                <option value="PAID">Paid Only</option>
                <option value="FREE">Free (Hangout)</option>
              </select>
            </div>
          </div>

          <!-- Search Input -->
          <div class="relative w-full lg:w-80">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Find hiking buddies, coffee, etc..." 
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white shadow-sm text-sm placeholder:text-slate-400"
              v-model="searchQuery"
            />
          </div>
        </div>

        <!-- Grid Content -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <template v-if="filteredOffers.length > 0">
            <OfferCard 
              v-for="offer in filteredOffers" 
              :key="offer.id" 
              :offer="offer"
              :on-request-meet="() => setSelectedOffer(offer)"
            />
          </template>
          <div v-else class="col-span-full py-16 flex flex-col items-center justify-center text-center">
            <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <Users class="w-10 h-10" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-1">No results found</h3>
            <p class="text-slate-500 max-w-sm mb-6 text-sm">
              We couldn't find any meetups or sessions matching your filters.
            </p>
            <div class="flex gap-3">
              <button 
                @click="clearFilters"
                class="px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Clear Filters
              </button>
              <button 
                @click="showHangoutRequestModal = true"
                class="px-5 py-2.5 bg-slate-900 text-white shadow-lg shadow-slate-900/10 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <Plus class="w-4 h-4" /> Host a Meetup
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'MATCH'" class="h-full flex flex-col items-center animate-in fade-in duration-300">
        <div class="text-center mb-4">
          <h2 class="text-lg font-bold text-slate-900">Vibe Match</h2>
          <p class="text-slate-500 text-sm">Swipe to find travelers with similar interests.</p>
        </div>
        <SwipeDeck :offers="filteredOffers" class="flex-1 w-full" />
      </div>

      <div v-else-if="activeTab === 'CALENDAR'" class="pb-24 animate-in fade-in duration-300">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 class="font-bold text-slate-700">October 2023</h2>
            <div class="flex gap-2">
              <button class="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium hover:bg-slate-50 shadow-sm">Week</button>
              <button class="px-3 py-1 bg-transparent border border-transparent rounded-md text-xs font-medium text-slate-500 hover:bg-slate-100">Month</button>
            </div>
          </div>
          <div class="grid grid-cols-7 divide-x divide-slate-100 bg-slate-50 text-center text-xs font-semibold text-slate-500 border-b border-slate-100">
            <div v-for="d in weekDays" :key="d" class="py-2.5">{{ d }}</div>
          </div>
          <div class="grid grid-cols-7 divide-x divide-slate-100 min-h-[400px]">
            <div v-for="(_, i) in 7" :key="i" class="bg-white p-2 space-y-2 hover:bg-slate-50/50 transition-colors">
              <div :class="[
                'text-center text-sm font-medium mb-3',
                i === 0 ? 'bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto shadow-sm' : 'text-slate-700 pt-1'
              ]">
                {{ today + i }}
              </div>
              <div 
                v-for="offer in getDayOffers(i)"
                :key="offer.id"
                @click="setViewingOffer(offer)"
                :class="[
                  'p-2 rounded-lg border text-left cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group',
                  offer.type === 'MEETUP' 
                    ? 'bg-indigo-50 border-indigo-100 hover:border-indigo-200' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                ]"
              >
                <div class="flex items-center gap-1 mb-1">
                  <div :class="[
                    'w-1.5 h-1.5 rounded-full',
                    offer.type === 'MEETUP' ? 'bg-indigo-500' : 'bg-orange-500'
                  ]"></div>
                  <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wide truncate">{{ offer.type === 'MEETUP' ? 'Meetup' : 'Session' }}</div>
                </div>
                <div class="text-xs font-bold text-slate-900 leading-tight line-clamp-2 mb-1.5 group-hover:text-indigo-600 transition-colors">{{ offer.title }}</div>
                <div class="flex items-center gap-1.5">
                  <img :src="offer.user.avatarUrl" class="w-4 h-4 rounded-full object-cover ring-1 ring-white" alt="" />
                  <span class="text-[10px] text-slate-500 truncate font-medium">{{ offer.user.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p class="text-center text-slate-400 text-xs mt-4">
          Times are shown in local time (JST).
        </p>
      </div>
    </div>

    <!-- Modals will be added here -->
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { Users, Filter, Search, Sparkles, Grid, Plus, Calendar as CalendarIcon } from 'lucide-vue-next'
import { MOCK_OFFERS } from '@/data/travelCollaboration/constants.js'
import OfferCard from '../components/Cards/OfferCard.vue'
import SwipeDeck from '../components/Match/SwipeDeck.vue'

export default {
  name: 'Meetups',
  components: {
    Users,
    Filter,
    Search,
    Sparkles,
    Grid,
    Plus,
    CalendarIcon,
    OfferCard,
    SwipeDeck
  },
  setup() {
    const activeTab = ref('EXPLORE')
    const typeFilter = ref('ALL')
    const priceFilter = ref('ALL')
    const searchQuery = ref('')
    const selectedOffer = ref(null)
    const requestSent = ref(false)
    const viewingOffer = ref(null)
    const showHangoutRequestModal = ref(false)
    const hangoutRequestSent = ref(false)
    const hangoutType = ref('GROUP')

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const today = new Date().getDate()

    const filteredOffers = computed(() => {
      return MOCK_OFFERS.filter(offer => {
        if (searchQuery.value) {
          const q = searchQuery.value.toLowerCase()
          const matches = 
            offer.title.toLowerCase().includes(q) || 
            offer.description.toLowerCase().includes(q) ||
            offer.user.name?.toLowerCase().includes(q)
          if (!matches) return false
        }

        if (typeFilter.value === '1:1' && offer.type === 'MEETUP') return false
        if (typeFilter.value === 'GROUP' && offer.type !== 'MEETUP') return false

        if (priceFilter.value === 'FREE' && offer.price.amount > 0) return false
        if (priceFilter.value === 'PAID' && offer.price.amount === 0) return false

        return true
      })
    })

    const getDayOffers = (dayIndex) => {
      return filteredOffers.value.filter((_, idx) => idx % 7 === dayIndex)
    }

    const setSelectedOffer = (offer) => {
      selectedOffer.value = offer
    }

    const setViewingOffer = (offer) => {
      viewingOffer.value = offer
    }

    const clearFilters = () => {
      typeFilter.value = 'ALL'
      priceFilter.value = 'ALL'
      searchQuery.value = ''
    }

    return {
      activeTab,
      typeFilter,
      priceFilter,
      searchQuery,
      selectedOffer,
      requestSent,
      viewingOffer,
      showHangoutRequestModal,
      hangoutRequestSent,
      hangoutType,
      weekDays,
      today,
      filteredOffers,
      getDayOffers,
      setSelectedOffer,
      setViewingOffer,
      clearFilters
    }
  }
}
</script>


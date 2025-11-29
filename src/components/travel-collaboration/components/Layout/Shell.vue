<template>
  <div class="flex flex-col h-screen bg-slate-50">
    <!-- Top Navigation -->
    <header class="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <!-- Logo & Trip Selector -->
        <div class="flex items-center gap-4">
          <router-link to="/travel-collaboration" class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30">
              3P
            </div>
            <span class="hidden md:block font-bold text-slate-800 tracking-tight">My3P</span>
          </router-link>

          <div class="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

          <div class="relative group">
            <button class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-700">
              <span class="text-lg">📍</span> 
              <template v-if="activeTrip">
                <div class="flex items-center gap-2">
                  <span class="font-semibold">{{ activeTrip.destination.city }}</span>
                  <span :class="[
                    'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded',
                    getRoleBadgeColor(activeTrip.userRole)
                  ]">
                    {{ activeTrip.userRole }}
                  </span>
                  <span class="text-slate-500 hidden sm:inline text-xs">• Oct 12-15</span>
                </div>
              </template>
              <template v-else>
                <span>Select a trip</span>
              </template>
              <ChevronDown class="w-4 h-4 text-slate-400" />
            </button>
            
            <!-- Dropdown (Simplified) -->
            <div class="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
              <div class="text-xs font-semibold text-slate-400 uppercase px-3 py-2">My Trips</div>
              <button 
                v-for="trip in MOCK_TRIPS" 
                :key="trip.id"
                @click="setActiveTrip(trip.id)"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between',
                  activeTrip?.id === trip.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-50'
                ]"
              >
                <div>
                  <div class="flex items-center gap-2">
                    <div class="font-medium">{{ trip.destination.city }}</div>
                    <span :class="[
                      'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded',
                      getRoleBadgeColor(trip.userRole)
                    ]">
                      {{ trip.userRole }}
                    </span>
                  </div>
                  <div class="text-xs text-slate-500">{{ trip.dates.start }}</div>
                </div>
                <div v-if="activeTrip?.id === trip.id" class="w-2 h-2 rounded-full bg-primary-500"></div>
              </button>
              <div class="border-t border-slate-100 my-1"></div>
              <router-link to="/travel-collaboration/trips/new" class="w-full text-left px-3 py-2 rounded-lg text-sm text-primary-600 hover:bg-primary-50 flex items-center gap-2 font-medium">
                <Plus class="w-4 h-4" /> Create new trip
              </router-link>
            </div>
          </div>
        </div>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1">
          <router-link 
            v-for="item in navItems" 
            :key="item.label"
            :to="item.path"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              $route.path === item.path 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100'
            ]"
          >
            <div class="flex items-center gap-2">
              <component :is="item.icon" class="w-4 h-4" />
              {{ item.label }}
            </div>
          </router-link>
        </nav>

        <!-- User Actions -->
        <div class="flex items-center gap-3">
          <button class="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
            <Bell class="w-5 h-5" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div class="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-200 cursor-pointer">
            <img :src="MOCK_USER.avatarUrl" alt="User" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-hidden relative">
      <router-view />
    </main>

    <!-- Mobile Bottom Nav -->
    <nav class="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 safe-area-bottom">
      <router-link 
        v-for="item in navItems.slice(0, 5)" 
        :key="item.label" 
        :to="item.path"
        :class="[
          'flex flex-col items-center gap-1',
          $route.path === item.path ? 'text-primary-600' : 'text-slate-400'
        ]"
      >
        <component :is="item.icon" :class="['w-6 h-6', $route.path === item.path ? 'fill-current' : '']" />
        <span class="text-[10px] font-medium">{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
import { computed } from 'vue'
import { Map, Grid, Plus, Bell, Search, ChevronDown, Users, Briefcase, Crown } from 'lucide-vue-next'
import { useTrip } from '@/composables/useTrip'
import { MOCK_TRIPS, MOCK_USER } from '@/data/travelCollaboration/constants.js'

export default {
  name: 'Shell',
  components: {
    Map,
    Grid,
    Plus,
    Bell,
    Search,
    ChevronDown,
    Users,
    Briefcase,
    Crown
  },
  setup() {
    const { activeTrip, setActiveTrip } = useTrip()

    const navItems = [
      { icon: Map, label: 'Discover', path: '/travel-collaboration' },
      { icon: Grid, label: 'Sessions', path: '/travel-collaboration/sessions' },
      { icon: Users, label: 'Meetups', path: '/travel-collaboration/meetups' },
      { icon: Crown, label: 'Influencers', path: '/travel-collaboration/influencers' },
      { icon: Briefcase, label: 'Campaigns', path: '/travel-collaboration/campaigns' },
    ]

    const getRoleBadgeColor = (role) => {
      switch(role) {
        case 'creator': return 'bg-purple-100 text-purple-700'
        case 'business': return 'bg-orange-100 text-orange-700'
        default: return 'bg-blue-100 text-blue-700'
      }
    }

    return {
      activeTrip,
      setActiveTrip,
      navItems,
      getRoleBadgeColor,
      MOCK_TRIPS,
      MOCK_USER
    }
  }
}
</script>


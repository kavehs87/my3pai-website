<template>
  <nav class="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center transition-all">
    <div class="flex items-center gap-8">
      <!-- Logo/Brand -->
      <router-link
        :to="{ name: 'influencer-home', params: { username: currentUsername } }"
        class="font-bold text-xl text-slate-900 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div v-if="logo" class="flex items-center gap-2">
          <img :src="logo" alt="Logo" class="h-8 w-auto" />
        </div>
        <div v-else-if="influencerName" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {{ nameInitials }}
          </div>
          <span>{{ influencerName }}</span>
        </div>
        <span v-else>WanderLuxe</span>
      </router-link>

      <!-- Desktop Navigation Links -->
      <div class="hidden lg:flex gap-6">
        <router-link
          v-for="link in navLinks"
          :key="link.id"
          :to="getNavRoute(link.id)"
          :class="[
            'text-sm font-medium transition-colors',
            isActiveRoute(link.id) ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          ]"
        >
          {{ link.label }}
        </router-link>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <!-- Currency Switcher -->
      <div class="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg p-1">
        <button
          v-for="code in currencyCodes"
          :key="code"
          @click="selectCurrency(code)"
          :class="[
            'px-2 py-1 text-xs font-bold rounded-md transition-all',
            currency.code === code
              ? 'bg-white shadow-sm text-slate-900'
              : 'text-slate-400 hover:text-slate-600'
          ]"
        >
          {{ code }}
        </button>
      </div>

      <!-- Shopping Cart -->
      <button
        @click="$emit('cart-click')"
        class="relative p-2 text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
      >
        <ShoppingBasket class="w-6 h-6" />
        <span
          v-if="cartCount > 0"
          class="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce"
        >
          {{ cartCount }}
        </span>
      </button>

      <!-- Mobile Menu Toggle -->
      <button
        @click="$emit('menu-click')"
        class="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
      >
        <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, X, ShoppingBasket } from 'lucide-vue-next'

const props = defineProps({
  cartCount: {
    type: Number,
    default: 0,
  },
  currentView: {
    type: String,
    default: 'home',
  },
  logo: {
    type: String,
    default: null,
  },
  firstName: {
    type: String,
    default: null,
  },
  lastName: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['menu-click', 'navigate', 'cart-click', 'show-login', 'show-signup'])

const route = useRoute()
const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value || route.params.username)

// Currency context
const currency = inject('currency', ref({ code: 'USD', symbol: '$', rate: 1 }))
const setCurrency = inject('setCurrency', () => {})

// Currency codes
const currencyCodes = ['USD', 'EUR', 'GBP', 'JPY']

// Navigation links
const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'store', label: 'Digital Store' },
  { id: 'consultation', label: 'Consultation' },
  { id: 'blog', label: 'Blog' },
  { id: 'podcasts', label: 'Podcasts' },
]

// Mobile menu state (managed by parent)
const isMobileMenuOpen = ref(false)

// Get influencer name
const influencerName = computed(() => {
  if (props.firstName || props.lastName) {
    return `${props.firstName || ''} ${props.lastName || ''}`.trim()
  }
  return null
})

// Get name initials
const nameInitials = computed(() => {
  if (!influencerName.value) return 'W'
  const parts = influencerName.value.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  } else if (parts.length === 1) {
    return parts[0][0].toUpperCase()
  }
  return 'W'
})

// Get navigation route
const getNavRoute = (linkId) => {
  if (!currentUsername.value) return '#'
  
  const routeMap = {
    'home': { name: 'influencer-home', params: { username: currentUsername.value } },
    'store': { name: 'influencer-assets', params: { username: currentUsername.value } },
    'consultation': { name: 'influencer-consultation', params: { username: currentUsername.value } },
    'blog': { name: 'influencer-blog', params: { username: currentUsername.value } },
    'podcasts': { name: 'influencer-podcasts', params: { username: currentUsername.value } },
  }
  
  return routeMap[linkId] || '#'
}

// Check if route is active
const isActiveRoute = (linkId) => {
  const routeMap = {
    'home': 'influencer-home',
    'store': 'influencer-assets',
    'consultation': 'influencer-consultation',
    'blog': 'influencer-blog',
    'podcasts': 'influencer-podcasts',
  }
  
  return route.name === routeMap[linkId]
}

// Select currency
const selectCurrency = (code) => {
  const currencies = {
    USD: { code: 'USD', symbol: '$', rate: 1 },
    EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
    GBP: { code: 'GBP', symbol: '£', rate: 0.79 },
    JPY: { code: 'JPY', symbol: '¥', rate: 150.5 },
  }
  
  if (currencies[code]) {
    setCurrency(currencies[code])
  }
}
</script>


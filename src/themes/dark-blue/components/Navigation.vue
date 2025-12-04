<template>
  <nav
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isNavScrolled ? 'bg-primary/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
    ]"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <div
        class="flex items-center gap-2 cursor-pointer"
        @click="$emit('navigate', 'home')"
      >
        <div class="w-10 h-10 bg-gradient-to-br from-secondary to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-secondary/20">
          M
        </div>
        <span :class="['font-bold text-xl tracking-tight', isNavScrolled ? 'text-white' : 'text-primary']">
          my<span class="text-secondary">3pai</span>
        </span>
      </div>

      <div class="hidden md:flex items-center gap-8">
        <a
          v-for="item in navItems"
          :key="item"
          :href="`#${item.toLowerCase()}`"
          @click.prevent="handleNavClick(item)"
          :class="[
            'text-sm font-medium hover:text-secondary transition-colors',
            isNavScrolled ? 'text-slate-200' : 'text-primary'
          ]"
        >
          {{ item }}
        </a>
      </div>

      <div class="flex items-center gap-4">
        <CurrencySelector :is-scrolled="isNavScrolled" />

        <!-- User Profile / Login -->
        <div v-if="isLoggedIn" class="relative profile-dropdown-container">
          <button
            @click="showProfileDropdown = !showProfileDropdown"
            class="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <img
              :src="userAvatar || 'https://i.pravatar.cc/40?img=41'"
              :alt="userName || 'Profile'"
              class="w-8 h-8 rounded-full border-2 border-white/20"
            />
          </button>
          <!-- Profile Dropdown -->
          <div
            v-if="showProfileDropdown"
            class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50"
          >
            <div class="px-4 py-2 border-b border-slate-100">
              <div class="font-semibold text-primary text-sm">{{ userName }}</div>
              <div class="text-xs text-text-muted">{{ userEmail }}</div>
            </div>
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-sm text-text-muted hover:bg-slate-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        <!-- Login/Signup Buttons -->
        <div v-else class="flex items-center gap-2">
          <button
            @click="$emit('show-login')"
            :class="[
              'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
              isNavScrolled
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-primary text-white hover:bg-primary/90'
            ]"
          >
            Sign In
          </button>
          <button
            @click="$emit('show-signup')"
            :class="[
              'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
              isNavScrolled
                ? 'bg-secondary text-white hover:bg-secondary/90'
                : 'bg-secondary text-white hover:bg-secondary/90'
            ]"
          >
            Sign Up
          </button>
        </div>

        <button
          @click="$emit('cart-click')"
          class="relative p-2 rounded-full hover:bg-white/10 transition-colors group"
        >
          <ShoppingCart :class="['w-6 h-6', isNavScrolled ? 'text-white' : 'text-primary', 'group-hover:text-secondary transition-colors']" />
          <span
            v-if="cartCount > 0"
            class="absolute top-0 right-0 w-5 h-5 bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-primary"
          >
            {{ cartCount }}
          </span>
        </button>

        <button
          @click="$emit('menu-click')"
          class="md:hidden p-2 rounded-lg hover:bg-white/10"
        >
          <Menu :class="['w-6 h-6', isNavScrolled ? 'text-white' : 'text-primary']" />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Menu, ShoppingCart } from 'lucide-vue-next'
import CurrencySelector from './CurrencySelector.vue'
import apiService from '@/services/api.js'
import eventBus from '@/utils/eventBus.js'

const props = defineProps({
  cartCount: {
    type: Number,
    default: 0,
  },
  currentView: {
    type: String,
    default: 'home',
  },
})

const emit = defineEmits(['menu-click', 'navigate', 'cart-click', 'show-login', 'show-signup'])

// Auth state
const isLoggedIn = ref(false)
const userAvatar = ref('')
const userName = ref('')
const userEmail = ref('')
const showProfileDropdown = ref(false)

// Check auth status
const checkAuthStatus = async () => {
  try {
    const result = await apiService.getCurrentUser()
    if (result.success) {
      isLoggedIn.value = true
      const user = result.data || {}
      userAvatar.value = user.avatar || user.picture || user.photo_url || ''
      userName.value = user.name || user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
      userEmail.value = user.email || ''
    } else {
      isLoggedIn.value = false
      userAvatar.value = ''
      userName.value = ''
      userEmail.value = ''
    }
  } catch (error) {
    isLoggedIn.value = false
    userAvatar.value = ''
    userName.value = ''
    userEmail.value = ''
  }
}

const handleLogout = async () => {
  showProfileDropdown.value = false
  try {
    await apiService.logout()
    isLoggedIn.value = false
    userAvatar.value = ''
    userName.value = ''
    userEmail.value = ''
    // Clear guest session ID
    const { clearGuestSessionId } = await import('@/utils/sessionManager.js')
    clearGuestSessionId()
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Listen for auth success events
const handleAuthSuccess = (userData) => {
  isLoggedIn.value = true
  if (userData && typeof userData === 'object') {
    userAvatar.value = userData.avatar || userData.picture || userData.photo_url || ''
    userName.value = userData.name || userData.display_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User'
    userEmail.value = userData.email || ''
  }
  showProfileDropdown.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.profile-dropdown-container')
  if (showProfileDropdown.value && dropdown && !dropdown.contains(event.target)) {
    showProfileDropdown.value = false
  }
}

const scrolled = ref(false)
const navItems = ['Profile', 'Courses', 'Maps', 'Blog', 'Assets']

const isHome = computed(() => props.currentView === 'home')
const isNavScrolled = computed(() => scrolled.value || !isHome.value)

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

const handleNavClick = (item) => {
  const id = item.toLowerCase()
  
  if (!isHome.value) {
    emit('navigate', 'home')
    setTimeout(() => {
      const element = document.getElementById(id)
      if (element) element.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  } else {
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  checkAuthStatus()
  eventBus.on('auth-success', handleAuthSuccess)
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  eventBus.off('auth-success', handleAuthSuccess)
  document.removeEventListener('click', handleClickOutside)
})
</script>


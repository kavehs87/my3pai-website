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

const emit = defineEmits(['menu-click', 'navigate', 'cart-click'])

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
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>


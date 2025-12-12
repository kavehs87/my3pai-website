<template>
  <div class="pt-24 pb-20 px-4 lg:px-12 xl:px-16 2xl:px-24 max-w-7xl mx-auto">
    <button
      @click="router.push({ name: 'influencer-home', params: { username: currentUsername } })"
      class="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors"
    >
      <ChevronLeft class="w-4 h-4" /> Back to Home
    </button>

    <div class="mb-12">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-3 bg-purple-100 rounded-2xl">
          <GraduationCap class="w-8 h-8 text-purple-600" />
        </div>
        <h1 class="text-3xl font-bold text-slate-900">Training & Masterclasses</h1>
      </div>
      <p class="text-slate-500 max-w-2xl text-lg">
        Level up your travel content creation game. Join thousands of students learning photography, videography, and brand building.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 text-slate-500">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading courses...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 text-slate-500">
      <p>{{ error }}</p>
      <button
        @click="fetchCourses"
        class="mt-4 text-sm font-semibold text-slate-900 hover:underline"
      >
        Try Again
      </button>
    </div>

    <!-- Courses Grid -->
    <div v-else-if="courses.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="course in courses"
        :key="course.id"
        class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col"
      >
        <div class="relative h-56 overflow-hidden shrink-0">
          <img
            :src="getCourseImage(course)"
            :alt="course.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            @error="handleImageError"
          />
          <div
            v-if="course.isPremium || course.is_premium"
            class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm"
          >
            Premium Course
          </div>
        </div>

        <div class="p-6 flex flex-col flex-grow">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Course</span>
            <div class="flex items-center gap-1">
              <Star class="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span class="text-xs text-slate-400">{{ getCourseRating(course) }}</span>
            </div>
          </div>

          <h3 class="font-bold text-xl text-slate-900 mb-3">{{ course.title }}</h3>
          <p class="text-slate-500 mb-6 line-clamp-3">{{ course.description }}</p>

          <div class="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
            <div class="flex flex-col">
              <span class="text-xs text-slate-400 font-medium">One-time payment</span>
              <PriceDisplay :amount="getCoursePrice(course)" class="text-2xl font-bold text-slate-900" />
            </div>
            <button
              @click="handleAddToCart(course)"
              :disabled="addingToCartId === course.id"
              class="text-sm font-bold bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 flex items-center gap-2 transition-colors shadow-lg shadow-purple-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart v-if="addingToCartId !== course.id" class="w-4 h-4" />
              <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Enroll
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 text-slate-400">
      <GraduationCap class="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p class="text-lg font-medium">No courses available yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChevronLeft,
  GraduationCap,
  Star,
  ShoppingCart,
} from 'lucide-vue-next'
import PriceDisplay from '../components/PriceDisplay.vue'
import apiService from '@/services/api'
import toast from '@/utils/toast'
import eventBus from '@/utils/eventBus'

const emit = defineEmits(['add-to-cart'])

const route = useRoute()
const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value || route.params.username)

const courses = ref([])
const loading = ref(false)
const error = ref(null)
const addingToCartId = ref(null)

const getCourseImage = (course) => {
  return (
    course.coverImage ||
    course.image ||
    course.cover_image ||
    '/media-placeholder.jpg'
  )
}

const getCoursePrice = (course) => {
  // Handle price in cents or dollars
  if (course.price_cents !== undefined) {
    return course.price_cents / 100
  }
  if (typeof course.price === 'number') {
    // If price > 10000, likely in cents
    if (course.price > 10000) {
      return course.price / 100
    }
    return course.price
  }
  return 0
}

const getCourseRating = (course) => {
  return course.rating || course.average_rating || '5.0'
}

const handleImageError = (event) => {
  event.target.src = '/media-placeholder.jpg'
}

const handleAddToCart = async (course) => {
  if (addingToCartId.value === course.id) return

  addingToCartId.value = course.id
  try {
    const result = await apiService.addCartItem({
      item_type: 'masterclass',
      item_id: course.id,
      quantity: 1,
    })

    if (result.success) {
      toast.success('Added to cart')
      emit('add-to-cart', course)
      eventBus.emit('cart-item-added', course)
    } else {
      toast.error(result.error || 'Failed to add to cart')
    }
  } catch (err) {
    console.error('Error adding to cart:', err)
    toast.error('Failed to add to cart. Please try again.')
  } finally {
    addingToCartId.value = null
  }
}

const fetchCourses = async () => {
  if (!currentUsername.value) return

  loading.value = true
  error.value = null

  try {
    const result = await apiService.getInfluencerMasterclasses(currentUsername.value)

    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      courses.value = Array.isArray(data) ? data : data?.data || []
    } else {
      error.value = result.error || 'Failed to load courses.'
      courses.value = []
    }
  } catch (err) {
    console.error('Error fetching courses:', err)
    error.value = err.message || 'An unexpected error occurred.'
    courses.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCourses()
})
</script>


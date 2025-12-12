<template>
  <section id="training" class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
    <div class="flex flex-col md:flex-row justify-between gap-6 md:items-end">
      <div class="max-w-xl">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">Academy</span>
        </div>
        <h2 class="text-3xl font-bold text-slate-900 mb-3">Training & Masterclasses</h2>
        <p class="text-slate-500 text-base leading-relaxed">
          Level up your travel content creation game. Join thousands of students learning
          <span class="text-slate-900 font-medium"> photography</span>,
          <span class="text-slate-900 font-medium"> videography</span>, and
          <span class="text-slate-900 font-medium"> brand building</span>.
        </p>
        <div class="flex flex-wrap gap-4 mt-4 text-xs font-medium text-slate-500">
          <span class="flex items-center gap-1">
            <Check class="w-3 h-3 text-purple-500" /> Lifetime Access
          </span>
          <span class="flex items-center gap-1">
            <Check class="w-3 h-3 text-purple-500" /> Certificate Included
          </span>
        </div>
      </div>
      <button
        @click="handleViewAll"
        class="shrink-0 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition-all flex items-center gap-2"
      >
        View Full Catalog <ArrowUpRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-500 font-medium">Loading courses...</p>
      </div>
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
    <div v-else-if="displayedCourses.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="course in displayedCourses"
        :key="course.id"
        class="group bg-slate-50 rounded-2xl p-2 shadow-sm hover:shadow-xl transition-all border border-slate-100 hover:border-slate-200 flex flex-col md:flex-row gap-4"
      >
        <div class="relative w-full md:w-1/3 h-48 md:h-auto rounded-xl overflow-hidden shrink-0">
          <img
            :src="getCourseImage(course)"
            :alt="course.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            @error="handleImageError"
          />
          <!-- Premium Badge -->
          <div
            v-if="course.isPremium || course.is_premium"
            class="absolute top-2 right-2 bg-purple-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"
          >
            <Star class="w-3 h-3 fill-yellow-400 text-yellow-400" />
            PREMIUM
          </div>
        </div>

        <div class="py-2 px-2 md:py-4 md:pr-4 flex flex-col flex-grow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Course</span>
            <div class="flex items-center gap-1">
              <Star class="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span class="text-xs text-slate-400">{{ getCourseRating(course) }}</span>
            </div>
          </div>

          <h3 class="font-bold text-lg text-slate-900 mb-2">{{ course.title }}</h3>
          <p class="text-sm text-slate-500 mb-4 line-clamp-2">{{ course.description }}</p>

          <!-- Student Count -->
          <div v-if="getStudentCount(course)" class="flex items-center gap-1 mb-4 text-xs text-slate-500">
            <Users class="w-3 h-3" />
            <span>{{ formatStudentCount(getStudentCount(course)) }} students enrolled</span>
          </div>

          <div class="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/60">
            <PriceDisplay :amount="getCoursePrice(course)" class="text-lg font-bold text-slate-900" />
            <div class="flex items-center gap-2">
              <button
                @click="handleAddToCart(course)"
                :disabled="addingToCartId === course.id"
                class="text-sm font-bold bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-900 hover:text-white flex items-center gap-2 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart v-if="addingToCartId !== course.id" class="w-4 h-4" />
                <div v-else class="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-slate-400">
      <GraduationCap class="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p class="text-lg font-medium">No courses available yet.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import {
  Check,
  ArrowUpRight,
  ShoppingCart,
  Star,
  Users,
  GraduationCap,
} from 'lucide-vue-next'
import PriceDisplay from './PriceDisplay.vue'
import apiService from '@/services/api'
import toast from '@/utils/toast'
import eventBus from '@/utils/eventBus'

const props = defineProps({
  username: {
    type: String,
    default: null,
  },
  limit: {
    type: Number,
    default: 2, // Show first 2 courses in section
  },
})

const emit = defineEmits(['add-to-cart', 'view-all'])

const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => props.username || username?.value || router.currentRoute.value.params.username)

// State
const courses = ref([])
const loading = ref(false)
const error = ref(null)
const addingToCartId = ref(null)

// Computed
const displayedCourses = computed(() => {
  if (props.limit && props.limit > 0) {
    return courses.value.slice(0, props.limit)
  }
  return courses.value
})

// Methods
const fetchCourses = async () => {
  if (!currentUsername.value) return

  loading.value = true
  error.value = null
  try {
    const result = await apiService.getInfluencerMasterclasses(currentUsername.value, {
      per_page: props.limit || 2,
    })
    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      courses.value = Array.isArray(data) ? data : data?.data || []
    } else {
      error.value = result.error || 'Failed to load courses.'
    }
  } catch (err) {
    console.error('Error fetching courses:', err)
    error.value = err.message || 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}

const getCourseImage = (course) => {
  return course.coverImage ||
         course.image ||
         course.cover_image ||
         '/media-placeholder.jpg'
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

const getStudentCount = (course) => {
  return course.students ||
         course.students_count ||
         course.enrolled_students ||
         null
}

const formatStudentCount = (count) => {
  if (!count) return '0'
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
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

const handleViewAll = () => {
  emit('view-all')
  if (currentUsername.value) {
    router.push({ name: 'influencer-classes', params: { username: currentUsername.value } })
  }
}

onMounted(() => {
  fetchCourses()
})
</script>


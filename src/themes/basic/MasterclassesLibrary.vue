<template>
  <div class="min-h-screen bg-blue-50">
    <!-- Loading State -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-600 font-medium">Loading masterclasses...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !hasProfile" class="min-h-screen flex items-center justify-center p-4">
      <div class="text-center max-w-md">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle class="w-8 h-8 text-red-500" />
        </div>
        <h2 class="text-xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
        <p class="text-slate-600 mb-6">{{ error }}</p>
        <button
          class="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          @click="$router.push('/')"
        >
          Go Home
        </button>
      </div>
    </div>

    <!-- Content -->
    <template v-else-if="hasProfile">
      <!-- Mock Data Banner -->
      <div
        v-if="useMockData"
        class="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800"
      >
        <span class="font-medium">Demo Mode:</span> Showing sample data. Connect your backend to see real masterclasses.
      </div>

      <!-- Mobile Header -->
      <div
        class="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center"
        :class="{ 'top-[36px]': useMockData }"
      >
        <div class="flex items-center gap-3">
          <button 
            class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
            @click="goToProfile" 
            aria-label="Back to profile"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <span class="font-bold text-xl text-slate-900">{{ profile?.name || 'WanderLuxe' }}</span>
        </div>
        <span class="text-sm text-slate-500 font-medium">Masterclasses</span>
      </div>

      <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 lg:p-8">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white border-2 border-blue-200 rounded-lg p-4">
            <InfluencerSidebar :profile="profile" :bio-paragraphs="bioParagraphs" :username="currentUsername" />
          </div>
        </div>

        <!-- Content - Masterclasses Library -->
        <div class="lg:col-span-2 space-y-6 pb-20">
          <!-- Sticky Back Navigation (Desktop) -->
          <div class="hidden lg:flex sticky top-8 z-30 mb-4">
            <router-link
              :to="profileLink"
              class="bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-slate-200/60 px-6 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white transition-all flex items-center gap-2"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>Back to Profile</span>
            </router-link>
          </div>

          <!-- Header -->
          <div class="bg-white rounded-lg p-6 border-2 border-blue-200">
            <!-- Breadcrumb Navigation (Mobile/Tablet) -->
            <div class="lg:hidden mb-6 flex items-center gap-2 text-sm">
              <router-link
                :to="profileLink"
                class="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                <ArrowLeft class="w-4 h-4" />
                <span>Back to Profile</span>
              </router-link>
              <span class="text-slate-300">/</span>
              <span class="text-slate-900 font-medium">Masterclasses</span>
            </div>

            <div class="flex flex-col md:flex-row justify-between gap-6 md:items-end mb-6">
              <div class="max-w-xl">
                <div class="flex items-center gap-2 mb-2">
                  <div class="p-2 bg-blue-100 rounded-lg border-2 border-blue-300">
                    <GraduationCap class="w-5 h-5 text-blue-600" />
                  </div>
                  <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-300 text-xs font-bold uppercase">
                    Training & Education
                  </span>
                </div>
                <h1 class="text-3xl font-bold text-blue-900 mb-3">Training & Masterclasses</h1>
                <p class="text-gray-600 text-base leading-relaxed">
                  Explore the complete collection of professional training courses and masterclasses from
                  <span class="text-slate-900 font-medium">{{ profile?.name || 'this creator' }}</span>.
                  Learn <span class="text-slate-900 font-medium">photography techniques</span>,
                  <span class="text-slate-900 font-medium"> video editing</span>, and
                  <span class="text-slate-900 font-medium"> content creation strategies</span>.
                  All courses include lifetime access and downloadable resources.
                </p>
                <div class="flex flex-wrap gap-4 mt-4 text-xs font-medium text-slate-500">
                  <span class="flex items-center gap-1"><Check class="w-3 h-3 text-green-500" /> Lifetime Access</span>
                  <span class="flex items-center gap-1"><Check class="w-3 h-3 text-green-500" /> Downloadable Resources</span>
                  <span class="flex items-center gap-1"><Check class="w-3 h-3 text-green-500" /> Certificate of Completion</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Masterclasses Grid -->
          <div v-if="masterclassesLoading" class="text-center py-12 text-slate-500">
            <div class="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading masterclasses...</p>
          </div>

          <div v-else-if="masterclasses.length === 0" class="bg-white rounded-lg p-12 border-2 border-blue-200 text-center">
            <div class="w-16 h-16 bg-blue-100 border-2 border-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap class="w-8 h-8 text-blue-500" />
            </div>
            <h3 class="text-xl font-bold text-blue-900 mb-2">No masterclasses found</h3>
            <p class="text-gray-600">No masterclasses available yet.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article
              v-for="course in masterclasses"
              :key="course.id"
              class="group bg-white rounded-lg p-3 border-2 border-blue-300 hover:border-blue-500 transition-all flex flex-col md:flex-row gap-4"
            >
              <div class="relative w-full md:w-1/3 h-48 md:h-auto rounded-xl overflow-hidden shrink-0">
                <img 
                  v-if="course.coverImage || course.image" 
                  :src="course.coverImage || course.image" 
                  :alt="course.title" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div v-else class="w-full h-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
                  <GraduationCap class="w-12 h-12 text-blue-500" />
                </div>
                <div v-if="course.isPremium" class="absolute top-2 left-2">
                  <span class="text-xs font-bold uppercase text-yellow-700 bg-yellow-100 px-2 py-1 rounded border-2 border-yellow-400 flex items-center gap-1">
                    <Lock class="w-3 h-3" /> Premium
                  </span>
                </div>
              </div>
              <div class="py-2 px-2 md:py-4 md:pr-4 flex flex-col flex-grow">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold uppercase text-blue-700 bg-blue-100 px-2 py-1 rounded border border-blue-300">
                    {{ course.type || 'Course' }}
                  </span>
                  <div v-if="course.rating" class="flex items-center gap-1">
                    <Star class="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span class="text-xs text-gray-500">{{ course.rating.toFixed(1) }}</span>
                  </div>
                </div>
                <h3 class="font-bold text-lg text-blue-900 mb-2">
                  {{ course.title }}
                </h3>
                <p v-if="course.description" class="text-sm text-gray-600 mb-4 line-clamp-2">
                  {{ course.description }}
                </p>
                <div class="flex items-center justify-between mt-auto pt-4 border-t-2 border-blue-200">
                  <span class="text-lg font-bold text-blue-900">${{ course.price || 0 }}</span>
                  <div class="flex items-center gap-2">
                    <button class="p-2 rounded border border-gray-300 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors" aria-label="Save masterclass">
                      <Heart class="w-4 h-4" />
                    </button>
                    <button
                      class="text-sm font-bold bg-blue-500 text-white px-4 py-2 rounded border-2 border-blue-600 hover:bg-blue-600 flex items-center gap-2 transition-colors active:scale-95"
                      @click="handleAddToCart(course)"
                    >
                      <ShoppingCart class="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <!-- Pagination (if needed in future) -->
          <div v-if="hasMorePages" class="flex justify-center pt-8">
            <button
              class="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium border-2 border-blue-600 hover:bg-blue-600 transition-colors"
              @click="loadMore"
              :disabled="loadingMore"
            >
              <span v-if="loadingMore">Loading...</span>
              <span v-else>Load More</span>
            </button>
          </div>

          <footer class="pt-12 border-t border-slate-200 text-center text-slate-400 text-sm">
            © {{ new Date().getFullYear() }} {{ profile?.name || 'Creator' }} Masterclasses. All rights reserved.
          </footer>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { GraduationCap, Star, ShoppingCart, Heart, Lock, Check, AlertCircle, ArrowLeft } from 'lucide-vue-next'
import InfluencerSidebar from './components/InfluencerSidebar.vue'
import { useInfluencer } from '@/shared/influencer/composables/useInfluencer'
import api from '@/services/api'
import { MASTERCLASSES } from '@/shared/influencer/constants'

const route = useRoute()
const router = useRouter()

const {
  profile,
  loading,
  error,
  useMockData,
  bioParagraphs,
  hasProfile,
  fetchProfile,
  loadMockData,
} = useInfluencer()

// Get username from route
const currentUsername = computed(() => route.params.username || null)

// Provide username to child components
provide('influencerUsername', currentUsername)

const masterclasses = ref([])
const masterclassesLoading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const hasMorePages = ref(false)

const loadMasterclasses = async (page = 1) => {
  if (!currentUsername.value) {
    masterclasses.value = MASTERCLASSES.map(course => ({
      ...course,
      coverImage: course.image,
      rating: 5.0
    }))
    return
  }

  masterclassesLoading.value = page === 1
  loadingMore.value = page > 1

  try {
    const result = await api.getInfluencerMasterclasses(currentUsername.value, {
      page,
      per_page: 20,
    })

    if (result.success && result.data) {
      // Handle nested data structure: result.data.data or result.data
      let responseData = result.data
      if (responseData.data) {
        responseData = responseData.data
      }
      
      // Extract masterclasses array
      const newMasterclasses = Array.isArray(responseData) 
        ? responseData 
        : (responseData?.data || [])
      
      // Map to ensure consistent structure
      const mappedMasterclasses = newMasterclasses.map(course => ({
        ...course,
        coverImage: course.coverImage || course.image,
        rating: course.rating || 5.0
      }))
      
      if (page === 1) {
        masterclasses.value = mappedMasterclasses
      } else {
        masterclasses.value = [...masterclasses.value, ...mappedMasterclasses]
      }

      // Check if there are more pages
      const meta = responseData?.meta || result.data?.meta || result.data?.data?.meta
      if (meta) {
        hasMorePages.value = meta.current_page < meta.last_page
        currentPage.value = meta.current_page
      } else {
        hasMorePages.value = newMasterclasses.length === 20 // Assume more if we got a full page
      }
    } else {
      // Fallback to mock data
      masterclasses.value = MASTERCLASSES.map(course => ({
        ...course,
        coverImage: course.image,
        rating: 5.0
      }))
    }
  } catch (err) {
    console.error('[MasterclassesLibrary] Error fetching masterclasses:', err)
    masterclasses.value = MASTERCLASSES.map(course => ({
      ...course,
      coverImage: course.image,
      rating: 5.0
    }))
  } finally {
    masterclassesLoading.value = false
    loadingMore.value = false
  }
}

const loadMore = () => {
  if (hasMorePages.value && !loadingMore.value) {
    loadMasterclasses(currentPage.value + 1)
  }
}

const handleAddToCart = (course) => {
  // TODO: Implement cart functionality
  console.log('Add to cart:', course)
}

const profileLink = computed(() => {
  return currentUsername.value ? `/influencer/${currentUsername.value}` : '/'
})

const goToProfile = () => {
  if (currentUsername.value) {
    router.push(`/influencer/${currentUsername.value}`)
  } else {
    router.push('/')
  }
}

// Load profile and masterclasses
onMounted(async () => {
  const username = currentUsername.value
  if (username) {
    await fetchProfile(username)
  } else {
    loadMockData()
  }
  await loadMasterclasses(1)
})
</script>

<style scoped>
/* Styles are inherited from InfluencerProfile layout */
</style>


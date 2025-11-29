<template>
  <section id="training" class="space-y-6">
    <div class="flex items-center gap-2">
      <div class="p-2 bg-purple-100 rounded-lg">
        <GraduationCap class="w-5 h-5 text-purple-600" />
      </div>
      <h2 class="text-2xl font-bold text-slate-900">Training &amp; Masterclasses</h2>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-12 text-center text-slate-400">
      <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2" />
      <p>Loading courses...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="masterclasses.length === 0" class="py-12 text-center text-slate-400">
      <GraduationCap class="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>No masterclasses available yet</p>
    </div>

    <!-- Masterclasses Grid -->
    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article
          v-for="course in displayedMasterclasses"
          :key="course.id"
          class="group bg-white rounded-2xl p-2 shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col md:flex-row gap-4"
        >
        <div class="relative w-full md:w-1/3 h-48 md:h-auto rounded-xl overflow-hidden shrink-0">
          <img 
            v-if="course.coverImage" 
            :src="course.coverImage" 
            :alt="course.title" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
            <GraduationCap class="w-12 h-12 text-purple-400 opacity-50" />
          </div>
          <div v-if="course.isPremium" class="absolute top-2 left-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1">
              <Lock class="w-3 h-3" /> Premium
            </span>
          </div>
        </div>
        <div class="py-2 px-2 md:py-4 md:pr-4 flex flex-col flex-grow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              {{ course.type || 'Course' }}
            </span>
            <div v-if="course.rating" class="flex items-center gap-1">
              <Star class="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span class="text-xs text-slate-400">{{ course.rating.toFixed(1) }}</span>
            </div>
          </div>
          <h3 class="font-bold text-lg text-slate-900 mb-2">
            {{ course.title }}
          </h3>
          <p v-if="course.description" class="text-sm text-slate-500 mb-4 line-clamp-2">
            {{ course.description }}
          </p>
          <div class="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
            <span class="text-lg font-bold text-slate-900">${{ course.price || 0 }}</span>
            <div class="flex items-center gap-2">
              <button class="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors" aria-label="Save masterclass">
                <Heart class="w-4 h-4" />
              </button>
              <button
                class="text-sm font-bold bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors shadow-lg shadow-purple-600/20 active:scale-95"
                @click="$emit('add-to-cart', course)"
              >
                <ShoppingCart class="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </article>
      </div>
      
      <!-- Browse Complete Library Button -->
      <div v-if="masterclasses.length > displayedCount" class="flex justify-center pt-4">
        <router-link
          v-if="currentUsername"
          :to="`/influencer/${currentUsername}/masterclasses`"
          class="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all flex items-center gap-2"
        >
          Browse Complete Library
          <ArrowUpRight class="w-4 h-4" />
        </router-link>
        <button
          v-else
          class="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all flex items-center gap-2"
          disabled
        >
          Browse Complete Library
          <ArrowUpRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { GraduationCap, Star, ShoppingCart, Heart, Lock, Loader2, ArrowUpRight } from 'lucide-vue-next'
import api from '@/services/api'
import { MASTERCLASSES } from '../constants'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['add-to-cart'])

const masterclasses = ref([])
const loading = ref(false)
const error = ref(null)
const displayedCount = 4 // Show 2 rows (2 columns x 2 rows = 4 items)

// Get username from inject if not provided as prop
const influencerUsername = inject('influencerUsername', null)
const currentUsername = computed(() => {
  if (props.username) return props.username
  if (influencerUsername?.value) return influencerUsername.value
  return null
})

const displayedMasterclasses = computed(() => {
  return masterclasses.value.slice(0, displayedCount)
})

const fetchMasterclasses = async () => {
  loading.value = true
  error.value = null
  try {
    const result = await api.getInfluencerMasterclasses(props.username)
    if (result.success) {
      // Handle nested data structure
      let data = result.data
      if (data?.data) {
        data = data.data
      }
      const courses = Array.isArray(data) ? data : (data?.data || [])
      
      // Map to ensure consistent structure
      masterclasses.value = courses.map(course => ({
        ...course,
        coverImage: course.coverImage || course.image,
        rating: course.rating || 5.0
      }))
    } else {
      error.value = result.error || 'Failed to load masterclasses.'
      // Fallback to mock data
      masterclasses.value = MASTERCLASSES.map(course => ({
        ...course,
        coverImage: course.image,
        rating: 5.0
      }))
    }
  } catch (err) {
    error.value = err.message || 'An unexpected error occurred.'
    // Fallback to mock data
    masterclasses.value = MASTERCLASSES.map(course => ({
      ...course,
      coverImage: course.image,
      rating: 5.0
    }))
  } finally {
    loading.value = false
  }
}

onMounted(fetchMasterclasses)
watch(() => props.username, fetchMasterclasses)
</script>


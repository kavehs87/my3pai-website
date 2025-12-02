<template>
  <!-- Loading State -->
  <div v-if="loading" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-slate-600 font-medium">Loading profile...</p>
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

  <!-- Theme Component -->
  <component
    v-else-if="hasProfile && themeComponent"
    :is="themeComponent"
    :profile="profile"
    :username="currentUsername"
    :loading="loading"
    :error="error"
    :use-mock-data="useMockData"
    :bio-paragraphs="bioParagraphs"
  />
</template>

<script setup>
import { computed, onMounted, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import { AlertCircle } from 'lucide-vue-next'
import { getTheme } from '@/themes'
import { useInfluencer } from './composables/useInfluencer'

const props = defineProps({
  username: {
    type: String,
    default: null,
  },
})

const route = useRoute()
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

// Computed username from props or route
const currentUsername = computed(() => props.username || route.params.username || profile.value?.username || null)

// Provide username to child components
provide('influencerUsername', currentUsername)

// Get theme ID from profile, fallback to 'modern'
const themeId = computed(() => profile.value?.theme || 'modern')

// Get theme component
const themeComponent = computed(() => {
  const theme = getTheme(themeId.value)
  return theme?.component || null
})

/**
 * Load profile data based on username
 */
const loadProfile = async () => {
  const username = props.username || route.params.username

  if (username) {
    await fetchProfile(username)
  } else {
    // No username provided - load mock data for demo
    loadMockData()
  }
}

// Watch for route changes
watch(
  () => route.params.username,
  (newUsername) => {
    if (newUsername) {
      fetchProfile(newUsername)
    }
  }
)

onMounted(async () => {
  await loadProfile()
})
</script>


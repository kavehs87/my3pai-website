<template>
  <component v-if="libraryComponent" :is="libraryComponent" />
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-slate-600 font-medium">Loading library...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getThemePage } from '@/themes'
import api from '@/services/api'

const route = useRoute()
const libraryComponent = ref(null)

onMounted(async () => {
  const username = route.params.username
  
  if (!username) {
    const pageModule = await getThemePage('basic', 'masterclasses')
    libraryComponent.value = pageModule?.default || pageModule
    return
  }

  // Fetch profile to get theme
  try {
    const result = await api.getInfluencerProfile(username)
    if (result.success && result.data?.data) {
      const theme = result.data.data.theme || 'dark-blue'
      const pageModule = await getThemePage(theme, 'masterclasses')
      libraryComponent.value = pageModule?.default || pageModule
    } else {
      // Fallback to basic theme for library pages
      const pageModule = await getThemePage('basic', 'masterclasses')
      libraryComponent.value = pageModule?.default || pageModule
    }
  } catch (error) {
    console.error('Error loading theme page:', error)
    // Fallback to basic theme for library pages
    const pageModule = await getThemePage('basic', 'masterclasses')
    libraryComponent.value = pageModule?.default || pageModule
  }
})
</script>


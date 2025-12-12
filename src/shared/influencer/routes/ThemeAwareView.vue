<template>
  <component 
    :is="viewComponent" 
    v-if="viewComponent" 
    :key="`${route.path}-${props.viewName}`"
    v-bind="$attrs" 
  />
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-slate-600 font-medium">Loading view...</p>
    </div>
  </div>
</template>

<script setup>
import { shallowRef, ref, computed, watch, inject } from 'vue'
import { useRoute } from 'vue-router'
import { getThemeView } from '@/themes'
import { markRaw } from 'vue'

const props = defineProps({
  viewName: {
    type: String,
    required: true,
  },
})

const route = useRoute()
const username = inject('influencerUsername', null)
const injectedTheme = inject('influencerTheme', null)

// Get theme - handle both computed ref and plain value
const themeId = computed(() => {
  if (!injectedTheme) return 'dark-blue'
  // If it's a computed ref, get its value
  if (typeof injectedTheme === 'object' && 'value' in injectedTheme) {
    return injectedTheme.value || 'dark-blue'
  }
  return injectedTheme || 'dark-blue'
})

// State - use shallowRef to avoid making component reactive
const viewComponent = shallowRef(null)
const loading = ref(true)

// Load the appropriate view component
const loadView = async (theme, viewName = null) => {
  const targetViewName = viewName || props.viewName
  loading.value = true
  try {
    const view = await getThemeView(theme, targetViewName)
    if (view) {
      // Handle both default export and named export
      // Mark as raw to prevent Vue from making it reactive
      const component = view.default || view
      viewComponent.value = markRaw(component)
    } else {
      console.warn(`View ${targetViewName} not found for theme ${theme}`)
      // Could show an error component here
    }
  } catch (error) {
    console.error(`Failed to load view ${targetViewName} for theme ${theme}:`, error)
  } finally {
    loading.value = false
  }
}

// Watch for theme changes
watch(
  themeId,
  (newTheme) => {
    if (newTheme) {
      loadView(newTheme)
    }
  },
  { immediate: true }
)

// Watch for viewName changes (when navigating between routes)
watch(
  () => props.viewName,
  (newViewName) => {
    if (newViewName && themeId.value) {
      loadView(themeId.value, newViewName)
    }
  }
)

// Watch for route path changes to ensure component updates on navigation
watch(
  () => route.path,
  () => {
    // Force reload when route path changes
    if (themeId.value && props.viewName) {
      loadView(themeId.value, props.viewName)
    }
  }
)
</script>


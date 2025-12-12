<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <!-- Header: Thumbnail and Title -->
    <div class="flex items-center gap-4 mb-4">
      <div class="relative w-20 h-20 flex-shrink-0">
        <img
          :src="podcast.image || podcast.coverImage"
          alt="Podcast thumbnail"
          class="w-full h-full object-cover rounded-xl"
        />
        <Lock v-if="podcast.isPremium && (isLocked || (!audioUrl && !loading))" class="absolute top-1 right-1 w-4 h-4 text-amber-500 bg-white rounded-full p-0.5" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs text-indigo-600 font-semibold">{{ podcast.duration }}</span>
          <span class="text-xs text-slate-400">• {{ podcast.date }}</span>
        </div>
        <h4 class="font-bold text-slate-900 truncate pr-2">{{ podcast.title }}</h4>
      </div>
    </div>

    <!-- Audio Controls -->
    <div class="space-y-3">
      <!-- Progress Bar -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500 font-mono tabular-nums min-w-[3rem] text-right">
          {{ formatTime(displayTime) }}
        </span>
        <div 
          class="flex-1 h-2 bg-slate-200 rounded-full cursor-pointer relative group"
          @click="seekTo"
          ref="progressBar"
        >
          <div 
            class="h-full bg-indigo-600 rounded-full transition-all duration-100"
            :style="{ width: `${progressPercent}%` }"
          ></div>
          <div 
            class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            :style="{ left: `calc(${progressPercent}% - 6px)` }"
          ></div>
        </div>
        <span class="text-xs text-slate-500 font-mono tabular-nums min-w-[3rem]">
          {{ formatTime(displayDuration) }}
        </span>
      </div>

      <!-- Control Buttons -->
      <div class="flex items-center justify-center gap-3">
        <button
          @click="rewind"
          :disabled="loading || !audioUrl"
          class="p-2 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Rewind 10 seconds"
        >
          <Rewind class="w-5 h-5 text-slate-700" />
        </button>
        
        <button
          @click="togglePlay"
          :disabled="loading || (podcast.isPremium && isLocked && !audioUrl)"
          class="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <div v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <Pause v-else-if="isPlaying" class="w-6 h-6" />
          <Play v-else class="w-6 h-6" />
        </button>

        <button
          @click="forward"
          :disabled="loading || !audioUrl"
          class="p-2 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Forward 10 seconds"
        >
          <FastForward class="w-5 h-5 text-slate-700" />
        </button>
      </div>
    </div>

    <!-- Hidden audio element -->
    <audio
      ref="audioElement"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @ended="handleEnded"
      @timeupdate="updateTime"
      @loadedmetadata="handleLoadedMetadata"
      @error="handleAudioError"
    ></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject, computed, watch } from 'vue'
import { Play, Pause, Lock, Rewind, FastForward } from 'lucide-vue-next'
import apiService from '@/services/api'
import toast from '@/utils/toast'

const props = defineProps({
  podcast: {
    type: Object,
    required: true,
  },
})

const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value)

const isPlaying = ref(false)
const loading = ref(false)
const audioUrl = ref(props.podcast.audioUrl || null)
const audioElement = ref(null)
const progressBar = ref(null)
const isLocked = ref(props.podcast.isLocked || false)

// Playback state
const currentTime = ref(0)
const duration = ref(0)
// Saved position from localStorage (for display before audio loads)
const savedPosition = ref(null)
const savedDuration = ref(null)

const progressPercent = computed(() => {
  // If we have actual duration, use current time
  if (duration.value > 0) {
    return (currentTime.value / duration.value) * 100
  }
  // Otherwise, use saved position if available
  if (savedDuration.value && savedPosition.value) {
    return (savedPosition.value / savedDuration.value) * 100
  }
  return 0
})

// Display time (use saved position if audio hasn't loaded yet)
const displayTime = computed(() => {
  if (duration.value > 0) {
    return currentTime.value
  }
  if (savedPosition.value) {
    return savedPosition.value
  }
  return 0
})

const displayDuration = computed(() => {
  if (duration.value > 0) {
    return duration.value
  }
  if (savedDuration.value) {
    return savedDuration.value
  }
  return 0
})

// Storage key for saving playback position
const getStorageKey = () => {
  if (!currentUsername.value || !props.podcast.slug) return null
  return `podcast_${currentUsername.value}_${props.podcast.slug}_position`
}

// Format time as MM:SS or HH:MM:SS
const formatTime = (seconds) => {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// Save playback position to localStorage
const savePosition = () => {
  const key = getStorageKey()
  if (key && audioElement.value && duration.value > 0) {
    const position = {
      currentTime: currentTime.value,
      duration: duration.value,
      timestamp: Date.now()
    }
    try {
      localStorage.setItem(key, JSON.stringify(position))
    } catch (err) {
      console.warn('Failed to save playback position:', err)
    }
  }
}

// Load playback position from localStorage (for display)
const loadSavedPosition = () => {
  const key = getStorageKey()
  if (!key) return null
  
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      const position = JSON.parse(saved)
      // Only restore if saved less than 7 days ago
      const daysSince = (Date.now() - position.timestamp) / (1000 * 60 * 60 * 24)
      if (daysSince < 7 && position.currentTime > 0 && position.duration > 0) {
        return {
          currentTime: position.currentTime,
          duration: position.duration
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load playback position:', err)
  }
  return null
}

// Load playback position for audio element (requires audioElement)
const loadPosition = () => {
  const key = getStorageKey()
  if (!key || !audioElement.value) return null
  
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      const position = JSON.parse(saved)
      // Only restore if saved less than 7 days ago
      const daysSince = (Date.now() - position.timestamp) / (1000 * 60 * 60 * 24)
      if (daysSince < 7 && position.currentTime > 0) {
        return position.currentTime
      }
    }
  } catch (err) {
    console.warn('Failed to load playback position:', err)
  }
  return null
}

// Track last saved second to avoid saving too frequently
let lastSavedSecond = -1

// Update current time (called by audio element)
const updateTime = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
    // Save position every 5 seconds (only once per 5-second interval)
    const currentSecond = Math.floor(currentTime.value)
    if (currentSecond !== lastSavedSecond && currentSecond % 5 === 0) {
      savePosition()
      lastSavedSecond = currentSecond
    }
  }
}

// Handle metadata loaded
const handleLoadedMetadata = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration || 0
    
    // Update saved duration if we had a saved position
    if (savedDuration.value && duration.value > 0) {
      savedDuration.value = duration.value
    }
    
    // Restore saved position to audio element
    const savedPos = loadPosition()
    if (savedPos !== null && savedPos < duration.value) {
      audioElement.value.currentTime = savedPos
      currentTime.value = savedPos
      // Update saved position ref to match
      savedPosition.value = savedPos
    } else if (savedPosition.value && savedPosition.value < duration.value) {
      // Use the already loaded saved position
      audioElement.value.currentTime = savedPosition.value
      currentTime.value = savedPosition.value
    }
  }
}

// Seek to position on progress bar click
const seekTo = (e) => {
  if (!progressBar.value) return
  
  const rect = progressBar.value.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const percent = Math.max(0, Math.min(1, clickX / rect.width))
  
  // Use actual duration if available, otherwise use saved duration
  const totalDuration = duration.value > 0 ? duration.value : (savedDuration.value || 0)
  if (totalDuration === 0) return
  
  const newTime = percent * totalDuration
  
  // Update audio element if it exists and is loaded
  if (audioElement.value && duration.value > 0) {
    audioElement.value.currentTime = newTime
    currentTime.value = newTime
    savePosition()
  } else {
    // Update saved position for display
    savedPosition.value = newTime
    // Save to localStorage if we have duration
    if (savedDuration.value) {
      const key = getStorageKey()
      if (key) {
        try {
          const position = {
            currentTime: newTime,
            duration: savedDuration.value,
            timestamp: Date.now()
          }
          localStorage.setItem(key, JSON.stringify(position))
        } catch (err) {
          console.warn('Failed to save seek position:', err)
        }
      }
    }
  }
}

// Rewind 10 seconds
const rewind = () => {
  if (!audioElement.value) return
  const newTime = Math.max(0, currentTime.value - 10)
  audioElement.value.currentTime = newTime
  currentTime.value = newTime
  savePosition()
}

// Forward 10 seconds
const forward = () => {
  if (!audioElement.value || duration.value === 0) return
  const newTime = Math.min(duration.value, currentTime.value + 10)
  audioElement.value.currentTime = newTime
  currentTime.value = newTime
  savePosition()
}

const togglePlay = async () => {
  // If premium and locked, show message
  if (props.podcast.isPremium && isLocked.value && !audioUrl.value) {
    toast.warning('This is premium content. Subscribe to this influencer to access premium podcast episodes.')
    return
  }

  // If we don't have audio URL yet, fetch the full episode
  if (!audioUrl.value && !loading.value) {
    await fetchAudioUrl()
    
    // Check if still locked after fetching
    if (!audioUrl.value) {
      // Check if it's premium and locked
      if (props.podcast.isPremium) {
        toast.warning('This is premium content. Subscribe to this influencer to access premium podcast episodes.')
      } else {
        toast.error('Unable to load audio. Please try again later.')
      }
      return
    }
  }

  // If still no audio URL after fetch, can't play
  if (!audioUrl.value || !audioElement.value) {
    toast.error('Audio is not available. Please try again later.')
    return
  }

  // Ensure audio source is set
  if (audioElement.value.src !== audioUrl.value) {
    audioElement.value.src = audioUrl.value
    audioElement.value.load()
    
    // Wait for metadata to load before restoring position
    audioElement.value.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
  }

  if (isPlaying.value) {
    audioElement.value.pause()
    savePosition()
  } else {
    try {
      await audioElement.value.play()
    } catch (err) {
      console.error('Error playing audio:', err)
      isPlaying.value = false
      toast.error('Unable to play audio. Please try again.')
    }
  }
}

const fetchAudioUrl = async () => {
  if (!currentUsername.value || !props.podcast.slug) return
  
  loading.value = true
  try {
    const result = await apiService.getInfluencerPodcastEpisode(currentUsername.value, props.podcast.slug)
    if (result.success && result.data) {
      let data = result.data
      if (data?.data) data = data.data
      
      // Update audio URL
      if (data.audioUrl) {
        audioUrl.value = data.audioUrl
        isLocked.value = false // Audio is available, not locked
        if (audioElement.value) {
          audioElement.value.src = audioUrl.value
        }
      } else if (data.isLocked || result.requiresPurchase) {
        // Premium content is locked
        isLocked.value = true
      }
    } else if (result.requiresPurchase) {
      // Premium content requires purchase
      isLocked.value = true
    }
  } catch (err) {
    console.error('Error fetching podcast episode:', err)
    // Don't show error toast here, let togglePlay handle it
  } finally {
    loading.value = false
  }
}

const handleEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
  // Clear saved position when episode ends
  const key = getStorageKey()
  if (key) {
    try {
      localStorage.removeItem(key)
    } catch (err) {
      console.warn('Failed to clear playback position:', err)
    }
  }
}

const handleAudioError = (e) => {
  console.error('Audio playback error:', e)
  isPlaying.value = false
  // Try to reload the audio
  if (audioElement.value && audioUrl.value) {
    audioElement.value.load()
  }
}

// Watch for audioUrl changes and update audio element
watch(audioUrl, (newUrl) => {
  if (newUrl && audioElement.value) {
    // Remove any existing listeners to avoid duplicates
    audioElement.value.removeEventListener('loadedmetadata', handleLoadedMetadata)
    
    audioElement.value.src = newUrl
    audioElement.value.load()
    
    // Restore position after metadata loads
    audioElement.value.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
  }
})

// Save position periodically while playing
let positionSaveInterval = null

// Initialize component
onMounted(() => {
  // Load saved position immediately for display
  const saved = loadSavedPosition()
  if (saved) {
    savedPosition.value = saved.currentTime
    savedDuration.value = saved.duration
  }
  
  // Set initial audio URL if available
  if (props.podcast.audioUrl) {
    audioUrl.value = props.podcast.audioUrl
  }
  
  // If audio element already has a source, wait for metadata to load
  if (audioElement.value && audioElement.value.src) {
    if (audioElement.value.readyState >= 1) {
      // Metadata already loaded
      handleLoadedMetadata()
    } else {
      // Wait for metadata
      audioElement.value.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
    }
  }
  
  // Set up periodic position saving
  positionSaveInterval = setInterval(() => {
    if (isPlaying.value && audioElement.value) {
      savePosition()
    }
  }, 5000) // Save every 5 seconds
})

onBeforeUnmount(() => {
  // Save final position
  savePosition()
  
  // Clear interval
  if (positionSaveInterval) {
    clearInterval(positionSaveInterval)
  }
  
  // Clean up audio
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.src = ''
  }
})
</script>

<style scoped>
/* Progress bar hover effect */
.group:hover .bg-indigo-600 {
  background-color: rgb(79 70 229 / 0.9);
}

/* Progress bar thumb */
.group:hover .absolute {
  display: block;
}
</style>


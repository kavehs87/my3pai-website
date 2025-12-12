<template>
  <div
    class="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 shadow-md group"
    :class="{ 'cursor-pointer': props.videoUrl }"
    @click="props.videoUrl ? togglePlayPause() : null"
  >
    <!-- Thumbnail/Poster Image (shown first, then hidden when video is ready) -->
    <img
      v-if="showThumbnail"
      :src="finalThumbnailUrl || avatarUrl"
      :alt="finalThumbnailUrl ? 'Profile thumbnail' : 'Profile avatar'"
      class="w-full h-full object-cover transition-opacity duration-500"
      :class="videoReady ? 'opacity-0' : 'opacity-100'"
    />

    <!-- Empty State (no video, no thumbnail, no avatar) -->
    <div
      v-else-if="!finalThumbnailUrl && !avatarUrl"
      class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900"
    >
      <div class="text-center text-slate-400">
        <User class="w-16 h-16 mx-auto mb-2 opacity-50" />
        <p class="text-xs font-medium">No media available</p>
      </div>
    </div>

    <!-- Video Player (lazy loaded, shown when ready) -->
    <video
      v-if="props.videoUrl"
      ref="videoRef"
      :src="props.videoUrl"
      :poster="finalThumbnailUrl || avatarUrl"
      :muted="isMuted"
      :class="[
        'w-full h-full object-cover transition-opacity duration-500 absolute inset-0',
        videoReady ? 'opacity-100' : 'opacity-0'
      ]"
      loop
      playsinline
      preload="none"
      @canplay="handleVideoReady"
    />

    <!-- Minimal Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 pointer-events-none" />

    <!-- Play/Pause Overlay (shown when paused and video exists) -->
    <div
      v-if="props.videoUrl && videoReady && isPaused"
      class="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div class="bg-black/50 backdrop-blur-sm rounded-full p-4">
        <Play class="w-8 h-8 text-white fill-white" />
      </div>
    </div>

    <!-- Controls Overlay -->
    <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
      <!-- Mute Toggle -->
      <button
        v-if="props.videoUrl && videoReady"
        @click.stop="toggleMute"
        class="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 rounded-full transition-colors flex items-center justify-center group/btn"
        :aria-label="isMuted ? 'Unmute video' : 'Mute video'"
      >
        <VolumeX v-if="isMuted" class="w-4 h-4" />
        <Volume2 v-else class="w-4 h-4" />
        <!-- Tooltip -->
        <span class="absolute left-full ml-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
          {{ isMuted ? 'Unmute' : 'Mute' }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { Play, Volume2, VolumeX, Pause, User } from 'lucide-vue-next'

const props = defineProps({
  videoUrl: {
    type: String,
    default: null,
  },
  thumbnailUrl: {
    type: String,
    default: null,
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  // Legacy prop for backward compatibility
  posterUrl: {
    type: String,
    default: null,
  },
})

// Computed fallback: use thumbnailUrl prop if provided, otherwise use posterUrl
const finalThumbnailUrl = computed(() => props.thumbnailUrl || props.posterUrl)

const videoRef = ref(null)
const isMuted = ref(true)
const isPaused = ref(false) // Will be set to false when video auto-plays
const videoReady = ref(false) // Video is loaded and ready to play
const showThumbnail = computed(() => !videoReady.value || !props.videoUrl)

// Watch for mute changes
watch(isMuted, (newVal) => {
  if (videoRef.value) {
    videoRef.value.muted = newVal
  }
})

// Watch for pause state changes
watch(isPaused, (newVal) => {
  if (videoRef.value && videoReady.value) {
    if (newVal) {
      videoRef.value.pause()
    } else {
      videoRef.value.play().catch((err) => {
        console.warn('Video play failed:', err)
        // If autoplay fails, keep it paused
        isPaused.value = true
      })
    }
  }
})

const toggleMute = (e) => {
  e.stopPropagation()
  isMuted.value = !isMuted.value
}

const togglePlayPause = () => {
  if (videoRef.value && videoReady.value) {
    if (videoRef.value.paused) {
      videoRef.value.play()
      isPaused.value = false
    } else {
      videoRef.value.pause()
      isPaused.value = true
    }
  }
}

// Handle video ready to play
const handleVideoReady = () => {
  if (videoRef.value) {
    videoReady.value = true
    // Auto-play the video once it's ready
    videoRef.value.play().then(() => {
      isPaused.value = false
    }).catch((err) => {
      console.warn('Video autoplay failed (may require user interaction):', err)
      // If autoplay fails (browser policy), keep it paused
      isPaused.value = true
    })
  }
}

// Intersection Observer for lazy loading
let observer = null

// Initialize video state
onMounted(() => {
  // Use Intersection Observer to lazy load video when it's in viewport
  if (videoRef.value && props.videoUrl) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video is in viewport, start loading
            if (videoRef.value) {
              videoRef.value.load()
            }
            if (observer) {
              observer.disconnect()
              observer = null
            }
          }
        })
      },
      { rootMargin: '50px' } // Start loading 50px before it comes into view
    )
    
    observer.observe(videoRef.value)
  }
})

// Cleanup observer
onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>


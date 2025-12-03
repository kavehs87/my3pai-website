<template>
  <div v-if="videoUrl" class="intro-video-container">
    <div 
      class="video-wrapper"
      :class="{ 'is-playing': isPlaying, 'is-fullscreen': isFullscreen }"
      @click="togglePlay"
    >
      <video
        ref="videoRef"
        :src="videoUrl"
        :poster="thumbnailUrl"
        playsinline
        loop
        :muted="isMuted"
        class="video-element"
        @play="onPlay"
        @pause="onPause"
        @ended="onEnded"
        @loadedmetadata="onLoadedMetadata"
      />
      
      <!-- Play button overlay -->
      <div v-if="!isPlaying" class="play-overlay">
        <button class="play-btn" @click.stop="togglePlay">
          <Play class="w-8 h-8" />
        </button>
      </div>
      
      <!-- Controls -->
      <div class="video-controls" @click.stop>
        <button class="control-btn mute-btn" @click="toggleMute" :title="isMuted ? 'Unmute' : 'Mute'">
          <VolumeX v-if="isMuted" class="w-4 h-4" />
          <Volume2 v-else class="w-4 h-4" />
        </button>
        
        <button class="control-btn fullscreen-btn" @click="toggleFullscreen" title="Fullscreen">
          <Maximize2 class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Duration badge -->
      <div v-if="formattedDuration && !isPlaying" class="duration-badge">
        {{ formattedDuration }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Play, VolumeX, Volume2, Maximize2 } from 'lucide-vue-next'

const props = defineProps({
  videoUrl: {
    type: String,
    default: null
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  duration: {
    type: Number,
    default: null
  }
})

const videoRef = ref(null)
const isPlaying = ref(false)
const isMuted = ref(true) // Start muted by default
const isFullscreen = ref(false)
const videoDuration = ref(props.duration)

const formattedDuration = computed(() => {
  const dur = videoDuration.value
  if (!dur) return null
  const mins = Math.floor(dur / 60)
  const secs = Math.floor(dur % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const togglePlay = () => {
  if (!videoRef.value) return
  
  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
}

const toggleMute = () => {
  if (!videoRef.value) return
  isMuted.value = !isMuted.value
  videoRef.value.muted = isMuted.value
}

const toggleFullscreen = async () => {
  if (!videoRef.value) return
  
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      isFullscreen.value = false
    } else {
      await videoRef.value.requestFullscreen()
      isFullscreen.value = true
    }
  } catch (err) {
    console.error('Fullscreen error:', err)
  }
}

const onPlay = () => {
  isPlaying.value = true
}

const onPause = () => {
  isPlaying.value = false
}

const onEnded = () => {
  isPlaying.value = false
}

const onLoadedMetadata = () => {
  if (videoRef.value && !videoDuration.value) {
    videoDuration.value = videoRef.value.duration
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.intro-video-container {
  width: 100%;
  margin-bottom: 1rem;
}

.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  max-height: 420px;
  border-radius: 1rem;
  overflow: hidden;
  background: linear-gradient(135deg, #64748b, #475569);
  cursor: pointer;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.15);
}

.play-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  color: #1e293b;
}

.play-btn:hover {
  transform: scale(1.1);
  background: white;
}

.play-btn svg {
  margin-left: 4px; /* Optical alignment for play icon */
}

.video-controls {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.control-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  pointer-events: auto;
  backdrop-filter: blur(4px);
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}

.duration-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

/* When playing, hide the overlay but keep controls visible on hover */
.video-wrapper.is-playing .video-controls {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-wrapper.is-playing:hover .video-controls {
  opacity: 1;
}

@media (max-width: 640px) {
  .video-wrapper {
    max-height: 360px;
  }
  
  .play-btn {
    width: 56px;
    height: 56px;
  }
  
  .control-btn {
    width: 32px;
    height: 32px;
  }
}
</style>


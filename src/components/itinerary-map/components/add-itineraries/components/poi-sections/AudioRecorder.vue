<template>
  <div class="audio-recorder">
    <div v-if="!audioFile && !isRecording" class="audio-recorder-empty">
      <button
        type="button"
        class="record-button"
        @mousedown="startRecording"
        @mouseup="stopRecording"
        @mouseleave="cancelRecording"
        @touchstart.prevent="startRecording"
        @touchend.prevent="stopRecording"
        @touchcancel.prevent="cancelRecording"
      >
        <i class="fas fa-microphone"></i>
        <span>Hold to record</span>
      </button>
      <label class="upload-button">
        <input
          type="file"
          accept="audio/*"
          @change="handleFileUpload"
          ref="fileInput"
        />
        <i class="fas fa-upload"></i>
        <span>Upload audio</span>
      </label>
    </div>

    <div v-else-if="isRecording" class="audio-recorder-recording">
      <div class="recording-indicator">
        <div class="pulse-ring"></div>
        <i class="fas fa-microphone recording-icon"></i>
      </div>
      <div class="recording-info">
        <div class="recording-time">{{ formatTime(recordingDuration) }}</div>
        <div class="recording-hint">Release to stop recording</div>
      </div>
      <button
        type="button"
        class="cancel-recording-button"
        @click="cancelRecording"
        title="Cancel recording"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div v-else-if="audioFile" class="audio-recorder-player">
      <div class="audio-player-header">
        <button
          type="button"
          class="play-pause-button"
          @click="togglePlayback"
          :class="{ playing: isPlaying }"
        >
          <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
        </button>
        <div class="audio-info">
          <div class="audio-name">{{ audioFileName }}</div>
          <div class="audio-duration">{{ formatTime(audioDuration) }}</div>
        </div>
        <button
          type="button"
          class="delete-button"
          @click="deleteAudio"
          title="Delete audio"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
      <div class="audio-waveform">
        <canvas ref="waveformCanvas" class="waveform-canvas"></canvas>
        <div
          class="waveform-progress"
          :style="{ width: playbackProgress + '%' }"
        ></div>
      </div>
      <div class="audio-controls">
        <div class="time-display">
          <span>{{ formatTime(currentTime) }}</span>
          <span>/</span>
          <span>{{ formatTime(audioDuration) }}</span>
        </div>
        <input
          type="range"
          class="audio-seek"
          :min="0"
          :max="audioDuration"
          :value="currentTime"
          @input="seekAudio"
          @change="seekAudio"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AudioRecorder',
  props: {
    modelValue: {
      type: [File, String, null],
      default: null
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isRecording: false,
      recordingDuration: 0,
      recordingTimer: null,
      mediaRecorder: null,
      audioChunks: [],
      audioFile: null,
      audioFileName: '',
      audioElement: null,
      isPlaying: false,
      currentTime: 0,
      audioDuration: 0,
      playbackProgress: 0,
      animationFrame: null,
      audioContext: null,
      analyser: null,
      dataArray: null,
      waveformData: []
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newValue) {
        if (newValue instanceof File) {
          this.loadAudioFile(newValue)
        } else if (typeof newValue === 'string' && newValue) {
          // URL string - for existing audio
          this.audioFile = newValue
          this.audioFileName = 'Audio recording'
          this.loadAudioFromUrl(newValue)
        } else if (!newValue) {
          this.resetAudio()
        }
      }
    }
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    async startRecording(event) {
      // Prevent default to avoid context menu on long press
      if (event) {
        event.preventDefault()
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.mediaRecorder = new MediaRecorder(stream)
        this.audioChunks = []

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data)
          }
        }

        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
          const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, {
            type: 'audio/webm'
          })
          this.loadAudioFile(audioFile)
          this.stopMediaStream(stream)
        }

        this.mediaRecorder.start()
        this.isRecording = true
        this.recordingDuration = 0
        this.startRecordingTimer()
      } catch (error) {
        console.error('Error starting recording:', error)
        this.$emit('error', 'Unable to access microphone. Please check permissions.')
      }
    },
    stopRecording() {
      if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop()
        this.isRecording = false
        this.stopRecordingTimer()
      }
    },
    cancelRecording() {
      if (this.isRecording) {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop()
        }
        this.isRecording = false
        this.recordingDuration = 0
        this.stopRecordingTimer()
        this.audioChunks = []
      }
    },
    startRecordingTimer() {
      this.recordingTimer = setInterval(() => {
        this.recordingDuration += 0.1
      }, 100)
    },
    stopRecordingTimer() {
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer)
        this.recordingTimer = null
      }
    },
    stopMediaStream(stream) {
      stream.getTracks().forEach((track) => track.stop())
    },
    handleFileUpload(event) {
      const file = event.target.files?.[0]
      if (file && file.type.startsWith('audio/')) {
        this.loadAudioFile(file)
      } else {
        this.$emit('error', 'Please select a valid audio file.')
      }
      // Reset input to allow selecting the same file again
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    loadAudioFile(file) {
      this.audioFile = file
      this.audioFileName = file.name
      this.createAudioElement(URL.createObjectURL(file))
      this.$emit('update:modelValue', file)
    },
    async loadAudioFromUrl(url) {
      try {
        const response = await fetch(url)
        const blob = await response.blob()
        const file = new File([blob], 'audio-recording', { type: blob.type })
        this.createAudioElement(url)
        this.$emit('update:modelValue', file)
      } catch (error) {
        console.error('Error loading audio from URL:', error)
      }
    },
    createAudioElement(src) {
      if (this.audioElement) {
        this.audioElement.pause()
        this.audioElement.removeEventListener('timeupdate', this.updatePlaybackProgress)
        this.audioElement.removeEventListener('loadedmetadata', this.updateAudioDuration)
        this.audioElement.removeEventListener('ended', this.onAudioEnded)
      }

      this.audioElement = new Audio(src)
      this.audioElement.addEventListener('timeupdate', this.updatePlaybackProgress)
      this.audioElement.addEventListener('loadedmetadata', this.updateAudioDuration)
      this.audioElement.addEventListener('ended', this.onAudioEnded)

      this.audioElement.load()
      this.generateWaveform()
    },
    updateAudioDuration() {
      if (this.audioElement) {
        this.audioDuration = this.audioElement.duration || 0
      }
    },
    updatePlaybackProgress() {
      if (this.audioElement) {
        this.currentTime = this.audioElement.currentTime
        this.playbackProgress = this.audioDuration
          ? (this.currentTime / this.audioDuration) * 100
          : 0
      }
    },
    onAudioEnded() {
      this.isPlaying = false
      this.currentTime = 0
      this.playbackProgress = 0
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
        this.animationFrame = null
      }
    },
    togglePlayback() {
      if (!this.audioElement) return

      if (this.isPlaying) {
        this.audioElement.pause()
        this.isPlaying = false
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame)
          this.animationFrame = null
        }
      } else {
        this.audioElement.play()
        this.isPlaying = true
        this.animateWaveform()
      }
    },
    seekAudio(event) {
      if (!this.audioElement) return
      const seekTime = parseFloat(event.target.value)
      this.audioElement.currentTime = seekTime
      this.currentTime = seekTime
      this.playbackProgress = this.audioDuration ? (seekTime / this.audioDuration) * 100 : 0
    },
    deleteAudio() {
      this.resetAudio()
      this.$emit('update:modelValue', null)
    },
    resetAudio() {
      if (this.audioElement) {
        this.audioElement.pause()
        this.audioElement.removeEventListener('timeupdate', this.updatePlaybackProgress)
        this.audioElement.removeEventListener('loadedmetadata', this.updateAudioDuration)
        this.audioElement.removeEventListener('ended', this.onAudioEnded)
        this.audioElement = null
      }
      this.audioFile = null
      this.audioFileName = ''
      this.isPlaying = false
      this.currentTime = 0
      this.audioDuration = 0
      this.playbackProgress = 0
      this.waveformData = []
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
        this.animationFrame = null
      }
      if (this.audioContext) {
        this.audioContext.close()
        this.audioContext = null
      }
    },
    async generateWaveform() {
      if (!this.audioFile || !this.$refs.waveformCanvas) return

      try {
        const canvas = this.$refs.waveformCanvas
        const ctx = canvas.getContext('2d')
        const width = canvas.offsetWidth
        const height = canvas.offsetHeight
        canvas.width = width
        canvas.height = height

        // Create audio context for waveform analysis
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const source = this.audioContext.createMediaElementSource(this.audioElement)
        this.analyser = this.audioContext.createAnalyser()
        this.analyser.fftSize = 256
        source.connect(this.analyser)
        this.analyser.connect(this.audioContext.destination)

        const bufferLength = this.analyser.frequencyBinCount
        this.dataArray = new Uint8Array(bufferLength)

        // Draw initial waveform
        this.drawWaveform(ctx, width, height)
      } catch (error) {
        console.error('Error generating waveform:', error)
        // Draw a simple placeholder waveform
        this.drawPlaceholderWaveform()
      }
    },
    drawWaveform(ctx, width, height) {
      if (!this.analyser || !this.dataArray) {
        this.drawPlaceholderWaveform()
        return
      }

      this.analyser.getByteFrequencyData(this.dataArray)

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#6366f1'
      ctx.strokeStyle = '#6366f1'
      ctx.lineWidth = 2

      const barWidth = width / this.dataArray.length
      const centerY = height / 2

      for (let i = 0; i < this.dataArray.length; i++) {
        const barHeight = (this.dataArray[i] / 255) * height * 0.6
        const x = i * barWidth

        ctx.beginPath()
        ctx.moveTo(x, centerY - barHeight / 2)
        ctx.lineTo(x, centerY + barHeight / 2)
        ctx.stroke()
      }
    },
    drawPlaceholderWaveform() {
      const canvas = this.$refs.waveformCanvas
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      canvas.width = width
      canvas.height = height

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#e5e7eb'
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 2

      const barCount = 50
      const barWidth = width / barCount
      const centerY = height / 2

      for (let i = 0; i < barCount; i++) {
        const barHeight = (Math.random() * 0.4 + 0.2) * height
        const x = i * barWidth

        ctx.beginPath()
        ctx.moveTo(x, centerY - barHeight / 2)
        ctx.lineTo(x, centerY + barHeight / 2)
        ctx.stroke()
      }
    },
    animateWaveform() {
      if (!this.isPlaying || !this.$refs.waveformCanvas) return

      const canvas = this.$refs.waveformCanvas
      const ctx = canvas.getContext('2d')
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight

      this.drawWaveform(ctx, width, height)
      this.animationFrame = requestAnimationFrame(() => this.animateWaveform())
    },
    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    cleanup() {
      this.stopRecording()
      this.resetAudio()
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer)
      }
    }
  }
}
</script>

<style scoped>
.audio-recorder {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
}

.audio-recorder-empty {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.record-button,
.upload-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-lg);
  border: 2px dashed var(--border-medium);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
  min-width: 120px;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.record-button:hover,
.upload-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.record-button:active {
  transform: scale(0.95);
  background: rgba(99, 102, 241, 0.1);
}

.upload-button input[type='file'] {
  display: none;
}

.record-button i,
.upload-button i {
  font-size: 24px;
}

.audio-recorder-recording {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-lg);
}

.recording-indicator {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-ring {
  position: absolute;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.3);
  animation: pulse 1.5s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.recording-icon {
  position: relative;
  z-index: 1;
  font-size: 24px;
  color: #ef4444;
}

.recording-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.recording-time {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.recording-hint {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.cancel-recording-button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.cancel-recording-button:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
}

.audio-recorder-player {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.audio-player-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.play-pause-button {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.play-pause-button:hover {
  filter: brightness(0.9);
  transform: scale(1.05);
}

.play-pause-button.playing {
  background: #ef4444;
}

.play-pause-button i {
  font-size: 18px;
}

.audio-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}

.audio-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audio-duration {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.delete-button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.delete-button:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.audio-waveform {
  position: relative;
  width: 100%;
  height: 60px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-tertiary);
}

.waveform-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.waveform-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(99, 102, 241, 0.2);
  pointer-events: none;
  transition: width 0.1s linear;
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.time-display {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  white-space: nowrap;
  min-width: 80px;
  text-align: right;
}

.audio-seek {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--bg-tertiary);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.audio-seek::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.audio-seek::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}

.audio-seek::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: none;
  transition: all var(--transition-normal);
}

.audio-seek::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}

@media (max-width: 768px) {
  .audio-recorder-empty {
    flex-direction: column;
  }

  .record-button,
  .upload-button {
    width: 100%;
  }
}
</style>


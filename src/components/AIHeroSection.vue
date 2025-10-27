<template>
  <section class="ai-prompt-bar">
    <div class="container">
      <div class="prompt-container">
        <!-- Main Prompt Input -->
        <div class="prompt-input-wrapper">
          <!-- Image preview indicator -->
          <div class="image-indicator" v-if="imagePreview">
            <img :src="imagePreview" alt="Uploaded image" class="image-preview" />
            <button class="remove-image-btn" @click="removeImage" title="Remove image">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <!-- Voice indicator -->
          <div class="voice-indicator" v-if="audioBlob">
            <i class="fas fa-microphone"></i>
            <span class="voice-duration">{{ formatDuration(recordingDuration) }}</span>
            <button class="remove-voice-btn" @click="removeVoice" title="Remove voice">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <input
            v-model="prompt"
            @input="handleInput"
            @keydown="handleKeydown"
            @focus="showSuggestions = true"
            @blur="hideSuggestions"
            placeholder="Share your dream trip. I'll map the way."
            class="prompt-input"
            ref="promptInput"
          />
        </div>

        <!-- Left Side Icons -->
        <div class="left-icons">
          <!-- Loading indicator -->
          <div class="loading-indicator" v-if="isLoading">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <!-- Add attachment button -->
          <button class="icon-btn" @click="triggerFileUpload" title="Add image" v-else>
            <i class="fas fa-image"></i>
          </button>
          <!-- Hidden file input -->
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileUpload" 
            accept="image/*" 
            style="display: none;"
          />
        </div>

        <!-- Right Side Icons -->
        <div class="right-icons">
          <button 
            class="icon-btn" 
            :class="{ 'recording': isRecording, 'active': isMicrophoneActive }"
            @click="toggleMicrophone" 
            :title="isRecording ? 'Stop recording' : 'Start recording'"
          >
            <i class="fas fa-microphone" v-if="!isRecording"></i>
            <i class="fas fa-stop" v-else></i>
          </button>
          <button class="send-btn" @click="handleSubmit" :disabled="!prompt.trim()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>

      <!-- Suggestions Dropdown -->
      <div class="suggestions-dropdown" v-if="showSuggestions && suggestions.length > 0">
        <div 
          class="suggestion-item" 
          v-for="(suggestion, index) in suggestions" 
          :key="index"
          @click="selectSuggestion(suggestion)"
        >
          <i class="far fa-lightbulb"></i>
          <span>{{ suggestion }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AIHeroSection',
  data() {
    return {
      prompt: '',
      showSuggestions: false,
      suggestions: [],
      isMicrophoneActive: false,
      isLoading: false,
      uploadedImage: null,
      imagePreview: null,
      isRecording: false,
      mediaRecorder: null,
      audioChunks: [],
      audioBlob: null,
      recordingDuration: 0,
      recordingStartTime: null,
      dummyData: {
        destinations: [
          { name: 'Tokyo', country: 'Japan', highlights: ['Temples', 'Food', 'Culture'] },
          { name: 'Paris', country: 'France', highlights: ['Art', 'Architecture', 'Cuisine'] },
          { name: 'Bali', country: 'Indonesia', highlights: ['Beaches', 'Temples', 'Nature'] },
          { name: 'New York', country: 'USA', highlights: ['Skyscrapers', 'Broadway', 'Museums'] },
          { name: 'Santorini', country: 'Greece', highlights: ['Sunsets', 'Beaches', 'Architecture'] },
          { name: 'Dubai', country: 'UAE', highlights: ['Modern City', 'Desert', 'Shopping'] }
        ]
      }
    }
  },
  methods: {
    handleInput() {
      this.generateSuggestions()
    },
    
    handleKeydown(event) {
      if (event.key === 'Enter') {
        event.preventDefault()
        this.handleSubmit()
      }
    },
    
    generateSuggestions() {
      if (!this.prompt.trim()) {
        this.showSuggestions = false
        return
      }
      
      const query = this.prompt.toLowerCase()
      this.suggestions = []
      
      // Always show general suggestions
      this.suggestions.push(
        'Plan a 7-day trip to Japan',
        'Find romantic destinations for couples',
        'Budget-friendly family vacation ideas',
        'Adventure travel recommendations',
        'Cultural immersion experiences'
      )
      
      // Add specific suggestions based on input
      if (query.includes('japan') || query.includes('tokyo')) {
        this.suggestions.push('Tokyo food tour itinerary', 'Kyoto temple hopping guide')
      }
      if (query.includes('beach') || query.includes('tropical')) {
        this.suggestions.push('Best tropical beach destinations', 'Island hopping adventures')
      }
      if (query.includes('budget') || query.includes('cheap')) {
        this.suggestions.push('Budget travel tips', 'Affordable accommodation options')
      }
      
      this.showSuggestions = true
    },
    
    selectSuggestion(suggestion) {
      this.prompt = suggestion
      this.showSuggestions = false
      this.handleSubmit()
    },
    
    hideSuggestions() {
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    },
    
    handleSubmit() {
      if (!this.prompt.trim()) return
      
      console.log('AI Prompt submitted:', this.prompt)
      
      // Show loading state
      this.isLoading = true
      this.showSuggestions = false
      
      // Simulate AI processing (replace with actual API call)
      setTimeout(() => {
        this.isLoading = false
        // TODO: Handle AI response and show results
        console.log('AI processing complete')
      }, 2000) // 2 second delay to simulate thinking
    },
    
    // Icon button handlers
    triggerFileUpload() {
      this.$refs.fileInput.click()
    },
    
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        this.uploadedImage = file
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
        }
        reader.readAsDataURL(file)
        
        console.log('Image uploaded:', file.name)
        // TODO: Upload to server or process image
      }
    },
    
    removeImage() {
      this.uploadedImage = null
      this.imagePreview = null
      this.$refs.fileInput.value = ''
    },
    
    async toggleMicrophone() {
      if (!this.isMicrophoneActive) {
        // Request microphone permission
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          this.isMicrophoneActive = true
          console.log('Microphone permission granted')
          
          // Start recording
          this.startRecording(stream)
        } catch (error) {
          console.error('Microphone permission denied:', error)
          alert('Microphone permission is required for voice input. Please allow access and try again.')
        }
      } else {
        // Stop recording
        this.stopRecording()
      }
    },
    
    startRecording(stream) {
      this.mediaRecorder = new MediaRecorder(stream)
      this.audioChunks = []
      this.isRecording = true
      this.recordingStartTime = Date.now()
      this.recordingDuration = 0
      
      // Update duration every second
      this.durationInterval = setInterval(() => {
        this.recordingDuration = Math.floor((Date.now() - this.recordingStartTime) / 1000)
      }, 1000)
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data)
      }
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
        this.audioBlob = audioBlob
        console.log('Recording stopped, audio blob created:', audioBlob)
        
        // Clear duration interval
        if (this.durationInterval) {
          clearInterval(this.durationInterval)
        }
        
        // TODO: Send audio to speech-to-text service
        this.processAudio(audioBlob)
      }
      
      this.mediaRecorder.start()
      console.log('Recording started')
    },
    
    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop()
        this.isRecording = false
        this.isMicrophoneActive = false
        
        // Stop all tracks to release microphone
        if (this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
        }
      }
    },
    
    processAudio(audioBlob) {
      // TODO: Implement speech-to-text conversion
      console.log('Processing audio for speech-to-text...')
      // For now, just simulate processing
      setTimeout(() => {
        console.log('Audio processed (simulated)')
        // In real implementation, this would convert speech to text and update the prompt
      }, 1000)
    },
    
    removeVoice() {
      this.audioBlob = null
      this.recordingDuration = 0
      this.recordingStartTime = null
      if (this.durationInterval) {
        clearInterval(this.durationInterval)
      }
    },
    
    formatDuration(seconds) {
      if (seconds < 60) {
        return `${seconds}s`
      } else {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
      }
    },
  }
}
</script>

<style scoped>
.ai-prompt-bar {
  background: var(--bg-primary);
  padding: var(--spacing-lg) 0;
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 1001;
}

.prompt-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: #e9e9e9;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.prompt-input-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.image-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs);
}

.image-preview {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.remove-image-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all var(--transition-normal);
}

.remove-image-btn:hover {
  background: rgba(255, 0, 0, 0.2);
  color: #ff4444;
}

.voice-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: rgba(0, 150, 255, 0.1);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs);
}

.voice-indicator i {
  color: #0096ff;
  font-size: 12px;
}

.voice-duration {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 500;
  min-width: 20px;
}

.remove-voice-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all var(--transition-normal);
}

.remove-voice-btn:hover {
  background: rgba(255, 0, 0, 0.2);
  color: #ff4444;
}

.prompt-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  font-family: var(--font-family);
}

.prompt-input::placeholder {
  color: var(--text-secondary);
}

.left-icons,
.right-icons {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.icon-btn {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  background: var(--text-secondary);
  border-radius: 50%;
  animation: loading-bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.send-btn {
  background: var(--bg-primary);
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.send-btn:hover:not(:disabled) {
  background: var(--secondary-color);
  color: var(--bg-primary);
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  padding: var(--spacing-md);
  margin-top: var(--spacing-sm);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.suggestion-item:hover {
  background: var(--bg-secondary);
}

.suggestion-item i {
  color: var(--secondary-color);
  font-size: var(--font-size-sm);
}

.suggestion-item span {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

/* Active states for toggle buttons */
.icon-btn.active {
  background: var(--secondary-color);
  color: var(--bg-primary);
}

.icon-btn.active:hover {
  background: #059669;
}

/* Recording animation */
.icon-btn.recording {
  animation: pulse 1.5s infinite;
  background: rgba(255, 0, 0, 0.2);
  color: #ff4444;
}

.icon-btn.active {
  background: rgba(0, 255, 0, 0.2);
  color: #00aa00;
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(255, 0, 0, 0);
  }
}

@media (max-width: 768px) {
  .prompt-container {
    padding: var(--spacing-sm) var(--spacing-md);
    gap: var(--spacing-sm);
  }
  
  .left-icons,
  .right-icons {
    gap: var(--spacing-xs);
  }
  
  .icon-btn {
    width: 28px;
    height: 28px;
    padding: var(--spacing-xs);
  }
  
  .send-btn {
    width: 36px;
    height: 36px;
  }
}
</style>

<template>
  <section class="ai-hero">
    <div class="container">
      <div class="ai-hero-content">
        <!-- Main Title -->
        <h1 class="ai-hero-title">
          Share your dream trip.<br>
          <span class="ai-hero-subtitle">I'll map the way.</span>
        </h1>

        <!-- AI Prompt Interface -->
        <div class="ai-prompt-container">
          <div class="ai-prompt-box">
            <!-- Voice Input Button -->
            <button 
              class="voice-btn" 
              :class="{ 'recording': isRecording }"
              @click="toggleVoiceRecording"
              :disabled="isProcessing"
            >
              <i class="fas fa-microphone" v-if="!isRecording"></i>
              <i class="fas fa-stop" v-else></i>
            </button>

            <!-- Text Input -->
            <div class="input-container">
              <textarea
                v-model="prompt"
                @input="handleInput"
                @keydown="handleKeydown"
                @paste="handlePaste"
                placeholder="Describe your dream trip... Where do you want to go? What do you want to experience?"
                class="ai-prompt-input"
                :disabled="isProcessing"
                ref="promptInput"
              ></textarea>
              
              <!-- Image Upload Area -->
              <div 
                class="image-upload-area"
                :class="{ 'drag-over': isDragOver, 'has-image': uploadedImage }"
                @click="triggerFileInput"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @drop.prevent="handleDrop"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  style="display: none"
                />
                
                <div v-if="!uploadedImage" class="upload-placeholder">
                  <i class="fas fa-image"></i>
                  <span>Add photos</span>
                </div>
                
                <div v-else class="uploaded-image">
                  <img :src="uploadedImage" alt="Uploaded image" />
                  <button class="remove-image" @click.stop="removeImage">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Send Button -->
            <button 
              class="send-btn"
              @click="handleSubmit"
              :disabled="!prompt.trim() || isProcessing"
              :class="{ 'processing': isProcessing }"
            >
              <i class="fas fa-paper-plane" v-if="!isProcessing"></i>
              <i class="fas fa-spinner fa-spin" v-else></i>
            </button>
          </div>

          <!-- Suggestions -->
          <div class="ai-suggestions" v-if="showSuggestions && suggestions.length > 0">
            <div class="suggestion-item" 
                 v-for="(suggestion, index) in suggestions" 
                 :key="index"
                 @click="selectSuggestion(suggestion)"
            >
              <i class="fas fa-lightbulb"></i>
              <span>{{ suggestion }}</span>
            </div>
          </div>

          <!-- Live Results Preview -->
          <div class="ai-results-preview" v-if="showResults && liveResults.length > 0">
            <div class="results-header">
              <h3>AI is planning your trip...</h3>
              <div class="processing-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
            </div>
            
            <div class="results-grid">
              <div 
                class="result-card" 
                v-for="(result, index) in liveResults" 
                :key="index"
                @click="selectResult(result)"
              >
                <div class="result-type">{{ result.type }}</div>
                <h4>{{ result.title }}</h4>
                <p>{{ result.description }}</p>
                <div class="result-meta">
                  <span class="result-location">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ result.location }}
                  </span>
                  <span class="result-duration">
                    <i class="fas fa-clock"></i>
                    {{ result.duration }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Features -->
        <div class="ai-features">
          <div class="feature">
            <i class="fas fa-brain"></i>
            <span>AI-Powered</span>
          </div>
          <div class="feature">
            <i class="fas fa-users"></i>
            <span>Creator Itineraries</span>
          </div>
          <div class="feature">
            <i class="fas fa-fork"></i>
            <span>Fork & Customize</span>
          </div>
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
      uploadedImage: null,
      isRecording: false,
      isProcessing: false,
      isDragOver: false,
      showSuggestions: false,
      showResults: false,
      suggestions: [],
      liveResults: [],
      dummyData: {
        destinations: [
          { name: 'Tokyo', country: 'Japan', highlights: ['Temples', 'Food', 'Culture'] },
          { name: 'Paris', country: 'France', highlights: ['Art', 'Architecture', 'Cuisine'] },
          { name: 'Bali', country: 'Indonesia', highlights: ['Beaches', 'Temples', 'Nature'] },
          { name: 'New York', country: 'USA', highlights: ['Skyscrapers', 'Broadway', 'Museums'] },
          { name: 'Santorini', country: 'Greece', highlights: ['Sunsets', 'Beaches', 'Architecture'] },
          { name: 'Dubai', country: 'UAE', highlights: ['Modern City', 'Desert', 'Shopping'] }
        ],
        hotels: [
          { name: 'Luxury Resort', location: 'Maldives', rating: 5, price: '$500/night' },
          { name: 'Boutique Hotel', location: 'Paris', rating: 4, price: '$200/night' },
          { name: 'Beach Villa', location: 'Bali', rating: 5, price: '$300/night' }
        ],
        restaurants: [
          { name: 'Fine Dining', cuisine: 'French', location: 'Paris', rating: 5 },
          { name: 'Street Food', cuisine: 'Thai', location: 'Bangkok', rating: 4 },
          { name: 'Sushi Bar', cuisine: 'Japanese', location: 'Tokyo', rating: 5 }
        ],
        attractions: [
          { name: 'Eiffel Tower', category: 'Landmark', location: 'Paris', duration: '2 hours' },
          { name: 'Temple Visit', category: 'Culture', location: 'Kyoto', duration: '3 hours' },
          { name: 'Beach Day', category: 'Relaxation', location: 'Maldives', duration: 'Full day' }
        ]
      }
    }
  },
  methods: {
    handleInput() {
      this.generateSuggestions()
      this.generateLiveResults()
    },
    
    handleKeydown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        this.handleSubmit()
      }
    },
    
    handlePaste(event) {
      const items = event.clipboardData.items
      for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile()
          this.handleImageUpload(file)
        }
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
    
    generateLiveResults() {
      if (!this.prompt.trim()) {
        this.showResults = false
        return
      }
      
      const query = this.prompt.toLowerCase()
      this.liveResults = []
      
      // Generate results based on query
      if (query.includes('japan') || query.includes('tokyo')) {
        this.liveResults.push(
          {
            type: 'Destination',
            title: 'Tokyo, Japan',
            description: 'Experience the perfect blend of traditional culture and modern innovation',
            location: 'Japan',
            duration: '7 days'
          },
          {
            type: 'Attraction',
            title: 'Senso-ji Temple',
            description: 'Tokyo\'s oldest temple with traditional architecture and cultural significance',
            location: 'Asakusa, Tokyo',
            duration: '2 hours'
          }
        )
      } else if (query.includes('beach') || query.includes('tropical')) {
        this.liveResults.push(
          {
            type: 'Destination',
            title: 'Maldives',
            description: 'Paradise islands with crystal clear waters and luxury resorts',
            location: 'Indian Ocean',
            duration: '5 days'
          },
          {
            type: 'Activity',
            title: 'Snorkeling Adventure',
            description: 'Explore vibrant coral reefs and marine life',
            location: 'Maldives',
            duration: '3 hours'
          }
        )
      } else {
        // General results
        this.liveResults.push(
          {
            type: 'Destination',
            title: 'Paris, France',
            description: 'The City of Light with world-class art, cuisine, and architecture',
            location: 'France',
            duration: '5 days'
          },
          {
            type: 'Experience',
            title: 'Food Tour',
            description: 'Discover local cuisine and hidden culinary gems',
            location: 'Paris',
            duration: '4 hours'
          }
        )
      }
      
      this.showResults = true
    },
    
    selectSuggestion(suggestion) {
      this.prompt = suggestion
      this.showSuggestions = false
      this.handleSubmit()
    },
    
    selectResult(result) {
      console.log('Selected result:', result)
      // TODO: Navigate to result detail page
    },
    
    handleSubmit() {
      if (!this.prompt.trim()) return
      
      console.log('AI Prompt submitted:', this.prompt)
      console.log('Uploaded image:', this.uploadedImage)
      
      this.isProcessing = true
      this.showSuggestions = false
      
      // Simulate AI processing
      setTimeout(() => {
        this.isProcessing = false
        // TODO: Integrate with AI backend
      }, 2000)
    },
    
    toggleVoiceRecording() {
      if (this.isRecording) {
        this.stopVoiceRecording()
      } else {
        this.startVoiceRecording()
      }
    },
    
    startVoiceRecording() {
      this.isRecording = true
      // TODO: Implement voice recording
      console.log('Voice recording started')
    },
    
    stopVoiceRecording() {
      this.isRecording = false
      // TODO: Process voice input
      console.log('Voice recording stopped')
    },
    
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.handleImageUpload(file)
      }
    },
    
    handleDragOver(event) {
      this.isDragOver = true
    },
    
    handleDragLeave(event) {
      this.isDragOver = false
    },
    
    handleDrop(event) {
      this.isDragOver = false
      const files = event.dataTransfer.files
      if (files.length > 0) {
        this.handleImageUpload(files[0])
      }
    },
    
    handleImageUpload(file) {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.uploadedImage = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    
    removeImage() {
      this.uploadedImage = null
    }
  }
}
</script>

<style scoped>
.ai-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: var(--spacing-3xl) 0;
  color: var(--bg-primary);
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.ai-hero-content {
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.ai-hero-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  line-height: 1.2;
}

.ai-hero-subtitle {
  color: #e2e8f0;
  font-weight: 400;
}

.ai-prompt-container {
  position: relative;
  max-width: 800px;
  margin: 0 auto var(--spacing-xl);
}

.ai-prompt-box {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-md);
  position: relative;
}

.voice-btn {
  background: var(--secondary-color);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-full);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.voice-btn:hover {
  background: #059669;
  transform: scale(1.05);
}

.voice-btn.recording {
  background: #ef4444;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.input-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.ai-prompt-input {
  width: 100%;
  min-height: 120px;
  border: none;
  outline: none;
  font-size: var(--font-size-lg);
  font-family: var(--font-family);
  resize: none;
  background: transparent;
  color: var(--text-primary);
}

.ai-prompt-input::placeholder {
  color: var(--text-muted);
}

.image-upload-area {
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload-area:hover,
.image-upload-area.drag-over {
  border-color: var(--secondary-color);
  background: rgba(16, 185, 129, 0.05);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-muted);
}

.upload-placeholder i {
  font-size: var(--font-size-xl);
}

.uploaded-image {
  position: relative;
  width: 100%;
  height: 80px;
}

.uploaded-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: var(--radius-full);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
}

.send-btn {
  background: var(--secondary-color);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-full);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #059669;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
}

.send-btn.processing {
  background: var(--secondary-color);
}

.ai-suggestions {
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

.ai-results-preview {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-sm);
  z-index: 1000;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.results-header h3 {
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  margin: 0;
}

.processing-indicator {
  display: flex;
  gap: var(--spacing-xs);
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--secondary-color);
  border-radius: var(--radius-full);
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.result-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.result-type {
  background: var(--secondary-color);
  color: var(--bg-primary);
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  display: inline-block;
  margin-bottom: var(--spacing-sm);
}

.result-card h4 {
  color: var(--text-primary);
  font-size: var(--font-size-base);
  margin: 0 0 var(--spacing-sm) 0;
}

.result-card p {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.4;
}

.result-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.result-meta i {
  margin-right: var(--spacing-xs);
}

.ai-features {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  color: rgba(255, 255, 255, 0.9);
}

.feature i {
  font-size: var(--font-size-xl);
  color: var(--secondary-color);
}

.feature span {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

@media (max-width: 768px) {
  .ai-hero-title {
    font-size: var(--font-size-3xl);
  }
  
  .ai-prompt-box {
    flex-direction: column;
    align-items: stretch;
  }
  
  .voice-btn,
  .send-btn {
    align-self: center;
  }
  
  .ai-features {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>

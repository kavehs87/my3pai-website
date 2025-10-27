<template>
  <section class="ai-prompt-bar">
    <div class="container">
      <div class="prompt-container">
        <!-- Main Prompt Input -->
        <div class="prompt-input-wrapper">
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
          <button class="icon-btn" @click="addAttachment" title="Add attachment">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- Right Side Icons -->
        <div class="right-icons">
          <button class="icon-btn" @click="toggleMicrophone" title="Microphone">
            <i class="fas fa-microphone"></i>
          </button>
          <button class="send-btn" @click="handleSubmit" :disabled="!prompt.trim()">
            <i class="fas fa-waveform-lines"></i>
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
          <i class="fas fa-lightbulb"></i>
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
      
      // TODO: Integrate with AI backend
      this.showSuggestions = false
    },
    
    // Icon button handlers
    addAttachment() {
      console.log('Add attachment clicked')
      // TODO: Implement file upload
    },
    
    toggleMicrophone() {
      this.isMicrophoneActive = !this.isMicrophoneActive
      console.log('Microphone toggled:', this.isMicrophoneActive)
    }
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
  z-index: 100;
}

.prompt-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: #363636;
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.prompt-input-wrapper {
  flex: 1;
  min-width: 0;
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
  color: #9ca3af;
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
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
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

<template>
  <div class="inline-prompt">
    <div class="prompt-input-wrapper">
      <input
        v-model="query"
        class="prompt-input"
        type="text"
        :placeholder="placeholder"
        @keydown.enter.prevent="emitSubmit"
      />
    </div>
    <div class="left-icons">
      <button class="icon-btn" type="button" @click="emitImage" title="Add image">
        <i class="fas fa-image"></i>
      </button>
      <button class="icon-btn" type="button" @click="emitMic" title="Record voice">
        <i class="fas fa-microphone"></i>
      </button>
    </div>
    <div class="right-icons">
      <button class="send-btn" type="button" @click="emitSubmit" title="Send">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InlinePromptBar',
  props: { placeholder: { type: String, default: "Share your dream trip. I'll map the way." } },
  data() { return { query: '' } },
  methods: {
    emitSubmit() { this.$emit('submit', this.query.trim()) },
    emitImage() { this.$emit('pick-image') },
    emitMic() { this.$emit('mic') },
  }
}
</script>

<style scoped>
.inline-prompt { 
  display: flex; 
  align-items: center; 
  gap: var(--spacing-md); 
  width: 100%; 
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

.prompt-input { 
  width: 100%; 
  border: none; 
  outline: none; 
  background: transparent; 
  color: var(--text-primary); 
  font-size: var(--font-size-lg); 
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
</style>



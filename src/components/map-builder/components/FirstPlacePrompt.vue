<template>
  <div v-if="visible" class="first-place-prompt" @click="handleClick">
    <div class="prompt-overlay"></div>
    <div class="prompt-content">
      <div class="prompt-box">
        <div class="prompt-icon">
          <i class="fas fa-route"></i>
        </div>
        <h3 class="prompt-title">Create your map</h3>
        <p class="prompt-subtitle">Click to get started</p>
      </div>
      <div class="prompt-info">
        <p>Each entry in this digital travel book is your personal opinion and lived experience of a specific location, written to help travelers understand the place better and recreate the kind of trip you had there. You are not just listing facts, you are curating how to enjoy the spot: what to do, what to avoid, when to go, and how it really feels. All of your entries for a region or theme are bundled into one ultimate package that appears on your profile as a single, easy-to-buy product. This package stays live and updateable, so you can refine tips, add new spots, or adjust details over time as you revisit the area or gain new insights.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FirstPlacePrompt',
  props: {
    visible: {
      type: Boolean,
      default: true
    }
  },
  emits: ['click'],
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.first-place-prompt {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: auto;
  animation: fadeIn 0.5s ease-out;
  padding: var(--spacing-xl);
  gap: var(--spacing-2xl);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.prompt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: -1;
}

.prompt-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
  max-width: 800px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.prompt-box {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl) var(--spacing-3xl);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 280px;
}

.prompt-box:hover {
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.prompt-info {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl) var(--spacing-2xl);
  max-width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.prompt-info p {
  font-size: var(--font-size-sm);
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-align: left;
}

.prompt-icon {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: var(--spacing-md);
  display: flex;
  justify-content: center;
  align-items: center;
}

.prompt-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: white;
  margin: 0 0 var(--spacing-sm) 0;
}

.prompt-subtitle {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

@media (max-width: 768px) {
  .first-place-prompt {
    padding: var(--spacing-md);
    gap: var(--spacing-lg);
  }

  .prompt-box {
    padding: var(--spacing-xl) var(--spacing-lg);
    min-width: 240px;
  }

  .prompt-icon {
    font-size: 40px;
  }

  .prompt-title {
    font-size: var(--font-size-lg);
  }

  .prompt-info {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .prompt-info p {
    font-size: var(--font-size-xs);
    line-height: 1.6;
  }
}
</style>


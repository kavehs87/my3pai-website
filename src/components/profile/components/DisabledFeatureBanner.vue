<template>
  <div v-if="!isEnabled" class="disabled-feature-banner">
    <div class="banner-content">
      <div class="banner-icon">
        <i class="fas fa-eye-slash"></i>
      </div>
      <div class="banner-text">
        <h3>This feature is currently disabled</h3>
        <p>
          The <strong>{{ featureName }}</strong> section is hidden on your public profile page. 
          Click the button below to enable it and make it visible to visitors.
        </p>
      </div>
      <button 
        class="banner-action" 
        @click="enableFeature"
        :disabled="enabling"
      >
        <i :class="enabling ? 'fas fa-spinner fa-spin' : 'fas fa-toggle-on'"></i>
        {{ enabling ? 'Enabling...' : 'Enable Feature' }}
      </button>
    </div>
  </div>
</template>

<script>
import apiService from '@/services/api'
import toast from '@/utils/toast'
import eventBus from '@/utils/eventBus'

export default {
  name: 'DisabledFeatureBanner',
  props: {
    isEnabled: {
      type: Boolean,
      required: true,
      default: true
    },
    featureName: {
      type: String,
      required: true
    },
    toolId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      enabling: false
    }
  },
  methods: {
    async enableFeature() {
      this.enabling = true
      try {
        const result = await apiService.updateCreatorToolsVisibility({
          [this.toolId]: true
        })
        
        if (result.success) {
          toast.success(`${this.featureName} enabled successfully!`)
          // Emit event to update parent component and other listeners
          eventBus.emit('creator-tools-visibility-changed', {
            toolId: this.toolId,
            enabled: true
          })
          // Emit to parent to update isEnabled prop
          this.$emit('enabled')
        } else {
          toast.error(result.error || 'Failed to enable feature')
        }
      } catch (err) {
        toast.error(err.message || 'Failed to enable feature')
      } finally {
        this.enabling = false
      }
    }
  }
}
</script>

<style scoped>
.disabled-feature-banner {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 2px solid #f59e0b;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.banner-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.banner-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  background: #f59e0b;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
  min-width: 0;
}

.banner-text h3 {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: #92400e;
  margin: 0 0 var(--spacing-xs) 0;
}

.banner-text p {
  font-size: var(--font-size-sm);
  color: #78350f;
  margin: 0;
  line-height: 1.5;
}

.banner-text strong {
  font-weight: 700;
  color: #92400e;
}

.banner-action {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: #f59e0b;
  color: white;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: 600;
  font-size: var(--font-size-sm);
  white-space: nowrap;
  transition: all var(--transition-normal);
  flex-shrink: 0;
  border: none;
  cursor: pointer;
  font-family: var(--font-family);
}

.banner-action:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.banner-action:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.banner-action i {
  font-size: var(--font-size-base);
}

@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .banner-action {
    width: 100%;
    justify-content: center;
  }
}
</style>


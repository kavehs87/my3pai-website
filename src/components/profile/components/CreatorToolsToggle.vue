<template>
  <div class="creator-tools-toggle">
    <div class="section-header">
      <h2><i class="fas fa-toggle-on"></i> Creator Tools Visibility</h2>
      <p class="section-description">Enable or disable features on your public profile page.</p>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Loading settings...
    </div>

    <div v-else class="tools-list">
      <div
        v-for="tool in tools"
        :key="tool.id"
        class="tool-item"
        :class="{ disabled: !tool.enabled }"
      >
        <div class="tool-info">
          <div class="tool-icon" :class="tool.id === 'media-assets' ? 'tool-icon-media-assets' : tool.id">
            <i :class="tool.icon"></i>
          </div>
          <div class="tool-details">
            <h3>{{ tool.label }}</h3>
            <p>{{ tool.description }}</p>
          </div>
        </div>
        <div class="tool-toggle">
          <label class="toggle-switch">
            <input
              type="checkbox"
              :checked="tool.enabled"
              @change="toggleTool(tool.id, $event.target.checked)"
              :disabled="saving"
            />
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-status" :class="{ active: tool.enabled }">
            {{ tool.enabled ? 'Enabled' : 'Disabled' }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i> {{ error }}
    </div>
  </div>
</template>

<script>
import apiService from '@/services/api'
import toast from '@/utils/toast'
import eventBus from '@/utils/eventBus'

export default {
  name: 'CreatorToolsToggle',
  data() {
    return {
      loading: false,
      saving: false,
      error: null,
      tools: [
        {
          id: 'blog',
          label: 'Blog',
          description: 'Show your blog posts on your public profile',
          icon: 'fas fa-blog',
          enabled: true
        },
        {
          id: 'podcast',
          label: 'Podcast',
          description: 'Display your podcast episodes',
          icon: 'fas fa-podcast',
          enabled: true
        },
        {
          id: 'masterclass',
          label: 'Training & Masterclasses',
          description: 'Show your training courses and masterclasses',
          icon: 'fas fa-graduation-cap',
          enabled: true
        },
        {
          id: 'consultation',
          label: 'Consultations',
          description: 'Display consultation booking options',
          icon: 'fas fa-video',
          enabled: true
        },
        {
          id: 'media-assets',
          label: 'Digital Assets',
          description: 'Show your digital assets marketplace',
          icon: 'fas fa-photo-video',
          enabled: true
        },
        {
          id: 'creator',
          label: 'Creator Profile',
          description: 'Show your full creator profile information',
          icon: 'fas fa-id-card',
          enabled: true
        }
      ]
    }
  },
  mounted() {
    this.loadSettings()
  },
  methods: {
    async loadSettings() {
      this.loading = true
      this.error = null
      try {
        const result = await apiService.getCreatorToolsVisibility()
        if (result.success) {
          const settings = result.data?.data || result.data || {}
          // Update each tool's enabled state from API response
          // API uses 'media-assets' with hyphen (as per OpenAPI spec)
          this.tools = this.tools.map(tool => ({
            ...tool,
            enabled: settings[tool.id] ?? true // Default to true if not set
          }))
        } else {
          // If endpoint doesn't exist yet, use defaults (all enabled)
          console.log('Creator tools visibility endpoint not available, using defaults')
        }
      } catch (err) {
        console.error('Failed to load creator tools visibility:', err)
        // Don't show error to user if endpoint doesn't exist yet
        // Just use defaults (all enabled)
      } finally {
        this.loading = false
      }
    },
    async toggleTool(toolId, enabled) {
      this.saving = true
      this.error = null
      
      // Optimistically update UI
      const tool = this.tools.find(t => t.id === toolId)
      if (tool) {
        tool.enabled = enabled
      }

      try {
        // API uses 'media-assets' with hyphen (as per OpenAPI spec)
        const result = await apiService.updateCreatorToolsVisibility({
          [toolId]: enabled
        })
        
        if (result.success) {
          toast.success(`${tool?.label || 'Tool'} ${enabled ? 'enabled' : 'disabled'}`)
          // Emit event so other components can update
          eventBus.emit('creator-tools-visibility-changed', {
            toolId: toolId,
            enabled: enabled
          })
        } else {
          // Revert on error
          if (tool) {
            tool.enabled = !enabled
          }
          this.error = result.error || 'Failed to update setting'
          toast.error(this.error)
        }
      } catch (err) {
        // Revert on error
        if (tool) {
          tool.enabled = !enabled
        }
        this.error = err.message || 'Failed to update setting'
        toast.error(this.error)
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.creator-tools-toggle {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: var(--spacing-xl);
}

.section-header h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-header h2 i {
  color: var(--secondary-color);
}

.section-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
  padding: 0;
  line-height: 1.4;
  text-align: left;
}

.loading-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--text-secondary);
}

.tools-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.tool-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  transition: all var(--transition-normal);
}

.tool-item:hover {
  border-color: var(--border-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tool-item.disabled {
  opacity: 0.6;
}

.tool-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.tool-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  color: white;
  background: var(--secondary-color);
  flex-shrink: 0;
}

.tool-icon.blog,
.tool-icon.podcast,
.tool-icon.masterclass,
.tool-icon.consultation,
.tool-icon-media-assets,
.tool-icon.creator {
  background: var(--secondary-color);
}

.tool-details h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.tool-details p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.tool-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-medium);
  transition: var(--transition-normal);
  border-radius: 28px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: var(--transition-normal);
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--secondary-color);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle-switch input:disabled + .toggle-slider {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-status {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toggle-status.active {
  color: var(--secondary-color);
}

.error-message {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error-color);
  border-radius: var(--radius-md);
  color: var(--error-color);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.error-message i {
  font-size: var(--font-size-base);
}

@media (max-width: 768px) {
  .tool-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .tool-toggle {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>


<template>
  <div class="theme-selector-section">
    <div class="section-header">
      <h2><i class="fas fa-palette"></i> Profile Theme</h2>
    </div>
    
    <p class="section-description">
      Choose a theme for your public profile page. The theme affects the layout, colors, and styling of your profile.
    </p>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Loading themes...
    </div>

    <div v-else class="themes-grid">
      <div
        v-for="theme in availableThemes"
        :key="theme.id"
        :class="['theme-card', { active: selectedTheme === theme.id, saving: saving === theme.id }]"
        @click="selectTheme(theme.id)"
      >
        <div class="theme-preview">
          <img
            v-if="theme.preview"
            :src="theme.preview"
            :alt="theme.name"
            @error="handlePreviewError"
          />
          <div v-else class="theme-preview-placeholder">
            <i class="fas fa-image"></i>
          </div>
          <div v-if="selectedTheme === theme.id" class="theme-check">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>
        <div class="theme-info">
          <h3 class="theme-name">{{ theme.name }}</h3>
          <p class="theme-description">{{ theme.description }}</p>
        </div>
        <div v-if="saving === theme.id" class="theme-saving">
          <i class="fas fa-spinner fa-spin"></i> Saving...
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </div>

    <div class="theme-actions">
      <router-link
        v-if="selectedTheme && profileUsername"
        :to="`/influencer/${profileUsername}`"
        target="_blank"
        class="preview-btn"
      >
        <i class="fas fa-external-link-alt"></i>
        Preview Your Profile
      </router-link>
    </div>
  </div>
</template>

<script>
import { getAvailableThemes } from '@/themes'
import apiService from '@/services/api'
import toast from '@/utils/toast'

export default {
  name: 'ProfileThemeSelector',
  props: {
    currentTheme: {
      type: String,
      default: 'modern'
    },
    profileUsername: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      availableThemes: [],
      selectedTheme: this.currentTheme || 'modern',
      loading: false,
      saving: null,
      error: null
    }
  },
  mounted() {
    this.loadThemes()
    this.selectedTheme = this.currentTheme || 'modern'
  },
  watch: {
    currentTheme(newTheme) {
      this.selectedTheme = newTheme || 'modern'
    }
  },
  methods: {
    loadThemes() {
      try {
        this.availableThemes = getAvailableThemes()
      } catch (err) {
        console.error('Failed to load themes:', err)
        this.error = 'Failed to load themes'
      }
    },
    async selectTheme(themeId) {
      if (this.selectedTheme === themeId || this.saving) {
        return
      }

      this.error = null
      this.saving = themeId

      try {
        // Update theme using existing profile endpoint (backend supports partial updates)
        const result = await apiService.updateProfile({ theme: themeId })

        if (result.success) {
          this.selectedTheme = themeId
          toast.success(`Theme changed to ${this.getThemeName(themeId)}`)
          
          // Emit event to update parent component
          this.$emit('theme-changed', themeId)
          
          // Reload profile data to reflect changes
          this.$emit('reload-profile')
        } else {
          this.error = result.error || 'Failed to save theme'
          toast.error(this.error)
        }
      } catch (err) {
        this.error = err.message || 'Failed to save theme'
        toast.error(this.error)
      } finally {
        this.saving = null
      }
    },
    getThemeName(themeId) {
      const theme = this.availableThemes.find(t => t.id === themeId)
      return theme ? theme.name : themeId
    },
    handlePreviewError(event) {
      // Hide broken image
      event.target.style.display = 'none'
    }
  }
}
</script>

<style scoped>
.theme-selector-section {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.section-header h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-header i {
  color: var(--secondary-color);
}

.section-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.loading-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

.themes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.theme-card {
  background: var(--bg-primary);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.theme-card:hover {
  border-color: var(--secondary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.theme-card.active {
  border-color: var(--secondary-color);
  box-shadow: 0 4px 16px rgba(72, 196, 200, 0.2);
}

.theme-card.saving {
  opacity: 0.7;
  cursor: not-allowed;
}

.theme-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--bg-secondary);
  overflow: hidden;
}

.theme-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.theme-preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  color: var(--text-muted);
  font-size: 3rem;
}

.theme-check {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 32px;
  height: 32px;
  background: var(--secondary-color);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.theme-info {
  padding: var(--spacing-lg);
}

.theme-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.theme-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.theme-saving {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--text-primary);
  font-weight: 500;
}

.error-message {
  background: var(--error-color);
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.theme-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

.preview-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--secondary-color);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--transition-normal);
}

.preview-btn:hover {
  background: var(--secondary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .themes-grid {
    grid-template-columns: 1fr;
  }
}
</style>


<template>
  <div class="personal-experience">
    <div class="field-group">
      <label>Personal experience <span>*</span></label>
      <textarea
        v-model="experience"
        :maxlength="2000"
        placeholder="Share your honest experience, what made this place special, how it felt, what you would tell a friend..."
      ></textarea>
      <div class="actions-row space-between">
        <button type="button" class="ghost-button">
          <i class="fas fa-wand-magic-sparkles"></i>
          Polish my text
        </button>
        <div class="char-count">{{ experience.length }}/2000</div>
      </div>
    </div>
  </div>
</template>

<script>
const defaultValue = () => ({
  experience: ''
})

export default {
  name: 'PersonalExperienceSection',
  props: {
    modelValue: {
      type: Object,
      default: () => defaultValue()
    }
  },
  emits: ['update:modelValue'],
  computed: {
    experience: {
      get() {
        return this.modelValue?.experience || ''
      },
      set(value) {
        this.$emit('update:modelValue', {
          ...defaultValue(),
          ...(this.modelValue || {}),
          experience: value
        })
      }
    }
  }
}
</script>

<style scoped>
.personal-experience {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

textarea {
  width: 100%;
  min-height: 200px;
  padding: var(--spacing-md);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  resize: vertical;
}

.actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-xs);
  gap: var(--spacing-sm);
}

.ghost-button {
  border: 1px dashed var(--border-medium);
  background: transparent;
  color: var(--text-secondary);
  padding: var(--spacing-2xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.ghost-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.char-count {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-left: auto;
}
</style>


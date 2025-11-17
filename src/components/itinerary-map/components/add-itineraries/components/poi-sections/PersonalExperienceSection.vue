<template>
  <div class="personal-experience">
    <div class="field-group">
      <label>Personal experience <span>*</span></label>
      <textarea
        v-model="form.experience"
        :maxlength="1000"
        placeholder="Share your honest experience, what made this place special, how it felt, what you would tell a friend..."
      ></textarea>
      <div class="char-counter">{{ form.experience.length }}/1000</div>
    </div>

    <div class="ai-suggestion">
      <i class="fas fa-magic"></i>
      <button type="button" class="link-button">Polish my text</button>
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
  data() {
    return {
      form: { ...defaultValue(), ...this.modelValue }
    }
  },
  watch: {
    modelValue: {
      deep: true,
      handler(newVal) {
        this.form = { ...defaultValue(), ...newVal }
      }
    },
    form: {
      deep: true,
      handler(newVal) {
        this.$emit('update:modelValue', { ...newVal })
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

.char-counter {
  text-align: right;
  color: var(--text-light);
  font-size: var(--font-size-xs);
}

.ai-suggestion {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.ai-suggestion i {
  color: #f7b733;
}

.link-button {
  background: none;
  border: none;
  padding: 0;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
}
</style>


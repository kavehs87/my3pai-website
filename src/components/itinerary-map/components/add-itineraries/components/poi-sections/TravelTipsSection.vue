<template>
  <div class="travel-tips">
    <div class="field-group">
      <label>Suggestion to wear and take</label>
      <textarea
        v-model="form.wearAndTake"
        placeholder="e.g. Good hiking shoes, rain jacket, snacks..."
      ></textarea>
    </div>

    <div class="field-group">
      <label>Things to do nearby</label>
      <textarea
        v-model="form.nearby"
        placeholder="Names of other points of interest to suggest"
      ></textarea>
    </div>

    <div class="field-group">
      <label>Insider tips</label>
      <textarea
        v-model="form.insiderTips"
        placeholder="e.g. - Bring water shoes&#10;- Arrive before 10:00 to get parking"
      ></textarea>
    </div>

    <div class="field-group">
      <label>Safety notes</label>
      <textarea
        v-model="form.safetyNotes"
        placeholder="e.g. - Steep drop near viewpoint&#10;- Check weather before train ride"
      ></textarea>
    </div>
  </div>
</template>

<script>
const defaultValue = () => ({
  wearAndTake: '',
  nearby: '',
  insiderTips: '',
  safetyNotes: ''
})

export default {
  name: 'TravelTipsSection',
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
.travel-tips {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
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
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  min-height: 110px;
  resize: vertical;
}
</style>


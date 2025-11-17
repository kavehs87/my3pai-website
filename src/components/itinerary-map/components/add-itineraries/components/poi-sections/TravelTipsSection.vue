<template>
  <div class="travel-tips">
    <div class="field-group">
      <label>Suggestion to wear and take</label>
      <textarea
        v-model="wearAndTake"
        placeholder="e.g. Good hiking shoes, rain jacket, snacks..."
      ></textarea>
      <div class="actions-row space-between">
        <button type="button" class="ghost-button">
          <i class="fas fa-wand-magic-sparkles"></i>
          Polish my text
        </button>
        <div class="char-count">{{ wearAndTakeLength }} chars</div>
      </div>
    </div>

    <div class="field-group">
      <label>Things to do nearby</label>
      <textarea
        v-model="nearby"
        placeholder="Names of other points of interest to suggest"
      ></textarea>
      <div class="actions-row space-between">
        <button type="button" class="ghost-button">
          <i class="fas fa-wand-magic-sparkles"></i>
          Polish my text
        </button>
        <div class="char-count">{{ nearbyLength }} chars</div>
      </div>
    </div>

    <div class="field-group">
      <label>Insider tips</label>
      <textarea
        v-model="insiderTips"
        placeholder="e.g. - Bring water shoes&#10;- Arrive before 10:00 to get parking"
      ></textarea>
      <div class="actions-row space-between">
        <button type="button" class="ghost-button">
          <i class="fas fa-wand-magic-sparkles"></i>
          Polish my text
        </button>
        <div class="char-count">{{ insiderTipsLength }} chars</div>
      </div>
    </div>

    <div class="field-group">
      <label>Safety notes</label>
      <textarea
        v-model="safetyNotes"
        placeholder="e.g. - Steep drop near viewpoint&#10;- Check weather before train ride"
      ></textarea>
      <div class="actions-row space-between">
        <button type="button" class="ghost-button">
          <i class="fas fa-wand-magic-sparkles"></i>
          Polish my text
        </button>
        <div class="char-count">{{ safetyNotesLength }} chars</div>
      </div>
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
  computed: {
    wearAndTake: {
      get() {
        return this.modelValue?.wearAndTake || ''
      },
      set(value) {
        this.updateField('wearAndTake', value)
      }
    },
    nearby: {
      get() {
        return this.modelValue?.nearby || ''
      },
      set(value) {
        this.updateField('nearby', value)
      }
    },
    insiderTips: {
      get() {
        return this.modelValue?.insiderTips || ''
      },
      set(value) {
        this.updateField('insiderTips', value)
      }
    },
    safetyNotes: {
      get() {
        return this.modelValue?.safetyNotes || ''
      },
      set(value) {
        this.updateField('safetyNotes', value)
      }
    },
    wearAndTakeLength() {
      return this.wearAndTake?.length || 0
    },
    nearbyLength() {
      return this.nearby?.length || 0
    },
    insiderTipsLength() {
      return this.insiderTips?.length || 0
    },
    safetyNotesLength() {
      return this.safetyNotes?.length || 0
    }
  },
  methods: {
    updateField(key, value) {
      this.$emit('update:modelValue', {
        ...defaultValue(),
        ...(this.modelValue || {}),
        [key]: value
      })
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


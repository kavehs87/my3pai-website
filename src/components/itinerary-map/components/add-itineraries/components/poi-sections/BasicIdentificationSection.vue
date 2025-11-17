<template>
  <div class="basic-identification">
    <div class="form-grid">
      <div class="form-fields">
        <div class="field-group">
          <label>POI Name <span>*</span></label>
          <input
            type="text"
            v-model="form.name"
            placeholder="Enter the main title"
          />
        </div>

        <div class="field-group">
          <label>Short Title / Tagline <span>*</span></label>
          <input
            type="text"
            v-model="form.tagline"
            placeholder="A catchy tagline appears here."
          />
        </div>

        <div class="field-group">
          <label>Brief Summary <span>*</span></label>
          <textarea
            v-model="form.summary"
            maxlength="400"
            placeholder="Describe the essence of this point of interest."
          ></textarea>
          <div class="char-count">{{ summaryLength }}/400</div>
        </div>
      </div>

      <div class="pdf-preview">
        <div class="preview-box">
          <span>PDF Preview</span>
        </div>
        <button class="btn ghost" type="button">
          <i class="fas fa-file-pdf"></i>
          Open PDF
        </button>
      </div>
    </div>

    <div class="ai-suggestion">
      <i class="fas fa-wand-magic-sparkles"></i>
      <button type="button" class="link-button">Ask AI to summarise</button>
    </div>

    <div class="location-grid">
      <div class="field-group">
        <label>Country <span>*</span></label>
        <select v-model="form.country">
          <option value="">Select a country</option>
          <option value="Switzerland">Switzerland</option>
        </select>
      </div>

      <div class="field-group">
        <label>Region / State / Canton <span>*</span></label>
        <input
          type="text"
          v-model="form.region"
          placeholder="Enter the region"
        />
      </div>
    </div>

    <div class="location-grid">
      <div class="field-group">
        <label>Nearest Town / Landmark <span>*</span></label>
        <input
          type="text"
          v-model="form.landmark"
          placeholder="e.g. Zermatt"
        />
      </div>

      <div class="field-group">
        <label>Pin Accuracy</label>
        <select v-model="form.pinAccuracy">
          <option value="">Exact</option>
          <option value="approximate">Approximate</option>
          <option value="estimate">Estimated</option>
        </select>
      </div>
    </div>

    <div class="location-grid">
      <div class="field-group">
        <label>Latitude <span>*</span></label>
        <input
          type="text"
          v-model="form.latitude"
          placeholder="46.5197"
        />
      </div>

      <div class="field-group">
        <label>Longitude <span>*</span></label>
        <input
          type="text"
          v-model="form.longitude"
          placeholder="6.6323"
        />
      </div>
    </div>

    <div class="ai-suggestion">
      <i class="fas fa-wand-magic-sparkles"></i>
      <button type="button" class="link-button">Ask AI to find coordinates</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BasicIdentificationSection',
  props: {
    modelValue: {
      type: Object,
      default: () => ({
        name: '',
        tagline: '',
        summary: '',
        country: '',
        region: '',
        landmark: '',
        pinAccuracy: '',
        latitude: '',
        longitude: ''
      })
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      form: { ...this.modelValue }
    }
  },
  watch: {
    modelValue: {
      deep: true,
      handler(newVal) {
        this.form = { ...newVal }
      }
    },
    form: {
      deep: true,
      handler(newVal) {
        this.$emit('update:modelValue', { ...newVal })
      }
    }
  },
  computed: {
    summaryLength() {
      return this.form.summary?.length || 0
    }
  }
}
</script>

<style scoped>
.basic-identification {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: var(--spacing-lg);
}

.form-fields {
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

label span {
  color: var(--error-color, #ef4444);
}

input,
select,
textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.char-count {
  text-align: right;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.pdf-preview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: stretch;
}

.preview-box {
  flex: 1;
  border: 1px dashed var(--border-light);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  background: var(--bg-secondary);
}

.btn.ghost {
  border: 1px solid var(--border-light);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.btn.ghost:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.ai-suggestion {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.link-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.location-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-md);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>


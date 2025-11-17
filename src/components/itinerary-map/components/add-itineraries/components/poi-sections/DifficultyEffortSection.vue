<template>
  <div class="difficulty-effort">
    <div class="grid two-cols">
      <div class="field-group">
        <label>Difficulty rating</label>
        <select v-model="difficulty">
          <option value="" disabled>Select difficulty</option>
          <option v-for="option in difficultyOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <div class="field-group">
        <label>Required fitness</label>
        <select v-model="fitness">
          <option value="" disabled>Select required fitness</option>
          <option
            v-for="fitnessOption in fitnessOptions"
            :key="fitnessOption.value"
            :value="fitnessOption.value"
          >
            {{ fitnessOption.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="grid two-cols">
      <div class="field-group">
        <label>Nearest public transport</label>
        <input
          type="text"
          v-model="distance"
          placeholder="e.g. 5 min walk to station"
        />
      </div>
      <div class="field-group">
        <label>Elevation open sea</label>
        <input
          type="text"
          v-model="elevationGain"
          placeholder="e.g. 1500 m above sea level"
        />
      </div>
    </div>

    <div class="pill-group">
      <div class="group-label">Terrain type</div>
      <div class="pill-list">
        <button
          v-for="terrainOption in terrainOptions"
          :key="terrainOption.value"
          type="button"
          class="pill"
          :class="{ active: terrain.includes(terrainOption.value) }"
          @click="toggleTerrain(terrainOption.value)"
        >
          {{ terrainOption.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const defaultValue = () => ({
  difficulty: '',
  distance: '',
  elevationGain: '',
  fitness: '',
  terrain: []
})

const ensureArray = (value) => (Array.isArray(value) ? value : [])

export default {
  name: 'DifficultyEffortSection',
  props: {
    modelValue: {
      type: Object,
      default: () => defaultValue()
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      difficultyOptions: [
        { label: 'Very Easy', value: 'very-easy' },
        { label: 'Easy', value: 'easy' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Challenging', value: 'challenging' },
        { label: 'Hard', value: 'hard' },
        { label: 'Extreme', value: 'extreme' }
      ],
      terrainOptions: [
        { label: 'Paved', value: 'paved' },
        { label: 'Gravel', value: 'gravel' },
        { label: 'Forest trail', value: 'forest-trail' },
        { label: 'Rocky', value: 'rocky' },
        { label: 'Exposed', value: 'exposed' },
        { label: 'Narrow path', value: 'narrow-path' },
        { label: 'Steps', value: 'steps' }
      ],
      fitnessOptions: [
        { label: '1. Casual', value: 'casual' },
        { label: '2. Active', value: 'active' },
        { label: '3. Fit', value: 'fit' },
        { label: '4. Athletic', value: 'athletic' },
        { label: '5. Elite', value: 'elite' }
      ]
    }
  },
  computed: {
    difficulty: {
      get() {
        return this.modelValue?.difficulty || ''
      },
      set(value) {
        this.updateField('difficulty', value)
      }
    },
    distance: {
      get() {
        return this.modelValue?.distance || ''
      },
      set(value) {
        this.updateField('distance', value)
      }
    },
    elevationGain: {
      get() {
        return this.modelValue?.elevationGain || ''
      },
      set(value) {
        this.updateField('elevationGain', value)
      }
    },
    fitness: {
      get() {
        return this.modelValue?.fitness || ''
      },
      set(value) {
        this.updateField('fitness', value)
      }
    },
    terrain: {
      get() {
        return ensureArray(this.modelValue?.terrain)
      },
      set(value) {
        this.updateField('terrain', ensureArray(value))
      }
    }
  },
  methods: {
    toggleTerrain(value) {
      const list = ensureArray(this.terrain)
      const exists = list.includes(value)
      const next = exists ? list.filter((item) => item !== value) : [...list, value]
      this.terrain = next
    },
    updateField(key, value) {
      const base = { ...defaultValue(), ...(this.modelValue || {}) }
      base[key] = value
      this.$emit('update:modelValue', base)
    }
  }
}
</script>

<style scoped>
.difficulty-effort {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.grid.two-cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

input,
select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.pill-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.group-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.pill-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.pill {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  background: var(--bg-primary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.pill.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.pill:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
</style>


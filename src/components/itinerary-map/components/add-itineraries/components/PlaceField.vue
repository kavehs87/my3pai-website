<template>
  <div class="place-field" :class="{ 'has-items': hasItems }" @click="handleClick">
    <div class="field-content">
      <div class="field-placeholder">
        <i v-if="icon" :class="icon" class="field-icon"></i>
        <span>{{ text || placeholder }}</span>
        <i class="fas fa-plus field-add-icon"></i>
      </div>
      <div v-if="hasItems" class="field-items">
        <slot name="items">
          <div class="item-count">{{ itemCount }} point{{ itemCount !== 1 ? 's' : '' }} of interest</div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlaceField',
  props: {
    text: {
      type: String,
      default: 'Add your first point of interest'
    },
    placeholder: {
      type: String,
      default: 'Add your first point of interest'
    },
    icon: {
      type: String,
      default: 'fas fa-map-marker-alt'
    },
    itemCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['click'],
  computed: {
    hasItems() {
      return this.itemCount > 0
    }
  },
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.place-field {
  background: var(--bg-secondary);
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  min-height: 60px;
  display: flex;
  align-items: center;
}

.place-field:hover {
  border-color: var(--border-medium);
  background: var(--bg-tertiary);
  transform: translateY(-1px);
}

.place-field.has-items {
  border-style: solid;
  border-color: var(--border-medium);
  background: var(--bg-primary);
}

.field-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.field-placeholder {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  font-weight: 500;
  flex: 1;
}

.field-icon {
  color: var(--text-secondary);
  opacity: 0.7;
  font-size: var(--font-size-lg);
}

.field-add-icon {
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  margin-left: auto;
}

.field-items {
  display: flex;
  align-items: center;
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-weight: 500;
}

.item-count {
  color: var(--text-primary);
}
</style>


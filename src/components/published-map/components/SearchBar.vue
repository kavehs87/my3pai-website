<template>
  <div class="search-bar">
    <i class="fas fa-search search-icon"></i>
    <input
      type="text"
      class="search-input"
      placeholder="Search in these locations..."
      :value="searchQuery"
      @input="handleInput"
      @keyup.enter="handleSearch"
    />
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleInput(event) {
      this.$emit('search-changed', event.target.value)
    },
    handleSearch() {
      this.$emit('search-submitted', this.searchQuery)
    }
  }
}
</script>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: var(--spacing-lg);
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) calc(var(--spacing-md) * 2 + 20px);
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px rgba(72, 196, 200, 0.1);
}

.search-input::placeholder {
  color: var(--text-muted);
}
</style>


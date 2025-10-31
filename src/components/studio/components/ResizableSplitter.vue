<template>
  <div
    class="resizable-splitter"
    :class="{ 'is-dragging': isDragging }"
    @mousedown="startDrag"
  >
    <div class="splitter-handle"></div>
  </div>
</template>

<script>
export default {
  name: 'ResizableSplitter',
  props: {
    orientation: { type: String, default: 'vertical' } // 'vertical' or 'horizontal'
  },
  data() {
    return {
      isDragging: false
    }
  },
  methods: {
    startDrag(e) {
      this.isDragging = true
      document.addEventListener('mousemove', this.handleDrag)
      document.addEventListener('mouseup', this.stopDrag)
      e.preventDefault()
      this.$emit('drag-start')
    },
    handleDrag(e) {
      if (!this.isDragging) return
      this.$emit('drag', e)
    },
    stopDrag() {
      if (this.isDragging) {
        this.isDragging = false
        document.removeEventListener('mousemove', this.handleDrag)
        document.removeEventListener('mouseup', this.stopDrag)
        this.$emit('drag-end')
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this.handleDrag)
    document.removeEventListener('mouseup', this.stopDrag)
  }
}
</script>

<style scoped>
.resizable-splitter {
  position: relative;
  flex-shrink: 0;
  width: 8px;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background-color 0.2s;
}

.resizable-splitter:hover,
.resizable-splitter.is-dragging {
  background-color: rgba(72, 196, 200, 0.2);
}

.splitter-handle {
  width: 2px;
  height: 60%;
  background: var(--border-light);
  border-radius: 1px;
  transition: background-color 0.2s;
}

.resizable-splitter:hover .splitter-handle,
.resizable-splitter.is-dragging .splitter-handle {
  background: var(--secondary-color);
  width: 3px;
}
</style>

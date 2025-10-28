<template>
  <aside class="sidebar">
    <div class="sidebar-section">
      <button class="sidebar-item" type="button">
        <i class="fas fa-bed"></i>
        <span>Accommodation</span>
      </button>
      <button class="sidebar-item" type="button">
        <i class="fas fa-border-all"></i>
        <span>Activities</span>
      </button>
      <button class="sidebar-item" type="button">
        <i class="fas fa-utensils"></i>
        <span>Food & Drink</span>
      </button>
      <button class="sidebar-item" type="button">
        <i class="fas fa-plane"></i>
        <span>Transportation</span>
      </button>
      <button class="sidebar-item" type="button">
        <i class="fas fa-car-side"></i>
        <span>Car</span>
      </button>
      <button class="sidebar-item" type="button">
        <i class="fas fa-plane-departure"></i>
        <span>Flight</span>
      </button>
      <button class="sidebar-item" type="button">
        <i class="fas fa-grip"></i>
        <span>Other</span>
      </button>
    </div>
  </aside>
</template>

<script>
export default { name: 'StudioSidebar' }
</script>

<style scoped>
.sidebar { background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 12px; box-shadow: var(--shadow-light); }
.sidebar-section { display: flex; flex-direction: column; gap: 12px; }
.sidebar-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-md); background: var(--bg-secondary); border: 1px solid var(--border-light); cursor: pointer; transition: var(--transition-normal); color: var(--text-primary); text-align: left; }
.sidebar-item i { width: 20px; text-align: center; color: var(--text-secondary); }
.sidebar-item:hover { background: var(--bg-primary); }
</style>



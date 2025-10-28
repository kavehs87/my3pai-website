<template>
  <aside class="sidebar">
    <div class="sidebar-section">
      <button class="sidebar-item" type="button">
        <i class="fas fa-bed"></i>
        <span class="label">Accommodation</span>
      </button>
      <button class="sidebar-item" type="button">
        <i class="fas fa-border-all"></i>
        <span class="label">Activities</span>
      </button>
      <button class="sidebar-item" type="button">
        <i class="fas fa-utensils"></i>
        <span class="label">Food & Drink</span>
      </button>
      <button class="sidebar-item" type="button">
        <i class="fas fa-plane"></i>
        <span class="label">Transportation</span>
      </button>
      <button class="sidebar-item" type="button">
        <i class="fas fa-car-side"></i>
        <span class="label">Car</span>
      </button>
      <button class="sidebar-item" type="button">
        <i class="fas fa-plane-departure"></i>
        <span class="label">Flight</span>
      </button>
      <button class="sidebar-item" type="button">
        <i class="fas fa-grip"></i>
        <span class="label">Other</span>
      </button>
    </div>
  </aside>
</template>

<script>
export default { name: 'StudioSidebar' }
</script>

<style scoped>
.sidebar { background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 12px; box-shadow: var(--shadow-light); height: fit-content; }
.sidebar-section { display: flex; flex-direction: column; gap: 12px; }
.sidebar-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-md); background: var(--bg-secondary); border: 1px solid var(--border-light); cursor: pointer; transition: var(--transition-normal); color: var(--text-primary); text-align: left; }
.sidebar-item i { width: 20px; text-align: center; color: var(--text-secondary); }
.sidebar-item:hover { background: var(--bg-primary); }

/* Tablet & Mobile: compact layout */
@media (max-width: 1024px) {
  .sidebar { padding: 8px; }
  .sidebar-section { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .sidebar-item { flex-direction: column; padding: 8px 4px; text-align: center; gap: 4px; }
  .sidebar-item i { width: 16px; font-size: 14px; }
  .sidebar-item .label { font-size: 11px; line-height: 1.2; }
}
</style>



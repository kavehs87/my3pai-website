<template>
  <footer class="thin-footer">
    <div class="container">
      <div class="thin-footer-content">
        <div class="thin-footer-left">
          <p>&copy; {{ currentYear }} my3pai.com, Inc. All rights reserved.</p>
          <div class="thin-footer-links">
            <a href="#">Privacy Policy</a>
            <span class="separator">•</span>
            <a href="#">Terms of Service</a>
            <span class="separator">•</span>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
        <div class="thin-footer-right">
          <div class="language-selector">
            <i class="fas fa-globe"></i>
            <select>
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
            </select>
          </div>
          <div class="currency-selector">
            <i class="fas fa-dollar-sign"></i>
            <select>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'ThinFooter',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.thin-footer {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--border-light);
}

.thin-footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}

.thin-footer-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.thin-footer-left p {
  margin: 0;
  color: var(--text-secondary);
}

.thin-footer-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.thin-footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-normal);
}

.thin-footer-links a:hover {
  color: var(--primary-color);
}

.separator {
  color: var(--text-secondary);
  opacity: 0.5;
}

.thin-footer-right {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.language-selector,
.currency-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
}

.language-selector i,
.currency-selector i {
  color: var(--primary-color);
  font-size: var(--font-size-sm);
}

.language-selector select,
.currency-selector select {
  background: transparent;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  cursor: pointer;
}

.language-selector select:focus,
.currency-selector select:focus {
  outline: none;
  border-color: var(--primary-color);
}

@media (max-width: 768px) {
  .thin-footer-content {
    flex-direction: column;
    gap: var(--spacing-sm);
    text-align: center;
  }

  .thin-footer-left {
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .thin-footer-right {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>


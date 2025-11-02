<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Export to Calendar</h2>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <p class="description">Choose your calendar service to export your trip itinerary:</p>
        
        <div class="calendar-options">
          <!-- Google Calendar -->
          <button 
            class="calendar-option" 
            @click="exportToCalendar('google')"
            :disabled="isExporting"
          >
            <div class="calendar-icon google">
              <i class="fab fa-google"></i>
            </div>
            <div class="calendar-info">
              <h3>Google Calendar</h3>
              <p>Export to your Google Calendar</p>
            </div>
            <i class="fas fa-chevron-right"></i>
          </button>

          <!-- Outlook -->
          <button 
            class="calendar-option" 
            @click="exportToCalendar('outlook')"
            :disabled="isExporting"
          >
            <div class="calendar-icon outlook">
              <i class="fab fa-microsoft"></i>
            </div>
            <div class="calendar-info">
              <h3>Outlook</h3>
              <p>Export to Microsoft Outlook</p>
            </div>
            <i class="fas fa-chevron-right"></i>
          </button>

          <!-- Apple Calendar -->
          <button 
            class="calendar-option" 
            @click="exportToCalendar('apple')"
            :disabled="isExporting"
          >
            <div class="calendar-icon apple">
              <i class="fab fa-apple"></i>
            </div>
            <div class="calendar-info">
              <h3>Apple Calendar</h3>
              <p>Download .ics file for Apple Calendar</p>
            </div>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div v-if="isExporting" class="export-status">
          <i class="fas fa-spinner fa-spin"></i>
          <span>{{ exportStatus }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import toast from '../../../utils/toast.js'

export default {
  name: 'CalendarExportModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    days: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isExporting: false,
      exportStatus: ''
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
      // Reset state when closing
      this.isExporting = false
      this.exportStatus = ''
    },
    
    async exportToCalendar(service) {
      this.isExporting = true
      
      // Mock export process
      setTimeout(() => {
        this.isExporting = false
        
        const messages = {
          google: {
            success: 'Successfully exported to Google Calendar!',
            mock: 'Would open Google Calendar OAuth flow and add events'
          },
          outlook: {
            success: 'Successfully exported to Outlook!',
            mock: 'Would open Outlook OAuth flow and add events'
          },
          apple: {
            success: 'Calendar file (.ics) downloaded!',
            mock: 'Would generate and download .ics file'
          }
        }
        
        const msg = messages[service]
        
        toast.success(msg.success)
        console.log(`[Mock] Export to ${service}:`, msg.mock)
        console.log('Days to export:', this.days)
        
        // Close modal after successful export
        setTimeout(() => {
          this.closeModal()
        }, 500)
      }, 1500)
      
      // Update status message
      const statusMessages = {
        google: 'Connecting to Google Calendar...',
        outlook: 'Connecting to Outlook...',
        apple: 'Generating calendar file...'
      }
      this.exportStatus = statusMessages[service] || 'Exporting...'
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--spacing-md);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.modal-header h2 {
  margin: 0;
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: var(--spacing-xl);
}

.description {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-xl);
  line-height: 1.5;
}

.calendar-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.calendar-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: var(--transition-normal);
  text-align: left;
  width: 100%;
}

.calendar-option:hover:not(:disabled) {
  border-color: var(--secondary-color);
  background: var(--bg-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.calendar-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.calendar-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.calendar-icon.google {
  background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
  color: white;
}

.calendar-icon.outlook {
  background: linear-gradient(135deg, #0078d4 0%, #00a4ef 100%);
  color: white;
}

.calendar-icon.apple {
  background: linear-gradient(135deg, #000000 0%, #1d1d1f 100%);
  color: white;
}

.calendar-info {
  flex: 1;
  min-width: 0;
}

.calendar-info h3 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.calendar-info p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.calendar-option i.fa-chevron-right {
  color: var(--text-secondary);
  font-size: 14px;
  flex-shrink: 0;
}

.export-status {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.export-status i {
  color: var(--secondary-color);
}
</style>


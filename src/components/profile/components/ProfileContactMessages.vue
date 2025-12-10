<template>
  <div class="contact-messages">
    <div class="container">
      <div class="settings-intro">
        <h1><i class="fas fa-envelope"></i> Contact Messages</h1>
        <p>View and manage messages sent to you through your public contact form.</p>
      </div>

      <!-- Statistics -->
      <div class="settings-section">
        <div class="section-header">
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">{{ stats.total || 0 }}</span>
              <span class="stat-label">Total Messages</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.unread || 0 }}</span>
              <span class="stat-label">Unread</span>
            </div>
            <div class="stat-item" v-if="stats.by_subject">
              <span class="stat-value">{{ stats.by_subject.general || 0 }}</span>
              <span class="stat-label">General</span>
            </div>
            <div class="stat-item" v-if="stats.by_subject">
              <span class="stat-value">{{ stats.by_subject.course || 0 }}</span>
              <span class="stat-label">Course</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Controls -->
      <div v-if="!loading && messages.length > 0" class="settings-section">
        <div class="messages-controls">
          <div class="controls-row">
            <!-- Subject Filter -->
            <div class="filter-group">
              <label class="filter-label">Subject:</label>
              <select v-model="filters.subject" @change="loadMessages" class="filter-select">
                <option :value="null">All Subjects</option>
                <option value="general">General</option>
                <option value="course">Course</option>
                <option value="business">Business</option>
                <option value="press">Press</option>
              </select>
            </div>

            <!-- Read Status Filter -->
            <div class="filter-group">
              <label class="filter-label">Status:</label>
              <select v-model="filters.is_read" @change="loadMessages" class="filter-select">
                <option :value="null">All</option>
                <option :value="false">Unread</option>
                <option :value="true">Read</option>
              </select>
            </div>

            <!-- Sort -->
            <div class="filter-group">
              <label class="filter-label">Sort by:</label>
              <select v-model="sortBy" @change="loadMessages" class="filter-select">
                <option value="created_at">Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
              </select>
              <button
                class="sort-order-btn"
                @click="toggleSortOrder"
                :title="sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'"
              >
                <i :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
              </button>
            </div>

            <!-- Items Per Page -->
            <div class="filter-group">
              <label class="filter-label">Per page:</label>
              <select v-model="pagination.perPage" @change="loadMessages" class="filter-select">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="settings-section">
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading messages...
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="messages.length === 0" class="settings-section">
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <h3>No messages yet</h3>
          <p>Messages sent through your contact form will appear here</p>
        </div>
      </div>

      <!-- Messages List -->
      <div v-else class="messages-list">
        <article
          v-for="message in messages"
          :key="message.id"
          class="message-card"
          :class="{ 'unread': !message.is_read }"
        >
          <div class="message-header">
            <div class="message-sender">
              <div class="sender-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div>
                <h4>{{ message.name }}</h4>
                <p class="sender-email">{{ message.email }}</p>
              </div>
            </div>
            <div class="message-meta">
              <span :class="['badge', `badge-${message.subject}`]">
                {{ formatSubject(message.subject) }}
              </span>
              <span v-if="!message.is_read" class="badge badge-unread">Unread</span>
              <span class="message-date">{{ formatDate(message.created_at) }}</span>
            </div>
          </div>

          <div class="message-content">
            <p>{{ message.message }}</p>
          </div>

          <div class="message-actions">
            <button
              v-if="!message.is_read"
              @click="markAsRead(message.id)"
              class="action-btn"
              title="Mark as read"
            >
              <i class="fas fa-check"></i> Mark as Read
            </button>
            <button
              v-else
              @click="markAsUnread(message.id)"
              class="action-btn"
              title="Mark as unread"
            >
              <i class="fas fa-envelope"></i> Mark as Unread
            </button>
            <button
              @click="deleteMessage(message.id)"
              class="action-btn delete"
              title="Delete"
            >
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </article>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && messages.length > 0 && pagination.last_page > 1" class="settings-section">
        <div class="pagination">
          <button
            class="pagination-btn"
            :disabled="pagination.current_page === 1"
            @click="changePage(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left"></i> Previous
          </button>

          <div class="pagination-pages">
            <button
              v-for="page in paginationPages"
              :key="page"
              class="pagination-page"
              :class="{ active: page === pagination.current_page, disabled: page === '...' }"
              :disabled="page === '...'"
              @click="page !== '...' && changePage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="pagination-btn"
            :disabled="pagination.current_page === pagination.last_page"
            @click="changePage(pagination.current_page + 1)"
          >
            Next <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import toast from '@/utils/toast'

export default {
  name: 'ProfileContactMessages',
  data() {
    return {
      loading: false,
      messages: [],
      stats: {},
      filters: {
        subject: null,
        is_read: null
      },
      sortBy: 'created_at',
      sortOrder: 'desc',
      pagination: {
        current_page: 1,
        per_page: 10,
        last_page: 1,
        total: 0
      }
    }
  },
  computed: {
    paginationPages() {
      const pages = []
      const current = this.pagination.current_page
      const last = this.pagination.last_page

      if (last <= 7) {
        for (let i = 1; i <= last; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i)
          pages.push('...')
          pages.push(last)
        } else if (current >= last - 2) {
          pages.push(1)
          pages.push('...')
          for (let i = last - 3; i <= last; i++) pages.push(i)
        } else {
          pages.push(1)
          pages.push('...')
          pages.push(current - 1)
          pages.push(current)
          pages.push(current + 1)
          pages.push('...')
          pages.push(last)
        }
      }

      return pages
    }
  },
  mounted() {
    this.loadStats()
    this.loadMessages()
  },
  methods: {
    async loadStats() {
      try {
        const result = await api.getContactMessagesStats()
        if (result.success) {
          // Handle double-wrapped response: result.data.data or result.data
          const responseData = result.data
          if (responseData.data && typeof responseData.data === 'object') {
            // Double-wrapped: { data: { data: {...} } }
            this.stats = responseData.data
          } else if (typeof responseData === 'object') {
            // Direct object: { data: {...} }
            this.stats = responseData
          } else {
            this.stats = {}
          }
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    },
    async loadMessages() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.current_page,
          per_page: this.pagination.per_page,
          sort: this.sortBy,
          order: this.sortOrder
        }
        
        if (this.filters.subject) {
          params.subject = this.filters.subject
        }
        
        if (this.filters.is_read !== null) {
          params.is_read = this.filters.is_read
        }

        const result = await api.getContactMessages(params)
        if (result.success) {
          // Handle double-wrapped response: result.data.data or result.data
          const responseData = result.data
          if (responseData.data && Array.isArray(responseData.data)) {
            // Double-wrapped: { data: { data: [...], meta: {...} } }
            this.messages = responseData.data
            if (responseData.meta) {
              this.pagination = {
                current_page: responseData.meta.current_page || 1,
                per_page: responseData.meta.per_page || 10,
                last_page: responseData.meta.last_page || 1,
                total: responseData.meta.total || 0
              }
            }
          } else if (Array.isArray(responseData)) {
            // Direct array: { data: [...] }
            this.messages = responseData
          } else {
            this.messages = []
          }
        } else {
          toast.error(result.error || 'Failed to load messages')
        }
      } catch (error) {
        console.error('Error loading messages:', error)
        toast.error(error.message || 'Failed to load messages')
      } finally {
        this.loading = false
      }
    },
    async markAsRead(id) {
      try {
        const result = await api.markContactMessageRead(id, true)
        if (result.success) {
          toast.success('Message marked as read')
          this.loadMessages()
          this.loadStats()
        } else {
          toast.error(result.error || 'Failed to update message')
        }
      } catch (error) {
        console.error('Error marking as read:', error)
        toast.error(error.message || 'Failed to update message')
      }
    },
    async markAsUnread(id) {
      try {
        const result = await api.markContactMessageRead(id, false)
        if (result.success) {
          toast.success('Message marked as unread')
          this.loadMessages()
          this.loadStats()
        } else {
          toast.error(result.error || 'Failed to update message')
        }
      } catch (error) {
        console.error('Error marking as unread:', error)
        toast.error(error.message || 'Failed to update message')
      }
    },
    async deleteMessage(id) {
      if (!confirm('Are you sure you want to delete this message?')) {
        return
      }

      try {
        const result = await api.deleteContactMessage(id)
        if (result.success) {
          toast.success('Message deleted')
          this.loadMessages()
          this.loadStats()
        } else {
          toast.error(result.error || 'Failed to delete message')
        }
      } catch (error) {
        console.error('Error deleting message:', error)
        toast.error(error.message || 'Failed to delete message')
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.pagination.current_page = page
        this.loadMessages()
      }
    },
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      this.loadMessages()
    },
    formatSubject(subject) {
      const subjects = {
        general: 'General Inquiry',
        course: 'Course Support',
        business: 'Business',
        press: 'Press / Media'
      }
      return subjects[subject] || subject
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.contact-messages {
  padding: var(--spacing-xl) 0;
  background: var(--bg-secondary);
  min-height: 60vh;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.settings-intro {
  margin-bottom: var(--spacing-xl);
}

.settings-intro h1 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.settings-intro h1 i {
  color: var(--secondary-color);
}

.settings-intro p {
  color: var(--text-secondary);
  margin: 0;
}

.settings-section {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.stats-row {
  display: flex;
  gap: var(--spacing-xl);
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.messages-controls {
  margin-bottom: var(--spacing-lg);
}

.controls-row {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}

.filter-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.sort-order-btn {
  padding: var(--spacing-sm);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sort-order-btn:hover {
  background: var(--bg-secondary);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 3rem;
  color: var(--text-muted);
  margin-bottom: var(--spacing-md);
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.message-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal);
}

.message-card.unread {
  border-left: 4px solid var(--secondary-color);
  background: var(--bg-secondary);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.message-sender {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.sender-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--secondary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.message-sender h4 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.sender-email {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
}

.badge-general {
  background: var(--info-color);
  color: white;
}

.badge-course {
  background: var(--success-color);
  color: white;
}

.badge-business {
  background: var(--warning-color);
  color: white;
}

.badge-press {
  background: var(--primary-color);
  color: white;
}

.badge-unread {
  background: var(--secondary-color);
  color: white;
}

.message-date {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.message-content {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.message-content p {
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.message-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.action-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.action-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--text-secondary);
}

.action-btn.delete:hover {
  background: var(--error-color);
  color: white;
  border-color: var(--error-color);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.pagination-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-secondary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: var(--spacing-xs);
}

.pagination-page {
  min-width: 36px;
  height: 36px;
  padding: 0 var(--spacing-sm);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-page:hover:not(:disabled):not(.active) {
  background: var(--bg-secondary);
}

.pagination-page.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.pagination-page.disabled {
  cursor: default;
  border: none;
  background: transparent;
}
</style>


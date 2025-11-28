<template>
  <div class="rich-editor">
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <button type="button" class="toolbar-btn" @click="execCommand('bold')" title="Bold (Ctrl+B)">
          <i class="fas fa-bold"></i>
        </button>
        <button type="button" class="toolbar-btn" @click="execCommand('italic')" title="Italic (Ctrl+I)">
          <i class="fas fa-italic"></i>
        </button>
        <button type="button" class="toolbar-btn" @click="execCommand('underline')" title="Underline (Ctrl+U)">
          <i class="fas fa-underline"></i>
        </button>
        <button type="button" class="toolbar-btn" @click="execCommand('strikeThrough')" title="Strikethrough">
          <i class="fas fa-strikethrough"></i>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button type="button" class="toolbar-btn" @click="execCommand('formatBlock', 'h2')" title="Heading 2">
          <span class="btn-text">H2</span>
        </button>
        <button type="button" class="toolbar-btn" @click="execCommand('formatBlock', 'h3')" title="Heading 3">
          <span class="btn-text">H3</span>
        </button>
        <button type="button" class="toolbar-btn" @click="execCommand('formatBlock', 'p')" title="Paragraph">
          <i class="fas fa-paragraph"></i>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button type="button" class="toolbar-btn" @click="execCommand('insertUnorderedList')" title="Bullet List">
          <i class="fas fa-list-ul"></i>
        </button>
        <button type="button" class="toolbar-btn" @click="execCommand('insertOrderedList')" title="Numbered List">
          <i class="fas fa-list-ol"></i>
        </button>
        <button type="button" class="toolbar-btn" @click="execCommand('formatBlock', 'blockquote')" title="Quote">
          <i class="fas fa-quote-left"></i>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button type="button" class="toolbar-btn" @click="insertLink" title="Insert Link">
          <i class="fas fa-link"></i>
        </button>
        <button type="button" class="toolbar-btn" @click="execCommand('unlink')" title="Remove Link">
          <i class="fas fa-unlink"></i>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button type="button" class="toolbar-btn" @click="execCommand('justifyLeft')" title="Align Left">
          <i class="fas fa-align-left"></i>
        </button>
        <button type="button" class="toolbar-btn" @click="execCommand('justifyCenter')" title="Align Center">
          <i class="fas fa-align-center"></i>
        </button>
        <button type="button" class="toolbar-btn" @click="execCommand('justifyRight')" title="Align Right">
          <i class="fas fa-align-right"></i>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button type="button" class="toolbar-btn" @click="execCommand('removeFormat')" title="Clear Formatting">
          <i class="fas fa-eraser"></i>
        </button>
        <button type="button" class="toolbar-btn" @click="toggleSource" :class="{ active: showSource }" title="View HTML">
          <i class="fas fa-code"></i>
        </button>
      </div>
    </div>
    
    <div
      v-show="!showSource"
      ref="editorContent"
      class="editor-content"
      contenteditable="true"
      @input="handleInput"
      @paste="handlePaste"
      @keydown="handleKeydown"
      :placeholder="placeholder"
    ></div>
    
    <textarea
      v-show="showSource"
      ref="sourceEditor"
      class="editor-source"
      :value="modelValue"
      @input="handleSourceInput"
      :placeholder="placeholder"
    ></textarea>
  </div>
</template>

<script>
export default {
  name: 'RichTextEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Start writing...'
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      showSource: false,
      internalUpdate: false
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        if (!this.internalUpdate && this.$refs.editorContent) {
          // Only update if content is different to preserve cursor position
          if (this.$refs.editorContent.innerHTML !== newVal) {
            this.$refs.editorContent.innerHTML = newVal || ''
          }
        }
        this.internalUpdate = false
      }
    }
  },
  mounted() {
    if (this.$refs.editorContent && this.modelValue) {
      this.$refs.editorContent.innerHTML = this.modelValue
    }
  },
  methods: {
    execCommand(command, value = null) {
      this.$refs.editorContent.focus()
      
      if (command === 'formatBlock' && value) {
        document.execCommand(command, false, `<${value}>`)
      } else {
        document.execCommand(command, false, value)
      }
      
      this.emitUpdate()
    },
    
    insertLink() {
      const selection = window.getSelection()
      const selectedText = selection.toString()
      
      const url = prompt('Enter URL:', 'https://')
      if (url) {
        this.$refs.editorContent.focus()
        
        // Restore selection
        if (selectedText) {
          document.execCommand('createLink', false, url)
        } else {
          const linkText = prompt('Enter link text:', 'Link')
          if (linkText) {
            document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${linkText}</a>`)
          }
        }
        
        this.emitUpdate()
      }
    },
    
    handleInput() {
      this.emitUpdate()
    },
    
    handlePaste(e) {
      e.preventDefault()
      
      // Get plain text or HTML from clipboard
      let text = ''
      if (e.clipboardData) {
        // Try to get HTML first for rich content
        const html = e.clipboardData.getData('text/html')
        if (html) {
          // Sanitize HTML - keep only safe tags
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = html
          
          // Remove script tags and event handlers
          const scripts = tempDiv.querySelectorAll('script, style')
          scripts.forEach(s => s.remove())
          
          // Remove dangerous attributes
          const allElements = tempDiv.querySelectorAll('*')
          allElements.forEach(el => {
            const attrs = [...el.attributes]
            attrs.forEach(attr => {
              if (attr.name.startsWith('on') || attr.name === 'style') {
                el.removeAttribute(attr.name)
              }
            })
          })
          
          text = tempDiv.innerHTML
        } else {
          text = e.clipboardData.getData('text/plain')
          // Convert line breaks to <br> for plain text
          text = text.replace(/\n/g, '<br>')
        }
      }
      
      document.execCommand('insertHTML', false, text)
      this.emitUpdate()
    },
    
    handleKeydown(e) {
      // Handle Tab key for indentation
      if (e.key === 'Tab') {
        e.preventDefault()
        if (e.shiftKey) {
          document.execCommand('outdent', false)
        } else {
          document.execCommand('indent', false)
        }
        this.emitUpdate()
      }
    },
    
    toggleSource() {
      this.showSource = !this.showSource
      
      if (!this.showSource) {
        // Switching back to visual editor
        this.$nextTick(() => {
          this.$refs.editorContent.innerHTML = this.modelValue || ''
        })
      }
    },
    
    handleSourceInput(e) {
      this.internalUpdate = true
      this.$emit('update:modelValue', e.target.value)
    },
    
    emitUpdate() {
      this.internalUpdate = true
      const content = this.$refs.editorContent.innerHTML
      // Clean up empty content
      const cleanContent = content === '<br>' || content === '<div><br></div>' ? '' : content
      this.$emit('update:modelValue', cleanContent)
    }
  }
}
</script>

<style scoped>
.rich-editor {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-primary);
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  align-items: center;
}

.toolbar-group {
  display: flex;
  gap: 2px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--border-light);
  margin: 0 var(--spacing-xs);
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 13px;
}

.toolbar-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.toolbar-btn.active {
  background: var(--secondary-color);
  color: white;
}

.toolbar-btn .btn-text {
  font-weight: 700;
  font-size: 12px;
}

.editor-content {
  min-height: 250px;
  max-height: 500px;
  overflow-y: auto;
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  line-height: 1.7;
  color: var(--text-primary);
  outline: none;
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: var(--text-secondary);
  opacity: 0.6;
  pointer-events: none;
}

.editor-content:focus {
  outline: none;
}

/* Content styling */
.editor-content :deep(h2) {
  font-size: 1.5em;
  font-weight: 700;
  margin: 0.8em 0 0.4em;
  color: var(--text-primary);
}

.editor-content :deep(h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin: 0.8em 0 0.4em;
  color: var(--text-primary);
}

.editor-content :deep(p) {
  margin: 0.5em 0;
}

.editor-content :deep(ul),
.editor-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.editor-content :deep(li) {
  margin: 0.25em 0;
}

.editor-content :deep(blockquote) {
  border-left: 4px solid var(--secondary-color);
  margin: 1em 0;
  padding: 0.5em 1em;
  background: var(--bg-secondary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  font-style: italic;
  color: var(--text-secondary);
}

.editor-content :deep(a) {
  color: var(--secondary-color);
  text-decoration: underline;
}

.editor-content :deep(strong),
.editor-content :deep(b) {
  font-weight: 600;
}

.editor-content :deep(em),
.editor-content :deep(i) {
  font-style: italic;
}

.editor-source {
  width: 100%;
  min-height: 250px;
  max-height: 500px;
  padding: var(--spacing-md);
  border: none;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}

.editor-source::placeholder {
  color: #666;
}

@media (max-width: 768px) {
  .editor-toolbar {
    padding: var(--spacing-xs);
  }
  
  .toolbar-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  .toolbar-divider {
    display: none;
  }
  
  .editor-content {
    min-height: 200px;
  }
}
</style>


<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="$emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-slate-900">Order Details</h2>
            <button
              @click="$emit('close')"
              class="text-slate-500 hover:text-slate-900 p-2"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="text-center py-12 text-slate-500">
            <p>Order details will be displayed here</p>
            <p class="text-sm mt-2">Order ID: {{ orderId }}</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { Teleport } from 'vue'
import { X } from 'lucide-vue-next'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  orderId: {
    type: [String, Number],
    default: null,
  },
  orderData: {
    type: Object,
    default: null,
  },
})

defineEmits(['close', 'view-invoice'])
</script>


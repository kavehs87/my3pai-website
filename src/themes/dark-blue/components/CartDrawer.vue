<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div
      :class="[
        'fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      ]"
      @click="$emit('close')"
    />

    <!-- Drawer -->
    <div
      :class="[
        'fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      ]"
    >
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-surface">
        <div class="flex items-center gap-2">
          <ShoppingCart class="w-5 h-5 text-primary" />
          <h2 class="text-xl font-bold text-primary">Your Cart ({{ items.length }})</h2>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X class="w-5 h-5 text-text-muted" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <div v-if="items.length === 0" class="h-full flex flex-col items-center justify-center text-text-light space-y-4">
          <ShoppingCart class="w-16 h-16 opacity-20" />
          <p class="text-lg font-medium">Your cart is empty</p>
          <button @click="$emit('close')" class="text-secondary font-semibold hover:underline">
            Browse courses & assets
          </button>
        </div>

        <div
          v-for="(item, idx) in items"
          :key="`${item.id}-${idx}`"
          class="flex gap-4"
        >
          <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
            <img :src="item.image" :alt="item.title" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
              <h3 class="font-bold text-primary leading-tight line-clamp-2">{{ item.title }}</h3>
              <p class="text-xs text-text-light uppercase font-semibold mt-1">{{ item.type }}</p>
            </div>
            <div class="flex justify-between items-center">
              <PriceDisplay :amount="item.price" class="font-bold text-secondary" />
              <button
                @click="$emit('remove', item.id)"
                class="text-text-muted hover:text-red-500 transition-colors p-1"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="items.length > 0" class="p-6 border-t border-slate-100 bg-surface space-y-4">
        <div class="flex justify-between items-end">
          <span class="text-text-muted font-medium">Subtotal</span>
          <PriceDisplay :amount="total" class="text-2xl font-bold text-primary" />
        </div>
        <p class="text-xs text-text-light text-center">Taxes and shipping calculated at checkout</p>
        <button
          @click="$emit('checkout')"
          class="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
        >
          Checkout <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { Teleport } from 'vue'
import { ShoppingCart, X, Trash2, ArrowRight } from 'lucide-vue-next'
import PriceDisplay from './PriceDisplay.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  items: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['close', 'remove', 'checkout'])

const total = computed(() => {
  return props.items.reduce((sum, item) => sum + item.price, 0)
})
</script>


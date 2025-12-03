<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
      @click="$emit('close')"
    />
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none"
    >
      <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50 rounded-t-3xl">
          <div>
            <div class="flex items-center gap-2 text-secondary font-bold text-sm uppercase tracking-wider mb-2">
              <ShieldCheck class="w-4 h-4" />
              Official License Agreement
            </div>
            <h2 class="text-2xl md:text-3xl font-bold text-primary">Digital Asset Licensing</h2>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X class="w-6 h-6 text-text-muted" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <p class="text-text-muted text-lg leading-relaxed">
            When you purchase digital assets (LUTs, Presets, Footage) from My3Pai, you are acquiring a license to use these files, not ownership of the original intellectual property.
          </p>

          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
              <h3 class="font-bold text-emerald-800 flex items-center gap-2 mb-4">
                <CheckCircle2 class="w-5 h-5" />
                You Can (Allowed)
              </h3>
              <ul class="space-y-3 text-sm text-emerald-900">
                <li class="flex gap-2">
                  <Check class="w-4 h-4 flex-shrink-0 mt-0.5" /> Use in unlimited personal projects.
                </li>
                <li class="flex gap-2">
                  <Check class="w-4 h-4 flex-shrink-0 mt-0.5" /> Use in commercial client work (YouTube, Weddings, Docs).
                </li>
                <li class="flex gap-2">
                  <Check class="w-4 h-4 flex-shrink-0 mt-0.5" /> Use in social media content (Instagram, TikTok).
                </li>
                <li class="flex gap-2">
                  <Check class="w-4 h-4 flex-shrink-0 mt-0.5" /> Edit, manipulate, and combine with other works.
                </li>
              </ul>
            </div>

            <div class="bg-red-50 rounded-2xl p-6 border border-red-100">
              <h3 class="font-bold text-red-800 flex items-center gap-2 mb-4">
                <AlertCircle class="w-5 h-5" />
                You Cannot (Prohibited)
              </h3>
              <ul class="space-y-3 text-sm text-red-900">
                <li class="flex gap-2">
                  <X class="w-4 h-4 flex-shrink-0 mt-0.5" /> Resell, share, or redistribute the files as is.
                </li>
                <li class="flex gap-2">
                  <X class="w-4 h-4 flex-shrink-0 mt-0.5" /> Upload to stock media platforms.
                </li>
                <li class="flex gap-2">
                  <X class="w-4 h-4 flex-shrink-0 mt-0.5" /> Include in a product where the asset is the primary value.
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 class="font-bold text-primary mb-3">Commercial Rights</h3>
            <p class="text-text-muted text-sm leading-relaxed">
              This license covers usage for projects with a budget under $100,000 USD. For large-scale broadcast or theatrical releases, please contact us for an Enterprise License.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end">
          <button
            @click="$emit('close')"
            class="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { Teleport } from 'vue'
import { ShieldCheck, X, CheckCircle2, Check, AlertCircle } from 'lucide-vue-next'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])
</script>


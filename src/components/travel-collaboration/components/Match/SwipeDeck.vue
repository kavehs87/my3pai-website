<template>
  <div class="w-full h-full flex items-center justify-center py-4">
    <div class="w-full max-w-sm h-[600px] relative flex flex-col">
      
      <!-- Card Stack Area -->
      <div class="flex-1 relative mb-6">
        <template v-if="cards.length > 0">
          <div
            v-for="(offer, index) in cards"
            :key="offer.id"
            v-show="index === cards.length - 1"
            class="absolute inset-0 bg-white rounded-3xl shadow-xl overflow-hidden select-none border border-slate-200 cursor-grab active:cursor-grabbing"
            :style="{
              transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
              opacity: opacity,
              zIndex: cards.length - index
            }"
            @mousedown="startDrag"
            @touchstart="startDrag"
          >
            <!-- Swipe Indicators -->
            <div 
              v-if="dragX > 10"
              class="absolute top-8 left-8 z-20 border-4 border-green-500 text-green-500 rounded-lg px-4 py-2 text-3xl font-bold uppercase transform -rotate-12 bg-white/20 backdrop-blur-sm"
            >
              Let's Hang
            </div>
            <div 
              v-if="dragX < -10"
              class="absolute top-8 right-8 z-20 border-4 border-red-500 text-red-500 rounded-lg px-4 py-2 text-3xl font-bold uppercase transform rotate-12 bg-white/20 backdrop-blur-sm"
            >
              Pass
            </div>

            <!-- Image -->
            <div class="h-3/5 relative">
               <div class="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80 z-10" />
               <img :src="displayImage(offer)" class="w-full h-full object-cover" draggable="false" alt="" />
               
               <div class="absolute bottom-0 left-0 p-5 z-20 text-white w-full">
                  <div class="flex items-center gap-2 mb-2">
                     <span class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Beer v-if="offer.type === 'MEETUP'" class="w-3 h-3" />
                        <Camera v-else class="w-3 h-3" />
                        {{ offer.type === 'MEETUP' ? 'Hangout' : 'Activity' }}
                     </span>
                     <span v-if="offer.price.amount === 0" class="px-3 py-1 bg-green-500/80 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                         Free
                     </span>
                  </div>
                  <h2 class="text-2xl font-bold leading-tight drop-shadow-md">{{ offer.title }}</h2>
               </div>
            </div>

            <!-- Content Body -->
            <div class="h-2/5 p-5 flex flex-col justify-between bg-white relative z-20">
               <div>
                  <div class="flex justify-between items-start mb-3">
                     <div>
                        <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                           {{ offer.user.name }} 
                           <span class="text-slate-400 font-normal text-sm">24 • Tokyo</span>
                        </h3>
                        <div class="text-sm text-slate-500 flex items-center gap-1">
                           <MapPin class="w-3.5 h-3.5" /> 0.5km away
                        </div>
                     </div>
                     <img :src="offer.user.avatarUrl" class="w-12 h-12 rounded-full border-2 border-slate-100 object-cover" alt="" />
                  </div>
                  
                  <p class="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                     {{ offer.description }}
                  </p>
               </div>

               <!-- Tags -->
               <div class="flex flex-wrap gap-2 mt-auto">
                  <span 
                    v-for="(tag, i) in ['Photography', 'Coffee', 'Exploring']" 
                    :key="i" 
                    class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold"
                  >
                     #{{ tag }}
                  </span>
               </div>
            </div>
          </div>

          <!-- Background cards -->
          <div
            v-for="(offer, index) in cards.slice(0, -1)"
            :key="offer.id"
            class="absolute inset-0 bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden pointer-events-none scale-95 opacity-50 translate-y-4"
            :style="{ zIndex: cards.length - index - 1 }"
          >
            <div class="w-full h-full bg-slate-100"></div>
          </div>
        </template>

        <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-dashed border-slate-300">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Tent class="w-8 h-8 text-slate-400" />
          </div>
          <h3 class="text-xl font-bold text-slate-900 mb-2">You've seen everyone!</h3>
          <p class="text-slate-500 mb-6">That's all the travelers in your area for now.</p>
          <button @click="resetDeck" class="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800">
            <RotateCcw class="w-4 h-4" /> Start Over
          </button>
        </div>

        <!-- Match Success Overlay -->
        <div 
          v-if="matched"
          class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-indigo-600/95 rounded-3xl text-white p-8 shadow-2xl"
        >
          <div class="text-6xl mb-4">🙌</div>
          <h2 class="text-4xl font-extrabold mb-2 text-center italic transform -rotate-2">IT'S A VIBE!</h2>
          <p class="text-center mb-8 text-indigo-100">You and {{ matched.user.name }} are both interested in hanging out.</p>
          
          <div class="flex items-center gap-4 mb-8">
             <img :src="matched.user.avatarUrl" class="w-16 h-16 rounded-full border-4 border-white object-cover" alt="" />
             <div class="w-16 h-16 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-slate-900 font-bold overflow-hidden">
                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&auto=format&fit=crop" class="w-full h-full object-cover" alt="Me" />
             </div>
          </div>

          <div class="w-full space-y-3">
            <button class="w-full py-4 bg-white text-indigo-700 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg">
              Send Message
            </button>
            <button @click="matched = null" class="w-full py-4 bg-transparent border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/10">
              Keep Swiping
            </button>
          </div>
        </div>
      </div>

      <!-- Controls (Only show if cards exist) -->
      <div v-if="cards.length > 0 && !matched" class="h-20 flex items-center justify-center gap-8">
        <button 
          @click="handleSwipe('left')"
          class="w-14 h-14 rounded-full bg-white border border-slate-200 text-red-500 flex items-center justify-center hover:scale-110 hover:bg-red-50 hover:border-red-200 transition-all shadow-lg"
        >
          <X class="w-6 h-6" />
        </button>
        <button 
          @click="handleSwipe('right')"
          class="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:scale-110 hover:shadow-indigo-500/50 hover:shadow-xl transition-all shadow-lg"
        >
          <Check class="w-8 h-8" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onBeforeUnmount } from 'vue'
import { X, Check, MapPin, Coffee, Camera, Music, Tent, RotateCcw, Beer } from 'lucide-vue-next'

export default {
  name: 'SwipeDeck',
  components: {
    X,
    Check,
    MapPin,
    Coffee,
    Camera,
    Music,
    Tent,
    RotateCcw,
    Beer
  },
  props: {
    offers: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const cards = ref([...props.offers])
    const history = ref([])
    const matched = ref(null)
    const dragX = ref(0)
    const isDragging = ref(false)
    const startX = ref(0)

    const activeCard = computed(() => cards.value[cards.value.length - 1])

    const rotate = computed(() => {
      if (!isDragging.value) return 0
      return dragX.value * 0.075
    })

    const opacity = computed(() => {
      if (!isDragging.value) return 1
      const absX = Math.abs(dragX.value)
      if (absX > 200) return 0
      if (absX > 100) return 1 - (absX - 100) / 100
      return 1
    })

    const displayImage = (offer) => {
      return offer.imageUrl || `https://picsum.photos/seed/${offer.id}/600/800`
    }

    const startDrag = (e) => {
      if (cards.value.length === 0) return
      isDragging.value = true
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      startX.value = clientX - dragX.value
      document.addEventListener('mousemove', onDrag)
      document.addEventListener('mouseup', endDrag)
      document.addEventListener('touchmove', onDrag, { passive: false })
      document.addEventListener('touchend', endDrag)
    }

    const onDrag = (e) => {
      if (!isDragging.value) return
      e.preventDefault()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      dragX.value = clientX - startX.value
    }

    const endDrag = () => {
      if (!isDragging.value) return
      
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('mouseup', endDrag)
      document.removeEventListener('touchmove', onDrag)
      document.removeEventListener('touchend', endDrag)
      
      if (dragX.value > 100) {
        handleSwipe('right')
      } else if (dragX.value < -100) {
        handleSwipe('left')
      } else {
        dragX.value = 0
      }
      
      isDragging.value = false
    }

    const handleSwipe = (direction) => {
      if (!activeCard.value) return

      if (direction === 'right') {
        if (Math.random() > 0.5) {
          matched.value = activeCard.value
        }
      }

      history.value.push(activeCard.value)
      cards.value = cards.value.slice(0, -1)
      dragX.value = 0
    }

    const resetDeck = () => {
      cards.value = [...props.offers]
      history.value = []
      matched.value = null
    }

    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('mouseup', endDrag)
      document.removeEventListener('touchmove', onDrag)
      document.removeEventListener('touchend', endDrag)
    })

    return {
      cards,
      history,
      matched,
      dragX,
      isDragging,
      rotate,
      opacity,
      activeCard,
      displayImage,
      startDrag,
      onDrag,
      endDrag,
      handleSwipe,
      resetDeck
    }
  }
}
</script>


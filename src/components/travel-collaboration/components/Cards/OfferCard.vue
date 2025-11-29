<template>
  <div 
    v-if="isMeetup"
    :class="[
      'group relative bg-white rounded-3xl p-4 transition-all duration-300 border-2',
      active ? 'border-indigo-500 shadow-xl ring-2 ring-indigo-500/20' : 'border-indigo-50 hover:border-indigo-200 hover:shadow-lg'
    ]"
    @mouseenter="onHover"
    @mouseleave="onLeave"
  >
    <div class="flex gap-4">
      <!-- Personal Photo Thumbnail for Meetup -->
      <div class="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden relative shadow-sm">
        <img :src="imageUrl" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Host" />
        <div class="absolute inset-0 bg-indigo-900/10 group-hover:bg-transparent transition-colors"></div>
      </div>

      <div class="flex-1 min-w-0">
         <!-- Badge -->
        <div class="flex justify-between items-start mb-1">
          <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Users class="w-3 h-3" /> Group
          </span>
          <button class="text-slate-300 hover:text-red-500 transition-colors">
            <Heart class="w-4 h-4" />
          </button>
        </div>

        <!-- Content -->
        <h3 class="text-base font-bold text-slate-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{{ offer.title }}</h3>
        <p class="text-xs text-slate-500 line-clamp-2 mb-2">{{ offer.description }}</p>
      </div>
    </div>

    <!-- Social Proof / Attendees -->
    <div class="bg-slate-50 rounded-xl p-3 mb-3 mt-3">
       <div class="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
         <span>{{ attendees.length }} / {{ max }} Going</span>
         <span :class="progress >= 80 ? 'text-red-500' : 'text-green-500'">
           {{ max - attendees.length }} spots left
         </span>
       </div>
       
       <!-- Progress Bar -->
       <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
         <div class="h-full bg-indigo-500 rounded-full transition-all duration-1000" :style="{ width: `${progress}%` }"></div>
       </div>

       <!-- Face Pile -->
       <div class="flex items-center justify-between">
          <div class="flex -space-x-2 overflow-hidden">
            <img 
              v-for="(a, i) in attendees.slice(0, 4)" 
              :key="i" 
              class="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" 
              :src="a.avatarUrl" 
              alt="" 
            />
            <div v-if="attendees.length > 4" class="flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 text-[9px] font-bold text-slate-600">
              +{{ attendees.length - 4 }}
            </div>
          </div>
          
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
             <MapPin class="w-3 h-3" /> 0.4km
          </div>
       </div>
    </div>

    <!-- Host & Action -->
    <div class="flex items-center justify-between mt-auto">
       <div class="flex items-center gap-2">
          <img :src="offer.user.avatarUrl" class="w-6 h-6 rounded-full border border-white shadow-sm" alt="" />
          <div class="flex flex-col">
             <span class="text-[9px] text-slate-400 font-bold uppercase">Host</span>
             <span class="text-xs font-bold text-slate-900 line-clamp-1 max-w-[80px]">{{ offer.user.name }}</span>
          </div>
       </div>
       
       <button 
         @click.stop="handleRequestMeet"
         :class="[
           'px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md z-20 flex items-center gap-1.5',
           joined ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
         ]"
       >
         <Check v-if="joined" class="w-3 h-3" /> 
         <span v-if="!joined">{{ onRequestMeet ? 'Request to Join' : 'Join RSVP' }}</span>
         <span v-else>Going</span>
       </button>
    </div>

    <!-- Interactive Overlay Link -->
    <router-link :to="`/travel-collaboration/offer/${offer.id}`" class="absolute inset-0 z-10" @click.stop />
  </div>

  <!-- STANDARD SESSION / SERVICE CARD DESIGN -->
  <div 
    v-else
    :class="[
      'group relative bg-white rounded-2xl p-4 transition-all duration-300 border',
      active ? 'border-primary-500 shadow-lg ring-1 ring-primary-500' : 'border-slate-100 hover:border-slate-300 hover:shadow-md'
    ]"
    @mouseenter="onHover"
    @mouseleave="onLeave"
  >
    <div class="flex gap-4">
      <!-- Media Side -->
      <div class="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
          <img :src="imageUrl" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Offer" />
          <div class="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-slate-700">
              {{ offer.type }}
          </div>
      </div>

      <!-- Content Side -->
      <div class="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start">
            <h3 class="text-base font-semibold text-slate-900 truncate pr-2">{{ offer.title }}</h3>
            <button class="text-slate-400 hover:text-red-500 transition-colors">
              <Heart class="w-4 h-4" />
            </button>
          </div>
          
          <div class="flex items-center gap-2 mt-1 mb-2">
            <div class="flex items-center text-yellow-500 text-xs font-medium">
              <Star class="w-3 h-3 fill-current" />
              <span class="ml-1">{{ offer.user.stats?.rating }}</span>
              <span class="text-slate-400 font-normal ml-0.5">({{ offer.user.stats?.reviewCount }})</span>
            </div>
            <div class="w-1 h-1 bg-slate-300 rounded-full"></div>
            <div class="text-xs text-slate-500 flex items-center gap-1 truncate">
               <MapPin class="w-3 h-3" />
               0.4km away
            </div>
          </div>

          <p class="text-xs text-slate-600 line-clamp-2">{{ offer.description }}</p>
        </div>

        <div class="flex items-end justify-between mt-3">
           <div class="flex items-center gap-2">
              <img :src="offer.user.avatarUrl" class="w-6 h-6 rounded-full border border-white shadow-sm" alt="" />
              <span class="text-xs font-medium text-slate-700">{{ offer.user.name }}</span>
              <ShieldCheck v-if="offer.user.isVerified" class="w-3 h-3 text-accent-500" />
           </div>
           
           <div class="text-right">
              <div class="text-lg font-bold text-slate-900 leading-none">
                  ${{ offer.price.amount }}
                  <span v-if="offer.price.amount > 0" class="text-xs font-normal text-slate-500 ml-0.5">/{{ offer.price.unit === 'hourly' ? 'hr' : 'fix' }}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
    
    <!-- Interactive Overlay Link -->
    <router-link :to="`/travel-collaboration/offer/${offer.id}`" class="absolute inset-0 z-10" @click.stop />
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { Star, ShieldCheck, MapPin, Heart, Users, Check } from 'lucide-vue-next'

export default {
  name: 'OfferCard',
  components: {
    Star,
    ShieldCheck,
    MapPin,
    Heart,
    Users,
    Check
  },
  props: {
    offer: {
      type: Object,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    },
    onRequestMeet: {
      type: Function,
      default: null
    }
  },
  emits: ['hover', 'leave'],
  setup(props, { emit }) {
    const joined = ref(false)
    const isMeetup = computed(() => props.offer.type === 'MEETUP')
    const imageUrl = computed(() => props.offer.imageUrl || `https://picsum.photos/seed/${props.offer.id}/300/300`)
    
    const attendees = computed(() => props.offer.attendees || [])
    const max = computed(() => props.offer.maxAttendees || 10)
    const progress = computed(() => (attendees.value.length / max.value) * 100)

    const onHover = () => emit('hover')
    const onLeave = () => emit('leave')

    const handleRequestMeet = (e) => {
      e.preventDefault()
      if (props.onRequestMeet) {
        props.onRequestMeet()
      } else {
        joined.value = !joined.value
      }
    }

    return {
      joined,
      isMeetup,
      imageUrl,
      attendees,
      max,
      progress,
      onHover,
      onLeave,
      handleRequestMeet
    }
  }
}
</script>


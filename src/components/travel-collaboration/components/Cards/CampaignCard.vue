<template>
  <div class="bg-white rounded-2xl border border-slate-100 border-l-[4px] border-l-orange-500 shadow-sm hover:shadow-lg transition-all duration-300 p-5 flex flex-col h-full relative overflow-hidden group">
    
    <!-- Match Score Badge -->
    <div v-if="campaign.matchScore > 80" class="absolute top-0 right-0 bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm z-10">
      {{ campaign.matchScore }}% Match
    </div>

    <!-- Header -->
    <div class="flex items-start gap-4 mb-5">
      <div class="w-14 h-14 rounded-xl bg-slate-50 p-1 flex-shrink-0 border border-slate-100 shadow-sm">
        <img :src="campaign.brand.logoUrl" :alt="campaign.brand.name" class="w-full h-full object-cover rounded-lg" />
      </div>
      <div class="flex-1 min-w-0 pt-0.5">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
           <Briefcase class="w-3 h-3" /> {{ campaign.brand.category }}
        </div>
        <h3 class="font-bold text-slate-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2 text-base mb-0.5">
          {{ campaign.title }}
        </h3>
        <div class="text-xs font-medium text-slate-600 truncate">{{ campaign.brand.name }}</div>
      </div>
    </div>

    <!-- Location & Time -->
    <div class="flex items-center gap-4 text-xs text-slate-500 mb-5 pb-5 border-b border-slate-50">
      <div class="flex items-center gap-1.5">
        <MapPin class="w-3.5 h-3.5 text-slate-400" /> {{ campaign.location }}
      </div>
      <div class="flex items-center gap-1.5">
        <Clock class="w-3.5 h-3.5 text-slate-400" /> Oct 2023
      </div>
    </div>

    <!-- Requirements Section -->
    <div class="space-y-3 mb-5 flex-1">
      <div>
         <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
           <Users class="w-3 h-3" /> Requirements
         </div>
         <div class="flex flex-wrap gap-2">
           <span class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200">
             {{ campaign.requirements.minFollowers >= 1000 ? `${campaign.requirements.minFollowers / 1000}k+` : campaign.requirements.minFollowers }} Followers
           </span>
           <span 
             v-for="p in campaign.requirements.platforms" 
             :key="p" 
             class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200"
           >
             {{ p }}
           </span>
         </div>
      </div>
    </div>

    <!-- Perks Section (The "Reward") -->
    <div class="mt-auto">
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
           <CheckCircle class="w-3 h-3 text-orange-500" /> Perks
      </div>
      <div class="flex flex-wrap gap-1.5 mb-5">
        <span 
          v-for="perk in campaign.perks" 
          :key="perk" 
          class="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-[10px] font-bold uppercase tracking-wider"
        >
          {{ perk }}
        </span>
      </div>

      <button class="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5">
        View Details & Apply
      </button>
    </div>
  </div>
</template>

<script>
import { MapPin, Users, CheckCircle, Clock, Briefcase } from 'lucide-vue-next'

export default {
  name: 'CampaignCard',
  components: {
    MapPin,
    Users,
    CheckCircle,
    Clock,
    Briefcase
  },
  props: {
    campaign: {
      type: Object,
      required: true
    }
  }
}
</script>


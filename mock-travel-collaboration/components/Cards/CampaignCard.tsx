
import React from 'react';
import { Campaign } from '../../types';
import { MapPin, Users, CheckCircle, Clock, Briefcase } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 border-l-[4px] border-l-orange-500 shadow-sm hover:shadow-lg transition-all duration-300 p-5 flex flex-col h-full relative overflow-hidden group">
      
      {/* Match Score Badge */}
      {campaign.matchScore > 80 && (
        <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm z-10">
          {campaign.matchScore}% Match
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 rounded-xl bg-slate-50 p-1 flex-shrink-0 border border-slate-100 shadow-sm">
          <img src={campaign.brand.logoUrl} alt={campaign.brand.name} className="w-full h-full object-cover rounded-lg" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
             <Briefcase className="w-3 h-3" /> {campaign.brand.category}
          </div>
          <h3 className="font-bold text-slate-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2 text-base mb-0.5">
            {campaign.title}
          </h3>
          <div className="text-xs font-medium text-slate-600 truncate">{campaign.brand.name}</div>
        </div>
      </div>

      {/* Location & Time */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-5 pb-5 border-b border-slate-50">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {campaign.location}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" /> Oct 2023
        </div>
      </div>

      {/* Requirements Section */}
      <div className="space-y-3 mb-5 flex-1">
        <div>
           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
             <Users className="w-3 h-3" /> Requirements
           </div>
           <div className="flex flex-wrap gap-2">
             <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200">
               {campaign.requirements.minFollowers >= 1000 ? `${campaign.requirements.minFollowers / 1000}k+` : campaign.requirements.minFollowers} Followers
             </span>
             {campaign.requirements.platforms.map(p => (
               <span key={p} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                 {p}
               </span>
             ))}
           </div>
        </div>
      </div>

      {/* Perks Section (The "Reward") */}
      <div className="mt-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
             <CheckCircle className="w-3 h-3 text-orange-500" /> Perks
        </div>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {campaign.perks.map(perk => (
            <span key={perk} className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {perk}
            </span>
          ))}
        </div>

        <button className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5">
          View Details & Apply
        </button>
      </div>
    </div>
  );
};

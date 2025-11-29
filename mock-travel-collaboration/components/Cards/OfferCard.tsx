
import React, { useState } from 'react';
import { Offer } from '../../types';
import { Star, ShieldCheck, MapPin, Heart, Users, Calendar, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OfferCardProps {
  offer: Offer;
  active?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  onRequestMeet?: () => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, active, onHover, onLeave, onRequestMeet }) => {
  const isMeetup = offer.type === 'MEETUP';
  const [joined, setJoined] = useState(false);

  // Fallback image if specific one isn't provided (though we updated constants to have them)
  const imageUrl = offer.imageUrl || `https://picsum.photos/seed/${offer.id}/300/300`;

  // --- MEETUP CARD DESIGN ---
  if (isMeetup) {
    const attendees = offer.attendees || [];
    const max = offer.maxAttendees || 10;
    const progress = (attendees.length / max) * 100;
    
    return (
      <div 
        className={`group relative bg-white rounded-3xl p-4 transition-all duration-300 border-2 ${active ? 'border-indigo-500 shadow-xl ring-2 ring-indigo-500/20' : 'border-indigo-50 hover:border-indigo-200 hover:shadow-lg'}`}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        <div className="flex gap-4">
          {/* Personal Photo Thumbnail for Meetup */}
          <div className="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden relative shadow-sm">
            <img src={imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Host" />
            <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-transparent transition-colors"></div>
          </div>

          <div className="flex-1 min-w-0">
             {/* Badge */}
            <div className="flex justify-between items-start mb-1">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" /> Group
              </span>
              <button className="text-slate-300 hover:text-red-500 transition-colors">
                <Heart className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <h3 className="text-base font-bold text-slate-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{offer.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{offer.description}</p>
          </div>
        </div>

        {/* Social Proof / Attendees */}
        <div className="bg-slate-50 rounded-xl p-3 mb-3 mt-3">
           <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
             <span>{attendees.length} / {max} Going</span>
             <span className={progress >= 80 ? 'text-red-500' : 'text-green-500'}>
               {max - attendees.length} spots left
             </span>
           </div>
           
           {/* Progress Bar */}
           <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
             <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
           </div>

           {/* Face Pile */}
           <div className="flex items-center justify-between">
              <div className="flex -space-x-2 overflow-hidden">
                {attendees.slice(0, 4).map((a, i) => (
                  <img key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src={a.avatarUrl} alt="" />
                ))}
                {attendees.length > 4 && (
                  <div className="flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 text-[9px] font-bold text-slate-600">
                    +{attendees.length - 4}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                 <MapPin className="w-3 h-3" /> 0.4km
              </div>
           </div>
        </div>

        {/* Host & Action */}
        <div className="flex items-center justify-between mt-auto">
           <div className="flex items-center gap-2">
              <img src={offer.user.avatarUrl} className="w-6 h-6 rounded-full border border-white shadow-sm" alt="" />
              <div className="flex flex-col">
                 <span className="text-[9px] text-slate-400 font-bold uppercase">Host</span>
                 <span className="text-xs font-bold text-slate-900 line-clamp-1 max-w-[80px]">{offer.user.name}</span>
              </div>
           </div>
           
           <button 
             onClick={(e) => { 
               e.preventDefault(); 
               if (onRequestMeet) {
                 onRequestMeet();
               } else {
                 setJoined(!joined); 
               }
             }}
             className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md z-20 flex items-center gap-1.5
               ${joined ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}
             `}
           >
             {joined ? <><Check className="w-3 h-3" /> Going</> : (onRequestMeet ? 'Request to Join' : 'Join RSVP')}
           </button>
        </div>

        {/* Interactive Overlay Link */}
        <Link to={`/offer/${offer.id}`} className="absolute inset-0 z-10" />
      </div>
    );
  }

  // --- STANDARD SESSION / SERVICE CARD DESIGN ---
  return (
    <div 
      className={`group relative bg-white rounded-2xl p-4 transition-all duration-300 border ${active ? 'border-primary-500 shadow-lg ring-1 ring-primary-500' : 'border-slate-100 hover:border-slate-300 hover:shadow-md'}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="flex gap-4">
        {/* Media Side */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
            <img src={imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Offer" />
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-slate-700">
                {offer.type}
            </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-base font-semibold text-slate-900 truncate pr-2">{offer.title}</h3>
              <button className="text-slate-400 hover:text-red-500 transition-colors">
                <Heart className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mt-1 mb-2">
              <div className="flex items-center text-yellow-500 text-xs font-medium">
                <Star className="w-3 h-3 fill-current" />
                <span className="ml-1">{offer.user.stats?.rating}</span>
                <span className="text-slate-400 font-normal ml-0.5">({offer.user.stats?.reviewCount})</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                 <MapPin className="w-3 h-3" />
                 0.4km away
              </div>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2">{offer.description}</p>
          </div>

          <div className="flex items-end justify-between mt-3">
             <div className="flex items-center gap-2">
                <img src={offer.user.avatarUrl} className="w-6 h-6 rounded-full border border-white shadow-sm" alt="" />
                <span className="text-xs font-medium text-slate-700">{offer.user.name}</span>
                {offer.user.isVerified && <ShieldCheck className="w-3 h-3 text-accent-500" />}
             </div>
             
             <div className="text-right">
                <div className="text-lg font-bold text-slate-900 leading-none">
                    ${offer.price.amount}
                    {offer.price.amount > 0 && <span className="text-xs font-normal text-slate-500 ml-0.5">/{offer.price.unit === 'hourly' ? 'hr' : 'fix'}</span>}
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Interactive Overlay Link */}
      <Link to={`/offer/${offer.id}`} className="absolute inset-0 z-10" />
    </div>
  );
};

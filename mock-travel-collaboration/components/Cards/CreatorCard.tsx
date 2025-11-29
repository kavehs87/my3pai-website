
import React, { useState } from 'react';
import { Creator } from '../../types';
import { Shield, Instagram, Youtube, Briefcase, Coffee, CheckCircle, Clock, AlertCircle, Music, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface CreatorCardProps {
  creator: Creator;
  onBusinessClick?: () => void;
  onHangoutClick?: () => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onBusinessClick, onHangoutClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getAvailabilityBadge = () => {
    switch(creator.availability.status) {
      case 'AVAILABLE':
        return (
          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border border-green-200">
            <CheckCircle className="w-3 h-3" /> Available
          </div>
        );
      case 'BOOKED':
        return (
          <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border border-orange-200">
            <Clock className="w-3 h-3" /> Booked {creator.availability.until ? `until ${creator.availability.until}` : ''}
          </div>
        );
      case 'BUSY':
        return (
          <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border border-red-200">
            <AlertCircle className="w-3 h-3" /> Busy
          </div>
        );
      default:
        return null;
    }
  };

  const cleanHandle = creator.handle.replace('@', '');

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col relative w-full ${isExpanded ? 'ring-2 ring-purple-500/10' : ''}`}>
      {/* Cover Image */}
      <div className="h-28 bg-slate-200 relative overflow-hidden flex-shrink-0">
        <img 
          src={creator.coverUrl} 
          alt="Cover" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
        
        {/* Availability Badge - Top Left */}
        <div className="absolute top-3 left-3 z-10">
          {getAvailabilityBadge()}
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="px-5 pb-5 pt-12 relative flex-1 flex flex-col items-center text-center">
        
        {/* Avatar (Centered) */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
            <img src={creator.avatarUrl} alt={creator.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Name, Handle & Location (Always Visible) */}
        <div className="mb-4 w-full">
          <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-1.5 leading-tight">
            {creator.name}
            {creator.isVerified && <Shield className="w-4 h-4 text-blue-500 fill-current" />}
          </h3>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-1">
             <a 
                href={`https://instagram.com/${cleanHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-medium hover:text-slate-800 hover:underline transition-colors"
             >
                {creator.handle}
             </a>
             <span className="text-slate-300">•</span>
             <span className="flex items-center gap-1 text-xs uppercase tracking-wide">
               <MapPin className="w-3 h-3" /> {creator.location}
             </span>
          </div>
        </div>

        {/* Stats Row (Always Visible) */}
        <div className="flex items-center justify-center gap-6 py-3 border border-slate-100 bg-slate-50/50 rounded-xl w-full mb-2">
          <div className="text-center">
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Followers</div>
             <div className="font-bold text-slate-900 text-sm">{creator.metrics.followers}</div>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="text-center">
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Engage</div>
             <div className="font-bold text-green-600 text-sm">{creator.metrics.engagement}</div>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="text-center">
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Avg Likes</div>
             <div className="font-bold text-slate-900 text-sm">{creator.metrics.avgLikes}</div>
          </div>
        </div>

        {/* Collapsed State Toggle */}
        {!isExpanded && (
           <button 
             onClick={() => setIsExpanded(true)}
             className="w-full mt-2 pt-2 flex flex-col items-center gap-1 group/expand border-t border-slate-50 transition-colors"
           >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover/expand:text-purple-600 transition-colors">View Details</span>
              <ChevronDown className="w-4 h-4 text-slate-300 group-hover/expand:text-purple-600 transition-colors" />
           </button>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="w-full animate-in slide-in-from-top-2 fade-in duration-300">
            {/* Bio */}
            <p className="text-sm text-slate-600 line-clamp-3 mb-5 mt-4 px-1 leading-relaxed">
              {creator.bio}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                {creator.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-white text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-200 shadow-sm">
                    {tag}
                </span>
                ))}
            </div>

            {/* Portfolio Preview */}
            {creator.portfolio && creator.portfolio.length > 0 && (
              <div className="w-full mb-5 border-t border-slate-50 pt-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-left px-1">Featured Work</div>
                <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide snap-x">
                  {creator.portfolio.map((img, i) => (
                    <a
                      key={i}
                      href={`https://instagram.com/${cleanHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-100 snap-start shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Portfolio" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Social Icons */}
            <div className="flex justify-center gap-5 text-slate-400 mb-5 w-full">
                {creator.platforms.includes('Instagram') && (
                  <a 
                    href={`https://instagram.com/${cleanHandle}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    title="Instagram"
                    className="hover:text-pink-600 transition-colors p-2 hover:bg-pink-50 rounded-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {creator.platforms.includes('YouTube') && (
                  <a 
                    href={`https://youtube.com/@${cleanHandle}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    title="YouTube"
                    className="hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {creator.platforms.includes('TikTok') && (
                  <a 
                    href={`https://tiktok.com/@${cleanHandle}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    title="TikTok"
                    className="hover:text-black transition-colors p-2 hover:bg-slate-100 rounded-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Music className="w-5 h-5" />
                  </a>
                )}
            </div>

            {/* Action Buttons */}
            <div className="mt-auto grid grid-cols-2 gap-3 w-full">
              <button 
                onClick={onHangoutClick}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors group/btn shadow-sm"
              >
                <Coffee className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                Request Hangout
              </button>
              <button 
                onClick={onBusinessClick}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5"
              >
                <Briefcase className="w-4 h-4" />
                Business
              </button>
            </div>

            {/* Collapse Toggle */}
            <button 
              onClick={() => setIsExpanded(false)}
              className="w-full mt-3 flex justify-center text-slate-300 hover:text-slate-500 transition-colors pb-1"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

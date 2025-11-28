

import React from 'react';
import { YOUTUBE_VIDEOS, SHORT_FORM_CONTENT } from '../constants';
import { Instagram, Youtube, Facebook, Play, Music2 } from 'lucide-react';

export const SocialFeedSection: React.FC = () => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
        case 'YouTube': return <Youtube className="w-4 h-4 text-red-600" />;
        case 'Instagram': return <Instagram className="w-4 h-4 text-pink-600" />;
        case 'TikTok': return <Music2 className="w-4 h-4 text-black" />;
        case 'Facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
        default: return <Instagram className="w-4 h-4" />;
    }
  };

  return (
    <section id="socials" className="space-y-8">
       <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900">Latest from Socials</h2>
       </div>
       
       {/* 1. YouTube Videos (Landscape) */}
       <div>
         <div className="flex items-center gap-2 mb-4">
             <Youtube className="w-5 h-5 text-red-600" />
             <h3 className="font-bold text-lg text-slate-800">Latest on YouTube</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {YOUTUBE_VIDEOS.map(video => (
               <div key={video.id} className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all aspect-video">
                    <img src={video.image} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-white ml-1" />
                        </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
                        {video.duration}
                    </div>

                    {/* Title Overlay */}
                    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
                        <h4 className="text-white font-bold text-sm md:text-base line-clamp-1">{video.title}</h4>
                        <span className="text-white/80 text-xs">{video.views} views</span>
                    </div>
               </div>
           ))}
         </div>
       </div>

       {/* 2. Reels & Shorts (Portrait/Vertical) */}
       <div>
         <div className="flex items-center gap-2 mb-4">
             <Instagram className="w-5 h-5 text-pink-500" />
             <h3 className="font-bold text-lg text-slate-800">Reels & TikToks</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SHORT_FORM_CONTENT.map(post => (
                <div key={post.id} className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all aspect-[9/16]">
                    <img src={post.image} alt={post.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    {/* Platform Badge */}
                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
                        {getPlatformIcon(post.platform)}
                    </div>

                    {/* Stats & Caption */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12">
                         <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium mb-1">
                             <Play className="w-3 h-3 fill-white" />
                             <span>{post.views}</span>
                         </div>
                         <p className="text-white font-bold text-xs line-clamp-2">{post.caption}</p>
                    </div>
                </div>
            ))}
         </div>
       </div>
       
       <div className="flex justify-center pt-4">
            <button className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors border-b border-transparent hover:border-slate-300 pb-0.5">
                View all content
            </button>
       </div>
    </section>
  );
};

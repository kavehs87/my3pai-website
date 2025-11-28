

import React from 'react';
import { MEDIA_ASSETS } from '../constants';
import { Download, Film, Image as ImageIcon, Sliders, ArrowUpRight, Check, ShoppingCart } from 'lucide-react';

interface MediaSectionProps {
  onAddToCart?: () => void;
}

export const MediaSection: React.FC<MediaSectionProps> = ({ onAddToCart }) => {
  return (
    <section id="media" className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
       <div className="flex flex-col md:flex-row justify-between gap-6 md:items-end">
            <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">Creative Shop</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Digital Assets & Stock</h2>
                <p className="text-slate-500 text-base leading-relaxed">
                   Elevate your content with my professional-grade materials. 
                   Purchase <span className="text-slate-900 font-medium">4K drone footage</span>, 
                   <span className="text-slate-900 font-medium"> RAW photo packs</span>, and 
                   <span className="text-slate-900 font-medium"> Cinematic LUTs</span>. 
                   All assets come with a royalty-free commercial license.
                </p>
                <div className="flex flex-wrap gap-4 mt-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Instant Download</span>
                    <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Commercial Use</span>
                    <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> High Bitrate</span>
                </div>
            </div>
            <button className="shrink-0 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center gap-2">
                Browse Full Library <ArrowUpRight className="w-4 h-4" />
            </button>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {MEDIA_ASSETS.map(asset => (
               <div key={asset.id} className="group relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all bg-slate-50">
                    <div className="aspect-video overflow-hidden relative">
                         <img src={asset.image} alt={asset.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                         
                         {/* Type Badge */}
                         <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 shadow-sm">
                            {asset.type === 'Video' && <Film className="w-3 h-3 text-blue-500" />}
                            {asset.type === 'Photo' && <ImageIcon className="w-3 h-3 text-purple-500" />}
                            {asset.type === 'Preset' && <Sliders className="w-3 h-3 text-orange-500" />}
                            {asset.type}
                         </div>
                    </div>

                    <div className="p-5">
                         <h3 className="font-bold text-slate-900 mb-1">{asset.title}</h3>
                         <p className="text-xs text-slate-500 mb-4 line-clamp-2">{asset.description}</p>
                         
                         <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                             <div className="flex flex-col">
                                 <span className="text-[10px] font-bold uppercase text-slate-400">License</span>
                                 <span className="text-lg font-bold text-slate-900">${asset.price}</span>
                             </div>
                             <button 
                                onClick={onAddToCart}
                                className="bg-white border border-slate-200 text-slate-900 p-2.5 rounded-lg hover:bg-slate-900 hover:text-white transition-colors"
                             >
                                 <ShoppingCart className="w-4 h-4" />
                             </button>
                         </div>
                    </div>
               </div>
           ))}
       </div>
    </section>
  );
};
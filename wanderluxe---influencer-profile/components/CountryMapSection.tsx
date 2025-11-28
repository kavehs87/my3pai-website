

import React, { useState } from 'react';
import { COUNTRIES } from '../constants';
import { Country } from '../types';
import { MapPin, X, ArrowUpRight, Tag, ShoppingCart, Check } from 'lucide-react';

interface CountryMapSectionProps {
  onAddToCart?: () => void;
}

export const CountryMapSection: React.FC<CountryMapSectionProps> = ({ onAddToCart }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const handleAddToCart = () => {
    if (onAddToCart) onAddToCart();
    // Could add visual feedback or close modal here
    setSelectedCountry(null);
  };

  return (
    <section id="countries" className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Destinations</h2>
        <span className="text-xs font-mono text-slate-400">{COUNTRIES.length} COUNTRIES VISITED</span>
      </div>
      
      {/* Equal Size Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {COUNTRIES.map((country) => (
          <div 
            key={country.id} 
            onClick={() => setSelectedCountry(country)}
            className="group relative rounded-3xl overflow-hidden cursor-pointer h-80 w-full shadow-md hover:shadow-xl transition-shadow"
          >
            <img 
                src={country.image} 
                alt={country.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            
            {/* Darker Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/80 group-hover:via-black/20 group-hover:to-black/90 transition-all duration-300" />
            
            {/* Floating Flag Badge */}
            <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/30 shadow-lg">
                  {country.flagCode}
                </span>
                {country.mapDiscount && (
                    <span className="bg-rose-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {country.mapDiscount}
                    </span>
                )}
            </div>

            {/* Price Tag (Map Pack) */}
            {country.mapPrice && (
                 <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform">
                    <span className="bg-white text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        ${country.mapPrice} <span className="font-normal text-slate-500">| Map</span>
                    </span>
                </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-3xl font-bold text-white mb-2 leading-none drop-shadow-md">{country.name}</h3>
                  <p className="text-sm text-slate-100 mb-4 line-clamp-2 leading-relaxed font-medium drop-shadow-sm">
                    {country.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/20">
                     <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-white" />
                        <span className="text-xs font-bold uppercase tracking-widest text-white">{country.pointsOfInterestCount} Spots Included</span>
                     </div>
                     <div className="bg-white/20 p-2 rounded-full group-hover:bg-white group-hover:text-black transition-colors text-white">
                        <ArrowUpRight className="w-4 h-4" />
                     </div>
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg h-[70vh] flex flex-col shadow-2xl overflow-hidden relative border border-white/20">
            <div className="absolute top-4 right-4 z-10">
                <button 
                    onClick={() => setSelectedCountry(null)}
                    className="bg-black/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/40 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="h-56 shrink-0 relative">
               <img src={selectedCountry.image} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
               <div className="absolute bottom-6 left-6 text-white max-w-[80%]">
                   <h2 className="text-3xl font-bold mb-2">{selectedCountry.name}</h2>
                   <p className="text-sm text-white/90 leading-snug">{selectedCountry.description}</p>
               </div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Curated Locations</h4>
                 <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">{selectedCountry.pointsOfInterestCount} total</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {selectedCountry.pois.map((poi, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-md">
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{poi.name}</h5>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {poi.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-bold uppercase tracking-wide text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                       <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100">
                <button 
                    onClick={handleAddToCart}
                    className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="text-base">Add Map to Cart</span>
                    <div className="bg-white/20 px-2 py-1 rounded text-white font-bold ml-auto flex items-center gap-2">
                        {selectedCountry.mapPrice && <span className="text-slate-300 font-normal line-through text-xs">${selectedCountry.mapPrice + 10}</span>}
                        <span>${selectedCountry.mapPrice}</span>
                    </div>
                </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
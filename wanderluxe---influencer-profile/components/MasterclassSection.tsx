

import React from 'react';
import { MASTERCLASSES } from '../constants';
import { GraduationCap, Star, ArrowRight, ShoppingCart, Heart } from 'lucide-react';

interface MasterclassSectionProps {
  onAddToCart?: () => void;
}

export const MasterclassSection: React.FC<MasterclassSectionProps> = ({ onAddToCart }) => {
  return (
    <section id="training" className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-purple-100 rounded-lg">
            <GraduationCap className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Training & Masterclasses</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MASTERCLASSES.map(pkg => (
          <div key={pkg.id} className="group bg-white rounded-2xl p-2 shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-1/3 h-48 md:h-auto rounded-xl overflow-hidden shrink-0">
              <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            
            <div className="py-2 px-2 md:py-4 md:pr-4 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Course</span>
                   <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-slate-400">5.0</span>
                   </div>
              </div>
              
              <h3 className="font-bold text-lg text-slate-900 mb-2">{pkg.title}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{pkg.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                <span className="text-lg font-bold text-slate-900">${pkg.price}</span>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors">
                        <Heart className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={onAddToCart}
                        className="text-sm font-bold bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors shadow-lg shadow-purple-600/20 active:scale-95"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
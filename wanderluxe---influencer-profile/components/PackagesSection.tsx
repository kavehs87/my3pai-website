
import React from 'react';
import { PACKAGES } from '../constants';
import { ShoppingBag, Star, Zap } from 'lucide-react';

export const PackagesSection: React.FC = () => {
  return (
    <section id="packages" className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-slate-900 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Featured Packages</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PACKAGES.map(pkg => (
          <div key={pkg.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-100 hover:border-slate-200 relative top-0 hover:-top-1">
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-sm border border-slate-100">
                {pkg.type}
              </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-slate-300 ml-1">(42)</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2 leading-snug">{pkg.title}</h3>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2">{pkg.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <div>
                    <span className="text-xs text-slate-400 line-through mr-2">${pkg.price + 20}</span>
                    <span className="text-xl font-bold text-slate-900">${pkg.price}</span>
                </div>
                <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-bold shadow-lg shadow-slate-900/10">
                  <ShoppingBag className="w-4 h-4" />
                  Buy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

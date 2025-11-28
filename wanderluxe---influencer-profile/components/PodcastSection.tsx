
import React from 'react';
import { PODCAST_EPISODES } from '../constants';
import { Play, Lock, Mic, Headphones, BarChart3 } from 'lucide-react';

export const PodcastSection: React.FC = () => {
  return (
    <section id="podcast" className="bg-[#1a1c23] rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-900/10 overflow-hidden relative isolate">
      {/* Abstract Background Shapes */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Headphones className="w-8 h-8 text-white" />
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">New Episodes</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">WanderLuxe Audio</h2>
                <p className="text-slate-400 text-sm">Travel stories & tips on the go.</p>
            </div>
        </div>
        <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium border border-white/5">
            <Mic className="w-4 h-4" />
            <span>Subscribe</span>
        </button>
      </div>
      
      <div className="space-y-2">
        {PODCAST_EPISODES.map((episode, index) => (
            <div key={episode.id} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5">
                <div className="text-slate-600 font-mono text-xs w-4">{(index + 1).toString().padStart(2, '0')}</div>
                
                <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-slate-800">
                    <img src={episode.image} alt={episode.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                </div>
                
                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-200 truncate group-hover:text-white transition-colors">{episode.title}</h3>
                        {episode.isPremium && <Lock className="w-3 h-3 text-amber-400" />}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{episode.description}</p>
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex items-center gap-1">
                         <div className="w-0.5 h-3 bg-indigo-500 rounded-full"></div>
                         <div className="w-0.5 h-5 bg-indigo-500/60 rounded-full"></div>
                         <div className="w-0.5 h-2 bg-indigo-500/40 rounded-full"></div>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{episode.duration}</span>
                </div>
            </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2">
            View Full Library <BarChart3 className="w-3 h-3" />
        </button>
      </div>
    </section>
  );
};

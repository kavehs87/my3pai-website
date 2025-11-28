

import React from 'react';
import { BLOG_POSTS } from '../constants';
import { ArrowRight, BookOpen } from 'lucide-react';

export const BlogSection: React.FC = () => {
  return (
    <section id="blog" className="space-y-8">
       <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-900">Travel Blog</h2>
            <BookOpen className="w-5 h-5 text-slate-300" />
       </div>
       
       <div className="space-y-0">
            {BLOG_POSTS.map((post, index) => (
                <article key={post.id} className="group cursor-pointer py-6 border-b border-slate-100 flex flex-col md:flex-row gap-6 items-start hover:bg-white transition-colors relative">
                    <div className="w-12 shrink-0 hidden md:block pt-1">
                        <span className="text-xs font-mono text-slate-400">0{index + 1}</span>
                    </div>

                    <div className="flex-grow">
                        <div className="flex items-center gap-3 text-xs font-bold tracking-wider text-slate-400 mb-2 uppercase">
                            <span>{post.date}</span>
                            {post.isPremium && <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Premium</span>}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                            {post.title}
                        </h3>
                        <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-2xl">
                            {post.preview}
                        </p>
                    </div>

                    <div className="shrink-0 pt-2 opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                         <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-900">
                             <ArrowRight className="w-4 h-4" />
                         </div>
                    </div>
                </article>
            ))}
       </div>
       
       <button className="text-sm font-bold text-slate-500 hover:text-slate-900 underline decoration-slate-300 underline-offset-4">
            Read all entries
       </button>
    </section>
  );
};


import React, { useState, useMemo } from 'react';
import { MOCK_OFFERS } from '../constants';
import { OfferCard } from '../components/Cards/OfferCard';
import { Search, Star, SlidersHorizontal, Presentation } from 'lucide-react';

export const Sessions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevant');
  const [minRating, setMinRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Photography', 'Wellness', 'Food', 'Art', 'Outdoor'];

  const filteredAndSortedOffers = useMemo(() => {
    let result = MOCK_OFFERS.filter(o => o.type !== 'MEETUP');

    // Text Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.title.toLowerCase().includes(q) || 
        o.description.toLowerCase().includes(q) ||
        o.user.name?.toLowerCase().includes(q)
      );
    }

    // Category Filter (Basic Keyword Match)
    if (selectedCategory !== 'All') {
        const cat = selectedCategory.toLowerCase();
        result = result.filter(o => 
            o.title.toLowerCase().includes(cat) || 
            o.description.toLowerCase().includes(cat) ||
            (cat === 'wellness' && o.title.toLowerCase().includes('yoga')) ||
            (cat === 'art' && (o.title.toLowerCase().includes('pottery') || o.title.toLowerCase().includes('calligraphy')))
        );
    }

    // Filter by Rating
    if (minRating > 0) {
      result = result.filter(o => (o.user.stats?.rating || 0) >= minRating);
    }

    // Sort
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price.amount - b.price.amount);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price.amount - a.price.amount);
    } else if (sortBy === 'rating_desc') {
      result.sort((a, b) => (b.user.stats?.rating || 0) - (a.user.stats?.rating || 0));
    }
    // 'relevant' keeps default mock order

    return result;
  }, [searchQuery, sortBy, minRating, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full overflow-y-auto">
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
             <Presentation className="w-6 h-6" />
           </div>
           <span className="font-bold text-blue-600 uppercase tracking-wider text-xs">Workshops & Activities</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Explore Sessions</h1>
        <p className="text-slate-500 max-w-2xl">
          Discover workshops and creative sessions organized by fellow travelers and locals. Join yoga sessions, photography classes, cooking workshops, and more.
        </p>
        
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                type="text" 
                placeholder="Search for yoga, photography, workshops..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm transition-shadow"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Filters & Sort */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                {/* Rating Filter */}
                <div className="relative group">
                    <select 
                    className="appearance-none pl-9 pr-8 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer text-sm font-medium min-w-[140px]"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    >
                    <option value="0">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.8">4.8+ Stars</option>
                    <option value="5">5.0 Stars</option>
                    </select>
                    <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 fill-current" />
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <select 
                    className="appearance-none pl-9 pr-8 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer text-sm font-medium min-w-[160px]"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    >
                    <option value="relevant">Most Relevant</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating_desc">Highest Rated</option>
                    </select>
                    <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {categories.map(cat => (
                 <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${
                        selectedCategory === cat 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                 >
                    {cat}
                 </button>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredAndSortedOffers.length > 0 ? (
          filteredAndSortedOffers.map(offer => (
            <OfferCard key={offer.id} offer={offer} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No sessions found</h3>
            <p className="text-slate-500">Try adjusting your category filter or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

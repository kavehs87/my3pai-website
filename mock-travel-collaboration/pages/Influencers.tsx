

import React, { useState } from 'react';
import { MOCK_CREATORS } from '../constants';
import { CreatorCard } from '../components/Cards/CreatorCard';
import { Search, Crown, SlidersHorizontal, MapPin, Calendar, X, CheckCircle, Send, DollarSign, FileText, Gift, Coffee, MessageCircle, Clock } from 'lucide-react';
import { Creator } from '../types';

export const Influencers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [nicheFilter, setNicheFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Proposal Modal State
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [proposalSent, setProposalSent] = useState(false);

  // Hangout Modal State
  const [selectedHangoutCreator, setSelectedHangoutCreator] = useState<Creator | null>(null);
  const [hangoutSent, setHangoutSent] = useState(false);

  const filteredCreators = MOCK_CREATORS.filter(c => {
    // Text Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = 
        c.name.toLowerCase().includes(q) || 
        c.handle.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q));
      if (!matches) return false;
    }

    // Niche Filter
    if (nicheFilter !== 'ALL') {
      if (!c.tags.includes(nicheFilter)) return false;
    }

    // Location Filter (Where)
    if (locationFilter) {
      if (!c.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    }

    // Availability Filter
    if (availabilityFilter === 'AVAILABLE') {
      if (c.availability.status !== 'AVAILABLE') return false;
    }

    // Date Filter (When)
    // Note: In a real app, this would check the creator's availability calendar. 
    // For this mock, we assume they are available if the filter is set.
    
    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setNicheFilter('ALL');
    setLocationFilter('');
    setAvailabilityFilter('ALL');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = searchQuery || nicheFilter !== 'ALL' || locationFilter || availabilityFilter !== 'ALL' || startDate || endDate;

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    setProposalSent(true);
    // Simulate API delay
    setTimeout(() => {
        setProposalSent(false);
        setSelectedCreator(null);
    }, 2500);
  };

  const handleSendHangout = (e: React.FormEvent) => {
    e.preventDefault();
    setHangoutSent(true);
    // Simulate API delay
    setTimeout(() => {
        setHangoutSent(false);
        setSelectedHangoutCreator(null);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full overflow-y-auto">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
             <Crown className="w-6 h-6" />
           </div>
           <span className="font-bold text-purple-600 uppercase tracking-wider text-xs">Top Creators</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Influencers</h1>
        <p className="text-slate-500 max-w-2xl">
          Discover and collaborate with top-tier content creators in your area. Request meetups or send business proposals directly.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row gap-4 mb-8 sticky top-0 bg-slate-50 z-20 py-2">
         
         {/* Search */}
         <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search name, handle, tag..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>

         <div className="flex flex-wrap gap-2 items-center flex-1">
            {/* Location (Where) */}
            <div className="relative min-w-[180px] flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Where? (e.g. Tokyo)" 
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm text-sm"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>

            {/* Dates (When) */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm min-w-fit flex-1 xl:flex-none">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input 
                type="date" 
                className="text-sm font-medium text-slate-700 bg-transparent focus:outline-none w-full xl:w-[110px]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-slate-300">-</span>
              <input 
                type="date" 
                className="text-sm font-medium text-slate-700 bg-transparent focus:outline-none w-full xl:w-[110px]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Availability Filter */}
            <div className="relative min-w-[160px] flex-1 xl:flex-none">
                <select 
                  className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm text-sm font-medium"
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                >
                  <option value="ALL">Any Availability</option>
                  <option value="AVAILABLE">Available for Collabs</option>
                </select>
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Niche Filter */}
            <div className="relative min-w-[140px] flex-1 xl:flex-none">
                <select 
                  className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm text-sm font-medium"
                  value={nicheFilter}
                  onChange={(e) => setNicheFilter(e.target.value)}
                >
                  <option value="ALL">All Niches</option>
                  <option value="Travel">Travel</option>
                  <option value="Food">Food</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Tech">Tech</option>
                  <option value="Fashion">Fashion</option>
                </select>
                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Clear Filters"
              >
                <X className="w-5 h-5" />
              </button>
            )}
         </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24 items-start">
        {filteredCreators.length > 0 ? (
          filteredCreators.map(creator => (
            <CreatorCard 
                key={creator.id} 
                creator={creator} 
                onBusinessClick={() => setSelectedCreator(creator)}
                onHangoutClick={() => setSelectedHangoutCreator(creator)}
            />
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No influencers found matching your criteria.</p>
            <button onClick={clearFilters} className="text-primary-600 font-bold mt-2 hover:underline">Clear Filters</button>
          </div>
        )}
      </div>

      {/* Business Proposal Modal */}
      {selectedCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <img src={selectedCreator.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
                        <div>
                            <h3 className="font-bold text-slate-900 leading-tight">Proposal for {selectedCreator.name}</h3>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Business Collaboration</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedCreator(null)} 
                        className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                {proposalSent ? (
                    <div className="p-12 flex flex-col items-center text-center justify-center h-full">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Proposal Sent!</h3>
                        <p className="text-slate-500 mb-8 max-w-xs">
                            We've notified {selectedCreator.name} about your opportunity. You'll receive a response in your inbox soon.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSendProposal} className="p-6 space-y-5 overflow-y-auto">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Campaign Title</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Summer Hotel Launch Campaign"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Details & Concept</label>
                            <textarea 
                                rows={3}
                                placeholder="Describe your brand and what you're looking for..."
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium resize-none"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase mb-1.5">
                                    <FileText className="w-3.5 h-3.5" /> Deliverables
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 1 Reel, 3 Stories"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase mb-1.5">
                                    <Gift className="w-3.5 h-3.5" /> Compensation
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. $500 + 2 Night Stay"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                                />
                            </div>
                        </div>
                        
                        <div className="pt-2">
                             <button 
                                type="submit"
                                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
                             >
                                <Send className="w-4 h-4" /> Send Proposal
                             </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      )}

      {/* Hangout Request Modal */}
      {selectedHangoutCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                
                {/* Modal Header */}
                <div className="p-4 border-b border-indigo-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-white rounded-full shadow-sm text-indigo-600">
                             <Coffee className="w-5 h-5" />
                         </div>
                        <div>
                           <h3 className="font-bold text-slate-900">Hangout Request</h3>
                           <p className="text-xs text-indigo-600 font-medium">with {selectedHangoutCreator.name.split(' ')[0]}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedHangoutCreator(null)} 
                        className="w-8 h-8 rounded-full bg-white/50 text-slate-500 flex items-center justify-center hover:bg-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                {hangoutSent ? (
                    <div className="p-8 flex flex-col items-center text-center justify-center h-full min-h-[300px]">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Request Sent!</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Fingers crossed! If {selectedHangoutCreator.name.split(' ')[0]} is interested, they'll message you back.
                        </p>
                        <button onClick={() => setSelectedHangoutCreator(null)} className="text-indigo-600 font-bold text-sm hover:underline">Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleSendHangout} className="p-5 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Activity Vibe</label>
                            <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white">
                                <option>Coffee & Chat</option>
                                <option>Photo Walk</option>
                                <option>Food / Lunch</option>
                                <option>Explore the City</option>
                                <option>Nightlife / Drinks</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">When?</label>
                            <input 
                                type="datetime-local" 
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Personal Message</label>
                            <textarea 
                                rows={3}
                                placeholder={`Hi ${selectedHangoutCreator.name.split(' ')[0]}! I love your content about...`}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium resize-none"
                            ></textarea>
                        </div>
                        
                        <div className="pt-2">
                             <button 
                                type="submit"
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 shadow-indigo-200"
                             >
                                <Send className="w-4 h-4" /> Send Request
                             </button>
                             <p className="text-center text-[10px] text-slate-400 mt-3">
                                 Friendly reminder: This is for casual networking & fun.
                             </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
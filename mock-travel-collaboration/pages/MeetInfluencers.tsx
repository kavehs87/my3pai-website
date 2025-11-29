

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_OFFERS } from '../constants';
import { OfferCard } from '../components/Cards/OfferCard';
import { SwipeDeck } from '../components/Match/SwipeDeck';
import { Users, User, Filter, Search, Sparkles, Grid, Plus, HeartHandshake, Calendar as CalendarIcon, X, CheckCircle, Send, Coffee, MapPin, Clock } from 'lucide-react';
import { Offer } from '../types';

export const Meetups: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'MATCH' | 'CALENDAR'>('EXPLORE');
  const [typeFilter, setTypeFilter] = useState<'ALL' | '1:1' | 'GROUP'>('ALL');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'PAID' | 'FREE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Proposal Modal State
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  // Calendar Detail Sidebar State
  const [viewingOffer, setViewingOffer] = useState<Offer | null>(null);

  // General Hangout Request Modal State
  const [showHangoutRequestModal, setShowHangoutRequestModal] = useState(false);
  const [hangoutRequestSent, setHangoutRequestSent] = useState(false);
  const [hangoutType, setHangoutType] = useState<'GROUP' | '1:1'>('GROUP');

  const filteredOffers = MOCK_OFFERS.filter(offer => {
    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = 
        offer.title.toLowerCase().includes(q) || 
        offer.description.toLowerCase().includes(q) ||
        offer.user.name?.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // Filter by Interaction Type
    // 1:1 includes SESSION and SERVICE
    // GROUP includes MEETUP
    if (typeFilter === '1:1' && offer.type === 'MEETUP') return false;
    if (typeFilter === 'GROUP' && offer.type !== 'MEETUP') return false;

    // Filter by Price
    if (priceFilter === 'FREE' && offer.price.amount > 0) return false;
    if (priceFilter === 'PAID' && offer.price.amount === 0) return false;

    return true;
  });

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSent(true);
    setTimeout(() => {
        setRequestSent(false);
        setSelectedOffer(null);
    }, 2500);
  };

  const handlePostHangout = (e: React.FormEvent) => {
    e.preventDefault();
    setHangoutRequestSent(true);
    setTimeout(() => {
        setHangoutRequestSent(false);
        setShowHangoutRequestModal(false);
        setHangoutType('GROUP'); // Reset
    }, 2500);
  };

  // Helper to simulate calendar data
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
      
      {/* Header & Main Tabs */}
      <div className="flex flex-col md:flex-row items-end md:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Meetups & Community
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-slate-500">Find your squad or meet locals in Tokyo.</p>
            <button 
                onClick={() => setShowHangoutRequestModal(true)}
                className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-200 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
                <Plus className="w-3.5 h-3.5" /> Request Hangout
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100/50 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('EXPLORE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'EXPLORE' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Grid className="w-4 h-4" /> Explore
            </button>
            <button 
              onClick={() => setActiveTab('MATCH')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'MATCH' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Sparkles className="w-4 h-4" /> Matchmaking
            </button>
            <button 
              onClick={() => setActiveTab('CALENDAR')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'CALENDAR' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CalendarIcon className="w-4 h-4" /> Calendar
            </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        
        {activeTab === 'MATCH' && (
          <div className="h-full flex flex-col items-center animate-in fade-in duration-300">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">Vibe Match</h2>
              <p className="text-slate-500 text-sm">Swipe to find travelers with similar interests.</p>
            </div>
            <SwipeDeck offers={filteredOffers} />
          </div>
        )}

        {activeTab === 'CALENDAR' && (
          <div className="pb-24 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h2 className="font-bold text-slate-700">October 2023</h2>
                  <div className="flex gap-2">
                     <button className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium hover:bg-slate-50 shadow-sm">Week</button>
                     <button className="px-3 py-1 bg-transparent border border-transparent rounded-md text-xs font-medium text-slate-500 hover:bg-slate-100">Month</button>
                  </div>
               </div>
               <div className="grid grid-cols-7 divide-x divide-slate-100 bg-slate-50 text-center text-xs font-semibold text-slate-500 border-b border-slate-100">
                  {weekDays.map(d => <div key={d} className="py-2.5">{d}</div>)}
               </div>
               <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[400px]">
                  {Array.from({ length: 7 }).map((_, i) => {
                     // Simulate filtering offers for this "day"
                     const dayOffers = filteredOffers.filter((_, idx) => idx % 7 === i);
                     return (
                       <div key={i} className="bg-white p-2 space-y-2 hover:bg-slate-50/50 transition-colors">
                          <div className={`text-center text-sm font-medium mb-3 ${i === 0 ? 'bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto shadow-sm' : 'text-slate-700 pt-1'}`}>
                             {today + i}
                          </div>
                          {dayOffers.map(offer => (
                             <div 
                               key={offer.id}
                               onClick={() => setViewingOffer(offer)}
                               className={`p-2 rounded-lg border text-left cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group ${
                                 offer.type === 'MEETUP' 
                                   ? 'bg-indigo-50 border-indigo-100 hover:border-indigo-200' 
                                   : 'bg-white border-slate-200 hover:border-slate-300'
                               }`}
                             >
                                <div className="flex items-center gap-1 mb-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${offer.type === 'MEETUP' ? 'bg-indigo-500' : 'bg-orange-500'}`}></div>
                                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide truncate">{offer.type === 'MEETUP' ? 'Meetup' : 'Session'}</div>
                                </div>
                                <div className="text-xs font-bold text-slate-900 leading-tight line-clamp-2 mb-1.5 group-hover:text-indigo-600 transition-colors">{offer.title}</div>
                                <div className="flex items-center gap-1.5">
                                   <img src={offer.user.avatarUrl} className="w-4 h-4 rounded-full object-cover ring-1 ring-white" alt="" />
                                   <span className="text-[10px] text-slate-500 truncate font-medium">{offer.user.name}</span>
                                </div>
                             </div>
                          ))}
                       </div>
                     );
                  })}
               </div>
            </div>
            <p className="text-center text-slate-400 text-xs mt-4">
               Times are shown in local time (JST).
            </p>
          </div>
        )}

        {activeTab === 'EXPLORE' && (
          <div className="pb-24 animate-in fade-in duration-300">
            {/* Filters & Search Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8 items-center justify-between sticky top-0 bg-slate-50 z-20 py-2">
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
                
                {/* Segmented Control Type Toggle */}
                <div className="flex items-center p-1 bg-slate-200/60 rounded-xl w-full sm:w-auto">
                  <button
                    onClick={() => setTypeFilter('ALL')}
                    className={`flex-1 sm:flex-none px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${typeFilter === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setTypeFilter('1:1')}
                    className={`flex-1 sm:flex-none px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${typeFilter === '1:1' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    1-on-1
                  </button>
                  <button
                    onClick={() => setTypeFilter('GROUP')}
                    className={`flex-1 sm:flex-none px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${typeFilter === 'GROUP' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Groups
                  </button>
                </div>
                
                {/* Cost Filter */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm text-slate-600 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="font-medium whitespace-nowrap">Cost:</span>
                  <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value as any)}
                      className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer w-full py-1"
                  >
                      <option value="ALL">Any Price</option>
                      <option value="PAID">Paid Only</option>
                      <option value="FREE">Free (Hangout)</option>
                  </select>
                </div>
              </div>

              {/* Search Input */}
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Find hiking buddies, coffee, etc..." 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white shadow-sm text-sm placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.length > 0 ? (
                filteredOffers.map(offer => (
                  <OfferCard 
                    key={offer.id} 
                    offer={offer} 
                    onRequestMeet={() => setSelectedOffer(offer)}
                  />
                ))
              ) : (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <Users className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">No results found</h3>
                  <p className="text-slate-500 max-w-sm mb-6 text-sm">
                    We couldn't find any meetups or sessions matching your filters.
                  </p>
                  <div className="flex gap-3">
                    <button 
                          onClick={() => { setTypeFilter('ALL'); setPriceFilter('ALL'); setSearchQuery(''); }}
                          className="px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                          Clear Filters
                      </button>
                      <button 
                        onClick={() => setShowHangoutRequestModal(true)}
                        className="px-5 py-2.5 bg-slate-900 text-white shadow-lg shadow-slate-900/10 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                      >
                          <Plus className="w-4 h-4" /> Host a Meetup
                      </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Promo for Matchmaking */}
            {filteredOffers.length > 0 && (
              <div className="mt-12 p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl">
                <div className="bg-slate-900/90 backdrop-blur rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
                      <HeartHandshake className="w-8 h-8 text-indigo-300" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">Looking for a specific vibe?</h3>
                      <p className="text-indigo-200 max-w-md">Try our matchmaking feature to swipe through travelers and find your perfect travel buddy.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('MATCH')}
                    className="px-8 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg whitespace-nowrap"
                  >
                    Go to Matchmaking
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Calendar Item Detail Sidebar (Refined) */}
      {viewingOffer && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setViewingOffer(null)}
          />
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl border-l border-slate-100 animate-in slide-in-from-right duration-300 flex flex-col">
             {/* Header Image */}
             <div className="h-48 relative flex-shrink-0">
                <img 
                  src={viewingOffer.imageUrl || `https://picsum.photos/seed/${viewingOffer.id}/600/400`} 
                  className="w-full h-full object-cover" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <button 
                  onClick={() => setViewingOffer(null)}
                  className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-6 text-white">
                   <div className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full inline-block mb-2 border border-white/10">{viewingOffer.type}</div>
                   <h2 className="text-xl font-bold leading-tight shadow-sm">{viewingOffer.title}</h2>
                </div>
             </div>
             
             {/* Content */}
             <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                   <img 
                      src={viewingOffer.user.avatarUrl} 
                      className="w-14 h-14 rounded-full border-2 border-slate-100 object-cover" 
                      alt="" 
                   />
                   <div>
                      <div className="text-xs text-slate-400 font-bold uppercase mb-0.5">Hosted by</div>
                      <h3 className="text-lg font-bold text-slate-900">{viewingOffer.user.name}</h3>
                   </div>
                </div>
                
                <div className="space-y-4 mb-8">
                   <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-400 mt-0.5">
                         <Clock className="w-4 h-4" />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-slate-900">Oct {today + 2}, 2023</div> {/* Mock date */}
                         <div className="text-xs text-slate-500">10:00 AM - 12:00 PM</div>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-400 mt-0.5">
                         <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-slate-900">Shibuya, Tokyo</div>
                         <div className="text-xs text-slate-500">0.4km away</div>
                      </div>
                   </div>
                </div>

                <div className="prose prose-sm text-slate-600">
                   <p>{viewingOffer.description}</p>
                </div>
             </div>

             {/* Footer Actions */}
             <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 flex-shrink-0">
                <Link 
                   to={`/offer/${viewingOffer.id}`}
                   className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm text-center hover:bg-slate-50 transition-colors shadow-sm"
                >
                   View Offer Details
                </Link>
                <button 
                   onClick={() => {
                     setSelectedOffer(viewingOffer);
                     setViewingOffer(null);
                   }}
                   className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                   Request to Meet
                </button>
             </div>
          </div>
        </>
      )}

      {/* Request to Meet Modal (For Specific Offer) */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-indigo-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white rounded-full shadow-sm text-indigo-600">
                            <Coffee className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900">Request to Meet</h3>
                           <p className="text-xs text-indigo-600 font-medium">with {selectedOffer.user.name}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedOffer(null)} 
                        className="w-8 h-8 rounded-full bg-white/50 text-slate-500 flex items-center justify-center hover:bg-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                {requestSent ? (
                    <div className="p-8 flex flex-col items-center text-center justify-center h-full min-h-[300px]">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Request Sent!</h3>
                        <p className="text-sm text-slate-500 mb-8 max-w-xs">
                            Your proposal has been sent to {selectedOffer.user.name}. They will be in touch soon!
                        </p>
                        <button onClick={() => setSelectedOffer(null)} className="px-6 py-2 bg-slate-100 rounded-lg text-slate-700 font-bold text-sm hover:bg-slate-200">Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleSendRequest} className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">What can we do?</label>
                            <input 
                                type="text"
                                placeholder="e.g. Try that new Ramen spot..."
                                defaultValue={selectedOffer.title} 
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-slate-50/50"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">When are you free?</label>
                            <input 
                                type="datetime-local" 
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-slate-50/50"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Personal Message</label>
                            <textarea 
                                rows={3}
                                placeholder="Introduce yourself and share why you want to meet..."
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium resize-none bg-slate-50/50"
                            ></textarea>
                        </div>
                        
                        <div className="pt-2">
                             <button 
                                type="submit"
                                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 shadow-indigo-200"
                             >
                                <Send className="w-4 h-4" /> Send Request
                             </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      )}

      {/* General Hangout Request Modal (Post to Feed) */}
      {showHangoutRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-indigo-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white rounded-full shadow-sm text-indigo-600">
                            {hangoutType === 'GROUP' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900">Post a Hangout</h3>
                           <p className="text-xs text-indigo-600 font-medium">Broadcast to locals & travelers</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowHangoutRequestModal(false)} 
                        className="w-8 h-8 rounded-full bg-white/50 text-slate-500 flex items-center justify-center hover:bg-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                {hangoutRequestSent ? (
                    <div className="p-12 flex flex-col items-center text-center justify-center h-full">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Published!</h3>
                        <p className="text-slate-500 mb-8 max-w-xs">
                            Your {hangoutType === 'GROUP' ? 'hangout' : '1-on-1'} request is now live. Notifications will be sent to travelers matching your vibe.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handlePostHangout} className="p-6 space-y-5 overflow-y-auto">
                        
                        {/* Type Toggle */}
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button 
                                type="button"
                                onClick={() => setHangoutType('GROUP')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${hangoutType === 'GROUP' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Users className="w-4 h-4" /> Group Hangout
                            </button>
                            <button 
                                type="button"
                                onClick={() => setHangoutType('1:1')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${hangoutType === '1:1' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <User className="w-4 h-4" /> 1-on-1 Meet
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Reason / Plan</label>
                            <input 
                                type="text" 
                                placeholder={hangoutType === 'GROUP' ? "e.g. Karaoke night in Shinjuku!" : "e.g. Looking for a tennis partner"}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase mb-1.5">
                                    <MapPin className="w-3.5 h-3.5" /> Location
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Golden Gai"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase mb-1.5">
                                    <Clock className="w-3.5 h-3.5" /> Availability / Time
                                </label>
                                <input 
                                    type="datetime-local" 
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Details</label>
                            <textarea 
                                rows={3}
                                placeholder="Share more about what you want to do and who should join..."
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium resize-none"
                            ></textarea>
                        </div>
                        
                        <div className="pt-2">
                             <button 
                                type="submit"
                                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 shadow-indigo-200"
                             >
                                <Send className="w-4 h-4" /> Post Request
                             </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

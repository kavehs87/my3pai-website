
import React, { useState, useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import { InteractiveMap } from '../components/Map/InteractiveMap';
import { OfferCard } from '../components/Cards/OfferCard';
import { CreatorCard } from '../components/Cards/CreatorCard';
import { CampaignCard } from '../components/Cards/CampaignCard';
import { MOCK_OFFERS, MOCK_CREATORS, MOCK_CAMPAIGNS } from '../constants';
import { List, Map as MapIcon, Search, Filter } from 'lucide-react';
import { MapItem, Offer, Creator, Campaign } from '../types';

export const Discover: React.FC = () => {
  const { activeTrip } = useTrip();
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'both' | 'map' | 'list'>('both'); 
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize all data sources into generic MapItems
  const allMapItems: MapItem[] = useMemo(() => {
    const offers: MapItem[] = MOCK_OFFERS.map(o => ({
      id: o.id,
      category: 'OFFER',
      type: o.type,
      coords: o.coords,
      title: o.title,
      avatarUrl: o.user.avatarUrl || '',
      priceDisplay: o.price.amount > 0 ? `$${o.price.amount}` : 'Free',
      originalData: o
    }));

    const creators: MapItem[] = MOCK_CREATORS.map(c => ({
      id: c.id,
      category: 'CREATOR',
      type: 'INFLUENCER',
      coords: c.coords,
      title: c.name,
      avatarUrl: c.avatarUrl,
      priceDisplay: c.metrics.followers, // Show followers on map tooltip
      originalData: c
    }));

    const campaigns: MapItem[] = MOCK_CAMPAIGNS.map(c => ({
      id: c.id,
      category: 'CAMPAIGN',
      type: 'ADVERTISEMENT',
      coords: c.coords,
      title: c.brand.name,
      avatarUrl: c.brand.logoUrl,
      priceDisplay: 'Perks',
      originalData: c
    }));

    return [...offers, ...creators, ...campaigns];
  }, []);

  // Filter Logic
  const filteredItems = useMemo(() => {
    return allMapItems.filter(item => {
      // Filter by Type
      if (filterType !== 'ALL') {
        if (filterType === 'INFLUENCER' && item.category !== 'CREATOR') return false;
        if (filterType === 'BUSINESS' && item.category !== 'CAMPAIGN') return false;
        if (['SESSION', 'MEETUP', 'SERVICE'].includes(filterType) && item.type !== filterType) return false;
      }

      // Text Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = item.title.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [allMapItems, filterType, searchQuery]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Sidebar List */}
      <div className={`
        flex-col bg-white border-r border-slate-200 w-full md:w-[450px] lg:w-[500px] z-10 shadow-xl md:shadow-none transition-all duration-300 absolute md:relative h-full
        ${viewMode === 'map' ? 'translate-y-full md:translate-y-0 opacity-0 md:opacity-100' : 'translate-y-0 opacity-100'}
      `}>
        
        {/* List Header & Filters */}
        <div className="p-4 border-b border-slate-100 bg-white/95 backdrop-blur z-20 sticky top-0 space-y-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Good morning, Alex.</h1>
            <p className="text-sm text-slate-500">
               {filteredItems.length} opportunities active in <span className="text-primary-600 font-medium">{activeTrip?.destination.city}</span>.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search map results..."
               className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {[
               { id: 'ALL', label: 'All Activity' },
               { id: 'MEETUP', label: 'Meetups' },
               { id: 'INFLUENCER', label: 'Influencers' },
               { id: 'BUSINESS', label: 'Business Ads' },
               { id: 'SESSION', label: 'Sessions' },
             ].map(f => (
               <button
                 key={f.id}
                 onClick={() => setFilterType(f.id)}
                 className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap ${filterType === f.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
               >
                 {f.label}
               </button>
             ))}
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 md:pb-4">
          {filteredItems.length > 0 ? (
             filteredItems.map(item => {
               if (item.category === 'OFFER') {
                 return (
                  <OfferCard 
                    key={item.id} 
                    offer={item.originalData as Offer} 
                    active={activeItemId === item.id}
                    onHover={() => setActiveItemId(item.id)}
                    onLeave={() => setActiveItemId(null)}
                  />
                 );
               }
               if (item.category === 'CREATOR') {
                 // Wrapper to detect hover and make card active
                 return (
                   <div 
                     key={item.id}
                     onMouseEnter={() => setActiveItemId(item.id)}
                     onMouseLeave={() => setActiveItemId(null)}
                     className={activeItemId === item.id ? 'ring-2 ring-purple-500 rounded-2xl' : ''}
                   >
                     <CreatorCard creator={item.originalData as Creator} />
                   </div>
                 );
               }
               if (item.category === 'CAMPAIGN') {
                  return (
                   <div 
                     key={item.id}
                     onMouseEnter={() => setActiveItemId(item.id)}
                     onMouseLeave={() => setActiveItemId(null)}
                     className={activeItemId === item.id ? 'ring-2 ring-orange-500 rounded-2xl' : ''}
                   >
                     <CampaignCard campaign={item.originalData as Campaign} />
                   </div>
                 );
               }
               return null;
             })
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No results found
            </div>
          )}
          
          {filteredItems.length > 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              End of results in {activeTrip?.destination.city}
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative h-full bg-slate-100">
        <InteractiveMap 
          items={filteredItems}
          activeItemId={activeItemId}
          onItemSelect={setActiveItemId}
          cityName={activeTrip?.destination.city}
        />

        {/* Mobile Toggle Button */}
        <div className="md:hidden absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex gap-2 bg-white/90 backdrop-blur border border-slate-200 p-1 rounded-full shadow-lg">
           <button 
             onClick={() => setViewMode('list')}
             className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
           >
             <List className="w-4 h-4" /> List
           </button>
           <button 
             onClick={() => setViewMode('map')}
             className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${viewMode === 'map' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
           >
             <MapIcon className="w-4 h-4" /> Map
           </button>
        </div>
      </div>
    </div>
  );
};

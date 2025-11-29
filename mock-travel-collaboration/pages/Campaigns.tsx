
import React, { useState, useMemo } from 'react';
import { MOCK_CAMPAIGNS } from '../constants';
import { CampaignCard } from '../components/Cards/CampaignCard';
import { Briefcase, Search, Filter, X, Calendar } from 'lucide-react';

export const Campaigns: React.FC = () => {
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [followerFilter, setFollowerFilter] = useState('ALL'); // 'ALL' | number string
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredCampaigns = useMemo(() => {
    return MOCK_CAMPAIGNS.filter(c => {
      // Search Filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = 
          c.title.toLowerCase().includes(q) || 
          c.brand.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Platform Filter
      if (platformFilter !== 'ALL' && !c.requirements.platforms.includes(platformFilter as any)) {
        return false;
      }
      
      // Follower Filter (Simulating "I have X followers")
      if (followerFilter !== 'ALL') {
        const userFollowerCount = Number(followerFilter);
        // If the campaign requires more followers than the user has, hide it.
        if (c.requirements.minFollowers > userFollowerCount) return false;
      }

      // Date Range Filter (Overlap Logic)
      if (startDate) {
        // If the campaign ends before the selected start date, it's not relevant
        if (c.dates.end < startDate) return false;
      }
      if (endDate) {
        // If the campaign starts after the selected end date, it's not relevant
        if (c.dates.start > endDate) return false;
      }
      
      return true;
    });
  }, [searchQuery, platformFilter, followerFilter, startDate, endDate]);

  const clearFilters = () => {
    setPlatformFilter('ALL');
    setFollowerFilter('ALL');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const hasActiveFilters = platformFilter !== 'ALL' || followerFilter !== 'ALL' || searchQuery !== '' || startDate !== '' || endDate !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full overflow-y-auto">
      
      {/* Header */}
      <div className="mb-8 relative">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
             <Briefcase className="w-6 h-6" />
           </div>
           <span className="font-bold text-orange-600 uppercase tracking-wider text-xs">For Business & Creators</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Brand Campaigns</h1>
        <p className="text-slate-500 max-w-2xl">
          Apply for exclusive opportunities from top travel brands. Exchange your reach for free stays, dining experiences, and paid sponsorships.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-0 bg-slate-50 z-20 py-2">
        {/* Search */}
        <div className="flex-1 relative min-w-[200px]">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search hotels, restaurants, perks..." 
             className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white shadow-sm"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
           {searchQuery && (
             <button 
               onClick={() => setSearchQuery('')}
               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
             >
               <X className="w-4 h-4" />
             </button>
           )}
        </div>
        
        {/* Dropdowns & Date Picker */}
        <div className="flex flex-wrap gap-2 items-center">
          
          {/* Date Range Inputs */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm min-w-fit">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              className="text-sm font-medium text-slate-700 bg-transparent focus:outline-none w-[110px]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start"
            />
            <span className="text-slate-300">-</span>
            <input 
              type="date" 
              className="text-sm font-medium text-slate-700 bg-transparent focus:outline-none w-[110px]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End"
            />
          </div>

          <div className="relative min-w-[160px]">
            <select 
              className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
              onChange={(e) => setPlatformFilter(e.target.value)}
              value={platformFilter}
            >
              <option value="ALL">All Platforms</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative min-w-[180px]">
            <select 
              className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
              onChange={(e) => setFollowerFilter(e.target.value)}
              value={followerFilter}
            >
              <option value="ALL">Any Follower Count</option>
              <option value="10000">I have &lt; 10k</option>
              <option value="50000">I have &lt; 50k</option>
              <option value="100000">I have &lt; 100k</option>
              <option value="1000000">I have 1M+</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))
        ) : (
          <div className="col-span-full py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4 text-slate-300">
               <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No campaigns found</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-2">
              Try adjusting your date range or filters to see more results.
            </p>
            <button 
              onClick={clearFilters}
              className="mt-6 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {/* Call to Action for Business */}
        <div className="col-span-full mt-8 p-8 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-900/10">
           <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider">Business</span>
                <h3 className="text-xl font-bold">Launch your own Campaign</h3>
              </div>
              <p className="text-slate-400 max-w-lg text-sm md:text-base">
                Connect with verified creators in {filteredCampaigns.length > 0 ? filteredCampaigns[0].location : 'your city'} to boost your brand presence.
              </p>
           </div>
           <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors whitespace-nowrap shadow-lg">
             Post Opportunity
           </button>
        </div>
      </div>
    </div>
  );
};

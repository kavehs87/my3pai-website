
import React, { useState } from 'react';
import { PROFILE, EXTERNAL_LINKS, FEATURED_ACCOMMODATION, CONSULTATION } from '../constants';
import { Mail, MessageSquare, Coffee, Sparkles, MapPin, Building2, BadgeCheck, Star, Cross, HeartPulse, GraduationCap, Leaf, Award, Home, Instagram, Youtube, Twitter, Bell } from 'lucide-react';
import { generateTripPreview } from '../services/geminiService';

export const Sidebar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [destination, setDestination] = useState('');
  const [style, setStyle] = useState('Adventure');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAiResponse('');
    const response = await generateTripPreview(destination, style);
    setAiResponse(response);
    setLoading(false);
  };

  const getCertificationIcon = (name: string) => {
    if (name.includes("Hiking")) return <GraduationCap className="w-5 h-5 text-indigo-500" />;
    if (name.includes("First Aid")) return <HeartPulse className="w-5 h-5 text-indigo-500" />;
    if (name.includes("Sustainability")) return <Leaf className="w-5 h-5 text-indigo-500" />;
    if (name.includes("Airbnb")) return <Home className="w-5 h-5 text-indigo-500" />;
    if (name.includes("TripAdvisor")) return <Award className="w-5 h-5 text-indigo-500" />;
    return <BadgeCheck className="w-5 h-5 text-indigo-500" />;
  };

  return (
    <aside className="h-full w-full flex flex-col gap-6 p-6 text-slate-800">
      
      {/* 1. Header: Image, Name, Role, Location */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img 
              src={PROFILE.image} 
              alt={PROFILE.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{PROFILE.name}</h1>
        <p className="text-sm font-semibold text-indigo-600 mb-1">{PROFILE.handle}</p>
        <p className="text-sm text-slate-600 font-medium mb-3">{PROFILE.tagline}</p>
        
        <div className="flex flex-col items-center gap-1.5 text-slate-500 text-sm mb-4">
            <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{PROFILE.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>{PROFILE.subLocation}</span>
            </div>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-3 text-slate-400">
            <a href="#" className="hover:text-pink-600 transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-red-600 transition-colors"><Youtube className="w-5 h-5" /></a>
            <a href="#" className="hover:text-blue-400 transition-colors"><Twitter className="w-5 h-5" /></a>
        </div>
      </div>

      {/* 2. Stats Card */}
      <div className="bg-slate-50/80 rounded-2xl p-4 flex justify-between items-center text-center">
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-slate-900 font-bold">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{PROFILE.stats.rating}</span>
            </div>
            <span className="text-xs text-slate-500">{PROFILE.stats.reviews} reviews</span>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex flex-col items-center">
             <span className="text-slate-900 font-bold">{PROFILE.stats.locations}</span>
             <span className="text-xs text-slate-500">locations</span>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex flex-col items-center">
             <span className="text-slate-900 font-bold">{PROFILE.stats.mapsBuilt}</span>
             <span className="text-xs text-slate-500">maps built</span>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex flex-col items-center">
             <span className="text-slate-900 font-bold">{PROFILE.stats.travelersGuided}</span>
             <span className="text-xs text-slate-500">travelers</span>
        </div>
      </div>

      {/* 1-on-1 Consultation Booking */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg shadow-slate-900/10">
        <div className="flex items-start gap-4">
             <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                <img src={CONSULTATION.image} alt="Consultation" className="w-full h-full object-cover" />
             </div>
             <div>
                <h3 className="font-bold text-lg leading-tight">1-on-1 Trip Planning</h3>
                <p className="text-slate-400 text-xs mt-1">Video call • 60 mins</p>
             </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
            <div className="text-sm font-medium">
                <span className="text-slate-400">From </span>
                <span className="text-white text-lg font-bold">${CONSULTATION.price}</span>
            </div>
            <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
                Book Now →
            </button>
        </div>
      </div>

      {/* External Platform Links */}
      <div className="grid grid-cols-2 gap-3">
        {EXTERNAL_LINKS.map(link => (
          <div key={link.id} className="bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-1.5 mb-1.5">
               {link.platform === 'Airbnb' ? (
                 <div className="w-5 h-5 rounded flex items-center justify-center border border-slate-100">
                    <span className="text-rose-500 text-xs font-bold">A</span>
                 </div>
               ) : (
                 <div className="w-5 h-5 rounded flex items-center justify-center border border-slate-100">
                    <span className="text-orange-500 text-xs font-bold">G</span>
                 </div>
               )}
               {link.rating && (
                   <div className="flex items-center gap-0.5 text-[10px] font-bold text-slate-600">
                       <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                       {link.rating}
                   </div>
               )}
            </div>
            <h4 className="font-bold text-slate-900 text-sm leading-tight">{link.title}</h4>
            <p className="text-slate-500 text-[10px] leading-tight mt-0.5">{link.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Featured Accommodation Card */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
         <div className="flex h-16">
            <div className="w-20 shrink-0">
                <img src={FEATURED_ACCOMMODATION.image} alt="Accommodation" className="w-full h-full object-cover" />
            </div>
            <div className="p-2.5 flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                     <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 rounded">Airbnb</span>
                     <div className="flex items-center text-[10px] text-slate-500">
                        <Star className="w-2.5 h-2.5 fill-slate-900 text-slate-900 mr-0.5" />
                        <span className="text-slate-900 font-bold">{FEATURED_ACCOMMODATION.rating}</span>
                        <span className="ml-0.5">({FEATURED_ACCOMMODATION.reviews})</span>
                     </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">{FEATURED_ACCOMMODATION.title}</h4>
                <p className="text-[10px] text-slate-500 truncate">{FEATURED_ACCOMMODATION.location}</p>
            </div>
         </div>
      </div>

      {/* 3. About Me */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">About me</h2>
        {PROFILE.bio.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-sm text-slate-600 leading-relaxed">{paragraph}</p>
        ))}
      </div>

      {/* 4. Skills & Languages */}
      <div className="space-y-6">
         <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">Skills and languages</h2>
            <h3 className="text-sm font-bold text-slate-700 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
                {PROFILE.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                        {skill}
                    </span>
                ))}
            </div>
         </div>

         <div>
             <h3 className="text-sm font-bold text-slate-700 mb-3">Languages</h3>
             <div className="space-y-3">
                 {PROFILE.languages.map((lang, index) => (
                     <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-base">{lang.flag}</span>
                            <span className="text-slate-700 font-medium">{lang.name}</span>
                        </div>
                        <span className="text-slate-500 text-xs">{lang.level}</span>
                     </div>
                 ))}
             </div>
         </div>
      </div>

      {/* 5. Certifications */}
      <div className="space-y-4">
         <h2 className="text-lg font-bold text-slate-900">Certifications and badges</h2>
         <div className="grid grid-cols-2 gap-3">
             {PROFILE.certifications.map((cert, index) => (
                 <div key={index} className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-indigo-600">
                         {getCertificationIcon(cert)}
                     </div>
                     <span className="text-xs font-bold text-slate-700 leading-tight">
                         {cert}
                     </span>
                 </div>
             ))}
         </div>
      </div>

      {/* Bottom Buttons - Attached to content above (removed extra padding) */}
      <div className="space-y-3">
        <button className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2">
           <Bell className="w-4 h-4" />
           Subscribe to my content
        </button>

        <button className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2">
           <MessageSquare className="w-4 h-4" />
           Message this creator
        </button>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          Request custom trip
        </button>

        <button className="w-full py-3 px-4 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2">
           <Coffee className="w-4 h-4" />
           Send tip
        </button>
      </div>

      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Plan Your Adventure</h2>
            <p className="text-sm text-slate-500 mb-6">Use my AI assistant to preview what a trip curated by me looks like.</p>
            
            {!aiResponse ? (
              <form onSubmit={handleRequestTrip} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                  <input 
                    type="text" 
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="e.g., Patagonia, Kyoto, Tuscany"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Travel Style</label>
                  <select 
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
                  >
                    <option>Adventure</option>
                    <option>Luxury</option>
                    <option>Budget</option>
                    <option>Foodie</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Preview
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="animate-fade-in">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 mb-6 whitespace-pre-wrap">
                  {aiResponse}
                </div>
                <button 
                  onClick={() => {setAiResponse(''); setIsModalOpen(false);}}
                  className="w-full py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50"
                >
                  Close & Book Call
                </button>
              </div>
            )}
            
            {!aiResponse && (
              <button 
                onClick={() => setIsModalOpen(false)}
                className="mt-4 w-full text-center text-sm text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

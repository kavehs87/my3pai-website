
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_OFFERS } from '../constants';
import { ArrowLeft, Star, Shield, Clock, MapPin, Camera } from 'lucide-react';

export const BookingDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const offer = MOCK_OFFERS.find(o => o.id === id);

  if (!offer) return <div className="p-8">Offer not found</div>;

  const imageUrl = offer.imageUrl || `https://picsum.photos/seed/${offer.id}/1200/800`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 h-full overflow-y-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to map
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Gallery */}
          <div className="aspect-video w-full bg-slate-200 rounded-2xl overflow-hidden relative shadow-sm">
            <img src={imageUrl} className="w-full h-full object-cover" alt="Detail" />
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
              <Camera className="w-3 h-3" /> 5 photos
            </div>
          </div>

          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold uppercase rounded-full tracking-wider">{offer.type}</span>
              <div className="flex items-center text-yellow-500 text-sm font-medium">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1">{offer.user.stats?.rating}</span>
                <span className="text-slate-400 ml-1">({offer.user.stats?.reviewCount} reviews)</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{offer.title}</h1>
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="w-4 h-4" />
              <span>Shibuya City, Tokyo</span>
            </div>
          </div>

          {/* Creator Profile */}
          <div className="flex items-center gap-4 p-6 border border-slate-100 rounded-2xl bg-white shadow-sm">
            <img src={offer.user.avatarUrl} className="w-16 h-16 rounded-full object-cover" alt="Creator" />
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                {offer.user.name} 
                {offer.user.isVerified && <Shield className="w-4 h-4 text-green-500 fill-current" />}
              </h3>
              <p className="text-sm text-slate-500">Joined 2021 • Response time: 1hr</p>
            </div>
            <button className="ml-auto px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              View Profile
            </button>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">About this session</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{offer.description}</p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          {/* Gear */}
          {offer.gearIncluded && offer.gearIncluded.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Gear included</h3>
              <div className="flex flex-wrap gap-2">
                {offer.gearIncluded.map(gear => (
                  <span key={gear} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg font-medium">{gear}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col - Sticky Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-3xl font-bold text-slate-900">${offer.price.amount}</span>
                <span className="text-slate-500 text-sm font-medium">/{offer.price.unit}</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-primary-500 transition-colors">
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Date</div>
                <div className="font-medium text-slate-900">Oct 14, 2023</div>
              </div>
              <div className="border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-primary-500 transition-colors">
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Time</div>
                <div className="font-medium text-slate-900">10:00 AM - 11:00 AM</div>
              </div>
            </div>

            <button className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 mb-4">
              Request to Book
            </button>

            <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> Secure payment via Escrow
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};


import React, { useState, useMemo } from 'react';
import { MapItem } from '../../types';
import { Plus, Minus, Download, Check, Loader2, WifiOff, Briefcase, Crown, Layers, Users, Camera } from 'lucide-react';

interface InteractiveMapProps {
  activeItemId: string | null;
  onItemSelect: (id: string) => void;
  items: MapItem[];
  cityName?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ activeItemId, onItemSelect, items, cityName = "Current Area" }) => {
  const [zoom, setZoom] = useState(1);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Local state for map layer visibility - Granular control
  const [visibleCategories, setVisibleCategories] = useState({
    CREATOR: true,
    CAMPAIGN: true,
    MEETUP: true,
    SESSION: true
  });
  
  // Base projection constants
  const BASE_LAT = 35.6580;
  const BASE_LNG = 139.7016;
  const BASE_ZOOM_SCALE = 800;

  // Helper to calculate position percentage
  const getRawPosition = (lat: number, lng: number, scale: number) => {
    const y = 50 - (lat - BASE_LAT) * scale;
    const x = 50 + (lng - BASE_LNG) * scale;
    return { x, y };
  };

  // Filtering items based on visibility layers before clustering
  const visibleItems = useMemo(() => {
    return items.filter(item => {
      if (item.category === 'CREATOR') return visibleCategories.CREATOR;
      if (item.category === 'CAMPAIGN') return visibleCategories.CAMPAIGN;
      if (item.category === 'OFFER') {
        if (item.type === 'MEETUP') return visibleCategories.MEETUP;
        return visibleCategories.SESSION; // Covers SESSION and SERVICE
      }
      return true;
    });
  }, [items, visibleCategories]);

  // Clustering Logic
  const clusters = useMemo(() => {
    const currentScale = BASE_ZOOM_SCALE * zoom;
    
    const projectedItems = visibleItems.map(item => {
      const { x, y } = getRawPosition(item.coords[0], item.coords[1], currentScale);
      return { ...item, x, y };
    });

    const result: (typeof projectedItems)[] = [];
    const processed = new Set<string>();

    projectedItems.forEach(current => {
      if (processed.has(current.id)) return;

      const cluster = [current];
      processed.add(current.id);

      projectedItems.forEach(candidate => {
        if (processed.has(candidate.id)) return;

        const dist = Math.sqrt(
          Math.pow(current.x - candidate.x, 2) + 
          Math.pow(current.y - candidate.y, 2)
        );

        if (dist < 8) {
          cluster.push(candidate);
          processed.add(candidate.id);
        }
      });

      result.push(cluster);
    });

    return result;
  }, [visibleItems, zoom]);

  const handleZoom = (delta: number) => {
    setZoom(prev => {
      const next = prev + delta;
      return Math.max(0.5, Math.min(3, next));
    });
  };

  const handleDownloadMap = () => {
    if (isOfflineReady) return;
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setIsOfflineReady(true);
    }, 2500);
  };

  const toggleCategory = (category: keyof typeof visibleCategories) => {
    setVisibleCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Helper to determine marker styling based on type with DISTINCT ICONS
  const getMarkerStyle = (type: string, category: string) => {
    switch (category) {
      case 'CAMPAIGN':
        return {
          borderColor: 'border-orange-500',
          bgColor: 'bg-orange-500',
          ringColor: 'ring-orange-500/20',
          badgeColor: 'bg-orange-500',
          icon: <Briefcase className="w-3 h-3 text-white" />
        };
      case 'CREATOR':
        return {
          borderColor: 'border-purple-500',
          bgColor: 'bg-purple-500',
          ringColor: 'ring-purple-500/20',
          badgeColor: 'bg-purple-500',
          icon: <Crown className="w-3 h-3 text-white" />
        };
      case 'OFFER':
        if (type === 'MEETUP') {
          return {
            borderColor: 'border-white',
            bgColor: 'bg-accent-500', // Green/Teal for Meetups
            ringColor: 'ring-accent-500/20',
            badgeColor: 'bg-accent-500',
            icon: <Users className="w-3 h-3 text-white" />
          };
        } else {
          // SESSIONS / SERVICES
          return {
            borderColor: 'border-primary-500',
            bgColor: 'bg-primary-500', // Blue for Sessions
            ringColor: 'ring-primary-500/20',
            badgeColor: 'bg-primary-500',
            icon: <Camera className="w-3 h-3 text-white" />
          };
        }
      default:
        return {
          borderColor: 'border-slate-500',
          bgColor: 'bg-slate-500',
          ringColor: 'ring-slate-500/20',
          badgeColor: 'bg-slate-500',
          icon: null
        };
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 group select-none">
      {/* Map Background Placeholder */}
      <div 
        className="absolute inset-0 w-full h-full transition-transform duration-700 ease-out"
        style={{ transform: `scale(${1 + (zoom - 1) * 0.2})` }}
      >
        <img 
          src="https://api.mapbox.com/styles/v1/mapbox/light-v10/static/139.7016,35.6580,13,0/1200x800?access_token=placeholder" 
          alt="Map Background"
          className={`w-full h-full object-cover transition-opacity duration-500 ${isOfflineReady ? 'opacity-100 grayscale-[20%]' : 'opacity-80'}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/1200/800?grayscale&blur=2';
          }}
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-50/20 pointer-events-none" />

      {/* Radar Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
         <div className="w-64 h-64 bg-primary-500/5 rounded-full animate-pulse border border-primary-500/20" style={{ transform: `scale(${zoom})` }}></div>
         <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-primary-600 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-lg z-0"></div>
      </div>

      {/* Offline Status */}
      {isOfflineReady && (
        <div className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur border border-green-200 shadow-sm px-3 py-1.5 rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <WifiOff className="w-3.5 h-3.5 text-green-600" />
          <span className="text-xs font-semibold text-green-700">Offline Ready</span>
        </div>
      )}

      {/* Map Layers Filter Control */}
      <div className="absolute top-4 left-4 z-30">
        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg shadow-md transition-all flex items-center gap-2 font-medium text-sm
              ${showFilters ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}
            `}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Map Layers</span>
          </button>

          {showFilters && (
            <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 origin-top-left">
              <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 mb-1">Filter Visibility</div>
              
              <button 
                onClick={() => toggleCategory('CREATOR')}
                className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${visibleCategories.CREATOR ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <Crown className="w-3 h-3" />
                  </div>
                  Influencers
                </div>
                {visibleCategories.CREATOR && <Check className="w-3.5 h-3.5 text-purple-600" />}
              </button>

              <button 
                onClick={() => toggleCategory('CAMPAIGN')}
                className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${visibleCategories.CAMPAIGN ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <Briefcase className="w-3 h-3" />
                  </div>
                  Business
                </div>
                {visibleCategories.CAMPAIGN && <Check className="w-3.5 h-3.5 text-orange-600" />}
              </button>

              <div className="h-px bg-slate-100 my-1"></div>

              <button 
                onClick={() => toggleCategory('MEETUP')}
                className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${visibleCategories.MEETUP ? 'bg-accent-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <Users className="w-3 h-3" />
                  </div>
                  Meetups
                </div>
                {visibleCategories.MEETUP && <Check className="w-3.5 h-3.5 text-accent-600" />}
              </button>

              <button 
                onClick={() => toggleCategory('SESSION')}
                className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${visibleCategories.SESSION ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <Camera className="w-3 h-3" />
                  </div>
                  Sessions
                </div>
                {visibleCategories.SESSION && <Check className="w-3.5 h-3.5 text-primary-600" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Zoom & Download Controls */}
      <div className="absolute bottom-24 md:bottom-8 right-4 md:right-8 flex flex-col gap-2 z-30">
        <button 
          onClick={handleDownloadMap}
          disabled={isDownloading || isOfflineReady}
          className={`p-2 rounded-lg shadow-lg transition-all flex items-center justify-center relative group
            ${isOfflineReady 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
        >
           {isDownloading ? (
             <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
           ) : isOfflineReady ? (
             <Check className="w-5 h-5" />
           ) : (
             <Download className="w-5 h-5" />
           )}
           <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
             {isOfflineReady ? `${cityName} downloaded` : isDownloading ? `Downloading ${cityName}...` : `Download ${cityName}`}
           </div>
        </button>

        <div className="h-px bg-slate-200/50 my-1 mx-2"></div>

        <button onClick={() => handleZoom(0.5)} className="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 text-slate-700">
          <Plus className="w-5 h-5" />
        </button>
        <button onClick={() => handleZoom(-0.5)} className="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 text-slate-700">
          <Minus className="w-5 h-5" />
        </button>
      </div>

      {/* Render Clusters/Markers */}
      {clusters.map((cluster, index) => {
        const avgX = cluster.reduce((sum, p) => sum + p.x, 0) / cluster.length;
        const avgY = cluster.reduce((sum, p) => sum + p.y, 0) / cluster.length;
        
        const style = { top: `${avgY}%`, left: `${avgX}%` };

        if (cluster.length === 1) {
          const item = cluster[0];
          const isActive = activeItemId === item.id;
          const styles = getMarkerStyle(item.type, item.category);

          return (
            <button
              key={item.id}
              onClick={() => onItemSelect(item.id)}
              style={style}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-spring ${isActive ? 'z-50 scale-125' : 'hover:scale-110 z-20'}`}
            >
              {isActive && (
                <span className={`absolute inset-0 -m-2 rounded-full opacity-40 animate-ping ${styles.bgColor}`}></span>
              )}
              {isActive && (
                <span className={`absolute inset-0 -m-1 rounded-full opacity-20 animate-pulse ${styles.bgColor}`}></span>
              )}

              <div className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 bg-white rounded-lg shadow-xl text-[11px] font-bold text-slate-800 transition-all transform origin-bottom ${isActive ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'}`}>
                {item.priceDisplay ? item.priceDisplay : item.title}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white"></div>
              </div>

              <div className={`relative w-10 h-10 rounded-full border-2 overflow-hidden shadow-lg transition-colors bg-white ${isActive ? `${styles.borderColor} ring-4 ${styles.ringColor}` : 'border-white'}`}>
                  {item.category === 'CAMPAIGN' ? (
                     <div className="w-full h-full bg-slate-50 flex items-center justify-center p-1">
                        <img src={item.avatarUrl} alt="" className="w-full h-full object-contain rounded-md" />
                     </div>
                  ) : (
                     <img src={item.avatarUrl} alt="" className="w-full h-full object-cover" />
                  )}
                  
                  <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${styles.badgeColor}`}>
                    {styles.icon}
                  </div>
              </div>

              <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0.5 bg-slate-800/40 rounded-full ${isActive ? 'h-4' : 'h-2'}`}></div>
            </button>
          );
        }

        return (
          <button
            key={`cluster-${index}`}
            onClick={() => handleZoom(0.5)}
            style={style}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 transition-transform hover:scale-110 active:scale-95"
          >
             <div className="relative">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-lg border-4 border-white shadow-xl">
                   {cluster.length}
                </div>
                <div className="absolute -inset-1 border border-slate-800/20 rounded-full -z-10"></div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-primary-500 flex items-center justify-center text-[8px] font-bold text-white">+</div>
             </div>
          </button>
        );
      })}
    </div>
  );
};

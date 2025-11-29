
import React from 'react';
import { Map, Grid, Plus, User, Bell, Search, ChevronDown, Menu, Users, Briefcase, Crown } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { Link, useLocation } from 'react-router-dom';
import { MOCK_TRIPS, MOCK_USER } from '../../constants';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { activeTrip, setActiveTrip } = useTrip();
  const location = useLocation();

  const navItems = [
    { icon: Map, label: 'Discover', path: '/' },
    { icon: Grid, label: 'Sessions', path: '/sessions' },
    { icon: Users, label: 'Meetups', path: '/meetups' },
    { icon: Crown, label: 'Influencers', path: '/influencers' },
    { icon: Briefcase, label: 'Campaigns', path: '/campaigns' },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'creator': return 'bg-purple-100 text-purple-700';
      case 'business': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Trip Selector */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30">
                3P
              </div>
              <span className="hidden md:block font-bold text-slate-800 tracking-tight">My3P</span>
            </Link>

            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-700">
                <span className="text-lg">📍</span> 
                {activeTrip ? (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{activeTrip.destination.city}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getRoleBadgeColor(activeTrip.userRole)}`}>
                      {activeTrip.userRole}
                    </span>
                    <span className="text-slate-500 hidden sm:inline text-xs">• Oct 12-15</span>
                  </div>
                ) : (
                  <span>Select a trip</span>
                )}
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              
              {/* Dropdown (Simplified) */}
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                <div className="text-xs font-semibold text-slate-400 uppercase px-3 py-2">My Trips</div>
                {MOCK_TRIPS.map(trip => (
                  <button 
                    key={trip.id}
                    onClick={() => setActiveTrip(trip.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${activeTrip?.id === trip.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-50'}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{trip.destination.city}</div>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${getRoleBadgeColor(trip.userRole)}`}>
                          {trip.userRole}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">{trip.dates.start}</div>
                    </div>
                    {activeTrip?.id === trip.id && <div className="w-2 h-2 rounded-full bg-primary-500"></div>}
                  </button>
                ))}
                <div className="border-t border-slate-100 my-1"></div>
                <Link to="/trips/new" className="w-full text-left px-3 py-2 rounded-lg text-sm text-primary-600 hover:bg-primary-50 flex items-center gap-2 font-medium">
                  <Plus className="w-4 h-4" /> Create new trip
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.label}
                  to={item.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-200 cursor-pointer">
              <img src={MOCK_USER.avatarUrl} alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 safe-area-bottom">
        {navItems.slice(0, 5).map((item) => { // Limit for mobile space
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.label} 
              to={item.path}
              className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary-600' : 'text-slate-400'}`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

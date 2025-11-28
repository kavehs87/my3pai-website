

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ItinerarySection } from './components/ItinerarySection';
import { MasterclassSection } from './components/MasterclassSection';
import { CountryMapSection } from './components/CountryMapSection';
import { PodcastSection } from './components/PodcastSection';
import { BlogSection } from './components/BlogSection';
import { MediaSection } from './components/MediaSection';
import { SocialFeedSection } from './components/SocialFeedSection';
import { Menu, X, ShoppingBasket } from 'lucide-react';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('itineraries');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = () => {
    setCartCount(prev => prev + 1);
  };

  const navItems = [
    { id: 'itineraries', label: 'Itineraries' },
    { id: 'training', label: 'Training' },
    { id: 'countries', label: 'Map' },
    { id: 'podcast', label: 'Podcast' },
    { id: 'blog', label: 'Travel Blog' },
    { id: 'media', label: 'Assets' },
    { id: 'socials', label: 'Socials' },
  ];

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      setIsMobileMenuOpen(false);
    }
  };

  // Intersection observer to update active nav state on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-xl text-slate-900">WanderLuxe</span>
        <div className="flex items-center gap-4">
             <button className="relative p-2 text-slate-900">
                <ShoppingBasket className="w-6 h-6" />
                {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {cartCount}
                    </span>
                )}
             </button>
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
               {isMobileMenuOpen ? <X /> : <Menu />}
             </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-white pt-20 px-6">
          <div className="flex flex-col gap-6 text-2xl font-semibold text-slate-800">
             <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 text-base uppercase tracking-widest border-b border-slate-100 pb-4">Profile</a>
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => scrollToSection(item.id)}
                className="text-left hover:text-blue-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-4 lg:p-8 pt-24 lg:pt-8">
        
        {/* Left Column: Fixed Profile Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
           <div className="lg:sticky lg:top-8 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
             <Sidebar />
           </div>
        </div>

        {/* Right Column: Scrollable Content */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-16 pb-20">
          
          {/* Desktop Navigation (Floating) */}
          <div className="hidden lg:block sticky top-8 z-30 flex justify-between items-center">
            <nav className="bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-slate-200/60 p-2 inline-flex gap-1 overflow-x-auto max-w-[70vw]">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeSection === item.id 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop Cart */}
            <button className="bg-white hover:bg-slate-50 text-slate-900 p-3 rounded-full shadow-md border border-slate-200 relative transition-all active:scale-95 flex items-center gap-2 group ml-4 shrink-0">
                <ShoppingBasket className="w-5 h-5" />
                <span className="font-bold text-sm">Basket</span>
                {cartCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 h-5 rounded-full flex items-center justify-center min-w-[1.25rem]">
                        {cartCount}
                    </span>
                )}
             </button>
          </div>

          {/* Content Sections */}
          <ItinerarySection onAddToCart={handleAddToCart} />
          <MasterclassSection onAddToCart={handleAddToCart} />
          <CountryMapSection onAddToCart={handleAddToCart} />
          <PodcastSection />
          <BlogSection />
          <MediaSection onAddToCart={handleAddToCart} />
          <SocialFeedSection />

          {/* Footer simple */}
          <footer className="pt-12 border-t border-slate-200 text-center text-slate-400 text-sm">
            <p>© 2024 WanderLuxe Profile. All rights reserved.</p>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default App;
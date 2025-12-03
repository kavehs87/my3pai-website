

import React, { useState, useEffect, useContext } from 'react';
import { 
  Map, 
  Video, 
  Mic, 
  ShoppingCart, 
  Menu, 
  X, 
  Star, 
  Globe, 
  Users, 
  CheckCircle2, 
  Play, 
  Lock, 
  Download,
  ArrowRight,
  ArrowLeft,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Pause,
  Calendar as CalendarIcon,
  Clock,
  Check,
  Trash2,
  CreditCard,
  ShieldCheck,
  ChevronDown,
  Package,
  Sparkles,
  Tag,
  Clock3,
  Unlock,
  Filter,
  FileText,
  AlertCircle,
  ShoppingBag,
  Headphones,
  Share2
} from 'lucide-react';
import { CREATOR, COURSES, DESTINATIONS, PODCASTS, BLOG_POSTS, ASSETS, SOCIALS, CALENDAR_DAYS, TIME_SLOTS, CURRENCIES } from './constants';
import { Creator, Course, Destination, Podcast, BlogPost, DigitalAsset, CalendarDay, TimeSlot, CartItem, Currency } from './types';

// --- Context & Hooks ---

const CurrencyContext = React.createContext<{
  currency: Currency;
  setCurrency: (c: Currency) => void;
}>({
  currency: CURRENCIES[0],
  setCurrency: () => {}
});

const useCurrency = () => useContext(CurrencyContext);

const PriceDisplay = ({ amount, className }: { amount: number, className?: string }) => {
  const { currency } = useCurrency();
  const value = amount * currency.rate;
  
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.code === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency.code === 'JPY' ? 0 : 2,
  }).format(value);

  return <span className={className}>{formatted}</span>;
};

const CurrencySelector = ({ isFooter = false, isScrolled = false }: { isFooter?: boolean, isScrolled?: boolean }) => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors rounded-lg px-2 py-1 ${
          isFooter 
            ? 'text-slate-400 hover:text-white bg-white/5 border border-white/10' 
            : isScrolled
              ? 'text-white hover:bg-white/10'
              : 'text-primary hover:bg-black/5'
        }`}
      >
        <span>{currency.symbol} {currency.code}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={`absolute z-50 w-24 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-1 ${isFooter ? 'bottom-full mb-2' : 'top-full mt-2 right-0'}`}>
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors flex justify-between ${currency.code === c.code ? 'text-secondary font-bold' : 'text-primary'}`}
              >
                <span>{c.code}</span>
                <span>{c.symbol}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- Shared Components ---

const Navigation = ({ cartCount, onMenuClick, onNavigate, onCartClick, currentView }: { cartCount: number, onMenuClick: () => void, onNavigate: (v: string) => void, onCartClick: () => void, currentView: string }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = currentView === 'home';
  const isNavScrolled = scrolled || !isHome;

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    
    // If we are not on home, go home first
    if (!isHome) {
      onNavigate('home');
      // Wait for render then scroll
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      // Just scroll if already on home
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isNavScrolled ? 'bg-primary/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('home')}
        >
           <div className="w-10 h-10 bg-gradient-to-br from-secondary to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-secondary/20">
             M
           </div>
           <span className={`font-bold text-xl tracking-tight ${isNavScrolled ? 'text-white' : 'text-primary'}`}>
             my<span className="text-secondary">3pai</span>
           </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Profile', 'Courses', 'Maps', 'Blog', 'Assets'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              onClick={(e) => handleNavClick(e, item.toLowerCase())}
              className={`text-sm font-medium hover:text-secondary transition-colors ${isNavScrolled ? 'text-slate-200' : 'text-primary'}`}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <CurrencySelector isScrolled={isNavScrolled} />
          
          <button 
            onClick={onCartClick}
            className="relative p-2 rounded-full hover:bg-white/10 transition-colors group"
          >
            <ShoppingCart className={`w-6 h-6 ${isNavScrolled ? 'text-white' : 'text-primary'} group-hover:text-secondary transition-colors`} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-primary">
                {cartCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
          >
            <Menu className={`w-6 h-6 ${isNavScrolled ? 'text-white' : 'text-primary'}`} />
          </button>
        </div>
      </div>
    </nav>
  );
};

const SectionHeader = ({ title, subtitle, icon: Icon, dark = false }: { title: string, subtitle: string, icon?: React.ElementType, dark?: boolean }) => (
  <div className="mb-12 text-center max-w-2xl mx-auto">
    {Icon && (
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${dark ? 'bg-white/10 text-secondary' : 'bg-secondary/10 text-secondary'}`}>
        <Icon className="w-6 h-6" />
      </div>
    )}
    <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${dark ? 'text-white' : 'text-primary'}`}>{title}</h2>
    <p className={`text-lg ${dark ? 'text-slate-300' : 'text-text-muted'}`}>{subtitle}</p>
    <div className={`w-24 h-1 bg-secondary mx-auto mt-6 rounded-full`}></div>
  </div>
);

// --- Component: LicensingModal ---
const LicensingModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
          
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50 rounded-t-3xl">
            <div>
               <div className="flex items-center gap-2 text-secondary font-bold text-sm uppercase tracking-wider mb-2">
                 <ShieldCheck className="w-4 h-4" />
                 Official License Agreement
               </div>
               <h2 className="text-2xl md:text-3xl font-bold text-primary">Digital Asset Licensing</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-text-muted" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            <p className="text-text-muted text-lg leading-relaxed">
              When you purchase digital assets (LUTs, Presets, Footage) from My3Pai, you are acquiring a license to use these files, not ownership of the original intellectual property.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                  <h3 className="font-bold text-emerald-800 flex items-center gap-2 mb-4">
                     <CheckCircle2 className="w-5 h-5" />
                     You Can (Allowed)
                  </h3>
                  <ul className="space-y-3 text-sm text-emerald-900">
                     <li className="flex gap-2"><Check className="w-4 h-4 flex-shrink-0 mt-0.5" /> Use in unlimited personal projects.</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 flex-shrink-0 mt-0.5" /> Use in commercial client work (YouTube, Weddings, Docs).</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 flex-shrink-0 mt-0.5" /> Use in social media content (Instagram, TikTok).</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 flex-shrink-0 mt-0.5" /> Edit, manipulate, and combine with other works.</li>
                  </ul>
               </div>

               <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                  <h3 className="font-bold text-red-800 flex items-center gap-2 mb-4">
                     <AlertCircle className="w-5 h-5" />
                     You Cannot (Prohibited)
                  </h3>
                  <ul className="space-y-3 text-sm text-red-900">
                     <li className="flex gap-2"><X className="w-4 h-4 flex-shrink-0 mt-0.5" /> Resell, share, or redistribute the files as is.</li>
                     <li className="flex gap-2"><X className="w-4 h-4 flex-shrink-0 mt-0.5" /> Upload to stock media platforms.</li>
                     <li className="flex gap-2"><X className="w-4 h-4 flex-shrink-0 mt-0.5" /> Include in a product where the asset is the primary value.</li>
                  </ul>
               </div>
            </div>

            <div>
               <h3 className="font-bold text-primary mb-3">Commercial Rights</h3>
               <p className="text-text-muted text-sm leading-relaxed">
                  This license covers usage for projects with a budget under $100,000 USD. For large-scale broadcast or theatrical releases, please contact us for an Enterprise License.
               </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end">
             <button 
               onClick={onClose}
               className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg"
             >
               I Understand
             </button>
          </div>
        </div>
      </div>
    </>
  );
};

// --- Cart Components ---

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onCheckout 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  items: CartItem[], 
  onRemove: (id: string) => void,
  onCheckout: () => void
}) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-surface">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-primary">Your Cart ({items.length})</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-light space-y-4">
               <ShoppingCart className="w-16 h-16 opacity-20" />
               <p className="text-lg font-medium">Your cart is empty</p>
               <button onClick={onClose} className="text-secondary font-semibold hover:underline">
                 Browse courses & assets
               </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-4 animate-in fade-in slide-in-from-right-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-bold text-primary leading-tight line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-text-light uppercase font-semibold mt-1">{item.type}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <PriceDisplay amount={item.price} className="font-bold text-secondary" />
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-text-muted hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-surface space-y-4">
             <div className="flex justify-between items-end">
               <span className="text-text-muted font-medium">Subtotal</span>
               <PriceDisplay amount={total} className="text-2xl font-bold text-primary" />
             </div>
             <p className="text-xs text-text-light text-center">Taxes and shipping calculated at checkout</p>
             <button 
               onClick={onCheckout}
               className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
             >
               Checkout <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        )}
      </div>
    </>
  );
};

// --- Component: CourseCard ---
const CourseCard = ({ course, onAdd }: { course: Course, onAdd: (item: CartItem) => void }) => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 group flex flex-col h-full hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-300">
    <div className="relative h-48 overflow-hidden">
      <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      {course.isPremium && (
        <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          PREMIUM
        </div>
      )}
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-secondary" />
        <span className="text-xs font-semibold text-text-light">{course.students} students enrolled</span>
      </div>
      <h3 className="text-xl font-bold text-primary mb-2 leading-tight">{course.title}</h3>
      <p className="text-text-muted text-sm mb-6 flex-1">{course.description}</p>
      
      <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
        <PriceDisplay amount={course.price} className="text-2xl font-bold text-primary" />
        <button 
          onClick={() => onAdd({
            id: course.id,
            title: course.title,
            price: course.price,
            image: course.image,
            type: 'course'
          })}
          className="bg-secondary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20 active:scale-95"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>
);

// --- Component: DestinationCard ---
const DestinationCard = ({ dest, onAdd }: { dest: Destination, onAdd: (item: CartItem) => void }) => (
  <div className="relative group rounded-3xl overflow-hidden aspect-[3/4] cursor-pointer">
    <img src={dest.image} alt={dest.country} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
    
    <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
      <span className="text-2xl mr-2">{dest.flag}</span>
      <span className="text-white font-bold tracking-wide">{dest.country}</span>
    </div>

    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
      <PriceDisplay amount={dest.price} className="text-secondary font-bold text-lg mb-1 block" />
      <p className="text-white/90 text-sm mb-4 line-clamp-2">{dest.description}</p>
      <div className="flex items-center justify-between">
         <span className="text-white/60 text-xs">{dest.poiCount} Points of Interest</span>
         <button 
           onClick={(e) => {
             e.stopPropagation();
             onAdd({
               id: dest.id,
               title: `Travel Guide: ${dest.country}`,
               price: dest.price,
               image: dest.image,
               type: 'map'
             });
           }}
           className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-secondary hover:text-white transition-colors"
           title="Add to Cart"
         >
            <ShoppingCart className="w-5 h-5" />
         </button>
      </div>
    </div>
  </div>
);

// --- Component: PodcastPlayer ---
const PodcastPlayer = ({ podcast }: { podcast: Podcast }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="relative w-16 h-16 flex-shrink-0">
        <img src={podcast.image} alt="Thumb" className="w-full h-full object-cover rounded-xl" />
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl hover:bg-black/40 transition-colors"
        >
          {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {podcast.isPremium && <Lock className="w-3 h-3 text-yellow-500" />}
          <span className="text-xs text-secondary font-semibold">{podcast.duration}</span>
          <span className="text-xs text-text-light">• {podcast.date}</span>
        </div>
        <h4 className="font-bold text-primary truncate pr-2">{podcast.title}</h4>
        
        {/* Fake Waveform */}
        <div className="flex items-center gap-0.5 mt-2 h-3">
          {[...Array(20)].map((_, i) => (
             <div 
               key={i} 
               className={`w-1 bg-secondary/40 rounded-full ${isPlaying ? 'animate-wave' : ''}`}
               style={{ 
                 height: `${Math.random() * 100}%`,
                 animationDelay: `${i * 0.05}s`,
                 animationPlayState: isPlaying ? 'running' : 'paused'
               }}
             ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Component: BlogCard ---
const BlogCard = ({ post, onClick }: { post: BlogPost, onClick: () => void }) => (
  <div className="group cursor-pointer" onClick={onClick}>
    <div className="relative h-64 rounded-2xl overflow-hidden mb-4">
       <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
       <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
         {post.category}
       </div>
    </div>
    <div className="flex items-center gap-3 mb-2 text-sm text-text-muted">
       <span>{post.date}</span>
       <span className="w-1 h-1 bg-text-light rounded-full"></span>
       <span>{post.readTime} read</span>
       {post.isPremium && <span className="text-yellow-500 font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-500" /> Premium</span>}
    </div>
    <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors line-clamp-2">{post.title}</h3>
    <p className="text-text-muted line-clamp-2">{post.preview}</p>
  </div>
);

// --- Component: AssetCard ---
const AssetCard = ({ asset, onAdd, light = false }: { asset: DigitalAsset, onAdd: (item: CartItem) => void, light?: boolean }) => (
  <div className={`${light ? 'bg-white' : 'bg-primary'} rounded-2xl p-1 shadow-lg group relative overflow-hidden transition-all hover:shadow-2xl`}>
     <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <img src={asset.image} alt={asset.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
             onClick={() => onAdd({
               id: asset.id,
               title: asset.title,
               price: asset.price,
               image: asset.image,
               type: 'asset'
             })}
             className={`px-4 py-2 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-1 ${light ? 'bg-primary text-white' : 'bg-white text-primary'}`}
           >
             Add <PriceDisplay amount={asset.price} />
           </button>
        </div>
     </div>
     <div className="px-3 pb-3">
        <div className="flex items-center justify-between mb-1">
           <span className="text-xs font-medium text-secondary uppercase tracking-widest">{asset.type}</span>
           <Download className={`w-4 h-4 ${light ? 'text-slate-400' : 'text-slate-400'}`} />
        </div>
        <h4 className={`${light ? 'text-primary' : 'text-white'} font-medium text-sm leading-snug`}>{asset.title}</h4>
     </div>
  </div>
);

// --- Component: Hero ---
const Hero = ({ creator, onBookClick }: { creator: Creator, onBookClick: () => void }) => {
  return (
    <section id="profile" className="scroll-mt-28 pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-8 items-center sm:items-start">
            {/* Portrait Video */}
            <div className="w-full sm:w-[320px] shrink-0">
               <div className="bg-white p-1 rounded-[2.5rem] shadow-xl shadow-primary/5 border border-slate-100">
                  <div className="relative aspect-[9/16] rounded-[2rem] overflow-hidden group cursor-pointer">
                     <img src="https://picsum.photos/seed/travel/340/600" alt="Intro" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                        <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform">
                           <Play className="w-6 h-6 text-primary fill-primary" />
                        </div>
                     </div>
                     <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-medium">Watch Intro</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Vertical Stats */}
            <div className="flex flex-row sm:flex-col flex-wrap gap-4 w-full">
               {[
                 { label: 'Rating', value: creator.stats.rating, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-50' },
                 { label: 'Visited', value: creator.stats.locationsVisited, icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
                 { label: 'Maps', value: creator.stats.mapsBuilt, icon: Map, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                 { label: 'Guided', value: '12k+', icon: Users, color: 'text-secondary', bg: 'bg-teal-50' },
               ].map((stat, i) => (
                 <div key={i} className="bg-white p-4 rounded-2xl shadow-md border border-slate-50 flex items-center gap-4 sm:w-full hover:-translate-y-1 transition-transform flex-1 sm:flex-none">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} flex-shrink-0`}>
                       <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="text-left min-w-0">
                       <div className="text-2xl font-bold text-primary leading-none">{stat.value}</div>
                       <div className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1 truncate">{stat.label}</div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center h-full">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 w-fit mb-6">
               <CheckCircle2 className="w-5 h-5 text-secondary" />
               <span className="text-sm font-semibold text-primary">Verified Travel Expert</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary leading-tight mb-4">
              {creator.name}
            </h1>
            <p className="text-xl text-secondary font-medium mb-6">{creator.tagline}</p>
            <p className="text-text-muted leading-relaxed mb-8 text-lg">
              {creator.bio}
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              {[Instagram, Youtube, Facebook, Linkedin].map((Icon, i) => (
                 <button key={i} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-slate-100">
                    <Icon className="w-5 h-5" />
                 </button>
              ))}
            </div>

            <button 
              onClick={onBookClick}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
            >
              Book a Consultation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

// --- VIEWS ---

const AssetsView = ({ onBack, addToCart }: { onBack: () => void, addToCart: (item: CartItem) => void }) => {
  const [filter, setFilter] = useState('All');
  const [showLicense, setShowLicense] = useState(false);
  const filters = ['All', 'LUT', 'RAW Photo', 'Drone Footage', 'Preset'];

  const filteredAssets = filter === 'All' 
    ? ASSETS 
    : ASSETS.filter(a => a.type === filter);

  return (
    <>
      <LicensingModal isOpen={showLicense} onClose={() => setShowLicense(false)} />
      <div className="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen animate-in slide-in-from-bottom-8 duration-500 bg-surface">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Profile
          </button>
          <button 
             onClick={() => setShowLicense(true)}
             className="text-sm font-medium text-secondary hover:text-primary transition-colors flex items-center gap-2"
          >
             <FileText className="w-4 h-4" /> Licensing Terms
          </button>
        </div>

        <SectionHeader 
          title="Creator Digital Assets" 
          subtitle="Professional grade tools to elevate your content creation game." 
          icon={Download}
        />

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                filter === f 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white text-text-muted hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {filteredAssets.map((asset) => (
             <AssetCard key={asset.id} asset={asset} onAdd={addToCart} light={true} />
           ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-20 text-text-muted">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No assets found in this category.</p>
            <button onClick={() => setFilter('All')} className="text-secondary font-bold mt-2 hover:underline">Clear Filters</button>
          </div>
        )}
      </div>
    </>
  );
}

const ClassesView = ({ onBack, addToCart }: { onBack: () => void, addToCart: (item: CartItem) => void }) => {
  return (
    <div className="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen animate-in slide-in-from-bottom-8 duration-500 bg-surface">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Profile
      </button>

      <SectionHeader 
        title="All Masterclasses" 
        subtitle="Comprehensive courses designed to help you master travel content creation." 
        icon={Video}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {COURSES.map(course => (
          <CourseCard key={course.id} course={course} onAdd={addToCart} />
        ))}
      </div>
    </div>
  );
};

const MapsView = ({ onBack, addToCart }: { onBack: () => void, addToCart: (item: CartItem) => void }) => {
  return (
    <div className="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen animate-in slide-in-from-bottom-8 duration-500 bg-surface">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Profile
      </button>

      <SectionHeader 
        title="All Destination Maps" 
        subtitle="Explore detailed itineraries and hidden gems from around the world." 
        icon={Map}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DESTINATIONS.map(dest => (
          <div key={dest.id} className="h-full">
            <DestinationCard dest={dest} onAdd={addToCart} />
          </div>
        ))}
      </div>
    </div>
  );
};

const BlogView = ({ onBack, onViewPost }: { onBack: () => void, onViewPost: (post: BlogPost) => void }) => {
  return (
    <div className="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen animate-in slide-in-from-bottom-8 duration-500 bg-surface">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Profile
      </button>

      <SectionHeader 
        title="Travel Journal" 
        subtitle="Stories, tips, and guides from my adventures around the globe." 
        icon={FileText}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {BLOG_POSTS.map(post => (
          <BlogCard 
            key={post.id} 
            post={post} 
            onClick={() => onViewPost(post)}
          />
        ))}
      </div>
    </div>
  );
};

const PodcastsView = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen animate-in slide-in-from-bottom-8 duration-500 bg-surface">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Profile
      </button>

      <SectionHeader 
        title="Travel Unfiltered Podcast" 
        subtitle="Weekly episodes covering solo travel safety, budgeting, and creator tips." 
        icon={Mic}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {PODCASTS.map(pod => (
          <PodcastPlayer key={pod.id} podcast={pod} />
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-12">
        <button className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.38-1.38 9.841-.721 13.441 1.5.419.3.6.84.3 1.32zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
          </div>
          Listen on Spotify
        </button>
        <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-colors">
          <Headphones className="w-5 h-5" />
          Apple Podcasts
        </button>
      </div>
    </div>
  );
};

const SocialsView = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen animate-in slide-in-from-bottom-8 duration-500 bg-surface">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Profile
      </button>

      <SectionHeader 
        title="Latest from Socials" 
        subtitle="Catch up on my latest videos, shorts, and reels." 
        icon={Share2}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {SOCIALS.map((social, index) => (
           <div key={social.id} className={`group cursor-pointer rounded-2xl overflow-hidden relative ${social.type === 'youtube' ? 'aspect-video lg:col-span-2' : 'aspect-[9/16]'}`}>
              <img src={social.thumbnail} alt={social.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>

              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                 {social.type === 'youtube' && <Youtube className="w-3 h-3" />}
                 {social.type === 'reel' && <Instagram className="w-3 h-3" />}
                 {social.type === 'short' && <ZapIcon />}
                 {social.type}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                 <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">{social.title}</h3>
                 <p className="text-white/70 text-sm">{social.views} views</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

// Helper icon for shorts
const ZapIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
)

const BlogPostView = ({ post, onBack }: { post: BlogPost, onBack: () => void }) => {
  return (
    <article className="pt-28 pb-20 animate-in slide-in-from-bottom-8 duration-500 bg-surface min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Articles
        </button>

        <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
          <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wide">
            {post.category}
          </span>
          <div className="flex items-center gap-1">
            <Clock3 className="w-4 h-4" /> {post.readTime} read
          </div>
          <span>•</span>
          <span>{post.date}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-primary leading-tight mb-8">
          {post.title}
        </h1>
      </div>

      <div className="w-full h-[300px] md:h-[500px] mb-12 relative">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/20"></div>
        {post.isPremium && (
          <div className="absolute top-8 right-8 bg-white/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
             <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
             <span className="font-bold text-primary text-sm">Premium Content</span>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="relative">
          {/* Content with specific text coloring to prevent white-on-white issues */}
          <div className="text-slate-700 rich-text">
            <div 
              className={`prose prose-lg prose-slate max-w-none
                prose-headings:text-primary prose-headings:font-bold
                prose-p:text-slate-700 prose-p:leading-relaxed
                prose-a:text-secondary prose-a:font-medium hover:prose-a:text-secondary/80
                prose-strong:text-slate-900 prose-strong:font-bold
                prose-ul:text-slate-700 prose-li:marker:text-secondary
                prose-img:rounded-2xl prose-img:shadow-lg
                ${post.isPremium ? 'mask-image-gradient pb-8' : ''}
              `}
              style={{ 
                // Fallback for mask image if tailwind plugin not configured for it
                maskImage: post.isPremium ? 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)' : 'none',
                WebkitMaskImage: post.isPremium ? 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)' : 'none'
              }}
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />
          </div>

          {/* Premium Lock Overlay */}
          {post.isPremium && (
            <div className="absolute inset-x-0 bottom-0 top-1/3 flex flex-col items-center justify-end pb-12 bg-gradient-to-t from-surface via-surface/90 to-transparent pointer-events-none">
               <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 text-center max-w-sm mx-4 pointer-events-auto transform transition-transform hover:scale-105 duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-secondary/20 rotate-3">
                     <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-3">Unlock Full Story</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed">
                    This detailed guide is part of our premium travel collection. Unlock it now to read the full itinerary and see the hidden spots.
                  </p>
                  <button className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group">
                    <Unlock className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
                    Unlock for <PriceDisplay amount={5} />
                  </button>
               </div>
            </div>
          )}
        </div>

        {post.tags && (
          <div className="mt-16 pt-8 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Related Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium hover:bg-secondary hover:text-white hover:border-secondary transition-colors cursor-pointer shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

const StoreView = ({ onBack, addToCart }: { onBack: () => void, addToCart: (item: CartItem) => void }) => {
  return (
    <div className="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen animate-in slide-in-from-bottom-8 duration-500 bg-surface">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Profile
      </button>

      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold text-primary mb-4">All Products</h1>
        <p className="text-xl text-text-muted max-w-3xl">
          Browse the complete collection of travel guides, courses, and digital assets.
        </p>
      </div>

      <div className="space-y-20">
        {/* Courses Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Video className="w-5 h-5" />
             </div>
             <h2 className="text-2xl font-bold text-primary">Masterclasses</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {COURSES.map(course => (
              <CourseCard key={course.id} course={course} onAdd={addToCart} />
            ))}
          </div>
        </section>

        {/* Maps Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Map className="w-5 h-5" />
             </div>
             <h2 className="text-2xl font-bold text-primary">Destination Maps</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DESTINATIONS.map(dest => (
              <div key={dest.id} className="h-full">
                <DestinationCard dest={dest} onAdd={addToCart} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const HomeView = ({ addToCart, onBookClick, onViewAssets, onViewClasses, onViewPost, onViewMaps, onViewBlog, onViewPodcasts, onViewSocials }: any) => {
  // Always show first 2 items on home page for courses, and first 4 for assets
  const displayedCourses = COURSES.slice(0, 2);
  const displayedAssets = ASSETS.slice(0, 4);
  const displayedMaps = DESTINATIONS.slice(0, 3);
  const displayedPosts = BLOG_POSTS.slice(0, 2);
  const displayedPodcasts = PODCASTS.slice(0, 2);
  const displayedSocials = SOCIALS.slice(0, 3);
  const [showLicense, setShowLicense] = useState(false);
  
  return (
    <div className="animate-in fade-in duration-500">
      <LicensingModal isOpen={showLicense} onClose={() => setShowLicense(false)} />
      <Hero creator={CREATOR} onBookClick={onBookClick} />

      {/* Masterclasses */}
      <section id="courses" className="scroll-mt-28 py-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Masterclasses" subtitle="Level up your creative skills with my comprehensive courses." icon={Video} />
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {displayedCourses.map(course => (
            <CourseCard key={course.id} course={course} onAdd={addToCart} />
          ))}
        </div>
        <div className="text-center">
          <button 
            onClick={onViewClasses}
            className="bg-white text-primary border border-slate-200 px-8 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            Browse All Classes
          </button>
        </div>
      </section>

      {/* Destinations */}
      <section id="maps" className="scroll-mt-28 py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Curated Maps" subtitle="Detailed itineraries with hidden spots you won't find on Google." icon={Map} />
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 md:pb-0 mb-12">
             {displayedMaps.map(dest => (
               <div key={dest.id} className="min-w-[85%] md:min-w-0 snap-center">
                 <DestinationCard dest={dest} onAdd={addToCart} />
               </div>
             ))}
          </div>
          <div className="text-center">
            <button 
              onClick={onViewMaps}
              className="bg-white text-primary border border-slate-200 px-8 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              Browse All Maps
            </button>
          </div>
        </div>
      </section>

      {/* Podcast & Socials */}
      <section id="podcast" className="scroll-mt-28 py-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
           <div>
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                 </div>
                 <h2 className="text-2xl font-bold text-primary">Travel Unfiltered Podcast</h2>
              </div>
              <div className="space-y-4 mb-8">
                 {displayedPodcasts.map(pod => (
                    <PodcastPlayer key={pod.id} podcast={pod} />
                 ))}
              </div>
              <div className="text-center md:text-left">
                <button 
                  onClick={onViewPodcasts}
                  className="text-secondary font-semibold hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  View All Episodes <ArrowRight className="w-4 h-4" />
                </button>
              </div>
           </div>

           <div>
             <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                    <Youtube className="w-5 h-5" />
                 </div>
                 <h2 className="text-2xl font-bold text-primary">Latest from Socials</h2>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="col-span-2 relative aspect-video rounded-xl overflow-hidden group cursor-pointer">
                   <img src={displayedSocials[0].thumbnail} className="w-full h-full object-cover" alt="Main" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white fill-white" />
                   </div>
                   <div className="absolute bottom-2 left-2 text-white text-sm font-medium drop-shadow-md">{displayedSocials[0].title}</div>
                </div>
                {displayedSocials.slice(1).map(social => (
                  <div key={social.id} className="relative aspect-[9/16] rounded-xl overflow-hidden group cursor-pointer">
                    <img src={social.thumbnail} className="w-full h-full object-cover" alt="Short" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                       <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-2">
                          <Play className="w-4 h-4 text-white fill-white" />
                       </div>
                       <p className="text-white text-xs font-medium line-clamp-2">{social.title}</p>
                       <p className="text-white/60 text-[10px] mt-1">{social.views} views</p>
                    </div>
                  </div>
                ))}
             </div>
             <div className="text-center md:text-left">
                <button 
                  onClick={onViewSocials}
                  className="text-secondary font-semibold hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  Browse All Videos <ArrowRight className="w-4 h-4" />
                </button>
             </div>
           </div>
        </div>
      </section>

      {/* Blog */}
      <section id="blog" className="scroll-mt-28 py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Travel Journal" subtitle="Stories, guides, and tips from the road." />
          <div className="grid md:grid-cols-2 gap-10 mb-12">
             {displayedPosts.map(post => (
               <BlogCard 
                 key={post.id} 
                 post={post} 
                 onClick={() => onViewPost(post)}
               />
             ))}
          </div>
          <div className="text-center">
            <button 
              onClick={onViewBlog}
              className="bg-white text-primary border border-slate-200 px-8 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              Browse All Articles
            </button>
          </div>
        </div>
      </section>

      {/* Assets */}
      <section id="assets" className="scroll-mt-28 py-24 bg-primary text-white">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
               <div className="max-w-xl">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Creator Assets</h2>
                  <p className="text-slate-300 text-lg">High-quality LUTs, presets, and stock footage to elevate your own content creation.</p>
               </div>
               <div className="hidden md:block">
                  <button 
                    onClick={() => setShowLicense(true)}
                    className="text-secondary hover:text-white transition-colors font-medium flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> View Licensing Terms
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
               {displayedAssets.map((asset: any) => (
                  <AssetCard key={asset.id} asset={asset} onAdd={addToCart} />
               ))}
            </div>

            <div className="mt-12 text-center">
               <button 
                 onClick={onViewAssets}
                 className="bg-white/10 text-white border border-white/20 px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary transition-all"
               >
                 View All Assets
               </button>
            </div>
         </div>
      </section>
    </div>
  );
};

const ConsultationView = ({ onBack, onBook }: { onBack: () => void, onBook: () => void }) => {
  const [selectedDate, setSelectedDate] = useState<CalendarDay | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooked, setIsBooked] = useState(false);

  // Helper to determine cell color based on status
  const getCellColor = (status: string, isSelected: boolean) => {
    if (isSelected) return 'bg-primary text-white ring-2 ring-primary ring-offset-2';
    if (status === 'full') return 'bg-slate-100 text-slate-400 cursor-not-allowed';
    if (status === 'limited') return 'bg-orange-100 text-orange-700 hover:bg-orange-200 cursor-pointer';
    return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer';
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
    setTimeout(() => {
      onBook(); // Could redirect or show success for longer
    }, 2000);
  };

  if (isBooked) {
    return (
      <div className="min-h-screen pt-28 pb-12 flex flex-col items-center justify-center container mx-auto px-4 animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-2">Booking Confirmed!</h2>
        <p className="text-text-muted text-center max-w-md mb-8">
          You're all set for your 1:1 consultation with Alex. A calendar invitation has been sent to your email.
        </p>
        <button onClick={onBack} className="bg-primary text-white px-8 py-3 rounded-xl font-bold">
          Return to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-12 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen animate-in slide-in-from-bottom-8 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Profile
      </button>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Left Column: Calendar */}
        <div className="lg:col-span-7">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">Book a 1:1 Session</h1>
          <p className="text-text-muted text-lg mb-8">
            Get personalized travel advice, itinerary reviews, or content creation coaching. Select a date to see available times.
          </p>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-primary/5 border border-slate-100">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-secondary" />
                  {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-100 rounded-full"></div> Available</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-100 rounded-full"></div> Limited</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-100 rounded-full"></div> Full</div>
                </div>
             </div>

             {/* Heatmap Grid */}
             <div className="grid grid-cols-7 gap-3 mb-2 text-center text-xs font-semibold text-text-light uppercase tracking-wider">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
             </div>
             <div className="grid grid-cols-7 gap-3">
               {/* Pad start of month if needed - simplified for mock */}
               {CALENDAR_DAYS.map((day, i) => (
                 <button
                   key={i}
                   disabled={day.status === 'full'}
                   onClick={() => setSelectedDate(day)}
                   className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative ${getCellColor(day.status, selectedDate?.date === day.date)}`}
                 >
                   <span className="text-lg font-bold">{i + 1}</span>
                   {day.status !== 'full' && (
                     <span className="text-[10px] font-medium opacity-80">{day.slotsAvailable} slots</span>
                   )}
                   {day.status === 'full' && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-px bg-slate-300 rotate-45"></div>
                     </div>
                   )}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Right Column: Time & Form */}
        <div className="lg:col-span-5">
           <div className={`bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-slate-100 h-full transition-all duration-300 ${!selectedDate ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
              {!selectedDate ? (
                 <div className="h-full flex flex-col items-center justify-center text-center text-text-light p-8">
                    <Clock className="w-12 h-12 mb-4 opacity-20" />
                    <p>Select a date from the calendar to view available time slots.</p>
                 </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                   <h3 className="text-xl font-bold text-primary mb-2">
                     {new Date(selectedDate.date).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                   </h3>
                   <div className="flex items-center gap-1 mb-6">
                      <span className="text-text-muted text-sm">30 Minute Session • </span>
                      <PriceDisplay amount={150} className="text-text-muted text-sm" />
                   </div>

                   <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-primary mb-3">Available Times</label>
                        <div className="grid grid-cols-2 gap-3">
                           {TIME_SLOTS.map(slot => (
                             <button
                               key={slot.id}
                               disabled={!slot.available}
                               onClick={() => setSelectedTime(slot.time)}
                               className={`py-2 px-4 rounded-lg text-sm font-medium border transition-all ${
                                 !slot.available 
                                   ? 'bg-slate-50 text-slate-300 border-slate-100 decoration-slate-300 line-through' 
                                   : selectedTime === slot.time
                                      ? 'bg-secondary text-white border-secondary shadow-md'
                                      : 'bg-white text-primary border-slate-200 hover:border-secondary hover:text-secondary'
                               }`}
                             >
                               {slot.time}
                             </button>
                           ))}
                        </div>
                      </div>

                      {selectedTime && (
                        <form onSubmit={handleBook} className="space-y-4 pt-6 border-t border-slate-100 animate-in fade-in">
                           <div>
                              <label className="block text-sm font-medium text-primary mb-1">Your Name</label>
                              <input type="text" required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="John Doe" />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-primary mb-1">Email Address</label>
                              <input type="email" required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="john@example.com" />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-primary mb-1">Topic (Optional)</label>
                              <textarea className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 h-24 resize-none" placeholder="What would you like to discuss?"></textarea>
                           </div>
                           <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                              Confirm Booking
                           </button>
                        </form>
                      )}
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutView = ({ cart, onBack, onComplete }: { cart: CartItem[], onBack: () => void, onComplete: () => void }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
    }, 2000);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center container mx-auto px-4">
         <h2 className="text-2xl font-bold text-primary mb-4">Your cart is empty</h2>
         <button onClick={onBack} className="text-secondary font-semibold hover:underline">
           Return to shop
         </button>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen animate-in slide-in-from-right-8 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="grid lg:grid-cols-12 gap-12">
         {/* Checkout Form */}
         <div className="lg:col-span-7">
           <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">Checkout</h1>
           
           <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                 <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
                    Contact Information
                 </h3>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-primary mb-1">First Name</label>
                       <input required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50" />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-primary mb-1">Last Name</label>
                       <input required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50" />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-primary mb-1">Email Address</label>
                       <input type="email" required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50" />
                    </div>
                 </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                 <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">2</div>
                    Payment Details
                 </h3>
                 
                 <div className="space-y-4">
                    <div>
                       <label className="block text-sm font-medium text-primary mb-1">Card Number</label>
                       <div className="relative">
                          <input required placeholder="0000 0000 0000 0000" className="w-full px-4 py-2 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50" />
                          <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-sm font-medium text-primary mb-1">Expiry Date</label>
                          <input required placeholder="MM/YY" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-primary mb-1">CVC</label>
                          <input required placeholder="123" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50" />
                       </div>
                    </div>
                 </div>

                 <div className="mt-6 flex items-center gap-2 text-sm text-text-muted bg-slate-50 p-3 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Payments are secure and encrypted.
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                   <>Processing...</>
                ) : (
                   <div className="flex items-center gap-1">Place Order <PriceDisplay amount={total} /></div>
                )}
              </button>
           </form>
         </div>

         {/* Order Summary */}
         <div className="lg:col-span-5">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100 sticky top-28">
               <h3 className="text-xl font-bold text-primary mb-6">Order Summary</h3>
               <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item, i) => (
                     <div key={i} className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                           <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                           <h4 className="font-bold text-primary text-sm line-clamp-2">{item.title}</h4>
                           <p className="text-xs text-text-light uppercase mt-1">{item.type}</p>
                           <PriceDisplay amount={item.price} className="font-semibold text-secondary text-sm mt-1 block" />
                        </div>
                     </div>
                  ))}
               </div>
               
               <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-text-muted">
                     <span>Subtotal</span>
                     <PriceDisplay amount={total} />
                  </div>
                  <div className="flex justify-between text-text-muted">
                     <span>Taxes</span>
                     <span>Calculated next</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-primary pt-2">
                     <span>Total</span>
                     <PriceDisplay amount={total} />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const SuccessView = ({ onHome }: { onHome: () => void }) => (
  <div className="min-h-screen pt-28 pb-12 flex flex-col items-center justify-center container mx-auto px-4 animate-in fade-in zoom-in">
    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-emerald-200 shadow-lg">
      <Check className="w-12 h-12" />
    </div>
    <h2 className="text-4xl font-bold text-primary mb-4 text-center">Payment Successful!</h2>
    <p className="text-text-muted text-center max-w-md mb-8 text-lg">
      Thank you for your purchase. You will receive an email confirmation shortly with access details for your digital products.
    </p>
    <button onClick={onHome} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg">
      Continue Exploring
    </button>
  </div>
);

const Footer = () => (
  <footer className="bg-primary text-white pt-16 pb-8 border-t border-white/10">
    <div className="container mx-auto px-4">
       <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="mb-6 md:mb-0 text-center md:text-left">
             <h3 className="text-2xl font-bold mb-2">Alex Walker</h3>
             <p className="text-slate-400">Exploring the world, one frame at a time.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
             <div className="flex gap-6">
               <a href="#" className="text-slate-400 hover:text-secondary transition-colors">Contact</a>
               <a href="#" className="text-slate-400 hover:text-secondary transition-colors">Terms</a>
               <a href="#" className="text-slate-400 hover:text-secondary transition-colors">Privacy</a>
             </div>
             <div className="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 w-full md:w-auto flex justify-center">
                <CurrencySelector isFooter />
             </div>
          </div>
       </div>
       <div className="text-center text-slate-600 text-sm">
          © 2024 My3Pai. All rights reserved.
       </div>
    </div>
  </footer>
);

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'consultation' | 'checkout' | 'success' | 'classes' | 'blog-post' | 'assets' | 'store' | 'maps' | 'blog' | 'podcasts' | 'socials'>('home');
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
    setIsCartOpen(true); // Open cart when item is added
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index === -1) return prev;
      const newCart = [...prev];
      newCart.splice(index, 1);
      return newCart;
    });
  };

  const handleBookSuccess = () => {
    // For the booking flow, we'll keep the user on the consultation view but show success state
    // (Handled internally in ConsultationView for now, but in a real app might redirect)
  };

  const handleCheckoutComplete = () => {
    setCart([]);
    setCurrentView('success');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeView 
            addToCart={addToCart} 
            onBookClick={() => {
              setCurrentView('consultation');
              window.scrollTo(0, 0);
            }} 
            onViewAssets={() => {
              setCurrentView('assets');
              window.scrollTo(0, 0);
            }}
            onViewClasses={() => {
              setCurrentView('classes');
              window.scrollTo(0, 0);
            }}
            onViewMaps={() => {
              setCurrentView('maps');
              window.scrollTo(0, 0);
            }}
            onViewBlog={() => {
              setCurrentView('blog');
              window.scrollTo(0, 0);
            }}
            onViewPost={(post: BlogPost) => {
              setSelectedPost(post);
              setCurrentView('blog-post');
              window.scrollTo(0, 0);
            }}
            onViewPodcasts={() => {
              setCurrentView('podcasts');
              window.scrollTo(0, 0);
            }}
            onViewSocials={() => {
              setCurrentView('socials');
              window.scrollTo(0, 0);
            }}
          />
        );
      case 'consultation':
        return (
          <ConsultationView 
            onBack={() => {
              setCurrentView('home');
              window.scrollTo(0, 0);
            }}
            onBook={handleBookSuccess}
          />
        );
      case 'classes':
        return (
          <ClassesView 
            onBack={() => {
              setCurrentView('home');
              window.scrollTo(0, 0);
            }}
            addToCart={addToCart}
          />
        );
      case 'maps':
        return (
          <MapsView 
            onBack={() => {
              setCurrentView('home');
              window.scrollTo(0, 0);
            }}
            addToCart={addToCart}
          />
        );
      case 'store':
        return (
           <StoreView
              onBack={() => {
                setCurrentView('home');
                window.scrollTo(0, 0);
              }}
              addToCart={addToCart}
           />
        );
      case 'blog':
        return (
          <BlogView 
            onBack={() => {
              setCurrentView('home');
              window.scrollTo(0, 0);
            }}
            onViewPost={(post: BlogPost) => {
              setSelectedPost(post);
              setCurrentView('blog-post');
              window.scrollTo(0, 0);
            }}
          />
        );
      case 'blog-post':
        if (!selectedPost) return null;
        return (
          <BlogPostView 
            post={selectedPost}
            onBack={() => {
              setCurrentView('blog');
              window.scrollTo(0, 0);
            }}
          />
        );
      case 'assets':
        return (
          <AssetsView 
            onBack={() => {
              setCurrentView('home');
              window.scrollTo(0, 0);
            }}
            addToCart={addToCart}
          />
        );
      case 'podcasts':
        return (
          <PodcastsView 
            onBack={() => {
              setCurrentView('home');
              window.scrollTo(0, 0);
            }}
          />
        );
      case 'socials':
        return (
          <SocialsView 
            onBack={() => {
              setCurrentView('home');
              window.scrollTo(0, 0);
            }}
          />
        );
      case 'checkout':
        return (
          <CheckoutView 
            cart={cart}
            onBack={() => setCurrentView('home')}
            onComplete={handleCheckoutComplete}
          />
        );
      case 'success':
        return (
          <SuccessView onHome={() => setCurrentView('home')} />
        );
      default:
        return null;
    }
  };

  // Helper for mobile menu navigation
  const handleMobileNav = (item: string) => {
    setMobileMenuOpen(false);
    
    // Logic similar to desktop but wrapped for the mobile menu context
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const element = document.getElementById(item.toLowerCase());
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(item.toLowerCase());
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      <div className="min-h-screen bg-surface font-sans selection:bg-secondary selection:text-white flex flex-col">
        <Navigation 
          cartCount={cart.length} 
          onMenuClick={() => setMobileMenuOpen(true)}
          onNavigate={(view) => setCurrentView(view as any)}
          onCartClick={() => setIsCartOpen(true)}
          currentView={currentView}
        />
        
        {/* Cart Drawer */}
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          items={cart} 
          onRemove={removeFromCart}
          onCheckout={() => {
            setIsCartOpen(false);
            setCurrentView('checkout');
            window.scrollTo(0, 0);
          }}
        />
        
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] bg-primary/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 transition-opacity animate-in fade-in">
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 text-white p-2">
              <X className="w-8 h-8" />
            </button>
            <div className="flex flex-col gap-8 text-center">
              {['Profile', 'Courses', 'Maps', 'Blog', 'Assets'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  onClick={(e) => {
                    e.preventDefault();
                    handleMobileNav(item);
                  }}
                  className="text-2xl font-bold text-white hover:text-secondary"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}

        <main className="flex-1">
          {renderContent()}
        </main>

        {currentView !== 'checkout' && currentView !== 'success' && <Footer />}
      </div>
    </CurrencyContext.Provider>
  );
}
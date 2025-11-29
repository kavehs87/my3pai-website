
import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Offer } from '../../types';
import { X, Check, MapPin, Coffee, Camera, Music, Tent, Beer, PartyPopper, RotateCcw } from 'lucide-react';

interface SwipeDeckProps {
  offers: Offer[];
  onClose?: () => void;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({ offers, onClose }) => {
  const [cards, setCards] = useState(offers);
  const [history, setHistory] = useState<Offer[]>([]);
  const [matched, setMatched] = useState<Offer | null>(null);

  const activeCard = cards[cards.length - 1];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!activeCard) return;

    if (direction === 'right') {
      // Simulate a random match for the demo
      if (Math.random() > 0.5) {
        setMatched(activeCard);
      }
    }

    setHistory([...history, activeCard]);
    setCards(cards.slice(0, -1));
  };

  const resetDeck = () => {
    setCards(offers);
    setHistory([]);
    setMatched(null);
  };

  return (
    <div className="w-full h-full flex items-center justify-center py-4">
      <div className="w-full max-w-sm h-[600px] relative flex flex-col">
        
        {/* Card Stack Area */}
        <div className="flex-1 relative mb-6">
          <AnimatePresence>
            {cards.length > 0 ? (
              cards.map((offer, index) => (
                <Card 
                  key={offer.id} 
                  offer={offer} 
                  active={index === cards.length - 1} 
                  onSwipe={handleSwipe}
                />
              ))
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Tent className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">You've seen everyone!</h3>
                <p className="text-slate-500 mb-6">That's all the travelers in your area for now.</p>
                <button onClick={resetDeck} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800">
                  <RotateCcw className="w-4 h-4" /> Start Over
                </button>
              </div>
            )}
          </AnimatePresence>

          {matched && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-indigo-600/95 rounded-3xl text-white p-8 animate-in zoom-in duration-300 shadow-2xl">
              <div className="text-6xl mb-4">🙌</div>
              <h2 className="text-4xl font-extrabold mb-2 text-center italic transform -rotate-2">IT'S A VIBE!</h2>
              <p className="text-center mb-8 text-indigo-100">You and {matched.user.name} are both interested in hanging out.</p>
              
              <div className="flex items-center gap-4 mb-8">
                 <img src={matched.user.avatarUrl} className="w-16 h-16 rounded-full border-4 border-white object-cover" alt="" />
                 <div className="w-16 h-16 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-slate-900 font-bold overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Me" />
                 </div>
              </div>

              <div className="w-full space-y-3">
                <button className="w-full py-4 bg-white text-indigo-700 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg">
                  Send Message
                </button>
                <button onClick={() => setMatched(null)} className="w-full py-4 bg-transparent border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/10">
                  Keep Swiping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls (Only show if cards exist) */}
        {cards.length > 0 && !matched && (
          <div className="h-20 flex items-center justify-center gap-8">
            <button 
              onClick={() => handleSwipe('left')}
              className="w-14 h-14 rounded-full bg-white border border-slate-200 text-red-500 flex items-center justify-center hover:scale-110 hover:bg-red-50 hover:border-red-200 transition-all shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <button 
              onClick={() => handleSwipe('right')}
              className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:scale-110 hover:shadow-indigo-500/50 hover:shadow-xl transition-all shadow-lg"
            >
              <Check className="w-8 h-8" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface CardProps {
  offer: Offer;
  active: boolean;
  onSwipe: (dir: 'left' | 'right') => void;
}

const Card: React.FC<CardProps> = ({ offer, active, onSwipe }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  // Overlay colors based on drag
  const likeOpacity = useTransform(x, [10, 150], [0, 1]);
  const passOpacity = useTransform(x, [-10, -150], [0, 1]);

  // Use the specific image if available, else fallback
  const displayImage = offer.imageUrl || `https://picsum.photos/seed/${offer.id}/600/800`;

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  if (!active) {
    return (
      <div className="absolute inset-0 bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden pointer-events-none scale-95 opacity-50 translate-y-4">
        {/* Placeholder for background cards */}
        <div className="w-full h-full bg-slate-100"></div>
      </div>
    );
  }

  return (
    <motion.div
      style={{ x, rotate, opacity, cursor: 'grab' }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 bg-white rounded-3xl shadow-xl overflow-hidden select-none border border-slate-200"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.1, opacity: 0 }}
      transition={{ duration: 0.3 }}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Swipe Indicators */}
      <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 z-20 border-4 border-green-500 text-green-500 rounded-lg px-4 py-2 text-3xl font-bold uppercase transform -rotate-12 bg-white/20 backdrop-blur-sm">
        Let's Hang
      </motion.div>
      <motion.div style={{ opacity: passOpacity }} className="absolute top-8 right-8 z-20 border-4 border-red-500 text-red-500 rounded-lg px-4 py-2 text-3xl font-bold uppercase transform rotate-12 bg-white/20 backdrop-blur-sm">
        Pass
      </motion.div>

      {/* Image */}
      <div className="h-3/5 relative">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80 z-10" />
         <img src={displayImage} className="w-full h-full object-cover" draggable="false" alt="" />
         
         <div className="absolute bottom-0 left-0 p-5 z-20 text-white w-full">
            <div className="flex items-center gap-2 mb-2">
               <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {offer.type === 'MEETUP' ? <Beer className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                  {offer.type === 'MEETUP' ? 'Hangout' : 'Activity'}
               </span>
               {offer.price.amount === 0 && (
                   <span className="px-3 py-1 bg-green-500/80 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                       Free
                   </span>
               )}
            </div>
            <h2 className="text-2xl font-bold leading-tight drop-shadow-md">{offer.title}</h2>
         </div>
      </div>

      {/* Content Body */}
      <div className="h-2/5 p-5 flex flex-col justify-between bg-white relative z-20">
         <div>
            <div className="flex justify-between items-start mb-3">
               <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                     {offer.user.name} 
                     <span className="text-slate-400 font-normal text-sm">24 • Tokyo</span>
                  </h3>
                  <div className="text-sm text-slate-500 flex items-center gap-1">
                     <MapPin className="w-3.5 h-3.5" /> 0.5km away
                  </div>
               </div>
               <img src={offer.user.avatarUrl} className="w-12 h-12 rounded-full border-2 border-slate-100 object-cover" alt="" />
            </div>
            
            <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
               {offer.description}
            </p>
         </div>

         {/* Tags */}
         <div className="flex flex-wrap gap-2 mt-auto">
            {['Photography', 'Coffee', 'Exploring'].map((tag, i) => (
               <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                  #{tag}
               </span>
            ))}
         </div>
      </div>
    </motion.div>
  );
};

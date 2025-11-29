import React, { useState } from 'react';
import { ChevronRight, Calendar, MapPin, Target, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const steps = [
  { id: 1, title: 'Where', icon: MapPin },
  { id: 2, title: 'When', icon: Calendar },
  { id: 3, title: 'Why', icon: Target },
];

export const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    city: '',
    startDate: '',
    endDate: '',
    intents: [] as string[]
  });

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(c => c + 1);
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Progress Header */}
        <div className="bg-slate-900 p-6 text-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">New Trip</h2>
            <button onClick={() => navigate('/')} className="text-slate-400 text-sm hover:text-white">Cancel</button>
          </div>
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700 -z-0"></div>
            {steps.map((step) => {
              const isActive = step.id === currentStep;
              const isPast = step.id < currentStep;
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isActive ? 'bg-primary-500 text-white scale-110 ring-4 ring-primary-500/20' : isPast ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    {isPast ? <CheckCircle className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`text-xs ${isActive ? 'text-white' : 'text-slate-500'}`}>{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 min-h-[300px] flex flex-col">
          
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Where are you going?</h3>
              <p className="text-slate-500 mb-6">Search for a city or airport.</p>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="e.g. Kyoto, Japan" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-lg"
                  autoFocus
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  value={formData.city}
                />
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500 cursor-pointer hover:bg-slate-200">Paris</span>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500 cursor-pointer hover:bg-slate-200">London</span>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500 cursor-pointer hover:bg-slate-200">New York</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">When is the trip?</h3>
              <p className="text-slate-500 mb-6">Dates help us show you who's around.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Start</label>
                        <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">End</label>
                        <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1" />
                    </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">What's your goal?</h3>
              <p className="text-slate-500 mb-6">We'll customize your feed based on this.</p>
              
              <div className="grid grid-cols-1 gap-3">
                {['Social & Fun', 'Content Creation', 'Professional Networking', 'Remote Work'].map(intent => (
                   <label key={intent} className="flex items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all">
                      <input type="checkbox" className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                      <span className="ml-3 font-medium text-slate-700">{intent}</span>
                   </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-8 flex justify-end">
            <button 
              onClick={handleNext}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
            >
              {currentStep === 3 ? 'Create Trip' : 'Continue'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

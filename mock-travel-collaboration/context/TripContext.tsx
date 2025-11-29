import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trip, TripContextState, UserRole } from '../types';
import { MOCK_TRIPS } from '../constants';

const TripContext = createContext<TripContextState | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTripId, setActiveTripId] = useState<string | null>('t1');
  const [userMode, setUserMode] = useState<UserRole>('traveler');
  const [intentFilter, setIntentFilter] = useState<'all' | 'social' | 'work'>('all');

  const activeTrip = MOCK_TRIPS.find(t => t.id === activeTripId);

  return (
    <TripContext.Provider value={{
      activeTripId,
      activeTrip,
      userMode,
      intentFilter,
      setActiveTrip: setActiveTripId,
      setUserMode,
      setIntentFilter
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};

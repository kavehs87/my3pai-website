
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import { Shell } from './components/Layout/Shell';
import { Discover } from './pages/Discover';
import { Sessions } from './pages/Sessions';
import { Meetups } from './pages/MeetInfluencers';
import { Campaigns } from './pages/Campaigns';
import { Influencers } from './pages/Influencers';
import { CreateTrip } from './pages/CreateTrip';
import { BookingDetail } from './pages/BookingDetail';

export default function App() {
  return (
    <TripProvider>
      <HashRouter>
        <Routes>
          {/* Routes wrapped in Shell layout */}
          <Route path="/" element={<Shell><Discover /></Shell>} />
          <Route path="/sessions" element={<Shell><Sessions /></Shell>} />
          <Route path="/meetups" element={<Shell><Meetups /></Shell>} />
          <Route path="/influencers" element={<Shell><Influencers /></Shell>} />
          <Route path="/campaigns" element={<Shell><Campaigns /></Shell>} />
          <Route path="/offer/:id" element={<Shell><BookingDetail /></Shell>} />
          
          {/* Standalone pages */}
          <Route path="/trips/new" element={<CreateTrip />} />
        </Routes>
      </HashRouter>
    </TripProvider>
  );
}

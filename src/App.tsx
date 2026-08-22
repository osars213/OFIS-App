import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { SpaceList } from './components/SpaceList';
import { SpaceDetails } from './components/SpaceDetails';
import { ExploreMapView } from './components/ExploreMapView';
import { UserBookingsView } from './components/UserBookingsView';
import { HostDashboard } from './components/HostDashboard';
import { OfisNavigationDrawer } from './components/OfisNavigationDrawer';
import { OfisAuthModal } from './components/OfisAuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { DigitalPassModal } from './components/DigitalPassModal';
import { ListSpaceModal } from './components/ListSpaceModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { SettingsModal } from './components/SettingsModal';
import { BookingDetailsModal } from './components/BookingDetailsModal';
import { ContactHostModal } from './components/ContactHostModal';
import { DirectionsModal } from './components/DirectionsModal';
import { WriteReviewModal } from './components/WriteReviewModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import ofisWordmark from './assets/ofis-wordmark.png';

const MainLayout: React.FC = () => {
  const { currentView, toastMessage, setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F2F2F2] flex flex-col selection:bg-[#00C878] selection:text-[#0D0D0D]">
      {/* Top Navbar */}
      <Navbar />

      {/* Dynamic Views */}
      <div className="flex-1">
        {currentView === 'explore' && <SpaceList />}
        {currentView === 'details' && <SpaceDetails />}
        {currentView === 'map' && <ExploreMapView />}
        {currentView === 'bookings' && <UserBookingsView />}
        {currentView === 'host' && <HostDashboard />}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1E2522] bg-[#0A0D0B] py-12 px-4 sm:px-6 lg:px-8 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <img src={ofisWordmark} alt="OFIS" className="h-8 w-auto object-contain mx-auto sm:mx-0" />
            <p className="text-xs text-[#718079] max-w-sm">
              Nigeria's verified workspace marketplace for high-performance teams, creators, and professionals.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#9EABA3]">
            <button onClick={() => setCurrentView('explore')} className="hover:text-[#00C878] transition-colors">Spaces</button>
            <button onClick={() => setCurrentView('map')} className="hover:text-[#00C878] transition-colors">Map</button>
            <button onClick={() => setCurrentView('bookings')} className="hover:text-[#00C878] transition-colors">Access Passes</button>
            <button onClick={() => setCurrentView('host')} className="hover:text-[#00C878] transition-colors">Host Portal</button>
            <span className="text-[#35433C]">|</span>
            <span className="text-[11px] text-[#718079]">© {new Date().getFullYear()} OFIS Nigeria</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Modals & Overlays */}
      <OfisNavigationDrawer />
      <OfisAuthModal />
      <CheckoutModal />
      <DigitalPassModal />
      <BookingDetailsModal />
      <ContactHostModal />
      <DirectionsModal />
      <WriteReviewModal />
      <ListSpaceModal />
      <AiAssistantModal />
      <SettingsModal />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#141816] text-[#F2F2F2] border border-[#00C878]/50 shadow-2xl text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <div className="w-2 h-2 rounded-full bg-[#00C878] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;

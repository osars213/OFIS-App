import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SpaceList } from './components/SpaceList';
import { SpaceDetails } from './components/SpaceDetails';
import { ExploreMapView } from './components/ExploreMapView';
import { UserBookingsView } from './components/UserBookingsView';
import { HostDashboard } from './components/HostDashboard';
import { OfisNavigationDrawer } from './components/OfisNavigationDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { DigitalPassModal } from './components/DigitalPassModal';
import { BookingDetailsModal } from './components/BookingDetailsModal';
import { ListSpaceModal } from './components/ListSpaceModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { OfisAuthModal } from './components/OfisAuthModal';
import { SettingsModal } from './components/SettingsModal';
import { DirectionsModal } from './components/DirectionsModal';
import { ContactHostModal } from './components/ContactHostModal';
import { WriteReviewModal } from './components/WriteReviewModal';
import { EditSpaceModal } from './components/EditSpaceModal';
import { HostPayoutModal } from './components/HostPayoutModal';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { AdminVerificationModal } from './components/AdminVerificationModal';
import { EmailVerificationModal } from './components/EmailVerificationModal';
import { InfoModal } from './components/InfoModal';
import { CompareFloatingBar } from './components/compare/CompareFloatingBar';
import { WorkspaceCompareModal } from './components/compare/WorkspaceCompareModal';
import { AppSplashScreen } from './components/AppSplashScreen';
export const App: React.FC = () => {
  const { 
    currentView, 
    currentUser, 
    isInfoModalOpen, 
    setIsInfoModalOpen, 
    infoModalTab, 
    setIsListSpaceModalOpen,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#FFF9F4] dark:bg-[#07383D] text-[#12383B] dark:text-[#FFFFFF] flex flex-col font-sans selection:bg-[#14BEB8] selection:text-white transition-colors duration-150">
      {/* Top Navbar */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1">
        {currentUser.role === 'host' ? (
          <HostDashboard />
        ) : (
          <>
            {currentView === 'explore' && <SpaceList />}
            {currentView === 'saved' && <SpaceList />}
            {currentView === 'details' && <SpaceDetails />}
            {currentView === 'map' && <ExploreMapView />}
            {currentView === 'bookings' && <UserBookingsView />}
            {currentView === 'host_dashboard' && <HostDashboard />}
          </>
        )}
      </main>

      {/* Comparison Floating Bar */}
      {currentUser.role !== 'host' && <CompareFloatingBar />}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Navigation & Global Modals (Accessible from both Landing and Marketplace) */}
      <OfisNavigationDrawer />
      <InfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
        initialTab={infoModalTab}
        onBecomeHost={() => setIsListSpaceModalOpen(true)}
      />
      <WorkspaceCompareModal />
      <CheckoutModal />
      <DigitalPassModal />
      <BookingDetailsModal />
      <ListSpaceModal />
      <EditSpaceModal />
      <HostPayoutModal />
      <DiagnosticsModal />
      <AdminVerificationModal />
      <EmailVerificationModal />
      <AiAssistantModal />
      <OfisAuthModal />
      <SettingsModal />
      <DirectionsModal />
      <ContactHostModal />
      <WriteReviewModal />

      {/* App Load-Up Splash Screen with Minimal Teal Accent */}
      <AppSplashScreen />
    </div>
  );
};

export default App;

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
import { InstallAppModal } from './components/InstallAppModal';
import { EditSpaceModal } from './components/EditSpaceModal';
import { HostPayoutModal } from './components/HostPayoutModal';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { AdminVerificationModal } from './components/AdminVerificationModal';
import { EmailVerificationModal } from './components/EmailVerificationModal';
import { InfoModal } from './components/InfoModal';
import { CompareFloatingBar } from './components/compare/CompareFloatingBar';
import { WorkspaceCompareModal } from './components/compare/WorkspaceCompareModal';
import { AppSplashScreen } from './components/AppSplashScreen';
import { MobileDeviceSimulator } from './components/MobileDeviceSimulator';

export const App: React.FC = () => {
  const { 
    currentView, 
    currentUser, 
    isInfoModalOpen, 
    setIsInfoModalOpen, 
    infoModalTab, 
    setIsListSpaceModalOpen,
    setActiveDigitalPassBooking,
    setIsDigitalPassOpen,
    addNotification,
    isInstallAppModalOpen,
    setIsInstallAppModalOpen,
  } = useApp();

  // Check for returning payment redirect (?payment=success&reference=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const isPaymentSuccess = params.get('payment') === 'success';
    const reference = params.get('reference');

    if (isPaymentSuccess && reference) {
      // Clean query string
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('payment');
      cleanUrl.searchParams.delete('reference');
      cleanUrl.searchParams.delete('bookingId');
      cleanUrl.searchParams.delete('app');
      window.history.replaceState({}, '', cleanUrl.toString());

      // Verify with backend
      fetch(`/api/payments/verify/${reference}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.booking) {
            setActiveDigitalPassBooking(data.booking);
            setIsDigitalPassOpen(true);
            addNotification({
              title: 'Payment Confirmed',
              message: `Your booking at ${data.booking.space_title || data.booking.spaceTitle || 'OFIS'} is confirmed. Your digital pass is active!`,
              type: 'payment',
              read: false,
            });
          }
        })
        .catch(err => console.warn('[App] Payment verification notice:', err));
    }
  }, [setActiveDigitalPassBooking, setIsDigitalPassOpen, addNotification]);

  const [isMobileSimulator, setIsMobileSimulator] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') || params.get('mode') || params.get('device');
    const isMobileRequested = viewParam === 'mobile' || params.get('mobile') === '1' || params.get('mobile') === 'true';
    const isEmbed = params.get('mobile_embed') === '1';
    return isMobileRequested && !isEmbed && window.innerWidth >= 768;
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') || params.get('mode') || params.get('device');
      const isMobileRequested = viewParam === 'mobile' || params.get('mobile') === '1' || params.get('mobile') === 'true';
      const isEmbed = params.get('mobile_embed') === '1';
      setIsMobileSimulator(isMobileRequested && !isEmbed && window.innerWidth >= 768);
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const handleExitMobileSimulator = () => {
    setIsMobileSimulator(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('mode');
      url.searchParams.delete('device');
      url.searchParams.delete('mobile');
      window.history.pushState({}, '', url.toString());
    }
  };

  if (isMobileSimulator) {
    return <MobileDeviceSimulator onExit={handleExitMobileSimulator} />;
  }

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
      <InstallAppModal 
        isOpen={isInstallAppModalOpen} 
        onClose={() => setIsInstallAppModalOpen(false)} 
      />

      {/* App Load-Up Splash Screen with Minimal Teal Accent */}
      <AppSplashScreen />
    </div>
  );
};

export default App;

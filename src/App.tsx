/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { SpaceList } from './components/SpaceList';
import { SearchResultsView } from './components/SearchResultsView';
import { SpaceDetails } from './components/SpaceDetails';
import { UserBookingsView } from './components/UserBookingsView';
import { HostDashboard } from './components/HostDashboard';
import { AdminPlatformDashboard } from './components/AdminPlatformDashboard';
import { CheckoutModal } from './components/CheckoutModal';
import { DigitalPassModal } from './components/DigitalPassModal';
import { ListSpaceModal } from './components/ListSpaceModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { WriteReviewModal } from './components/WriteReviewModal';
import { SessionReminderModal } from './components/SessionReminderModal';
import { SessionReminderToast } from './components/SessionReminderToast';
import { OfisAuthModal } from './components/OfisAuthModal';
import { BookingSuccessModal } from './components/BookingSuccessModal';
import { AvatarCreationModal } from './components/AvatarCreationModal';
import { OfisOpeningAnimation } from './components/OfisOpeningAnimation';
import { OfisNavigationDrawer } from './components/OfisNavigationDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfisInfoModal, InfoModalSection } from './components/OfisInfoModal';
import { OfisLogo } from './components/OfisLogo';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Building2,
  CreditCard,
  Zap,
  Lock,
  ShieldCheck,
  Ticket
} from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'explore' | 'results' | 'passes' | 'host' | 'ops'>('explore');
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalSection, setInfoModalSection] = useState<InfoModalSection>('about');

  const [showIntroAnimation, setShowIntroAnimation] = useState<boolean>(() => {
    // Only run on initial launch
    const hasSeenIntro = sessionStorage.getItem('ofis_intro_seen');
    return !hasSeenIntro;
  });

  const {
    selectedSpace,
    setSelectedSpace,
    toast,
    reminderBooking,
    isReminderModalOpen,
    setIsReminderModalOpen,
    isReminderToastVisible,
    dismissSessionReminder,
    snoozeSessionReminder,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    isAvatarModalOpen,
    setIsAvatarModalOpen,
    isPassModalOpen,
    setIsPassModalOpen,
    isBookingSuccessModalOpen,
    setIsBookingSuccessModalOpen,
    latestSuccessBooking,
    setActivePassBooking,
    setIsListSpaceModalOpen,
  } = useApp();

  const handleCompleteIntro = useCallback(() => {
    try {
      sessionStorage.setItem('ofis_intro_seen', 'true');
    } catch {
      // ignore storage quota / sandbox restrictions
    }
    setShowIntroAnimation(false);
  }, []);

  const handleOpenInfoSection = (section: InfoModalSection) => {
    setInfoModalSection(section);
    setIsInfoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F2F2F2] flex flex-col font-sans selection:bg-[#00C878] selection:text-[#0D0D0D]">
      {/* Startup Cinematic Animation (runs once on initial launch) */}
      {showIntroAnimation && (
        <OfisOpeningAnimation
          onComplete={handleCompleteIntro}
          onSkip={handleCompleteIntro}
        />
      )}

      {/* Top Header Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNavDrawer={() => setIsNavDrawerOpen(true)}
      />

      {/* Slide-out Navigation Drawer (Hamburger Menu ☰) */}
      <OfisNavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
        onNavigate={(view) => {
          setSelectedSpace(null);
          setCurrentView(view);
        }}
        onOpenListSpace={() => setIsListSpaceModalOpen(true)}
        onOpenInfoSection={handleOpenInfoSection}
      />

      {/* Rich Informational Modals */}
      <OfisInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        initialSection={infoModalSection}
        onNavigateToExplore={() => {
          setSelectedSpace(null);
          setCurrentView('explore');
        }}
        onNavigateToListSpace={() => setIsListSpaceModalOpen(true)}
        onNavigateToHostHub={() => {
          setSelectedSpace(null);
          setCurrentView('host');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'explore' && (
          <>
            {selectedSpace ? (
              <SpaceDetails
                space={selectedSpace}
                onBack={() => setSelectedSpace(null)}
              />
            ) : (
              <SpaceList
                onSelectSpace={(space) => setSelectedSpace(space)}
                onNavigateToResults={() => setCurrentView('results')}
              />
            )}
          </>
        )}

        {currentView === 'results' && (
          <>
            {selectedSpace ? (
              <SpaceDetails
                space={selectedSpace}
                onBack={() => setSelectedSpace(null)}
              />
            ) : (
              <SearchResultsView
                onSelectSpace={(space) => setSelectedSpace(space)}
                onBackToHome={() => setCurrentView('explore')}
              />
            )}
          </>
        )}

        {currentView === 'passes' && <UserBookingsView />}
        {currentView === 'host' && <HostDashboard />}
        {currentView === 'ops' && <AdminPlatformDashboard />}
      </main>

      {/* Premium Footer */}
      <footer className="bg-[#0A0A0A] text-[#9A9A9A] text-xs border-t border-[#222222] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <OfisLogo size="sm" showTagline={true} />
          </div>

          {/* Features badge */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#9A9A9A]">
            <span className="flex items-center gap-1.5 text-[#F2F2F2]">
              <Zap className="w-3.5 h-3.5 text-[#00C878]" /> Hourly & Daily Space Bookings
            </span>
            <span className="flex items-center gap-1.5 text-[#F2F2F2]">
              <CreditCard className="w-3.5 h-3.5 text-[#D6A83A]" /> Paystack, Flutterwave & Bank Transfer
            </span>
            <span className="flex items-center gap-1.5 text-[#F2F2F2]">
              <Lock className="w-3.5 h-3.5 text-[#00C878]" /> Instant Digital Pass & Keyless Entry
            </span>
          </div>

          <div className="text-[11px] text-[#9A9A9A] font-medium text-center md:text-right">
            Lagos • Abuja • Port Harcourt • Ibadan • Benin City • Enugu
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <CheckoutModal />
      <DigitalPassModal />
      <ListSpaceModal />
      <AiAssistantModal />
      <WriteReviewModal />
      <SessionReminderModal
        isOpen={isReminderModalOpen}
        onClose={dismissSessionReminder}
        booking={reminderBooking}
        onSnooze={snoozeSessionReminder}
      />

      {/* Mobile Bottom Navigation (Hotels.ng Simplicity) */}
      <MobileBottomNav
        currentView={currentView}
        setCurrentView={(view) => {
          setSelectedSpace(null);
          setCurrentView(view);
        }}
        onOpenNavDrawer={() => setIsNavDrawerOpen(true)}
      />

      {/* OFIS Sign In & Sign Up Modal with Guided Choice Landing */}
      <OfisAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onCompletedHostSignup={() => {
          setIsListSpaceModalOpen(true);
        }}
        onCompletedClientSignup={() => {
          setSelectedSpace(null);
          setCurrentView('explore');
        }}
      />

      {/* OFIS Profile Avatar Customizer Modal */}
      <AvatarCreationModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />

      {/* OFIS Cinematic Booking Success Modal */}
      <BookingSuccessModal
        isOpen={isBookingSuccessModalOpen}
        booking={latestSuccessBooking}
        onViewPass={() => {
          setIsBookingSuccessModalOpen(false);
          if (latestSuccessBooking) {
            setActivePassBooking(latestSuccessBooking);
            setIsPassModalOpen(true);
          }
        }}
        onClose={() => setIsBookingSuccessModalOpen(false)}
      />

      {/* 1-Hour Session Reminder Floating Toast */}
      {isReminderToastVisible && reminderBooking && !isReminderModalOpen && (
        <SessionReminderToast
          booking={reminderBooking}
          onOpenModal={() => setIsReminderModalOpen(true)}
          onDismiss={dismissSessionReminder}
          onSnooze={snoozeSessionReminder}
        />
      )}

      {/* Global Notification Toast */}
      {toast && (
        <div
          id="global-toast-notification"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#171717] text-white shadow-2xl border border-[#282828] flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 text-xs font-semibold max-w-md"
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#00C878] shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#D6A83A] shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-[#00C878] shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Zap, 
  Wifi, 
  Star, 
  Heart, 
  ShieldCheck, 
  ChevronRight, 
  Clock, 
  Users,
  Compass,
  Building2,
  Presentation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { SpaceCategory } from '../types';
import { SpaceTypeSlider } from './SpaceTypeSlider';
import { SmartSearchDrawer } from './SmartSearchDrawer';
import { RecommendedSection } from './RecommendedSection';
import { ContinueBrowsingSection } from './ContinueBrowsingSection';
import { BookAgainSection } from './BookAgainSection';
import { WorkspaceCard } from './WorkspaceCard';

const PIDGIN_GREETINGS = [
  'Twale my great boss🙌🏼',
  'Special hailings my Oga',
  'I throway Salute Boss',
  'I dey with you 100% Boss'
];

interface GreetingLocale {
  code: 'en' | 'yo' | 'ig' | 'ha' | 'pcm';
  langName: string;
  getGreeting: (hour: number, randomPidgin?: string) => string;
  formatName: (rawFirstName: string) => string;
}

const GREETING_LOCALES: GreetingLocale[] = [
  {
    code: 'en',
    langName: 'English',
    getGreeting: (hour) => {
      if (hour >= 4 && hour < 12) return 'Good Morning';
      if (hour >= 12 && hour < 17) return 'Good Afternoon';
      return 'Good Evening';
    },
    formatName: (name) => name || 'Tunde',
  },
  {
    code: 'yo',
    langName: 'Yorùbá',
    getGreeting: (hour) => {
      if (hour >= 4 && hour < 12) return 'Ẹ kú àárọ̀';
      if (hour >= 12 && hour < 17) return 'Ẹ kú ọ̀sán';
      return 'Ẹ kú ìrọ̀lẹ́';
    },
    formatName: (name) => {
      if (/tunde/i.test(name)) return 'Túndé';
      if (/babatunde/i.test(name)) return 'Bábátúndé';
      if (/adeyemi/i.test(name)) return 'Adéyẹmí';
      if (/funke/i.test(name)) return 'Fúnkẹ́';
      if (/babajide/i.test(name)) return 'Bàbájídé';
      if (/guest|explorer/i.test(name)) return 'Olùwòye';
      return name || 'Túndé';
    }
  },
  {
    code: 'ig',
    langName: 'Igbo',
    getGreeting: (hour) => {
      if (hour >= 4 && hour < 12) return 'Ụtụtụ ọma';
      if (hour >= 12 && hour < 17) return 'Ehihie ọma';
      return 'Mgbede ọma';
    },
    formatName: (name) => {
      if (/chidi/i.test(name)) return 'Chìdí';
      if (/emeka/i.test(name)) return 'Èméká';
      if (/guest|explorer/i.test(name)) return 'Onye nchọpụta';
      return name || 'Tunde';
    }
  },
  {
    code: 'ha',
    langName: 'Hausa',
    getGreeting: (hour) => {
      if (hour >= 4 && hour < 12) return 'Ina kwana';
      if (hour >= 12 && hour < 17) return 'Barka da rana';
      return 'Barka da yamma';
    },
    formatName: (name) => {
      if (/amina/i.test(name)) return 'Amīna';
      if (/guest|explorer/i.test(name)) return 'Mai bincike';
      return name || 'Tunde';
    }
  },
  {
    code: 'pcm',
    langName: 'Pidgin',
    getGreeting: (_hour, randomPidgin) => {
      return randomPidgin || 'Twale my great boss🙌🏼';
    },
    formatName: (name) => name || 'Tunde',
  }
];

const getCategoryBadge = (cat: SpaceCategory): string => {
  switch (cat) {
    case 'coworking':
    case 'private_office':
      return 'WORK';
    case 'photography':
      return 'CREATE';
    case 'meeting':
      return 'MEET';
    case 'podcast':
      return 'RECORD';
    case 'event':
      return 'MEET';
    default:
      return 'SPACE';
  }
};

export const SpaceList: React.FC = () => {
  const {
    currentUser,
    spaces,
    allSpaces,
    isLoadingSpaces,
    spacesError,
    refreshSpaces,
    filters,
    resetFilters,
    setSelectedSpaceId,
    currentView,
    setCurrentView,
    savedSpaceIds,
    toggleSaveSpace,
    setCheckoutSpace,
    setIsCheckoutOpen,
    currency,
    formatPrice,
  } = useApp();

  const isSavedView = currentView === 'saved';
  const displayedSpaces = isSavedView 
    ? allSpaces.filter(s => savedSpaceIds.includes(s.id))
    : spaces;

  // Language cycle: switches every 5 seconds, alternating with English
  const [cycleStep, setCycleStep] = useState(0);
  const [randomPidginIndex, setRandomPidginIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCycleStep((prev) => {
        const next = prev + 1;
        setRandomPidginIndex(Math.floor(Math.random() * PIDGIN_GREETINGS.length));
        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const indigenousLocales = GREETING_LOCALES.slice(1);
  const isEnglish = cycleStep % 2 === 0;
  const currentLocale = isEnglish 
    ? GREETING_LOCALES[0] 
    : indigenousLocales[Math.floor((cycleStep % (2 * indigenousLocales.length)) / 2) % indigenousLocales.length];

  const hour = new Date().getHours();
  const baseFirstName = currentUser && currentUser.id !== 'guest' && currentUser.id !== 'guest-user' && currentUser.name 
    ? currentUser.name.split(' ')[0] 
    : '';

  const localizedName = baseFirstName ? currentLocale.formatName(baseFirstName) : '';
  const currentPidginPhrase = PIDGIN_GREETINGS[randomPidginIndex];
  const greetingPhrase = currentLocale.getGreeting(hour, currentPidginPhrase);
  
  const greetingText = currentLocale.code === 'pcm'
    ? (localizedName ? `${greetingPhrase}, ${localizedName}` : greetingPhrase)
    : (localizedName ? `${greetingPhrase}, ${localizedName}` : `${greetingPhrase}!`);

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-24 transition-colors">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: BRANDING & REVOLVING ARC WITH GREETING & SEARCH          */}
      {/* ========================================================================= */}
      <section className="relative pt-12 sm:pt-16 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#1E2522] bg-[#0D0D0D] overflow-hidden transition-colors">
        
        {/* Architectural Revolving Arc Signature Metaphor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[540px] sm:h-[540px] md:w-[700px] md:h-[700px] pointer-events-none -z-0">
          <div className="ofis-hero-arc-outer w-[310px] h-[310px] sm:w-[500px] sm:h-[500px] md:w-[670px] md:h-[670px]" />
          <div className="ofis-hero-arc-inner w-[230px] h-[230px] sm:w-[370px] sm:h-[370px] md:w-[500px] md:h-[500px]" />
          <div className="ofis-hero-arc-conic w-[270px] h-[270px] sm:w-[440px] sm:h-[440px] md:w-[600px] md:h-[600px] opacity-15" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-80 sm:h-80 bg-[#00C878]/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6 sm:space-y-7">
          
          {/* Hero Greeting with Dynamic Language Interchange Every 10 Seconds */}
          <div className="space-y-1.5 sm:space-y-2 bg-transparent max-w-lg mx-auto">
            <div className="min-h-[24px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${currentLocale.code}-${localizedName}-${cycleStep}`}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="text-sm sm:text-base font-bold text-[#00C878] tracking-normal"
                >
                  {greetingText}
                </motion.p>
              </AnimatePresence>
            </div>
            <p className="text-lg sm:text-2xl text-[#F2F2F2] font-semibold tracking-tight">
              What workspace do you need today?
            </p>
          </div>

          {/* Primary Expandable Smart Search & Filter Drawer (Refined with Sliders) */}
          <SmartSearchDrawer />

          {/* Prominent Four Words Concept */}
          <div className="pt-1 flex items-center justify-center space-x-2 sm:space-x-4 text-xs sm:text-sm font-mono font-bold tracking-widest text-[#F2F2F2] uppercase">
            <span className="text-[#00C878]">WORK</span>
            <span className="text-[#35433C]">•</span>
            <span className="text-[#00C878]">CREATE</span>
            <span className="text-[#35433C]">•</span>
            <span className="text-[#00C878]">MEET</span>
            <span className="text-[#35433C]">•</span>
            <span className="text-[#00C878]">RECORD</span>
          </div>

          {/* Concise Trust Points */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-y-2 gap-x-4 sm:gap-x-6 text-xs text-[#718079]">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00C878]" />
              <span className="text-[#9EABA3] font-medium">Verified Spaces</span>
            </div>
            <span className="text-[#232D28] hidden sm:inline">•</span>
            <div className="flex items-center space-x-1.5">
              <Wifi className="w-3.5 h-3.5 text-[#00C878]" />
              <span className="text-[#9EABA3] font-medium">Fast Internet</span>
            </div>
            <span className="text-[#232D28] hidden sm:inline">•</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#00C878]/15 text-[#00C878] font-bold text-[10px] flex items-center justify-center leading-none">
                ₦
              </span>
              <span className="text-[#9EABA3] font-medium">Clear Pricing</span>
            </div>
            <span className="text-[#232D28] hidden sm:inline">•</span>
            <div className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-[#00C878]" />
              <span className="text-[#9EABA3] font-medium">24/7 Redundant Power</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SMART PERSONALIZED RECOMMENDATIONS & BROWSING HISTORY                  */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        {/* Recommended For You */}
        <RecommendedSection />

        {/* Continue Browsing Carousel (Hides if no history) */}
        <ContinueBrowsingSection />

        {/* Book Again Quick Re-Reservation (Hides if no previous bookings) */}
        <BookAgainSection />
      </div>

      {/* ========================================================================= */}
      {/* 3. CURATED SPACES EXPLORATION (FOUR PILLARS)                              */}
      {/* ========================================================================= */}
      <SpaceTypeSlider />

      {/* ========================================================================= */}
      {/* 4. SEARCH RESULTS & AVAILABLE SPACES GRID                                 */}
      {/* ========================================================================= */}
      <section id="spaces-results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E2522]">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F2F2F2] tracking-tight">
              {isSavedView
                ? 'Saved Workspaces'
                : filters.category !== 'all' 
                ? `${filters.category.replace('_', ' ').toUpperCase()} Spaces` 
                : filters.city !== 'All Cities' 
                ? `Workspaces in ${filters.city}` 
                : 'All Available Workspaces'}
            </h2>
            <p className="text-xs sm:text-sm text-[#718079] mt-1">
              {isSavedView
                ? `You have saved ${displayedSpaces.length} workspace${displayedSpaces.length === 1 ? '' : 's'} to your favorites`
                : `Showing ${displayedSpaces.length} vetted high-performance spaces ready for instant booking`}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {isSavedView ? (
              <button
                type="button"
                onClick={() => setCurrentView('explore')}
                className="px-4 py-2 rounded-xl bg-[#141816] hover:bg-[#1A201D] border border-[#232D28] text-xs font-semibold text-[#00C878] flex items-center space-x-2 transition-all hover:border-[#00C878]/40"
              >
                <span>Browse All Spaces</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentView('map')}
                className="px-4 py-2 rounded-xl bg-[#141816] hover:bg-[#1A201D] border border-[#232D28] text-xs font-semibold text-[#F2F2F2] flex items-center space-x-2 transition-all hover:border-[#00C878]/40"
              >
                <Compass className="w-4 h-4 text-[#00C878]" />
                <span>Around Me</span>
              </button>
            )}
          </div>
        </div>

        {/* Spaces Grid */}
        {isLoadingSpaces ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="rounded-3xl bg-[#141816] border border-[#1E2522] h-80 animate-pulse p-4 flex flex-col justify-between">
                <div className="w-full h-44 bg-[#1E2522] rounded-2xl" />
                <div className="space-y-2 pt-3">
                  <div className="w-2/3 h-4 bg-[#1E2522] rounded" />
                  <div className="w-1/2 h-3 bg-[#1E2522] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedSpaces.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#141816] border border-[#232D28] flex items-center justify-center mx-auto text-[#718079]">
              {isSavedView ? <Heart className="w-8 h-8 text-[#00C878]" /> : <Search className="w-8 h-8" />}
            </div>
            <h3 className="text-lg font-bold text-[#F2F2F2]">
              {isSavedView ? 'No saved workspaces yet' : 'No matching workspaces found'}
            </h3>
            <p className="text-xs text-[#718079] leading-relaxed">
              {isSavedView
                ? 'Tap the heart icon on any workspace card to save it for quick access later.'
                : 'Try adjusting your capacity, price range, or clearing internet/amenity filters to explore other available hubs.'}
            </p>
            <button
              type="button"
              onClick={isSavedView ? () => setCurrentView('explore') : resetFilters}
              className="px-5 py-2.5 rounded-xl bg-[#00C878] text-[#0D0D0D] text-xs font-bold hover:bg-[#00E58B] transition-all cursor-pointer"
            >
              {isSavedView ? 'Explore Workspaces' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {displayedSpaces.map((space) => (
              <WorkspaceCard
                key={space.id}
                space={space}
                layout="grid"
              />
            ))}
          </div>
        )}

      </section>

    </div>
  );
};

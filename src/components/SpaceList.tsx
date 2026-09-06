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

  const localizedName = baseFirstName ? currentLocale.formatName(baseFirstName) : 'Chief';
  const currentPidginPhrase = PIDGIN_GREETINGS[randomPidginIndex];
  const greetingPhrase = currentLocale.getGreeting(hour, currentPidginPhrase);
  
  const greetingText = currentLocale.code === 'pcm'
    ? `${greetingPhrase}, ${localizedName}`
    : `${greetingPhrase}, ${localizedName}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pb-28 transition-colors duration-150">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: BRANDING & REVOLVING ARC WITH GREETING & SEARCH          */}
      {/* ========================================================================= */}
      <section className="relative pt-9 sm:pt-12 pb-9 sm:pb-12 px-4 sm:px-6 lg:px-8 border-b border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0B1220] overflow-hidden transition-colors duration-150">
        
        {/* Decorative Circular Background Arc (Subtle Accent Only) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] md:w-[600px] md:h-[600px] pointer-events-none -z-0 opacity-20 dark:opacity-25">
          <div className="ofis-hero-arc-outer w-[290px] h-[290px] sm:w-[440px] sm:h-[440px] md:w-[560px] md:h-[560px] opacity-25" />
          <div className="ofis-hero-arc-inner w-[210px] h-[210px] sm:w-[320px] sm:h-[320px] md:w-[420px] md:h-[420px] opacity-15" />
          <div className="ofis-hero-arc-conic w-[250px] h-[250px] sm:w-[380px] sm:h-[380px] md:w-[480px] md:h-[480px] opacity-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 sm:w-60 sm:h-60 bg-[#10B981]/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
          
          {/* Hero Greeting Hierarchy: 30-34px Bold Greeting + Subtitle + Pillars */}
          <div className="space-y-2 sm:space-y-2.5 max-w-2xl mx-auto">
            <div className="flex items-center justify-center min-h-[38px] sm:min-h-[44px]">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={`${currentLocale.code}-${localizedName}-${cycleStep}`}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="text-2xl min-[400px]:text-3xl sm:text-4xl font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC]"
                >
                  {greetingText}
                </motion.h1>
              </AnimatePresence>
            </div>

            <p className="text-base sm:text-lg font-medium text-[#6B7280] dark:text-[#94A3B8]">
              What workspace do you need today?
            </p>

            {/* Secondary Navigation Pillars */}
            <div className="pt-1 text-[11px] sm:text-xs font-semibold tracking-widest text-[#94A3B8] dark:text-[#64748B] uppercase flex items-center justify-center flex-nowrap whitespace-nowrap gap-x-2 sm:gap-x-3 select-none">
              <span>WORK</span>
              <span className="text-[#10B981]">•</span>
              <span>MEET</span>
              <span className="text-[#10B981]">•</span>
              <span>CREATE</span>
              <span className="text-[#10B981]">•</span>
              <span>RECORD</span>
            </div>
          </div>

          {/* Primary Expandable Smart Search & Filter Drawer (Visual Focal Point) */}
          <SmartSearchDrawer />

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SMART PERSONALIZED RECOMMENDATIONS & BROWSING HISTORY                  */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8 sm:space-y-10">
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
      <section id="spaces-results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB] dark:border-[#1E293B]">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F8FAFC] tracking-tight">
              {isSavedView
                ? 'Saved Workspaces'
                : (filters.category && filters.category !== 'all')
                ? `${String(filters.category).replace(/_/g, ' ').toUpperCase()} Spaces` 
                : filters.city && filters.city !== 'All Cities' 
                ? `Workspaces in ${filters.city}` 
                : 'All Available Workspaces'}
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#94A3B8] mt-1">
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
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#172033] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#1E293B] text-xs font-semibold text-[#10B981] flex items-center space-x-2 transition-all hover:border-[#10B981]/50 shadow-2xs cursor-pointer"
              >
                <span>Browse All Spaces</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentView('map')}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#172033] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#1E293B] text-xs font-semibold text-[#111827] dark:text-[#F8FAFC] flex items-center space-x-2 transition-all hover:border-[#10B981]/50 shadow-2xs cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#10B981]" />
                <span>Around Me</span>
              </button>
            )}
          </div>
        </div>

        {/* Spaces Grid */}
        {isLoadingSpaces ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="rounded-[20px] bg-white dark:bg-[#172033] border border-[#E5E7EB] dark:border-[#1E293B] h-80 animate-pulse p-4 flex flex-col justify-between shadow-2xs">
                <div className="w-full h-44 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-2xl" />
                <div className="space-y-2 pt-3">
                  <div className="w-2/3 h-4 bg-[#E2E8F0] dark:bg-[#1E293B] rounded" />
                  <div className="w-1/2 h-3 bg-[#E2E8F0] dark:bg-[#1E293B] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedSpaces.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#172033] border border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-center mx-auto text-[#6B7280] dark:text-[#94A3B8] shadow-2xs">
              {isSavedView ? <Heart className="w-8 h-8 text-[#10B981]" /> : <Search className="w-8 h-8" />}
            </div>
            <h3 className="text-lg font-bold text-[#111827] dark:text-[#F8FAFC]">
              {isSavedView ? 'No saved workspaces yet' : allSpaces.length === 0 ? 'No spaces available yet' : 'No matching workspaces found'}
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] leading-relaxed">
              {isSavedView
                ? 'Tap the heart icon on any workspace card to save it for quick access later.'
                : allSpaces.length === 0
                ? 'Workspaces added to the platform will appear here.'
                : 'Try adjusting your capacity, price range, or clearing internet/amenity filters to explore other available hubs.'}
            </p>
            {allSpaces.length > 0 && (
              <button
                type="button"
                onClick={isSavedView ? () => setCurrentView('explore') : resetFilters}
                className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {isSavedView ? 'Explore Workspaces' : 'Reset Filters'}
              </button>
            )}
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

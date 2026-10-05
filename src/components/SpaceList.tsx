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
  Presentation,
  Laptop,
  Camera,
  Mic2
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
    activeCategory,
    setActiveCategory,
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
    <div className="min-h-screen bg-[#FFF9F4] dark:bg-[#07383D] pb-28 text-[#12383B] dark:text-white transition-colors duration-150">
      
      {/* ========================================================================= */}
      {/* 1. APP SEARCH & QUICK FILTERS HEADER                                      */}
      {/* ========================================================================= */}
      <section className="relative pt-4 sm:pt-6 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8 border-b border-[#E2ECEB] dark:border-[#166D74] bg-white/70 dark:bg-[#0B4A50]/70 backdrop-blur-md transition-colors duration-150">
        <div className="max-w-7xl mx-auto space-y-3">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2ECEB] dark:border-[#166D74]">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#12383B] dark:text-white tracking-tight">
              {isSavedView
                ? 'Saved Workspaces'
                : (filters.category && filters.category !== 'all')
                ? `${String(filters.category).replace(/_/g, ' ').toUpperCase()} Spaces` 
                : filters.city && filters.city !== 'All Cities' 
                ? `Workspaces in ${filters.city}` 
                : 'All Available Workspaces'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5D7A7D] dark:text-[#B8D1D0] mt-1">
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
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] text-xs font-semibold text-[#006B70] dark:text-[#28D2CB] flex items-center space-x-2 transition-all hover:border-[#14BEB8]/50 shadow-2xs cursor-pointer"
              >
                <span>Browse All Spaces</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentView('map')}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] text-xs font-semibold text-[#12383B] dark:text-white flex items-center space-x-2 transition-all hover:border-[#14BEB8]/50 shadow-2xs cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#FFA987]" />
                <span>Around Me</span>
              </button>
            )}
          </div>
        </div>

        {/* Spaces Grid */}
        {isLoadingSpaces ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="rounded-3xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] h-80 animate-pulse p-4 flex flex-col justify-between shadow-2xs">
                <div className="w-full h-44 bg-black/5 dark:bg-white/5 rounded-2xl" />
                <div className="space-y-2 pt-3">
                  <div className="w-2/3 h-4 bg-black/5 dark:bg-white/5 rounded" />
                  <div className="w-1/2 h-3 bg-black/5 dark:bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedSpaces.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] flex items-center justify-center mx-auto text-[#FFA987] shadow-2xs">
              {isSavedView ? <Heart className="w-8 h-8 text-[#FFA987]" /> : <Search className="w-8 h-8 text-[#FFA987]" />}
            </div>
            <h3 className="text-lg font-bold text-[#12383B] dark:text-white">
              {isSavedView ? 'No saved workspaces yet' : allSpaces.length === 0 ? 'No spaces available yet' : 'No matching workspaces found'}
            </h3>
            <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0] leading-relaxed">
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
                className="px-5 py-2.5 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
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

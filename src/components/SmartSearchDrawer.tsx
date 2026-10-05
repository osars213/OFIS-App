import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Zap, 
  Wifi, 
  SlidersHorizontal, 
  X, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  Check, 
  ChevronDown, 
  Users, 
  Clock, 
  Cable, 
  Timer,
  TrendingUp,
  History,
  Trash2,
  Tv,
  Presentation,
  Camera,
  Building2,
  Laptop,
  Mic2,
  Video,
  Calendar,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { POPULAR_CITIES, CATEGORY_METADATA } from '../mockData';
import { SpaceCategory, PricingPeriod } from '../types';
import { VerticalTimePicker } from './VerticalTimePicker';
import { getUniqueCitiesFromSpaces, getUniqueNeighborhoodsFromSpaces } from '../utils/location';

const NIGERIAN_POPULAR_AREAS = [
  'Lagos',
  'Lekki',
  'Victoria Island',
  'Ikeja',
  'Yaba',
  'Abuja',
  'Maitama'
];

interface SmartSearchDrawerProps {
  onApply?: () => void;
}

export const SmartSearchDrawer: React.FC<SmartSearchDrawerProps> = ({ onApply }) => {
  const {
    spaces,
    allSpaces,
    filters,
    updateFilter,
    resetFilters,
    activeCategory,
    setActiveCategory,
    formatPrice,
    formatTime,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    trendingSearches,
    executeSearchQuery,
    triggerAppAction,
  } = useApp();

  // Dynamically extract unique cities & neighborhoods from the actual spaces database
  const availableCities = React.useMemo(() => {
    const list = getUniqueCitiesFromSpaces(allSpaces && allSpaces.length > 0 ? allSpaces : spaces);
    if (list.length === 0) return POPULAR_CITIES;
    return list;
  }, [allSpaces, spaces]);

  const availableNeighborhoods = React.useMemo(() => {
    return getUniqueNeighborhoodsFromSpaces(
      allSpaces && allSpaces.length > 0 ? allSpaces : spaces,
      filters.city
    );
  }, [allSpaces, spaces, filters.city]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleLocationRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationStatus('granted');
          updateFilter('city', 'Lagos');
          updateFilter('searchQuery', 'Victoria Island');
          addRecentSearch('Victoria Island');
        },
        () => {
          setLocationStatus('denied');
          updateFilter('city', 'Lagos');
        }
      );
    } else {
      setLocationStatus('denied');
    }
  };

  const handleApply = () => {
    const trimmed = filters.searchQuery.trim();
    if (trimmed) {
      addRecentSearch(trimmed);
    }
    triggerAppAction(2000);
    setIsExpanded(false);
    inputRef.current?.blur();
    
    if (onApply) {
      onApply();
    } else {
      executeSearchQuery(filters.searchQuery, activeCategory);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApply();
  };

  // Calculate active non-default filters count
  const activeFiltersCount = [
    Boolean(filters.searchQuery.trim()),
    filters.city !== 'All Cities',
    activeCategory !== 'all',
    filters.minCapacity > 0,
    filters.maxPrice < 150000 && filters.maxPrice > 0,
    filters.needsBackupPower,
    filters.needsHighSpeedInternet,
    filters.needsFixedInternet,
    filters.needsWiredInternet,
    filters.needsSoundproofing,
    filters.needsWhiteboard,
    filters.needsProjector,
    filters.needsCameraEquipment,
    filters.instantBookingOnly,
    Boolean(filters.availableNowOnly),
    filters.startHour !== 'any',
    filters.duration !== 2,
    filters.sortBy !== 'recommended'
  ].filter(Boolean).length;

  // Format Capacity label
  const getCapacityLabel = (cap: number) => {
    if (cap === 0) return 'Any Size (1 - 200+)';
    if (cap === 1) return '1 Guest (Solo / Hot Desk)';
    if (cap >= 200) return '200+ Guests (Large Hall)';
    return `${cap} Guests`;
  };

  // Format Duration label
  const getDurationLabel = (dur: number) => {
    if (dur === 1) return '1 Hour (Quick Sprint)';
    if (dur === 4) return '4 Hours (Half Day)';
    if (dur === 8) return '8 Hours (Full Working Day)';
    if (dur === 12) return '12 Hours (Extended Access)';
    return `${dur} Hours`;
  };

  // Price configurations by period
  const getPriceBounds = (period?: PricingPeriod | 'all') => {
    switch (period) {
      case 'month':
        return { min: 25000, max: 2500000, step: 25000, defaultMax: 2500000, unit: '/mo' };
      case 'day':
        return { min: 5000, max: 400000, step: 5000, defaultMax: 400000, unit: '/day' };
      case 'session':
        return { min: 5000, max: 500000, step: 5000, defaultMax: 500000, unit: '/session' };
      case 'hour':
      case 'all':
      default:
        return { min: 2000, max: 150000, step: 1000, defaultMax: 150000, unit: '/hr' };
    }
  };

  const currentPriceBounds = getPriceBounds(filters.pricingPeriod);

  // Price label
  const getPriceLabel = (max: number, period?: PricingPeriod | 'all') => {
    const bounds = getPriceBounds(period);
    if (!max || max >= bounds.defaultMax) {
      return `Any Price (${formatPrice(bounds.min)} — ${formatPrice(bounds.defaultMax)}+${bounds.unit})`;
    }
    return `${formatPrice(bounds.min)} — ${formatPrice(max)}${bounds.unit}`;
  };

  return (
    <div 
      ref={containerRef}
      id="smart-search-container"
      className="relative max-w-2xl mx-auto w-full text-left"
    >
      {/* ========================================================================= */}
      {/* 1. PRIMARY SEARCH BAR (56-60px HEIGHT, GLASS-LIKE FINISH)                 */}
      {/* ========================================================================= */}
      <form
        onSubmit={handleSearchSubmit}
        className={`relative flex items-center h-14 sm:h-[58px] bg-white/95 dark:bg-[#0B4A50]/95 backdrop-blur-md rounded-2xl border transition-all duration-200 shadow-md dark:shadow-2xl ${
          isExpanded 
            ? 'border-[#14BEB8] ring-2 ring-[#14BEB8]/25 bg-white dark:bg-[#0B4A50]' 
            : 'border-[#E2ECEB] dark:border-[#166D74] hover:border-[#14BEB8]/50'
        }`}
      >
        <button
          type="submit"
          onClick={(e) => {
            e.stopPropagation();
            if (filters.searchQuery.trim()) {
              handleApply();
            } else {
              setIsExpanded(!isExpanded);
            }
          }}
          className="h-full px-4 sm:px-4.5 flex items-center justify-center text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-[#28D2CB] transition-colors focus:outline-none cursor-pointer"
          aria-label="Search and apply filters"
        >
          <Search className={`w-4.5 h-4.5 sm:w-5 sm:h-5 transition-colors ${isExpanded || filters.searchQuery ? 'text-[#FFA987]' : ''}`} />
        </button>

        <input
          ref={inputRef}
          id="hero-search-input"
          type="text"
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleApply();
            }
          }}
          placeholder="Search workspace, location or company..."
          className="w-full h-full bg-transparent text-xs sm:text-sm md:text-[15px] text-[#12383B] dark:text-white placeholder-[#5D7A7D] dark:placeholder-[#B8D1D0] focus:outline-none"
        />

        <div className="flex items-center gap-2 pr-3 sm:pr-4 shrink-0">
          {filters.searchQuery && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateFilter('searchQuery', '');
              }}
              className="p-1.5 rounded-lg text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] transition-colors cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Filter Toggle Button with Badge */}
          <button
            id="filter-drawer-toggle-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs ${
              isExpanded
                ? 'bg-[#14BEB8] text-white border-[#14BEB8]'
                : activeFiltersCount > 0
                ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border-[#14BEB8]/50 text-[#006B70] dark:text-[#28D2CB]'
                : 'bg-[#FFF9F4] dark:bg-[#07383D] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:border-[#14BEB8]/50'
            }`}
            aria-label="Expand search filter drawer"
            aria-expanded={isExpanded}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Filters</span>
            {activeFiltersCount > 0 && (
              <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                isExpanded ? 'bg-white text-[#006B70]' : 'bg-[#FFA987] text-[#12383B]'
              }`}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* 2. QUICK ACTIONS ROW (HORIZONTAL SCROLLABLE WITH TOUCH-OPTIMIZED BUTTONS) */}
      {/* ========================================================================= */}
      <div id="quick-actions-row" className="pt-3 sm:pt-4 overflow-x-auto no-scrollbar py-1 scroll-smooth">
        <div className="flex items-center gap-2 sm:gap-2.5 whitespace-nowrap min-w-full px-0.5">
          {[
            { id: 'office', label: 'Office', category: 'office' as SpaceCategory, icon: Building2 },
            { id: 'desk', label: 'Desk', category: 'desk' as SpaceCategory, icon: Laptop },
            { id: 'meeting_room', label: 'Meeting Room', category: 'meeting_room' as SpaceCategory, icon: Users },
            { id: 'podcast_studio', label: 'Podcast Studio', category: 'podcast_studio' as SpaceCategory, icon: Mic2 },
            { id: 'creative_studio', label: 'Creative Studio', category: 'creative_studio' as SpaceCategory, icon: Camera },
            { id: 'video_studio', label: 'Video Studio', category: 'video_studio' as SpaceCategory, icon: Video },
            { id: 'day_pass', label: 'Day Pass', action: 'day_pass', icon: Calendar },
            { id: 'nearby', label: 'Nearby', action: 'nearby', icon: Navigation },
            { id: 'recommended', label: 'Recommended', action: 'recommended', icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = item.category 
              ? activeCategory === item.category 
              : item.action === 'day_pass'
              ? filters.pricingPeriod === 'day'
              : item.action === 'nearby'
              ? filters.sortBy === 'distance'
              : item.action === 'recommended'
              ? filters.sortBy === 'recommended'
              : false;

            return (
              <button
                key={item.id}
                id={`quick-filter-${item.id}`}
                type="button"
                onClick={() => {
                  if (item.category) {
                    setActiveCategory(activeCategory === item.category ? 'all' : item.category);
                    updateFilter('category', activeCategory === item.category ? 'all' : item.category);
                  } else if (item.action === 'day_pass') {
                    updateFilter('pricingPeriod', filters.pricingPeriod === 'day' ? 'all' : 'day');
                  } else if (item.action === 'nearby') {
                    updateFilter('sortBy', 'distance');
                  } else if (item.action === 'recommended') {
                    updateFilter('sortBy', 'recommended');
                  }
                  document.getElementById('spaces-results-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`min-h-[44px] sm:min-h-[48px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-2xs select-none ${
                  isActive
                    ? 'bg-[#006B70] text-white border border-[#FFA987]/60 ring-2 ring-[#FFA987]/40 shadow-xs scale-[1.02]'
                    : 'bg-white dark:bg-[#0B4A50] text-[#12383B] dark:text-[#B8D1D0] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#FFA987]/50 hover:text-[#006B70] dark:hover:text-white active:scale-[0.98]'
                }`}
                aria-pressed={isActive}
              >
                <Icon 
                  className="w-4 h-4 shrink-0 transition-colors text-[#FFA987]" 
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RECENT / TRENDING SEARCH SUGGESTIONS (COMPACT CHIPS)                   */}
      {/* ========================================================================= */}
      {!isExpanded && (
        <div id="search-quick-suggestions" className="pt-2.5 sm:pt-3 px-1">
          {recentSearches.length > 0 ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center space-x-1 text-[11px] font-medium text-[#5D7A7D] dark:text-[#B8D1D0] shrink-0 uppercase tracking-wider">
                <History className="w-3 h-3 text-[#FFA987]" />
                <span>Recent:</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
                {recentSearches.slice(0, 5).map((query, idx) => (
                  <button
                    key={`recent-${query}-${idx}`}
                    type="button"
                    onClick={() => executeSearchQuery(query)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-[#0B4A50] hover:bg-white dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#14BEB8]/50 text-xs text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-[#28D2CB] transition-all font-medium cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {query}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearRecentSearches();
                  }}
                  className="shrink-0 text-xs text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#EF4444] px-1 hover:underline transition-colors cursor-pointer"
                  title="Clear search history"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center space-x-1 text-[11px] font-medium text-[#5D7A7D] dark:text-[#B8D1D0] shrink-0 uppercase tracking-wider">
                <TrendingUp className="w-3 h-3 text-[#FFA987]" />
                <span>Trending:</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
                {trendingSearches.map((query, idx) => (
                  <button
                    key={`trending-${query}-${idx}`}
                    type="button"
                    onClick={() => executeSearchQuery(query)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-[#0B4A50] hover:bg-white dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#14BEB8]/50 text-xs text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-[#28D2CB] transition-all font-medium cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EXPANDABLE FILTER DRAWER (CLEAN SLIDERS & REFINED CONTROLS)            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="search-filter-drawer"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.2, 0.0, 0, 1.0] }}
            className="overflow-hidden z-30 mt-2 rounded-2xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] shadow-2xl backdrop-blur-xl max-h-[80vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-5 space-y-5">
              
              {/* SECTION A: LOCATION & NEARBY */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5D7A7D] dark:text-[#B8D1D0] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FFA987]" />
                    <span>Location & City</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleLocationRequest}
                    className="text-[11px] text-[#006B70] dark:text-[#28D2CB] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>
                      {locationStatus === 'granted'
                        ? 'Near Victoria Island'
                        : locationStatus === 'denied'
                        ? 'Location Denied'
                        : 'Use Current Location'}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* City Selector */}
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FFA987] pointer-events-none" />
                    <select
                      value={filters.city}
                      onChange={(e) => {
                        updateFilter('city', e.target.value);
                        updateFilter('neighborhood', 'All');
                      }}
                      className="w-full pl-10 pr-9 py-2.5 bg-[#FFF9F4] dark:bg-[#07383D] rounded-xl text-xs sm:text-sm text-[#12383B] dark:text-white border border-[#E2ECEB] dark:border-[#166D74] focus:border-[#14BEB8] focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="All Cities">All Cities & Regions</option>
                      {availableCities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5D7A7D] dark:text-[#B8D1D0] pointer-events-none" />
                  </div>

                  {/* Neighborhood Selector */}
                  <div className="relative">
                    <select
                      value={filters.neighborhood || 'All'}
                      onChange={(e) => updateFilter('neighborhood', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FFF9F4] dark:bg-[#07383D] rounded-xl text-xs sm:text-sm text-[#12383B] dark:text-white border border-[#E2ECEB] dark:border-[#166D74] focus:border-[#14BEB8] focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="All">All Neighborhoods & Hubs</option>
                      {availableNeighborhoods.map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5D7A7D] dark:text-[#B8D1D0] pointer-events-none" />
                  </div>
                </div>

                {/* Popular Neighborhood / City Quick Chips (Derived from dynamic database) */}
                {availableNeighborhoods.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] uppercase font-mono mr-1">Areas:</span>
                    {availableNeighborhoods.slice(0, 8).map((area) => {
                      const isSelected = 
                        filters.neighborhood === area ||
                        Boolean(filters.searchQuery && filters.searchQuery.toLowerCase().includes(area.toLowerCase()));
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => {
                            if (filters.neighborhood === area) {
                              updateFilter('neighborhood', 'All');
                            } else {
                              updateFilter('neighborhood', area);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#14BEB8] text-white font-bold shadow-xs'
                              : 'bg-[#FFF9F4] dark:bg-[#07383D] text-[#12383B] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-white border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#14BEB8]/50'
                          }`}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION B: WORKSPACE CATEGORY */}
              <div className="space-y-2.5 pt-1 border-t border-[#E5E7EB] dark:border-[#374151]">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5D7A7D] dark:text-[#B8D1D0] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFA987]" />
                  <span>Workspace Type</span>
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORY_METADATA.map((cat) => {
                    const isSelected = activeCategory === cat.id;
                    const getCategoryIcon = (iconName: string) => {
                      switch (iconName) {
                        case 'Laptop': return Laptop;
                        case 'Presentation': return Presentation;
                        case 'Building2': return Building2;
                        case 'Users': return Users;
                        case 'Camera': return Camera;
                        default: return Sparkles;
                      }
                    };
                    const CatIcon = getCategoryIcon(cat.icon);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id as SpaceCategory | 'all');
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/25 border-[#14BEB8] text-[#12383B] dark:text-white'
                            : 'bg-[#FFF9F4] dark:bg-[#07383D] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-white hover:border-[#14BEB8]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <CatIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#006B70] dark:text-[#28D2CB]' : 'text-[#FFA987]'}`} />
                            <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#006B70] dark:text-[#28D2CB]' : 'text-[#12383B] dark:text-white'}`}>
                              {cat.label}
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#FFA987] shrink-0" />}
                        </div>
                        <p className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] mt-0.5 line-clamp-1">{cat.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ================================================================= */}
              {/* 1. REFINED PRICE FILTER WITH PERIOD SWITCHER                       */}
              {/* ================================================================= */}
              <div className="space-y-2.5 pt-1 border-t border-[#E2ECEB] dark:border-[#166D74]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5D7A7D] dark:text-[#B8D1D0] flex items-center gap-1.5">
                    <span className="text-[#FFA987] font-mono font-bold text-xs">₦</span>
                    <span>Budget &amp; Billing Period</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-[#006B70] dark:text-[#28D2CB] bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 px-2.5 py-0.5 rounded-md border border-[#14BEB8]/30">
                    {getPriceLabel(filters.maxPrice, filters.pricingPeriod)}
                  </span>
                </div>

                {/* Billing Period Selector Tabs */}
                <div className="flex items-center gap-1.5 bg-[#FFF9F4] dark:bg-[#07383D] p-1 rounded-xl border border-[#E2ECEB] dark:border-[#166D74]">
                  {[
                    { id: undefined, label: 'All Periods' },
                    { id: 'hour' as PricingPeriod, label: 'Hourly' },
                    { id: 'day' as PricingPeriod, label: 'Daily' },
                    { id: 'month' as PricingPeriod, label: 'Monthly' },
                    { id: 'session' as PricingPeriod, label: 'Per Session' },
                  ].map((tab) => {
                    const isSelected = filters.pricingPeriod === tab.id;
                    return (
                      <button
                        key={tab.label}
                        type="button"
                        onClick={() => {
                          const bounds = getPriceBounds(tab.id);
                          updateFilter('pricingPeriod', tab.id);
                          updateFilter('maxPrice', bounds.defaultMax);
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#14BEB8] text-white shadow-xs'
                            : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#105A60]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-1">
                  <input
                    type="range"
                    min={currentPriceBounds.min}
                    max={currentPriceBounds.max}
                    step={currentPriceBounds.step}
                    value={filters.maxPrice || currentPriceBounds.defaultMax}
                    onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
                    className="w-full h-2 bg-[#E2ECEB] dark:bg-[#07383D] rounded-lg appearance-none cursor-pointer accent-[#14BEB8] focus:outline-none"
                    aria-label="Price range slider"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] font-mono">
                    <span>{formatPrice(currentPriceBounds.min)}{currentPriceBounds.unit}</span>
                    <span>{formatPrice(Math.round((currentPriceBounds.max - currentPriceBounds.min) * 0.35 + currentPriceBounds.min))}{currentPriceBounds.unit}</span>
                    <span>{formatPrice(Math.round((currentPriceBounds.max - currentPriceBounds.min) * 0.7 + currentPriceBounds.min))}{currentPriceBounds.unit}</span>
                    <span>{formatPrice(currentPriceBounds.max)}+{currentPriceBounds.unit} (Any)</span>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* 2. REFINED CAPACITY FILTER (SLIDER ONLY — NO CHIPS)               */}
              {/* ================================================================= */}
              <div className="space-y-2.5 pt-1 border-t border-[#E2ECEB] dark:border-[#166D74]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5D7A7D] dark:text-[#B8D1D0] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#FFA987]" />
                    <span>Capacity</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-[#006B70] dark:text-[#28D2CB] bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 px-2.5 py-0.5 rounded-md border border-[#14BEB8]/30">
                    {getCapacityLabel(filters.minCapacity)}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="1"
                    value={filters.minCapacity}
                    onChange={(e) => updateFilter('minCapacity', Number(e.target.value))}
                    className="w-full h-2 bg-[#E2ECEB] dark:bg-[#07383D] rounded-lg appearance-none cursor-pointer accent-[#14BEB8] focus:outline-none"
                    aria-label="Capacity range slider"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] font-mono">
                    <span>Any (1)</span>
                    <span>10 Desks</span>
                    <span>50 Room</span>
                    <span>100 Hall</span>
                    <span>200+ Guests</span>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* 3. REFINED DURATION FILTER (SLIDER ONLY — NO CHIPS)               */}
              {/* ================================================================= */}
              <div className="space-y-2.5 pt-1 border-t border-[#E2ECEB] dark:border-[#166D74]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5D7A7D] dark:text-[#B8D1D0] flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-[#FFA987]" />
                    <span>Booking Duration</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-[#006B70] dark:text-[#28D2CB] bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 px-2.5 py-0.5 rounded-md border border-[#14BEB8]/30">
                    {getDurationLabel(filters.duration)}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={filters.duration}
                    onChange={(e) => updateFilter('duration', Number(e.target.value))}
                    className="w-full h-2 bg-[#E2ECEB] dark:bg-[#07383D] rounded-lg appearance-none cursor-pointer accent-[#14BEB8] focus:outline-none"
                    aria-label="Booking duration slider"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] font-mono">
                    <span>1 Hour</span>
                    <span>4 Hours (Half Day)</span>
                    <span>8 Hours (Full Day)</span>
                    <span>12 Hours</span>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* 4. REDESIGNED COMPACT TIME SELECTOR (OPENS VERTICAL WHEEL PICKER) */}
              {/* ================================================================= */}
              <div className="space-y-2.5 pt-1 border-t border-[#E2ECEB] dark:border-[#166D74]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5D7A7D] dark:text-[#B8D1D0] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#FFA987]" />
                    <span>Start Time</span>
                  </label>
                  <span className="text-[11px] font-mono text-[#006B70] dark:text-[#28D2CB] font-semibold">
                    {filters.startHour === 'any' ? 'Any Time' : formatTime(filters.startHour)}
                  </span>
                </div>

                {/* Compact Selector Card */}
                <button
                  id="compact-time-selector-btn"
                  type="button"
                  onClick={() => setIsTimePickerOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#FFF9F4] dark:bg-[#07383D] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#14BEB8]/50 transition-all text-left group cursor-pointer"
                  aria-label="Open time picker"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] flex items-center justify-center text-[#FFA987] group-hover:border-[#FFA987]/50 transition-colors shadow-2xs">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-[#5D7A7D] dark:text-[#B8D1D0]">Start Time</div>
                      <div className="text-sm font-mono font-bold text-[#12383B] dark:text-white group-hover:text-[#006B70] dark:group-hover:text-[#28D2CB] transition-colors">
                        {filters.startHour === 'any' ? formatTime('08:00') : formatTime(filters.startHour)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-semibold text-[#006B70] dark:text-[#28D2CB] bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 px-2.5 py-1 rounded-lg border border-[#14BEB8]/30">
                      {filters.startHour === 'any' ? 'Any Time' : formatTime(filters.startHour)}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0] group-hover:text-[#FFA987] transition-colors" />
                  </div>
                </button>
              </div>

              {/* SECTION F: INTERNET & SPACE ESSENTIALS (SIMPLIFIED) */}
              <div className="space-y-2.5 pt-1 border-t border-[#E2ECEB] dark:border-[#166D74]">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5D7A7D] dark:text-[#B8D1D0] flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-[#FFA987]" />
                  <span>Internet & Space Essentials</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateFilter('needsFixedInternet', !filters.needsFixedInternet)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                      filters.needsFixedInternet
                        ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border-[#14BEB8] text-[#006B70] dark:text-[#28D2CB]'
                        : 'bg-[#FFF9F4] dark:bg-[#07383D] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
                    }`}
                  >
                    <Wifi className="w-4 h-4 shrink-0 text-[#FFA987]" />
                    <span className="truncate">Wi-Fi / Internet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFilter('needsWiredInternet', !filters.needsWiredInternet)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                      filters.needsWiredInternet
                        ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border-[#14BEB8] text-[#006B70] dark:text-[#28D2CB]'
                        : 'bg-[#FFF9F4] dark:bg-[#07383D] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
                    }`}
                  >
                    <Cable className="w-4 h-4 shrink-0 text-[#FFA987]" />
                    <span className="truncate">Wired Internet (Ethernet/LAN)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFilter('needsBackupPower', !filters.needsBackupPower)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                      filters.needsBackupPower
                        ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border-[#14BEB8] text-[#006B70] dark:text-[#28D2CB]'
                        : 'bg-[#FFF9F4] dark:bg-[#07383D] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
                    }`}
                  >
                    <Zap className="w-4 h-4 shrink-0 text-[#FFA987]" />
                    <span className="truncate">24/7 Power</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFilter('needsSoundproofing', !filters.needsSoundproofing)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                      filters.needsSoundproofing
                        ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border-[#14BEB8] text-[#006B70] dark:text-[#28D2CB]'
                        : 'bg-[#FFF9F4] dark:bg-[#07383D] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
                    }`}
                  >
                    <Volume2 className="w-4 h-4 shrink-0 text-[#FFA987]" />
                    <span className="truncate">Quiet / Soundproof</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFilter('needsWhiteboard', !filters.needsWhiteboard)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                      filters.needsWhiteboard
                        ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border-[#14BEB8] text-[#006B70] dark:text-[#28D2CB]'
                        : 'bg-[#FFF9F4] dark:bg-[#07383D] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
                    }`}
                  >
                    <Presentation className="w-4 h-4 shrink-0 text-[#FFA987]" />
                    <span className="truncate">Whiteboard / Board</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFilter('needsProjector', !filters.needsProjector)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                      filters.needsProjector
                        ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border-[#14BEB8] text-[#006B70] dark:text-[#28D2CB]'
                        : 'bg-[#FFF9F4] dark:bg-[#07383D] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
                    }`}
                  >
                    <Tv className="w-4 h-4 shrink-0 text-[#FFA987]" />
                    <span className="truncate">Projector / Screen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFilter('needsCameraEquipment', !filters.needsCameraEquipment)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                      filters.needsCameraEquipment
                        ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border-[#14BEB8] text-[#006B70] dark:text-[#28D2CB]'
                        : 'bg-[#FFF9F4] dark:bg-[#07383D] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
                    }`}
                  >
                    <Camera className="w-4 h-4 shrink-0 text-[#FFA987]" />
                    <span className="truncate">Camera / Studio Rig</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFilter('instantBookingOnly', !filters.instantBookingOnly)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                      filters.instantBookingOnly
                        ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border-[#14BEB8] text-[#006B70] dark:text-[#28D2CB]'
                        : 'bg-[#FFF9F4] dark:bg-[#07383D] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 shrink-0 text-[#FFA987]" />
                    <span className="truncate">Instant Digital Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFilter('availableNowOnly', !filters.availableNowOnly)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                      filters.availableNowOnly
                        ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border-[#14BEB8] text-[#006B70] dark:text-[#28D2CB]'
                        : 'bg-[#FFF9F4] dark:bg-[#07383D] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
                    }`}
                  >
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${filters.availableNowOnly ? 'bg-[#FFA987]' : 'bg-[#9CA3AF]'}`} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${filters.availableNowOnly ? 'bg-[#FFA987]' : 'bg-[#9CA3AF]'}`} />
                    </span>
                    <span className="truncate">Available Now Only</span>
                  </button>
                </div>
              </div>

              {/* SECTION G: SORTING */}
              <div className="space-y-2.5 pt-1 border-t border-[#E2ECEB] dark:border-[#166D74]">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5D7A7D] dark:text-[#B8D1D0] block">
                  Sort By
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'recommended', label: 'Recommended' },
                    { id: 'price_asc', label: 'Price: Low to High' },
                    { id: 'price_desc', label: 'Price: High to Low' },
                    { id: 'rating', label: 'Highest Rated' },
                    { id: 'popular', label: 'Most Popular' },
                  ].map((s) => {
                    const isSelected = filters.sortBy === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => updateFilter('sortBy', s.id as any)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#14BEB8] text-white border-[#14BEB8]'
                            : 'bg-[#FFF9F4] dark:bg-[#07383D] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DRAWER FOOTER / ACTIONS */}
              <div className="pt-3 border-t border-[#E2ECEB] dark:border-[#166D74] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] transition-all cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    id="search-drawer-apply-btn"
                    type="button"
                    onClick={handleApply}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#14BEB8] hover:bg-[#0EA8A2] transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Show {spaces.length} {spaces.length === 1 ? 'Space' : 'Spaces'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 24-Hour Vertical Wheel Time Picker Modal */}
      <VerticalTimePicker
        isOpen={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        selectedTime={filters.startHour}
        onSelectTime={(t) => updateFilter('startHour', t)}
      />
    </div>
  );
};

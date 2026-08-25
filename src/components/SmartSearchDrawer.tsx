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
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { POPULAR_CITIES, CATEGORY_METADATA } from '../mockData';
import { SpaceCategory } from '../types';
import { VerticalTimePicker } from './VerticalTimePicker';

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
  } = useApp();

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

  // Price label
  const getPriceLabel = (max: number) => {
    if (!max || max >= 150000) return 'Any Price (₦2,000 — ₦150k+/hr)';
    return `₦2,000/hr — ${formatPrice(max, { perHour: true })}`;
  };

  return (
    <div 
      ref={containerRef}
      id="smart-search-container"
      className="relative max-w-xl mx-auto w-full text-left"
    >
      {/* ========================================================================= */}
      {/* 1. PRIMARY SEARCH BAR (ALWAYS VISIBLE)                                   */}
      {/* ========================================================================= */}
      <form
        onSubmit={handleSearchSubmit}
        onClick={() => {
          setIsExpanded(true);
          inputRef.current?.focus();
        }}
        className={`relative flex items-center bg-[#141816] rounded-2xl border transition-all duration-200 shadow-xl cursor-text ${
          isExpanded 
            ? 'border-[#00C878] ring-2 ring-[#00C878]/15 bg-[#141816]' 
            : 'border-[#232D28] hover:border-[#35433C]'
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
              if (!isExpanded) inputRef.current?.focus();
            }
          }}
          className="p-3.5 sm:p-4 text-[#718079] hover:text-[#00C878] transition-colors focus:outline-none"
          aria-label="Search and apply filters"
        >
          <Search className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isExpanded || filters.searchQuery ? 'text-[#00C878]' : ''}`} />
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
          className="w-full py-3.5 sm:py-4 bg-transparent text-xs sm:text-sm text-[#F2F2F2] placeholder-[#718079] focus:outline-none"
        />

        <div className="flex items-center gap-1.5 pr-2.5 sm:pr-3.5 shrink-0">
          {filters.searchQuery && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateFilter('searchQuery', '');
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-lg text-[#718079] hover:text-[#F2F2F2] hover:bg-[#232D28] transition-colors"
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
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
              isExpanded
                ? 'bg-[#00C878] text-[#0D0D0D] border-[#00C878]'
                : activeFiltersCount > 0
                ? 'bg-[#00C878]/15 border-[#00C878]/50 text-[#00C878]'
                : 'bg-[#18201B] border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2] hover:border-[#35433C]'
            }`}
            aria-label="Expand search filter drawer"
            aria-expanded={isExpanded}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Filters</span>
            {activeFiltersCount > 0 && (
              <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                isExpanded ? 'bg-[#0D0D0D] text-[#00C878]' : 'bg-[#00C878] text-[#0D0D0D]'
              }`}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* 2. RECENT / TRENDING SEARCH SUGGESTIONS (WHEN COLLAPSED)                  */}
      {/* ========================================================================= */}
      {!isExpanded && (
        <div id="search-quick-suggestions" className="pt-3 px-1 space-y-2">
          {recentSearches.length > 0 ? (
            <div>
              <div className="flex items-center justify-between pb-1.5">
                <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-[#718079] uppercase">
                  <History className="w-3 h-3 text-[#00C878]" />
                  <span>Recent Searches</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearRecentSearches();
                  }}
                  className="text-[10px] font-mono text-[#718079] hover:text-[#F2F2F2] flex items-center space-x-1 hover:underline transition-colors"
                  aria-label="Clear search history"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {recentSearches.slice(0, 5).map((query, idx) => (
                  <button
                    key={`recent-${query}-${idx}`}
                    type="button"
                    onClick={() => executeSearchQuery(query)}
                    className="shrink-0 px-2.5 py-1 rounded-xl bg-[#141816] hover:bg-[#1C2420] border border-[#232D28] hover:border-[#00C878]/40 text-xs text-[#9EABA3] hover:text-[#00C878] transition-all active:scale-95 font-medium flex items-center space-x-1"
                  >
                    <History className="w-2.5 h-2.5 text-[#718079]" />
                    <span>{query}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-1.5 pb-1.5 text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-[#718079] uppercase">
                <TrendingUp className="w-3 h-3 text-[#00C878]" />
                <span>Trending Searches</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {trendingSearches.map((query, idx) => (
                  <button
                    key={`trending-${query}-${idx}`}
                    type="button"
                    onClick={() => executeSearchQuery(query)}
                    className="shrink-0 px-2.5 py-1 rounded-xl bg-[#141816] hover:bg-[#1C2420] border border-[#232D28] hover:border-[#00C878]/40 text-xs text-[#9EABA3] hover:text-[#00C878] transition-all active:scale-95 font-medium flex items-center space-x-1"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-[#00C878]" />
                    <span>{query}</span>
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
            className="overflow-hidden z-30 mt-2 rounded-2xl bg-[#121614] border border-[#232D28] shadow-2xl backdrop-blur-xl max-h-[80vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-5 space-y-5">
              
              {/* SECTION A: LOCATION & NEARBY */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#718079] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00C878]" />
                    <span>Location & City</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleLocationRequest}
                    className="text-[11px] text-[#00C878] hover:underline font-semibold flex items-center gap-1"
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

                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00C878] pointer-events-none" />
                  <select
                    value={filters.city}
                    onChange={(e) => updateFilter('city', e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-[#18201B] rounded-xl text-xs sm:text-sm text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="All Cities">All Nigerian Cities & Pan-Africa</option>
                    {POPULAR_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#718079] pointer-events-none" />
                </div>

                {/* Popular Area Quick Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-[#718079] uppercase font-mono mr-1">Popular:</span>
                  {NIGERIAN_POPULAR_AREAS.map((area) => {
                    const isSelected = filters.searchQuery.toLowerCase().includes(area.toLowerCase());
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          updateFilter('searchQuery', area);
                          if (area === 'Abuja' || area === 'Maitama') {
                            updateFilter('city', 'Abuja');
                          } else {
                            updateFilter('city', 'Lagos');
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[#00C878] text-[#0D0D0D] font-bold'
                            : 'bg-[#18201B] text-[#9EABA3] hover:text-[#F2F2F2] border border-[#232D28] hover:border-[#35433C]'
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION B: WORKSPACE CATEGORY */}
              <div className="space-y-2.5 pt-1 border-t border-[#1E2522]">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#718079] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00C878]" />
                  <span>Workspace Type</span>
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORY_METADATA.map((cat) => {
                    const isSelected = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id as SpaceCategory | 'all');
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#00C878]/15 border-[#00C878] text-[#F2F2F2]'
                            : 'bg-[#18201B] border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2] hover:border-[#35433C]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#00C878]' : 'text-[#F2F2F2]'}`}>
                            {cat.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00C878]" />}
                        </div>
                        <p className="text-[10px] text-[#718079] mt-0.5 line-clamp-1">{cat.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ================================================================= */}
              {/* 1. REFINED PRICE FILTER (SLIDER ONLY — NO PRESET CHIPS)           */}
              {/* ================================================================= */}
              <div className="space-y-2.5 pt-1 border-t border-[#1E2522]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#718079] flex items-center gap-1.5">
                    <span className="text-[#00C878] font-mono font-bold text-xs">₦</span>
                    <span>Hourly Rate Range</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-[#00C878] bg-[#00C878]/10 px-2.5 py-0.5 rounded-md border border-[#00C878]/20">
                    {getPriceLabel(filters.maxPrice)}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <input
                    type="range"
                    min="2000"
                    max="150000"
                    step="1000"
                    value={filters.maxPrice || 150000}
                    onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
                    className="w-full h-2 bg-[#232D28] rounded-lg appearance-none cursor-pointer accent-[#00C878] focus:outline-none"
                    aria-label="Price range slider"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#718079] font-mono">
                    <span>₦2,000/hr</span>
                    <span>₦40,000/hr</span>
                    <span>₦80,000/hr</span>
                    <span>₦150,000+/hr (Any)</span>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* 2. REFINED CAPACITY FILTER (SLIDER ONLY — NO CHIPS)               */}
              {/* ================================================================= */}
              <div className="space-y-2.5 pt-1 border-t border-[#1E2522]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#718079] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#00C878]" />
                    <span>Capacity</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-[#00C878] bg-[#00C878]/10 px-2.5 py-0.5 rounded-md border border-[#00C878]/20">
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
                    className="w-full h-2 bg-[#232D28] rounded-lg appearance-none cursor-pointer accent-[#00C878] focus:outline-none"
                    aria-label="Capacity range slider"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#718079] font-mono">
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
              <div className="space-y-2.5 pt-1 border-t border-[#1E2522]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#718079] flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-[#00C878]" />
                    <span>Booking Duration</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-[#00C878] bg-[#00C878]/10 px-2.5 py-0.5 rounded-md border border-[#00C878]/20">
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
                    className="w-full h-2 bg-[#232D28] rounded-lg appearance-none cursor-pointer accent-[#00C878] focus:outline-none"
                    aria-label="Booking duration slider"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#718079] font-mono">
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
              <div className="space-y-2.5 pt-1 border-t border-[#1E2522]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#718079] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#00C878]" />
                    <span>Start Time</span>
                  </label>
                  <span className="text-[11px] font-mono text-[#00C878]">
                    {filters.startHour === 'any' ? 'Any Time' : formatTime(filters.startHour)}
                  </span>
                </div>

                {/* Compact Selector Card */}
                <button
                  id="compact-time-selector-btn"
                  type="button"
                  onClick={() => setIsTimePickerOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#18201B] hover:bg-[#1E2522] border border-[#232D28] hover:border-[#00C878]/40 transition-all text-left group cursor-pointer"
                  aria-label="Open time picker"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#121614] border border-[#232D28] flex items-center justify-center text-[#00C878] group-hover:border-[#00C878]/50 transition-colors">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-[#718079]">Start Time</div>
                      <div className="text-sm font-mono font-bold text-[#F2F2F2] group-hover:text-[#00C878] transition-colors">
                        {filters.startHour === 'any' ? formatTime('08:00') : formatTime(filters.startHour)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-semibold text-[#00C878] bg-[#00C878]/10 px-2.5 py-1 rounded-lg border border-[#00C878]/25">
                      {filters.startHour === 'any' ? 'Any Time' : formatTime(filters.startHour)}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#718079] group-hover:text-[#00C878] transition-colors" />
                  </div>
                </button>
              </div>

              {/* SECTION F: INTERNET & SPACE ESSENTIALS (SIMPLIFIED) */}
              <div className="space-y-2.5 pt-1 border-t border-[#1E2522]">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#718079] flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-[#00C878]" />
                  <span>Internet & Space Essentials</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateFilter('needsFixedInternet', !filters.needsFixedInternet)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
                      filters.needsFixedInternet
                        ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878]'
                        : 'bg-[#18201B] border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2]'
                    }`}
                  >
                    <Wifi className="w-4 h-4 shrink-0 text-[#00C878]" />
                    <span className="truncate">Wi-Fi / Internet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFilter('needsWiredInternet', !filters.needsWiredInternet)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
                      filters.needsWiredInternet
                        ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878]'
                        : 'bg-[#18201B] border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2]'
                    }`}
                  >
                    <Cable className="w-4 h-4 shrink-0 text-[#00C878]" />
                    <span className="truncate">Wired Internet (Ethernet/LAN)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFilter('needsBackupPower', !filters.needsBackupPower)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
                      filters.needsBackupPower
                        ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878]'
                        : 'bg-[#18201B] border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2]'
                    }`}
                  >
                    <Zap className="w-4 h-4 shrink-0 text-[#00C878]" />
                    <span className="truncate">24/7 Power</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFilter('needsSoundproofing', !filters.needsSoundproofing)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
                      filters.needsSoundproofing
                        ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878]'
                        : 'bg-[#18201B] border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2]'
                    }`}
                  >
                    <Volume2 className="w-4 h-4 shrink-0 text-[#00C878]" />
                    <span className="truncate">Quiet / Soundproof</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFilter('instantBookingOnly', !filters.instantBookingOnly)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
                      filters.instantBookingOnly
                        ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878]'
                        : 'bg-[#18201B] border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 shrink-0 text-[#00C878]" />
                    <span className="truncate">Instant Digital Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFilter('availableNowOnly', !filters.availableNowOnly)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
                      filters.availableNowOnly
                        ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878]'
                        : 'bg-[#18201B] border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2]'
                    }`}
                  >
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${filters.availableNowOnly ? 'bg-[#00C878]' : 'bg-[#718079]'}`} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${filters.availableNowOnly ? 'bg-[#00C878]' : 'bg-[#718079]'}`} />
                    </span>
                    <span className="truncate">Available Now Only</span>
                  </button>
                </div>
              </div>

              {/* SECTION G: SORTING */}
              <div className="space-y-2.5 pt-1 border-t border-[#1E2522]">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#718079] block">
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
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                          isSelected
                            ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878]'
                            : 'bg-[#18201B] border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2]'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DRAWER FOOTER / ACTIONS */}
              <div className="pt-3 border-t border-[#1E2522] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B] transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#18201B] border border-[#232D28] transition-all"
                  >
                    Close
                  </button>

                  <button
                    id="search-drawer-apply-btn"
                    type="button"
                    onClick={handleApply}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0D0D0D] bg-[#00C878] hover:bg-[#00E58B] transition-all shadow-md active:scale-95 flex items-center gap-1.5"
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

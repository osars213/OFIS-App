import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Zap, 
  Wifi, 
  VolumeX, 
  Star, 
  Heart, 
  ShieldCheck, 
  ChevronRight, 
  SlidersHorizontal,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  Laptop,
  Camera,
  Mic,
  Briefcase,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { POPULAR_CITIES, CATEGORY_METADATA } from '../mockData';
import { SpaceCategory } from '../types';

export const SpaceList: React.FC = () => {
  const {
    spaces,
    filters,
    updateFilter,
    resetFilters,
    activeCategory,
    setActiveCategory,
    setSelectedSpaceId,
    setCurrentView,
    savedSpaceIds,
    toggleSaveSpace,
    setCheckoutSpace,
    setIsCheckoutOpen,
    currency,
    formatPrice,
  } = useApp();

  const [locationStatus, setLocationStatus] = useState<'idle' | 'granted' | 'denied'>('idle');

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationStatus('granted');
          updateFilter('city', 'Lagos');
          updateFilter('searchQuery', 'Victoria Island');
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

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-24">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: BRANDING & HEADLINE WITH SEAMLESS EVOLVING TOP ARC       */}
      {/* ========================================================================= */}
      <section className="relative pt-10 sm:pt-14 pb-10 px-4 sm:px-6 lg:px-8 border-b border-[#1E2522] bg-gradient-to-b from-[#141A17] via-[#0E1310] to-[#0D0D0D] overflow-hidden">
        
        {/* Seamless Horizon Top Evolving Arc Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[2px] seamless-horizon-arc pointer-events-none z-20" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-32 bg-[#00C878]/15 rounded-[100%] blur-3xl pointer-events-none -z-0 animate-ambient-pulse" />

        {/* Seamless Revolving Ambient Background Glow Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] sm:w-[750px] sm:h-[750px] bg-[conic-gradient(from_0deg,#00C878_0deg,transparent_60deg,transparent_180deg,#00C878_240deg,transparent_300deg,#00C878_360deg)] opacity-15 blur-3xl animate-revolving-glow pointer-events-none -z-0" />
        
        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-5">
          
          {/* Overline Positioning with Seamless Revolving Glow Border */}
          <div className="inline-flex relative p-[1px] rounded-full overflow-hidden shadow-lg group">
            {/* Seamless Revolving Border Beam */}
            <div className="absolute inset-[-150%] seamless-top-arc pointer-events-none opacity-90" />
            <div className="relative inline-flex items-center space-x-2 sm:space-x-3 px-4 sm:px-5 py-1.5 rounded-full bg-[#141816] text-xs font-mono font-bold tracking-wider text-[#00C878] uppercase">
              <span>Work. Meet. Create. Record</span>
            </div>
          </div>

          {/* Core Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F2F2F2] max-w-4xl mx-auto leading-[1.15]">
            Find the right space. <br className="hidden sm:block" />
            <span className="text-[#00C878]">Book it when you need it.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#9EABA3] font-normal leading-relaxed">
            Book inspiring workspaces, studios, meeting rooms and creative spaces across Nigeria — by the hour or by the day.
          </p>

          {/* Trust Benefits Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-4 sm:gap-x-6 text-xs text-[#718079]">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00C878]" />
              <span className="text-[#9EABA3]">Verified Spaces</span>
            </div>
            <span className="text-[#232D28] hidden sm:inline">•</span>
            <div className="flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-[#00C878]" />
              <span className="text-[#9EABA3]">24/7 Power</span>
            </div>
            <span className="text-[#232D28] hidden sm:inline">•</span>
            <div className="flex items-center space-x-1.5">
              <Wifi className="w-4 h-4 text-[#00C878]" />
              <span className="text-[#9EABA3]">Fast Internet</span>
            </div>
            <span className="text-[#232D28] hidden sm:inline">•</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-[#00C878]/15 text-[#00C878] font-bold text-xs flex items-center justify-center leading-none">
                {currency === 'USD' ? '$' : '₦'}
              </span>
              <span className="text-[#9EABA3]">Clear Pricing</span>
            </div>
            <span className="text-[#232D28] hidden sm:inline">•</span>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-[#00C878]" />
              <span className="text-[#9EABA3]">Instant Booking Hourly & Daily Pass</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SEARCH & DISCOVERY BAR - PROMINENTLY VISIBLE IMMEDIATELY ON APP LAUNCH    */}
          {/* ========================================================================= */}
          <div id="spaces-discovery-section" className="pt-6 max-w-5xl mx-auto text-left">
            <div className="relative p-[1px] rounded-2xl overflow-hidden shadow-2xl group">
              {/* Ambient Revolving Glow Beam */}
              <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_320deg,rgba(0,200,120,0.6)_360deg)] animate-revolving-glow pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative bg-[#141816] p-3.5 sm:p-5 rounded-2xl border border-[#232D28]">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                
                {/* Query Input */}
                <div className="md:col-span-5 relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3.5 text-[#9EABA3]" />
                  <input
                    id="main-search-input"
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => updateFilter('searchQuery', e.target.value)}
                    placeholder="Search spaces, areas or cities"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1A201D] rounded-xl text-xs sm:text-sm text-[#F2F2F2] placeholder-[#718079] border border-transparent focus:border-[#00C878] focus:outline-none transition-all"
                  />
                </div>

                {/* City Selector */}
                <div className="md:col-span-3 relative flex items-center">
                  <MapPin className="w-4 h-4 absolute left-3.5 text-[#00C878]" />
                  <select
                    value={filters.city}
                    onChange={(e) => updateFilter('city', e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-[#1A201D] rounded-xl text-xs sm:text-sm text-[#F2F2F2] border border-transparent focus:border-[#00C878] focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="All Cities">All African Cities</option>
                    {POPULAR_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Power & Internet Filter Toggles */}
                <div className="md:col-span-4 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => updateFilter('needsBackupPower', !filters.needsBackupPower)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all border ${
                      filters.needsBackupPower
                        ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878]'
                        : 'bg-[#1A201D] border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2]'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>24/7 Power</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFilter('needsHighSpeedInternet', !filters.needsHighSpeedInternet)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all border ${
                      filters.needsHighSpeedInternet
                        ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878]'
                        : 'bg-[#1A201D] border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2]'
                    }`}
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    <span>Fast Internet</span>
                  </button>
                </div>

              </div>

              {/* Quick Geolocation & Popular Area Shortlinks */}
              <div className="mt-3 pt-3 border-t border-[#1E2522] flex flex-wrap items-center justify-between gap-2 text-xs text-[#9EABA3]">
                <button
                  type="button"
                  onClick={handleLocationRequest}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1A201D] hover:bg-[#202723] text-[#00C878] border border-[#232D28] hover:border-[#00C878]/40 transition-all font-semibold"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#00C878]" />
                  <span>
                    {locationStatus === 'granted'
                      ? 'Spaces Near You'
                      : locationStatus === 'denied'
                      ? 'Choose Your Location'
                      : 'Find Spaces Near Me'}
                  </span>
                </button>

                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="text-[#718079]">Key African Hubs:</span>
                  {['Lagos', 'Nairobi', 'Sandton', 'Accra', 'Cape Town', 'Cairo', 'Kigali'].map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => updateFilter('searchQuery', area)}
                      className="hover:text-[#00C878] underline-offset-2 hover:underline transition-colors"
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CATEGORY FILTER TABS                                                   */}
      {/* ========================================================================= */}
      <section className="sticky top-16 sm:top-[68px] z-30 bg-[#0D0D0D]/90 backdrop-blur-md border-y border-[#1E2522] py-3 px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto no-scrollbar">
            {CATEGORY_METADATA.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as SpaceCategory | 'all')}
                  className={`whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border ${
                    isActive
                      ? 'bg-[#00C878] text-[#0D0D0D] border-[#00C878] shadow-[0_2px_12px_rgba(0,200,120,0.3)]'
                      : 'bg-[#141816] text-[#9EABA3] hover:text-[#F2F2F2] border-[#1E2522] hover:border-[#35433C]'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('map')}
            className="hidden md:flex items-center space-x-1.5 text-xs font-bold text-[#00C878] hover:text-[#00E58B] shrink-0"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Around Me</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. MAIN SPACES GRID (DISCOVER → COMPARE → BOOK)                           */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#F2F2F2] flex items-center space-x-2">
              <span>Available Spaces</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A231E] border border-[#232D28] text-[#00C878] font-mono">
                {spaces.length} verified
              </span>
            </h2>
            <p className="text-xs text-[#9EABA3] mt-0.5">Explore physical spaces across Nigeria by the hour or day</p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value as any)}
              className="bg-[#141816] border border-[#232D28] text-xs text-[#9EABA3] rounded-xl px-3 py-2 focus:outline-none focus:border-[#00C878]"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Spaces Grid */}
        {spaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => {
              const isSaved = savedSpaceIds.includes(space.id);
              return (
                <div
                  key={space.id}
                  id={`space-card-${space.id}`}
                  className="group bg-[#141816] rounded-2xl border border-[#1E2522] hover:border-[#00C878]/50 overflow-hidden shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Card Image */}
                  <div 
                    className="relative aspect-[16/10] overflow-hidden bg-[#1A201D] cursor-pointer" 
                    onClick={() => {
                      setSelectedSpaceId(space.id);
                      setCurrentView('details');
                    }}
                  >
                    <img
                      src={space.featuredImage}
                      alt={space.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141816] via-transparent to-black/30" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-[#0D0D0D]/80 backdrop-blur-md border border-[#232D28] text-[11px] font-bold text-[#00C878] flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-[#00C878]" />
                        <span>{space.backupPowerType.split(' ')[0]} Power</span>
                      </span>
                      {space.isSuperhost && (
                        <span className="px-2 py-1 rounded-lg bg-[#00C878] text-[#0D0D0D] text-[10px] font-black uppercase tracking-wider">
                          Superhost
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveSpace(space.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-[#0D0D0D]/80 backdrop-blur-md border border-[#232D28] text-[#F2F2F2] hover:text-[#00C878] transition-all"
                      aria-label="Save to favorites"
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#00C878] text-[#00C878]' : ''}`} />
                    </button>

                    {/* Location Pill */}
                    <div className="absolute bottom-3 left-3 flex items-center space-x-1 text-xs text-[#F2F2F2] bg-[#0D0D0D]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#232D28]">
                      <MapPin className="w-3.5 h-3.5 text-[#00C878]" />
                      <span className="font-semibold">{space.neighborhood}, {space.city}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Rating & Capacity */}
                      <div className="flex items-center justify-between text-xs text-[#9EABA3] mb-1.5">
                        <div className="flex items-center space-x-1 text-[#F2F2F2]">
                          <Star className="w-3.5 h-3.5 fill-[#00C878] text-[#00C878]" />
                          <span className="font-bold">{space.rating}</span>
                          <span className="text-[#718079]">({space.reviewsCount})</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[#9EABA3]">
                          <Users className="w-3.5 h-3.5" />
                          <span>Up to {space.capacity} people</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => {
                          setSelectedSpaceId(space.id);
                          setCurrentView('details');
                        }}
                        className="text-base font-bold text-[#F2F2F2] hover:text-[#00C878] cursor-pointer transition-colors line-clamp-1"
                      >
                        {space.title}
                      </h3>

                      <p className="text-xs text-[#9EABA3] line-clamp-2 mt-1 font-normal leading-relaxed">
                        {space.tagline}
                      </p>
                    </div>

                    {/* Amenities tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {space.amenities.slice(0, 3).map((a, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#1A201D] text-[#9EABA3] border border-[#1E2522]">
                          {a}
                        </span>
                      ))}
                      {space.amenities.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#1A201D] text-[#718079]">
                          +{space.amenities.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Price & Booking Button */}
                    <div className="pt-3 border-t border-[#1E2522] flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-[#718079] font-medium">Rate</div>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-base font-black text-[#00C878] font-mono">
                            {formatPrice(space.pricePerHour)}
                          </span>
                          <span className="text-xs text-[#9EABA3]">/ hr</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSpaceId(space.id);
                            setCurrentView('details');
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#1A201D] border border-[#232D28] transition-all"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCheckoutSpace(space);
                            setIsCheckoutOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-[#0D0D0D] bg-[#00C878] hover:bg-[#00E58B] transition-all shadow-md active:scale-95 flex items-center space-x-1"
                        >
                          <span>Book Space</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#141816] rounded-2xl border border-[#1E2522] p-8 space-y-4">
            <Search className="w-12 h-12 text-[#718079] mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-[#F2F2F2]">No spaces found here</h3>
            <p className="text-xs text-[#9EABA3] max-w-sm mx-auto">
              Try another area or clear your filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl bg-[#00C878] text-[#0D0D0D] text-xs font-bold hover:bg-[#00E58B] transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </main>

    </div>
  );
};


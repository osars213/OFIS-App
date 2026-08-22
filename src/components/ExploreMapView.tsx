import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Zap, 
  Star, 
  ChevronRight, 
  Navigation, 
  Globe2, 
  Compass, 
  Wifi, 
  Search, 
  CheckCircle2,
  Building2,
  Filter,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type MapRegion = 'all' | 'nigeria' | 'east_africa' | 'southern_africa' | 'west_africa' | 'north_africa';

export const ExploreMapView: React.FC = () => {
  const { 
    spaces, 
    setSelectedSpaceId, 
    setCurrentView, 
    setCheckoutSpace, 
    setIsCheckoutOpen, 
    formatPrice, 
    currency 
  } = useApp();

  const [activeRegion, setActiveRegion] = useState<MapRegion>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [showRegusOnly, setShowRegusOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPinId, setSelectedPinId] = useState<string>('space_regus_africare');
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  // Available African cities
  const africanCities = useMemo(() => {
    const citySet = new Set<string>();
    spaces.forEach(s => {
      if (s.city) citySet.add(s.city);
    });
    return Array.from(citySet);
  }, [spaces]);

  // Filtered spaces based on search, region, city & Regus toggle
  const filteredSpaces = useMemo(() => {
    return spaces.filter(space => {
      const isRegus = space.tags.some(t => t.toLowerCase().includes('regus')) || 
                      space.title.toLowerCase().includes('regus') ||
                      space.amenities.some(a => a.toLowerCase().includes('regus'));

      if (showRegusOnly && !isRegus) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuery = 
          space.title.toLowerCase().includes(query) ||
          space.city.toLowerCase().includes(query) ||
          (space.country && space.country.toLowerCase().includes(query)) ||
          space.neighborhood.toLowerCase().includes(query) ||
          space.address.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // City filter
      if (selectedCity !== 'all' && space.city !== selectedCity) {
        return false;
      }

      // Region filter
      if (activeRegion === 'nigeria') {
        return space.city === 'Lagos' || space.city === 'Abuja' || space.city === 'Port Harcourt' || space.city === 'Ibadan';
      }
      if (activeRegion === 'east_africa') {
        return space.city === 'Nairobi' || space.city === 'Kigali' || space.country === 'Kenya' || space.country === 'Rwanda';
      }
      if (activeRegion === 'southern_africa') {
        return space.city === 'Johannesburg' || space.city === 'Cape Town' || space.country === 'South Africa';
      }
      if (activeRegion === 'west_africa') {
        return space.city === 'Accra' || space.city === 'Abidjan' || space.city === 'Dakar' || space.country === 'Ghana' || space.country === 'Ivory Coast' || space.country === 'Senegal';
      }
      if (activeRegion === 'north_africa') {
        return space.city === 'Cairo' || space.city === 'Casablanca' || space.country === 'Egypt' || space.country === 'Morocco';
      }

      return true;
    });
  }, [spaces, activeRegion, selectedCity, showRegusOnly, searchQuery]);

  const regusCount = useMemo(() => {
    return spaces.filter(s => 
      s.tags.some(t => t.toLowerCase().includes('regus')) || 
      s.title.toLowerCase().includes('regus')
    ).length;
  }, [spaces]);

  const activeSpace = useMemo(() => {
    return spaces.find(s => s.id === selectedPinId) || filteredSpaces[0] || spaces[0];
  }, [spaces, selectedPinId, filteredSpaces]);

  // Visual layout mapping for pins on Pan-African Map
  const getPinCoordinate = (spaceId: string, idx: number) => {
    const coordinateMap: Record<string, { top: string; left: string }> = {
      // North Africa
      'space_regus_casablanca_twin': { top: '14%', left: '18%' }, // Casablanca, Morocco
      'space_regus_cairo_nile': { top: '16%', left: '76%' },      // Cairo, Egypt

      // West Africa (Dakar -> Abidjan -> Accra -> Lagos -> Abuja -> PH)
      'space_regus_dakar_atryum': { top: '34%', left: '10%' },     // Dakar, Senegal
      'space_regus_abidjan_ccia': { top: '46%', left: '22%' },     // Abidjan, Ivory Coast
      'space_regus_accra_roman': { top: '48%', left: '28%' },      // Accra, Ghana
      'space_regus_africare': { top: '48%', left: '38%' },         // Lagos VI
      'space_1': { top: '51%', left: '35%' },                      // Lagos VI Foundry
      'space_regus_mulliner': { top: '44%', left: '40%' },         // Lagos Ikoyi
      'space_4': { top: '41%', left: '44%' },                      // Lagos Ikoyi Studio
      'space_regus_landmark': { top: '54%', left: '41%' },         // Lagos Oniru
      'space_regus_wings': { top: '47%', left: '33%' },            // Lagos Ozumba
      'space_regus_churchgate': { top: '53%', left: '37%' },       // Lagos Churchgate
      'space_2': { top: '56%', left: '44%' },                      // Lekki Phase 1
      'space_3': { top: '42%', left: '36%' },                      // Ikeja GRA
      'space_5': { top: '52%', left: '46%' },                      // Lekki Photo
      'space_regus_abuja': { top: '39%', left: '42%' },            // Abuja CBD
      'space_regus_ph': { top: '57%', left: '40%' },               // Port Harcourt
      'space_6': { top: '60%', left: '42%' },                      // Port Harcourt Innovation

      // East Africa
      'space_regus_nairobi_vienna': { top: '54%', left: '72%' },   // Nairobi Kilimani
      'space_regus_nairobi_delta': { top: '50%', left: '75%' },    // Nairobi Westlands
      'space_regus_kigali_heights': { top: '58%', left: '65%' },   // Kigali Heights

      // Southern Africa
      'space_regus_sandton': { top: '78%', left: '60%' },          // Johannesburg Sandton
      'space_regus_capetown_convention': { top: '88%', left: '50%' } // Cape Town Foreshore
    };

    if (coordinateMap[spaceId]) {
      return coordinateMap[spaceId];
    }
    const fallbackList = [
      { top: '48%', left: '38%' },
      { top: '52%', left: '70%' },
      { top: '78%', left: '58%' },
      { top: '18%', left: '72%' },
      { top: '44%', left: '26%' },
      { top: '86%', left: '48%' },
    ];
    return fallbackList[idx % fallbackList.length];
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-24 pt-4 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold text-[#F2F2F2]">Pan-African Regus & Workspace Directory</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C878] animate-ping" />
                <span>Africa Live Radar</span>
              </span>
            </div>
            <p className="text-xs text-[#9EABA3] mt-0.5">
              Interactive map covering official Regus business centres and verified workspaces across <strong>Nigeria, Kenya, South Africa, Ghana, Rwanda, Egypt, Morocco, Senegal & Ivory Coast</strong> • Rates in <strong className="text-[#00C878]">{currency === 'USD' ? 'USD ($)' : 'NGN (₦)'}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="switch-grid-view-btn"
              type="button"
              onClick={() => setCurrentView('explore')}
              className="text-xs font-semibold text-[#00C878] hover:underline flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#141816] border border-[#232D28] shadow-sm transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Grid View</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Search & Filter Controls Row */}
        <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-[#121614] border border-[#1E2522] mb-4 shadow-sm">
          
          {/* Top Row: Search Input + Regus Network Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#718079] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="african-map-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search African cities, hubs or Regus centres (e.g. Sandton, Nairobi, Lagos, Cairo)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] placeholder-[#718079] focus:outline-none focus:border-[#00C878] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#718079] hover:text-[#F2F2F2]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Regus Filter Toggle */}
            <button
              id="regus-only-filter-toggle"
              type="button"
              onClick={() => setShowRegusOnly(!showRegusOnly)}
              className={`w-full sm:w-auto whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border ${
                showRegusOnly
                  ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878] ring-1 ring-[#00C878]/40'
                  : 'bg-[#161D19] border-[#2A362F] text-[#9EABA3] hover:text-[#F2F2F2]'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-[#00C878]" />
              <span>Regus Global Network ({regusCount})</span>
              {showRegusOnly && <CheckCircle2 className="w-3.5 h-3.5 text-[#00C878]" />}
            </button>
          </div>

          {/* Region & Continental Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#1E2522]">
            <button
              type="button"
              onClick={() => { setActiveRegion('all'); setSelectedCity('all'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeRegion === 'all' && selectedCity === 'all'
                  ? 'bg-[#00C878] text-[#0D0D0D] font-bold shadow-sm'
                  : 'bg-[#18201B] text-[#9EABA3] hover:text-[#F2F2F2]'
              }`}
            >
              All Africa ({spaces.length})
            </button>
            <button
              type="button"
              onClick={() => { setActiveRegion('nigeria'); setSelectedCity('all'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeRegion === 'nigeria'
                  ? 'bg-[#00C878] text-[#0D0D0D] font-bold shadow-sm'
                  : 'bg-[#18201B] text-[#9EABA3] hover:text-[#F2F2F2]'
              }`}
            >
              Nigeria (Lagos, Abuja, PH)
            </button>
            <button
              type="button"
              onClick={() => { setActiveRegion('east_africa'); setSelectedCity('all'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeRegion === 'east_africa'
                  ? 'bg-[#00C878] text-[#0D0D0D] font-bold shadow-sm'
                  : 'bg-[#18201B] text-[#9EABA3] hover:text-[#F2F2F2]'
              }`}
            >
              East Africa (Nairobi, Kigali)
            </button>
            <button
              type="button"
              onClick={() => { setActiveRegion('southern_africa'); setSelectedCity('all'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeRegion === 'southern_africa'
                  ? 'bg-[#00C878] text-[#0D0D0D] font-bold shadow-sm'
                  : 'bg-[#18201B] text-[#9EABA3] hover:text-[#F2F2F2]'
              }`}
            >
              Southern Africa (Sandton, Cape Town)
            </button>
            <button
              type="button"
              onClick={() => { setActiveRegion('west_africa'); setSelectedCity('all'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeRegion === 'west_africa'
                  ? 'bg-[#00C878] text-[#0D0D0D] font-bold shadow-sm'
                  : 'bg-[#18201B] text-[#9EABA3] hover:text-[#F2F2F2]'
              }`}
            >
              West Africa (Accra, Abidjan, Dakar)
            </button>
            <button
              type="button"
              onClick={() => { setActiveRegion('north_africa'); setSelectedCity('all'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeRegion === 'north_africa'
                  ? 'bg-[#00C878] text-[#0D0D0D] font-bold shadow-sm'
                  : 'bg-[#18201B] text-[#9EABA3] hover:text-[#F2F2F2]'
              }`}
            >
              North Africa (Cairo, Casablanca)
            </button>
          </div>

        </div>

        {/* Main Grid: Pan-African Map Canvas + Selected Space Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
          
          {/* Left: Interactive Pan-African Map Canvas */}
          <div className="lg:col-span-8 bg-[#121714] rounded-2xl border border-[#1E2522] overflow-hidden relative shadow-2xl flex flex-col p-3 sm:p-4 transition-colors">
            
            {/* Map Canvas Container */}
            <div className="w-full flex-1 min-h-[500px] relative rounded-xl overflow-hidden bg-[#0A0D0B] border border-[#1A231E]">
              
              {/* Background Geometric Grid Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#1E2B23_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

              {/* Pan-African Continental Contour Glows */}
              <div className="absolute top-[12%] left-[12%] w-48 h-32 bg-[#00C878]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-[45%] left-[24%] w-64 h-40 bg-[#00C878]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-[50%] right-[20%] w-56 h-36 bg-[#00C878]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-[10%] left-[45%] w-60 h-44 bg-[#00C878]/5 rounded-full blur-3xl pointer-events-none" />

              {/* Geographic Anchor Badges across Africa */}
              <div className="absolute top-4 left-6 px-2.5 py-1 rounded-md bg-[#0D120F]/80 border border-[#1E2822] text-[10px] font-mono uppercase tracking-widest text-[#5A6D63] pointer-events-none">
                North Africa • Casablanca & Cairo
              </div>
              <div className="absolute top-[32%] left-4 px-2 py-0.5 rounded-md bg-[#0D120F]/80 border border-[#1E2822] text-[9px] font-mono uppercase tracking-widest text-[#5A6D63] pointer-events-none">
                Senegal / Dakar
              </div>
              <div className="absolute top-[43%] left-[18%] px-2.5 py-1 rounded-md bg-[#0D120F]/80 border border-[#1E2822] text-[10px] font-mono uppercase tracking-widest text-[#5A6D63] pointer-events-none">
                Gulf of Guinea Corridor • Abidjan, Accra & Lagos
              </div>
              <div className="absolute top-[46%] right-6 px-2.5 py-1 rounded-md bg-[#0D120F]/80 border border-[#1E2822] text-[10px] font-mono uppercase tracking-widest text-[#5A6D63] pointer-events-none">
                East Africa • Nairobi & Kigali
              </div>
              <div className="absolute bottom-6 left-[38%] px-2.5 py-1 rounded-md bg-[#0D120F]/80 border border-[#1E2822] text-[10px] font-mono uppercase tracking-widest text-[#5A6D63] pointer-events-none">
                Southern Africa • Sandton & Cape Town
              </div>

              {/* Interactive Space Pins */}
              {filteredSpaces.map((space, idx) => {
                const isSelected = space.id === selectedPinId;
                const isHovered = space.id === hoveredPinId;
                const pos = getPinCoordinate(space.id, idx);
                const isRegus = space.tags.some(t => t.toLowerCase().includes('regus')) || 
                                space.title.toLowerCase().includes('regus');

                return (
                  <div
                    key={space.id}
                    style={{ top: pos.top, left: pos.left }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group"
                    onMouseEnter={() => setHoveredPinId(space.id)}
                    onMouseLeave={() => setHoveredPinId(null)}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedPinId(space.id)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shadow-2xl cursor-pointer ${
                        isSelected
                          ? 'bg-[#00C878] text-[#0D0D0D] ring-4 ring-[#00C878]/35 scale-110 z-30 font-black'
                          : isRegus
                          ? 'bg-[#141B17] text-[#00E58B] border border-[#00C878]/60 hover:border-[#00C878] hover:scale-105'
                          : 'bg-[#141816] text-[#F2F2F2] border border-[#232D28] hover:border-[#00C878] hover:scale-105'
                      }`}
                    >
                      {isRegus ? (
                        <Globe2 className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0D0D0D]' : 'text-[#00C878]'}`} />
                      ) : (
                        <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0D0D0D]' : 'text-[#00C878]'}`} />
                      )}
                      <span className="font-mono tracking-tight">{formatPrice(space.pricePerHour)}/hr</span>
                    </button>

                    {/* Hover Card Preview Tooltip */}
                    {isHovered && !isSelected && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-xl bg-[#141816] border border-[#2A362F] shadow-2xl text-left pointer-events-none z-40 animate-in fade-in duration-150">
                        <div className="flex items-center space-x-1 text-[10px] text-[#00C878] font-bold mb-0.5">
                          {isRegus && <Globe2 className="w-3 h-3" />}
                          <span>{space.city}{space.country ? `, ${space.country}` : ''}</span>
                        </div>
                        <p className="text-[11px] font-bold text-[#F2F2F2] line-clamp-1">{space.title}</p>
                        <div className="flex items-center justify-between text-[10px] text-[#9EABA3] mt-1.5 pt-1 border-t border-[#1E2522]">
                          <span>{space.neighborhood}</span>
                          <span className="text-[#00C878] font-mono font-bold">{formatPrice(space.pricePerHour)}/hr</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bottom Map Info Overlay */}
              <div className="absolute bottom-3 left-3 bg-[#121714]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#232D28] text-[11px] text-[#9EABA3] flex items-center space-x-2.5 shadow-lg">
                <Navigation className="w-3.5 h-3.5 text-[#00C878]" />
                <span>Showing <strong className="text-[#F2F2F2]">{filteredSpaces.length}</strong> spaces • Tap any marker to inspect pass options</span>
              </div>

              {/* Regus Network Legend Badge */}
              <div className="absolute top-3 right-3 bg-[#121714]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#00C878]/30 text-[10px] font-semibold text-[#00C878] flex items-center space-x-1.5 shadow-lg">
                <Globe2 className="w-3 h-3 text-[#00C878]" />
                <span>Regus Verified Partner Network ({regusCount})</span>
              </div>

            </div>

          </div>

          {/* Right: Selected Space Detailed Card */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            {activeSpace ? (
              <div className="bg-[#141816] rounded-2xl border border-[#1E2522] p-5 shadow-xl space-y-4 flex-1 flex flex-col justify-between transition-colors">
                
                <div className="space-y-3.5">
                  
                  {/* Space Image & Regus Badge */}
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#1A201D] border border-[#232D28]">
                    <img
                      src={activeSpace.featuredImage}
                      alt={activeSpace.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Top Left Power Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-[#0D0D0D]/85 backdrop-blur-md border border-[#232D28] text-[10px] font-bold text-[#00C878] flex items-center space-x-1.5">
                      <Zap className="w-3 h-3 text-[#00C878]" />
                      <span>{activeSpace.backupPowerType.split(' ')[0]} Power</span>
                    </div>

                    {/* Regus Tag if applicable */}
                    {(activeSpace.tags.some(t => t.toLowerCase().includes('regus')) || activeSpace.title.toLowerCase().includes('regus')) && (
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#00C878] text-[#0D0D0D] font-mono text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 shadow-lg">
                        <Globe2 className="w-3 h-3 text-[#0D0D0D]" />
                        <span>Regus Center</span>
                      </div>
                    )}
                  </div>

                  {/* Title, Location & Tagline */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#9EABA3] mb-1">
                      <div className="flex items-center space-x-1 text-[#F2F2F2]">
                        <Star className="w-3.5 h-3.5 fill-[#00C878] text-[#00C878]" />
                        <span className="font-bold">{activeSpace.rating}</span>
                        <span className="text-[#718079]">({activeSpace.reviewsCount} reviews)</span>
                      </div>
                      <span className="font-medium text-[#9EABA3]">
                        {activeSpace.city}{activeSpace.country ? `, ${activeSpace.country}` : ''}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#F2F2F2] line-clamp-1">{activeSpace.title}</h3>
                    <p className="text-xs text-[#9EABA3] line-clamp-2 mt-1 leading-relaxed">{activeSpace.tagline}</p>
                  </div>

                  {/* Key Highlights */}
                  <div className="p-3 rounded-xl bg-[#161D19] border border-[#1E2522] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#9EABA3] flex items-center space-x-1.5">
                        <MapPin className="w-3 h-3 text-[#00C878]" />
                        <span>Address</span>
                      </span>
                      <span className="text-[#F2F2F2] font-medium truncate max-w-[170px]" title={activeSpace.address}>
                        {activeSpace.address}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#9EABA3] flex items-center space-x-1.5">
                        <Wifi className="w-3 h-3 text-[#00C878]" />
                        <span>Internet Speed</span>
                      </span>
                      <span className="text-[#00C878] font-mono font-bold">
                        {activeSpace.internetSpeedMbps} Mbps Fiber
                      </span>
                    </div>
                  </div>

                </div>

                {/* Pricing & Call to Actions */}
                <div className="pt-3 border-t border-[#1E2522] space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-[#718079] block">Hourly Pass Rate</span>
                      <span className="text-lg font-black text-[#00C878] font-mono">
                        {formatPrice(activeSpace.pricePerHour)}
                        <span className="text-xs text-[#718079] font-normal font-sans ml-1">/ hour</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-[#718079] block">All-Day Pass</span>
                      <span className="text-sm font-bold text-[#F2F2F2] font-mono">
                        {formatPrice(activeSpace.pricePerDay)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSpaceId(activeSpace.id);
                        setCurrentView('details');
                      }}
                      className="py-2.5 rounded-xl bg-[#161D19] border border-[#232D28] text-xs font-semibold text-[#F2F2F2] hover:bg-[#1E2522] transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutSpace(activeSpace);
                        setIsCheckoutOpen(true);
                      }}
                      className="py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs shadow-md transition-colors"
                    >
                      Instant Book Pass
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-[#141816] rounded-2xl border border-[#1E2522] p-8 text-center text-[#9EABA3] flex-1 flex flex-col items-center justify-center">
                <Compass className="w-8 h-8 text-[#00C878] mb-2 opacity-60" />
                <p className="text-sm font-semibold text-[#F2F2F2]">No spaces match this filter</p>
                <p className="text-xs text-[#718079] mt-1">Try searching another African city or clearing the filters.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

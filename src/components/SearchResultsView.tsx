import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Timer,
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  CheckCircle2,
  Zap,
  Wifi,
  Wind,
  ShieldCheck,
  Video,
  Camera,
  Mic,
  Briefcase,
  Building2,
  Coffee,
  Car,
  Volume2,
  Layers,
  ArrowRight,
  Heart,
  RotateCcw,
  Check,
  ChevronDown,
  X,
  Lock,
  Compass,
  ArrowUpDown,
  Maximize2,
  Sparkles,
  Sun,
  Shield,
  Printer,
  Tv,
  Utensils,
  Eye,
  Sliders,
  Share2,
  List,
  Map as MapIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Space, SortOption, PrimaryCategory, CurrencyCode } from '../types';
import { ExploreMapView } from './ExploreMapView';
import { PriceRangeSlider, PriceRateType } from './PriceRangeSlider';

interface SearchResultsViewProps {
  onSelectSpace: (space: Space) => void;
  onBackToHome: () => void;
}

// 8 Standard Space Types with icons & subcategory matching
const SPACE_TYPES = [
  { id: 'all', label: 'All Space Types', icon: Compass, subcatMatch: [] },
  { id: 'coworking', label: 'Coworking', icon: Briefcase, subcatMatch: ['coworking_desks', 'hot_desks'] },
  { id: 'private_office', label: 'Private Office', icon: Lock, subcatMatch: ['private_offices', 'day_offices'] },
  { id: 'meeting_room', label: 'Meeting Room', icon: Building2, subcatMatch: ['meeting_rooms', 'boardrooms', 'conference_rooms', 'training_rooms'] },
  { id: 'podcast_studio', label: 'Podcast Studio', icon: Mic, subcatMatch: ['podcast_studios', 'music_studios'] },
  { id: 'content_studio', label: 'Content Creator Studio', icon: Video, subcatMatch: ['content_studios'] },
  { id: 'photography_studio', label: 'Photography Studio', icon: Camera, subcatMatch: ['photography_studios'] },
  { id: 'video_studio', label: 'Video Studio', icon: Video, subcatMatch: ['video_studios', 'green_screen_studios', 'production_spaces'] },
  { id: 'event_space', label: 'Event Space', icon: Layers, subcatMatch: ['event_spaces', 'small_venues', 'workshop_spaces'] },
];

// Nigerian-specific amenities list
const NIGERIAN_AMENITIES = [
  { id: '24/7 Power', label: '24/7 Power', icon: Zap },
  { id: 'Generator', label: 'Generator', icon: Zap },
  { id: 'Solar', label: 'Solar Backup', icon: Sun },
  { id: 'Starlink', label: 'Starlink', icon: Wifi },
  { id: 'High-speed Wi-Fi', label: 'High-speed Wi-Fi', icon: Wifi },
  { id: 'Air Conditioning', label: 'Air Conditioning', icon: Wind },
  { id: 'Parking', label: 'Parking', icon: Car },
  { id: 'Kitchen', label: 'Kitchen / Refreshments', icon: Utensils },
  { id: 'CCTV', label: 'CCTV & Security', icon: Shield },
  { id: 'Reception', label: 'Receptionist', icon: Building2 },
  { id: 'Printing', label: 'Printing', icon: Printer },
  { id: 'Projector', label: 'Projector & Screens', icon: Tv },
  { id: 'Soundproofing', label: 'Soundproofing', icon: Volume2 },
  { id: 'Green Screen', label: 'Green Screen', icon: Sparkles },
  { id: 'Professional Lighting', label: 'Professional Lighting', icon: Sparkles },
];

const NIGERIAN_CITIES_AREAS = [
  { group: 'All Nigeria', items: [{ name: 'All Nigeria', value: 'all' }] },
  {
    group: 'Lagos',
    items: [
      { name: 'All Lagos', value: 'Lagos' },
      { name: 'Lekki Phase 1', value: 'Lekki' },
      { name: 'Victoria Island', value: 'Victoria Island' },
      { name: 'Ikoyi', value: 'Ikoyi' },
      { name: 'Yaba Tech Corridor', value: 'Yaba' },
      { name: 'Ikeja GRA', value: 'Ikeja' },
      { name: 'Surulere', value: 'Surulere' },
      { name: 'Lagos Island (Marina)', value: 'Lagos Island' },
    ],
  },
  {
    group: 'Abuja (FCT)',
    items: [
      { name: 'All Abuja', value: 'Abuja' },
      { name: 'Wuse 2', value: 'Wuse' },
      { name: 'Maitama Diplomatic Zone', value: 'Maitama' },
      { name: 'Garki 2', value: 'Garki' },
      { name: 'Jabi Lake', value: 'Jabi' },
    ],
  },
  {
    group: 'Port Harcourt',
    items: [
      { name: 'All Port Harcourt', value: 'Port Harcourt' },
      { name: 'GRA Phase 2', value: 'GRA' },
      { name: 'Trans Amadi', value: 'Trans Amadi' },
    ],
  },
  {
    group: 'Ibadan',
    items: [
      { name: 'All Ibadan', value: 'Ibadan' },
      { name: 'Old Bodija', value: 'Bodija' },
      { name: 'Jericho GRA', value: 'Jericho' },
      { name: 'Dugbe CBD', value: 'Dugbe' },
    ],
  },
];

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  onSelectSpace,
  onBackToHome,
}) => {
  const {
    spaces,
    filters,
    setFilters,
    resetFilters,
    isFavorite,
    toggleFavorite,
    bookingDraft,
    setBookingDraft,
    formatPriceNaira,
    setSelectedSpace,
    setIsCheckoutModalOpen,
    showToast,
  } = useApp();

  // Local view toggle
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isEditSearchOpen, setIsEditSearchOpen] = useState(false);

  // Edit search bar local states
  const [editCity, setEditCity] = useState(filters.city || 'all');
  const [editDate, setEditDate] = useState(bookingDraft.startDate || new Date().toISOString().split('T')[0]);
  const [editTime, setEditTime] = useState(bookingDraft.startTime || '09:00 AM');
  const [editDuration, setEditDuration] = useState<number>(bookingDraft.durationUnits || 4);

  // Quick price state in filter modal
  const [priceRateType, setPriceRateType] = useState<PriceRateType>(filters.priceRateType || 'hourly');
  const [priceMin, setPriceMin] = useState<number>(() => {
    if (filters.priceRateType === 'daily') {
      return filters.minDailyPriceNGN ?? 0;
    }
    return filters.minPriceNGN ?? 0;
  });
  const [priceMax, setPriceMax] = useState<number>(() => {
    if (filters.priceRateType === 'daily') {
      return filters.maxDailyPriceNGN ?? 350000;
    }
    return filters.maxPriceNGN ?? 75000;
  });
  const [minRating, setMinRating] = useState<number>(0);
  const [capacityRange, setCapacityRange] = useState<string>('all');

  // Selected space type
  const [selectedSpaceType, setSelectedSpaceType] = useState<string>(filters.spaceType || 'all');

  // Quick chips
  const [quickInstantOnly, setQuickInstantOnly] = useState<boolean>(filters.instantBookOnly || false);
  const [quickPowerOnly, setQuickPowerOnly] = useState<boolean>(false);
  const [quickStarlinkOnly, setQuickStarlinkOnly] = useState<boolean>(false);
  const [quickUnder5kOnly, setQuickUnder5kOnly] = useState<boolean>(false);
  const [quickACOnly, setQuickACOnly] = useState<boolean>(false);
  const [quickSoundproofOnly, setQuickSoundproofOnly] = useState<boolean>(false);

  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>(filters.sortBy || 'recommended');

  // Apply search edit / filter
  const handleApplySearchEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFilters(prev => ({
      ...prev,
      city: editCity,
      date: editDate,
      startTime: editTime,
      durationHours: editDuration,
      priceRateType,
      minPriceNGN: priceRateType === 'hourly' ? priceMin : (prev.minPriceNGN ?? 0),
      maxPriceNGN: priceRateType === 'hourly' ? priceMax : (prev.maxPriceNGN ?? 75000),
      minDailyPriceNGN: priceRateType === 'daily' ? priceMin : (prev.minDailyPriceNGN ?? 0),
      maxDailyPriceNGN: priceRateType === 'daily' ? priceMax : (prev.maxDailyPriceNGN ?? 350000),
    }));
    setBookingDraft(prev => ({
      ...prev,
      startDate: editDate,
      startTime: editTime,
      durationUnits: editDuration,
      durationType: priceRateType === 'daily' ? 'daily' : 'hourly',
    }));
    setIsEditSearchOpen(false);
    showToast('Search filters updated', 'success');
  };

  const handleResetSearchFilters = () => {
    setEditCity('all');
    setPriceRateType('hourly');
    setPriceMin(0);
    setPriceMax(75000);
    setFilters(prev => ({
      ...prev,
      city: 'all',
      priceRateType: 'hourly',
      minPriceNGN: 0,
      maxPriceNGN: 75000,
      minDailyPriceNGN: 0,
      maxDailyPriceNGN: 350000,
    }));
    showToast('Filters reset to default', 'info');
  };

  // Toggle amenities
  const toggleAmenity = (amenityId: string) => {
    setFilters(prev => {
      const exists = prev.amenities.includes(amenityId);
      const nextAmenities = exists
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId];
      return { ...prev, amenities: nextAmenities };
    });
  };

  // Filter & Sort Logic
  const filteredAndSortedSpaces = useMemo(() => {
    let result = spaces.filter(space => {
      const spaceCity = (space.city || '').toLowerCase();
      const spaceNeighborhood = (space.neighborhood || '').toLowerCase();
      const spaceAddress = (space.address || '').toLowerCase();
      const spaceName = (space.name || '').toLowerCase();
      const spaceTagline = (space.tagline || '').toLowerCase();
      const spacePrimaryCat = (space.primaryCategory || '').toLowerCase();
      const spaceSubcat = (space.subcategory || '').toLowerCase();
      const spaceAmenities = Array.isArray(space.amenities) ? space.amenities : [];

      // 1. Location match
      if (filters.city && filters.city !== 'all') {
        const query = filters.city.toLowerCase();
        const matchesCity =
          spaceCity.includes(query) ||
          spaceNeighborhood.includes(query) ||
          spaceAddress.includes(query);
        if (!matchesCity) return false;
      }

      // 2. Search query match
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesQuery =
          spaceName.includes(q) ||
          spaceTagline.includes(q) ||
          spaceCity.includes(q) ||
          spaceNeighborhood.includes(q) ||
          spacePrimaryCat.includes(q) ||
          spaceSubcat.includes(q) ||
          spaceAmenities.some(a => (a || '').toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // 3. Space Type filter
      if (selectedSpaceType !== 'all') {
        const typeConfig = SPACE_TYPES.find(t => t.id === selectedSpaceType);
        if (typeConfig && typeConfig.subcatMatch.length > 0) {
          const matchSubcat = typeConfig.subcatMatch.some(sc =>
            spaceSubcat.includes(sc.toLowerCase())
          );
          const matchNameOrCat =
            spacePrimaryCat.includes(selectedSpaceType.toLowerCase()) ||
            spaceName.includes(selectedSpaceType.toLowerCase()) ||
            spaceTagline.includes(selectedSpaceType.toLowerCase());

          if (!matchSubcat && !matchNameOrCat) return false;
        }
      }

      // 4. Price filter (Hourly vs Daily)
      if (priceRateType === 'daily') {
        const spaceDailyNGN = space.dailyRateNGN || (space.dailyRate ? space.dailyRate * 1550 : ((space.hourlyRateNGN || space.hourlyRate * 1550) * 7));
        if (priceMin > 0 && spaceDailyNGN < priceMin) {
          return false;
        }
        if (priceMax < 350000 && spaceDailyNGN > priceMax) {
          return false;
        }
      } else {
        const spaceHourlyNGN = space.hourlyRateNGN || (space.hourlyRate * 1550);
        if (priceMin > 0 && spaceHourlyNGN < priceMin) {
          return false;
        }
        if (priceMax < 75000 && spaceHourlyNGN > priceMax) {
          return false;
        }
        if (quickUnder5kOnly && spaceHourlyNGN > 5000) {
          return false;
        }
      }

      // 5. Rating filter
      if (minRating > 0 && space.rating < minRating) {
        return false;
      }

      // 6. Capacity filter
      if (capacityRange === '1-5' && (space.capacity < 1 || space.capacity > 5)) return false;
      if (capacityRange === '6-15' && (space.capacity < 6 || space.capacity > 15)) return false;
      if (capacityRange === '16-50' && (space.capacity < 16 || space.capacity > 50)) return false;
      if (capacityRange === '50+' && space.capacity < 50) return false;

      // 7. Instant book
      if ((quickInstantOnly || filters.instantBookOnly) && !space.instantBook) {
        return false;
      }

      // 8. Nigerian Quick chips
      if (quickPowerOnly) {
        const hasPower = spaceAmenities.some(a =>
          (a || '').toLowerCase().includes('power') ||
          (a || '').toLowerCase().includes('generator') ||
          (a || '').toLowerCase().includes('solar')
        );
        if (!hasPower) return false;
      }

      if (quickStarlinkOnly) {
        const hasStarlink = spaceAmenities.some(a =>
          (a || '').toLowerCase().includes('starlink') ||
          (a || '').toLowerCase().includes('fiber') ||
          (a || '').toLowerCase().includes('wi-fi')
        );
        if (!hasStarlink) return false;
      }

      if (quickACOnly) {
        const hasAC = spaceAmenities.some(a =>
          (a || '').toLowerCase().includes('air conditioning') ||
          (a || '').toLowerCase().includes('ac')
        );
        if (!hasAC) return false;
      }

      if (quickSoundproofOnly) {
        const hasSound = spaceAmenities.some(a =>
          (a || '').toLowerCase().includes('soundproof') ||
          (a || '').toLowerCase().includes('acoustic')
        ) || spaceSubcat.includes('podcast') || spaceSubcat.includes('audio');
        if (!hasSound) return false;
      }

      // 9. Amenity filters
      if (filters.amenities && filters.amenities.length > 0) {
        const hasAll = filters.amenities.every(reqAmenity =>
          spaceAmenities.some(a => (a || '').toLowerCase().includes(reqAmenity.toLowerCase()))
        );
        if (!hasAll) return false;
      }

      return true;
    });

    // Sort
    result = [...result].sort((a, b) => {
      const priceA = a.hourlyRateNGN || (a.hourlyRate * 1550);
      const priceB = b.hourlyRateNGN || (b.hourlyRate * 1550);

      switch (sortBy) {
        case 'price_asc':
          return priceA - priceB;
        case 'rating_desc':
          return b.rating - a.rating;
        case 'popular':
          return b.reviewCount - a.reviewCount;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'nearest':
          return a.city.localeCompare(b.city);
        case 'recommended':
        default:
          // Featured first, then highest rating & review count
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (b.rating * b.reviewCount) - (a.rating * a.reviewCount);
      }
    });

    return result;
  }, [
    spaces,
    filters,
    selectedSpaceType,
    priceMax,
    minRating,
    capacityRange,
    quickInstantOnly,
    quickPowerOnly,
    quickStarlinkOnly,
    quickUnder5kOnly,
    quickACOnly,
    quickSoundproofOnly,
    sortBy,
  ]);

  // Helper to check creator category
  const isCreatorSpace = (space: Space) => {
    return (
      space.primaryCategory === 'CREATE' ||
      ['podcast_studios', 'content_studios', 'photography_studios', 'video_studios', 'music_studios', 'green_screen_studios'].includes(space.subcategory)
    );
  };

  // Helper for creator badge label and icon
  const getCreatorDetails = (space: Space) => {
    const sub = space.subcategory.toLowerCase();
    if (sub.includes('podcast')) {
      return {
        label: '🎙️ Podcast Studio',
        highlights: 'Acoustic Soundproof · Shure Mics · Rodecaster',
      };
    }
    if (sub.includes('photo')) {
      return {
        label: '📸 Photography Studio',
        highlights: 'Cyclorama Wall · Godox Strobes · Vanity Suite',
      };
    }
    if (sub.includes('video') || sub.includes('content')) {
      return {
        label: '🎥 Content Creator Studio',
        highlights: '4K Cameras · Professional Lighting · Green Screen · AC',
      };
    }
    return {
      label: '🎬 Creator Studio',
      highlights: '4K Cinema Gear · Studio Lighting · Soundproof',
    };
  };

  // Handle direct booking CTA
  const handleInstantBook = (space: Space, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSpace(space);
    setIsCheckoutModalOpen(true);
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedSpaceType !== 'all') count++;
    if (priceMin > 0 || priceMax < 75000) count++;
    if (minRating > 0) count++;
    if (capacityRange !== 'all') count++;
    if (quickInstantOnly) count++;
    if (quickPowerOnly) count++;
    if (quickStarlinkOnly) count++;
    if (quickUnder5kOnly) count++;
    if (quickACOnly) count++;
    if (quickSoundproofOnly) count++;
    count += filters.amenities.length;
    return count;
  }, [
    selectedSpaceType,
    priceMin,
    priceMax,
    minRating,
    capacityRange,
    quickInstantOnly,
    quickPowerOnly,
    quickStarlinkOnly,
    quickUnder5kOnly,
    quickACOnly,
    quickSoundproofOnly,
    filters.amenities,
  ]);

  // Location display string
  const locationHeaderTitle = useMemo(() => {
    if (!filters.city || filters.city === 'all') return 'Spaces across Nigeria';
    return `Spaces in ${filters.city}`;
  }, [filters.city]);

  // Formatted date string
  const formattedSearchDate = useMemo(() => {
    const d = bookingDraft.startDate || new Date().toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    if (d === today) return 'Today';
    const dateObj = new Date(d);
    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }, [bookingDraft.startDate]);

  return (
    <div className="w-full min-h-screen bg-[#0D0D0D] text-white">
      {/* 1. TOP STICKY SEARCH SUMMARY BAR */}
      <section aria-label="Search summary bar" className="sticky top-16 sm:top-20 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-[#222222] shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Compact Search summary chips container */}
            <div
              id="search-summary-bar-pill"
              onClick={() => setIsEditSearchOpen(!isEditSearchOpen)}
              className="flex-1 flex flex-wrap items-center gap-2 sm:gap-3 bg-[#1A1A1A] hover:bg-[#222222] border border-[#2D2D2D] hover:border-[#00C878]/60 rounded-2xl px-3.5 py-2 cursor-pointer transition-all duration-200 shadow-sm"
            >
              {/* Location Pill */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <MapPin className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
                <span>{filters.city === 'all' ? 'Nigeria (All)' : filters.city}</span>
              </div>

              <span className="text-[#3A3A3A] hidden sm:inline">•</span>

              {/* Date Pill */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300">
                <Calendar className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
                <span>{formattedSearchDate}</span>
              </div>

              <span className="text-[#3A3A3A] hidden sm:inline">•</span>

              {/* Time Pill */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300">
                <Clock className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
                <span>{bookingDraft.startTime || '9:00 AM'}</span>
              </div>

              <span className="text-[#3A3A3A] hidden sm:inline">•</span>

              {/* Duration Pill */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300">
                <Timer className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
                <span>{bookingDraft.durationUnits || 4} hours</span>
              </div>

              {/* Price Filter Pill (if active) */}
              {((priceRateType === 'hourly' && (priceMin > 0 || priceMax < 75000)) ||
                (priceRateType === 'daily' && (priceMin > 0 || priceMax < 350000))) && (
                <>
                  <span className="text-[#3A3A3A] hidden sm:inline">•</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#00C878] bg-[#00C878]/10 px-2 py-0.5 rounded-lg border border-[#00C878]/30">
                    <span>
                      ₦{priceMin.toLocaleString()} - {priceMax >= (priceRateType === 'hourly' ? 75000 : 350000) ? (priceRateType === 'hourly' ? '₦75k+' : '₦350k+') : `₦${priceMax.toLocaleString()}`} /{priceRateType === 'hourly' ? 'hr' : 'day'}
                    </span>
                  </div>
                </>
              )}

              {/* Filter indicator (Replaced Edit with Filter) */}
              <div className="ml-auto text-[11px] font-bold text-[#00C878] flex items-center gap-1.5 bg-[#00C878]/10 hover:bg-[#00C878]/20 px-2.5 py-1 rounded-xl transition-colors">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#00C878]" />
                <span>Filter</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isEditSearchOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Action Buttons: Filter CTA + Map/List View Toggle */}
            <div className="flex items-center gap-2">
              <button
                id="search-summary-btn"
                onClick={() => setIsEditSearchOpen(!isEditSearchOpen)}
                className="bg-[#00C878] hover:bg-[#00B06A] text-[#0A0A0A] font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#00C878]/15 flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>

              {/* Map / List Toggle Buttons (Exact Step 2 Requirement) */}
              <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-0.5 rounded-xl flex items-center shrink-0">
                <button
                  id="view-toggle-list-btn"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'list'
                      ? 'bg-[#282828] text-[#00C878] shadow-sm'
                      : 'text-[#888888] hover:text-white'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>

                <button
                  id="view-toggle-map-btn"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'map'
                      ? 'bg-[#282828] text-[#00C878] shadow-sm'
                      : 'text-[#888888] hover:text-white'
                  }`}
                  title="Interactive Map View"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Expandable In-Place Search & Price Filter Drawer */}
          {isEditSearchOpen && (
            <div
              id="search-modifier-drawer"
              className="mt-3.5 pt-3.5 border-t border-[#262626] animate-in fade-in slide-in-from-top-3 duration-200 space-y-3"
            >
              {/* Row 1: 4 Core Search Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* 1. Location */}
                <div className="bg-[#1C1C1C] border border-[#333333] focus-within:border-[#00C878] rounded-xl px-3 py-2">
                  <label className="block text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                    Location / City
                  </label>
                  <select
                    value={editCity}
                    onChange={e => setEditCity(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer mt-0.5"
                  >
                    {NIGERIAN_CITIES_AREAS.map(group => (
                      <optgroup key={group.group} label={group.group} className="bg-[#1F1F1F] text-white">
                        {group.items.map(item => (
                          <option key={item.value} value={item.value}>
                            {item.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* 2. Date */}
                <div className="bg-[#1C1C1C] border border-[#333333] focus-within:border-[#00C878] rounded-xl px-3 py-2">
                  <label className="block text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer mt-0.5 [color-scheme:dark]"
                  />
                </div>

                {/* 3. Start Time */}
                <div className="bg-[#1C1C1C] border border-[#333333] focus-within:border-[#00C878] rounded-xl px-3 py-2">
                  <label className="block text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                    Start Time
                  </label>
                  <select
                    value={editTime}
                    onChange={e => setEditTime(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer mt-0.5"
                  >
                    {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'].map(t => (
                      <option key={t} value={t} className="bg-[#1F1F1F] text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Duration */}
                <div className="bg-[#1C1C1C] border border-[#333333] focus-within:border-[#00C878] rounded-xl px-3 py-2">
                  <label className="block text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                    Duration
                  </label>
                  <select
                    value={editDuration}
                    onChange={e => setEditDuration(Number(e.target.value))}
                    className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer mt-0.5"
                  >
                    {[1, 2, 3, 4, 6, 8, 10, 12].map(hours => (
                      <option key={hours} value={hours} className="bg-[#1F1F1F] text-white">
                        {hours} {hours === 1 ? 'hour' : 'hours'} {hours >= 8 ? '(Full Day)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Price Filter Module */}
              <PriceRangeSlider
                rateType={priceRateType}
                minPrice={priceMin}
                maxPrice={priceMax}
                onChange={(min, max, rate) => {
                  setPriceMin(min);
                  setPriceMax(max);
                  setPriceRateType(rate);
                }}
                onRateTypeChange={rate => {
                  setPriceRateType(rate);
                }}
              />

              {/* Quick Update Button Row */}
              <div className="flex items-center justify-between gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleResetSearchFilters}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditSearchOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplySearchEdit()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00C878] hover:bg-[#00B06A] text-[#0A0A0A] transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply & Update Results</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. PAGE TITLE & HEADER */}
      <section aria-label="Search header summary" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {/* Breadcrumb / Back button */}
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs text-[#888888] hover:text-[#00C878] transition-colors mb-2 group font-medium"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </button>

            {/* Main Title (Exact Step 2 Requirement) */}
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {locationHeaderTitle}
            </h1>

            {/* Subtitle (Exact Step 2 Requirement) */}
            <p className="text-xs sm:text-sm text-[#9A9A9A] mt-1 font-medium">
              <span className="text-[#00C878] font-bold">{filteredAndSortedSpaces.length} spaces available</span> · {formattedSearchDate}
            </p>
          </div>

          {/* Sort By Control */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-[#888888] font-medium whitespace-nowrap">Sort by:</span>
            <div className="relative">
              <select
                id="search-sort-dropdown"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="bg-[#171717] border border-[#2D2D2D] hover:border-[#00C878]/50 text-xs font-bold text-white rounded-xl pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:border-[#00C878] transition-colors"
              >
                <option value="recommended">Recommended (Default)</option>
                <option value="price_asc">Lowest Price</option>
                <option value="rating_desc">Highest Rated</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="nearest">Nearest</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#888888] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. HORIZONTAL FILTER BAR */}
      <section aria-label="Filters bar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        {/* Primary Space Type Horizontal Filter Row (Scrollable on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {SPACE_TYPES.map(type => {
            const Icon = type.icon;
            const isSelected = selectedSpaceType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedSpaceType(type.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 border ${
                  isSelected
                    ? 'bg-[#00C878] text-[#0A0A0A] border-[#00C878] shadow-md shadow-[#00C878]/20 scale-105'
                    : 'bg-[#171717] text-[#CCCCCC] border-[#2A2A2A] hover:border-[#444444] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Quick Nigerian Filter Chips Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1.5 pb-2">
          {/* Filter Modal Trigger */}
          <button
            id="all-filters-modal-btn"
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
              activeFilterCount > 0
                ? 'bg-[#00C878]/10 text-[#00C878] border-[#00C878]/60'
                : 'bg-[#171717] text-white border-[#2A2A2A] hover:border-[#444444]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#00C878] text-[#0A0A0A] text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Instant Booking Chip */}
          <button
            onClick={() => setQuickInstantOnly(!quickInstantOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors shrink-0 ${
              quickInstantOnly
                ? 'bg-[#00C878]/15 text-[#00C878] border-[#00C878]'
                : 'bg-[#171717] text-[#999999] border-[#282828] hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 text-[#00C878]" />
            <span>Instant Book</span>
          </button>

          {/* 24/7 Power Chip */}
          <button
            onClick={() => setQuickPowerOnly(!quickPowerOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors shrink-0 ${
              quickPowerOnly
                ? 'bg-[#00C878]/15 text-[#00C878] border-[#00C878]'
                : 'bg-[#171717] text-[#999999] border-[#282828] hover:text-white'
            }`}
          >
            <span>⚡ 24/7 Power</span>
          </button>

          {/* Starlink Chip */}
          <button
            onClick={() => setQuickStarlinkOnly(!quickStarlinkOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors shrink-0 ${
              quickStarlinkOnly
                ? 'bg-[#00C878]/15 text-[#00C878] border-[#00C878]'
                : 'bg-[#171717] text-[#999999] border-[#282828] hover:text-white'
            }`}
          >
            <span>🚀 Starlink</span>
          </button>

          {/* Air Conditioning Chip */}
          <button
            onClick={() => setQuickACOnly(!quickACOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors shrink-0 ${
              quickACOnly
                ? 'bg-[#00C878]/15 text-[#00C878] border-[#00C878]'
                : 'bg-[#171717] text-[#999999] border-[#282828] hover:text-white'
            }`}
          >
            <span>❄ AC</span>
          </button>

          {/* Soundproofing Chip */}
          <button
            onClick={() => setQuickSoundproofOnly(!quickSoundproofOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors shrink-0 ${
              quickSoundproofOnly
                ? 'bg-[#00C878]/15 text-[#00C878] border-[#00C878]'
                : 'bg-[#171717] text-[#999999] border-[#282828] hover:text-white'
            }`}
          >
            <span>🔇 Soundproof</span>
          </button>

          {/* Under 5k Chip */}
          <button
            onClick={() => setQuickUnder5kOnly(!quickUnder5kOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors shrink-0 ${
              quickUnder5kOnly
                ? 'bg-[#00C878]/15 text-[#00C878] border-[#00C878]'
                : 'bg-[#171717] text-[#999999] border-[#282828] hover:text-white'
            }`}
          >
            <span>💰 Under ₦5,000/hr</span>
          </button>

          {/* Clear all active filters pill if any */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setSelectedSpaceType('all');
                setQuickInstantOnly(false);
                setQuickPowerOnly(false);
                setQuickStarlinkOnly(false);
                setQuickACOnly(false);
                setQuickSoundproofOnly(false);
                setQuickUnder5kOnly(false);
                setPriceMin(0);
                setPriceMax(75000);
                setMinRating(0);
                setCapacityRange('all');
                resetFilters();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#888888] hover:text-white hover:bg-[#202020] transition-colors shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </section>

      {/* 4. RESULTS BODY: LIST OR MAP */}
      <section aria-label="Results listing or map" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {viewMode === 'map' ? (
          /* Interactive Nigerian Map View */
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-3xl overflow-hidden shadow-2xl">
            <ExploreMapView
              spaces={filteredAndSortedSpaces}
              onSelectSpace={onSelectSpace}
              height="650px"
              isFullWidth={true}
            />
          </div>
        ) : (
          /* LISTING CARDS GRID */
          <>
            {filteredAndSortedSpaces.length === 0 ? (
              /* Empty State */
              <div className="bg-[#171717] border border-[#2A2A2A] rounded-3xl p-12 text-center max-w-lg mx-auto my-8">
                <div className="w-14 h-14 rounded-2xl bg-[#222222] border border-[#333333] flex items-center justify-center mx-auto mb-4 text-[#00C878]">
                  <Compass className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-white">No spaces match your exact search</h2>
                <p className="text-xs text-[#999999] mt-1.5 leading-relaxed">
                  Try clearing some amenity filters, expanding your location, or adjusting your price ceiling to see available spaces.
                </p>
                <button
                  onClick={() => {
                    setSelectedSpaceType('all');
                    setQuickInstantOnly(false);
                    setQuickPowerOnly(false);
                    setQuickStarlinkOnly(false);
                    setQuickACOnly(false);
                    setQuickSoundproofOnly(false);
                    setQuickUnder5kOnly(false);
                    setPriceMin(0);
                    setPriceMax(75000);
                    setMinRating(0);
                    setCapacityRange('all');
                    resetFilters();
                  }}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00B06A] text-[#0A0A0A] font-bold text-xs transition-all shadow-md active:scale-95"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(filteredAndSortedSpaces || []).map(space => {
                  const isCreator = isCreatorSpace(space);
                  const creatorInfo = isCreator ? getCreatorDetails(space) : null;
                  const isSaved = isFavorite(space.id);
                  const hourlyNaira = space.hourlyRateNGN || Math.round(space.hourlyRate * 1550);
                  const dailyNaira = space.dailyRateNGN || Math.round(space.dailyRate * 1550);

                  return (
                    <article
                      key={space.id}
                      id={`space-card-${space.id}`}
                      onClick={() => onSelectSpace(space)}
                      className={`group relative bg-[#171717] rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:translate-y-[-2px] ${
                        isCreator
                          ? 'border-[#00C878]/30 hover:border-[#00C878] bg-gradient-to-b from-[#171717] via-[#171717] to-[#0D1F17]'
                          : 'border-[#262626] hover:border-[#404040]'
                      }`}
                    >
                      {/* Image Header with Heart & Verified Badge */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#222222]">
                        <img
                          src={space.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80'}
                          alt={space.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top Left: Verified Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0D0D0D]/85 backdrop-blur-md text-[11px] font-bold text-[#00C878] border border-[#00C878]/30 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified</span>
                          </span>

                          {isCreator && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00C878] text-[10px] font-black text-[#0A0A0A] shadow-sm uppercase tracking-wider">
                              Creator Hub
                            </span>
                          )}
                        </div>

                        {/* Top Right: Favourite / Heart Button */}
                        <button
                          type="button"
                          aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
                          onClick={e => {
                            e.stopPropagation();
                            toggleFavorite(space.id);
                          }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#0D0D0D]/75 hover:bg-[#0D0D0D] backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-transform active:scale-90"
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              isSaved
                                ? 'fill-[#00C878] text-[#00C878]'
                                : 'text-white/80 hover:text-white'
                            }`}
                          />
                        </button>

                        {/* Availability Pill on Image Bottom */}
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0D0D0D]/90 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-[#00C878] animate-pulse" />
                            <span>Available today</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Content Area */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Row 1: Space Type & Rating */}
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-[#9A9A9A] uppercase tracking-wider text-[10px]">
                              {isCreator ? (creatorInfo?.label || 'Creator Studio') : (space.subcategory || space.primaryCategory || 'Workspace').replace(/_/g, ' ')}
                            </span>

                            {/* Rating */}
                            <div className="flex items-center gap-1 text-white font-bold">
                              <Star className="w-3.5 h-3.5 fill-[#D6A83A] text-[#D6A83A]" />
                              <span>{(space.rating || 4.9).toFixed(1)}</span>
                              <span className="text-[#777777] font-normal text-[11px]">
                                ({space.reviewCount || 12})
                              </span>
                            </div>
                          </div>

                          {/* Row 2: Title */}
                          <h3 className="mt-1.5 text-base font-bold text-white group-hover:text-[#00C878] transition-colors line-clamp-1">
                            {space.name}
                          </h3>

                          {/* Row 3: Location */}
                          <p className="text-xs text-[#8E8E8E] flex items-center gap-1 mt-1 line-clamp-1">
                            <MapPin className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
                            <span>{space.neighborhood || space.address}, {space.city}</span>
                          </p>

                          {/* Special Creator Gear Information Callout (Step 8 Requirement) */}
                          {isCreator && creatorInfo && (
                            <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-[#00C878]/10 border border-[#00C878]/25 text-[11px] font-semibold text-[#00E58D] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
                              <span className="line-clamp-1">{creatorInfo.highlights}</span>
                            </div>
                          )}

                          {/* Row 4: Key Nigerian Amenities Chips (Step 7 Requirement) */}
                          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-[#A5A5A5]">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#222222] border border-[#2D2D2D]">
                              ⚡ 24/7 Power
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#222222] border border-[#2D2D2D]">
                              🚀 Starlink
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#222222] border border-[#2D2D2D]">
                              ❄ AC
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#222222] border border-[#2D2D2D]">
                              🅿 Parking
                            </span>
                          </div>
                        </div>

                        {/* Card Bottom: Pricing & CTA Button */}
                        <div className="mt-4 pt-3.5 border-t border-[#262626] flex items-center justify-between gap-3">
                          {/* Price */}
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-base sm:text-lg font-black text-white">
                                {formatPriceNaira(hourlyNaira)}
                              </span>
                              <span className="text-[11px] text-[#888888] font-medium">/ hr</span>
                            </div>
                            {dailyNaira > 0 && (
                              <div className="text-[11px] text-[#888888]">
                                {formatPriceNaira(dailyNaira)} / day
                              </div>
                            )}
                          </div>

                          {/* Action Button: Book Now / View Space */}
                          <div className="flex items-center gap-1.5">
                            {space.instantBook ? (
                              <button
                                type="button"
                                onClick={e => handleInstantBook(space, e)}
                                className="px-3.5 py-2 rounded-xl bg-[#00C878] hover:bg-[#00B06A] text-[#0A0A0A] font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1"
                              >
                                <Zap className="w-3.5 h-3.5 fill-[#0A0A0A]" />
                                <span>Book Now</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onSelectSpace(space)}
                                className="px-3.5 py-2 rounded-xl bg-[#282828] hover:bg-[#00C878] hover:text-[#0A0A0A] text-white font-bold text-xs transition-all"
                              >
                                View Space
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* 5. ALL FILTERS MODAL (Comprehensive Filter Panel) */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            id="all-filters-modal"
            className="bg-[#171717] border border-[#2D2D2D] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#282828] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#00C878]" />
                <h2 className="text-base font-bold text-white">Filter Spaces</h2>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#222222] hover:bg-[#333333] flex items-center justify-center text-[#999999] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* 1. Price Range Slider (Hourly or Daily in Nigerian Naira ₦) */}
              <PriceRangeSlider
                rateType={priceRateType}
                minPrice={priceMin}
                maxPrice={priceMax}
                onChange={(min, max, rate) => {
                  setPriceMin(min);
                  setPriceMax(max);
                  setPriceRateType(rate);
                }}
                onRateTypeChange={rate => {
                  setPriceRateType(rate);
                }}
              />

              {/* 2. Space Type */}
              <div>
                <h3 className="font-bold text-white mb-2.5">Space Type</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SPACE_TYPES.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedSpaceType(type.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        selectedSpaceType === type.id
                          ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878]'
                          : 'bg-[#202020] border-[#2A2A2A] text-stone-300 hover:border-[#444444]'
                      }`}
                    >
                      <type.icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-semibold truncate">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Nigerian Amenities (Step 5 Requirement) */}
              <div>
                <h3 className="font-bold text-white mb-2.5">Nigerian Power & Tech Essentials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {NIGERIAN_AMENITIES.map(amenity => {
                    const isChecked = filters.amenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-colors ${
                          isChecked
                            ? 'bg-[#00C878]/15 border-[#00C878] text-white'
                            : 'bg-[#202020] border-[#2A2A2A] text-[#AAAAAA] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <amenity.icon className="w-3.5 h-3.5 text-[#00C878]" />
                          <span className="font-semibold">{amenity.label}</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-[#00C878] border-[#00C878]' : 'border-[#444444]'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-[#0A0A0A] stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Capacity */}
              <div>
                <h3 className="font-bold text-white mb-2.5">Capacity</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'Any size' },
                    { id: '1-5', label: '1 - 5 people' },
                    { id: '6-15', label: '6 - 15 people' },
                    { id: '16-50', label: '16 - 50 people' },
                    { id: '50+', label: '50+ people' },
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCapacityRange(c.id)}
                      className={`px-3.5 py-1.5 rounded-xl border font-semibold transition-colors ${
                        capacityRange === c.id
                          ? 'bg-[#00C878] text-[#0A0A0A] border-[#00C878]'
                          : 'bg-[#202020] border-[#2A2A2A] text-stone-300 hover:text-white'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Rating */}
              <div>
                <h3 className="font-bold text-white mb-2.5">Minimum Rating</h3>
                <div className="flex items-center gap-2">
                  {[0, 4.5, 4.8, 5.0].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setMinRating(r)}
                      className={`px-3.5 py-1.5 rounded-xl border font-semibold flex items-center gap-1 transition-colors ${
                        minRating === r
                          ? 'bg-[#00C878] text-[#0A0A0A] border-[#00C878]'
                          : 'bg-[#202020] border-[#2A2A2A] text-stone-300 hover:text-white'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      <span>{r === 0 ? 'Any' : `${r}+`}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#282828] flex items-center justify-between bg-[#141414] rounded-b-3xl">
              <button
                type="button"
                onClick={() => {
                  setSelectedSpaceType('all');
                  setQuickInstantOnly(false);
                  setQuickPowerOnly(false);
                  setQuickStarlinkOnly(false);
                  setQuickACOnly(false);
                  setQuickSoundproofOnly(false);
                  setQuickUnder5kOnly(false);
                  setPriceMax(50000);
                  setMinRating(0);
                  setCapacityRange('all');
                  resetFilters();
                }}
                className="text-xs text-[#888888] hover:text-white font-semibold"
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#00C878] hover:bg-[#00B06A] text-[#0A0A0A] font-bold text-xs shadow-md active:scale-95"
              >
                Show {filteredAndSortedSpaces.length} spaces
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Users,
  Filter,
  SlidersHorizontal,
  Star,
  CheckCircle2,
  Sparkles,
  Zap,
  Wifi,
  Wind,
  ShieldCheck,
  Video,
  Camera,
  Mic,
  Briefcase,
  Building2,
  Tv,
  Coffee,
  Car,
  Volume2,
  Layers,
  ArrowRight,
  TrendingUp,
  Heart,
  RotateCcw,
  Check,
  LayoutGrid,
  Columns,
  ChevronDown,
  X,
  Lock,
  Compass,
  LocateFixed,
  Navigation,
  Map as MapIcon,
  Maximize2,
  Crosshair,
  Loader2,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Space, PrimaryCategory, CurrencyCode } from '../types';
import { ExploreMapView } from './ExploreMapView';
import { OfisLogo } from './OfisLogo';
import { PriceRangeSlider, PriceRateType } from './PriceRangeSlider';

interface SpaceListProps {
  onSelectSpace: (space: Space) => void;
  onNavigateToResults?: () => void;
}

// Preset Vicinity Hubs across Nigeria with spatial coordinates
interface VicinityHub {
  id: string;
  name: string;
  shortName: string;
  city: string;
  lat: number;
  lng: number;
  badge: string;
  popular?: boolean;
}

const NIGERIAN_VICINITIES: VicinityHub[] = [
  { id: 'lekki', name: 'Lekki Phase 1 / Admiralty', shortName: 'Lekki Phase 1', city: 'Lekki', lat: 6.4474, lng: 3.4735, badge: 'Lagos Island', popular: true },
  { id: 'vi', name: 'Victoria Island / Adeola Odeku', shortName: 'Victoria Island', city: 'Victoria Island', lat: 6.4281, lng: 3.4219, badge: 'Financial Core', popular: true },
  { id: 'yaba', name: 'Yaba Tech Belt / Herbert Macaulay', shortName: 'Yaba Tech Hub', city: 'Yaba', lat: 6.5095, lng: 3.3711, badge: 'Tech Cluster', popular: true },
  { id: 'ikeja', name: 'Ikeja GRA / Allen Avenue', shortName: 'Ikeja GRA', city: 'Ikeja', lat: 6.6018, lng: 3.3515, badge: 'Lagos Mainland', popular: true },
  { id: 'ikoyi', name: 'Ikoyi / Osborne / Banana Island', shortName: 'Ikoyi', city: 'Ikoyi', lat: 6.4549, lng: 3.4358, badge: 'High End' },
  { id: 'abuja', name: 'Abuja / Maitama & Wuse 2', shortName: 'Abuja Central', city: 'Abuja', lat: 9.0765, lng: 7.4934, badge: 'Federal Capital', popular: true },
  { id: 'ph', name: 'Port Harcourt / GRA Phase 2', shortName: 'Port Harcourt', city: 'Port Harcourt', lat: 4.8156, lng: 7.0498, badge: 'Oil City' },
  { id: 'ibadan', name: 'Ibadan / Bodija & Ring Road', shortName: 'Ibadan', city: 'Ibadan', lat: 7.4215, lng: 3.9056, badge: 'Oyo State' },
];

// Haversine distance calculator in Kilometers
function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const SpaceList: React.FC<SpaceListProps> = ({ onSelectSpace, onNavigateToResults }) => {
  const {
    spaces,
    filters,
    setFilters,
    setCategoryFilter,
    resetFilters,
    currentCurrency,
    formatPrice,
    isFavorite,
    toggleFavorite,
    openAiModal,
    bookingDraft,
    setBookingDraft,
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'split' | 'map'>('grid');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [highlightedSpaceId, setHighlightedSpaceId] = useState<string | null>(null);

  // Vicinity & Proximity state
  const [activeVicinity, setActiveVicinity] = useState<VicinityHub | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);
  const [mapCategoryFilter, setMapCategoryFilter] = useState<string>('all');

  // Search form local states
  const [searchLocation, setSearchLocation] = useState(filters.city === 'all' ? '' : filters.city);
  const [searchDate, setSearchDate] = useState(bookingDraft.startDate || new Date().toISOString().split('T')[0]);
  const [searchStartTime, setSearchStartTime] = useState(bookingDraft.startTime || '09:00 AM');
  const [searchEndTime, setSearchEndTime] = useState(bookingDraft.endTime || '01:00 PM');
  const [searchSpaceType, setSearchSpaceType] = useState<string>('all');
  const [searchCapacity, setSearchCapacity] = useState<string>('all');

  // Quick filter tags
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  const nigerianCities = [
    'all',
    'Lekki',
    'Victoria Island',
    'Yaba',
    'Ikeja',
    'Ikoyi',
    'Abuja',
    'Port Harcourt',
    'Ibadan',
    'Benin City',
  ];

  // 8 High-demand Space Categories
  const spaceCategories = [
    { id: 'all', label: 'All Spaces', icon: Compass, categoryType: null, subcatMatch: null },
    { id: 'coworking', label: 'Coworking Desks', icon: Users, categoryType: 'WORK', subcatMatch: 'coworking_desks' },
    { id: 'office', label: 'Private Offices', icon: Briefcase, categoryType: 'WORK', subcatMatch: 'private_offices' },
    { id: 'meeting', label: 'Meeting & Boardrooms', icon: Building2, categoryType: 'MEET', subcatMatch: 'meeting_rooms' },
    { id: 'podcast', label: 'Podcast Studios', icon: Mic, categoryType: 'CREATE', subcatMatch: 'podcast_studios' },
    { id: 'photo', label: 'Photo Studios', icon: Camera, categoryType: 'CREATE', subcatMatch: 'photography_studios' },
    { id: 'video', label: 'Creator & Video Hubs', icon: Video, categoryType: 'CREATE', subcatMatch: 'video_studios' },
    { id: 'event', label: 'Event & Training', icon: Layers, categoryType: 'HOST', subcatMatch: 'event_spaces' },
  ];

  // Compute distance for a space from currently selected vicinity or user GPS location
  const getSpaceDistance = useCallback((space: Space): number | null => {
    const originLat = userLocation?.lat ?? activeVicinity?.lat;
    const originLng = userLocation?.lng ?? activeVicinity?.lng;
    if (originLat === undefined || originLng === undefined || !space.coordinates) return null;
    return getHaversineDistanceKm(originLat, originLng, space.coordinates.lat, space.coordinates.lng);
  }, [userLocation, activeVicinity]);

  // Handle GPS "Locate Near Me"
  const handleLocateVicinity = () => {
    setIsLocating(true);
    setLocationToast(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setIsLocating(false);
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: 'Your Current GPS Vicinity',
          };
          setUserLocation(coords);
          setActiveVicinity(null);
          setQuickFilter('near_me');
          setLocationToast('📍 Found your location! Showing closest spaces first.');
          setTimeout(() => setLocationToast(null), 4000);
        },
        err => {
          setIsLocating(false);
          // Fallback to Lekki Phase 1 hub if permission denied or unavailable
          const fallback = NIGERIAN_VICINITIES[0];
          setActiveVicinity(fallback);
          setUserLocation({
            lat: fallback.lat,
            lng: fallback.lng,
            label: `${fallback.name} (Vicinity Preset)`,
          });
          setQuickFilter('near_me');
          setLocationToast(`📍 Set vicinity to ${fallback.shortName}. Showing closest spaces.`);
          setTimeout(() => setLocationToast(null), 4000);
        },
        { timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      const fallback = NIGERIAN_VICINITIES[0];
      setActiveVicinity(fallback);
      setUserLocation({
        lat: fallback.lat,
        lng: fallback.lng,
        label: `${fallback.name} (Vicinity Preset)`,
      });
      setQuickFilter('near_me');
      setLocationToast(`📍 Set vicinity to ${fallback.shortName}.`);
      setTimeout(() => setLocationToast(null), 4000);
    }
  };

  const handleSelectVicinity = (vic: VicinityHub) => {
    if (activeVicinity?.id === vic.id) {
      setActiveVicinity(null);
      setUserLocation(null);
      setQuickFilter(null);
    } else {
      setActiveVicinity(vic);
      setUserLocation({
        lat: vic.lat,
        lng: vic.lng,
        label: vic.name,
      });
      setQuickFilter('near_me');
      setLocationToast(`📍 Centered on ${vic.shortName}. Showing closest available desks.`);
      setTimeout(() => setLocationToast(null), 4000);
    }
  };

  // Filter logic
  const filteredSpaces = useMemo(() => {
    const list = spaces.filter(space => {
      // 1. City / Location match
      if (filters.city !== 'all') {
        const queryCity = filters.city.toLowerCase();
        const matchesCity =
          (space.city || '').toLowerCase().includes(queryCity) ||
          (space.neighborhood && space.neighborhood.toLowerCase().includes(queryCity)) ||
          (space.address || '').toLowerCase().includes(queryCity);
        if (!matchesCity) return false;
      }

      // 2. Search query match
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesQuery =
          (space.name || '').toLowerCase().includes(q) ||
          (space.tagline || '').toLowerCase().includes(q) ||
          (space.city || '').toLowerCase().includes(q) ||
          (space.neighborhood && space.neighborhood.toLowerCase().includes(q)) ||
          (space.primaryCategory || '').toLowerCase().includes(q) ||
          (space.subcategory && space.subcategory.toLowerCase().includes(q)) ||
          (space.amenities || []).some(a => (a || '').toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // 3. Category match
      if (filters.category !== 'all') {
        if (space.primaryCategory !== filters.category) return false;
      }

      // 4. Amenities match
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity =>
          (space.amenities || []).some(a => (a || '').toLowerCase().includes(amenity.toLowerCase()))
        );
        if (!hasAllAmenities) return false;
      }

      // 5. Price filter (Hourly vs Daily)
      const isDaily = filters.priceRateType === 'daily';
      if (isDaily) {
        const spaceDailyNGN = space.dailyRateNGN || (space.dailyRate ? space.dailyRate * 1550 : ((space.hourlyRateNGN || space.hourlyRate * 1550) * 7));
        const minDaily = filters.minDailyPriceNGN ?? 0;
        const maxDaily = filters.maxDailyPriceNGN ?? 350000;
        if (minDaily > 0 && spaceDailyNGN < minDaily) return false;
        if (maxDaily < 350000 && spaceDailyNGN > maxDaily) return false;
      } else {
        const spaceHourlyNGN = space.hourlyRateNGN || (space.hourlyRate * 1550);
        const minHourly = filters.minPriceNGN ?? 0;
        const maxHourly = filters.maxPriceNGN ?? 75000;
        if (minHourly > 0 && spaceHourlyNGN < minHourly) return false;
        if (maxHourly < 75000 && spaceHourlyNGN > maxHourly) return false;
      }

      // 6. Quick filter rules
      if (quickFilter === 'under_5k') {
        if (space.hourlyRateNGN > 5000) return false;
      } else if (quickFilter === 'power_247') {
        if (!(space.amenities || []).some(a => a.includes('Power') || a.includes('Generator') || a.includes('Solar'))) return false;
      } else if (quickFilter === 'starlink') {
        if (!(space.amenities || []).some(a => a.includes('Starlink') || a.includes('Internet') || a.includes('Wi-Fi'))) return false;
      } else if (quickFilter === 'creator') {
        if (!['podcast_studio', 'photo_studio', 'video_studio'].includes(space.primaryCategory)) return false;
      } else if (quickFilter === 'private') {
        if (!['private_office', 'meeting_room'].includes(space.primaryCategory)) return false;
      }

      return true;
    });

    // If near_me is active or user location set, sort by distance ascending
    if ((quickFilter === 'near_me' || userLocation || activeVicinity) && (userLocation || activeVicinity)) {
      return [...list].sort((a, b) => {
        const distA = getSpaceDistance(a) ?? 9999;
        const distB = getSpaceDistance(b) ?? 9999;
        return distA - distB;
      });
    }

    return list;
  }, [spaces, filters, quickFilter, userLocation, activeVicinity, getSpaceDistance]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      city: searchLocation ? searchLocation : 'all',
      searchQuery: searchLocation ? searchLocation : '',
      spaceType: searchSpaceType || 'all',
      date: searchDate,
      startTime: searchStartTime,
    }));
    setBookingDraft(prev => ({
      ...prev,
      startDate: searchDate,
      startTime: searchStartTime,
      endTime: searchEndTime,
      durationUnits: 4,
    }));
    if (onNavigateToResults) {
      onNavigateToResults();
    }
  };

  const totalAvailableDesks = useMemo(() => {
    return filteredSpaces.reduce((acc, s) => acc + (s.desks || []).filter(d => d.status === 'available').length, 0);
  }, [filteredSpaces]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white relative pb-20">
      {/* Toast notification for Vicinity */}
      {locationToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#063B2A] text-[#00C878] border border-[#00C878]/50 px-4 py-2 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <LocateFixed className="w-4 h-4 animate-spin text-[#00C878]" />
          <span>{locationToast}</span>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden bg-radial from-[#063B2A]/40 via-[#0D0D0D] to-[#0D0D0D] border-b border-[#222222] pt-10 sm:pt-16 pb-12 sm:pb-20">
        {/* Subtle Ambient Grid glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171717] border border-[#282828] mb-5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#00C878] animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#00C878]">
              Nigeria's Physical Space Network
            </span>
          </div>

          {/* Core Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Find the right space. <br />
            <span className="text-[#00C878]">Book it when you need it.</span>
          </h1>

          {/* Subheading & Core Promise */}
          <div className="mt-3.5 sm:mt-4 max-w-2xl mx-auto">
            <p className="text-base sm:text-lg font-bold text-[#F2F2F2] tracking-wide">
              Work. Create. Meet. Record.
            </p>
            <p className="text-xs sm:text-sm text-[#9A9A9A] mt-1 font-normal leading-relaxed">
              Book inspiring workspaces, studios, meeting rooms and creative spaces across Nigeria by the hour or day.
            </p>
          </div>

          {/* 3 Trust Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#171717] border border-[#282828] text-stone-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00C878]" />
              <span className="font-semibold">Verified</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#171717] border border-[#282828] text-stone-200">
              <span className="font-mono font-black text-xs text-[#00C878]">₦</span>
              <span className="font-semibold">Clear Pricing</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#171717] border border-[#282828] text-stone-200">
              <Calendar className="w-3.5 h-3.5 text-[#00C878]" />
              <span className="font-semibold">Instant Booking</span>
            </div>
          </div>

          {/* 2. SEARCH & BOOKING MODULE (Exact 6-Box Grid) */}
          <div className="mt-7 sm:mt-8 max-w-5xl mx-auto bg-[#171717]/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-[#2A2A2A] shadow-2xl text-left">
            <div className="px-1 pb-3 text-xs font-black text-[#00C878] uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#00C878]" />
                <span>WHAT SPACE ARE YOU LOOKING FOR?</span>
              </div>
              <button
                type="button"
                onClick={handleLocateVicinity}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#063B2A] hover:bg-[#084c36] text-[#00C878] border border-[#00C878]/40 text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                <span>{isLocating ? 'Locating...' : 'Locate in My Vicinity'}</span>
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-3">
              {/* 6 Input Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {/* 1. Location Input */}
                <div className="bg-[#202020] border border-[#2D2D2D] focus-within:border-[#00C878] rounded-2xl px-3.5 py-2.5 flex items-center gap-3 transition-colors">
                  <MapPin className="w-4 h-4 text-[#00C878] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Lekki, VI, Yaba, Abuja..."
                      value={searchLocation}
                      onChange={e => setSearchLocation(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-white placeholder:text-[#666666] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. Date Input */}
                <div className="bg-[#202020] border border-[#2D2D2D] focus-within:border-[#00C878] rounded-2xl px-3.5 py-2.5 flex items-center gap-3 transition-colors">
                  <Calendar className="w-4 h-4 text-[#00C878] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider">
                      Date
                    </label>
                    <input
                      type="date"
                      value={searchDate}
                      onChange={e => setSearchDate(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* 3. Start Time */}
                <div className="bg-[#202020] border border-[#2D2D2D] focus-within:border-[#00C878] rounded-2xl px-3.5 py-2.5 flex items-center gap-3 transition-colors">
                  <Clock className="w-4 h-4 text-[#00C878] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider">
                      Start time
                    </label>
                    <select
                      value={searchStartTime}
                      onChange={e => setSearchStartTime(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                    >
                      <option value="08:00 AM" className="bg-[#171717] text-white">08:00 AM</option>
                      <option value="09:00 AM" className="bg-[#171717] text-white">09:00 AM</option>
                      <option value="10:00 AM" className="bg-[#171717] text-white">10:00 AM</option>
                      <option value="11:00 AM" className="bg-[#171717] text-white">11:00 AM</option>
                      <option value="01:00 PM" className="bg-[#171717] text-white">01:00 PM</option>
                      <option value="04:00 PM" className="bg-[#171717] text-white">04:00 PM</option>
                      <option value="07:00 PM" className="bg-[#171717] text-white">07:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* 4. End Time */}
                <div className="bg-[#202020] border border-[#2D2D2D] focus-within:border-[#00C878] rounded-2xl px-3.5 py-2.5 flex items-center gap-3 transition-colors">
                  <Clock className="w-4 h-4 text-[#00C878] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider">
                      End time
                    </label>
                    <select
                      value={searchEndTime}
                      onChange={e => setSearchEndTime(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                    >
                      <option value="01:00 PM" className="bg-[#171717] text-white">01:00 PM</option>
                      <option value="02:00 PM" className="bg-[#171717] text-white">02:00 PM</option>
                      <option value="04:00 PM" className="bg-[#171717] text-white">04:00 PM</option>
                      <option value="06:00 PM" className="bg-[#171717] text-white">06:00 PM</option>
                      <option value="08:00 PM" className="bg-[#171717] text-white">08:00 PM</option>
                      <option value="10:00 PM" className="bg-[#171717] text-white">10:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* 5. Space Type */}
                <div className="bg-[#202020] border border-[#2D2D2D] focus-within:border-[#00C878] rounded-2xl px-3.5 py-2.5 flex items-center gap-3 transition-colors">
                  <Layers className="w-4 h-4 text-[#00C878] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider">
                      Space type
                    </label>
                    <select
                      value={searchSpaceType}
                      onChange={e => setSearchSpaceType(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                    >
                      <option value="all" className="bg-[#171717] text-white">Coworking, Studio, ...</option>
                      <option value="coworking" className="bg-[#171717] text-white">Coworking Desk</option>
                      <option value="office" className="bg-[#171717] text-white">Private Office</option>
                      <option value="meeting" className="bg-[#171717] text-white">Meeting Room</option>
                      <option value="podcast" className="bg-[#171717] text-white">Podcast Studio</option>
                      <option value="photo" className="bg-[#171717] text-white">Photography Studio</option>
                      <option value="video" className="bg-[#171717] text-white">Creator / Video Studio</option>
                      <option value="event" className="bg-[#171717] text-white">Event / Training Space</option>
                    </select>
                  </div>
                </div>

                {/* 6. People / Capacity */}
                <div className="bg-[#202020] border border-[#2D2D2D] focus-within:border-[#00C878] rounded-2xl px-3.5 py-2.5 flex items-center gap-3 transition-colors">
                  <Users className="w-4 h-4 text-[#00C878] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider">
                      People
                    </label>
                    <select
                      value={searchCapacity}
                      onChange={e => setSearchCapacity(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                    >
                      <option value="all" className="bg-[#171717] text-white">1 – 10+</option>
                      <option value="1" className="bg-[#171717] text-white">1 Person</option>
                      <option value="2-4" className="bg-[#171717] text-white">2 – 4 People</option>
                      <option value="5-10" className="bg-[#171717] text-white">5 – 10 People</option>
                      <option value="10+" className="bg-[#171717] text-white">10+ Team</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Full Width Primary CTA Button: "Find Spaces" */}
              <button
                type="submit"
                id="search-find-space-btn"
                className="w-full py-3.5 bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-[#00C878]/30 cursor-pointer active:scale-98"
              >
                <Search className="w-4 h-4 text-[#0D0D0D]" />
                <span>Find Spaces</span>
              </button>
            </form>

            {/* Quick Filters Pill Bar */}
            <div className="mt-4 pt-3 border-t border-[#262626] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] text-[#9A9A9A] font-bold uppercase tracking-wider mr-1">
                QUICK FILTERS:
              </span>
              <button
                type="button"
                id="quick-price-filter-btn"
                onClick={() => setShowFilterDrawer(true)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  (filters.priceRateType === 'hourly' && (filters.minPriceNGN > 0 || (filters.maxPriceNGN || 75000) < 75000)) ||
                  (filters.priceRateType === 'daily' && ((filters.minDailyPriceNGN || 0) > 0 || (filters.maxDailyPriceNGN || 350000) < 350000))
                    ? 'bg-[#063B2A] border-[#00C878] text-[#00C878]'
                    : 'bg-[#202020] border-[#2C2C2C] text-[#F2F2F2] hover:border-[#00C878]/50'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3 text-[#00C878]" />
                <span>
                  {(filters.priceRateType === 'hourly' && (filters.minPriceNGN > 0 || (filters.maxPriceNGN || 75000) < 75000))
                    ? `Price: ₦${filters.minPriceNGN.toLocaleString()} – ₦${filters.maxPriceNGN?.toLocaleString()}/hr`
                    : (filters.priceRateType === 'daily' && ((filters.minDailyPriceNGN || 0) > 0 || (filters.maxDailyPriceNGN || 350000) < 350000))
                    ? `Price: ₦${filters.minDailyPriceNGN?.toLocaleString()} – ₦${filters.maxDailyPriceNGN?.toLocaleString()}/day`
                    : '₦ Price Filter'}
                </span>
              </button>
              {[
                { id: 'near_me', label: '📍 Near me / Vicinity', onClick: handleLocateVicinity },
                { id: 'under_5k', label: '₦ Under ₦5,000/hr' },
                { id: 'power_247', label: '⚡ 24/7 Power' },
                { id: 'starlink', label: '🌐 Starlink / Fast Wi-Fi' },
                { id: 'creator', label: '🎙️ Creator-ready' },
                { id: 'private', label: '🔒 Private' },
              ].map(qf => {
                const isActive = quickFilter === qf.id;
                return (
                  <button
                    key={qf.id}
                    type="button"
                    onClick={() => {
                      if (qf.onClick) {
                        qf.onClick();
                      } else {
                        setQuickFilter(isActive ? null : qf.id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#063B2A] border-[#00C878] text-[#00C878]'
                        : 'bg-[#202020] border-[#2C2C2C] text-[#F2F2F2] hover:border-[#00C878]/50'
                    }`}
                  >
                    {qf.label}
                  </button>
                );
              })}

              {quickFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setQuickFilter(null);
                    setActiveVicinity(null);
                    setUserLocation(null);
                  }}
                  className="text-[11px] text-[#00C878] hover:underline font-semibold ml-2 cursor-pointer"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. VICINITY & REGIONAL HUBS QUICK BAR */}
      <div className="bg-[#141414] border-b border-[#222222] py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#00C878] flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#00C878]" />
                <span>Jump Vicinity:</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {NIGERIAN_VICINITIES.map(vic => {
                const isSelected = activeVicinity?.id === vic.id;
                const spaceCount = spaces.filter(s =>
                  (s.neighborhood || '').toLowerCase().includes(vic.shortName.toLowerCase()) ||
                  (s.city || '').toLowerCase().includes(vic.city.toLowerCase())
                ).length;

                return (
                  <button
                    key={vic.id}
                    onClick={() => handleSelectVicinity(vic)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#00C878] text-[#0D0D0D] font-black shadow-sm ring-2 ring-[#00C878]/40'
                        : 'bg-[#1E1E1E] hover:bg-[#282828] text-[#B0B0B0] hover:text-white border border-[#282828]'
                    }`}
                  >
                    <span>📍 {vic.shortName}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? 'bg-[#0D0D0D] text-[#00C878]' : 'bg-[#2A2A2A] text-[#9A9A9A]'
                    }`}>
                      {spaceCount}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setViewMode(prev => (prev === 'map' ? 'grid' : 'map'))}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#063B2A] text-[#00C878] hover:bg-[#084c36] text-xs font-black border border-[#00C878]/40 shrink-0 transition-colors cursor-pointer"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{viewMode === 'map' ? 'Back to Cards' : 'View on Map'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. CATEGORIES ROW */}
      <div className="border-b border-[#222222] bg-[#121212] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-xs font-black text-[#9A9A9A] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#00C878]" />
              <span>Explore by Space Type</span>
            </h2>
            <button
              onClick={() => {
                setCategoryFilter('all');
                resetFilters();
                if (onNavigateToResults) onNavigateToResults();
              }}
              className="text-xs text-[#00C878] hover:underline font-bold"
            >
              View All ({spaces.length})
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {spaceCategories.map(cat => {
              const Icon = cat.icon;
              const isSelected =
                (cat.id === 'all' && filters.category === 'all' && !filters.searchQuery) ||
                (cat.categoryType && filters.category === cat.categoryType);

              return (
                <button
                  key={cat.id}
                  id={`cat-card-${cat.id}`}
                  onClick={() => {
                    if (cat.categoryType) {
                      setCategoryFilter(cat.categoryType);
                    } else {
                      setCategoryFilter('all');
                      setFilters(prev => ({ ...prev, searchQuery: '' }));
                    }
                    if (cat.subcatMatch) {
                      setFilters(prev => ({ ...prev, spaceType: cat.id }));
                    }
                    if (onNavigateToResults) onNavigateToResults();
                  }}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-[#063B2A] border-[#00C878] text-[#00C878] shadow-md shadow-[#00C878]/10'
                      : 'bg-[#171717] border-[#262626] hover:border-[#383838] hover:bg-[#1E1E1E] text-[#F2F2F2]'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${
                      isSelected ? 'bg-[#00C878] text-[#0D0D0D]' : 'bg-[#222222] text-[#00C878]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold leading-tight line-clamp-1">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. MAIN CONTENT AREA: RESULTS, FILTERS, SPACES & MAP */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Control Bar: Results count, Smart Filter chips, View modes */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#222222]">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-white">
                {activeVicinity
                  ? `Spaces in ${activeVicinity.shortName}`
                  : filters.city === 'all'
                  ? 'Spaces across Nigeria'
                  : `Spaces in ${filters.city}`}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#171717] border border-[#282828] text-xs font-bold text-[#00C878]">
                {filteredSpaces.length} Available
              </span>
              <span className="hidden sm:inline-block text-xs text-[#9A9A9A] font-medium">
                • {totalAvailableDesks} Open Desks
              </span>
            </div>
            {userLocation && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-[#00C878] font-bold">
                <LocateFixed className="w-3.5 h-3.5 text-[#00C878]" />
                <span>Proximity sorted: closest to {userLocation.label}</span>
              </div>
            )}
          </div>

          {/* View Mode Toggle & All Filters Drawer */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171717] border border-[#282828] hover:border-[#3A3A3A] text-xs font-bold text-[#F2F2F2] transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D6A83A]" />
              <span>All Filters</span>
            </button>

            {/* 3-Way Mode Switcher: Grid, Split, Full Map */}
            <div className="flex items-center bg-[#171717] p-1 rounded-xl border border-[#282828]">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#222222] text-[#00C878]' : 'text-[#9A9A9A] hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'split' ? 'bg-[#222222] text-[#00C878]' : 'text-[#9A9A9A] hover:text-white'
                }`}
                title="Split Map + List"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'map' ? 'bg-[#222222] text-[#00C878]' : 'text-[#9A9A9A] hover:text-white'
                }`}
                title="Full Interactive Map"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* 6. OFIS AI MATCH PROMPT BANNER */}
        <div className="my-6 p-4 sm:p-5 rounded-3xl bg-[#171717] border border-[#2A2A2A] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#063B2A] border border-[#00C878]/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#D6A83A]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white">OFIS AI Match</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-[#D6A83A]/20 text-[#D6A83A] border border-[#D6A83A]/40">
                    SMART SPATIAL ADVISOR
                  </span>
                </div>
                <p className="text-xs text-[#9A9A9A] mt-0.5">
                  "Tell us what you need. We'll find the space." e.g. <span className="text-[#F2F2F2] italic">"I need a quiet desk in Lekki with 24/7 power & Starlink for a 4-hour Zoom sprint."</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => openAiModal('match')}
              className="px-4 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] text-xs font-black flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <span>Try OFIS AI Match</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0D0D0D]" />
            </button>
          </div>
        </div>

        {/* 7. VIEW MODE RENDERING: GRID, SPLIT, OR FULL INTERACTIVE MAP */}
        {viewMode === 'map' ? (
          /* FULL MAP VIEW */
          <div className="mt-6 space-y-4">
            {/* Top Interactive Map Info Header */}
            <div className="p-4 rounded-2xl bg-[#171717] border border-[#282828] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#063B2A] text-[#00C878] flex items-center justify-center">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <span>Interactive Nigerian Spatial Cartography</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00C878] text-[#0D0D0D] font-bold">
                      LIVE RADAR
                    </span>
                  </h4>
                  <p className="text-xs text-[#9A9A9A]">
                    Click markers to explore hourly rates, Starlink speeds, and available desks. Drag & zoom to pan Nigeria.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLocateVicinity}
                  className="px-3 py-1.5 rounded-xl bg-[#222222] hover:bg-[#2D2D2D] text-[#00C878] text-xs font-bold flex items-center gap-1.5 border border-[#333333] transition-colors cursor-pointer"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>Locate Me</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className="px-3 py-1.5 rounded-xl bg-[#00C878] text-[#0D0D0D] text-xs font-black hover:bg-[#00b06a] transition-colors cursor-pointer"
                >
                  List View
                </button>
              </div>
            </div>

            {/* Expansive Interactive Map */}
            <div className="rounded-3xl overflow-hidden border border-[#282828] shadow-2xl">
              <ExploreMapView
                spaces={filteredSpaces || []}
                selectedSpaceId={highlightedSpaceId}
                onSelectSpace={s => onSelectSpace(s)}
                height="680px"
                isFullWidth={true}
              />
            </div>

            {/* Bottom Horizontal Quick-Scroll Space Cards */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-[#9A9A9A] uppercase tracking-wider">
                  Available in this View ({filteredSpaces.length})
                </span>
                <span className="text-xs text-[#00C878] font-semibold">
                  Click any card to center marker
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(filteredSpaces.slice(0, 8) || []).map(space => {
                  const dist = getSpaceDistance(space);
                  return (
                    <div
                      key={space.id}
                      onClick={() => {
                        setHighlightedSpaceId(space.id);
                        onSelectSpace(space);
                      }}
                      onMouseEnter={() => setHighlightedSpaceId(space.id)}
                      className="p-3.5 rounded-2xl bg-[#171717] border border-[#282828] hover:border-[#00C878] transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={space.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80'}
                          alt={space.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-[10px] text-[#9A9A9A]">
                            <span>{space.city}</span>
                            {dist !== null && (
                              <span className="font-bold text-[#00C878]">
                                {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-xs text-white group-hover:text-[#00C878] transition-colors truncate mt-0.5">
                            {space.name}
                          </h5>
                          <div className="text-[10px] text-[#9A9A9A] truncate">
                            {space.neighborhood}
                          </div>
                          <div className="text-xs font-black text-[#00C878] mt-1 font-mono">
                            ₦{space.hourlyRateNGN.toLocaleString()}/hr
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : viewMode === 'split' ? (
          /* SPLIT LIST & MAP VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            {/* List side */}
            <div className="lg:col-span-7 space-y-4">
              {(filteredSpaces || []).map(space => {
                const dist = getSpaceDistance(space);
                return (
                  <div
                    key={space.id}
                    onMouseEnter={() => setHighlightedSpaceId(space.id)}
                    onMouseLeave={() => setHighlightedSpaceId(null)}
                  >
                    <SpaceCard
                      space={space}
                      currentCurrency={currentCurrency}
                      formatPrice={formatPrice}
                      isFavorite={isFavorite(space.id)}
                      onToggleFavorite={e => {
                        e.stopPropagation();
                        toggleFavorite(space.id);
                      }}
                      onSelect={() => onSelectSpace(space)}
                      distanceKm={dist}
                      isHighlighted={highlightedSpaceId === space.id}
                    />
                  </div>
                );
              })}
            </div>

            {/* Map side (Sticky) */}
            <div className="lg:col-span-5 h-[720px] sticky top-24 rounded-3xl overflow-hidden border border-[#282828] shadow-2xl">
              <ExploreMapView
                spaces={filteredSpaces || []}
                selectedSpaceId={highlightedSpaceId}
                onSelectSpace={s => onSelectSpace(s)}
                height="100%"
              />
            </div>
          </div>
        ) : (
          /* GRID VIEW WITH INTERACTIVE VICINITY MAP PREVIEW BANNER */
          <div className="space-y-6 mt-6">
            {/* Vicinity Map Quick Discovery Strip */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-[#171717] to-[#121212] border border-[#2A2A2A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#063B2A] border border-[#00C878]/40 flex items-center justify-center text-[#00C878] shrink-0">
                  <MapIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white">Visual Vicinity Map</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#00C878]/20 text-[#00C878] border border-[#00C878]/30">
                      {filteredSpaces.length} Hubs Mapped
                    </span>
                  </div>
                  <p className="text-xs text-[#9A9A9A] mt-0.5">
                    Explore physical workspace clusters across Lagos, Abuja, Port Harcourt and Ibadan on the live cartography map.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('split')}
                  className="px-3.5 py-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Columns className="w-3.5 h-3.5 text-[#D6A83A]" />
                  <span>Split View</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className="px-4 py-2 rounded-xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <MapIcon className="w-3.5 h-3.5 text-[#0D0D0D]" />
                  <span>Open Full Map</span>
                </button>
              </div>
            </div>

            {/* 3-Column Spaces Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filteredSpaces || []).map(space => {
                const dist = getSpaceDistance(space);
                return (
                  <SpaceCard
                    key={space.id}
                    space={space}
                    currentCurrency={currentCurrency}
                    formatPrice={formatPrice}
                    isFavorite={isFavorite(space.id)}
                    onToggleFavorite={e => {
                      e.stopPropagation();
                      toggleFavorite(space.id);
                    }}
                    onSelect={() => onSelectSpace(space)}
                    distanceKm={dist}
                  />
                );
              })}
            </div>
          </div>
        )}

        {(!filteredSpaces || filteredSpaces.length === 0) && (
          <div className="text-center py-16 bg-[#171717] rounded-3xl border border-[#282828] my-8">
            <Building2 className="w-12 h-12 text-[#9A9A9A] mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No spaces matched your exact search</h3>
            <p className="text-xs text-[#9A9A9A] mt-1 max-w-md mx-auto">
              Try adjusting your city filter or search query, or use OFIS AI Match to discover available spaces.
            </p>
            <button
              onClick={() => {
                resetFilters();
                setActiveVicinity(null);
                setUserLocation(null);
                setQuickFilter(null);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#00C878] text-[#0D0D0D] font-bold text-xs cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Map/List View Toggle (Mobile & Desktop) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          id="toggle-view-fab"
          onClick={() => setViewMode(prev => (prev === 'map' ? 'grid' : 'map'))}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#171717]/95 hover:bg-[#222222] text-white border border-[#2F2F2F] hover:border-[#00C878] shadow-2xl backdrop-blur-md font-black text-xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          {viewMode === 'map' ? (
            <>
              <LayoutGrid className="w-4 h-4 text-[#00C878]" />
              <span>Show List View ({filteredSpaces.length})</span>
            </>
          ) : (
            <>
              <MapIcon className="w-4 h-4 text-[#00C878]" />
              <span>View Interactive Map ({filteredSpaces.length})</span>
            </>
          )}
        </button>
      </div>

      {/* 8. ALL FILTERS DRAWER */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setShowFilterDrawer(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#141414] border-l border-[#282828] text-white p-6 shadow-2xl overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[#282828]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#00C878]" />
                  <span className="font-black text-base text-white">Filters</span>
                </div>
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  className="p-1.5 rounded-lg hover:bg-[#222222] text-[#9A9A9A] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Range Slider in Drawer */}
              <div className="mt-6">
                <PriceRangeSlider
                  rateType={filters.priceRateType || 'hourly'}
                  minPrice={filters.priceRateType === 'daily' ? (filters.minDailyPriceNGN ?? 0) : (filters.minPriceNGN ?? 0)}
                  maxPrice={filters.priceRateType === 'daily' ? (filters.maxDailyPriceNGN ?? 350000) : (filters.maxPriceNGN ?? 75000)}
                  onChange={(min, max, rate) => {
                    setFilters(prev => ({
                      ...prev,
                      priceRateType: rate,
                      minPriceNGN: rate === 'hourly' ? min : (prev.minPriceNGN ?? 0),
                      maxPriceNGN: rate === 'hourly' ? max : (prev.maxPriceNGN ?? 75000),
                      minDailyPriceNGN: rate === 'daily' ? min : (prev.minDailyPriceNGN ?? 0),
                      maxDailyPriceNGN: rate === 'daily' ? max : (prev.maxDailyPriceNGN ?? 350000),
                    }));
                  }}
                  onRateTypeChange={rate => {
                    setFilters(prev => ({ ...prev, priceRateType: rate }));
                  }}
                />
              </div>

              {/* City Selection */}
              <div className="mt-6">
                <label className="block text-xs font-bold text-[#00C878] uppercase tracking-wider mb-2">
                  City / Region
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {nigerianCities.map(c => (
                    <button
                      key={c}
                      onClick={() => setFilters(prev => ({ ...prev, city: c }))}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                        filters.city.toLowerCase() === c.toLowerCase()
                          ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]'
                          : 'bg-[#1C1C1C] text-[#9A9A9A] border border-[#282828] hover:text-white'
                      }`}
                    >
                      {c === 'all' ? 'All Nigeria' : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Power & Infrastructure Assurance */}
              <div className="mt-6">
                <label className="block text-xs font-bold text-[#00C878] uppercase tracking-wider mb-2">
                  Power & Connectivity
                </label>
                <div className="space-y-2">
                  {[
                    '24/7 Power (Dual Generators + Solar)',
                    'Starlink 350Mbps Internet',
                    'Acoustic Soundproofing',
                    'Dedicated Parking',
                    'Air Conditioning',
                    'Executive Coffee & Refreshments',
                  ].map(amenity => {
                    const isChecked = filters.amenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        onClick={() => {
                          setFilters(prev => ({
                            ...prev,
                            amenities: isChecked
                              ? prev.amenities.filter(a => a !== amenity)
                              : [...prev.amenities, amenity],
                          }));
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40'
                            : 'bg-[#1C1C1C] text-[#9A9A9A] border border-[#282828] hover:text-white'
                        }`}
                      >
                        <span>{amenity}</span>
                        {isChecked && <Check className="w-4 h-4 text-[#00C878]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#282828] flex items-center gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-2.5 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-white text-xs font-bold cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] text-xs font-black cursor-pointer"
                >
                  Show Spaces
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// PREMIUM LISTING CARD COMPONENT WITH VICINITY DISTANCE
// ==========================================
interface SpaceCardProps {
  space: Space;
  currentCurrency: any;
  formatPrice: (amount: number) => string;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onSelect: () => void;
  distanceKm?: number | null;
  isHighlighted?: boolean;
}

const SpaceCard: React.FC<SpaceCardProps> = ({
  space,
  currentCurrency,
  formatPrice,
  isFavorite,
  onToggleFavorite,
  onSelect,
  distanceKm,
  isHighlighted = false,
}) => {
  return (
    <div
      onClick={onSelect}
      id={`space-card-${space.id}`}
      className={`group bg-[#171717] rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col ${
        isHighlighted
          ? 'border-[#00C878] ring-2 ring-[#00C878]/30 shadow-2xl shadow-[#00C878]/20 -translate-y-1'
          : 'border-[#262626] hover:border-[#00C878]/50 hover:shadow-2xl hover:shadow-[#00C878]/10'
      }`}
    >
      {/* Large Space Image with Hover Zoom */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#111111]">
        <img
          src={space.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80'}
          alt={space.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {/* Space Type Badge */}
          <span className="px-2.5 py-1 rounded-xl bg-[#0D0D0D]/90 backdrop-blur-xs text-white text-[10px] font-black border border-white/10 uppercase tracking-wider">
            {space.subcategory ? space.subcategory.replace(/_/g, ' ') : space.category ? space.category.replace(/_/g, ' ') : 'Workspace'}
          </span>

          {/* Favorite Heart Button */}
          <button
            onClick={onToggleFavorite}
            className="w-8 h-8 rounded-full bg-[#0D0D0D]/80 backdrop-blur-xs flex items-center justify-center text-white hover:text-[#00C878] transition-colors border border-white/10 cursor-pointer"
            title="Save to favorites"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#00C878] text-[#00C878]' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Overlay: "Available Today" status & Distance badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#063B2A]/90 backdrop-blur-xs border border-[#00C878]/40 text-[#00C878] text-[10px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C878] animate-ping" />
              <span>Available Today</span>
            </span>

            {space.isSuperhost && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#D6A83A]/20 backdrop-blur-xs border border-[#D6A83A]/50 text-[#D6A83A] text-[10px] font-black">
                <ShieldCheck className="w-3 h-3 text-[#D6A83A]" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* Proximity Distance Badge */}
          {distanceKm !== null && distanceKm !== undefined && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#121212]/90 backdrop-blur-xs border border-[#00C878]/50 text-[#00C878] text-[10px] font-black">
              <Navigation className="w-3 h-3 text-[#00C878]" />
              <span>{distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m away` : `${distanceKm.toFixed(1)} km away`}</span>
            </span>
          )}
        </div>
      </div>

      {/* Space Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Rating */}
          <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
            <span className="text-[#9A9A9A] font-semibold flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
              <span>{space.neighborhood || `${space.city}, Nigeria`}</span>
            </span>
            <div className="flex items-center gap-1 shrink-0 font-bold text-white">
              <Star className="w-3.5 h-3.5 text-[#D6A83A] fill-[#D6A83A]" />
              <span>{(space.rating || 4.8).toFixed(1)}</span>
              <span className="text-[#9A9A9A] font-normal text-[11px]">({space.reviewCount || 12})</span>
            </div>
          </div>

          {/* Space Name */}
          <h3 className="text-base font-black text-white group-hover:text-[#00C878] transition-colors line-clamp-1">
            {space.name}
          </h3>

          {/* Tagline */}
          <p className="text-xs text-[#9A9A9A] mt-1 line-clamp-2 leading-relaxed font-normal">
            {space.tagline}
          </p>

          {/* Key Amenities Highlights */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[#222222] text-[#F2F2F2] border border-[#2D2D2D] flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-[#00C878]" />
              <span>24/7 Power</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[#222222] text-[#F2F2F2] border border-[#2D2D2D] flex items-center gap-1">
              <Wifi className="w-2.5 h-2.5 text-[#00C878]" />
              <span>Starlink</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[#222222] text-[#F2F2F2] border border-[#2D2D2D] flex items-center gap-1">
              <Wind className="w-2.5 h-2.5 text-[#00C878]" />
              <span>AC</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[#222222] text-[#9A9A9A] border border-[#2D2D2D]">
              Cap: {space.capacity}
            </span>
          </div>
        </div>

        {/* Pricing & Booking CTA */}
        <div className="mt-5 pt-3.5 border-t border-[#262626] flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-[#9A9A9A] font-bold uppercase tracking-wider">From</div>
            <div className="text-base font-black text-white font-mono">
              <span className="text-[#00C878]">₦{(space.hourlyRateNGN || Math.round(space.hourlyRate * 1550)).toLocaleString()}</span>
              <span className="text-xs font-normal text-[#9A9A9A]">/hr</span>
            </div>
            <div className="text-[10px] text-[#9A9A9A] font-mono">
              ₦{(space.dailyRateNGN || Math.round(space.dailyRate * 1550)).toLocaleString()}/day
            </div>
          </div>

          <button
            onClick={e => {
              e.stopPropagation();
              onSelect();
            }}
            className="px-4 py-2 rounded-xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <span>View Space</span>
            <ArrowRight className="w-3 h-3 text-[#0D0D0D]" />
          </button>
        </div>
      </div>
    </div>
  );
};

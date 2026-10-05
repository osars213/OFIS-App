import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, CheckCircle2, AlertCircle, Loader2, Navigation, Compass, ExternalLink } from 'lucide-react';
import { CityLocation } from '../../types';

export interface SelectedLocationData {
  address: string;
  neighborhood: string;
  city: CityLocation | string;
  state: string;
  country: string;
  latitude: number | undefined;
  longitude: number | undefined;
  fullAddress: string;
}

interface AddressAutocompleteMapProps {
  initialAddress?: string;
  initialCity?: string;
  initialNeighborhood?: string;
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (loc: SelectedLocationData) => void;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city?: string;
    town?: string;
    state?: string;
    country?: string;
  };
}

export const AddressAutocompleteMap: React.FC<AddressAutocompleteMapProps> = ({
  initialAddress = '',
  initialCity = 'Lagos',
  initialNeighborhood = '',
  initialLat,
  initialLng,
  onLocationSelect,
}) => {
  const [query, setQuery] = useState(initialAddress);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocationData | null>(
    initialAddress
      ? {
          address: initialAddress,
          neighborhood: initialNeighborhood,
          city: initialCity,
          state: initialCity === 'Abuja' ? 'FCT' : `${initialCity} State`,
          country: 'Nigeria',
          latitude: initialLat,
          longitude: initialLng,
          fullAddress: initialAddress,
        }
      : null
  );

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search using OpenStreetMap Nominatim (Free Open Data, No API Key Required)
  const searchAddress = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length < 3) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Append Nigeria context for high relevance in Nigerian cities
      const searchQuery = (searchTerm || '').toLowerCase().includes('nigeria')
        ? searchTerm
        : `${searchTerm}, Nigeria`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=ng&limit=6&q=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );

      if (response.ok) {
        const data: NominatimResult[] = await response.json();
        setResults(data);
        setIsDropdownOpen(true);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.warn('[AddressAutocompleteMap] Nominatim search error:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      searchAddress(val);
    }, 400);
  };

  const handleSelectResult = (item: NominatimResult) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    const addr = item.address || {};
    const street = [addr.house_number, addr.road].filter(Boolean).join(' ') || item.display_name.split(',')[0];
    const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || '';
    
    // Normalize city
    let cityCandidate = addr.city || addr.town || '';
    const displayName = (item.display_name || '').toLowerCase();
    if (!cityCandidate && displayName.includes('lagos')) cityCandidate = 'Lagos';
    else if (!cityCandidate && displayName.includes('abuja')) cityCandidate = 'Abuja';
    else if (!cityCandidate && displayName.includes('port harcourt')) cityCandidate = 'Port Harcourt';
    else if (!cityCandidate && displayName.includes('ibadan')) cityCandidate = 'Ibadan';
    else if (!cityCandidate) cityCandidate = initialCity || 'Lagos';

    const state = addr.state || (cityCandidate === 'Abuja' ? 'Federal Capital Territory' : `${cityCandidate} State`);
    const country = addr.country || 'Nigeria';

    const locationData: SelectedLocationData = {
      address: street || item.display_name,
      neighborhood: neighborhood || initialNeighborhood || cityCandidate,
      city: cityCandidate as CityLocation,
      state,
      country,
      latitude: isNaN(lat) ? undefined : lat,
      longitude: isNaN(lon) ? undefined : lon,
      fullAddress: item.display_name,
    };

    setSelectedLocation(locationData);
    setQuery(locationData.address);
    setIsDropdownOpen(false);
    onLocationSelect(locationData);
  };

  const handleManualConfirmation = () => {
    if (!query.trim()) return;
    const manualLoc: SelectedLocationData = {
      address: query.trim(),
      neighborhood: initialNeighborhood || 'Central',
      city: initialCity,
      state: initialCity === 'Abuja' ? 'FCT' : `${initialCity} State`,
      country: 'Nigeria',
      latitude: selectedLocation?.latitude || 6.4281,
      longitude: selectedLocation?.longitude || 3.4219,
      fullAddress: `${query.trim()}, ${initialCity}, Nigeria`,
    };
    setSelectedLocation(manualLoc);
    onLocationSelect(manualLoc);
    setIsDropdownOpen(false);
  };

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Search Input */}
      <div className="space-y-1 relative">
        <label className="text-xs font-semibold text-[#12383B] dark:text-white flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#FFA987]" />
            <span>Address Autocomplete &amp; Map Pin</span>
          </span>
          <span className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] font-mono">OpenStreetMap Verified</span>
        </label>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (results.length > 0) setIsDropdownOpen(true);
            }}
            placeholder="Type street, landmark, or area (e.g. 14 Adeola Odeku, Victoria Island)"
            className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#FFA987] transition-colors"
          />
          <Search className="w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0] absolute left-3 top-3" />
          
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[#FFA987] animate-spin absolute right-3 top-3" />
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isDropdownOpen && results.length > 0 && (
          <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-[#E2ECEB] dark:divide-[#166D74]">
            {results.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => handleSelectResult(item)}
                className="w-full text-left p-3 hover:bg-[#FFF9F4] dark:hover:bg-[#0B4A50] transition-colors flex items-start space-x-2.5 text-xs text-[#12383B] dark:text-white cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#FFA987] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-[#12383B] dark:text-white">
                    {item.display_name.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] truncate">
                    {item.display_name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Structured Location Information Card */}
      {selectedLocation && (
        <div className="p-3.5 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#006B70] dark:text-[#FFA987] uppercase flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FFA987]" />
              <span>Location Captured</span>
            </span>
            {selectedLocation.latitude && selectedLocation.longitude && (
              <span className="text-[10px] font-mono text-[#5D7A7D] dark:text-[#B8D1D0]">
                {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74]">
              <span className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] block">Area / Neighborhood</span>
              <span className="font-semibold text-[#12383B] dark:text-white truncate block">
                {selectedLocation.neighborhood || selectedLocation.city}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74]">
              <span className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] block">City &amp; State</span>
              <span className="font-semibold text-[#12383B] dark:text-white truncate block">
                {selectedLocation.city}, {selectedLocation.state}
              </span>
            </div>
          </div>

          {/* Interactive Live Map Marker Preview */}
          {selectedLocation.latitude && selectedLocation.longitude ? (
            <div className="relative rounded-xl overflow-hidden border border-[#E2ECEB] dark:border-[#166D74] h-36 bg-[#FFF9F4] dark:bg-[#07383D]">
              <iframe
                title="Workspace Location Preview"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.longitude - 0.008}%2C${selectedLocation.latitude - 0.006}%2C${selectedLocation.longitude + 0.008}%2C${selectedLocation.latitude + 0.006}&layer=mapnik&marker=${selectedLocation.latitude}%2C${selectedLocation.longitude}`}
                className="w-full h-full filter invert-[0.9] hue-rotate-180 contrast-125 opacity-90"
              />
              <div className="absolute top-2 right-2 z-10">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${selectedLocation.latitude}&mlon=${selectedLocation.longitude}#map=16/${selectedLocation.latitude}/${selectedLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded-lg bg-white/90 dark:bg-[#07383D]/90 text-[10px] text-[#006B70] dark:text-[#28D2CB] font-mono border border-[#E2ECEB] dark:border-[#166D74] flex items-center space-x-1 hover:border-[#14BEB8] transition-colors"
                >
                  <span>Open Map</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-center text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
              <span>Address captured for navigation routing.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

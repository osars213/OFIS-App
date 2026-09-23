import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Car, 
  Footprints, 
  Bus, 
  Compass, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  ExternalLink, 
  ShieldCheck,
  Building,
  Sparkles
} from 'lucide-react';
import { Space } from '../../types';
import { formatLocationFull, extractStructuredLocation } from '../../utils/location';

interface InteractiveWorkspaceMapProps {
  space: Space;
  onOpenDirections?: () => void;
}

export const InteractiveWorkspaceMap: React.FC<InteractiveWorkspaceMapProps> = ({
  space,
  onOpenDirections,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(15);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');

  // Realistic neighborhood landmarks tailored to Lagos/Abuja/etc.
  const landmarks = React.useMemo(() => {
    if (space.neighborhood?.toLowerCase().includes('victoria island')) {
      return [
        { name: 'Eko Hotel & Convention Centre', distance: '350m', type: 'Hospitality', travelTime: '3 min walk' },
        { name: 'Landmark Beach & Event Center', distance: '1.2 km', type: 'Leisure', travelTime: '4 min drive' },
        { name: 'The Palms Shopping Mall', distance: '1.5 km', type: 'Retail & Dining', travelTime: '5 min drive' },
        { name: 'Civic Centre Victoria Island', distance: '900m', type: 'Business Hub', travelTime: '2 min drive' },
      ];
    } else if (space.neighborhood?.toLowerCase().includes('ikoyi')) {
      return [
        { name: 'Ikoyi Golf Club 1938', distance: '600m', type: 'Recreation', travelTime: '2 min drive' },
        { name: 'Southern Sun Ikoyi Hotel', distance: '850m', type: 'Hospitality', travelTime: '8 min walk' },
        { name: 'Falomo Bridge & Roundabout', distance: '1.1 km', type: 'Transit Hub', travelTime: '4 min drive' },
        { name: 'Wheatbaker Hotel Ikoyi', distance: '1.4 km', type: 'Executive Hotel', travelTime: '5 min drive' },
      ];
    } else if (space.neighborhood?.toLowerCase().includes('lekki')) {
      return [
        { name: 'Admiralty Way Hub & Cafes', distance: '200m', type: 'Dining & Retail', travelTime: '2 min walk' },
        { name: 'Lekki Phase 1 Gate & Toll', distance: '800m', type: 'Transit Point', travelTime: '3 min drive' },
        { name: 'Filmhouse IMAX Cinema', distance: '1.2 km', type: 'Entertainment', travelTime: '4 min drive' },
        { name: 'Lekki Conservation Centre', distance: '4.5 km', type: 'Nature Reserve', travelTime: '12 min drive' },
      ];
    } else {
      return [
        { name: 'Central Business District Gate', distance: '400m', type: 'Financial Hub', travelTime: '4 min walk' },
        { name: 'Transcorp Hilton Hotel', distance: '1.3 km', type: 'Executive Hotel', travelTime: '5 min drive' },
        { name: 'Metropolitan Transit Interchange', distance: '800m', type: 'Transit Hub', travelTime: '8 min walk' },
        { name: 'City Center Mall', distance: '1.6 km', type: 'Shopping & Dining', travelTime: '6 min drive' },
      ];
    }
  }, [space.neighborhood]);

  const structuredLoc = extractStructuredLocation(space);
  const locationLabel = formatLocationFull(space);

  const googleMapsUrl = structuredLoc.hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(space.title)}&query_place_id=&ll=${structuredLoc.latitude},${structuredLoc.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${space.title} ${locationLabel}`)}`;

  const appleMapsUrl = structuredLoc.hasCoordinates
    ? `https://maps.apple.com/?q=${encodeURIComponent(space.title)}&ll=${structuredLoc.latitude},${structuredLoc.longitude}`
    : `https://maps.apple.com/?q=${encodeURIComponent(`${space.title} ${locationLabel}`)}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB]">Location & Surroundings</h3>
          <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]">
            {locationLabel}
          </p>
        </div>

        {/* Navigation CTAs */}
        <div className="flex items-center space-x-2">
          {onOpenDirections && (
            <button
              type="button"
              onClick={onOpenDirections}
              className="px-3.5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#14B8A6] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 fill-white" />
              <span>In-App Directions</span>
            </button>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] text-xs font-semibold text-[#4B5563] dark:text-[#CBD5E1] hover:text-[#111827] dark:hover:text-[#F9FAFB] flex items-center space-x-1 transition-all shadow-2xs"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
          </a>
        </div>
      </div>

      {/* Interactive Map Visual Container */}
      <div className="relative w-full h-72 sm:h-80 rounded-3xl overflow-hidden bg-[#111827] border border-[#374151] shadow-xl select-none group">
        
        {/* Map Background Canvas (Styled Dark Carto / Satellite) */}
        <div 
          className={`w-full h-full transition-all duration-500 relative flex items-center justify-center ${
            mapStyle === 'satellite' ? 'bg-[#0b130e]' : 'bg-[#101512]'
          }`}
          style={{
            backgroundImage: `radial-gradient(circle at center, ${mapStyle === 'satellite' ? '#14281c' : '#17221b'} 0%, #0d120f 85%)`
          }}
        >
          {/* Simulated Cartographic Street Grid & Transit Roads */}
          <div className="absolute inset-0 opacity-25 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)',
            backgroundSize: `${20 * (zoomLevel / 14)}px ${20 * (zoomLevel / 14)}px`
          }} />

          {/* Arterial Road Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-1/3 left-0 right-0 h-2 bg-[#2a3830] transform -rotate-3" />
            <div className="absolute top-0 bottom-0 left-1/2 w-3 bg-[#2a3830] transform rotate-12" />
            <div className="absolute bottom-1/4 left-0 right-0 h-1.5 bg-[#0F766E]/30 transform rotate-6" />
          </div>

          {/* Interactive Workspace Pin with Ripple Halo */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Animated Pulse Waves */}
            <div className="absolute -inset-4 rounded-full bg-[#0F766E]/25 animate-ping" />
            <div className="absolute -inset-8 rounded-full bg-[#0F766E]/10 animate-pulse" />

            {/* Central Pin Marker */}
            <div className="p-3 rounded-2xl bg-[#0F766E] text-white shadow-2xl ring-4 ring-[#0F766E]/30 flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer">
              <MapPin className="w-6 h-6 fill-white stroke-[2.5]" />
            </div>

            {/* Floating Space Label Card */}
            <div className="mt-2 px-3 py-1.5 rounded-xl bg-[#111827]/90 backdrop-blur-md border border-[#374151] text-center shadow-xl">
              <div className="text-xs font-bold text-[#F9FAFB] max-w-[200px] truncate">{space.title}</div>
              <div className="text-[10px] text-[#14B8A6] font-mono font-semibold">{space.neighborhood}</div>
            </div>
          </div>

          {/* Nearby Landmark Pins on Map */}
          {landmarks.slice(0, 2).map((lm, idx) => (
            <div
              key={lm.name}
              className={`absolute z-10 flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#111827]/90 backdrop-blur-md border border-[#374151] text-[10px] text-[#CBD5E1] shadow-md ${
                idx === 0 ? 'top-10 left-10' : 'bottom-12 right-12'
              }`}
            >
              <Building className="w-3 h-3 text-[#94A3B8]" />
              <span className="truncate max-w-[120px]">{lm.name}</span>
              <span className="text-[#14B8A6] font-mono">({lm.distance})</span>
            </div>
          ))}

        </div>

        {/* Top-Right Map Controls (Zoom & Style) */}
        <div className="absolute top-3 right-3 flex flex-col space-y-1.5 z-20">
          <div className="bg-[#111827]/90 backdrop-blur-md border border-[#374151] rounded-xl p-1 flex flex-col space-y-1 shadow-lg">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 1, 18))}
              className="p-1.5 rounded-lg hover:bg-[#1F2937] text-[#F9FAFB] hover:text-[#14B8A6] transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 1, 12))}
              className="p-1.5 rounded-lg hover:bg-[#1F2937] text-[#F9FAFB] hover:text-[#14B8A6] transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMapStyle((s) => (s === 'dark' ? 'satellite' : 'dark'))}
            className="p-2 rounded-xl bg-[#111827]/90 backdrop-blur-md border border-[#374151] text-[#CBD5E1] hover:text-[#14B8A6] shadow-lg transition-colors cursor-pointer"
            title="Toggle Map Style"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom-Left Quick Travel Estimate Badge */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#111827]/90 backdrop-blur-md border border-[#374151] text-xs text-[#F9FAFB] shadow-lg">
          <div className="flex items-center space-x-1 text-[#14B8A6]">
            <Car className="w-3.5 h-3.5" />
            <span className="font-mono font-bold">4m</span>
          </div>
          <span className="text-[#94A3B8]">•</span>
          <div className="flex items-center space-x-1 text-[#CBD5E1]">
            <Footprints className="w-3.5 h-3.5" />
            <span className="font-mono">11m walk</span>
          </div>
        </div>

      </div>

      {/* Nearby Key Landmarks & Transit Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Landmarks Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-3 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">
            <Building className="w-4 h-4 text-[#14B8A6]" />
            <span>Notable Landmarks Nearby</span>
          </div>
          <div className="space-y-2">
            {landmarks.map((lm) => (
              <div key={lm.name} className="flex items-center justify-between text-xs py-1 border-b border-[#E5E7EB] dark:border-[#374151]/50 last:border-0">
                <div>
                  <div className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{lm.name}</div>
                  <div className="text-[10px] text-[#6B7280] dark:text-[#94A3B8]">{lm.type}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[#14B8A6] font-bold text-[11px]">{lm.distance}</div>
                  <div className="text-[10px] text-[#6B7280] dark:text-[#94A3B8]">{lm.travelTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transport & Access Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-3 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">
            <Car className="w-4 h-4 text-[#14B8A6]" />
            <span>Transport & Arrival Access</span>
          </div>
          <div className="space-y-2.5 text-xs text-[#4B5563] dark:text-[#CBD5E1]">
            <div className="flex items-start space-x-2.5 p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151]">
              <Car className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#111827] dark:text-[#F9FAFB]">Ride-Hailing Drop-Off:</span> Dedicated Uber / Bolt curb zone directly in front of main entrance gate.
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151]">
              <ShieldCheck className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#111827] dark:text-[#F9FAFB]">Secure On-Site Parking:</span> 24/7 gated parking with dedicated security guards and valet assist.
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151]">
              <Bus className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#111827] dark:text-[#F9FAFB]">Public Transit:</span> 5-minute walk to major bus corridor and commercial junction.
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

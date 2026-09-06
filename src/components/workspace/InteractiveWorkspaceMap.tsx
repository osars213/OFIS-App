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
          <h3 className="text-lg font-bold text-[#F2F2F2]">Location & Surroundings</h3>
          <p className="text-xs text-[#9EABA3]">
            {locationLabel}
          </p>
        </div>

        {/* Navigation CTAs */}
        <div className="flex items-center space-x-2">
          {onOpenDirections && (
            <button
              type="button"
              onClick={onOpenDirections}
              className="px-3.5 py-2 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 fill-[#0D0D0D]" />
              <span>In-App Directions</span>
            </button>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-[#141816] hover:bg-[#1E2522] border border-[#1E2522] text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2] flex items-center space-x-1 transition-all"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-[#718079]" />
          </a>
        </div>
      </div>

      {/* Interactive Map Visual Container */}
      <div className="relative w-full h-72 sm:h-80 rounded-3xl overflow-hidden bg-[#141816] border border-[#1E2522] shadow-xl select-none group">
        
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
            backgroundImage: 'linear-gradient(#232D28 1px, transparent 1px), linear-gradient(90deg, #232D28 1px, transparent 1px)',
            backgroundSize: `${20 * (zoomLevel / 14)}px ${20 * (zoomLevel / 14)}px`
          }} />

          {/* Arterial Road Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-1/3 left-0 right-0 h-2 bg-[#2a3830] transform -rotate-3" />
            <div className="absolute top-0 bottom-0 left-1/2 w-3 bg-[#2a3830] transform rotate-12" />
            <div className="absolute bottom-1/4 left-0 right-0 h-1.5 bg-[#00C878]/30 transform rotate-6" />
          </div>

          {/* Interactive Workspace Pin with Ripple Halo */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Animated Pulse Waves */}
            <div className="absolute -inset-4 rounded-full bg-[#00C878]/25 animate-ping" />
            <div className="absolute -inset-8 rounded-full bg-[#00C878]/10 animate-pulse" />

            {/* Central Pin Marker */}
            <div className="p-3 rounded-2xl bg-[#00C878] text-[#0D0D0D] shadow-2xl ring-4 ring-[#00C878]/30 flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer">
              <MapPin className="w-6 h-6 fill-[#0D0D0D] stroke-[2.5]" />
            </div>

            {/* Floating Space Label Card */}
            <div className="mt-2 px-3 py-1.5 rounded-xl bg-[#0D0D0D]/90 backdrop-blur-md border border-[#232D28] text-center shadow-xl">
              <div className="text-xs font-bold text-[#F2F2F2] max-w-[200px] truncate">{space.title}</div>
              <div className="text-[10px] text-[#00C878] font-mono font-semibold">{space.neighborhood}</div>
            </div>
          </div>

          {/* Nearby Landmark Pins on Map */}
          {landmarks.slice(0, 2).map((lm, idx) => (
            <div
              key={lm.name}
              className={`absolute z-10 flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#141816]/90 backdrop-blur-md border border-[#232D28] text-[10px] text-[#9EABA3] shadow-md ${
                idx === 0 ? 'top-10 left-10' : 'bottom-12 right-12'
              }`}
            >
              <Building className="w-3 h-3 text-[#718079]" />
              <span className="truncate max-w-[120px]">{lm.name}</span>
              <span className="text-[#00C878] font-mono">({lm.distance})</span>
            </div>
          ))}

        </div>

        {/* Top-Right Map Controls (Zoom & Style) */}
        <div className="absolute top-3 right-3 flex flex-col space-y-1.5 z-20">
          <div className="bg-[#141816]/90 backdrop-blur-md border border-[#232D28] rounded-xl p-1 flex flex-col space-y-1 shadow-lg">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 1, 18))}
              className="p-1.5 rounded-lg hover:bg-[#232D28] text-[#F2F2F2] hover:text-[#00C878] transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 1, 12))}
              className="p-1.5 rounded-lg hover:bg-[#232D28] text-[#F2F2F2] hover:text-[#00C878] transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMapStyle((s) => (s === 'dark' ? 'satellite' : 'dark'))}
            className="p-2 rounded-xl bg-[#141816]/90 backdrop-blur-md border border-[#232D28] text-[#9EABA3] hover:text-[#00C878] shadow-lg transition-colors cursor-pointer"
            title="Toggle Map Style"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom-Left Quick Travel Estimate Badge */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#0D0D0D]/90 backdrop-blur-md border border-[#232D28] text-xs text-[#F2F2F2] shadow-lg">
          <div className="flex items-center space-x-1 text-[#00C878]">
            <Car className="w-3.5 h-3.5" />
            <span className="font-mono font-bold">4m</span>
          </div>
          <span className="text-[#718079]">•</span>
          <div className="flex items-center space-x-1 text-[#9EABA3]">
            <Footprints className="w-3.5 h-3.5" />
            <span className="font-mono">11m walk</span>
          </div>
        </div>

      </div>

      {/* Nearby Key Landmarks & Transit Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Landmarks Card */}
        <div className="p-4 rounded-2xl bg-[#141816] border border-[#1E2522] space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#F2F2F2]">
            <Building className="w-4 h-4 text-[#00C878]" />
            <span>Notable Landmarks Nearby</span>
          </div>
          <div className="space-y-2">
            {landmarks.map((lm) => (
              <div key={lm.name} className="flex items-center justify-between text-xs py-1 border-b border-[#1E2522]/50 last:border-0">
                <div>
                  <div className="font-semibold text-[#F2F2F2]">{lm.name}</div>
                  <div className="text-[10px] text-[#718079]">{lm.type}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[#00C878] font-bold text-[11px]">{lm.distance}</div>
                  <div className="text-[10px] text-[#718079]">{lm.travelTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transport & Access Card */}
        <div className="p-4 rounded-2xl bg-[#141816] border border-[#1E2522] space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#F2F2F2]">
            <Car className="w-4 h-4 text-[#00C878]" />
            <span>Transport & Arrival Access</span>
          </div>
          <div className="space-y-2.5 text-xs text-[#9EABA3]">
            <div className="flex items-start space-x-2.5 p-2 rounded-xl bg-[#18201B] border border-[#232D28]">
              <Car className="w-4 h-4 text-[#00C878] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#F2F2F2]">Ride-Hailing Drop-Off:</span> Dedicated Uber / Bolt curb zone directly in front of main entrance gate.
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2 rounded-xl bg-[#18201B] border border-[#232D28]">
              <ShieldCheck className="w-4 h-4 text-[#00C878] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#F2F2F2]">Secure On-Site Parking:</span> 24/7 gated parking with dedicated security guards and valet assist.
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2 rounded-xl bg-[#18201B] border border-[#232D28]">
              <Bus className="w-4 h-4 text-[#00C878] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#F2F2F2]">Public Transit:</span> 5-minute walk to major bus corridor and commercial junction.
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

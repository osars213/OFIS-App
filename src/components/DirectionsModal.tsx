import React from 'react';
import { X, Navigation, MapPin, ExternalLink, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatLocationFull, extractStructuredLocation } from '../utils/location';

export const DirectionsModal: React.FC = () => {
  const { isDirectionsOpen, setIsDirectionsOpen, directionsSpace } = useApp();

  if (!isDirectionsOpen || !directionsSpace) return null;

  const loc = extractStructuredLocation(directionsSpace);
  const locationLabel = formatLocationFull(directionsSpace);

  const googleMapsUrl = loc.hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(directionsSpace.title)}&ll=${loc.latitude},${loc.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${directionsSpace.title}, ${locationLabel}`)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-[#07383D] rounded-3xl border border-[#E2ECEB] dark:border-[#166D74] shadow-2xl p-6 space-y-6">
        
        <div className="flex items-center justify-between border-b border-[#E2ECEB] dark:border-[#166D74] pb-4">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-[#14BEB8]" />
            <h3 className="text-lg font-bold text-[#12383B] dark:text-white">Transit &amp; Navigation</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsDirectionsOpen(false)}
            className="p-2 rounded-xl text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] space-y-2">
            <h4 className="text-sm font-bold text-[#12383B] dark:text-white">{directionsSpace.title}</h4>
            <div className="flex items-start space-x-2 text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
              <MapPin className="w-4 h-4 text-[#14BEB8] shrink-0 mt-0.5" />
              <span>{locationLabel}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
            <p className="font-semibold text-[#12383B] dark:text-white">Landmarks &amp; Parking Guide:</p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">
              <li>Secure on-site basement parking available for pass holders</li>
              <li>Turnstile security check requires digital QR access code</li>
              <li>Ride-hailing drop-off point directly in front of main atrium</li>
            </ul>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-2xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Open in Google Maps / Apple Maps</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};

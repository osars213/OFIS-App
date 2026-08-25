import React from 'react';
import { X, Navigation, MapPin, ExternalLink, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DirectionsModal: React.FC = () => {
  const { isDirectionsOpen, setIsDirectionsOpen, directionsSpace } = useApp();

  if (!isDirectionsOpen || !directionsSpace) return null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${directionsSpace.title}, ${directionsSpace.address}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-6 space-y-6">
        
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-4">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-[#00C878]" />
            <h3 className="text-lg font-bold text-[#F2F2F2]">Transit & Navigation</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsDirectionsOpen(false)}
            className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] space-y-2">
            <h4 className="text-sm font-bold text-[#F2F2F2]">{directionsSpace.title}</h4>
            <div className="flex items-start space-x-2 text-xs text-[#9EABA3]">
              <MapPin className="w-4 h-4 text-[#00C878] shrink-0 mt-0.5" />
              <span>{directionsSpace.address}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-[#9EABA3]">
            <p className="font-semibold text-[#F2F2F2]">Landmarks & Parking Guide:</p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-[#718079]">
              <li>Secure on-site basement parking available for pass holders</li>
              <li>Turnstile security check requires digital QR access code</li>
              <li>Ride-hailing drop-off point directly in front of main atrium</li>
            </ul>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-2xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-all"
          >
            <span>Open in Google Maps / Apple Maps</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { X, Navigation, Copy, MapPin, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DirectionsModal: React.FC = () => {
  const { directionsData, setDirectionsData, showToast } = useApp();

  if (!directionsData) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${directionsData.title}, ${directionsData.address}, ${directionsData.city}`);
      showToast('Address copied to clipboard');
    }
  };

  const handleOpenMaps = () => {
    const query = encodeURIComponent(`${directionsData.address}, ${directionsData.city}, Nigeria`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-[#141816] rounded-2xl border border-[#232D28] shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#00C878]" />
            <h3 className="text-sm font-bold text-[#F2F2F2]">Space Location & Directions</h3>
          </div>
          <button
            type="button"
            onClick={() => setDirectionsData(null)}
            className="p-1 rounded-lg text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#1A231E]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#161D19] border border-[#1E2522] space-y-2">
            <h4 className="text-xs font-bold text-[#F2F2F2]">{directionsData.title}</h4>
            <p className="text-xs text-[#9EABA3] flex items-start gap-1.5 leading-relaxed">
              <MapPin className="w-4 h-4 text-[#00C878] shrink-0 mt-0.5" />
              <span>{directionsData.address}, {directionsData.city}</span>
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleOpenMaps}
              className="w-full py-2.5 px-3 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in Google Maps / Navigation</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 px-3 rounded-xl bg-[#161D19] hover:bg-[#1C2420] border border-[#232D28] text-xs font-semibold text-[#F2F2F2] flex items-center justify-center gap-2 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-[#00C878]" />
              <span>Copy Full Address</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

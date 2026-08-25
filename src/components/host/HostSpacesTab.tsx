import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Clock, 
  MapPin, 
  Zap, 
  Wifi, 
  Star, 
  Sliders, 
  Image as ImageIcon, 
  Check, 
  X, 
  Upload, 
  ChevronRight,
  ShieldCheck,
  Power,
  ToggleLeft,
  ToggleRight,
  AlertCircle
} from 'lucide-react';
import { Space } from '../../types';
import { useApp } from '../../context/AppContext';

interface HostSpacesTabProps {
  hostSpaces: Space[];
  onSelectSpaceForPricing: (space: Space) => void;
  onSelectSpaceForCalendar: (space: Space) => void;
}

export const HostSpacesTab: React.FC<HostSpacesTabProps> = ({
  hostSpaces,
  onSelectSpaceForPricing,
  onSelectSpaceForCalendar,
}) => {
  const { 
    setIsListSpaceModalOpen, 
    setEditingSpace, 
    setIsEditSpaceModalOpen, 
    toggleSpaceActive,
    deleteSpace,
    updateSpacePhotos,
    updateSpaceAmenities,
    updateSpaceOperatingHours,
    formatPrice,
    setSelectedSpaceId,
    setCurrentView
  } = useApp();

  // Photo Management Modal state
  const [photoModalSpace, setPhotoModalSpace] = useState<Space | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  
  // Amenities Management Modal state
  const [amenityModalSpace, setAmenityModalSpace] = useState<Space | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Operating Hours Modal state
  const [hoursModalSpace, setHoursModalSpace] = useState<Space | null>(null);
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('20:00');
  const [activeDays, setActiveDays] = useState('Mon - Sat');

  const ALL_COMMON_AMENITIES = [
    '24/7 Power (Dual Genset)',
    'Solar Inverter Backup',
    'Starlink 500Mbps High-Speed Wi-Fi',
    'Fiber Optic Internet (1Gbps)',
    'Dual-Screen Monitor Stations',
    'Ergonomic Herman Miller Chairs',
    'Dedicated Meeting & Boardrooms',
    'Soundproof Podcast Booth',
    'Specialty Coffee & Espresso Bar',
    'Access-Controlled Smart Turnstiles',
    'CCTV & 24/7 On-Site Security',
    'Free Secure Underground Parking',
    'Air Conditioning & Climate Control',
    'Outdoor Work Terrace'
  ];

  const handleOpenPhotoManager = (space: Space) => {
    setPhotoModalSpace(space);
    setNewPhotoUrl('');
  };

  const handleAddPhoto = () => {
    if (!photoModalSpace || !newPhotoUrl.trim()) return;
    const currentImages = photoModalSpace.images || [photoModalSpace.featuredImage];
    const updated = [...currentImages, newPhotoUrl.trim()];
    updateSpacePhotos(photoModalSpace.id, updated);
    setPhotoModalSpace({ ...photoModalSpace, images: updated });
    setNewPhotoUrl('');
  };

  const handleRemovePhoto = (idx: number) => {
    if (!photoModalSpace) return;
    const currentImages = photoModalSpace.images || [photoModalSpace.featuredImage];
    const updated = currentImages.filter((_, i) => i !== idx);
    updateSpacePhotos(photoModalSpace.id, updated, updated[0]);
    setPhotoModalSpace({ ...photoModalSpace, images: updated });
  };

  const handleOpenAmenityManager = (space: Space) => {
    setAmenityModalSpace(space);
    setSelectedAmenities(space.amenities || []);
  };

  const handleToggleAmenity = (item: string) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  const handleSaveAmenities = () => {
    if (!amenityModalSpace) return;
    updateSpaceAmenities(amenityModalSpace.id, selectedAmenities);
    setAmenityModalSpace(null);
  };

  const handleOpenHoursManager = (space: Space) => {
    setHoursModalSpace(space);
    setOpenTime(space.operatingHours?.open || '08:00');
    setCloseTime(space.operatingHours?.close || '20:00');
    setActiveDays(space.operatingHours?.days || 'Mon - Sat');
  };

  const handleSaveHours = () => {
    if (!hoursModalSpace) return;
    updateSpaceOperatingHours(hoursModalSpace.id, {
      open: openTime,
      close: closeTime,
      days: activeDays,
    });
    setHoursModalSpace(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F2F2F2]">Workspace Listings & Hub Portfolio</h2>
          <p className="text-xs text-[#718079]">
            Manage spaces, live availability, photo galleries, amenities, and operating schedules
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsListSpaceModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-[#00C878]/15 cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Workspace</span>
        </button>
      </div>

      {/* Workspace Listings Grid */}
      {hostSpaces.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#141816] border border-[#1E2522] space-y-4">
          <Building2 className="w-12 h-12 text-[#232D28] mx-auto" />
          <h3 className="text-base font-bold text-[#F2F2F2]">No Workspaces Published Yet</h3>
          <p className="text-xs text-[#718079] max-w-sm mx-auto">
            List your coworking hub, meeting suites, or hot desks to start accepting bookings across Nigeria.
          </p>
          <button
            type="button"
            onClick={() => setIsListSpaceModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#00C878] text-[#0D0D0D] font-bold text-xs"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hostSpaces.map((space) => {
            const isActive = space.isActive !== false;
            const images = space.images?.length ? space.images : [space.featuredImage];

            return (
              <div
                key={space.id}
                className="rounded-3xl bg-[#141816] border border-[#1E2522] overflow-hidden hover:border-[#2A3630] transition-all flex flex-col justify-between group"
              >
                {/* Image Banner */}
                <div className="relative h-48 w-full bg-[#18201B] overflow-hidden">
                  <img
                    src={space.featuredImage || images[0]}
                    alt={space.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay Badges */}
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 backdrop-blur-md ${
                      isActive 
                        ? 'bg-[#00C878]/90 text-[#0D0D0D]' 
                        : 'bg-black/70 text-[#FF5C5C] border border-[#FF5C5C]/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#0D0D0D]' : 'bg-[#FF5C5C]'}`} />
                      <span>{isActive ? 'Live & Bookable' : 'Temporarily Paused'}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-[#F2F2F2] backdrop-blur-md">
                      {space.category.toUpperCase()}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={() => toggleSpaceActive(space.id)}
                      title={isActive ? 'Pause listing' : 'Activate listing'}
                      className="p-2 rounded-xl bg-black/60 hover:bg-black text-[#F2F2F2] backdrop-blur-md cursor-pointer transition-colors"
                    >
                      <Power className={`w-4 h-4 ${isActive ? 'text-[#00C878]' : 'text-[#718079]'}`} />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-[#00C878] text-[#00C878]" />
                      <span className="font-bold">{space.rating || 4.9}</span>
                      <span className="text-[#9EABA3]">({space.reviewsCount || 42} reviews)</span>
                    </div>
                    <div className="font-mono font-bold text-[#00C878]">
                      {formatPrice(space.pricePerHour, { perHour: true })}
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-[#F2F2F2] line-clamp-1 group-hover:text-[#00C878] transition-colors">
                      {space.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-[#718079]">
                      <MapPin className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
                      <span className="line-clamp-1">{space.neighborhood}, {space.city}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[11px] text-[#9EABA3]">
                      <Clock className="w-3.5 h-3.5 text-[#718079]" />
                      <span>{space.operatingHours?.days || 'Mon - Sat'} • {space.operatingHours?.open || '08:00'} - {space.operatingHours?.close || '20:00'}</span>
                    </div>
                  </div>

                  {/* Amenities Preview */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(space.amenities || []).slice(0, 3).map((amenity, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-[#18201B] text-[#9EABA3] border border-[#232D28] line-clamp-1">
                        {amenity}
                      </span>
                    ))}
                    {(space.amenities?.length || 0) > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-[#18201B] text-[#718079]">
                        +{(space.amenities?.length || 0) - 3}
                      </span>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-[#1E2522] grid grid-cols-4 gap-1 text-[11px]">
                    
                    {/* 1. Edit Space */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSpace(space);
                        setIsEditSpaceModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-[#18201B] hover:bg-[#232D28] text-[#F2F2F2] flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors"
                      title="Edit Space Info"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#00C878]" />
                      <span className="text-[9px]">Edit</span>
                    </button>

                    {/* 2. Photo Manager */}
                    <button
                      type="button"
                      onClick={() => handleOpenPhotoManager(space)}
                      className="p-2 rounded-xl bg-[#18201B] hover:bg-[#232D28] text-[#F2F2F2] flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors"
                      title="Photo Gallery"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#00C878]" />
                      <span className="text-[9px]">Photos</span>
                    </button>

                    {/* 3. Amenities */}
                    <button
                      type="button"
                      onClick={() => handleOpenAmenityManager(space)}
                      className="p-2 rounded-xl bg-[#18201B] hover:bg-[#232D28] text-[#F2F2F2] flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors"
                      title="Manage Amenities"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#00C878]" />
                      <span className="text-[9px]">Amenities</span>
                    </button>

                    {/* 4. Pricing / Calendar */}
                    <button
                      type="button"
                      onClick={() => onSelectSpaceForPricing(space)}
                      className="p-2 rounded-xl bg-[#18201B] hover:bg-[#232D28] text-[#F2F2F2] flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors"
                      title="Pricing Rules"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#00C878]" />
                      <span className="text-[9px]">Pricing</span>
                    </button>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Manager Modal */}
      {photoModalSpace && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1E2522] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#F2F2F2]">Photo Gallery & Visual Assets</h3>
                <p className="text-xs text-[#718079]">{photoModalSpace.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setPhotoModalSpace(null)}
                className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo List */}
            <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
              {(photoModalSpace.images || [photoModalSpace.featuredImage]).map((img, idx) => (
                <div key={idx} className="relative group rounded-2xl overflow-hidden h-28 bg-[#18201B] border border-[#232D28]">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#00C878] text-[#0D0D0D] font-bold text-[9px]">
                      Featured Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/80 hover:bg-[#FF5C5C] text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Photo URL Input */}
            <div className="space-y-2 pt-2 border-t border-[#1E2522]">
              <label className="text-xs font-semibold text-[#9EABA3]">Add High-Resolution Image URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] placeholder-[#718079] focus:outline-none focus:border-[#00C878]"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  disabled={!newPhotoUrl.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-[#00C878] hover:bg-[#00E58B] disabled:opacity-40 text-[#0D0D0D] font-bold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPhotoModalSpace(null)}
                className="px-5 py-2.5 rounded-2xl bg-[#18201B] hover:bg-[#232D28] text-[#F2F2F2] font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Amenities Manager Modal */}
      {amenityModalSpace && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1E2522] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#F2F2F2]">Manage Workspace Amenities</h3>
                <p className="text-xs text-[#718079]">{amenityModalSpace.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setAmenityModalSpace(null)}
                className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#9EABA3]">
              Select all verified facility amenities available at this location:
            </p>

            {/* Amenities Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
              {ALL_COMMON_AMENITIES.map((amenity, i) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878] font-bold'
                        : 'bg-[#18201B] border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2]'
                    }`}
                  >
                    <span className="pr-2">{amenity}</span>
                    {isSelected && <Check className="w-4 h-4 shrink-0 text-[#00C878]" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-[#1E2522]">
              <button
                type="button"
                onClick={() => setAmenityModalSpace(null)}
                className="px-4 py-2 rounded-xl bg-[#18201B] text-[#9EABA3] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAmenities}
                className="px-5 py-2.5 rounded-2xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs cursor-pointer shadow-md"
              >
                Save Amenities
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

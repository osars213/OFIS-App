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
  AlertCircle,
  AlertTriangle,
  Mail,
  Sparkles,
  Lock
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
    currentUser,
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
    setCurrentView,
    setIsAdminReviewModalOpen,
    setAdminReviewSpace,
    openEmailVerificationModal,
    verifyUserEmail,
  } = useApp();

  const isEmailVerified = currentUser?.isEmailVerified ?? false;

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
    'High-Speed Fiber Internet',
    'Starlink Satellite Failover',
    'Air Conditioning (HVAC)',
    'Private Meeting Booths',
    'Turnstile QR Access Gate',
    'Specialty Coffee Bar & Tea',
    'Ergonomic Herman Miller Chairs',
    'Soundproof Podcast Studio',
    'Free Secure Underground Parking',
    'Executive Boardroom Display',
    'On-site Cafe & Kitchenette',
    'Lockers & Storage Cubbies',
  ];

  const handleOpenPhotoManager = (space: Space) => {
    setPhotoModalSpace(space);
    setNewPhotoUrl('');
  };

  const handleAddPhoto = () => {
    if (!photoModalSpace || !newPhotoUrl.trim()) return;
    const currentPhotos = photoModalSpace.images?.length ? [...photoModalSpace.images] : [photoModalSpace.featuredImage];
    const updatedPhotos = [...currentPhotos, newPhotoUrl.trim()];
    updateSpacePhotos(photoModalSpace.id, updatedPhotos);
    setPhotoModalSpace({ ...photoModalSpace, images: updatedPhotos });
    setNewPhotoUrl('');
  };

  const handleRemovePhoto = (index: number) => {
    if (!photoModalSpace) return;
    const currentPhotos = photoModalSpace.images?.length ? [...photoModalSpace.images] : [photoModalSpace.featuredImage];
    const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
    const finalPhotos = updatedPhotos.length > 0 ? updatedPhotos : [photoModalSpace.featuredImage];
    updateSpacePhotos(photoModalSpace.id, finalPhotos);
    setPhotoModalSpace({ ...photoModalSpace, images: finalPhotos });
  };

  const handleOpenAmenityManager = (space: Space) => {
    setAmenityModalSpace(space);
    setSelectedAmenities(space.amenities || []);
  };

  const handleToggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
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
      
      {/* Host Email Verification Alert Banner */}
      {!isEmailVerified && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Host Email Verification Required</h4>
                <span className="text-[9px] uppercase font-mono bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Action Needed
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                New workspace listings and automated payouts are paused until your email (<span className="text-[#111827] dark:text-[#F9FAFB] font-mono font-semibold">{currentUser?.email}</span>) is confirmed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openEmailVerificationModal('listing')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Verify Host Email</span>
            </button>
            <button
              type="button"
              onClick={() => verifyUserEmail()}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer shadow-xs"
              title="Instant 1-tap verification for testing"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Tap</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827] dark:text-[#F9FAFB]">Workspace Listings & Hub Portfolio</h2>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            Manage spaces, live availability, photo galleries, amenities, and operating schedules
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isEmailVerified) {
              openEmailVerificationModal('listing');
            } else {
              setIsListSpaceModalOpen(true);
            }
          }}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-sm cursor-pointer active:scale-95 transition-all ${
            !isEmailVerified
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-[#16A34A] hover:bg-[#15803D] text-white'
          }`}
        >
          {!isEmailVerified ? (
            <>
              <Lock className="w-4 h-4" />
              <span>Verify Email to Add Workspace</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add New Workspace</span>
            </>
          )}
        </button>
      </div>

      {/* Workspace Listings Grid */}
      {hostSpaces.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-4 shadow-xs">
          <Building2 className="w-12 h-12 text-[#6B7280] dark:text-[#9CA3AF] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#111827] dark:text-[#F9FAFB]">No Workspaces Published Yet</h3>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] max-w-sm mx-auto">
            List your coworking hub, meeting suites, or hot desks to start accepting bookings across Nigeria.
          </p>
          <button
            type="button"
            onClick={() => setIsListSpaceModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-xs cursor-pointer"
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
                className="rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] overflow-hidden hover:border-[#16A34A]/50 transition-all flex flex-col justify-between group shadow-xs"
              >
                {/* Image Banner */}
                <div className="relative h-48 w-full bg-[#F1F5F9] dark:bg-[#111827] overflow-hidden">
                  <img
                    src={space.featuredImage || images[0]}
                    alt={space.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center max-w-[80%]">
                    {/* Verification Status Badge */}
                    {space.verificationStatus === 'pending' || (space.isVerified === false && space.verificationStatus !== 'rejected') ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 text-white backdrop-blur-md flex items-center space-x-1 shadow-xs">
                        <Clock className="w-3 h-3" />
                        <span>Pending Admin Review</span>
                      </span>
                    ) : space.verificationStatus === 'rejected' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/90 text-white backdrop-blur-md flex items-center space-x-1 shadow-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>Action Required</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#16A34A]/90 text-white backdrop-blur-md flex items-center space-x-1 shadow-xs">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}

                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 backdrop-blur-md ${
                      isActive 
                        ? 'bg-black/60 text-[#16A34A]' 
                        : 'bg-black/70 text-red-400 border border-red-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#16A34A]' : 'bg-red-500'}`} />
                      <span>{isActive ? 'Active' : 'Paused'}</span>
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={() => toggleSpaceActive(space.id)}
                      title={isActive ? 'Pause listing' : 'Activate listing'}
                      className="p-2 rounded-xl bg-black/60 hover:bg-black text-white backdrop-blur-md cursor-pointer transition-colors shadow-xs"
                    >
                      <Power className={`w-4 h-4 ${isActive ? 'text-[#16A34A]' : 'text-neutral-400'}`} />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-[#16A34A] text-[#16A34A]" />
                      <span className="font-bold">{space.rating || 4.9}</span>
                      <span className="text-neutral-300">({space.reviewsCount || 42} reviews)</span>
                    </div>
                    <div className="font-mono font-bold text-[#16A34A]">
                      {formatPrice(space.pricePerHour, { perHour: true })}
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB] line-clamp-1 group-hover:text-[#16A34A] transition-colors">
                      {space.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      <MapPin className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                      <span className="line-clamp-1">{space.neighborhood}, {space.city}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                      <Clock className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#9CA3AF]" />
                      <span>{space.operatingHours?.days || 'Mon - Sat'} • {space.operatingHours?.open || '08:00'} - {space.operatingHours?.close || '20:00'}</span>
                    </div>
                  </div>

                  {/* Amenities Preview */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(space.amenities || []).slice(0, 3).map((amenity, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-[#F1F5F9] dark:bg-[#111827] text-[#6B7280] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#374151] line-clamp-1">
                        {amenity}
                      </span>
                    ))}
                    {(space.amenities?.length || 0) > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-[#F1F5F9] dark:bg-[#111827] text-[#6B7280] dark:text-[#9CA3AF]">
                        +{(space.amenities?.length || 0) - 3}
                      </span>
                    )}
                  </div>

                  {/* Pending Notice Banner */}
                  {(space.verificationStatus === 'pending' || (space.isVerified === false && space.verificationStatus !== 'rejected')) && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-[11px] text-amber-700 dark:text-amber-300">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-semibold">Under Admin Verification</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminReviewSpace(space);
                          setIsAdminReviewModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Inspect Audit
                      </button>
                    </div>
                  )}

                  {space.verificationStatus === 'rejected' && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-[11px] text-red-600 dark:text-red-400">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-semibold">{space.adminReviewNotes || 'Review Notes Attached'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminReviewSpace(space);
                          setIsAdminReviewModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Fix &amp; Review
                      </button>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#374151] grid grid-cols-4 gap-1 text-[11px]">
                    
                    {/* 1. Edit Space */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSpace(space);
                        setIsEditSpaceModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] text-[#111827] dark:text-[#F9FAFB] flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors border border-[#E5E7EB] dark:border-[#374151]"
                      title="Edit Space Info"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span className="text-[9px]">Edit</span>
                    </button>

                    {/* 2. Photo Manager */}
                    <button
                      type="button"
                      onClick={() => handleOpenPhotoManager(space)}
                      className="p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] text-[#111827] dark:text-[#F9FAFB] flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors border border-[#E5E7EB] dark:border-[#374151]"
                      title="Photo Gallery"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span className="text-[9px]">Photos</span>
                    </button>

                    {/* 3. Amenities */}
                    <button
                      type="button"
                      onClick={() => handleOpenAmenityManager(space)}
                      className="p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] text-[#111827] dark:text-[#F9FAFB] flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors border border-[#E5E7EB] dark:border-[#374151]"
                      title="Manage Amenities"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span className="text-[9px]">Amenities</span>
                    </button>

                    {/* 4. Pricing / Calendar */}
                    <button
                      type="button"
                      onClick={() => onSelectSpaceForPricing(space)}
                      className="p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] text-[#111827] dark:text-[#F9FAFB] flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors border border-[#E5E7EB] dark:border-[#374151]"
                      title="Pricing Rules"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#16A34A]" />
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#1F2937] rounded-3xl border border-[#E5E7EB] dark:border-[#374151] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#374151] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F9FAFB]">Photo Gallery & Visual Assets</h3>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{photoModalSpace.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setPhotoModalSpace(null)}
                className="p-2 rounded-xl text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo List */}
            <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
              {(photoModalSpace.images || [photoModalSpace.featuredImage]).map((img, idx) => (
                <div key={idx} className="relative group rounded-2xl overflow-hidden h-28 bg-[#F1F5F9] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151]">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#16A34A] text-white font-bold text-[9px] shadow-xs">
                      Featured Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Photo URL Input */}
            <div className="space-y-2 pt-2 border-t border-[#E5E7EB] dark:border-[#374151]">
              <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">Add High-Resolution Image URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-xs text-[#111827] dark:text-[#F9FAFB] placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#16A34A]"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  disabled={!newPhotoUrl.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer shadow-xs"
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
                className="px-5 py-2.5 rounded-2xl bg-[#F1F5F9] dark:bg-[#374151] hover:bg-[#E2E8F0] dark:hover:bg-[#4B5563] text-[#111827] dark:text-[#F9FAFB] font-bold text-xs cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Amenities Manager Modal */}
      {amenityModalSpace && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#1F2937] rounded-3xl border border-[#E5E7EB] dark:border-[#374151] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#374151] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F9FAFB]">Manage Workspace Amenities</h3>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{amenityModalSpace.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setAmenityModalSpace(null)}
                className="p-2 rounded-xl text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
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
                        ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 border-[#16A34A] text-[#16A34A] font-bold'
                        : 'bg-[#F8FAFC] dark:bg-[#111827] border-[#E5E7EB] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]'
                    }`}
                  >
                    <span className="pr-2">{amenity}</span>
                    {isSelected && <Check className="w-4 h-4 shrink-0 text-[#16A34A]" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-[#E5E7EB] dark:border-[#374151]">
              <button
                type="button"
                onClick={() => setAmenityModalSpace(null)}
                className="px-4 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#374151] text-[#6B7280] dark:text-[#9CA3AF] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAmenities}
                className="px-5 py-2.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs cursor-pointer shadow-sm"
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

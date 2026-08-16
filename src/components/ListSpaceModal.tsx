import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Building2,
  MapPin,
  Wifi,
  Zap,
  ShieldCheck,
  Camera,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Video,
  Mic,
  Briefcase,
  Users,
  MessageCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Upload,
  Calendar,
  CheckCircle2,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PrimaryCategory, SpaceSubcategory } from '../types';
import { OfisLogo } from './OfisLogo';

const SPACE_TYPES = [
  { id: 'coworking_desks', category: 'WORK' as PrimaryCategory, label: 'Coworking', desc: 'Hot desks, shared tables & flex work hubs' },
  { id: 'private_offices', category: 'WORK' as PrimaryCategory, label: 'Private Office', desc: 'Dedicated lockable team rooms & executive suites' },
  { id: 'meeting_rooms', category: 'MEET' as PrimaryCategory, label: 'Meeting Room', desc: 'Client conference rooms & boardrooms' },
  { id: 'podcast_studios', category: 'CREATE' as PrimaryCategory, label: 'Podcast Studio', desc: 'Acoustic broadcast audio recording booths' },
  { id: 'production_spaces', category: 'CREATE' as PrimaryCategory, label: 'Content Creator Studio', desc: 'Creator sets with ring lights & backdrops' },
  { id: 'photography_studios', category: 'CREATE' as PrimaryCategory, label: 'Photography Studio', desc: 'Cyclorama walls, strobes & fashion sets' },
  { id: 'video_studios', category: 'CREATE' as PrimaryCategory, label: 'Video Studio', desc: '4K cinema cameras, green screens & lighting grids' },
  { id: 'event_spaces', category: 'HOST' as PrimaryCategory, label: 'Event Space', desc: 'Product launches, workshops, hackathons & lofts' },
  { id: 'day_offices', category: 'WORK' as PrimaryCategory, label: 'Other', desc: 'Specialized creative suites & executive pods' },
];

const PRESET_PHOTO_COLLECTIONS: { label: string; urls: string[] }[] = [
  {
    label: 'Modern Coworking Hub',
    urls: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&auto=format&fit=crop&q=80',
    ],
  },
  {
    label: '4K Podcast & Creator Studio',
    urls: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&auto=format&fit=crop&q=80',
    ],
  },
  {
    label: 'Executive Boardroom',
    urls: [
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80',
    ],
  },
  {
    label: 'Photography Cyclorama',
    urls: [
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80',
    ],
  },
];

export const ListSpaceModal: React.FC = () => {
  const {
    isListSpaceModalOpen,
    setIsListSpaceModalOpen,
    createSpace,
    currentUser,
    formatPriceNaira,
    showToast,
    setCurrentView,
  } = useApp();

  const [step, setStep] = useState<number>(1);

  // Step 1: Space Type
  const [selectedType, setSelectedType] = useState<string>('coworking_desks');

  // Step 2: Location
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Lekki Phase 1');
  const [city, setCity] = useState('Lagos');
  const [state, setState] = useState('Lagos State');
  const [hasMapPin, setHasMapPin] = useState(true);

  // Step 3: About it
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState<number>(8);
  const [amenities, setAmenities] = useState<string[]>([
    '24/7 Power (Generator + Solar Inverter)',
    'High-Speed Fiber / Starlink Internet',
    'Air Conditioning',
    'Gated Parking & 24/7 Security',
  ]);
  const [customAmenityInput, setCustomAmenityInput] = useState('');

  // Step 4: Photos & Video
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&auto=format&fit=crop&q=80',
  ]);
  const [videoUrl, setVideoUrl] = useState('');
  const [customPhotoInput, setCustomPhotoInput] = useState('');

  // Step 5: Price
  const [hourlyRateNGN, setHourlyRateNGN] = useState<number>(6500);
  const [dailyRateNGN, setDailyRateNGN] = useState<number>(28000);
  const [weeklyRateNGN, setWeeklyRateNGN] = useState<number>(125000);

  // Step 6: Availability
  const [openingHours, setOpeningHours] = useState('8:00 AM - 9:00 PM Daily (24/7 for members)');
  const [availableDays, setAvailableDays] = useState('Monday - Saturday');
  const [minBooking, setMinBooking] = useState('1 hour');
  const [maxBooking, setMaxBooking] = useState('1 month');
  const [doorPIN, setDoorPIN] = useState('8492#');
  const [wifiSSID, setWifiSSID] = useState('OFIS-Fast-5G');
  const [wifiPass, setWifiPass] = useState('NaijaWork2026!');
  const [hostPhone, setHostPhone] = useState(currentUser?.phone || '+2348031234567');

  if (!isListSpaceModalOpen) return null;

  const currentSpaceTypeObj = SPACE_TYPES.find(t => t.id === selectedType) || SPACE_TYPES[0];

  const handleNextStep = () => {
    if (step === 2 && !area.trim()) {
      showToast('Please specify the area/neighborhood of your space', 'warning');
      return;
    }
    if (step === 3 && !name.trim()) {
      showToast('Please provide a name for your space', 'warning');
      return;
    }
    if (step === 4 && images.length === 0) {
      showToast('Please add at least one photo of your space', 'warning');
      return;
    }
    if (step === 5 && (hourlyRateNGN <= 0 || dailyRateNGN <= 0)) {
      showToast('Please provide valid pricing in Naira', 'warning');
      return;
    }

    if (step < 7) {
      setStep(prev => prev + 1);
    }
  };

  const handleAddCustomPhoto = () => {
    if (customPhotoInput.trim()) {
      setImages(prev => [...prev, customPhotoInput.trim()]);
      setCustomPhotoInput('');
    }
  };

  const handleAddAmenity = () => {
    if (customAmenityInput.trim()) {
      setAmenities(prev => [...prev, customAmenityInput.trim()]);
      setCustomAmenityInput('');
    }
  };

  const handlePublish = () => {
    createSpace({
      name: name.trim() || 'Premium OFIS Space',
      tagline: tagline.trim() || `${currentSpaceTypeObj.label} in ${area}, ${city}`,
      description: description.trim() || `High-spec ${currentSpaceTypeObj.label.toLowerCase()} equipped with uninterrupted power, high-speed Starlink internet, and premium facilities.`,
      primaryCategory: currentSpaceTypeObj.category,
      subcategory: selectedType as SpaceSubcategory,
      city,
      neighborhood: area,
      address: address.trim() || `${area}, ${city}, ${state}`,
      capacity: Number(capacity) || 6,
      hourlyRateNGN: Number(hourlyRateNGN),
      dailyRateNGN: Number(dailyRateNGN),
      hourlyRate: +(Number(hourlyRateNGN) / 1550).toFixed(2),
      dailyRate: +(Number(dailyRateNGN) / 1550).toFixed(2),
      openingHours: `${openingHours} (${availableDays})`,
      hostWhatsApp: hostPhone,
      wifiSSID,
      wifiPass,
      doorPIN,
      amenities,
      equipment: ['24/7 Power Failover', 'High-Speed Starlink', 'Ergonomic Seating'],
      images,
    });

    setIsListSpaceModalOpen(false);
    setStep(1);
    setCurrentView('host');
    showToast(`"${name || 'Your space'}" is now published and live on OFIS!`, 'success');
  };

  return (
    <div
      id="ofis-list-space-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
    >
      <div className="bg-[#121212] text-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#242424] animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Modal Header & Progress Indicator */}
        <div className="p-5 sm:p-6 bg-[#161616] border-b border-[#222222] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <OfisLogo size="sm" showTagline={false} />
              <div className="h-4 w-px bg-[#333333]" />
              <span className="text-xs font-bold text-[#00C878] uppercase tracking-wider">
                Step {step} of 7
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsListSpaceModalOpen(false)}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Progress Bar */}
          <div className="w-full bg-[#222222] h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-[#00C878] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Steps Form */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* ========================================================= */}
          {/* STEP 1: What type of space is it?                         */}
          {/* ========================================================= */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-xl font-bold text-white">What type of space is it?</h3>
                <p className="text-xs text-[#9A9A9A] mt-1">
                  Choose the category that best represents your physical location.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {SPACE_TYPES.map((st) => {
                  const isSelected = selectedType === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedType(st.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                        isSelected
                          ? 'bg-[#063B2A] border-[#00C878] shadow-[0_0_15px_rgba(0,200,120,0.15)]'
                          : 'bg-[#181818] border-[#262626] hover:bg-[#202020] hover:border-[#333333]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{st.label}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#101010] text-[#00C878] font-mono">
                            {st.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#888888] mt-0.5">{st.desc}</div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                          isSelected ? 'border-[#00C878] bg-[#00C878] text-[#0D0D0D]' : 'border-stone-600'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: Where is it?                                      */}
          {/* ========================================================= */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-xl font-bold text-white">Where is it located?</h3>
                <p className="text-xs text-[#9A9A9A] mt-1">
                  Provide exact address details for verified guest navigation.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plot 14, Admiralty Way, Lekki"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Area / Neighborhood *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lekki Phase 1"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">City</label>
                    <select
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (e.target.value === 'Abuja') setState('FCT');
                        else if (e.target.value === 'Port Harcourt') setState('Rivers State');
                        else if (e.target.value === 'Ibadan') setState('Oyo State');
                        else setState('Lagos State');
                      }}
                      className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl p-2.5 text-xs text-white outline-none"
                    >
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja">Abuja (FCT)</option>
                      <option value="Port Harcourt">Port Harcourt</option>
                      <option value="Ibadan">Ibadan</option>
                      <option value="Enugu">Enugu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                {/* Location Pin preview badge */}
                <div className="p-3.5 rounded-2xl bg-[#181818] border border-[#2B2B2B] flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs">
                    <MapPin className="w-4 h-4 text-[#00C878]" />
                    <span className="text-stone-300">
                      Location Pin: <strong className="text-white">{area || 'Area'}, {city}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#063B2A] text-[#00C878] font-bold">
                    GPS Calibrated
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: Tell us about it                                  */}
          {/* ========================================================= */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-xl font-bold text-white">Tell us about your space</h3>
                <p className="text-xs text-[#9A9A9A] mt-1">
                  Describe what makes your space productive and comfortable.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Space Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SoundForge Podcast Studio or LeadSpace Desk 4"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Short Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Broadcast studio with Shure mics & Starlink fiber"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Max Capacity (Persons)</label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Host Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={hostPhone}
                      onChange={(e) => setHostPhone(e.target.value)}
                      placeholder="+234 803 123 4567"
                      className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe equipment, environment, lighting, noise levels, and guidelines..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl p-3 text-xs text-white placeholder-stone-600 outline-none"
                  />
                </div>

                {/* Amenities checklist */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">Amenities & Facilities</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {amenities.map((am, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-[#1F1F1F] border border-[#2D2D2D] text-stone-300"
                      >
                        <Check className="w-3 h-3 text-[#00C878]" />
                        <span>{am}</span>
                        <button
                          type="button"
                          onClick={() => setAmenities(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-stone-500 hover:text-stone-300 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom amenity (e.g. Ring light, Soundproof booth)"
                      value={customAmenityInput}
                      onChange={(e) => setCustomAmenityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAmenity();
                        }
                      }}
                      className="flex-1 bg-[#181818] border border-[#2B2B2B] rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddAmenity}
                      className="px-3 py-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-xs font-semibold text-white border border-[#333333]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: Add photos & video                                */}
          {/* ========================================================= */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-xl font-bold text-white">Add photos & video</h3>
                <p className="text-xs text-[#9A9A9A] mt-1">
                  High quality photos increase booking conversion by over 300%.
                </p>
              </div>

              {/* Photo Presets */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-stone-300">Quick Choose Preset Gallery:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_PHOTO_COLLECTIONS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImages(preset.urls)}
                      className="p-2 rounded-xl border border-[#2B2B2B] bg-[#181818] hover:border-[#00C878] text-left transition-all cursor-pointer group"
                    >
                      <div className="h-14 rounded-lg overflow-hidden mb-1.5">
                        <img src={preset.urls[0]} alt={preset.label} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-[10px] font-bold text-white group-hover:text-[#00C878]">
                        {preset.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Photos Grid */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-stone-300">Current Photos ({images.length})</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {images.map((imgUrl, i) => (
                    <div key={i} className="relative h-24 rounded-xl overflow-hidden border border-[#2E2E2E] group">
                      <img src={imgUrl} alt={`Space preview ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 text-red-400 hover:text-red-300 opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Photo URL Input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste Image URL..."
                  value={customPhotoInput}
                  onChange={(e) => setCustomPhotoInput(e.target.value)}
                  className="flex-1 bg-[#181818] border border-[#2B2B2B] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPhoto}
                  className="px-3 py-2 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-xs font-bold text-[#0D0D0D] cursor-pointer"
                >
                  Add Image
                </button>
              </div>

              {/* Optional Video Link */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Video Walkthrough Link <span className="text-stone-500 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Video className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://youtube.com/... or Vimeo link"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-600 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 5: Set your price                                    */}
          {/* ========================================================= */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-xl font-bold text-white">Set your price</h3>
                <p className="text-xs text-[#9A9A9A] mt-1">
                  Specify your hourly, daily, and optional weekly pricing in Nigerian Naira (₦).
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#181818] border border-[#2B2B2B] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Hourly Rate (₦ / hour) *</div>
                      <div className="text-[11px] text-[#888888]">Standard on-demand rate per hour</div>
                    </div>
                    <div className="w-36">
                      <input
                        type="number"
                        min={500}
                        step={500}
                        value={hourlyRateNGN}
                        onChange={(e) => setHourlyRateNGN(Number(e.target.value))}
                        className="w-full bg-[#111111] border border-[#333333] focus:border-[#00C878] rounded-xl p-2.5 text-xs text-right font-black text-[#00C878] outline-none"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-[#262626]" />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Daily Day Pass (₦ / day) *</div>
                      <div className="text-[11px] text-[#888888]">Full day booking discount rate</div>
                    </div>
                    <div className="w-36">
                      <input
                        type="number"
                        min={2000}
                        step={1000}
                        value={dailyRateNGN}
                        onChange={(e) => setDailyRateNGN(Number(e.target.value))}
                        className="w-full bg-[#111111] border border-[#333333] focus:border-[#00C878] rounded-xl p-2.5 text-xs text-right font-black text-[#00C878] outline-none"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-[#262626]" />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Weekly Rate (₦ / week)</div>
                      <div className="text-[11px] text-[#888888]">Optional multi-day pass</div>
                    </div>
                    <div className="w-36">
                      <input
                        type="number"
                        min={10000}
                        step={5000}
                        value={weeklyRateNGN}
                        onChange={(e) => setWeeklyRateNGN(Number(e.target.value))}
                        className="w-full bg-[#111111] border border-[#333333] focus:border-[#00C878] rounded-xl p-2.5 text-xs text-right font-black text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#063B2A]/40 border border-[#00C878]/30 text-xs text-stone-300">
                  ⚡ <strong>OFIS Host Protection:</strong> Payouts are transferred automatically to your verified Nigerian bank account within 24 hours of guest checkout.
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 6: Availability & Access Details                     */}
          {/* ========================================================= */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-xl font-bold text-white">Availability & Access Rules</h3>
                <p className="text-xs text-[#9A9A9A] mt-1">
                  Specify opening hours, booking duration limits, and automated guest access credentials.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Opening Hours</label>
                    <input
                      type="text"
                      value={openingHours}
                      onChange={(e) => setOpeningHours(e.target.value)}
                      placeholder="e.g. 8:00 AM - 9:00 PM Daily"
                      className="w-full bg-[#181818] border border-[#2B2B2B] rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Available Days</label>
                    <input
                      type="text"
                      value={availableDays}
                      onChange={(e) => setAvailableDays(e.target.value)}
                      placeholder="e.g. Monday - Saturday"
                      className="w-full bg-[#181818] border border-[#2B2B2B] rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Minimum Booking</label>
                    <select
                      value={minBooking}
                      onChange={(e) => setMinBooking(e.target.value)}
                      className="w-full bg-[#181818] border border-[#2B2B2B] rounded-xl p-2.5 text-xs text-white outline-none"
                    >
                      <option value="1 hour">1 hour</option>
                      <option value="2 hours">2 hours</option>
                      <option value="Half Day (4 hrs)">Half Day (4 hrs)</option>
                      <option value="Full Day">Full Day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Maximum Booking</label>
                    <select
                      value={maxBooking}
                      onChange={(e) => setMaxBooking(e.target.value)}
                      className="w-full bg-[#181818] border border-[#2B2B2B] rounded-xl p-2.5 text-xs text-white outline-none"
                    >
                      <option value="1 day">1 day</option>
                      <option value="1 week">1 week</option>
                      <option value="1 month">1 month</option>
                      <option value="3 months">3 months</option>
                    </select>
                  </div>
                </div>

                {/* Automated Access Credentials */}
                <div className="p-4 rounded-2xl bg-[#181818] border border-[#2B2B2B] space-y-3">
                  <div className="text-xs font-bold text-[#00C878] uppercase tracking-wider">
                    Automated Guest Credentials (Encrypted on Digital Pass)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Door Keypad PIN</label>
                      <input
                        type="text"
                        value={doorPIN}
                        onChange={(e) => setDoorPIN(e.target.value)}
                        className="w-full bg-[#111111] border border-[#333333] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">WiFi SSID</label>
                      <input
                        type="text"
                        value={wifiSSID}
                        onChange={(e) => setWifiSSID(e.target.value)}
                        className="w-full bg-[#111111] border border-[#333333] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">WiFi Password</label>
                      <input
                        type="text"
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                        className="w-full bg-[#111111] border border-[#333333] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 7: Publish Preview                                   */}
          {/* ========================================================= */}
          {step === 7 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-xl font-bold text-white">Preview & Publish Space</h3>
                <p className="text-xs text-[#9A9A9A] mt-1">
                  Review your listing details before publishing to Nigeria's physical space network.
                </p>
              </div>

              {/* Space Preview Card */}
              <div className="rounded-3xl bg-[#181818] border border-[#2C2C2C] overflow-hidden shadow-xl">
                <div className="relative h-44 w-full">
                  <img
                    src={images[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80'}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-black text-[#00C878] uppercase tracking-wider border border-white/10">
                    {currentSpaceTypeObj.category} • {currentSpaceTypeObj.label}
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-black/85 text-right backdrop-blur-md border border-white/10">
                    <div className="text-xs font-black text-[#00C878]">
                      {formatPriceNaira(hourlyRateNGN)} / hr
                    </div>
                    <div className="text-[10px] text-stone-300">
                      {formatPriceNaira(dailyRateNGN)} / day
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h4 className="text-base font-black text-white">{name || 'Your Space Name'}</h4>
                    <p className="text-xs text-stone-400 mt-0.5">{tagline || `${currentSpaceTypeObj.label} in ${area}`}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <MapPin className="w-3.5 h-3.5 text-[#00C878]" />
                    <span>{address || `${area}, ${city}, ${state}`}</span>
                    <span>•</span>
                    <Users className="w-3.5 h-3.5 text-[#00C878]" />
                    <span>Up to {capacity} people</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {amenities.slice(0, 4).map((am, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-[#242424] text-stone-300">
                        {am}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#063B2A]/40 border border-[#00C878]/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00C878] shrink-0" />
                <p className="text-xs text-stone-300 leading-relaxed">
                  Upon publishing, your space will immediately be discoverable to verified Nigerian coworkers, podcast creators, and remote teams.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 sm:p-6 bg-[#161616] border-t border-[#222222] flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-[#242424] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <button
              type="button"
              id="wizard-next-step-btn"
              onClick={handleNextStep}
              className="py-3 px-6 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,200,120,0.25)]"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              id="wizard-publish-space-btn"
              onClick={handlePublish}
              className="py-3 px-6 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,200,120,0.35)]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish Space</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

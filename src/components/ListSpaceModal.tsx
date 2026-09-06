import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Zap, 
  Wifi, 
  Users, 
  MapPin, 
  Check, 
  Banknote, 
  ShieldCheck, 
  Camera, 
  AlertCircle, 
  Sparkles,
  AlertTriangle,
  Mail,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpaceCategory, CityLocation, PricingBasis, PricingPeriod } from '../types';
import { CATEGORY_DEFINITIONS, getDefaultRateForPeriod, normalizeCategory } from '../utils/pricing';
import { AddressAutocompleteMap, SelectedLocationData } from './location/AddressAutocompleteMap';
import { PhotoUploadManager } from './workspace/PhotoUploadManager';

export const ListSpaceModal: React.FC = () => {
  const { 
    isListSpaceModalOpen, 
    setIsListSpaceModalOpen, 
    currentUser, 
    addNewSpace,
    openEmailVerificationModal,
    verifyUserEmail,
  } = useApp();

  const isEmailVerified = currentUser?.isEmailVerified ?? false;

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<SpaceCategory>('coworking');
  const [city, setCity] = useState<CityLocation>('Lagos');
  const [neighborhood, setNeighborhood] = useState('Victoria Island');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Lagos State');
  const [latitude, setLatitude] = useState<number | undefined>(6.4281);
  const [longitude, setLongitude] = useState<number | undefined>(3.4219);
  const [pricingBasis, setPricingBasis] = useState<PricingBasis>('person');
  const [pricingPeriod, setPricingPeriod] = useState<PricingPeriod>('hour');
  const [rate, setRate] = useState<number | string>(3500);
  const [sessionDurationHours, setSessionDurationHours] = useState(2);
  const [capacity, setCapacity] = useState(10);
  const [internetSpeed, setInternetSpeed] = useState(250);
  const [powerType, setPowerType] = useState('24/7 Redundant Generator + Inverter');
  const [images, setImages] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset form whenever modal is opened to allow listing multiple spaces seamlessly
  useEffect(() => {
    if (isListSpaceModalOpen) {
      setTitle('');
      setTagline('');
      setCategory('coworking');
      setCity('Lagos');
      setNeighborhood('Victoria Island');
      setAddress('');
      setState('Lagos State');
      setLatitude(6.4281);
      setLongitude(3.4219);
      setPricingBasis('person');
      setPricingPeriod('hour');
      setRate(getDefaultRateForPeriod('hour', 'coworking'));
      setSessionDurationHours(2);
      setCapacity(10);
      setInternetSpeed(250);
      setImages([]);
      setFeaturedIndex(0);
      setPhotoError(null);
      setIsSuccess(false);
    }
  }, [isListSpaceModalOpen]);

  // Auto-adjust pricing defaults when category changes
  const handleCategoryChange = (newCategory: SpaceCategory) => {
    const norm = normalizeCategory(newCategory);
    setCategory(norm);
    const def = CATEGORY_DEFINITIONS[norm] || CATEGORY_DEFINITIONS[newCategory];
    if (def) {
      setPricingBasis(def.typicalBasis);
      setPricingPeriod(def.typicalPeriod);
      setRate(getDefaultRateForPeriod(def.typicalPeriod, norm));
      if (def.typicalPeriod === 'session') {
        setSessionDurationHours(2);
      }
    } else {
      setRate(getDefaultRateForPeriod(pricingPeriod, norm));
    }
  };

  const handlePeriodChange = (newPeriod: PricingPeriod) => {
    setPricingPeriod(newPeriod);
    setRate(getDefaultRateForPeriod(newPeriod, category));
  };

  const handleLocationSelect = (loc: SelectedLocationData) => {
    setAddress(loc.address);
    if (loc.neighborhood) setNeighborhood(loc.neighborhood);
    if (loc.city && ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan'].includes(loc.city as string)) {
      setCity(loc.city as CityLocation);
    }
    if (loc.state) setState(loc.state);
    if (loc.latitude !== undefined) setLatitude(loc.latitude);
    if (loc.longitude !== undefined) setLongitude(loc.longitude);
  };

  if (!isListSpaceModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim()) return;

    // 🔒 Gating Check: Host must verify email before listing workspaces
    if (!currentUser.isEmailVerified) {
      openEmailVerificationModal('listing');
      return;
    }

    if (images.length === 0) {
      setPhotoError('Please upload or attach at least 1 photo of your workspace before submitting for Admin Agent verification.');
      return;
    }
    setPhotoError(null);

    const numericRate = typeof rate === 'number' && rate > 0 
      ? rate 
      : Number(rate) > 0 
      ? Number(rate) 
      : getDefaultRateForPeriod(pricingPeriod, category);

    const calculatedPricePerHour = pricingPeriod === 'hour' 
      ? numericRate 
      : pricingPeriod === 'session' 
      ? Math.max(1000, Math.round(numericRate / (sessionDurationHours || 2)))
      : pricingPeriod === 'day'
      ? Math.max(1000, Math.round(numericRate / 8))
      : Math.max(1000, Math.round(numericRate / 160));

    const calculatedPricePerDay = pricingPeriod === 'day'
      ? numericRate
      : calculatedPricePerHour * 7;

    const chosenFeaturedImage = images[featuredIndex] || images[0];

    // Submit space to verification queue
    addNewSpace({
      title,
      tagline: tagline || 'Modern fully-equipped workspace in prime Nigeria',
      description: `${title} is a premier physical work facility offering continuous power, fiber connectivity, and ergonomic seating in ${neighborhood}, ${city}.`,
      category,
      featuredImage: chosenFeaturedImage,
      images: images,
      pricePerHour: calculatedPricePerHour,
      pricePerDay: calculatedPricePerDay,
      pricingBasis,
      pricingPeriod,
      pricingModel: {
        basis: pricingBasis,
        period: pricingPeriod,
        rate: numericRate,
        sessionDurationHours: pricingPeriod === 'session' ? sessionDurationHours : undefined,
        currency: 'NGN',
      },
      currency: 'NGN',
      city,
      neighborhood,
      address,
      state,
      latitude: latitude ?? 6.4281,
      longitude: longitude ?? 3.4219,
      capacity,
      rating: 5.0,
      reviewsCount: 0,
      amenities: ['24/7 Backup Power', 'Fiber Internet', 'Air Conditioning', 'Meeting Room', 'Coffee Bar'],
      hasBackupPower: true,
      powerType,
      powerUptimeGuaranteePercent: 99.9,
      hasHighSpeedInternet: true,
      internetSpeedMbps: internetSpeed,
      internetIsp: 'MainOne Fiber / Starlink Redundant',
      noiseLevel: 'Quiet Focus & Collaboration',
      operatingHours: { open: '08:00', close: '21:00', days: 'Mon - Sat' },
      isSuperhost: false,
      isVerified: false,
      isActive: false,
      verificationStatus: 'pending',
      submittedAt: new Date().toISOString(),
      host: {
        id: currentUser.id || 'host-001',
        name: currentUser.name || 'Workspace Host',
        companyName: currentUser.company || 'Prime Workspace Host',
        avatar: currentUser.avatar,
        phone: currentUser.phone,
        email: currentUser.email,
        rating: 5.0,
        responseRatePercent: 100,
        joinedDate: '2025',
        isVerified: true,
      },
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsListSpaceModalOpen(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00C878]/15 border border-[#00C878]/30 flex items-center justify-center text-[#00C878]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F2F2F2]">List a Workspace on OFIS</h3>
              <p className="text-xs text-[#718079] mt-0.5">Publish your facility with flexible pricing &amp; photo verification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsListSpaceModalOpen(false)}
            className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-[#00C878]/15 border border-[#00C878]/30 text-[#00C878] flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#F2F2F2]">Hub Submitted for Admin Verification!</h4>
              <p className="text-xs text-[#718079] max-w-md mx-auto mt-1.5">
                Your photos and facility specs have been sent to the <span className="text-[#00C878] font-bold">OFIS Admin Verification Agent</span>. Once approved, your listing will go live automatically.
              </p>
            </div>
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#FFB020]/15 text-[#FFB020] text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#FFB020] animate-ping" />
              <span>Status: Pending Admin Agent Review</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Section 1: Basic Info */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F2F2F2]">Workspace Name *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Executive Boardroom Alpha, Victoria Island Cowork Hot Desk"
                  required
                  className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#718079]">Short Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Ultra high-speed fiber & continuous solar generator in Victoria Island"
                  className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#F2F2F2]">Category</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as SpaceCategory)}
                    className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2]"
                  >
                    <option value="coworking">Coworking &amp; Hot Desk</option>
                    <option value="private-office">Private Office</option>
                    <option value="meeting-room">Meeting Room</option>
                    <option value="studio">Creative Studio / Podcast</option>
                    <option value="event-space">Event Space / Hall</option>
                    <option value="training-room">Training Room</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#F2F2F2]">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value as CityLocation)}
                    className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2]"
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja">Abuja</option>
                    <option value="Port Harcourt">Port Harcourt</option>
                    <option value="Ibadan">Ibadan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Photo Uploads (MANDATORY BEFORE PUBLISHING) */}
            <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] space-y-3">
              <PhotoUploadManager
                images={images}
                onChange={setImages}
                featuredIndex={featuredIndex}
                onFeaturedChange={setFeaturedIndex}
                category={category}
                minPhotos={1}
              />
              {photoError && (
                <div className="p-3 rounded-xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 text-xs text-[#FF5C5C] flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}
            </div>

            {/* Section 3: Address & Map */}
            <AddressAutocompleteMap
              initialAddress={address}
              initialCity={city}
              initialNeighborhood={neighborhood}
              initialLat={latitude}
              initialLng={longitude}
              onLocationSelect={handleLocationSelect}
            />

            {/* Section 4: Flexible Pricing Model Configuration */}
            <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#00C878] uppercase flex items-center space-x-1.5">
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Pricing Model &amp; Rate</span>
                </span>
                <span className="text-[10px] text-[#718079]">
                  {pricingBasis === 'person' ? 'Scales with guests' : 'Flat rate for whole space'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-[#9EABA3]">Pricing Basis</label>
                  <select
                    value={pricingBasis}
                    onChange={(e) => setPricingBasis(e.target.value as PricingBasis)}
                    className="w-full p-2 rounded-xl bg-[#141816] border border-[#232D28] text-xs text-[#F2F2F2]"
                  >
                    <option value="person">Per Person (Seat)</option>
                    <option value="space">Per Space (Whole Area)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-[#9EABA3]">Billing Period</label>
                  <select
                    value={pricingPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value as PricingPeriod)}
                    className="w-full p-2 rounded-xl bg-[#141816] border border-[#232D28] text-xs text-[#F2F2F2]"
                  >
                    <option value="hour">Per Hour</option>
                    <option value="day">Per Day</option>
                    <option value="month">Per Month</option>
                    <option value="session">Per Session (Block)</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[11px] text-[#9EABA3]">Rate (₦ NGN)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-[#00C878] font-bold text-xs">₦</span>
                    <input
                      type="number"
                      value={rate === '' || rate === 0 ? '' : rate}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setRate('');
                        } else {
                          const num = parseInt(val, 10);
                          setRate(isNaN(num) ? '' : num);
                        }
                      }}
                      onBlur={() => {
                        if (!rate || Number(rate) <= 0) {
                          setRate(getDefaultRateForPeriod(pricingPeriod, category));
                        }
                      }}
                      placeholder={getDefaultRateForPeriod(pricingPeriod, category).toLocaleString()}
                      required
                      min={500}
                      step={500}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#141816] border border-[#232D28] text-xs text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00C878]"
                    />
                  </div>
                </div>
              </div>

              {pricingPeriod === 'session' && (
                <div className="pt-2 border-t border-[#232D28] flex items-center justify-between">
                  <label className="text-xs text-[#9EABA3]">Session Duration (Hours)</label>
                  <input
                    type="number"
                    value={sessionDurationHours}
                    onChange={(e) => setSessionDurationHours(Number(e.target.value))}
                    min={1}
                    max={12}
                    className="w-24 p-1.5 rounded-lg bg-[#141816] border border-[#232D28] text-xs text-[#F2F2F2] font-mono text-center"
                  />
                </div>
              )}
            </div>

            {/* Section 5: Capacity & Power */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F2F2F2]">Guest Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  required
                  min={1}
                  className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F2F2F2]">Internet Speed (Mbps)</label>
                <input
                  type="number"
                  value={internetSpeed}
                  onChange={(e) => setInternetSpeed(Number(e.target.value))}
                  required
                  min={10}
                  className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2]"
                />
              </div>
            </div>

            {/* Email Verification Gate Banner */}
            {!isEmailVerified && (
              <div className="p-3.5 rounded-2xl bg-[#FFB800]/10 border border-[#FFB800]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[#FFB800]">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold">Host Email Verification Required</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-[#FFB800]/20 text-[#FFB800] px-2 py-0.5 rounded-full font-bold">
                    Gated
                  </span>
                </div>
                <p className="text-[11px] text-[#9EABA3]">
                  To prevent unauthorized space listings and secure automated host payouts, your email (<span className="text-[#F2F2F2] font-mono">{currentUser?.email}</span>) must be verified before submitting listings.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openEmailVerificationModal('listing')}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#FFB800] hover:bg-[#FFC72C] text-[#0D0D0D] text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Verify Host Email Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => verifyUserEmail()}
                    className="py-2 px-3 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                    title="Instant 1-click verification"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>1-Tap</span>
                  </button>
                </div>
              </div>
            )}

            {/* Verification Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-[#00C878]/10 border border-[#00C878]/30 flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#00C878] shrink-0" />
              <p className="text-[11px] text-[#9EABA3]">
                <strong className="text-[#00C878]">Admin Agent Verification:</strong> All submitted workspaces undergo automated audit of photos, power specs, and coordinates before becoming visible to guests.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsListSpaceModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#718079] hover:text-[#F2F2F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center space-x-2 transition-colors cursor-pointer ${
                  !isEmailVerified
                    ? 'bg-[#FFB800] hover:bg-[#FFC72C] text-[#0D0D0D]'
                    : 'bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D]'
                }`}
              >
                {!isEmailVerified ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Verify Email to Submit Listing</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit for Admin Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};


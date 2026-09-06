import React, { useState, useEffect } from 'react';
import { X, Building2, Save, Zap, Wifi, ShieldCheck, MapPin, Banknote, Users, AlertCircle, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Space, SpaceCategory, PricingBasis, PricingPeriod } from '../types';
import { getSpacePricing, getDefaultRateForPeriod, normalizeCategory } from '../utils/pricing';
import { AddressAutocompleteMap, SelectedLocationData } from './location/AddressAutocompleteMap';
import { PhotoUploadManager } from './workspace/PhotoUploadManager';

export const EditSpaceModal: React.FC = () => {
  const { 
    isEditSpaceModalOpen, 
    setIsEditSpaceModalOpen, 
    editingSpace, 
    setEditingSpace, 
    updateSpace 
  } = useApp();

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<SpaceCategory>('coworking');
  const [city, setCity] = useState('Lagos');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Lagos State');
  const [latitude, setLatitude] = useState<number | undefined>(6.4281);
  const [longitude, setLongitude] = useState<number | undefined>(3.4219);
  const [pricingBasis, setPricingBasis] = useState<PricingBasis>('person');
  const [pricingPeriod, setPricingPeriod] = useState<PricingPeriod>('hour');
  const [rate, setRate] = useState<number | string>(2500);
  const [sessionDurationHours, setSessionDurationHours] = useState(2);
  const [capacity, setCapacity] = useState(20);
  const [powerType, setPowerType] = useState<Space['powerType']>('Solar + Inverter');
  const [powerGuarantee, setPowerGuarantee] = useState(99.9);
  const [internetSpeed, setInternetSpeed] = useState(250);
  const [internetIsp, setInternetIsp] = useState('Starlink + Fiber Backup');
  const [images, setImages] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editingSpace) {
      const p = getSpacePricing(editingSpace);
      setTitle(editingSpace.title);
      setTagline(editingSpace.tagline || '');
      setCategory(editingSpace.category);
      setCity(editingSpace.city);
      setNeighborhood(editingSpace.neighborhood);
      setAddress(editingSpace.address);
      setState(editingSpace.state || 'Lagos State');
      setLatitude(editingSpace.latitude);
      setLongitude(editingSpace.longitude);
      setPricingBasis(p.basis);
      setPricingPeriod(p.period);
      setRate(p.rate > 0 ? p.rate : getDefaultRateForPeriod(p.period, editingSpace.category));
      setSessionDurationHours(p.sessionDurationHours || 2);
      setCapacity(editingSpace.capacity);
      setPowerType(editingSpace.powerType);
      setPowerGuarantee(editingSpace.powerUptimeGuaranteePercent || 99.9);
      setInternetSpeed(editingSpace.internetSpeedMbps || 200);
      setInternetIsp(editingSpace.internetIsp || 'Fiber');
      setImages(editingSpace.images && editingSpace.images.length > 0 ? editingSpace.images : (editingSpace.featuredImage ? [editingSpace.featuredImage] : []));
      setFeaturedIndex(0);
      setIsActive(editingSpace.isActive !== false);
    }
  }, [editingSpace]);

  const handleLocationSelect = (loc: SelectedLocationData) => {
    setAddress(loc.address);
    if (loc.neighborhood) setNeighborhood(loc.neighborhood);
    if (loc.city) setCity(loc.city as string);
    if (loc.state) setState(loc.state);
    if (loc.latitude !== undefined) setLatitude(loc.latitude);
    if (loc.longitude !== undefined) setLongitude(loc.longitude);
  };

  if (!isEditSpaceModalOpen || !editingSpace) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

    const chosenFeatured = images[featuredIndex] || images[0] || editingSpace.featuredImage;

    const updated: Space = {
      ...editingSpace,
      title,
      tagline,
      category,
      city,
      neighborhood,
      address,
      state,
      latitude: latitude ?? editingSpace.latitude,
      longitude: longitude ?? editingSpace.longitude,
      featuredImage: chosenFeatured,
      images: images.length > 0 ? images : [chosenFeatured],
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
      capacity: Number(capacity),
      powerType,
      powerUptimeGuaranteePercent: Number(powerGuarantee),
      internetSpeedMbps: Number(internetSpeed),
      internetIsp,
      isActive,
    };

    updateSpace(updated);
    setIsEditSpaceModalOpen(false);
    setEditingSpace(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00C878]/15 text-[#00C878] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F2F2F2]">Edit Workspace Listing</h3>
              <p className="text-xs text-[#718079]">Update pricing, capacity, and location for {editingSpace.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsEditSpaceModalOpen(false);
              setEditingSpace(null);
            }}
            className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Hub Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SpaceCategory)}
                className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
              >
                <option value="coworking">Coworking &amp; Hot Desks</option>
                <option value="private_office">Private Dedicated Office</option>
                <option value="meeting">Meeting &amp; Board Room</option>
                <option value="podcast">Podcast Studio</option>
                <option value="photography">Creative Photo Studio</option>
                <option value="event">Event Space</option>
                <option value="training">Training Room</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#F2F2F2]">Tagline / Short Pitch</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
            />
          </div>

          {/* Photo Management Section */}
          <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] space-y-3">
            <PhotoUploadManager
              images={images}
              onChange={setImages}
              featuredIndex={featuredIndex}
              onFeaturedChange={setFeaturedIndex}
              category={category}
              minPhotos={1}
            />
          </div>

          {/* Location Autocomplete with Live Map Preview */}
          <AddressAutocompleteMap
            initialAddress={address}
            initialCity={city}
            initialNeighborhood={neighborhood}
            initialLat={latitude}
            initialLng={longitude}
            onLocationSelect={handleLocationSelect}
          />

          {/* Flexible Pricing Model Configuration */}
          <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#00C878] uppercase flex items-center space-x-1.5">
                <Banknote className="w-3.5 h-3.5" />
                <span>Pricing Model &amp; Rates</span>
              </span>
              <span className="text-[10px] text-[#718079]">
                {pricingBasis === 'person' ? 'Scales per person' : 'Flat rate for space'}
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
                  onChange={(e) => {
                    const newP = e.target.value as PricingPeriod;
                    setPricingPeriod(newP);
                    setRate(getDefaultRateForPeriod(newP, category));
                  }}
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
                    min="500"
                    step="500"
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
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#141816] border border-[#232D28] text-xs text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00C878]"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Max Capacity</label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#718079]" />
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  required
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00C878]"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Neighborhood / Area</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g. Victoria Island"
                className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
              />
            </div>
          </div>

          {/* Power & Connectivity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2] flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-[#00C878]" />
                <span>Power System Architecture</span>
              </label>
              <select
                value={powerType}
                onChange={(e) => setPowerType(e.target.value as Space['powerType'])}
                className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
              >
                <option value="Solar + Inverter">Solar + Inverter Hybrid</option>
                <option value="Heavy Duty Gen + Solar Hybrid">Heavy Duty Gen + Solar Hybrid</option>
                <option value="Dual Diesel Generators">Dual Diesel Generators (N+1 Redundancy)</option>
                <option value="Grid + Inverter Auto-Switch">Grid + Inverter Auto-Switch</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2] flex items-center space-x-1.5">
                <Wifi className="w-3.5 h-3.5 text-[#00C878]" />
                <span>Internet ISP &amp; Speed (Mbps)</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={internetIsp}
                  onChange={(e) => setInternetIsp(e.target.value)}
                  placeholder="e.g. Starlink + MainOne"
                  className="w-2/3 p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                />
                <input
                  type="number"
                  value={internetSpeed}
                  onChange={(e) => setInternetSpeed(Number(e.target.value))}
                  placeholder="Mbps"
                  className="w-1/3 p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00C878]"
                />
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#18201B] border border-[#232D28]">
            <div>
              <div className="text-xs font-bold text-[#F2F2F2]">Public Listing Status</div>
              <div className="text-[11px] text-[#718079]">
                {isActive ? 'Workspace is public and accepting instant guest bookings' : 'Workspace is paused and hidden from guest discovery'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive ? 'bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30' : 'bg-[#FF5C5C]/15 text-[#FF8585] border border-[#FF5C5C]/30'
              }`}
            >
              {isActive ? 'Active / Open' : 'Paused / Hidden'}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#1E2522]">
            <button
              type="button"
              onClick={() => {
                setIsEditSpaceModalOpen(false);
                setEditingSpace(null);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2] cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center space-x-2 shadow-lg cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Publish Changes</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

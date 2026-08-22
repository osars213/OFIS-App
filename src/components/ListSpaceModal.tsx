import React, { useState } from 'react';
import { X, Building2, Zap, Wifi, MapPin, Plus, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { spacesService } from '../services/spacesService';
import { SpaceCategory } from '../types';

export const ListSpaceModal: React.FC = () => {
  const { isListSpaceOpen, setIsListSpaceOpen, currentUser, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<SpaceCategory>('coworking');
  const [city, setCity] = useState<'Lagos' | 'Abuja' | 'Port Harcourt' | 'Ibadan'>('Lagos');
  const [neighborhood, setNeighborhood] = useState('Victoria Island');
  const [address, setAddress] = useState('');
  const [pricePerHour, setPricePerHour] = useState(4000);
  const [pricePerDay, setPricePerDay] = useState(25000);
  const [capacity, setCapacity] = useState(10);
  const [backupPowerType, setBackupPowerType] = useState<'24/7 Solar & Inverter' | 'Dual Silent Generators' | 'Triple Grid+Gen+Solar'>('24/7 Solar & Inverter');
  const [internetSpeedMbps, setInternetSpeedMbps] = useState(300);

  if (!isListSpaceOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim()) {
      showToast('Please provide a space title and physical address');
      return;
    }

    spacesService.addSpace({
      title,
      tagline: tagline || 'Modern workspace with verified backup power.',
      description: 'Fully serviced commercial workspace equipped with redundant power, fiber connectivity, and dedicated hosting staff.',
      category,
      city,
      neighborhood,
      address,
      coordinates: { lat: 6.4281, lng: 3.4219 },
      pricePerHour,
      pricePerDay,
      currency: 'NGN',
      capacity,
      images: [
        'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80'
      ],
      featuredImage: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&auto=format&fit=crop&q=80',
      amenities: [
        backupPowerType,
        `${internetSpeedMbps}Mbps Fiber`,
        'Ergonomic Seating',
        'Air Conditioning',
        'Security Turnstiles'
      ],
      hostId: currentUser.id,
      hostName: currentUser.name,
      hostAvatar: currentUser.avatarUrl,
      hostResponseRate: '100% • Fast',
      isSuperhost: true,
      instantBooking: true,
      hasBackupPower: true,
      backupPowerType,
      internetSpeedMbps,
      noiseLevel: 'Silent / Library',
      openingHours: {
        weekdays: '7:00 AM - 9:00 PM',
        saturday: '8:00 AM - 7:00 PM',
        sunday: '10:00 AM - 5:00 PM'
      },
      rules: [
        'No smoking inside premises',
        'Valid ID/Digital pass scan required at reception'
      ],
      tags: [city, neighborhood, 'Verified Power', 'Instant Book']
    });

    showToast('Your space has been listed and is live for bookings!');
    setIsListSpaceOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-[#141816] rounded-2xl border border-[#232D28] shadow-2xl p-6 space-y-5 my-8 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#F2F2F2]">List Your Workspace or Studio</h3>
            <p className="text-xs text-[#9EABA3]">Monetize your unused desks, podcast booths, or event halls in Nigeria.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsListSpaceOpen(false)}
            className="p-1.5 rounded-lg text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#1A231E]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#9EABA3]">Space Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Hive Executive Lounge"
              className="w-full p-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#9EABA3]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SpaceCategory)}
                className="w-full p-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none"
              >
                <option value="coworking">Coworking Desks</option>
                <option value="meeting">Meeting Room / Boardroom</option>
                <option value="podcast">Podcast & Audio Suite</option>
                <option value="photography">Photo / Film Studio</option>
                <option value="private_office">Private Office Suite</option>
                <option value="event">Event Space / Amphitheatre</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#9EABA3]">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as any)}
                className="w-full p-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none"
              >
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
                <option value="Port Harcourt">Port Harcourt</option>
                <option value="Ibadan">Ibadan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#9EABA3]">Neighborhood</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g. Lekki Phase 1 / Maitama"
                className="w-full p-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#9EABA3]">Max Capacity (Guests)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full p-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#9EABA3]">Full Street Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 14 Karimu Kotun St, Victoria Island, Lagos"
              className="w-full p-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#9EABA3]">Price / Hour (₦)</label>
              <input
                type="number"
                step={500}
                value={pricePerHour}
                onChange={(e) => setPricePerHour(Number(e.target.value))}
                className="w-full p-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#9EABA3]">Price / Full Day (₦)</label>
              <input
                type="number"
                step={1000}
                value={pricePerDay}
                onChange={(e) => setPricePerDay(Number(e.target.value))}
                className="w-full p-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#9EABA3]">Backup Power Architecture</label>
            <select
              value={backupPowerType}
              onChange={(e) => setBackupPowerType(e.target.value as any)}
              className="w-full p-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none"
            >
              <option value="24/7 Solar & Inverter">24/7 Solar & Inverter Hybrid (Zero Cutover)</option>
              <option value="Dual Silent Generators">Dual Silent Generator Redundancy</option>
              <option value="Triple Grid+Gen+Solar">Triple Redundancy (Grid + Gen + Solar)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs shadow-md mt-3"
          >
            Publish Space & Activate Turnstile Integration
          </button>
        </form>

      </div>
    </div>
  );
};

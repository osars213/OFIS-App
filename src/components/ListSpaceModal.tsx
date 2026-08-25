import React, { useState } from 'react';
import { X, Building2, Zap, Wifi, Users, MapPin, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpaceCategory, CityLocation } from '../types';

export const ListSpaceModal: React.FC = () => {
  const { isListSpaceModalOpen, setIsListSpaceModalOpen, currentUser, addNewSpace } = useApp();

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<SpaceCategory>('coworking');
  const [city, setCity] = useState<CityLocation>('Lagos');
  const [neighborhood, setNeighborhood] = useState('Victoria Island');
  const [address, setAddress] = useState('');
  const [pricePerHour, setPricePerHour] = useState(3500);
  const [capacity, setCapacity] = useState(10);
  const [internetSpeed, setInternetSpeed] = useState(250);
  const [powerType, setPowerType] = useState('24/7 Redundant Generator + Inverter');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isListSpaceModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim()) return;

    addNewSpace({
      title,
      tagline: tagline || 'Modern fully-equipped workspace in prime Nigeria',
      description: `${title} is a premier physical work facility offering continuous power, fiber connectivity, and ergonomic seating in ${neighborhood}, ${city}.`,
      category,
      featuredImage: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
      ],
      pricePerHour,
      pricePerDay: pricePerHour * 7,
      currency: 'NGN',
      city,
      neighborhood,
      address,
      latitude: 6.4281,
      longitude: 3.4219,
      capacity,
      rating: 5.0,
      reviewsCount: 1,
      amenities: ['24/7 Backup Power', 'Fiber Internet', 'Air Conditioning', 'Meeting Room', 'Coffee Bar'],
      hasBackupPower: true,
      powerType,
      powerUptimeGuaranteePercent: 99.9,
      hasHighSpeedInternet: true,
      internetSpeedMbps: internetSpeed,
      internetIsp: 'MainOne Fiber / Starlink Redundant',
      noiseLevel: 'Quiet Focus & Collaboration',
      operatingHours: { open: '08:00', close: '21:00', days: 'Mon - Sat' },
      isSuperhost: true,
      host: {
        id: currentUser.id,
        name: currentUser.name,
        companyName: currentUser.company || 'Prime Workspace Host',
        avatar: currentUser.avatar,
        phone: currentUser.phone,
        email: currentUser.email,
        rating: 5.0,
        responseRatePercent: 100,
        joinedDate: '2024',
      },
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsListSpaceModalOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-6 space-y-6">
        
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#F2F2F2]">List a Workspace on OFIS</h3>
            <p className="text-xs text-[#718079] mt-0.5">Publish your facility to thousands of professionals across Nigeria</p>
          </div>
          <button
            type="button"
            onClick={() => setIsListSpaceModalOpen(false)}
            className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#00C878]/15 text-[#00C878] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#F2F2F2]">Hub Listed Successfully!</h4>
            <p className="text-xs text-[#718079]">Your space is now live on the OFIS network.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Workspace Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Hive Executive Suites"
                required
                className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F2F2F2]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SpaceCategory)}
                  className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2]"
                >
                  <option value="coworking">Coworking Desk</option>
                  <option value="private_office">Private Office</option>
                  <option value="meeting">Meeting Room</option>
                  <option value="photography">Photo Studio</option>
                  <option value="podcast">Podcast Studio</option>
                  <option value="event">Event Hall</option>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F2F2F2]">Hourly Price (₦ NGN)</label>
                <input
                  type="number"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(Number(e.target.value))}
                  required
                  min={1000}
                  className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] font-mono"
                />
              </div>

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
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 14 Adeola Odeku St, Victoria Island"
                required
                className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2]"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setIsListSpaceModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9EABA3]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs shadow-md"
              >
                Publish Hub
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

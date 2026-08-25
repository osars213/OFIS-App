import React, { useState, useEffect } from 'react';
import { X, Building2, Save, Zap, Wifi, ShieldCheck, MapPin, DollarSign, Users, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Space, SpaceCategory } from '../types';

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
  const [pricePerHour, setPricePerHour] = useState(2500);
  const [pricePerDay, setPricePerDay] = useState(15000);
  const [capacity, setCapacity] = useState(20);
  const [powerType, setPowerType] = useState<Space['powerType']>('Solar + Inverter');
  const [powerGuarantee, setPowerGuarantee] = useState(99.9);
  const [internetSpeed, setInternetSpeed] = useState(250);
  const [internetIsp, setInternetIsp] = useState('Starlink + Fiber Backup');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editingSpace) {
      setTitle(editingSpace.title);
      setTagline(editingSpace.tagline);
      setCategory(editingSpace.category);
      setCity(editingSpace.city);
      setNeighborhood(editingSpace.neighborhood);
      setAddress(editingSpace.address);
      setPricePerHour(editingSpace.pricePerHour);
      setPricePerDay(editingSpace.pricePerDay);
      setCapacity(editingSpace.capacity);
      setPowerType(editingSpace.powerType);
      setPowerGuarantee(editingSpace.powerUptimeGuaranteePercent || 99.9);
      setInternetSpeed(editingSpace.internetSpeedMbps || 200);
      setInternetIsp(editingSpace.internetIsp || 'Fiber');
      setIsActive(editingSpace.isActive !== false);
    }
  }, [editingSpace]);

  if (!isEditSpaceModalOpen || !editingSpace) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Space = {
      ...editingSpace,
      title,
      tagline,
      category,
      city,
      neighborhood,
      address,
      pricePerHour: Number(pricePerHour),
      pricePerDay: Number(pricePerDay),
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
      <div className="relative w-full max-w-2xl bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-6 sm:p-7 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00C878]/15 text-[#00C878] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F2F2F2]">Edit Workspace Listing</h3>
              <p className="text-xs text-[#718079]">Update pricing, capacity, and power telemetry for {editingSpace.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsEditSpaceModalOpen(false);
              setEditingSpace(null);
            }}
            className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B]"
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
                <option value="coworking">Coworking & Hot Desks</option>
                <option value="private_office">Private Dedicated Office</option>
                <option value="meeting">Meeting & Board Room</option>
                <option value="podcast">Podcast Studio</option>
                <option value="photography">Creative Photo Studio</option>
                <option value="event">Event Space</option>
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

          {/* Pricing in Naira */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#18201B] border border-[#232D28]">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Rate per Hour (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#00C878] font-bold text-xs">₦</span>
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(Number(e.target.value))}
                  required
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#141816] border border-[#232D28] text-xs text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00C878]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Rate per Day (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#00C878] font-bold text-xs">₦</span>
                <input
                  type="number"
                  min="2000"
                  step="500"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(Number(e.target.value))}
                  required
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#141816] border border-[#232D28] text-xs text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00C878]"
                />
              </div>
            </div>

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
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#141816] border border-[#232D28] text-xs text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00C878]"
                />
              </div>
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
                <span>Internet ISP & Speed (Mbps)</span>
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
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center space-x-2 shadow-lg cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Changes</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Building2, 
  Banknote, 
  Percent, 
  Calendar, 
  Tag, 
  TrendingUp, 
  Check, 
  Sparkles, 
  Info,
  ShieldCheck,
  Calculator
} from 'lucide-react';
import { Space, PricingRules } from '../../types';
import { useApp } from '../../context/AppContext';

interface HostPricingRulesTabProps {
  hostSpaces: Space[];
  selectedSpace?: Space | null;
}

export const HostPricingRulesTab: React.FC<HostPricingRulesTabProps> = ({
  hostSpaces,
  selectedSpace: initialSelectedSpace,
}) => {
  const { updateSpacePricingRules, formatPrice } = useApp();

  const [activeSpaceId, setActiveSpaceId] = useState<string>(
    initialSelectedSpace?.id || hostSpaces[0]?.id || 'space-vi-hive'
  );

  const currentSpace = hostSpaces.find(s => s.id === activeSpaceId) || hostSpaces[0];

  // Pricing Rule form states
  const [hourlyRate, setHourlyRate] = useState<number>(currentSpace?.pricePerHour || 3500);
  const [dailyRate, setDailyRate] = useState<number>(currentSpace?.pricePerDay || 25000);
  const [weekendMultiplier, setWeekendMultiplier] = useState<number>(
    currentSpace?.pricingRules?.weekendMultiplier || 1.15
  );
  const [holidayMultiplier, setHolidayMultiplier] = useState<number>(
    currentSpace?.pricingRules?.holidayMultiplier || 1.25
  );
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number>(
    currentSpace?.pricingRules?.promoDiscountPercent || 10
  );
  const [promoCode, setPromoCode] = useState<string>(
    currentSpace?.pricingRules?.promoCode || 'OFISVIP'
  );

  // Sync state when activeSpace changes
  useEffect(() => {
    if (currentSpace) {
      setHourlyRate(currentSpace.pricePerHour || 3500);
      setDailyRate(currentSpace.pricePerDay || 25000);
      setWeekendMultiplier(currentSpace.pricingRules?.weekendMultiplier || 1.15);
      setHolidayMultiplier(currentSpace.pricingRules?.holidayMultiplier || 1.25);
      setPromoDiscountPercent(currentSpace.pricingRules?.promoDiscountPercent || 10);
      setPromoCode(currentSpace.pricingRules?.promoCode || 'OFISVIP');
    }
  }, [activeSpaceId]);

  // Calculations for live preview
  const weekendHourly = Math.round(hourlyRate * weekendMultiplier);
  const holidayHourly = Math.round(hourlyRate * holidayMultiplier);
  const promoHourly = Math.round(hourlyRate * (1 - promoDiscountPercent / 100));
  
  // 4-Hour Standard Booking Simulator
  const simHours = 4;
  const simGross = hourlyRate * simHours;
  const simPlatformFee = Math.round(simGross * 0.08); // 8% platform fee
  const simNetHostPayout = simGross - simPlatformFee;

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSpace) return;

    const updatedRules: PricingRules = {
      baseHourly: hourlyRate,
      baseDaily: dailyRate,
      weekendMultiplier,
      holidayMultiplier,
      promoDiscountPercent,
      promoCode: promoCode.trim().toUpperCase(),
    };

    updateSpacePricingRules(currentSpace.id, updatedRules);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Space Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F2F2F2]">Dynamic Pricing & Surge Multipliers</h2>
          <p className="text-xs text-[#718079]">
            Configure base hourly/daily rates, weekend adjustments, holiday surges, and promotional discount codes
          </p>
        </div>

        {hostSpaces.length > 1 && (
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#00C878]" />
            <select
              value={activeSpaceId}
              onChange={(e) => setActiveSpaceId(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-[#141816] border border-[#1E2522] text-xs font-bold text-[#F2F2F2] focus:outline-none focus:border-[#00C878] cursor-pointer"
            >
              {hostSpaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Column (2/3) */}
        <form onSubmit={handleSave} className="lg:col-span-2 p-6 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-5">
          
          <div className="flex items-center space-x-2 border-b border-[#1E2522] pb-3">
            <Sliders className="w-4 h-4 text-[#00C878]" />
            <h3 className="text-sm font-bold text-[#F2F2F2]">
              Pricing Rules for "{currentSpace?.title}"
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Base Hourly */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9EABA3]">Base Rate per Hour (₦)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#00C878]">₦</span>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={hourlyRate === 0 ? '' : hourlyRate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHourlyRate(val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0));
                  }}
                  onBlur={() => {
                    if (!hourlyRate || hourlyRate <= 0) {
                      setHourlyRate(currentSpace?.pricePerHour || 3500);
                    }
                  }}
                  className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-[#18201B] border border-[#232D28] text-xs font-mono font-bold text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                />
              </div>
            </div>

            {/* Base Daily */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9EABA3]">Base Full-Day Pass (₦)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#00C878]">₦</span>
                <input
                  type="number"
                  min="3000"
                  step="1000"
                  value={dailyRate === 0 ? '' : dailyRate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDailyRate(val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0));
                  }}
                  onBlur={() => {
                    if (!dailyRate || dailyRate <= 0) {
                      setDailyRate(currentSpace?.pricePerDay || 25000);
                    }
                  }}
                  className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-[#18201B] border border-[#232D28] text-xs font-mono font-bold text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                />
              </div>
            </div>

            {/* Weekend Multiplier */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9EABA3]">Weekend Rate Multiplier</label>
              <select
                value={weekendMultiplier}
                onChange={(e) => setWeekendMultiplier(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878] cursor-pointer"
              >
                <option value={1.0}>Standard (1.0x - No Change)</option>
                <option value={1.1}>+10% Surge (1.10x)</option>
                <option value={1.15}>+15% Surge (1.15x) [Recommended]</option>
                <option value={1.2}>+20% Surge (1.20x)</option>
                <option value={1.25}>+25% Surge (1.25x)</option>
              </select>
            </div>

            {/* Holiday / Event Surge Multiplier */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9EABA3]">Public Holiday & Summit Surge</label>
              <select
                value={holidayMultiplier}
                onChange={(e) => setHolidayMultiplier(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878] cursor-pointer"
              >
                <option value={1.15}>+15% Surge (1.15x)</option>
                <option value={1.25}>+25% Surge (1.25x) [Standard]</option>
                <option value={1.35}>+35% Peak Event Surge (1.35x)</option>
                <option value={1.5}>+50% High Demand Summit (1.50x)</option>
              </select>
            </div>

            {/* Promo Discount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9EABA3]">Promotional Discount (%)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#00C878]">%</span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={promoDiscountPercent}
                  onChange={(e) => setPromoDiscountPercent(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-[#18201B] border border-[#232D28] text-xs font-mono font-bold text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                />
              </div>
            </div>

            {/* Promo Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9EABA3]">Active Promo Code</label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718079]" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#18201B] border border-[#232D28] text-xs font-mono font-bold text-[#00C878] focus:outline-none focus:border-[#00C878]"
                />
              </div>
            </div>

          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#1E2522]">
            {savedSuccess ? (
              <span className="text-xs font-bold text-[#00C878] flex items-center space-x-1.5">
                <Check className="w-4 h-4" />
                <span>Pricing Rules Saved & Live!</span>
              </span>
            ) : (
              <span className="text-xs text-[#718079]">Changes apply instantly across search & checkout</span>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-[#00C878]/15"
            >
              <span>Save & Publish Rules</span>
            </button>
          </div>

        </form>

        {/* Live Simulator Preview (1/3) */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#141816] border border-[#00C878]/30 space-y-4">
            
            <div className="flex items-center space-x-2 border-b border-[#1E2522] pb-3">
              <Calculator className="w-4 h-4 text-[#00C878]" />
              <h4 className="text-xs font-bold text-[#F2F2F2]">Live Guest Pricing Simulator</h4>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#718079]">Weekday Hourly:</span>
                <span className="font-mono font-bold text-[#F2F2F2]">₦{(hourlyRate || 0).toLocaleString()}/hr</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#718079]">Weekend Hourly ({weekendMultiplier}x):</span>
                <span className="font-mono font-bold text-[#00C878]">₦{(weekendHourly || 0).toLocaleString()}/hr</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#718079]">Holiday Surge ({holidayMultiplier}x):</span>
                <span className="font-mono font-bold text-[#E0A82E]">₦{(holidayHourly || 0).toLocaleString()}/hr</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#718079]">With Promo ({promoDiscountPercent}% off):</span>
                <span className="font-mono font-bold text-[#00C878]">₦{(promoHourly || 0).toLocaleString()}/hr</span>
              </div>
            </div>

            {/* Payout Breakdown Simulation */}
            <div className="pt-3 border-t border-[#1E2522] space-y-2 font-mono text-[11px]">
              <div className="text-[10px] text-[#718079] uppercase font-sans font-bold">
                Sample 4-Hour Reservation:
              </div>
              <div className="flex justify-between text-[#9EABA3]">
                <span>Gross Guest Total:</span>
                <span>₦{(simGross || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#718079]">
                <span>OFIS Escrow (8%):</span>
                <span>-₦{(simPlatformFee || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#00C878] pt-1 border-t border-[#1E2522]">
                <span>Your Net Payout:</span>
                <span>₦{(simNetHostPayout || 0).toLocaleString()}</span>
              </div>
            </div>

          </div>

          <div className="p-4 rounded-3xl bg-[#0D0D0D] border border-[#232D28] space-y-2 text-[11px] text-[#718079]">
            <div className="flex items-center space-x-1.5 text-[#00C878] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Surge Recommendation</span>
            </div>
            <p>
              Victoria Island & Ikoyi hubs see 40% higher weekend demand from tech founders and remote teams. A 15% weekend multiplier optimizes both occupancy and revenue.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

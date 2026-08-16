import React from 'react';
import { SlidersHorizontal, Clock, Calendar, RotateCcw } from 'lucide-react';

export type PriceRateType = 'hourly' | 'daily';

export interface PriceRangeSliderProps {
  rateType?: PriceRateType;
  minPrice: number;
  maxPrice: number;
  onChange: (min: number, max: number, rateType: PriceRateType) => void;
  onRateTypeChange?: (rateType: PriceRateType) => void;
  showRateTypeToggle?: boolean;
  className?: string;
  compact?: boolean;
  title?: string;
}

const HOURLY_MAX = 75000;
const HOURLY_STEP = 1000;

const DAILY_MAX = 350000;
const DAILY_STEP = 5000;

const HOURLY_PRESETS = [
  { label: 'All Budgets', min: 0, max: HOURLY_MAX },
  { label: 'Under ₦5,000/hr', min: 0, max: 5000 },
  { label: '₦5k – ₦15k/hr', min: 5000, max: 15000 },
  { label: '₦15k – ₦35k/hr', min: 15000, max: 35000 },
  { label: '₦35k+/hr', min: 35000, max: HOURLY_MAX },
];

const DAILY_PRESETS = [
  { label: 'All Budgets', min: 0, max: DAILY_MAX },
  { label: 'Under ₦25,000/day', min: 0, max: 25000 },
  { label: '₦25k – ₦75k/day', min: 25000, max: 75000 },
  { label: '₦75k – ₦150k/day', min: 75000, max: 150000 },
  { label: '₦150k+/day', min: 150000, max: DAILY_MAX },
];

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  rateType = 'hourly',
  minPrice,
  maxPrice,
  onChange,
  onRateTypeChange,
  showRateTypeToggle = true,
  className = '',
  compact = false,
  title = 'Price Filter',
}) => {
  const currentMaxLimit = rateType === 'hourly' ? HOURLY_MAX : DAILY_MAX;
  const currentStep = rateType === 'hourly' ? HOURLY_STEP : DAILY_STEP;
  const presets = rateType === 'hourly' ? HOURLY_PRESETS : DAILY_PRESETS;

  // Clamp current values to current mode limits
  const safeMin = Math.max(0, Math.min(minPrice, currentMaxLimit));
  const safeMax = Math.min(currentMaxLimit, Math.max(maxPrice, safeMin));

  const minPercent = Math.min(100, Math.max(0, (safeMin / currentMaxLimit) * 100));
  const maxPercent = Math.min(100, Math.max(0, (safeMax / currentMaxLimit) * 100));

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), safeMax);
    onChange(value, safeMax, rateType);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), safeMin);
    onChange(safeMin, value, rateType);
  };

  const handleRateTypeSwitch = (newRateType: PriceRateType) => {
    if (newRateType === rateType) return;
    if (onRateTypeChange) {
      onRateTypeChange(newRateType);
    }
    // Switch to corresponding defaults for that rate type
    if (newRateType === 'hourly') {
      onChange(0, HOURLY_MAX, 'hourly');
    } else {
      onChange(0, DAILY_MAX, 'daily');
    }
  };

  const handleReset = () => {
    onChange(0, currentMaxLimit, rateType);
  };

  const formatPriceDisplay = (amount: number, isMax = false) => {
    if (isMax && amount >= currentMaxLimit) {
      return rateType === 'hourly' ? '₦75,000+' : '₦350,000+';
    }
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div
      id="price-range-slider-container"
      className={`bg-[#171717] border border-[#2B2B2B] rounded-2xl ${
        compact ? 'p-3' : 'p-4'
      } ${className}`}
    >
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#262626]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#00C878]/15 border border-[#00C878]/30 flex items-center justify-center text-[#00C878]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {title}
            </h4>
            <div className="text-[11px] text-[#8E8E8E]">
              Filter by {rateType === 'hourly' ? 'hourly desk/studio rate' : 'full day rate'}
            </div>
          </div>
        </div>

        {/* Rate Type Pill Toggle (Hourly vs Daily) */}
        {showRateTypeToggle && (
          <div className="flex items-center bg-[#202020] p-0.5 rounded-xl border border-[#2D2D2D] self-start sm:self-auto">
            <button
              type="button"
              id="price-toggle-hourly"
              onClick={() => handleRateTypeSwitch('hourly')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                rateType === 'hourly'
                  ? 'bg-[#00C878] text-[#0D0D0D] shadow-xs'
                  : 'text-[#9A9A9A] hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Hourly (/hr)</span>
            </button>
            <button
              type="button"
              id="price-toggle-daily"
              onClick={() => handleRateTypeSwitch('daily')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                rateType === 'daily'
                  ? 'bg-[#00C878] text-[#0D0D0D] shadow-xs'
                  : 'text-[#9A9A9A] hover:text-white'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Daily (/day)</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Price Summary Highlight */}
      <div className="my-3 flex items-center justify-between bg-[#1F1F1F] px-3 py-2 rounded-xl border border-[#2A2A2A]">
        <span className="text-[11px] font-semibold text-[#8E8E8E]">Current Range:</span>
        <div className="flex items-center gap-1 text-xs font-black text-[#00C878] font-mono">
          <span>{formatPriceDisplay(safeMin)}</span>
          <span className="text-[#666666] font-normal">–</span>
          <span>{formatPriceDisplay(safeMax, true)}</span>
          <span className="text-[10px] text-[#8E8E8E] font-sans font-normal ml-0.5">
            /{rateType === 'hourly' ? 'hr' : 'day'}
          </span>
        </div>
      </div>

      {/* Visual Dual-Range Slider Track */}
      <div className="pt-2 pb-1 px-1">
        <div className="relative h-2 bg-[#262626] rounded-full">
          {/* Highlighted active track portion */}
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-[#00C878] to-[#00E58B] rounded-full shadow-[0_0_8px_rgba(0,200,120,0.4)]"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(2, maxPercent - minPercent)}%`,
            }}
          />

          {/* Hidden overlapping range inputs for intuitive dual sliders */}
          <input
            type="range"
            id="price-min-slider"
            min={0}
            max={currentMaxLimit}
            step={currentStep}
            value={safeMin}
            onChange={handleMinChange}
            className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent pointer-events-auto cursor-pointer focus:outline-none accent-[#00C878] z-20"
            style={{ WebkitAppearance: 'none' }}
          />

          <input
            type="range"
            id="price-max-slider"
            min={0}
            max={currentMaxLimit}
            step={currentStep}
            value={safeMax}
            onChange={handleMaxChange}
            className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent pointer-events-auto cursor-pointer focus:outline-none accent-[#00C878] z-20"
            style={{ WebkitAppearance: 'none' }}
          />
        </div>

        {/* Dual Input numeric cards */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-[#202020] border border-[#2D2D2D] focus-within:border-[#00C878] rounded-xl px-2.5 py-1.5 transition-colors">
            <span className="block text-[10px] font-bold text-[#888888] uppercase tracking-wider">
              Min ({rateType === 'hourly' ? '/hr' : '/day'})
            </span>
            <div className="flex items-center text-xs font-bold text-white font-mono mt-0.5">
              <span className="text-[#00C878] mr-1">₦</span>
              <input
                type="number"
                min={0}
                max={safeMax}
                step={currentStep}
                value={safeMin}
                onChange={e => {
                  const val = Math.max(0, Math.min(Number(e.target.value) || 0, safeMax));
                  onChange(val, safeMax, rateType);
                }}
                className="w-full bg-transparent focus:outline-none text-xs font-bold text-white"
              />
            </div>
          </div>

          <div className="bg-[#202020] border border-[#2D2D2D] focus-within:border-[#00C878] rounded-xl px-2.5 py-1.5 transition-colors">
            <span className="block text-[10px] font-bold text-[#888888] uppercase tracking-wider">
              Max ({rateType === 'hourly' ? '/hr' : '/day'})
            </span>
            <div className="flex items-center text-xs font-bold text-white font-mono mt-0.5">
              <span className="text-[#00C878] mr-1">₦</span>
              <input
                type="number"
                min={safeMin}
                max={currentMaxLimit}
                step={currentStep}
                value={safeMax}
                onChange={e => {
                  const val = Math.max(safeMin, Math.min(Number(e.target.value) || safeMin, currentMaxLimit));
                  onChange(safeMin, val, rateType);
                }}
                className="w-full bg-transparent focus:outline-none text-xs font-bold text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nigerian Budget Preset Chips */}
      <div className="mt-3 pt-3 border-t border-[#242424]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">
            Quick Nigerian Presets:
          </span>
          {(safeMin > 0 || safeMax < currentMaxLimit) && (
            <button
              type="button"
              onClick={handleReset}
              className="text-[10px] font-semibold text-[#8E8E8E] hover:text-[#00C878] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map(preset => {
            const isActive = safeMin === preset.min && safeMax === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.min, preset.max, rateType)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00C878] text-[#0A0A0A] shadow-xs'
                    : 'bg-[#222222] text-[#9A9A9A] hover:text-white hover:bg-[#282828] border border-[#2F2F2F]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';

interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min = 2000,
  max = 150000,
  step = 1000,
  className = '',
}) => {
  const { filters, updateFilter, formatPrice } = useApp();

  const currentValue = filters.maxPrice || max;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#5D7A7D] dark:text-[#B8D1D0] font-medium">Hourly Budget Range</span>
        <span className="font-mono font-bold text-[#006B70] dark:text-[#28D2CB] bg-[#14BEB8]/15 px-2 py-0.5 rounded border border-[#14BEB8]/30">
          {currentValue >= max ? 'Any Price' : `Up to ${formatPrice(currentValue, { perHour: true })}`}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
        className="w-full h-2 bg-[#E2ECEB] dark:bg-[#166D74] rounded-lg appearance-none cursor-pointer accent-[#14BEB8] focus:outline-none"
        aria-label="Price range filter"
      />

      <div className="flex items-center justify-between text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] font-mono">
        <span>{formatPrice(min ?? 2000)}</span>
        <span>{formatPrice(50000)}</span>
        <span>{formatPrice(100000)}</span>
        <span>{formatPrice(max ?? 150000)}+</span>
      </div>
    </div>
  );
};

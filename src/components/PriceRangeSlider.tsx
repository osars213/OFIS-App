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
        <span className="text-[#718079] font-medium">Hourly Budget Range</span>
        <span className="font-mono font-bold text-[#00C878] bg-[#00C878]/10 px-2 py-0.5 rounded border border-[#00C878]/20">
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
        className="w-full h-2 bg-[#232D28] rounded-lg appearance-none cursor-pointer accent-[#00C878] focus:outline-none"
        aria-label="Price range filter"
      />

      <div className="flex items-center justify-between text-[10px] text-[#718079] font-mono">
        <span>{formatPrice(min ?? 2000)}</span>
        <span>{formatPrice(50000)}</span>
        <span>{formatPrice(100000)}</span>
        <span>{formatPrice(max ?? 150000)}+</span>
      </div>
    </div>
  );
};

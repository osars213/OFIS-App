import React from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  currency?: string;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min = 0,
  max = 60000,
  value,
  onChange,
  currency = '₦'
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#9EABA3]">Max Price / hr:</span>
        <span className="font-bold text-[#00C878] font-mono">
          {value >= max ? `Any price (up to ${currency}${max.toLocaleString()}+)` : `${currency}${value.toLocaleString()}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1000}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-[#232D28] rounded-lg appearance-none cursor-pointer accent-[#00C878]"
      />
      <div className="flex justify-between text-[10px] text-[#718079]">
        <span>{currency}{min.toLocaleString()}</span>
        <span>{currency}{(max / 2).toLocaleString()}</span>
        <span>{currency}{max.toLocaleString()}+</span>
      </div>
    </div>
  );
};

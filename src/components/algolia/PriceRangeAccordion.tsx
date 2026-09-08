'use client'

import * as React from "react";
import { useRange, type UseRangeProps } from "react-instantsearch";
import { ChevronDown } from "lucide-react";

interface PriceRangeAccordionProps extends UseRangeProps {
  title?: string;
  defaultOpen?: boolean;
}

export function PriceRangeAccordion({
  title = "Preis",
  defaultOpen = false,
  ...props
}: PriceRangeAccordionProps) {
  const { start, range, canRefine, refine } = useRange(props);
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const min = typeof range.min === 'number' ? range.min : 0;
  const max = typeof range.max === 'number' ? range.max : 10000;

  const [minValue, setMinValue] = React.useState<number>(min);
  const [maxValue, setMaxValue] = React.useState<number>(max);

  // Update values when range or start changes
  React.useEffect(() => {
    if (typeof range.min === 'number' && typeof range.max === 'number') {
      const newMin = typeof start[0] === 'number' && isFinite(start[0]) ? start[0] : range.min;
      const newMax = typeof start[1] === 'number' && isFinite(start[1]) ? start[1] : range.max;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs local display state from InstantSearch's range connector, ported as-is from the working Remix component
      setMinValue(newMin);
      setMaxValue(newMax);
    }
  }, [start, range.min, range.max]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value <= maxValue) {
      setMinValue(value);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= minValue) {
      setMaxValue(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refine([minValue === min ? undefined : minValue, maxValue === max ? undefined : maxValue]);
  };

  const handleReset = () => {
    setMinValue(min);
    setMaxValue(max);
    refine([undefined, undefined]);
  };

  const isActive = start[0] !== undefined || start[1] !== undefined;

  // Calculate the position of the range bar
  const minPercent = max > min ? ((minValue - min) / (max - min)) * 100 : 0;
  const maxPercent = max > min ? ((maxValue - min) / (max - min)) * 100 : 100;

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{title}</span>
            {isActive && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-vintage-primary bg-vintage-secondary200/10 rounded">
                {(typeof start[0] === 'number' && isFinite(start[0]) ? start[0] : min).toLocaleString('de-DE')} € - {(typeof start[1] === 'number' && isFinite(start[1]) ? start[1] : max).toLocaleString('de-DE')} €
              </span>
            )}
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            {isActive && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-vintage-secondary200 hover:text-vintage-secondary font-medium"
              >
                Zurücksetzen
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Range Slider */}
            <div className="relative h-8 flex items-center mb-2">
              {/* Track */}
              <div className="absolute w-full h-1 bg-gray-200 rounded" style={{ zIndex: 1 }}>
                {/* Active Range */}
                <div
                  className="absolute h-1 bg-vintage-secondary200 rounded transition-all"
                  style={{
                    left: `${minPercent}%`,
                    width: `${maxPercent - minPercent}%`,
                    zIndex: 2,
                  }}
                />
              </div>

              {/* Min Range Input */}
              <input
                type="range"
                min={min}
                max={max}
                value={minValue}
                onChange={handleMinChange}
                disabled={!canRefine}
                style={{ zIndex: 3 }}
                onPointerDown={(e) => {
                  (e.currentTarget as HTMLElement).style.zIndex = '5';
                }}
                onPointerUp={(e) => {
                  (e.currentTarget as HTMLElement).style.zIndex = '3';
                }}
                className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-amber-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-none hover:[&::-moz-range-thumb]:scale-110 [&::-moz-range-thumb]:transition-transform"
              />

              {/* Max Range Input */}
              <input
                type="range"
                min={min}
                max={max}
                value={maxValue}
                onChange={handleMaxChange}
                disabled={!canRefine}
                style={{ zIndex: 4 }}
                onPointerDown={(e) => {
                  (e.currentTarget as HTMLElement).style.zIndex = '5';
                }}
                onPointerUp={(e) => {
                  (e.currentTarget as HTMLElement).style.zIndex = '4';
                }}
                className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-amber-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-none hover:[&::-moz-range-thumb]:scale-110 [&::-moz-range-thumb]:transition-transform"
              />
            </div>

            {/* Values Display */}
            <div className="flex justify-between text-xs text-gray-500 -mt-1 mb-2">
              <span>{minValue.toLocaleString('de-DE')} €</span>
              <span>{maxValue.toLocaleString('de-DE')} €</span>
            </div>

            {/* Number Inputs */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={minValue}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value <= maxValue && value >= min) {
                      setMinValue(value);
                    }
                  }}
                  placeholder={min.toString()}
                  min={min}
                  max={maxValue}
                  disabled={!canRefine}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-secondary200 disabled:bg-gray-50 disabled:text-gray-400"
                />
                <div className="text-xs text-gray-400 mt-1 px-1">Min €</div>
              </div>

              <div className="text-gray-400 pb-5">—</div>

              <div className="flex-1">
                <input
                  type="number"
                  value={maxValue}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= minValue && value <= max) {
                      setMaxValue(value);
                    }
                  }}
                  placeholder={max.toString()}
                  min={minValue}
                  max={max}
                  disabled={!canRefine}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-secondary200 disabled:bg-gray-50 disabled:text-gray-400"
                />
                <div className="text-xs text-gray-400 mt-1 px-1">Max €</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canRefine}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-vintage-secondary200 rounded-lg hover:bg-vintage-secondary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Anwenden
            </button>
          </form>

          {canRefine && (
            <div className="mt-3 text-xs text-gray-400 text-center">
              Bereich: {min.toLocaleString('de-DE')} € - {max.toLocaleString('de-DE')} €
            </div>
          )}
        </div>
      )}
    </div>
  );
}

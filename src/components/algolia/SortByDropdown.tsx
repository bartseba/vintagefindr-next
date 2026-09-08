'use client'

import * as React from "react";
import { useSortBy, type UseSortByProps } from "react-instantsearch";
import { ChevronDown } from "lucide-react";

interface SortByDropdownProps extends UseSortByProps {
  title?: string;
  placeholder?: string;
}

export function SortByDropdown({ title = "Sortierung", placeholder = "Relevanz", items, ...props }: SortByDropdownProps) {
  const { currentRefinement, options, refine } = useSortBy({ items, ...props });
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentOption = options.find(option => option.value === currentRefinement);
  const displayLabel = currentOption?.label || placeholder;
  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[45px] border border-gray-100 px-4 py-2 rounded-md text-sm font-medium text-left vintage-border bg-white  hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-vintage-secondary transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs hidden text-gray-500 mb-0.5">{title}</div>
            <div className="text-sm truncate text-gray-900 font-medium">
              {displayLabel === "Relevanz" ? "Sortierung" : displayLabel}
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`ml-2 text-vintage-secondary transition-transform relativetop-[1px] ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                refine(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                option.value === currentRefinement
                  ? 'bg-vintage-primary text-white font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

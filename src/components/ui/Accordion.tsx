'use client'

import * as React from "react";
import { ChevronDown } from "lucide-react";

interface AccordionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: React.ReactNode;
  onToggle?: (isOpen: boolean) => void;
  className?: string;
}

export function Accordion({
  title,
  defaultOpen = false,
  children,
  badge,
  onToggle,
  className = "",
}: AccordionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full py-4 px-2 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            {badge && <div className="flex-shrink-0">{badge}</div>}
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`px-4 pb-4 animate-in slide-in-from-top-2 duration-200 ${isOpen ? "" : "hidden"}`}
      >
        {children}
      </div>
    </div>
  );
}

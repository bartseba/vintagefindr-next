'use client'

import { useState } from "react";
import { ChevronRight } from 'lucide-react';
import Link from "next/link";

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  children?: NavigationItem[];
}

interface MobileAccordionProps {
  title: string;
  items: NavigationItem[];
  onClose: () => void;
}

export function MobileAccordion({ title, items, onClose }: MobileAccordionProps) {
  const [open, setOpen] = useState(false);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div className="bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
        aria-expanded={open}
        aria-controls={`section-${title}`}
      >
        <span className="roboto-mono-vintage font-medium text-sm font-medium uppercase tracking-wide text-slate-700">{title}</span>
        <ChevronRight className={`h-5 w-5 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      <div
        id={`section-${title}`}
        className={`px-2 pb-2 overflow-hidden transition-[grid-template-rows] duration-300 grid ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="min-h-0">
          <ul className="space-y-1 rounded-md bg-slate-50 p-2">
            {items.map((it) => {
              const hasChildren = it.children && it.children.length > 0;
              const isItemOpen = openItems.has(it.id);

              return (
                <li key={it.id}>
                  <div className="flex items-center gap-1">
                    <Link
                      href={it.href}
                      onClick={handleLinkClick}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-[15px] text-slate-800 hover:bg-[#e9e8ff] hover:text-[#4140d4] flex-1"
                    >
                      <span>{it.label}</span>
                    </Link>
                    {hasChildren && (
                      <button
                        onClick={() => toggleItem(it.id)}
                        className="flex items-center justify-center px-2 py-2 rounded-md hover:bg-[#e9e8ff] transition-colors"
                        aria-label={isItemOpen ? 'Zuklappen' : 'Aufklappen'}
                      >
                        <ChevronRight className={`h-4 w-4 opacity-70 transition-transform ${isItemOpen ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </div>
                  {hasChildren && isItemOpen && (
                    <ul className="ml-4 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {it.children!.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={child.href}
                            onClick={handleLinkClick}
                            className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-[#e9e8ff] hover:text-[#4140d4]"
                          >
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

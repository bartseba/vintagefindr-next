'use client'

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { X } from 'lucide-react';

// Import extracted components
import { MegaMenuDropdown } from './navigation/MegaMenuDropdown';
import { MobileAccordion } from './navigation/MobileAccordion';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  children?: NavigationItem[];
  _sectionTitle?: string;
}

interface NavigationSection {
  id: string;
  title?: string;
  label: string;
  items: NavigationItem[];
}

interface MegaMenuProps {
    open: boolean;
    onClose: () => void;
    topOffset?: string;
    sections?: NavigationSection[];
}

export function MegaMenu({ open, onClose, topOffset = "top-[0] xl:top-[90px]", sections = [] }: MegaMenuProps) {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const [entered, setEntered] = useState(false);
    const [hoveredSection, setHoveredSection] = useState<string | null>(null);

    // Combine Kollektionen, Jahrzehnte, Sport into a single tab
    const displaySections = useMemo(() => {
        const combinedSectionTitles = ["Kollektionen", "Jahrzehnte", "Sport"];
        const combinedSections = sections.filter(s => combinedSectionTitles.includes(s.title || s.label));
        const otherSections = sections.filter(s => !combinedSectionTitles.includes(s.title || s.label));

        if (combinedSections.length > 0) {
            const combinedSection: NavigationSection = {
                id: "combined-collection",
                title: "Kollektion",
                label: "Kollektion",
                items: combinedSections.flatMap(s =>
                    s.items.map(item => ({
                        ...item,
                        _sectionTitle: s.title || s.label
                    }))
                )
            };

            const kategorien = otherSections.find(s => s.title === "Kategorien" || s.label === "Kategorien");
            const marken = otherSections.find(s => s.title === "Marken" || s.label === "Marken");
            const remaining = otherSections.filter(s =>
                (s.title || s.label) !== "Kategorien" &&
                (s.title || s.label) !== "Marken"
            );

            return [
                ...(kategorien ? [kategorien] : []),
                ...(marken ? [marken] : []),
                combinedSection,
                ...remaining
            ];
        }
        return sections;
    }, [sections]);

    // Handle open/close animations and initial state
    useEffect(() => {
        if (!open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- resets animation/hover state on close, ported as-is from the working Remix component
            setEntered(false);
            setHoveredSection(null);
        } else {
            const id = requestAnimationFrame(() => {
                setEntered(true);
                if (displaySections.length > 0) {
                    const megamenuSection = displaySections.find((s) => (s.title || s.label) === "Megamenu");
                    setHoveredSection(megamenuSection?.id || displaySections[0].id);
                }
            });
            return () => cancelAnimationFrame(id);
        }
    }, [open, displaySections]);

    // Handle escape key
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // Handle click outside
    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('[data-megamenu-toggle]')) return;
            if (panelRef.current && !panelRef.current.contains(target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open, onClose]);

    // Lock body scroll when open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    const mobileSections = [
        ...displaySections.filter((items) => (items.title || items.label) === "Megamenu"),
        ...displaySections.filter((items) => (items.title || items.label) !== "Megamenu" && (items.title || items.label) !== "Kategorien" && items.id !== "combined-collection")
    ];

    return (
        <div className={!open ? 'hidden' : ''}>
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Vintage Kategorien"
                className={`${topOffset} fixed left-0 right-auto z-[1000] lg:z-[70] w-[min(100vw,100%)] max-w-[768px] lg:max-w-[100%] transform transition-transform duration-300 will-change-transform lg:left-0 lg:right-0 lg:mx-auto lg:transform-none`}
            >
                <div className={`h-[calc(100vh-70px)] lg:h-auto w-full transition-transform duration-300 ${entered ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                    {/* Mobile Header */}
                    <div
                        className="lg:hidden flex items-center justify-between p-4 border-b"
                        style={{ backgroundColor: "#1B3B6F" }}
                    >
                        <div className="flex items-center">
                            {/* eslint-disable-next-line @next/next/no-img-element -- static asset, ported as-is */}
                            <img src="/latest-invert.png" className="h-[40px] lg:h-[56px] w-auto" alt="Vintagefindr" />
                        </div>
                        <button
                            onClick={onClose}
                            aria-label="Menü schließen"
                            className="text-white hover:bg-blue-800 rounded-full p-2"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mx-0 flex flex-col justify-between h-full overflow-y-auto rounded-none bg-white shadow-2xl ring-1 ring-black/5 lg:top-[90px] relative">
                        {/* Mobile Navigation */}
                        <div className="lg:hidden divide-y">
                            {mobileSections.map((s) => (
                                <MobileAccordion
                                    key={s.id}
                                    title={(s.title || s.label)?.replace('Megamenu', "Kategorien")}
                                    items={s.items}
                                    onClose={onClose}
                                />
                            ))}
                        </div>

                        {/* Desktop Navigation */}
                        <MegaMenuDropdown
                            displaySections={displaySections}
                            hoveredSection={hoveredSection}
                            onSectionHover={setHoveredSection}
                            onClose={onClose}
                        />

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 lg:px-8">
                            <p className="text-sm text-slate-600">Wissenswertes über Vintage-Mode & Styles</p>
                            <Link
                                href="/ratgeber"
                                onClick={() => onClose()}
                                className="roboto-mono-vintage font-medium text-sm uppercase text-vintage-primary hover:underline"
                            >
                                Ratgeber ansehen
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop */}
            <div
                className="absolute inset-0 z-[60] bg-white lg:bg-white/0 transition-opacity"
                aria-hidden="true"
                onClick={onClose}
            />
        </div>
    );
}

import React from "react";
import { MegaMenuItem } from "./MegaMenuItem";

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

interface MegaMenuDropdownProps {
  displaySections: NavigationSection[];
  hoveredSection: string | null;
  onSectionHover: (sectionId: string) => void;
  onClose?: () => void;
}

export const MegaMenuDropdown: React.FC<MegaMenuDropdownProps> = ({
  displaySections,
  hoveredSection,
  onSectionHover,
  onClose
}) => {
  const filteredSections = [
    ...displaySections.filter((items) => (items.title || items.label) === "Megamenu"),
    ...displaySections.filter((items) => (items.title || items.label) !== "Megamenu" && (items.title || items.label) !== "Kategorien" && items.id !== "combined-collection")
  ];

  return (
    <div className="hidden lg:grid lg:grid-cols-[320px_auto] lg:w-full px-0 py-7 xl:container">
      {/* Sidebar with section tabs */}
      <div className="border-r border-slate-200 px-6">
        <p className="roboto-mono-vintage font-medium text-xs uppercase tracking-wider text-slate-500 mb-4 px-3">Kategorien</p>
        <ul className="space-y-1">
          {filteredSections.map((section) => {
            const resolvedTitle = section.title || section.label;
            const sectionLabel = resolvedTitle === "Megamenu" ? "Kategorien" : resolvedTitle;
            return (
              <li key={section.id}>
                <button
                  onMouseEnter={() => onSectionHover(section.id)}
                  aria-label={`${sectionLabel} anzeigen`}
                  className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                    hoveredSection === section.id
                      ? 'bg-vintage-silverGray text-vintage-primary font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {sectionLabel}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Content area */}
      <div className="flex-1 px-8">
        {displaySections.map((section) => (
          <MegaMenuItem
            key={section.id}
            section={section}
            isVisible={hoveredSection === section.id}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
};

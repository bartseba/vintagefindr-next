'use client'

import * as React from "react";
import { useRefinementList, type UseRefinementListProps } from "react-instantsearch";
import { ChevronDown } from "lucide-react";

interface RefinementListAccordionProps extends UseRefinementListProps {
  title: string;
  searchable?: boolean;
  defaultOpen?: boolean;
}

export function RefinementListAccordion({
  title,
  searchable = false,
  defaultOpen = false,
  ...props
}: RefinementListAccordionProps) {
  const { items, refine, searchForItems } = useRefinementList(props);
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedItems = items.filter(item => item.isRefined);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchable && searchForItems) {
      searchForItems(value);
    }
  };

  const filteredItems = searchable && searchQuery
    ? items.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full lg:px-4 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{title}</span>
            {selectedItems.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-vintage-primary rounded-full">
                {selectedItems.length}
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
        <div className="lg:px-4  pb-4 animate-in slide-in-from-top-2 duration-200">
          {searchable && (
            <div className="mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Suchen..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-secondary200 focus:border-transparent"
              />
            </div>
          )}

          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <label
                  key={item.label}
                  className="flex items-center px-2 py-2 hover:bg-gray-50 rounded cursor-pointer transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={item.isRefined}
                    onChange={() => {
                      refine(item.value);
                    }}
                    className="w-4 h-4 text-vintage-primary border-gray-300 rounded focus:ring-vintage-secondary200"
                  />
                  <span className="ml-3 text-sm text-gray-700 flex-1 group-hover:text-gray-900">
                    {item.label}
                  </span>
                  <span className="ml-2 text-xs text-gray-400 group-hover:text-gray-600">
                    {item.count.toLocaleString()}
                  </span>
                </label>
              ))
            ) : (
              <div className="px-2 py-8 text-center text-sm text-gray-500">
                Keine Optionen verfügbar
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

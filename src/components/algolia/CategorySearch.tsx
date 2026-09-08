'use client'

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { UiState } from "instantsearch.js";
import { Configure, useClearRefinements, useCurrentRefinements, useSearchBox, useStats } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { SlidersHorizontal, X } from "lucide-react";
import { searchClient } from "@/lib/algolia/client";
import { buildConfigure } from "@/lib/algolia/filterConfig";
import { useTextStore } from "@/hooks/useTextStore";
import Link from "next/link";
import type { SidebarNavigationItem, PopularBrand } from "@/lib/directus";
import type { FavoriteProduct } from "@/hooks/useFavoritesQuery";
import { CustomHits } from "../CustomHits";
import { CategoryHero, type BreadcrumbSegment } from "../CategoryHero";
import { VintageSidebar, findCurrentParent, buildChildHref } from "../VintageSidebar";
import { SimpleSearchOverlay } from "../SimpleSearchOverlay";
import { SortByDropdown } from "./SortByDropdown";
import { RefinementListAccordion } from "./RefinementListAccordion";
import { PriceRangeAccordion } from "./PriceRangeAccordion";
import { PaginationWrapper } from "./PaginationWrapper";
import { Button } from "../ui/Button";
import { PILL_SMALL } from "../ui/Pill";

/**
 * Ported from `app/components/algolia/SearchClientSSR.tsx`'s `SearchSSR`.
 * The Remix version wrapped `InstantSearch` in `InstantSearchSSRProvider`
 * fed by a `getServerState()`/`renderToString()` call in the route loader —
 * that pattern is dead in Next.js 16 App Router (hard-blocks importing
 * `react-dom/server` anywhere in the Server Component module graph, even
 * transitively). `InstantSearchNext` (from `react-instantsearch-nextjs`)
 * replaces both `InstantSearchSSRProvider` and `InstantSearch` as a drop-in
 * that handles SSR/hydration internally without that import — no
 * `serverState`/`serverUrl` props needed. The custom `stateMapping` (short
 * URL param names instead of Algolia's default nested `products[...]`
 * query-string shape) is preserved as-is; the custom `history()` router
 * (which existed only to give the SSR render a `serverUrl` fallback for
 * `getLocation()`) is dropped since `InstantSearchNext` handles that itself.
 */

interface RouteState {
  q?: string;
  brand?: string;
  size?: string;
  vendor?: string;
  color?: string;
  condition?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  page?: number;
}

function buildStateMapping(defaultSortIndex?: string) {
  return {
    stateToRoute(uiState: UiState): RouteState {
      const indexUiState = uiState['products'] || {};
      const routeState: RouteState = {};
      if (indexUiState.query) {
        routeState.q = indexUiState.query;
      }
      if (indexUiState.refinementList?.brand?.length) {
        routeState.brand = indexUiState.refinementList.brand.join('+');
      }
      if (indexUiState.refinementList?.size?.length) {
        routeState.size = indexUiState.refinementList.size.join('+');
      }
      if (indexUiState.refinementList?.vendor?.length) {
        routeState.vendor = indexUiState.refinementList.vendor.join('+');
      }
      if (indexUiState.refinementList?.color?.length) {
        routeState.color = indexUiState.refinementList.color.join('+');
      }
      if (indexUiState.refinementList?.condition?.length) {
        routeState.condition = indexUiState.refinementList.condition.join('+');
      }
      if (indexUiState.range?.price) {
        const [min, max] = indexUiState.range.price.split(':');
        if (min) routeState.priceMin = Number(min);
        if (max) routeState.priceMax = Number(max);
      }
      if (indexUiState.sortBy) {
        routeState.sortBy = indexUiState.sortBy;
      }
      if (indexUiState.page) {
        routeState.page = indexUiState.page;
      }
      return routeState;
    },
    routeToState(routeState: RouteState): UiState {
      const indexState: UiState[string] = {};
      if (routeState.q) {
        indexState.query = routeState.q;
      }

      const refinementList: Record<string, string[]> = {};
      const splitParam = (value: string) => value.split('+');
      if (routeState.brand) refinementList.brand = splitParam(routeState.brand);
      if (routeState.size) refinementList.size = splitParam(routeState.size);
      if (routeState.vendor) refinementList.vendor = splitParam(routeState.vendor);
      if (routeState.color) refinementList.color = splitParam(routeState.color);
      if (routeState.condition) refinementList.condition = splitParam(routeState.condition);
      if (Object.keys(refinementList).length > 0) {
        indexState.refinementList = refinementList;
      }

      if (routeState.priceMin !== undefined || routeState.priceMax !== undefined) {
        indexState.range = {
          price: `${routeState.priceMin ?? ''}:${routeState.priceMax ?? ''}`,
        };
      }
      if (routeState.sortBy) {
        indexState.sortBy = routeState.sortBy;
      } else if (defaultSortIndex) {
        indexState.sortBy = defaultSortIndex;
      }
      if (routeState.page) {
        indexState.page = Number(routeState.page);
      }

      return { products: indexState };
    },
  };
}

function RefineSearchQuery({ searchState }: { searchState: string | null }) {
  const { refine: setQueryBox } = useSearchBox();
  const { refine } = useClearRefinements();

  useEffect(() => {
    if (searchState && searchState.trim()) {
      refine();
      setQueryBox(searchState);
    }
  }, [refine, setQueryBox, searchState]);

  return null;
}

/**
 * Whether the filter sidebar/button should be hidden in favor of a hint —
 * only when the category is genuinely empty (no hits, and the user hasn't
 * refined/searched into that state themselves). If a chosen filter or
 * search term is what caused 0 hits, the filters stay visible so the user
 * can undo their own selection instead of getting stuck.
 */
function useEmptyCategoryFilterState() {
  const { nbHits } = useStats();
  const { items: currentRefinements } = useCurrentRefinements();
  const { query } = useSearchBox();

  const hasActiveRefinements = currentRefinements.length > 0 || query.trim().length > 0;
  const isEmptyCategory = nbHits === 0 && !hasActiveRefinements;
  const isFilteredToZero = nbHits === 0 && hasActiveRefinements;

  return { isEmptyCategory, isFilteredToZero };
}

interface CategorySearchProps {
  userFavorites?: FavoriteProduct[];
  user?: { id?: string } | null;
  onProductClick?: (productId: string) => void;
  brand?: string;
  sidebarItems?: SidebarNavigationItem[];
  category?: string;
  keyword?: { Name?: string };
  defaultSortIndex?: string;
  altText?: string;
  h1?: string;
  introSafeHtml?: string;
  breadcrumb?: BreadcrumbSegment[];
  popularBrands?: PopularBrand[];
}

export function CategorySearch({
  userFavorites,
  user,
  onProductClick,
  brand,
  sidebarItems,
  keyword,
  defaultSortIndex,
  altText,
  h1,
  introSafeHtml,
  breadcrumb,
  popularBrands,
}: CategorySearchProps) {
  const cfg = buildConfigure({ brand });
  const [showFilters, setShowFilters] = useState(false);
  const searchQuery = useTextStore((state) => state.searchQuery);
  const setSearchQueryStore = useTextStore((state) => state.setSearchQuery);
  const isSearchOpen = useTextStore((state) => state.isSearchOpen);
  const setIsSearchOpen = useTextStore((state) => state.setIsSearchOpen);
  const stateMapping = React.useMemo(() => buildStateMapping(defaultSortIndex), [defaultSortIndex]);

  // Sync URL query parameter with store on mount and URL change (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get('q') || '';
      setSearchQueryStore(urlQuery);
    }
  }, [setSearchQueryStore]);

  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFilters]);

  return (
    <InstantSearchNext
      searchClient={searchClient}
      indexName="products"
      routing={{ stateMapping }}
      insights={true}
    >
      {/* Configure filters - InstantSearch routing handles URL query params automatically */}
      {cfg?.length === 0 && (
        <Configure facetFilters={cfg} />
      )}
      <CategorySearchBody
        h1={h1}
        introSafeHtml={introSafeHtml}
        breadcrumb={breadcrumb}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        sidebarItems={sidebarItems}
        brand={brand}
        altText={altText}
        keyword={keyword}
        userFavorites={userFavorites}
        user={user}
        onProductClick={onProductClick}
        searchQuery={searchQuery}
        popularBrands={popularBrands}
      />
    </InstantSearchNext>
  );
}

interface CategorySearchBodyProps {
  h1?: string;
  introSafeHtml?: string;
  breadcrumb?: BreadcrumbSegment[];
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (value: boolean) => void;
  sidebarItems?: SidebarNavigationItem[];
  brand?: string;
  altText?: string;
  keyword?: { Name?: string };
  userFavorites?: FavoriteProduct[];
  user?: { id?: string } | null;
  onProductClick?: (productId: string) => void;
  searchQuery: string;
  popularBrands?: PopularBrand[];
}

/**
 * Split out from `CategorySearch` so `useStats`/`useCurrentRefinements`
 * (and the existing `useSearchBox`/`useClearRefinements` used elsewhere in
 * this file) can actually run inside the `InstantSearchNext` context —
 * same reason `RefineSearchQuery` above is its own component instead of
 * inline logic in `CategorySearch`.
 */
function CategorySearchBody({
  h1,
  introSafeHtml,
  breadcrumb,
  showFilters,
  setShowFilters,
  isSearchOpen,
  setIsSearchOpen,
  sidebarItems,
  brand,
  altText,
  keyword,
  userFavorites,
  user,
  onProductClick,
  searchQuery,
  popularBrands,
}: CategorySearchBodyProps) {
  const { isEmptyCategory, isFilteredToZero } = useEmptyCategoryFilterState();
  const { refine: clearRefinements } = useClearRefinements();
  const pathname = usePathname();
  const { currentParent, brandSegment } = useMemo(
    () => findCurrentParent(sidebarItems ?? [], pathname),
    [sidebarItems, pathname]
  );

  return (
    <div>
      <CategoryHero h1={h1} safeHtml={introSafeHtml} breadcrumb={breadcrumb ?? []} />

      {!isEmptyCategory && (
        <>
          {/* Mobile Filter Button */}
          <div className="lg:pb-4 mb-4 lg:mb-4 lg:border-b-2 lg:border-gray-200 lg:hidden grid gap-4 grid-cols-[1fr_175px] justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-white h-[45px]"
            >
              <SlidersHorizontal size={16} className="mr-2" />
              Filter
            </Button>
            <div className="lg:hidden ">
              <SortByDropdown
                items={[
                  { value: 'products', label: 'Relevanz' },
                  { value: 'products_price_asc', label: 'Preis aufsteigend' },
                  { value: 'products_price_desc', label: 'Preis absteigend' },
                  { value: 'products_new', label: 'Neueste zuerst' },
                ]}
              />
            </div>
          </div>

          {/* Mobile Filter Slide Panel */}
          <div className={`${showFilters ? "visible" : "hidden"}`}>
            <div
              className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowFilters(false);
              }}
            />

            <div className="fixed top-0 left-0 bottom-0 w-80 bg-white z-[101] shadow-2xl flex flex-col lg:hidden animate-slide-in">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Filter</h2>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFilters(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <RefinementListAccordion attribute="brand" title="Brand" searchable={true} defaultOpen={true} />
                <RefinementListAccordion attribute="size" title="Größe" searchable={false} />
                <RefinementListAccordion attribute="vendor_name" title="Händler" searchable={false} />
                <RefinementListAccordion attribute="price" title="Preis" />
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFilters(false);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFilters(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Anzeigen
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {isSearchOpen && (
        <SimpleSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      )}
      <div className="grid grid-cols-[auto_175px] gap-4 mb-4 pt-0 py-[15px] border-b-[#ddd] border-b border-solid lg:hidden">
        <div className=" items-center flex ">
          {sidebarItems && sidebarItems.length > 0 && (
            <VintageSidebar items={sidebarItems} />
          )}
        </div>
        {!isEmptyCategory && (
          <div className="hidden lg:block">
            <SortByDropdown
              items={[
                { value: 'products', label: 'Relevanz' },
                { value: 'products_price_asc', label: 'Preis aufsteigend' },
                { value: 'products_price_desc', label: 'Preis absteigend' },
                { value: 'products_new', label: 'Neueste zuerst' },
              ]}
            />
          </div>
        )}
      </div>
      <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-5 ">
        {isEmptyCategory ? (
          <div className="hidden lg:block min-w-full h-fit gap-4 mb-6 p-4 bg-white rounded-md border border-gray-200">
            <p className="text-md font-bold uppercase tracking-wide text-vintage-secondary">Filter</p>
            <p className="mt-2 text-sm text-gray-500">
              Filter sind verfügbar, sobald Produkte in dieser Kategorie gelistet sind.
            </p>
            <hr className="my-4 border-t border-gray-200" />
            {currentParent?.children && currentParent.children.length > 0 && (
              <div className="mt-5">
                <p className="text-md font-semibold uppercase tracking-wide text-vintage-secondary">
                  {currentParent.label} nach Typ
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentParent.children.map((child) => (
                    <Link
                      key={child.id}
                      href={buildChildHref(currentParent, brandSegment, child)}
                      className={PILL_SMALL}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <hr className="my-4 border-t border-gray-200" />
            {popularBrands && popularBrands.length > 0 && (
              <div className="mt-5">
                <p className="text-md font-semibold uppercase tracking-wide text-vintage-secondary">
                  Beliebte Marken
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {popularBrands.map((popularBrand) => (
                    <Link
                      key={popularBrand.id}
                      href={popularBrand.href}
                      className={PILL_SMALL}
                    >
                      {popularBrand.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden lg:block min-w-full gap-4 mb-6  bg-white  vintage-filter-section rounded-md shadow-sm ">
            <RefinementListAccordion attribute="brand" title="Brand" searchable={true} defaultOpen={true} />
            <RefinementListAccordion attribute="size" title="Größe" searchable={true} defaultOpen={true} />
            <RefinementListAccordion attribute="vendor_name" title="Händler" searchable={true} defaultOpen={true} />
            <RefinementListAccordion attribute="tags" title="Tags" searchable={true} defaultOpen={true} />
            <RefinementListAccordion attribute="condition" title="Zustand" searchable={true} defaultOpen={true} />
            <PriceRangeAccordion attribute="price" title="Preis" defaultOpen={true} />
          </div>
        )}

        <div>
          {isFilteredToZero && (
            <div className="mb-4 flex items-center justify-between rounded-md border border-gray-200 bg-vintage-silverGray/40 px-4 py-3 text-sm text-gray-600">
              Keine Treffer für die aktuelle Filterauswahl.
              <button
                type="button"
                onClick={() => clearRefinements()}
                className="font-medium text-vintage-primary hover:underline"
              >
                Filter zurücksetzen
              </button>
            </div>
          )}
          <CustomHits
            brand={brand}
            altText={altText}
            keyword={keyword}
            userFavorites={userFavorites}
            viewMode="grid"
            user={user}
            onProductClick={onProductClick}
            sidebarItems={sidebarItems}
          />
        </div>
      </div>

      <RefineSearchQuery searchState={searchQuery} />
      <PaginationWrapper />
    </div>
  );
}

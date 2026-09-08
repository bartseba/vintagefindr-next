'use client'

import React, { useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { routes } from '@/constant/routes';
import { PILL_BASE, PILL_ACTIVE, PILL_INACTIVE } from './ui/Pill';

export interface NavigationItem {
  id: string | number;
  label: string;
  href: string;
  children?: NavigationItem[];
  isBrand?: boolean;
  notShowCategory?: (string | number)[];
}

function filterNotShown(children: NavigationItem[], notShowCategory?: (string | number)[]): NavigationItem[] {
  if (!notShowCategory || notShowCategory.length === 0) return children;
  const excluded = notShowCategory.map(String);
  return children.filter(child => !excluded.includes(String(child.id)));
}

/**
 * Finds the active non-brand category (and, for `/vintage/<brand>/<category>`
 * URLs, the brand segment) for a pathname — the same lookup `VintageSidebar`
 * itself uses to decide which pill row to render. Exported so other
 * components (the empty-category filter box in `CategorySearch.tsx`) can
 * derive "current category's subcategories" without duplicating this logic.
 */
export function findCurrentParent(
  items: NavigationItem[],
  pathname: string
): { currentParent?: NavigationItem; brandSegment: string | null } {
  const findParent = (path: string) =>
    items
      .filter(item => !item.isBrand && (
        path === item.href || path.startsWith(item.href + '/') ||
        (item.children?.some(
          child => path === child.href || path.startsWith(child.href + '/')
        ) ?? false)
      ))
      .sort((a, b) => b.href.length - a.href.length)[0];

  const directMatch = findParent(pathname);
  if (directMatch) return { currentParent: directMatch, brandSegment: null };

  // For /vintage/adidas/jacken → try /vintage/jacken (strip brand segment)
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 3) {
    const strippedPath = '/' + [segments[0], ...segments.slice(2)].join('/');
    const strippedMatch = findParent(strippedPath);
    if (strippedMatch) return { currentParent: strippedMatch, brandSegment: segments[1] };
  }

  return { currentParent: undefined, brandSegment: null };
}

/** Same child-href derivation `VintageSidebar` uses for its category pills. */
export function buildChildHref(
  currentParent: NavigationItem,
  brandSegment: string | null,
  child: NavigationItem
): string {
  const childSegment = child.href.split('/').filter(Boolean).pop();
  return brandSegment
    ? child.href.replace(/^\/vintage\//, `/vintage/${brandSegment}/`)
    : currentParent.isBrand
      ? `${currentParent.href}/${childSegment}`
      : child.href;
}

interface VintageSidebarProps {
  items: NavigationItem[];
}
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center border border-gray-100 justify-center w-10 h-10 vintage-border hover:bg-slate-100 rounded-md bg-white transition-colors flex-shrink-0"
      aria-label="Zurück"
    >
      <ChevronLeft className="h-6 w-6 text-vintage-secondary" />
    </button>
  );
}

function sortAlleFirst(children: NavigationItem[]): NavigationItem[] {
  return [...children].sort((a, b) => {
    const aAlle = a.label.toLowerCase().includes('alle');
    const bAlle = b.label.toLowerCase().includes('alle');
    if (aAlle && !bAlle) return -1;
    if (!aAlle && bAlle) return 1;
    return 0;
  });
}

export const VintageSidebar: React.FC<VintageSidebarProps> = ({ items }) => {
  const pathname = usePathname();
  const router = useRouter();

  const parentPath = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return '/';
    segments.pop();
    return '/' + segments.join('/');
  }, [pathname]);

  const allBrands = useMemo(() => items.filter(item => item.isBrand), [items]);

  const { currentParent, brandSegment } = useMemo(
    () => findCurrentParent(items, pathname),
    [items, pathname]
  );

  const activeBrand = useMemo(
    () => allBrands.find(brand =>
      pathname === brand.href || pathname.startsWith(brand.href + '/')
    ),
    [allBrands, pathname]
  );

  const isVintageMainPage = pathname === '/vintage' || pathname === routes.newDrop;

  return (
    <div className="w-full sticky top-0 z-10">
      {isVintageMainPage ? (
        <div className="overflow-x-auto scrollbar-hide max-w-[calc(100vw_-_35px)] lg:max-w-[1380px]">
          <div className="flex gap-2 min-w-min">
            {items.filter(item => item.href !== '/vintage').map(item => (
              <Link
                key={item.id}
                href={item.href}
                className={`${PILL_BASE} ${pathname === item.href ? PILL_ACTIVE : PILL_INACTIVE}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

      ) : currentParent?.children && currentParent.children.length > 0 ? (
        <div className="overflow-x-auto scrollbar-hide max-w-[calc(100vw_-_35px)] lg:max-w-[1380px]">
          <div className="flex gap-2 min-w-min">
            <BackButton onClick={() => router.push(parentPath)} />
            {sortAlleFirst(filterNotShown(
              currentParent.children,
              brandSegment
                ? allBrands.find(brand => brand.href === `/vintage/${brandSegment}`)?.notShowCategory
                : currentParent.notShowCategory
            )).map(child => {
              const pillHref = buildChildHref(currentParent, brandSegment, child);
              const isActive = pathname === pillHref || pathname.startsWith(pillHref + '/');
              return (
                <Link
                  key={child.id}
                  href={pillHref}
                  className={`${PILL_BASE} ${isActive ? PILL_ACTIVE : PILL_INACTIVE}`}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        </div>

      ) : activeBrand ? (
        <div className="flex flex-col gap-0">
          <div className="px-4 overflow-x-auto scrollbar-hide max-w-[calc(100vw_-_35px)] lg:max-w-[1380px]">
            <div className="flex gap-4 min-w-min py-2">
              {allBrands.map(brand => (
                <Link
                  key={brand.id}
                  href={brand.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 leading-[14px] flex items-center
                    ${pathname === brand.href || pathname.startsWith(brand.href + '/')
                      ? 'bg-vintage-secondary text-white'
                      : 'bg-slate-100 text-vintage-secondary hover:bg-vintage-primary hover:text-white'
                    }`}
                >
                  {brand.label}
                </Link>
              ))}
            </div>
          </div>
          {activeBrand.children && activeBrand.children.length > 0 && (
            <div className="overflow-x-auto scrollbar-hide max-w-[calc(100vw_-_35px)] lg:max-w-[1380px]">
              <div className="flex gap-2 min-w-min">
                {sortAlleFirst(filterNotShown(activeBrand.children, activeBrand.notShowCategory)).map(child => {
                  const childSegment = child.href.split('/').filter(Boolean).pop();
                  const pillHref = `${activeBrand.href}/${childSegment}`;
                  const isActive = pathname === pillHref || pathname.startsWith(pillHref + '/');
                  return (
                    <Link
                      key={child.id}
                      href={pillHref}
                      className={`${PILL_BASE} ${isActive ? PILL_ACTIVE : PILL_INACTIVE}`}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      ) : null}
    </div>
  );
};

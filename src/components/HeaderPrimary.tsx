'use client'

import { Search, User, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NavigationToggle } from './ui/NavigationToggle'
import { SlideMenu } from './SlideMenu'
import { MegaMenu } from './MegaMenu'
import { FavoritesButton } from './FavoritesButton'
import { AutocompleteSearch } from './AutocompleteSearch'
import type { NavigationSection } from '@/lib/directus'
import type { FavoriteProduct } from '@/hooks/useFavoritesQuery'
import { useTextStore } from '@/hooks/useTextStore'
import { Logo } from './Logo'
import { LatestLogo } from './icons'
import { routes } from '@/constant/routes'

interface HeaderUser {
  id: string
  email?: string
  first_name?: string
  avatar_url?: string
}

interface HeaderVendorProfile {
  store_name: string
}

interface HeaderPrimaryProps {
  user: HeaderUser | null
  userFavorites: FavoriteProduct[]
  vendorProfile?: HeaderVendorProfile
  navigationSections?: NavigationSection[]
  /** SSR-detected mobile state for hydration-safe rendering */
  isMobile?: boolean
}

export function HeaderPrimary({ user, userFavorites, vendorProfile, navigationSections = [], isMobile: ssrIsMobile }: HeaderPrimaryProps) {
  const toggleSearchOpen = useTextStore((state) => state.toggleSearchOpen)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMegaOpen, setIsMegaOpen] = useState(false)


  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const closeMenu = () => setIsMenuOpen(!isMenuOpen)
  return (
    <>
      <header
        className={[
          ' z-[100] sticky top-0  border-b-[#e3e7ee] border-b-2 border-solid',
          isScrolled
            ? 'bg-white/95 z-[100] '
            : 'bg-white'
        ].join(' ')}
      >
        <div  className={[
          'm-auto xl:container flex items-center gap-4 justify-between pr-4 h-[70px] lg:h-[90px]',
          isScrolled
            ? ' lg:flex lg:sticky'
            : 'flex'
        ].join(' ')}>
          {/* Mobile: Logo Left */}
          <div className="flex px-2 items-center relative z-[90] lg:hidden">
            <Logo size="sm" />
          </div>
          <button
          type="button"
          data-megamenu-toggle
          onClick={(e) => {
            e.preventDefault()
           setIsMegaOpen((v) => !v)
          }}
          className="flex lg:hidden text-sm roboto-mono-vintage font-medium items-center justify-center bg-vintage-primary text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/50 h-[50px] min-w-[110px] rounded-md px-4"
        >
          Entdecken
          <ChevronDown className={isMegaOpen ? 'rotate-180 transition-transform ml-1' : 'transition-transform ml-1'} />
        </button>

          {/* Mobile: Favorites & Account Right */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                toggleSearchOpen()
              }}
              aria-label="Suche öffnen"
              className="h-10 w-10 flex items-center justify-center rounded-md text-vintage-secondary hover:bg-vintage-primary hover:text-white"
            >
              <Search />
            </button>
            <div className="h-10 w-10 flex items-center justify-center rounded-md text-vintage-secondary ">
              <FavoritesButton
                initialFavorites={userFavorites}
                userId={user?.id}
              />
            </div>
            {user?.id ? (
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Benutzerkonto"
                className="w-[25px] h-[25px] lg:w-[50px] lg:h-[50px] grow bg-vintage-primary rounded-full flex items-center justify-center"
              >
                <span className="text-white font-medium text-xl">
                  {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Anmelden"
                className="mr-2 h-10 w-10 flex items-center justify-center rounded-md text-vintage-secondary hover:bg-vintage-primary hover:text-white"
              >
                <User className="h-6 w-6" />
              </button>
            )}

          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex w-full items-center gap-4 justify-between px-0" style={{ height: '60px' }}>
            <div className="flex px-2 items-center relative z-[90]">
              <Link aria-label="zur startseite" href={"/"}>
                <LatestLogo width={"100px"} height={"60px"}/>
              </Link>
            </div>
            <button
              data-megamenu-toggle
              onClick={(e) => {
                e.stopPropagation();
                setIsMegaOpen((v) => !v);
              }}
              aria-expanded={isMegaOpen}
              aria-haspopup="dialog"
              className={`roboto-mono-vintage font-medium ${isMegaOpen ? 'font-bold' : ''} hover:font-bold link-underline relative  px-3 md:px-2 py-3 text-md md:text-l hover:text-vintage-primary rounded-md transition-all duration-200 ease-in-out h-full flex items-center justify-center text-vintage-secondary hover:text-vintage-primary`}
              aria-label="Menü öffnen"
            >
              Kleidung
            </button>

            <div className="flex items-center gap-4">
              <NavigationToggle options={['Marken']} link={'/vintage/marken'} defaultValue="" />
              <NavigationToggle options={['Trikots']} link={"/vintage/trikots"} defaultValue="" />
              <NavigationToggle options={['Neue Drops']} link={routes.newDrop} defaultValue="" />
              <NavigationToggle options={['Ratgeber']} link={"/ratgeber"} defaultValue="" />
            </div>
                        <div className="xl:mx-6 flex-1 relative z-[90] h-[70px] content-center">
              <div className='hidden xl:flex'>
                <AutocompleteSearch
                  placeholder="Suche nach Vintage-Pieces oder Marke, Kategorie..."
                  className="w-full"
                />
              </div>

            </div>
          </div>

          <div className='gap-4 hidden lg:flex items-center'>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  toggleSearchOpen()
                }}
                aria-label="Suche öffnen"
                className="xl:hidden ml-4 cursor-pointer justify-self-center h-[56px] w-[56px] flex items-center justify-center rounded-md text-vintage-secondary hover:bg-vintage-primary hover:text-white"
              >
                <Search size={32} />
              </button>

              <FavoritesButton
                initialFavorites={userFavorites}
                userId={user?.id}
              />

               {user?.id ? (
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Benutzerkonto"
                  className="w-[50px] h-[50px] grow cursor-pointer flex items-center justify-center"
                >
                    <span className="text-white font-medium text-xl">
                    {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7)
                    <img src={user.avatar_url} alt={user.first_name || 'Benutzer-Avatar'} className='w-8 h-8 rounded-full overflow-hidden border-2 border-vintage-primary'/>
                  ): (
                    <div className='bg-vintage-primary w-[50px] h-[50px] rounded-full flex items-center justify-center'>
                  {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                  )}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Anmelden"
                className="cursor-pointer mr-2 h-8 w-8 sm:h-[56px] sm:w-[56px] flex items-center justify-center rounded-md text-vintage-secondary hover:bg-vintage-primary hover:text-white"
              >
                <User size={28} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Slide-in Account Menu */}
      <SlideMenu isOpen={isMenuOpen} user={user} vendorProfile={vendorProfile} onClose={closeMenu} />

      {/* FULL-WIDTH MEGA MENU (mounted outside header, fixed under it) */}
      <MegaMenu open={isMegaOpen} onClose={() => {
                setIsMegaOpen(false)
              }} topOffset={"top-0"} sections={navigationSections} />
    </>
  )
}

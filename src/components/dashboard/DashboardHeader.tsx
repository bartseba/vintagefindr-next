'use client'

import Link from 'next/link'
import { Package, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { browse } from '@/constant/routes'

interface DashboardHeaderUser {
  first_name?: string | null
  email?: string
  avatar_url?: string | null
}

/**
 * Ported from `dashboard.tsx`'s inline header. Logout is client-side
 * (`supabase.auth.signOut()` + full page reload) — same pattern already
 * established in `SlideMenu.tsx`'s logout, reusing the same singleton
 * browser client instead of the Remix original's inline
 * `await import('@supabase/ssr')` construction.
 */
export function DashboardHeader({ user }: { user: DashboardHeaderUser }) {
  const handleLogout = async () => {
    try {
      const supabase = createSupabaseBrowserClient()
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/'
    }
  }

  return (
    <header className="bg-white shadow-md border-b-[#EAEAEA] border-b-1 border-solid py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-vintage-secondary">|</span>
            <span className="text-vintage-secondary">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href={browse}>
              <Button variant="outline" size="sm">
                <Package size={16} className="mr-2" />
                Entdecken
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <Settings size={16} className="mr-2" />
                Profil
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Abmelden
            </Button>
            {user.avatar_url ? (
              <div className="w-8 h-8 bg-vintage-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element -- external Bunny CDN image host, next/image adoption deferred (see migration plan problem #7) */}
                  <img src={user.avatar_url} className='w-8 h-8 rounded-full overflow-hidden' alt="" />
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-vintage-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

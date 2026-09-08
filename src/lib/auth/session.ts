import 'server-only'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { FavoriteProduct } from '@/hooks/useFavoritesQuery'
import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Ported from the `if (!authUser || error) return redirect('/login?redirectTo=...')`
 * guard repeated at the top of every Remix dashboard-area loader
 * (`dashboard.tsx`, `_info.favorites.tsx`, `profile.tsx`, `_info.following.tsx`).
 * `/login` itself now just redirects to `/?modal=login` (Phase 4), so this
 * goes straight there instead of bouncing through `/login` twice.
 */
export async function requireAuthUser(redirectTo: string): Promise<{ supabase: SupabaseClient; authUser: User }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user: authUser }, error } = await supabase.auth.getUser()

  if (!authUser || error) {
    redirect(`/?modal=login&redirectTo=${encodeURIComponent(redirectTo)}`)
  }

  return { supabase, authUser }
}

/**
 * Ported from `requireAdminAuth` (`app/lib/auth.server.ts`) — the guard
 * shared by every Remix admin route. Queries the `user_roles` table
 * directly (RLS-scoped, not the `is_admin()` RPC) exactly like the Remix
 * original does — `admin.login.tsx`'s own loader/action use the RPC
 * instead, a pre-existing inconsistency between the two call sites in the
 * Remix app, preserved here rather than unified.
 */
export async function requireAdminAuth(): Promise<{ supabase: SupabaseClient; authUser: User; role: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user: authUser }, error } = await supabase.auth.getUser()

  if (!authUser || error) {
    redirect('/admin/login')
  }

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', authUser.id)
    .single()

  if (!userRole || userRole.role !== 'admin') {
    redirect('/admin/login?error=unauthorized')
  }

  return { supabase, authUser, role: userRole.role }
}

/**
 * Full `vendors` row shape, evidenced by field accesses across the Remix
 * vendor-dashboard routes (`vendor.dashboard.tsx`, `vendor.settings.tsx`,
 * `vendor.analytics.tsx`, ...). Extended incrementally as later vendor
 * sub-phases reference fields not yet covered here.
 */
export interface VendorRecord {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  store_name: string
  store_website: string | null
  store_location: string | null
  ecommerce_platform: string | null
  inventory_system: string | null
  number_of_items: number | null
  status: string
  avatar_url: string | null
  is_active: boolean
  paused_at: string | null
  deleted: boolean
  created_at: string
  shopify_domain: string | null
  shopify_installed_at: string | null
  shopify_sync_status: string | null
  ctr_goal: number | null
  monthly_click_goal: number | null
}

/**
 * Ported from `requireVendorAuth` (`app/lib/auth.server.ts`) — the guard
 * shared by every Remix vendor-dashboard route. Redirects to
 * `/vendor/login?modal=login` if not authenticated at all, to
 * `/vendor/login?error=account_deleted` if a vendor row exists but is
 * soft-deleted, or to `/vendor/register` if no vendor row exists yet.
 */
export async function requireVendorAuth(): Promise<{ supabase: SupabaseClient; authUser: User; vendor: VendorRecord }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user: authUser }, error } = await supabase.auth.getUser()

  if (!authUser || error) {
    redirect('/vendor/login?modal=login')
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', authUser.id)
    .eq('deleted', false)
    .maybeSingle()

  if (!vendor) {
    const { data: deletedVendor } = await supabase
      .from('vendors')
      .select('id, deleted')
      .eq('user_id', authUser.id)
      .maybeSingle()

    if (deletedVendor?.deleted) {
      redirect('/vendor/login?error=account_deleted')
    }

    redirect('/vendor/register')
  }

  return { supabase, authUser, vendor: vendor as VendorRecord }
}

export interface SessionUser {
  id: string
  email?: string
  first_name?: string
  avatar_url?: string
}

export interface VendorProfile {
  store_name: string
}

export interface SessionContext {
  user: SessionUser | null
  vendorProfile: VendorProfile | undefined
  userFavorites: FavoriteProduct[]
  isAdmin: boolean
}

const EMPTY_SESSION: SessionContext = { user: null, vendorProfile: undefined, userFavorites: [], isAdmin: false }

/**
 * Server-side session lookup for the logged-in Header/dashboard state —
 * consolidates what the Remix app repeated in nearly every route loader
 * (`_index.tsx`, `vintage.tsx`, `ratgeber._index.tsx`, `login.tsx`, ...):
 * get the authenticated user, check admin/vendor role via the `is_admin`
 * RPC and a `vendors` lookup, and load favorites. Used by `Header.tsx` so
 * every page gets real logged-in state without each page re-implementing
 * this block.
 */
export async function getSessionContext(): Promise<SessionContext> {
  const supabase = await createSupabaseServerClient()
  const { data: { user: authUser }, error } = await supabase.auth.getUser()

  if (!authUser || error) {
    return EMPTY_SESSION
  }

  try {
    const [{ data: isAdminResult }, { data: userData }, { data: vendorData }, { data: favoritesData }] = await Promise.all([
      supabase.rpc('is_admin', { user_uuid: authUser.id }),
      supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
      supabase.from('vendors').select('*').eq('user_id', authUser.id).eq('deleted', false).maybeSingle(),
      supabase
        .from('user_favorites')
        .select(`
          *,
          products!inner(
            *,
            vendors!inner(store_name, status)
          )
        `)
        .eq('user_id', authUser.id)
        .eq('products.is_active', true)
        .eq('products.deleted', false)
        .eq('products.vendors.status', 'approved')
        .order('created_at', { ascending: false }),
    ])

    const vendorProfile: VendorProfile | undefined = vendorData ? { store_name: vendorData.store_name } : undefined

    // If no user profile but vendor exists, build a minimal user object from auth — matches
    // the Remix loaders' fallback (`app/routes/_index.tsx`, `vintage.tsx`, `ratgeber._index.tsx`)
    const user: SessionUser = !userData && vendorProfile
      ? { id: authUser.id, email: authUser.email, first_name: vendorProfile.store_name, avatar_url: undefined }
      : (userData ?? { id: authUser.id, email: authUser.email })

    interface FavoriteRow {
      id: string
      products: {
        id: string
        title: string
        brand: string | null
        price: number
        currency: string | null
        image_url_1: string | null
        product_url: string | null
        vendors?: { store_name: string | null } | null
      }
    }

    const userFavorites: FavoriteProduct[] = ((favoritesData ?? []) as unknown as FavoriteRow[]).map((fav) => ({
      id: fav.products.id,
      title: fav.products.title,
      brand: fav.products.brand ?? undefined,
      price: fav.products.price,
      currency: fav.products.currency || 'EUR',
      imageUrl: fav.products.image_url_1 ?? undefined,
      vendorName: fav.products.vendors?.store_name || 'Unknown',
      productUrl: fav.products.product_url ?? undefined,
    }))

    return {
      user,
      vendorProfile,
      userFavorites,
      isAdmin: isAdminResult === true,
    }
  } catch (error) {
    console.error('Session context error:', error)
    return { ...EMPTY_SESSION, user: { id: authUser.id, email: authUser.email } }
  }
}

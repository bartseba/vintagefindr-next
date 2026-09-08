import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AdminSuggestionsView, type SuggestionItem } from '@/components/admin/AdminSuggestionsView'

interface RawSuggestionRow {
  id: string
  status: string
  created_at: string
  reviewed_at: string | null
  vendors: { store_name: string | null; email: string | null } | null
  brand_name?: string
  category_name?: string
  size_value?: string
}

/**
 * Ported from `admin.suggestions.tsx`'s `loader` — that route checks
 * admin status via the `is_admin()` RPC directly (like `admin.login.tsx`
 * and the extension-request API routes), not `requireAdminAuth`'s
 * `user_roles` query, and throws a raw 401/403 `Response` rather than
 * redirecting. The RPC-vs-table-query distinction is preserved; the raw
 * 401/403 isn't — Next's App Router has no clean way for a page component
 * to return an arbitrary status code without the experimental
 * `authInterrupts` flag, so this redirects to `/admin/login` instead,
 * matching every other admin route's unauthenticated-access behavior.
 */
export default async function AdminSuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: isAdminResult } = await supabase.rpc('is_admin', { user_uuid: user.id })
  if (isAdminResult !== true) {
    redirect('/admin/login')
  }

  const params = await searchParams
  const validStatuses = ['pending', 'approved', 'rejected']
  const status = validStatuses.includes(params.status || '') ? params.status! : 'pending'

  const [pendingCounts, approvedCounts, rejectedCounts] = await Promise.all([
    Promise.all([
      supabase.from('brand_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('category_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('size_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]),
    Promise.all([
      supabase.from('brand_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('category_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('size_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    ]),
    Promise.all([
      supabase.from('brand_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('category_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('size_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
    ]),
  ])

  const counts = {
    pending: (pendingCounts[0].count || 0) + (pendingCounts[1].count || 0) + (pendingCounts[2].count || 0),
    approved: (approvedCounts[0].count || 0) + (approvedCounts[1].count || 0) + (approvedCounts[2].count || 0),
    rejected: (rejectedCounts[0].count || 0) + (rejectedCounts[1].count || 0) + (rejectedCounts[2].count || 0),
  }

  const [brandSuggestions, categorySuggestions, sizeSuggestions] = await Promise.all([
    supabase
      .from('brand_suggestions')
      .select(`*, vendors (store_name, email)`)
      .eq('status', status)
      .order('created_at', { ascending: false }),
    supabase
      .from('category_suggestions')
      .select(`*, vendors (store_name, email)`)
      .eq('status', status)
      .order('created_at', { ascending: false }),
    supabase
      .from('size_suggestions')
      .select(`*, vendors (store_name, email)`)
      .eq('status', status)
      .order('created_at', { ascending: false }),
  ])

  const mapRows = (rows: RawSuggestionRow[] | null, labelField: 'brand_name' | 'category_name' | 'size_value'): SuggestionItem[] =>
    (rows || []).map((row) => ({
      id: row.id,
      label: row[labelField] || '',
      createdAt: row.created_at,
      reviewedAt: row.reviewed_at,
      vendorStoreName: row.vendors?.store_name || null,
      vendorEmail: row.vendors?.email || null,
    }))

  return (
    <AdminSuggestionsView
      brandSuggestions={mapRows(brandSuggestions.data as RawSuggestionRow[] | null, 'brand_name')}
      categorySuggestions={mapRows(categorySuggestions.data as RawSuggestionRow[] | null, 'category_name')}
      sizeSuggestions={mapRows(sizeSuggestions.data as RawSuggestionRow[] | null, 'size_value')}
      currentStatus={status}
      counts={counts}
    />
  )
}

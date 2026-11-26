import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  MAX_SAVED_SEARCHES_PER_USER,
  parseSavedSearchInput,
  savedSearchKey,
  type SavedSearchRow,
} from '@/lib/savedSearch'

const LIST_COLUMNS = 'id, label, query, refinements, price_min, price_max, base_filters, base_facet_filters, result_path, is_active, created_at'

async function getUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { supabase, user: error ? null : user }
}

export async function GET() {
  const { supabase, user } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('saved_searches')
    .select(LIST_COLUMNS)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[saved-searches] list failed:', error)
    return NextResponse.json({ error: 'Konnte Such-Alerts nicht laden' }, { status: 500 })
  }
  return NextResponse.json({ savedSearches: data ?? [] })
}

export async function POST(request: Request) {
  const { supabase, user } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const input = parseSavedSearchInput(await request.json().catch(() => null))
  if (!input) return NextResponse.json({ error: 'Ungültige Suche' }, { status: 400 })

  const { data: existing, error: listError } = await supabase
    .from('saved_searches')
    .select('id, query, refinements, price_min, price_max, base_filters, base_facet_filters')
    .eq('user_id', user.id)

  if (listError) {
    console.error('[saved-searches] lookup failed:', listError)
    return NextResponse.json({ error: 'Konnte Such-Alert nicht speichern' }, { status: 500 })
  }

  const key = savedSearchKey(input)
  const duplicate = (existing as Pick<SavedSearchRow, 'id' | 'query' | 'refinements' | 'price_min' | 'price_max' | 'base_filters' | 'base_facet_filters'>[] | null)
    ?.find((row) => savedSearchKey(row) === key)
  if (duplicate) {
    return NextResponse.json({ success: true, id: duplicate.id, alreadySaved: true })
  }

  if ((existing?.length ?? 0) >= MAX_SAVED_SEARCHES_PER_USER) {
    return NextResponse.json(
      { error: `Du kannst maximal ${MAX_SAVED_SEARCHES_PER_USER} Such-Alerts speichern. Lösche einen im Dashboard.` },
      { status: 409 }
    )
  }

  const { data, error } = await supabase
    .from('saved_searches')
    .insert({ ...input, user_id: user.id })
    .select('id')
    .single()

  if (error) {
    console.error('[saved-searches] insert failed:', error)
    return NextResponse.json({ error: 'Konnte Such-Alert nicht speichern' }, { status: 500 })
  }
  return NextResponse.json({ success: true, id: data.id })
}

export async function DELETE(request: Request) {
  const { supabase, user } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400 })

  const { error } = await supabase.from('saved_searches').delete().eq('id', id).eq('user_id', user.id)
  if (error) {
    console.error('[saved-searches] delete failed:', error)
    return NextResponse.json({ error: 'Konnte Such-Alert nicht löschen' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}

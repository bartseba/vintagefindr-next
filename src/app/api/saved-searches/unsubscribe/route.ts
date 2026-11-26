import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

/**
 * One-click unsubscribe from a single search alert, no login needed: the
 * per-search `unsubscribe_token` (random UUID) is the credential. GET is the
 * link in the email, POST is RFC 8058 `List-Unsubscribe-Post` one-click.
 */
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function deactivate(token: string | null) {
  if (!token || !UUID_RE.test(token)) return false
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('saved_searches').update({ is_active: false }).eq('unsubscribe_token', token)
  if (error) {
    console.error('[saved-searches] unsubscribe failed:', error)
    return false
  }
  return true
}

function page(title: string, body: string) {
  const site = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://vintagefindr.de').replace(/\/$/, '')
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head>
<body style="margin:0;background:#f8f9fc;font-family:Roboto,Helvetica,Arial,sans-serif;color:#3d3e54">
<main style="max-width:480px;margin:15vh auto;padding:24px;background:#fff;border-radius:12px;text-align:center">
<h1 style="font-size:22px;margin:0 0 12px">${title}</h1><p style="margin:0 0 20px;color:#4b5563">${body}</p>
<a href="${site}/dashboard#such-alerts" style="color:#334d83;font-weight:700">Such-Alerts verwalten</a> · <a href="${site}/" style="color:#334d83">Zur Startseite</a>
</main></body></html>`
}

export async function GET(request: Request) {
  const ok = await deactivate(new URL(request.url).searchParams.get('token'))
  const html = ok
    ? page('Such-Alert abbestellt', 'Du bekommst für diese Suche keine E-Mails mehr.')
    : page('Das hat nicht geklappt', 'Der Link ist ungültig. Du kannst deine Such-Alerts im Dashboard verwalten.')
  return new NextResponse(html, { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export async function POST(request: Request) {
  const ok = await deactivate(new URL(request.url).searchParams.get('token'))
  return NextResponse.json({ success: ok }, { status: ok ? 200 : 400 })
}

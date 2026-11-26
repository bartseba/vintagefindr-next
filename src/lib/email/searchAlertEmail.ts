import type { AlertHit } from '@/lib/savedSearch'

export interface AlertEmailSection {
  label: string
  resultUrl: string
  unsubscribeUrl: string
  hits: AlertHit[]
}

export interface AlertEmail {
  subject: string
  html: string
  text: string
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatPrice(price: number | undefined, currency = 'EUR') {
  if (typeof price !== 'number' || !Number.isFinite(price)) return ''
  try {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(price)
  } catch {
    return `${price.toFixed(2)} €`
  }
}

function itemUrl(siteUrl: string, hit: AlertHit) {
  const id = hit.id || hit.objectID
  return `${siteUrl}/go/${encodeURIComponent(id)}?utm_source=vintagefindr&utm_medium=email&utm_campaign=search_alert`
}

export function buildSearchAlertEmail(sections: AlertEmailSection[], siteUrl: string): AlertEmail {
  const total = sections.reduce((sum, s) => sum + s.hits.length, 0)
  const subject =
    sections.length === 1
      ? `Neu für „${sections[0].label}“: ${total} ${total === 1 ? 'Teil' : 'Teile'}`
      : `${total} neue Vintage-Teile für deine Such-Alerts`
  const manageUrl = `${siteUrl}/dashboard#such-alerts`

  const sectionHtml = sections
    .map((section) => {
      const items = section.hits
        .map((hit) => {
          const meta = [hit.size, hit.vendor_name].filter(Boolean).map(escapeHtml).join(' · ')
          const img = hit.image_url_1
            ? `<img src="${escapeHtml(hit.image_url_1)}" alt="${escapeHtml(hit.title)}" width="96" height="96" style="display:block;width:96px;height:96px;object-fit:cover;border-radius:8px;border:0" />`
            : ''
          return `<tr>
  <td style="padding:8px 12px 8px 0;vertical-align:top;width:96px">${img}</td>
  <td style="padding:8px 0;vertical-align:top">
    <a href="${escapeHtml(itemUrl(siteUrl, hit))}" style="color:#3d3e54;font-weight:700;text-decoration:none">${escapeHtml(hit.title)}</a>
    <div style="color:#334d83;font-weight:700;margin-top:4px">${escapeHtml(formatPrice(hit.price, hit.currency))}</div>
    <div style="color:#6b7280;font-size:13px;margin-top:2px">${meta}</div>
  </td>
</tr>`
        })
        .join('')
      return `<h2 style="font-size:18px;color:#3d3e54;margin:28px 0 4px">${escapeHtml(section.label)}</h2>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">${items}</table>
<p style="margin:12px 0 0;font-size:14px">
  <a href="${escapeHtml(section.resultUrl)}" style="color:#334d83">Alle Treffer ansehen</a>
  &nbsp;·&nbsp;
  <a href="${escapeHtml(section.unsubscribeUrl)}" style="color:#6b7280">Diesen Alert abbestellen</a>
</p>`
    })
    .join('')

  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:#f8f9fc;font-family:Roboto,Helvetica,Arial,sans-serif;color:#1f2937">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#ffffff;border-radius:12px;padding:24px">
      <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#334d83;font-weight:700">VintageFindr Such-Alert</p>
      <h1 style="font-size:22px;color:#3d3e54;margin:8px 0 0">Neue Teile für deine Suchen</h1>
      ${sectionHtml}
    </div>
    <p style="font-size:12px;color:#6b7280;text-align:center;margin:16px 0 0">
      Du bekommst diese E-Mail, weil du auf VintageFindr einen Such-Alert gespeichert hast.<br>
      <a href="${escapeHtml(manageUrl)}" style="color:#6b7280">Such-Alerts verwalten</a>
    </p>
  </div>
</body></html>`

  const text = [
    'Neue Teile für deine Such-Alerts auf VintageFindr',
    '',
    ...sections.flatMap((section) => [
      `== ${section.label} ==`,
      ...section.hits.map((hit) => `- ${hit.title ?? ''} ${formatPrice(hit.price, hit.currency)} ${hit.size ?? ''}\n  ${itemUrl(siteUrl, hit)}`),
      `Alle Treffer: ${section.resultUrl}`,
      `Abbestellen: ${section.unsubscribeUrl}`,
      '',
    ]),
    `Such-Alerts verwalten: ${manageUrl}`,
  ].join('\n')

  return { subject, html, text }
}

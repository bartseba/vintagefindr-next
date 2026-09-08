import { sanitizeHTML } from '@/lib/sanitize'
import ButtonPrimary from './ui/ButtonPrimary'

interface ContentBlockItem {
  id: number
  Headline: string
  IntroText: string | null
  intro_image?: string | null
  button_text?: string | null
  button_href?: { id: number; href: string } | null
}

export function HubContentBlock({ item }: { item: ContentBlockItem }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-vintage-secondary uppercase tracking-widest mb-4">
        {item.Headline}
      </h2>
      <div className="content-block" dangerouslySetInnerHTML={{ __html: sanitizeHTML(item.IntroText ?? '') }} />
      {item.intro_image && (
        // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7)
        <img src={item.intro_image} alt={item.Headline} />
      )}
      {item.button_text && item.button_href && (
        <ButtonPrimary text={item.button_text} size={'SMALL'} className="mt-4" href={item.button_href.href} />
      )}
    </div>
  )
}

import Link from 'next/link'
import type { Guide } from '@/lib/directus'
import { sanitizeHTML } from '@/lib/sanitize'
import ButtonPrimary from '@/components/ui/ButtonPrimary'
import { GuideCard } from './GuideCard'

export function GuideView({ guide, relatedGuides }: { guide: Guide; relatedGuides: Guide[] }) {
  return (
    <div className="space-y-8">
      <article className="rounded-lg overflow-hidden bg-white vintage-border">
        {guide.hero_image && (
          // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7)
          <img
            src={guide.hero_image}
            alt={guide.title}
            className="w-full h-96 object-cover"
          />
        )}

        <div className="p-2 lg:p-8">
          <header className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {guide.title}
            </h1>

            {guide.tag_slugs && guide.tag_slugs.length > 0 && (
              <div className="flex gap-2 mt-4">
                {guide.tag_slugs.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* SECURITY: Sanitize CMS content to prevent XSS attacks */}
          <div
            className="prose prose-lg max-w-none directus-wrapper"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(guide.body || '') }}
          />
        </div>
      </article>

      {guide.teaser_list && guide.teaser_list.length > 0 && (
        <div className="">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Entdecken
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guide.teaser_list.map((entry) => (
              <Link
                key={entry.id}
                href={entry.item.url}
                className="  bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow vintage-border   p-6 "
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {entry.item.Headline}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {entry.item.text}
                </p>
                <ButtonPrimary text={"Entdecken"} size={"SMALL"} href={entry.item.url} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedGuides.length > 0 && (
        <div className="rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Weitere Artikel
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedGuides.map((relatedGuide) => (
              <GuideCard key={relatedGuide.id} guide={relatedGuide} />
            ))}
          </div>
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guide.title,
            description: guide.excerpt,
            image: guide.hero_image || undefined,
            datePublished: guide.published_at,
            author: {
              '@type': 'Organization',
              name: 'Vintage Finder'
            }
          })
        }}
      />
    </div>
  )
}

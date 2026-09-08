import Link from 'next/link'
import type { Guide } from '@/lib/directus'

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/ratgeber/${guide.slug}`}
      className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow vintage-border "
    >
      {guide.hero_image && (
        // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7)
        <img
          src={guide.hero_image}
          alt={guide.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {guide.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {guide.excerpt}
        </p>
        <div className="flex items-center justify-between">
          {guide.tag_slugs && guide.tag_slugs.length > 0 && (
            <div className="flex gap-2">
              {guide.tag_slugs.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

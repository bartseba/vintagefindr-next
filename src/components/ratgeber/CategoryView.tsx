import type { Guide, GuideCategory } from '@/lib/directus'
import { sanitizeHTML } from '@/lib/sanitize'
import { GuideCard } from './GuideCard'

export function CategoryView({ category, guides }: { category: GuideCategory; guides: Guide[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {category.name}
        </h1>
        <p dangerouslySetInnerHTML={{ __html: sanitizeHTML(category.intro_html) }} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {guides.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>

      {guides.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
          Noch keine Artikel in dieser Kategorie vorhanden.
        </div>
      )}
    </div>
  )
}

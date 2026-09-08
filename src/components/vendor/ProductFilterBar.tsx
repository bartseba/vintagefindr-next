import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const VALID_CATEGORIES = [
  'kleider', 'jacken', 'taschen', 'schmuck', 'schuhe', 'accessoires',
  'hosen', 'röcke', 'blusen', 'pullover', 'mäntel', 'hüte', 'gürtel', 'uhren',
]

interface ProductFilterBarProps {
  localSearchQuery: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSearchSubmit: (e: React.FormEvent) => void
  categoryFilter: string
  statusFilter: string
  onFilterChange: (key: string, filter: string) => void
  onClearFilters: () => void
  searchQuery: string
}

export function ProductFilterBar({
  localSearchQuery,
  onSearchChange,
  onSearchSubmit,
  categoryFilter,
  statusFilter,
  onFilterChange,
  onClearFilters,
  searchQuery,
}: ProductFilterBarProps) {
  const getFilterButtonClass = (filter: string, type: 'status' | 'category' = 'status') => {
    const currentFilter = type === 'status' ? statusFilter : categoryFilter
    const isActive = currentFilter === filter || (filter === 'all' && currentFilter === 'all')
    return `px-3 py-1 text-sm rounded transition-colors ${
      isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Produkte durchsuchen..."
              className="pl-10"
              value={localSearchQuery}
              onChange={onSearchChange}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">Alle Kategorien</option>
            {VALID_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onFilterChange('status', 'all')}
            className={`${getFilterButtonClass('all', 'status')} whitespace-nowrap border border-gray-200`}
          >
            Alle
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('status', 'published')}
            className={`${getFilterButtonClass('published', 'status')} whitespace-nowrap border border-gray-200`}
          >
            Veröffentlicht
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('status', 'draft')}
            className={`${getFilterButtonClass('draft', 'status')} whitespace-nowrap border border-gray-200`}
          >
            Entwurf
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('status', 'sold')}
            className={`${getFilterButtonClass('sold', 'status')} whitespace-nowrap border border-gray-200`}
          >
            Ausverkauft
          </button>
        </div>

        <Button type="submit" variant="outline">
          <Filter size={16} className="mr-2" />
          Suchen
        </Button>

        {(searchQuery || statusFilter !== 'all') && (
          <Button type="button" variant="outline" onClick={onClearFilters}>
            Filter zurücksetzen
          </Button>
        )}
      </form>
    </div>
  )
}

import { Button } from '@/components/ui/Button'

interface ProductPaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  searchQuery: string
  statusFilter: string
  onPageChange: (page: number) => void
}

export function ProductPagination({
  currentPage,
  totalPages,
  totalCount,
  limit,
  searchQuery,
  statusFilter,
  onPageChange,
}: ProductPaginationProps) {
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">
        {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, totalCount)} von {totalCount} Produkten
        {(searchQuery || statusFilter !== 'all') && (
          <span className="text-amber-600"> (gefiltert)</span>
        )}
      </span>
      <div className="flex gap-1 ml-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </Button>

        {getPageNumbers().map(pageNum => (
          <Button
            key={pageNum}
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageNum)}
            className={pageNum === currentPage ? 'bg-gray-900 text-white' : ''}
          >
            {pageNum}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ›
        </Button>
      </div>
    </div>
  )
}

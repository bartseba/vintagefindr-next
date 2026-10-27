interface ProductPageSizeSelectProps {
  limit: number
  onLimitChange: (limit: string) => void
}

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200]

export function ProductPageSizeSelect({ limit, onLimitChange }: ProductPageSizeSelectProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <label htmlFor="product-page-size">Pro Seite</label>
      <select
        id="product-page-size"
        value={limit}
        onChange={(e) => onLimitChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
    </div>
  )
}

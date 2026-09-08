import { Power, PowerOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Product {
  id: string
  status: 'published' | 'draft' | 'sold'
}

interface ProductBulkActionsProps {
  products: Product[]
  selectedProducts: string[]
  selectAll: boolean
  onSelectAll: () => void
  onProductAction: (productId: string, action: string, confirmAction: boolean) => void
  onBulkDelete: (productIds: string[]) => void
  onClearSelection: () => void
}

export function ProductBulkActions({
  products,
  selectedProducts,
  selectAll,
  onSelectAll,
  onProductAction,
  onBulkDelete,
  onClearSelection,
}: ProductBulkActionsProps) {
  const toggleSelectedProducts = () => {
    if (selectedProducts.length === 0) return

    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id))
    const hasInactiveProducts = selectedProductsData.some(p => p.status !== 'published')

    selectedProducts.forEach(productId => {
      const action = hasInactiveProducts ? 'activate' : 'deactivate'
      onProductAction(productId, action, true)
    })

    onClearSelection()
  }

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return
    if (confirm(`Sind Sie sicher, dass Sie ${selectedProducts.length} Produkte löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      onBulkDelete(selectedProducts)
      onClearSelection()
    }
  }

  const hasPublishedSelected = products
    .filter(p => selectedProducts.includes(p.id))
    .some(p => p.status === 'published')

  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={onSelectAll}
          className="rounded border-gray-300"
        />
        <span className="text-sm text-gray-600">
          Alle auswählen ({selectedProducts.length} ausgewählt)
        </span>
      </label>

      <Button
        variant="outline"
        size="sm"
        onClick={toggleSelectedProducts}
        disabled={selectedProducts.length === 0}
      >
        {selectedProducts.length > 0 && hasPublishedSelected ? (
          <>
            <PowerOff size={14} className="mr-2" />
            Ausgewählte deaktivieren
          </>
        ) : (
          <>
            <Power size={14} className="mr-2" />
            Ausgewählte aktivieren
          </>
        )}
      </Button>

      <Button
        onClick={handleBulkDelete}
        variant="outline"
        size="sm"
        disabled={selectedProducts.length === 0}
      >
        <Trash2 size={14} className="mr-2" />
        {selectedProducts.length > 0 ? `${selectedProducts.length} löschen` : 'Löschen'}
      </Button>
    </div>
  )
}

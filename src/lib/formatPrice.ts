/**
 * German price formatting: always two decimals, symbol after the amount
 * ("70,90 €", "1.250,00 €"). Unknown currency codes fall back to
 * "70,90 USD" instead of throwing.
 */
export function formatPrice(value: number | null | undefined, currency = 'EUR'): string {
  const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0
  try {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount)
  } catch {
    return `${amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
  }
}

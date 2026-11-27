'use client'

import { useState } from 'react'
import { VendorInfoModal } from './VendorInfoModal'
import { formatPrice } from '@/lib/formatPrice'

interface PriceDisplayProps {
  price: number
  currency?: string
  shipping_cost?: number | null
  free_shipping_threshold?: number | null
  delivery_time_min_days?: number | null
  delivery_time_max_days?: number | null
  tax_included?: boolean | null
  variant?: 'compact' | 'full'
  className?: string
  vendorName?: string
}

export function PriceDisplay({
  price,
  currency = 'EUR',
  shipping_cost,
  free_shipping_threshold,
  delivery_time_min_days,
  delivery_time_max_days,
  variant = 'compact',
  className = '',
  vendorName
}: PriceDisplayProps) {
  const [isVendorInfoOpen, setIsVendorInfoOpen] = useState(false)

  const formattedPrice = formatPrice(price, currency)

  // Determine shipping info
  const hasShippingCost = shipping_cost !== null && shipping_cost !== undefined
  const hasFreeShippingThreshold = free_shipping_threshold !== null && free_shipping_threshold !== undefined

  // Determine delivery time
  const hasDeliveryTime = (delivery_time_min_days !== null && delivery_time_min_days !== undefined) ||
                         (delivery_time_max_days !== null && delivery_time_max_days !== undefined)

  const deliveryTimeText = hasDeliveryTime
    ? delivery_time_min_days === delivery_time_max_days
      ? `Lieferzeit: ${delivery_time_min_days} ${delivery_time_min_days === 1 ? 'Werktag' : 'Werktage'}`
      : delivery_time_min_days && delivery_time_max_days
      ? `Lieferzeit: ${delivery_time_min_days}-${delivery_time_max_days} Werktage`
      : delivery_time_min_days
      ? `Lieferzeit: ab ${delivery_time_min_days} ${delivery_time_min_days === 1 ? 'Werktag' : 'Werktagen'}`
      : `Lieferzeit: bis ${delivery_time_max_days} ${delivery_time_max_days === 1 ? 'Werktag' : 'Werktage'}`
    : null

  if (variant === 'compact') {
    return (
      <>
        <div className={`text-sm ${className}`}>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">
              {formattedPrice}*
            </span>

            {hasShippingCost && (
              <span className="text-xs text-gray-600">
                zzgl. {formatPrice(shipping_cost, currency)} Versand
              </span>
            )
            }
          </div>
          {hasFreeShippingThreshold && (
            <div className="text-xs text-green-700 mt-0.5">
              Versandkostenfrei ab {formatPrice(free_shipping_threshold, currency)}
            </div>
          )}
        </div>
        <VendorInfoModal
          isOpen={isVendorInfoOpen}
          onClose={() => setIsVendorInfoOpen(false)}
          vendorName={vendorName}
        />
      </>
    )
  }

  // Full variant with more details
  return (
    <>
      <div className={`space-y-2 ${className}`}>
        {/* Main price */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-gray-900">
            {formattedPrice}*
          </span>
        </div>

        {/* Shipping info */}
        <div className="space-y-1">
          {hasShippingCost && (
            <div className="text-sm text-gray-700">
              zzgl. <span className="font-medium">{formatPrice(shipping_cost, currency)}</span> Versandkosten
            </div>
          )
          }
          {hasFreeShippingThreshold && (
            <div className="text-sm text-green-700 font-medium">
              Versandkostenfrei ab {formatPrice(free_shipping_threshold, currency)}
            </div>
          )}
        </div>

        {/* Delivery time */}
        {hasDeliveryTime && (
          <div className="text-sm text-gray-600">
            {deliveryTimeText}
          </div>
        )}
      </div>
      <VendorInfoModal
        isOpen={isVendorInfoOpen}
        onClose={() => setIsVendorInfoOpen(false)}
        vendorName={vendorName}
      />
    </>
  )
}

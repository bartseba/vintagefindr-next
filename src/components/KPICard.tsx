import Link from 'next/link'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { clsx } from 'clsx'

interface KPICardProps {
  title: string
  value: string | number
  link?: string
  change?: {
    value: number
    period: string
  }
  icon?: React.ReactNode
  format?: 'number' | 'currency' | 'percentage'
}

export function KPICard({ title, value, change, icon, format = 'number', link = '#' }: KPICardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string' && isNaN(Number(val))) {
      return val
    }

    if (format === 'currency') {
      return `€${Number(val).toLocaleString('de-DE')}`
    }
    if (format === 'percentage') {
      return `${val}%`
    }
    return Number(val).toLocaleString('de-DE')
  }

  const isPositiveChange = change && change.value > 0
  const isNegativeChange = change && change.value < 0

  return (
    <div className="card">
      <Link href={link}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatValue(value)}
            </p>
            {change && (
              <div className="flex items-center gap-1">
                {isPositiveChange && (
                  <TrendingUp size={14} className="text-green-600" />
                )}
                {isNegativeChange && (
                  <TrendingDown size={14} className="text-red-600" />
                )}
                <span
                  className={clsx(
                    'text-xs font-medium',
                    isPositiveChange && 'text-green-600',
                    isNegativeChange && 'text-red-600',
                    !isPositiveChange && !isNegativeChange && 'text-gray-500'
                  )}
                >
                  {change.value > 0 ? '+' : ''}{change.value}% {change.period}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-amber-50 rounded-lg">
              {icon}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

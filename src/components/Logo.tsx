import Link from 'next/link'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-[80px]',
  md: 'w-[100px]',
  lg: 'w-[120px]',
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  return (
    <Link href="/" aria-label="zur startseite" className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static local asset, matches Footer/RecentlyViewedSection's existing plain-<img> approach (see migration plan problem #7) */}
      <img
        src="/latest-02.png"
        className={`${sizeClasses[size]} h-auto`}
        alt="Vintagefindr"
      />
    </Link>
  )
}

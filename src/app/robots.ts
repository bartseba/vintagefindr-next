import type { MetadataRoute } from 'next'
import { siteUrl } from '@/constant/routes'

const disallowedPaths = [
  '/admin',
  '/api',
  '/dashboard',
  '/vendor',
  '/profile',
  '/auth',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

/**
 * GPTBot/ClaudeBot/PerplexityBot are explicitly allowed (not just covered
 * by the wildcard) to signal AI-crawler access intent clearly — matches
 * the GEO goal of the Nov 2026 SEO audit (want AI citation, not blocking
 * AI bots). `/go/[productId]` is deliberately NOT disallowed here even
 * though it's noindexed via metadata: a Disallow would stop crawlers from
 * ever reading that noindex tag, which is counterproductive.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: disallowedPaths },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-User', allow: '/' },
      { userAgent: 'Claude-SearchBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

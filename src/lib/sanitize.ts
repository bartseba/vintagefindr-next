import 'server-only'
import sanitizeHtmlLib from 'sanitize-html'

/**
 * The Remix app's equivalent (app/lib/sanitize.ts) wraps `dompurify` and is
 * a server-side no-op — it only real-sanitizes client-side (needs `window`
 * for the `dompurify` constructor). Server Components never get a client
 * re-render pass, so this needs a real SSR-safe sanitizer.
 *
 * Tried `isomorphic-dompurify` first (matching the Remix app's existing,
 * unused dependency) but its `jsdom` dependency chain has a broken
 * ESM/CJS transitive dependency (`@exodus/bytes` via `html-encoding-sniffer`)
 * that fails under Next.js's server bundling — not a config-fixable issue,
 * the underlying package itself doesn't `require()`-load in Node right now.
 * `sanitize-html` has no jsdom dependency (works on raw markup, not a real
 * DOM), which sidesteps that whole problem and is arguably a better fit for
 * RSC use anyway.
 */
export function sanitizeHTML(dirty: string): string {
  return sanitizeHtmlLib(dirty, {
    allowedTags: sanitizeHtmlLib.defaults.allowedTags.concat(['img', 'span', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtmlLib.defaults.allowedAttributes,
      '*': ['class', 'style'],
      img: ['src', 'alt', 'loading', 'class', 'width', 'height'],
      a: ['href', 'name', 'target', 'rel', 'class'],
    },
  })
}

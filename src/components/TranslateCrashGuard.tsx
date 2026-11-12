'use client'

/**
 * Safety net for browser page translation (Chrome/Google Translate, Edge,
 * etc.). Translators replace React-owned text nodes with <font> wrappers;
 * React later calls removeChild/insertBefore against the original node,
 * which is no longer a child of that parent, and the resulting
 * NotFoundError crashes the whole page into the error boundary.
 *
 * This is the widely used workaround from facebook/react#11538: if the
 * node isn't actually a child of `this`, skip the DOM call instead of
 * throwing. A Shopify App Store reviewer hit exactly this crash while
 * editing a product with translation enabled (review item 2.1.1).
 *
 * Patched at module evaluation, i.e. once on the client before hydration
 * commits any updates; renders nothing.
 */
if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
  const proto = Node.prototype as Node & { __vfTranslateGuard?: boolean }
  if (!proto.__vfTranslateGuard) {
    proto.__vfTranslateGuard = true

    const originalRemoveChild = proto.removeChild
    proto.removeChild = function <T extends Node>(this: Node, child: T): T {
      if (child.parentNode !== this) {
        return child
      }
      return originalRemoveChild.call(this, child) as T
    }

    const originalInsertBefore = proto.insertBefore
    proto.insertBefore = function <T extends Node>(this: Node, newNode: T, referenceNode: Node | null): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        return originalInsertBefore.call(this, newNode, null) as T
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T
    }
  }
}

export function TranslateCrashGuard() {
  return null
}

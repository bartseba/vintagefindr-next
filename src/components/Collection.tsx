import Link from 'next/link'

export interface CollectionProduct {
  id: string
  title: string
  brand: string
  price: number
  currency: string
  image_url_1: string
  product_url: string
}

export interface CollectionData {
  id: string
  title: string
  subtitle: string | null
  slug: string
  collectionUrl: string | null
  image1: string | null
  image2: string | null
  image3: string | null
  image4: string | null
  products: CollectionProduct[]
}

/**
 * Simplified port of `app/components/Collection.tsx`: the Remix version
 * also supported client-side fetching via `useCollectionQuery` (a
 * `/api/collections/[id]` route + React Query hook) for when no `data` prop
 * is passed. The homepage — the only caller — always passes server-fetched
 * `data` directly (`id` is never passed), so that whole fetch path is dead
 * code in practice; this port only implements the "render given data"
 * half, as a plain Server Component.
 */
export function Collection({ data }: { data?: CollectionData | null }) {
  if (!data) return null

  const collectionImages = [data.image1, data.image2, data.image3, data.image4].filter(Boolean) as string[]

  const displayProducts = data.products.slice(0, 5)
  const displayImages = collectionImages.slice(0, 4)

  const hasImages = displayImages.length > 0
  const hasMore = data.products.length > 5

  return (
    <section className="p-4 sm:p-6 bg-white vintage-border rounded-md relative max-w-[495px] group">
      {data.collectionUrl && (
        <Link
          href={data.collectionUrl}
          className="cursor-pointer absolute inset-0 bg-black/4 backdrop-blur-[2px] hidden group-hover:flex items-center justify-center z-10 transition-all duration-300"
        >
          <div className="bg-white/75 cursor-pointer rounded-sm px-3 py-3">
            <p className="text-sm font-bold cursor-pointer text-vintage-secondary">Mehr Anzeigen</p>
          </div>
        </Link>
      )}

      <div className="mb-4">
        <h2 className="text-lg uppercase roboto-vintage sm:text-2xl font-extrabold text-vintage-secondary mb-1">
          {data.title}
        </h2>
        {data.subtitle && (
          <p className="text-xs roboto-mono-vintage font-medium text-vintage-secondary/85 uppercase tracking-wider">
            {data.subtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
        {hasImages ? (
          displayImages.map((imageUrl, index) => (
            <figure key={index} className="aspect-square overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7) */}
              <img
                src={`${imageUrl}?class=thumbnail`}
                alt={`${data.title} ${index + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </figure>
          ))
        ) : (
          displayProducts.map((product) => (
            <figure key={product.id} className="relative">
              <div className="aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7) */}
                <img
                  src={`${product.image_url_1}?class=thumbnail`}
                  alt={product.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="cursor-pointer absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="text-xs font-medium uppercase tracking-wide mb-1">
                    {product.brand}
                  </p>
                  <p className="text-sm font-semibold line-clamp-2">
                    {product.title}
                  </p>
                  <p className="text-sm mt-1">
                    {product.currency === 'EUR' ? '€' : product.currency} {product.price}
                  </p>
                </div>
              </div>
            </figure>
          ))
        )}

        {!hasImages && hasMore && (
          <Link
            href={`/vintage?collection=${data.slug}`}
            className="
              cursor-pointer
              group relative overflow-hidden rounded-lg
              bg-gradient-to-br from-amber-50 to-amber-100
              hover:from-amber-100 hover:to-amber-200
              transition-all duration-300
              flex items-center justify-center
              aspect-square
              border-2 border-amber-200 hover:border-amber-300
              hidden lg:flex
            "
          >
            <div className="text-center p-4">
              <p className="text-amber-900 font-bold text-lg mb-1">
                + VIEW MORE
              </p>
              <p className="text-amber-700 text-sm">
                {data.products.length - 5} weitere Produkte
              </p>
            </div>
          </Link>
        )}
      </div>

      {!hasImages && hasMore && (
        <div className="mt-6 text-center lg:hidden">
          <Link
            href={`/vintage?collection=${data.slug}`}
            className="
              cursor-pointer
              inline-flex items-center justify-center
              px-6 py-3 rounded-lg
              bg-gray-900 text-white
              hover:bg-gray-800
              transition-colors duration-200
              font-medium
            "
          >
            Alle {data.products.length} Produkte anzeigen
          </Link>
        </div>
      )}
    </section>
  )
}

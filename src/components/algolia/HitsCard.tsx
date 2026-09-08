'use client'

import { useInfiniteHits, UseInfiniteHitsProps } from 'react-instantsearch'
import { ProductCard } from '../ProductCard'
import { HorizontalCarousel } from '../HorizontalCarousel'
import { EmptyState } from '../ui/EmptyState'
import { addToRecentlyViewed } from '../RecentlyViewedSection'

interface Hit {
  objectID: string;
  id: string;
  title: string;
  brand?: string;
  category?: string;
  price: number;
  currency: string;
  condition?: string;
  vintage_styles?: string;
  image_url_1?: string;
  vendor_name?: string;
  vendor_id?: string;
  product_url?: string;
  checkout_url?: string;
  description?: string;
  availability?: string;
  stock_qty?: number;
  tags?: string;
  created_at?: string;
  // PAngV fields
  shipping_cost?: number;
  free_shipping_threshold?: number;
  delivery_time_min_days?: number;
  delivery_time_max_days?: number;
  tax_included?: boolean;
  tax_rate?: number;
}

type CustomInfiniteHitsProps = {
  limit?: number;
  carousel?: boolean;
  emptyTitle?: string;
  gap?: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  grid?: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  showMoreButton?: boolean;
  user?: { id?: string } | null;
  showAll?: string;
  headline: string;
  userFavorites?: unknown[];
  onProductClick?: (productId: string) => void;
}

type ComposedProps = CustomInfiniteHitsProps & UseInfiniteHitsProps<Hit>;

// Carousel Hit Item using ProductCard
function CarouselHitItem({ item, user, handleClickout }: { item: Hit; user?: { id?: string } | null; handleClickout: (item: Hit) => void }) {
  return (
    <ProductCard
      id={item.id}
      vendorId={item.vendor_id}
      title={item.title}
      brand={item.brand}
      category={item.category}
      price={item.price}
      currency={item.currency || 'EUR'}
      condition={item.condition}
      era={item.vintage_styles}
      imageUrl={item.image_url_1}
      vendorName={item.vendor_name || 'Unknown'}
      productUrl={item.product_url}
      checkoutUrl={item.checkout_url}
      userId={user?.id}
      onProductClick={() => handleClickout(item)}
      shipping_cost={item.shipping_cost}
      free_shipping_threshold={item.free_shipping_threshold}
      delivery_time_min_days={item.delivery_time_min_days}
      delivery_time_max_days={item.delivery_time_max_days}
      tax_included={item.tax_included}
      tax_rate={item.tax_rate}
    />
  )
}

function CustomInfiniteHits(props: ComposedProps) {
  const { items, sendEvent } = useInfiniteHits<Hit>(props);

  const handleClickout = (item: Hit) => {
    // Add to recently viewed
    if (item.vendor_id && item.product_url) {
      addToRecentlyViewed({
        id: item.id,
        title: item.title,
        brand: item.brand || '',
        category: item.category || '',
        price: item.price,
        currency: item.currency || 'EUR',
        imageUrl: item.image_url_1 || '',
        productUrl: item.product_url,
        checkoutUrl: item.checkout_url || null,
        vendorId: item.vendor_id,
        vendor: item.vendor_name || 'Unknown'
      })
    }

    // Call parent clickout handler
    if (props.onProductClick) {
      props.onProductClick(item.id);
    }

    // Track Algolia click event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- local `Hit` lacks InstantSearch's internal `__position`/`__queryID` fields that `sendEvent` expects
    sendEvent('click', item as any, 'Product Clicked');
  };
  // Carousel mode
  return (
    <div className="relative">
      {items.length > 1 ? (
        <HorizontalCarousel
          title={""}
          showAll={""}
        >
          {items.map((item) => (
            <CarouselHitItem
              key={item.id}
              item={item}
              user={props.user}
              handleClickout={handleClickout}
            />
          ))}
        </HorizontalCarousel>
      ) : (

          <EmptyState
            onResetFilters={() => {/* URL-Filter löschen */ }}
            onCreateAlert={() => {/* Saved Search / E-Mail-Alert öffnen */ }}
            linkHref="/ratgeber"
            linkText="Zum Ratgeber"
            title={props.emptyTitle}
          />

      )}

    </div>

  );
}

export default CustomInfiniteHits;

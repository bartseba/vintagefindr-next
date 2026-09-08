import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/**
 * Matches `vintage.tsx`'s `isIndexRoute` branch (bare Header+Outlet+Footer,
 * no sidebar/product-grid chrome) — the only branch sub-phase 2.1 needs.
 * The more complex conditional layout for brand/category pages is
 * sub-phase 2.2.
 */
export default function VintageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto bg-vintage-silverGray">
        {children}
      </div>
      <Footer partner />
    </div>
  );
}

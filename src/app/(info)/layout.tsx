import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/**
 * Route group layout mirroring the Remix app's pathless `_info.tsx` layout.
 * No Supabase/auth fetch here for Phase 1 — logged-out state only, see the
 * migration plan's Phase 1 section for why the full HeaderPrimary parity is
 * deferred to Phase 2/4.
 */
export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer partner />
    </>
  );
}

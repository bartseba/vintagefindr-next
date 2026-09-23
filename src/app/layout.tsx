import { Suspense } from "react";
import type { Metadata } from "next";
import { QueryProvider } from "@/components/QueryProvider";
import { AuthModalsProvider } from "@/components/auth/AuthModalsProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "VintageFindr",
  description: "Vintage Kleidung von unabhängigen Vintage-Shops aus Deutschland.",
  icons: {
    icon: "/logo-vintage.png",
  },
};

/**
 * Every page here is CMS/DB-driven (Directus, Supabase, Algolia — all
 * fetched with `cache: 'no-store'`), so nothing should ever be statically
 * prerendered anyway. More importantly: on Railway, env vars are only
 * injected at container runtime, not during the `next build` step. Any
 * route Next attempts to prerender at build time (routes with no dynamic
 * segments) runs in that env-less build context — any component in its
 * tree that eagerly touches `DIRECTUS_URL`/Algolia keys (e.g. `Header`)
 * throws and fails the entire build. Forcing dynamic rendering at the
 * root layout defers all of that to real request time for every route.
 */
export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col font-sans antialiased">
        <QueryProvider>{children}</QueryProvider>
        <Suspense fallback={null}>
          <AuthModalsProvider />
        </Suspense>
      </body>
    </html>
  );
}

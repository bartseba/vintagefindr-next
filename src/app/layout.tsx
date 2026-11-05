import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { QueryProvider } from "@/components/QueryProvider";
import { AuthModalsProvider } from "@/components/auth/AuthModalsProvider";
import { CookieConsentProvider } from "@/components/CookieConsentProvider";
import { siteUrl, companyName, companyEmail } from "@/constant/routes";
import "./globals.css";

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: companyName,
  url: siteUrl,
  logo: `${siteUrl}/latest-02.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    email: companyEmail,
    contactType: 'customer service',
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: companyName,
  url: siteUrl,
};

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

export default async function RootLayout({ children, modal }: LayoutProps<"/">) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col font-sans antialiased">
        <QueryProvider>{children}</QueryProvider>
        {modal}
        <Suspense fallback={null}>
          <AuthModalsProvider />
        </Suspense>
        <CookieConsentProvider />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}

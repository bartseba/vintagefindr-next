import type { Metadata } from 'next'
import { getGuideCategories, buildCategoryTree, getHighlightSectionByPlacement } from '@/lib/directus'
import RatgeberHeroSection from '@/components/RatgeberHeroSection'
import { RatgeberShell } from '@/components/ratgeber/RatgeberShell'
import { companyName, siteUrl } from '@/constant/routes'

export const metadata: Metadata = {
  title: 'Vintage Ratgeber – Second Hand & nachhaltige Mode',
  description: 'Im Vintage Ratgeber findest du Artikel über Vintage Kleidung, Second Hand, nachhaltige Mode, Größentabellen, Pflegetipps, Marken-Guides und Dekaden wie 80er, 90er und 2000er.',
  keywords: 'Vintage, Vintage Kleidung, Second Hand, Secondhand, nachhaltige Mode, Vintage Ratgeber, Vintage Guide, Pflegetipps, Größen, Marken, 80er, 90er, 2000er, Streetwear, Workwear, Outdoor',
  robots: 'index, follow',
  alternates: { canonical: `${siteUrl}/ratgeber` },
  openGraph: {
    title: 'Vintage Ratgeber – Second Hand & nachhaltige Mode',
    description: 'Guides zu Vintage Mode, Second Hand, Pflege, Größen, Marken und nachhaltigem Shopping – alles an einem Ort.',
    type: 'website',
    url: `${siteUrl}/ratgeber`,
    images: ['https://vintagefinder.b-cdn.net/og/vintage-ratgeber.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vintage Ratgeber – Second Hand & nachhaltige Mode',
    description: 'Alles über Vintage Kleidung, Second Hand, nachhaltige Mode und Pflegetipps in einem Ratgeber gesammelt.',
  },
}

export default async function RatgeberIndexPage() {
  const [allCategories, highlightSection] = await Promise.all([
    getGuideCategories(),
    getHighlightSectionByPlacement('ratgeber_hero'),
  ])
  const categoryTree = buildCategoryTree(allCategories)

  return (
    <>
      {highlightSection && (
        <RatgeberHeroSection
          featuredGuide={highlightSection.featuredGuide}
          relatedGuides={highlightSection.guides}
        />
      )}

      <RatgeberShell categoryTree={categoryTree}>
        <div className="bg-white rounded-lg shadow-sm p-8 vintage-border">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Vintage Ratgeber
          </h1>
          <p className="my-4">
            Willkommen im Vintage Ratgeber von {companyName}. Hier gibt es gebündeltes Wissen rund um <strong>Vintage Mode</strong>, <strong>Secondhand-Styles</strong> und nachhaltiges Shopping – von Basics bis Deep Dives. Wenn du wissen willst, wie du echte Vintage-Mode erkennst, die richtige Größe bestimmst oder deine Lieblingsstücke lange frisch hältst, bist du hier richtig.
          </p>

          <p className="my-4">
            Unsere Guides decken alle wichtigen Bereiche ab: Von <strong>Grundlagen</strong> über  <strong>Marken Logos</strong> (z.B. Nike, Adidas, The North Face) und <strong>Dekaden</strong> wie 70s, 80s, 90s  2000s bis hin zu <strong>Größen Maßen</strong>, <strong>Pflege Reparatur</strong>, <strong>Fälschungen erkennen</strong> und <strong>nachhaltiger Mode</strong>. So kannst du Vintage-Mode besser einordnen, bewusster shoppen und deinen eigenen Style entwickeln.
          </p>

          <p className="my-4">
            Wähle einfach eine Kategorie in der Seitenleiste, um loszulegen, und entdecke Schritt für Schritt,
            worauf es bei Vintage wirklich ankommt – vom ersten Vintage Kauf bis zur perfekten Pflege deiner
            Lieblingsjacke. Der Ratgeber wird regelmäßig erweitert, damit du immer die neuesten Tipps   Guides zu Vintage Drops im Blick hast.
          </p>
        </div>
      </RatgeberShell>
    </>
  )
}

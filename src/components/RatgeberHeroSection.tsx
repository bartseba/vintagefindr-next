import Link from "next/link";
import { sanitizeHTML } from "@/lib/sanitize";
import SectionHeader from "./SectionHeader";
import ButtonPrimary from "./ui/ButtonPrimary";

interface HeroGuide {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  hero_image: string | null;
  heroImageUrl?: string | null;
  heroImageThumbUrl?: string | null;
  categoryName?: string | null;
  tags?: { name: string; slug: string }[];
  readingMinutes?: number;
}

interface RatgeberHeroSectionProps {
  featuredGuide: HeroGuide | null;
  relatedGuides: HeroGuide[];
}

// Tag slugs that map to real shop categories — link out to the shop, everything else
// renders as a plain (non-clickable) label.
const SHOP_CATEGORY_SLUGS: Record<string, string> = {
  jacken: "/vintage/jacken",
  sneaker: "/vintage/sneaker",
  y2k: "/vintage/y2k",
  workwear: "/vintage/workwear",
  trikots: "/vintage/trikots",
  fleece: "/vintage/oberteile/fleece",
};

function truncate(html: string, maxLength: number): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

function collectThemen(guides: HeroGuide[]): { name: string; href: string | null }[] {
  const seen = new Set<string>();
  const themen: { name: string; href: string | null }[] = [];

  for (const guide of guides) {
    for (const tag of guide.tags ?? []) {
      if (seen.has(tag.slug)) continue;
      seen.add(tag.slug);
      themen.push({ name: tag.name, href: SHOP_CATEGORY_SLUGS[tag.slug] ?? null });
      if (themen.length >= 7) return themen;
    }
  }

  return themen;
}

export default function RatgeberHeroSection({ featuredGuide, relatedGuides }: RatgeberHeroSectionProps) {
  const related = relatedGuides.slice(0, 6);
  const themen = collectThemen(featuredGuide ? [featuredGuide, ...related] : related);

  if (!featuredGuide && related.length === 0) {
    return null;
  }
  return (
    <section className="xl:container mx-auto w-full xl:p-0 mb-[90px]">
      <SectionHeader textButton={"Alle Anzeigen"} showAll={"/ratgeber"} title={"Aus dem Vintage Ratgeber"} subtitle={"Wissenswertes rund um Vintage-Mode von bekannten Marken wie Adidas, Nike, Fila, Puma, Patagonia, Levi's, Stüssy und The North Face."}/>
      <div className={`mt-6 bg-white rounded-md p-6  border-2 border-gray-200 grid gap-8 ${featuredGuide ? "lg:grid-cols-[1fr_540px]" : ""}`}>
        {featuredGuide && (
          <article>
            <Link href={`/ratgeber/${featuredGuide.slug}`} className={`flex justify-center relative rounded-md overflow-hidden bg-vintage-silverGray`}>
              {featuredGuide.heroImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7)
                <img
                  src={featuredGuide.heroImageUrl}
                  alt={featuredGuide.title}
                  className=" inset-0 object-cover max-h-[400px] w-full"
                  loading="lazy"
                />
              )}
              <span className="absolute left-4 bottom-4 inline-flex items-center rounded-full bg-vintage-darkGray/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
                Ratgeber · {featuredGuide.readingMinutes ?? 1} Min
              </span>
            </Link>

            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-vintage-darkGray leading-snug">
              {featuredGuide.title}
            </h2>
            <div
              className="mt-2 text-vintage-darkGray/80"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(featuredGuide.excerpt) }}
            />
            <Link
              href={`/ratgeber/${featuredGuide.slug}`}
              className="mt-3 inline-flex items-center gap-1 font-semibold text-vintage-primary"
            >
              Artikel lesen →
            </Link>
          </article>
        )}

        {related.length > 0 && (
          <aside className=" border-gray-200 pl-6 border-l-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-vintage-darkGray/70 mb-4">
              Weitere Artikel
            </h3>
            <div className="flex flex-col gap-6">
              {related.map(guide => (
                <Link
                  key={guide.id}
                  href={`/ratgeber/${guide.slug}`}
                  className="flex gap-3 items-start group"
                >
                  <div className="h-[90px] w-[90px] shrink-0 rounded-lg bg-vintage-silverGray overflow-hidden">
                    {guide.heroImageThumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7)
                      <img
                        src={guide.heroImageThumbUrl}
                        alt={guide.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7)
                      <img
                        src="https://vintagefinder.b-cdn.net/icon/blog-logo.jpg?class=thumbnail"
                        alt={guide.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-vintage-darkGray leading-snug group-hover:text-vintage-primary">
                      {guide.title}
                    </p>
                    {guide.excerpt && (
                      <p className="mt-1 text-sm text-vintage-darkGray/70 leading-snug">
                        {truncate(guide.excerpt, 90)}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-vintage-darkGray/60">
                      {[guide.categoryName, guide.readingMinutes ? `${guide.readingMinutes} Min` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <ButtonPrimary size={"SMALL"} text={"Alle Artikel anzeigen"} href={"/ratgeber"} />
            </div>

          </aside>
        )}
      </div>

      {themen.length > 0 && (
        <div className="mt-8 pt-6 border-t border-vintage-silverGray flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-vintage-darkGray/70 mr-2">
            Themen
          </span>
          {themen.map(thema =>
            thema.href ? (
              <Link
                key={thema.name}
                href={thema.href}
                className="rounded-full border border-vintage-silverGray px-3 py-1 text-sm text-vintage-darkGray hover:bg-vintage-silverGray"
              >
                {thema.name}
              </Link>
            ) : (
              <span
                key={thema.name}
                className="rounded-full border border-vintage-silverGray px-3 py-1 text-sm text-vintage-darkGray/70"
              >
                {thema.name}
              </span>
            )
          )}
        </div>
      )}
    </section>
  );
}

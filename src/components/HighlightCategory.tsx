import { SectionHeaderSecondary } from './ui/SectionHeaderSecondary';
import ButtonPrimary from './ui/ButtonPrimary';
import type { HighlightCategoryItem } from '@/lib/directus';
import Link from "next/link";
import { PILL_SMALL } from "./ui/Pill";

interface HighlightCategoriesProps {
  categories: HighlightCategoryItem[]
}

export default function HighlightCategories({ categories }: HighlightCategoriesProps) {
  if (categories.length === 0) return null

  return (
    <section >
      <div className="xl:container mx-auto px-4 lg:py-0 ">
        <SectionHeaderSecondary headline='Beliebte Vintage Kategorien' subline='Vintage Mode & Styles Entdecken – von Jacken über Y2K bis Sneaker.' />
        <div className="py-12 pt-0 mx-auto">
          <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
            {categories.map((category) => (
              <div className="group justify-end flex flex-col transition " key={category.id}>
                <a href={category.href}>
                  <div className="p-4 md:p-4 md:pb-0 items-center  flex flex-col justify-between ">
                    <figure className="p-1 flex items-center justify-center  rounded-full text-gray-500 transition">
                      {category.iconUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image host, next/image adoption deferred (see migration plan problem #7)
                        <img
                          src={`${category.iconUrl}`}
                          alt={`${category.name} Vintage Kleidung Icon`}
                          loading="lazy"
                          className="max-h-full max-w-full object-contain rounded-xl"
                        />
                      )}
                    </figure>
                    <div className="flex gap-x-5">

                      <div className="grow text-center">
                        <h3 className="group-hover:text-drop-blue font-semibold text-2xl text-gray-800 mt-2">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </a>
                {category.subline.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {category.subline.map((sub, index) => (

                      <Link
                        key={sub.id}
                        href={sub.href}
                        className={PILL_SMALL}
                      >
                        {sub.label}
                      </Link>

                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center mb-6">
        <ButtonPrimary size={"MEDIUM"} text={"Vintage Kleidung entdecken"} href={"/vintage"} />
      </div>
    </section>
  );
}

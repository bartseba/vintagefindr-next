import { sanitizeHTML } from "@/lib/sanitize";

interface SeoFooterLink {
  label: string;
  href: string;
}

interface SeoFooterProps {
  intro_html?: string;
  brand_list?: SeoFooterLink[];
  category_list?: SeoFooterLink[];
  brand_list_text?: string;
  category_list_text?: string;
}

export default function SeoFooter({
  intro_html,
  brand_list,
  category_list,
  brand_list_text,
  category_list_text,
}: SeoFooterProps) {
  return (
    <div className="mt-4 px-4 pb-6 lg:px-4 ">
      <div className="xl:container mx-auto mt-6 xl:px-4">
            {category_list_text && (
              <h2
                className="prose max-w-none text-md text-vintage-darkGray font-semibold"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(category_list_text) }}
              />
            )}

            {category_list && category_list.length > 0 && (
              <div className="mb-2 mt-1">
                <ul className="flex flex-wrap gap-4">
                  {category_list.map((category) => (
                    <li key={category.href}>
                      <a
                        href={category.href}
                        className="text-vintage-darkGray hover:underline "
                      >
                        {category.label}

                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
      </div>
      <div className=" py-2   ">
      <div className="xl:container mx-auto xl:px-4 ">
        {intro_html && (
          <div
            className="prose max-w-none text-vintage-darkGray mb-4 vintage-seo-footer"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(intro_html) }}
          />
        )}

        {brand_list_text && (
          <h2
            className="prose max-w-none text-md text-vintage-darkGray font-semibold"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(brand_list_text) }}
          />
        )}

        {brand_list && brand_list.length > 0 && (

          <nav className="flex flex-wrap gap-4 ">
            {brand_list.map((brand) => (
              <a
                key={brand.href}
                href={brand.href}
                className="text-vintage-darkGray hover:underline"
              >
                {brand.label}
              </a>
            ))}
          </nav>
        )}
          </div>
      </div>
    </div>
  );
}

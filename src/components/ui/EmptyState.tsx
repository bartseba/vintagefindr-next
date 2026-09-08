import { Siren } from "lucide-react";
import * as React from "react";
import ButtonPrimary from "./ButtonPrimary";

type EmptyStateProps = {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  onResetFilters?: () => void;
  onCreateAlert?: () => void;
  alert?: boolean
  linkHref?: string;
  linkText?: string;
  className?: string;
  altText?: string;
};
export function EmptyState({
  title = "Produkte",
  message = "Sorry, für diese Kategorie sind im Moment leider keine Artikel online. Schau bald wieder vorbei – wir fügen täglich neue Vintage Produkte hinzu! Hol dir ein Update per Mail oder stöbere im Ratgeber nach Tipps & Guides.",
  onResetFilters,
  onCreateAlert,
  alert = false,
  linkHref,
  linkText = "Zum Ratgeber",
  className = "",
}: EmptyStateProps) {

  return (

    <section
      aria-live="polite"
      className={[
        "max-h-[350px] flex gap-6 relative overflow-hidden rounded-md border border-dotted border-gray-300  justify-center mb-16 items-center w-full",
        "bg-white px-4 py-12 sm:px-4 sm:py-16 mx-auto ",
        "text-center shadow-sm ",
        className,
      ].join(" ")}
    >

      <div>


      {/* Top subtle dotted edge accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-transparent"
      />

      {/* Icon */}
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-vintage-secondary200 text-white shadow-sm">
       <Siren />
      </div>

      {/* Title & Message */}
      <h2 className="text-xl roboto-mono-vintage font-medium font-extrabold tracking-tight text-vintage-secondary sm:text-2xl">
         {title}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
        {message}
      </p>

      {/* Actions */}
      {(onResetFilters || onCreateAlert || linkHref) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">

          {alert && onCreateAlert && (
            <ButtonPrimary onClick={onCreateAlert} text={"Benachrichtung aktivieren"} size={"SMALL"} href={""} />
          )}

          {linkHref && (
            <a
              href={linkHref}
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-vintage-secondary underline decoration-2 underline-offset-4 hover:text-vintage-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
            >
              {linkText}
              <span className="ml-1" aria-hidden="true">
                ↗
              </span>
            </a>
          )}
        </div>
      )}

      {/* bottom accent dot */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-2 flex justify-center">
        <span className="h-2 w-2 rounded-full bg-pink-500/80"></span>
      </div>
         </div>
    </section>
  );
}

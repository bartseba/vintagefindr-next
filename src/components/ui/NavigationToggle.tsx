import Link from "next/link";

interface NavigationToggleProps {
  options: string[];
  defaultValue?: string;
  link?: string;
  rel?: string;
}

export function NavigationToggle({
  options,
  defaultValue,
  link,
  rel,
}: NavigationToggleProps) {
  return (
    <div
      className="flex rounded-lg p-1 md:h-16 h-12 gap-x-4"
    >
      {options.map((option) => (
        <Link
          href={link || ""}
          rel={rel}
          key={option}
          className={`
         relative roboto-mono-vintage font-medium hover:font-bold font-medium px-3 md:px-2 py-3 text-md md:text-l hover:text-vintage-primary rounded-md transition-all duration-200 ease-in-out h-full flex items-center justify-center
                    ${
              defaultValue === option
                ? "text-white shadow-sm"
                : "text-vintage-secondary hover:text-vintage-primary"
            }
         `}

          style={{
            backgroundColor:
              defaultValue === option
                ? "#5E60CE "
                : "transparent",
          }}
          >
          {option}
        </Link>
      ))}
    </div>
  );
}

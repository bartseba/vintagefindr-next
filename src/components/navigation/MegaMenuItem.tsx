import Link from "next/link";
import { routes } from "@/constant/routes";

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  children?: NavigationItem[];
  _sectionTitle?: string;
}

interface NavigationSection {
  id: string;
  title?: string;
  label: string;
  items: NavigationItem[];
}

interface MegaMenuItemProps {
  section: NavigationSection;
  isVisible: boolean;
  onClose?: () => void;
}

export function MegaMenuItem({ section, isVisible, onClose }: MegaMenuItemProps) {
  const sectionTitle = section.title || section.label;

  if (!isVisible) {
    return null;
  }

  const renderCombinedCollection = () => {
    const jahrzehnteItems = section.items.filter((item) => item._sectionTitle === "Jahrzehnte");
    const sportItems = section.items.filter((item) => item._sectionTitle === "Sport");

    return (
      <>
        {jahrzehnteItems.length > 0 && (
          <div>
            <p className="block font-medium text-slate-900 hover:text-[#4140d4] mb-2">Jahrzehnte</p>
            {jahrzehnteItems.map((item) => (
              <div key={item.id} className="mb-1">
                <Link href={item.href} onClick={onClose} className="block text-sm text-slate-600 hover:text-[#4140d4] hover:underline">
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        )}
        {sportItems.length > 0 && (
          <div>
            <p className="block font-medium text-slate-900 hover:text-[#4140d4] mb-2">Sport</p>
            {sportItems.map((item) => (
              <div key={item.id} className="mb-1">
                <Link href={item.href} onClick={onClose} className="block text-sm text-slate-600 hover:text-[#4140d4] hover:underline">
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderDefaultItems = () => {
    return section.items.map((item) => (
      <div key={item.id}>
        <Link
          href={item.href}
          onClick={onClose}
          className="block font-medium text-slate-900 hover:text-[#4140d4] mb-2"
        >
          {sectionTitle !== "Kategorien" ? (
            <span className="text-sm text-loblolly-700 uppercase font-medium  roboto-mono-vintage">{item.label}</span>
          ) : (
            item.label
          )}
        </Link>

        {item.children && item.children.length > 0 && (
          <ul className="space-y-1">
            {item.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={child.href}
                  onClick={onClose}
                  className="block text-sm text-slate-600 hover:text-[#4140d4] hover:underline"
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    ));
  };

  const gridClass = sectionTitle !== "Kategorien" && sectionTitle !== "Kollektion"
    ? "grid grid-cols-[repeat(3,1fr)]"
    : "grid grid-flow-col grid-rows-[repeat(1,1fr)] justify-items-start gap-[30px]";

  return (
    <div className="block">
      <div className={gridClass}>
        {sectionTitle !== "Kategorien" && section.id === "combined-collection" && renderCombinedCollection()}

        {sectionTitle === "Megamenu" && (
          <div className="col-span-full mb-4">
            <Link
              href={routes.vintage}
              onClick={onClose}
              className="inline-flex items-center text-sm font-medium text-vintage-primary hover:text-vintage-primary/80 hover:underline"
            >
              Vintage Mode entdecken
            </Link>
          </div>
        )}

        {sectionTitle !== "Kategorien" && section.id !== "combined-collection" && renderDefaultItems()}
      </div>
    </div>
  );
}

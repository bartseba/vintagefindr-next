import Link from "next/link";
import {
  Settings,
  CircleHelp as HelpCircle,
  Package,
  Heart,
  Users,
  UserPlus,
  LogIn,
  Home,
  BarChart3,
  Plus
} from "lucide-react";
import { browse, companyName, footerLinks } from "@/constant/routes";

interface SlideMenuUser {
  id: string;
}

interface SlideMenuVendorProfile {
  store_name: string;
}

interface SlideMenuNavProps {
  user: SlideMenuUser | null;
  vendorProfile?: SlideMenuVendorProfile;
  onClose: () => void;
}

export function SlideMenuNav({ user, vendorProfile, onClose }: SlideMenuNavProps) {
  // Quick actions for vendors
  const vendorActions = [
    {
      href: "/vendor/dashboard",
      icon: Home,
      label: "Dashboard",
      description: "Übersicht & Statistiken"
    },
    {
      href: "/vendor/products",
      icon: Package,
      label: "Meine Produkte",
      description: "Produkte verwalten"
    },
    {
      href: "/vendor/products/new",
      icon: Plus,
      label: "Produkt erstellen",
      description: "Neues Produkt hinzufügen"
    },
    {
      href: "/vendor/analytics",
      icon: BarChart3,
      label: "Analytics",
      description: "Klicks & Performance"
    },
    {
      href: "/vendor/settings",
      icon: Settings,
      label: "Einstellungen",
      description: "Shop-Profil bearbeiten"
    }
  ];

  // Quick actions for authenticated users
  const quickActions = [
    {
      href: browse,
      icon: Package,
      label: "Produkte entdecken",
      description: "Neue Vintage-Schätze finden"
    },
    {
      href: "/favorites",
      icon: Heart,
      label: "Meine Favoriten",
      description: "Gespeicherte Produkte"
    },
    {
      href: "/following",
      icon: Users,
      label: "Gefolgte Shops",
      description: "Ihre Lieblings-Händler"
    },
    {
      href: "/dashboard",
      icon: Settings,
      label: "Mein Profil",
      description: "Persönliche Daten verwalten"
    }
  ];

  const actionsToShow = vendorProfile ? vendorActions : quickActions;

  // Navigation items for all users
  const navigationItems = [
    {
      href: "/",
      icon: Home,
      label: "Startseite",
      description: "Zurück zur Hauptseite"
    },
    {
      href: browse,
      icon: Package,
      label: "Entdecken",
      description: "Alle Vintage-Produkte"
    },
    {
      href: footerLinks.help,
      icon: HelpCircle,
      label: "Hilfe & Support",
      description: "FAQ und Kontakt"
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* User Section */}
      {user ? (
        /* Authenticated User */
        <div className="p-2 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2" />

          {/* Quick Actions for authenticated users or vendors */}
          <div className="grid gap-2 items-center">
            {actionsToShow.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <>
                  {action.href === "/following" ? (
                    <>
                      <div key={index} className="flex relative items-center gap-3 p-3 rounded-lg transition-colors duration-200 group">
                        <div className="flex opacity-60 items-center justify-center rounded-lg w-10 h-10 bg-vintage-primary">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 opacity-60">
                          <span className="text-gray-700 group-hover:text-gray-900 font-medium text-sm">
                            {action.label}
                          </span>
                          <p className="text-xs text-gray-500">{action.description}</p>
                        </div>
                        <div className="absolute top-[20px] right-2">
                          <span className="text-xs bg-vintage-secondary200 text-white px-2 py-1 rounded">Coming Soon</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      key={index}
                      href={action.href}
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors duration-200 group"
                    >
                      <div className="flex items-center justify-center rounded-lg w-10 h-10 bg-vintage-primary">
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-700 group-hover:text-gray-900 font-medium text-sm">
                          {action.label}
                        </span>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                    </Link>
                  )
                  }
                </>
              );
            })}
          </div>
        </div>
      ) : (
        /* Guest User */
        <div className="p-4 border-b bg-gradient-to-br bg-vintage-silverGray flex-shrink-0">
          <div className="text-center mb-6">
            <p className="text-lg font-semibold text-gray-900 mb-1">
              Entdecken Sie {companyName}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Registrieren Sie sich kostenlos und erhalten Sie Zugang zu exklusiven Features:
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-8 grid gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="rounded-full flex items-center justify-center">
                <Heart size={24} className="text-vintage-primary" />
              </div>
              <span className="text-sm text-gray-700">Favoriten speichern & verwalten</span>
            </div>
            <div className="flex relative items-center gap-3">
              <div className="rounded-full flex items-center justify-center">
                <Users size={24} className="text-vintage-primary" />
              </div>
              <span className="text-sm text-gray-700">Lieblings-Shops folgen</span>
              <div className="absolute top-[-2px] right-2">
                <span className="text-xs bg-vintage-secondary200 text-white px-2 py-1 rounded">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="space-y-3">
            <Link
              href="/register"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full p-3 bg-vintage-primary text-white rounded-lg font-medium hover:bg-vintage-secondary transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Jetzt registrieren
            </Link>
            <Link
              href="?modal=login"
              rel="nofollow"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full p-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Anmelden
            </Link>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            100% Kostenlos
          </p>
        </div>
      )}

      <div className="flex-1 p-1 overflow-y-auto">
        {/* Navigation Items */}
        <div className="grid gap-1">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
              >
                <div className="flex items-center justify-center rounded-lg w-10 h-10 bg-vintage-primary">
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-gray-700 group-hover:text-gray-900 font-medium text-sm">
                    {item.label}
                  </span>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

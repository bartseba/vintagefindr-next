import { X, User } from "lucide-react";

interface SlideMenuUser {
  id: string;
  email?: string;
  first_name?: string;
  avatar_url?: string;
}

interface SlideMenuVendorProfile {
  store_name: string;
}

interface SlideMenuHeaderProps {
  user: SlideMenuUser | null;
  vendorProfile?: SlideMenuVendorProfile;
  onClose: () => void;
  onLogout: () => void;
}

export function SlideMenuHeader({ user, vendorProfile, onClose, onLogout }: SlideMenuHeaderProps) {
  return (
    <div className="flex items-center relative justify-between p-4 border-b pb-6 w-full bg-vintage-primary min-h-[100px] flex-shrink-0">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute lg:top-1/2 right-4 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
        aria-label="Menü schließen"
      >
        <X className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {user ? (
        <div className="flex gap-4 items-center">
          <div className="w-[50px] h-[50px] grow bg-white rounded-full flex items-center justify-center">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7)
              <img
                src={user.avatar_url}
                alt={user.first_name || 'Benutzer-Avatar'}
                className='w-[50px] h-[50px] rounded-full overflow-hidden'
              />
            ) : (
              <div className='w-[50px] h-[50px] rounded-full flex items-center justify-center'>
                {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-md lg:text-lg font-semibold text-gray-100">
              {vendorProfile
                ? `${vendorProfile.store_name}`
                : `Willkommen zurück${user.first_name ? `, ${user.first_name}` : ''}!`
              }
            </p>
            <div className="flex flex-col">
              <p className="text-sm text-gray-100">
                {vendorProfile ? 'Vendor Account' : user.email}
              </p>
              <button
                onClick={onLogout}
                className="flex gap-3 pt-2 rounded-lg text-white font-semibold transition-colors duration-200 w-full text-left"
              >
                <span className="text-vintage-primary500 font-medium text-sm">
                  Abmelden
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-vintage-primary" />
          </div>
          <p className="text-lg font-semibold text-gray-100">
            Willkommen
          </p>
        </div>
      )}
    </div>
  );
}

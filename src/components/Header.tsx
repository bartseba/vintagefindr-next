import { getAllNavigationSections } from "@/lib/directus";
import { getSessionContext } from "@/lib/auth/session";
import { HeaderPrimary } from "./HeaderPrimary";

export async function Header() {
  const [navigationSections, { user, vendorProfile, userFavorites }] = await Promise.all([
    getAllNavigationSections(),
    getSessionContext(),
  ]);

  return (
    <HeaderPrimary
      user={user}
      userFavorites={userFavorites}
      vendorProfile={vendorProfile}
      navigationSections={navigationSections}
    />
  );
}

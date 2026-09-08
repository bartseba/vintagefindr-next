/**
 * Central Route Configuration
 *
 * This file contains all application routes organized by category.
 * Benefits:
 * - Single source of truth for all URLs
 * - Type-safe dynamic routes
 * - IDE autocomplete support
 * - Easy maintenance
 * - Backward compatibility
 */

// ========== COMPANY INFO ==========
export const siteUrl = "https://vintagefindr.de"
export const companyName = "VintageFindr"
export const companyEmail = "kontakt@vintagefindr.de"
export const supportEmail = "support@vintagefindr.com"
export const companyPhone = "+49 151 215120220"

// ========== PUBLIC ROUTES ==========
export const routes = {
  home: "/",
  vintage: "/vintage",
  ratgeber: "/ratgeber",
  dashboard: "/dashboard",
  profile: "/profile",
  login: "/login",
  register: "/register",
  browse: "/browse",
  vendors: "/vendors",
  following: "/following",
  newDrop: "/vintage/neuester-drop"
} as const

// ========== VENDOR ROUTES ==========
export const vendorRoutes = {
  dashboard: "/vendor/dashboard",
  products: "/vendor/products",
  productsNew: "/vendor/products/new",
  productsEdit: (id: string) => `/vendor/products/${id}/edit`,
  productsDraft: "/vendor/products?status=draft",
  import: "/vendor/import",
  settings: "/vendor/settings",
  settingsPerformanceGoals: "/vendor/settings#performance-goals",
  analytics: "/vendor/analytics",
  activities: "/vendor/activities",
  pricetable: "/vendor/pricetable",
  billingPortal: "/vendor/billing-portal",
  register: "/vendor/register",
  login: "/vendor/login?modal=login",
} as const

// ========== ADMIN ROUTES ==========
export const adminRoutes = {
  dashboard: "/admin/dashboard",
  vendors: "/admin/vendors",
  products: "/admin/products",
  collections: "/admin/collections",
  collectionsNew: "/admin/collections/new",
  collectionsEdit: (id: string) => `/admin/collections/${id}/edit`,
  analytics: "/admin/analytics",
  suggestions: "/admin/suggestions",
  dsaReports: "/admin/dsa-reports",
  dsaReportsAll: "/admin/dsa-reports?status=all",
  dsaReportsNew: "/admin/dsa-reports?status=new",
  dsaReportsUnderReview: "/admin/dsa-reports?status=under_review",
  dsaReportsResolved: "/admin/dsa-reports?status=resolved",
  dsaReportsRejected: "/admin/dsa-reports?status=rejected",
  settings: "/admin/settings",
  login: "/admin/login",
} as const

// ========== AUTH ROUTES ==========
export const authRoutes = {
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  success: "/auth/success",
} as const

// ========== INFO / LEGAL ROUTES ==========
export const infoRoutes = {
  // Legal
  impressum: "/impressum",
  datenschutz: "/datenschutz",
  agb: "/agb",
  nutzungsbedingungen: "/nutzungsbedingungen",

  // Contact & Support
  kontakt: "/kontakt",
  contact: "/contact",
  hilfe: "/hilfe",
  support: "/support",

  // Company
  partnerWerden: "/partner-werden",
  uberUns: "/ueber-uns",
  unserePartner: "/unsere-partner",
  preise: "/preise",
  jobs: "/jobs",

  // User Features
  favorites: "/favorites",

  // DSA (Digital Services Act)
  dsaMeldung: "/dsa-meldung",
} as const

// ========== SEO / VINTAGE CATEGORY ROUTES ==========
export const vintageRoutes = {
  // Main
  index: "/vintage",

  // Popular Brands
  adidas: "/vintage/adidas",
  nike: "/vintage/nike",
  fila: "/vintage/fila",
  puma: "/vintage/puma",

  // Popular Categories
  jacken: "/vintage/jacken",
  sneaker: "/vintage/sneaker",
  shirts: "/vintage/shirts",
  polos: "/vintage/polos",
  pullover: "/vintage/pullover",
  fleece: "/vintage/fleece",
  hosen: "/vintage/hosen",
  y2k: "/vintage/y2k",
  trikots: "/vintage/sport/fussballtrikots",

  // Dynamic Routes
  brand: (brand: string) => `/vintage/${brand}`,
  category: (category: string) => `/vintage/${category}`,
  subcategory: (category: string, subcategory: string) => `/vintage/${category}/${subcategory}`,
  search: (query: string) => `/vintage?q=${encodeURIComponent(query)}`,
  slug: (slug: string) => `/vintage/${slug}`,
} as const

// ========== GUIDE / RATGEBER ROUTES ==========
export const guideRoutes = {
  index: "/ratgeber",
  vintageKaufberatung: "/guide/vintage-kaufberatung",
  article: (slug: string) => `/ratgeber/${slug}`,
} as const

// ========== API ROUTES ==========
export const apiRoutes = {
  updateShopifyDomain: "/api/update-shopify-domain",
} as const

// ========== EXTERNAL LINKS ==========
export const externalLinks = {
  euStreitschlichtung: "https://ec.europa.eu/consumers/odr/",
  instagram: "#",
} as const

// ========== EMAIL ADDRESSES ==========
export const emailAddresses = {
  contact: "kontakt@vintagefindr.de",
  support: "support@vintagefindr.de",
  info: "info@vintagefinder.de",
} as const

// ========== FOOTER LINKS ==========
export const footerLinks = {
  contact: infoRoutes.kontakt,
  imprint: infoRoutes.impressum,
  privacy: infoRoutes.datenschutz,
  terms: infoRoutes.agb,
  about: infoRoutes.uberUns,
  partner: infoRoutes.unserePartner,
  help: infoRoutes.hilfe,
  jobs: infoRoutes.jobs,
} as const

// ========== LEGACY EXPORTS (for backward compatibility) ==========
/**
 * @deprecated Use vendorRoutes.register instead
 */
export const vendorReg = vendorRoutes.register

/**
 * @deprecated Use infoRoutes.partnerWerden instead
 */
export const vendorOverview = infoRoutes.partnerWerden

/**
 * @deprecated Use companyEmail instead
 */
export const kontaktmail = companyEmail

/**
 * @deprecated Use routes.vintage instead
 */
export const browse = routes.vintage

/**
 * @deprecated Use companyPhone instead
 */
export const telefon = companyPhone

// ========== HELPER FUNCTIONS ==========

/**
 * Constructs a redirect URL with a redirect parameter
 * @param loginPath - The login path (e.g., '/login', '/vendor/login')
 * @param redirectTo - The path to redirect to after login
 * @returns The full URL with redirect parameter
 */
export const withRedirect = (loginPath: string, redirectTo: string): string => {
  return `${loginPath}?redirectTo=${encodeURIComponent(redirectTo)}`
}

/**
 * Constructs a URL with query parameters
 * @param path - The base path
 * @param params - Object with query parameters
 * @returns The full URL with query string
 */
export const withQuery = (path: string, params: Record<string, string | number | boolean>): string => {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
  return `${path}?${queryString}`
}

/**
 * Constructs a URL with an error parameter
 * @param path - The base path
 * @param error - The error message
 * @returns The full URL with error parameter
 */
export const withError = (path: string, error: string): string => {
  return `${path}?error=${encodeURIComponent(error)}`
}

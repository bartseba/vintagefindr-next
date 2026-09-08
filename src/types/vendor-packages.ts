/**
 * Shape of the `get_vendor_package_info` RPC result, shared by every
 * vendor route that shows package/click-credit status (dashboard,
 * products list, pricetable, billing-portal).
 */
export interface VendorPackageItem {
  id: string
  package_name: string
  clicks_remaining: number
  clicks_total: number
  valid_until: string
}

export interface VendorPackageInfo {
  has_active_package: boolean
  total_clicks_remaining: number
  packages: VendorPackageItem[]
}

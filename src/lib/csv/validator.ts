/**
 * CSV Validation Module for VintageFindr
 *
 * Handles CSV parsing, validation, and field mapping for product imports.
 * Supports both Standard German CSV format and Shopify CSV exports.
 */

// ============================================================================
// Types
// ============================================================================

export interface ImportError {
  row: number
  field: string
  message: string
  value?: string
  type?: 'error' | 'warning' | 'info'
}

export interface ValidationResult {
  isValid: boolean
  errors: ImportError[]
  validRows: Record<string, unknown>[]
  totalRows: number
}

export interface CSVValidationOptions {
  format?: 'standard' | 'shopify'
  categoryKeywords?: Record<string, string[]>
  validCategories?: string[]
  sizeKeywords?: Record<string, string[]>
  shopifyDomain?: string | null
}

// ============================================================================
// Constants
// ============================================================================

/** Shopify CSV column mapping to our standard format */
export const SHOPIFY_FIELD_MAPPING: Record<string, string> = {
  'handle': 'external_product_id',
  'title': 'title',
  'body (html)': 'description',
  'vendor': 'brand',
  'product category': 'category',
  'type': 'category',
  'tags': 'tags',
  'condition': 'condition',
  'variant price': 'price',
  'variant inventory qty': 'stock_qty',
  'image src': 'image_url_1',
  'variant sku': 'external_variant_id',
  'option1 value': 'size_option1',
  'option2 value': 'size_option2',
  'option3 value': 'size_option3',
}

/** Standard CSV column mapping (German + English) */
export const CSV_FIELD_MAPPING: Record<string, string> = {
  'titel': 'title',
  'title': 'title',
  'beschreibung': 'description',
  'description': 'description',
  'marke': 'brand',
  'brand': 'brand',
  'kategorie': 'category',
  'category': 'category',
  'vintage_style': 'vintage_style',
  'vintage style': 'vintage_style',
  'style': 'vintage_style',
  'preis': 'price',
  'price': 'price',
  'zustand': 'condition',
  'condition': 'condition',
  'verfügbarkeit': 'availability',
  'availability': 'availability',
  'lagerbestand': 'stock_qty',
  'stock_qty': 'stock_qty',
  'bild_1': 'image_url_1',
  'image_url_1': 'image_url_1',
  'bild_2': 'image_url_2',
  'image_url_2': 'image_url_2',
  'bild_3': 'image_url_3',
  'image_url_3': 'image_url_3',
  'produkt_url': 'product_url',
  'product_url': 'product_url',
  'checkout_url': 'checkout_url',
  'tags': 'tags',
  'externe_produkt_id': 'external_product_id',
  'external_product_id': 'external_product_id',
  'größe': 'size',
  'size': 'size',
  'groesse': 'size',
  'option1 value': 'size_option1',
  'option2 value': 'size_option2',
  'option3 value': 'size_option3',
}

export const VALID_CONDITIONS = ['neu', 'sehr gut', 'gut', 'akzeptabel']

export const VALID_VINTAGE_STYLES = [
  'Luxury Vintage', 'Streetwear', 'Sportswear', 'Y2K', '90s', '80s',
  'Workwear', 'Punk', 'Glam', 'Western', 'Retro Denim', 'Heritage', 'Vintage', 'Outdoor',
]

export const VALID_AVAILABILITY = ['in_stock', 'out_of_stock', 'preorder', 'discontinued']

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Detect size from product title using size keywords
 */
export function detectSizeFromTitle(
  title: string,
  sizeKeywords: Record<string, string[]>
): string | null {
  if (!title) return null

  const titleLower = title.toLowerCase()

  for (const [size, keywords] of Object.entries(sizeKeywords)) {
    for (const keyword of keywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        return size
      }
    }
  }

  return null
}

/**
 * Match category from user input using category keywords
 */
export function matchCategoryFromInput(
  input: string,
  categoryKeywords: Record<string, string[]>
): string | null {
  if (!input) return null

  const inputLower = input.toLowerCase().trim()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase()
      if (inputLower === keywordLower || inputLower.includes(keywordLower) || keywordLower.includes(inputLower)) {
        return category
      }
    }
  }

  return null
}

/**
 * Detect category from product title using category keywords
 */
export function detectCategoryFromTitle(
  title: string,
  categoryKeywords: Record<string, string[]>
): string | null {
  if (!title) return null

  const titleLower = title.toLowerCase()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        return category
      }
    }
  }

  return null
}

/**
 * Map CSV row fields to database fields
 */
export function mapCSVRow(
  row: Record<string, unknown>,
  fieldMapping: Record<string, string>
): Record<string, unknown> {
  const mappedRow: Record<string, unknown> = {}

  Object.keys(row).forEach(csvField => {
    const dbField = fieldMapping[csvField.toLowerCase()]
    if (dbField) {
      mappedRow[dbField] = row[csvField]
    }
  })

  return mappedRow
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate CSV data for product import
 */
export function validateCSVData(
  data: Record<string, unknown>[],
  options: CSVValidationOptions = {}
): ValidationResult {
  const {
    format = 'standard',
    categoryKeywords = {},
    validCategories = [],
    sizeKeywords = {},
    shopifyDomain = null,
  } = options

  const errors: ImportError[] = []
  const validRows: Record<string, unknown>[] = []

  if (!data || data.length === 0) {
    return {
      isValid: false,
      errors: [{ row: 1, field: 'general', message: 'CSV-Datei ist leer oder enthält keine gültigen Daten' }],
      validRows: [],
      totalRows: 0,
    }
  }

  const fieldMapping = format === 'shopify' ? SHOPIFY_FIELD_MAPPING : CSV_FIELD_MAPPING

  data.forEach((row, index) => {
    const rowNumber = index + 2 // +2 because index starts at 0 and we skip header

    // Skip empty rows
    if (!row || Object.keys(row).length === 0) {
      return
    }

    // Map CSV columns to database fields
    const mappedRow = mapCSVRow(row, fieldMapping)

    // Handle Shopify-specific processing
    if (format === 'shopify') {
      processShopifyRow(row, mappedRow, sizeKeywords)
    }

    // Check if we have any mapped fields
    if (Object.keys(mappedRow).length === 0) {
      errors.push({
        row: rowNumber,
        field: 'general',
        message: `Keine erkannten Spalten gefunden. Überprüfen Sie die Spaltennamen für ${format === 'shopify' ? 'Shopify' : 'Standard'} Format.`,
      })
      return
    }

    // Validate fields
    validateRequiredFields(mappedRow, rowNumber, errors)
    validateCategory(mappedRow, rowNumber, errors, categoryKeywords, validCategories)
    validateProductUrl(mappedRow, rowNumber, errors, format, shopifyDomain)
    validateOptionalFields(mappedRow, rowNumber, errors)
    validateUrls(mappedRow, rowNumber, errors)

    // Handle size detection for standard format
    if (format !== 'shopify' && (!mappedRow.size || (mappedRow.size as string).trim() === '')) {
      const detectedSize = detectSizeFromTitle(mappedRow.title as string, sizeKeywords)
      mappedRow.size = detectedSize || 'One Size'
    }

    validRows.push(mappedRow)
  })

  return {
    isValid: errors.filter(e => e.type !== 'info' && e.type !== 'warning').length === 0,
    errors,
    validRows,
    totalRows: data.length,
  }
}

// ============================================================================
// Internal Validation Helpers
// ============================================================================

function processShopifyRow(
  row: Record<string, unknown>,
  mappedRow: Record<string, unknown>,
  sizeKeywords: Record<string, string[]>
): void {
  // Map Shopify-specific fields
  if (row['variant compare at price'] && !mappedRow.price) {
    mappedRow.price = row['variant compare at price']
  }

  // Handle Shopify size options
  let detectedSize: string | null = null
  const sizeOptions = [
    row['option1 value'],
    row['option2 value'],
    row['option3 value'],
  ].filter(Boolean) as string[]

  for (const option of sizeOptions) {
    const optionLower = option.toLowerCase().trim()

    // Check against size keywords
    for (const [standardSize, keywords] of Object.entries(sizeKeywords)) {
      if (keywords.some(keyword => optionLower === keyword.toLowerCase() || optionLower.includes(keyword.toLowerCase()))) {
        detectedSize = standardSize
        break
      }
    }

    // Direct match for common patterns
    if (!detectedSize) {
      if (/^\d+$/.test(optionLower)) {
        const num = parseInt(optionLower)
        if (num >= 32 && num <= 58) {
          detectedSize = `EU ${num}`
        }
      } else if (/^(xs|s|m|l|xl|xxl)$/i.test(optionLower)) {
        detectedSize = optionLower.toUpperCase()
      } else if (optionLower.includes('one size') || optionLower === 'os') {
        detectedSize = 'One Size'
      }
    }

    if (detectedSize) break
  }

  // Fallback: detect from title
  if (!detectedSize) {
    detectedSize = detectSizeFromTitle(mappedRow.title as string, sizeKeywords)
  }

  mappedRow.size = detectedSize || 'One Size'

  // Set availability based on inventory
  const stockQty = mappedRow.stock_qty ? parseInt(mappedRow.stock_qty as string) : 0
  mappedRow.availability = stockQty > 0 ? 'in_stock' : 'out_of_stock'

  // Clean description
  if (mappedRow.description) {
    mappedRow.description = (mappedRow.description as string).replace(/<[^>]*>/g, '').trim()
  }

  // Handle multiple images
  if (row['image src'] && row['image position']) {
    const position = parseInt(row['image position'] as string)
    const imageField = `image_url_${Math.min(position, 3)}` as const
    if (position >= 1 && position <= 3) {
      mappedRow[imageField] = row['image src']
    }
  }
}

function validateRequiredFields(
  mappedRow: Record<string, unknown>,
  rowNumber: number,
  errors: ImportError[]
): void {
  if (!mappedRow.title || (mappedRow.title as string).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'title',
      message: 'Titel ist erforderlich',
      value: mappedRow.title as string,
    })
  }

  if (!mappedRow.brand || (mappedRow.brand as string).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'brand',
      message: 'Marke ist erforderlich',
      value: mappedRow.brand as string,
    })
  }

  const price = parseFloat(mappedRow.price as string)
  if (!mappedRow.price || isNaN(price)) {
    errors.push({
      row: rowNumber,
      field: 'price',
      message: 'Gültiger Preis ist erforderlich',
      value: mappedRow.price as string,
    })
  } else if (price < 0) {
    errors.push({
      row: rowNumber,
      field: 'price',
      message: 'Preis darf nicht negativ sein',
      value: mappedRow.price as string,
    })
  }
}

function validateCategory(
  mappedRow: Record<string, unknown>,
  rowNumber: number,
  errors: ImportError[],
  categoryKeywords: Record<string, string[]>,
  validCategories: string[]
): void {
  let finalCategory = (mappedRow.category as string)?.toLowerCase()

  if (!finalCategory || !validCategories.includes(finalCategory)) {
    // Try to match from input
    const matchedCategory = mappedRow.category
      ? matchCategoryFromInput(mappedRow.category as string, categoryKeywords)
      : null

    if (matchedCategory && validCategories.includes(matchedCategory)) {
      finalCategory = matchedCategory
      errors.push({
        row: rowNumber,
        field: 'category',
        message: `Kategorie "${mappedRow.category}" erkannt als "${matchedCategory}"`,
        value: mappedRow.category as string || 'leer',
        type: 'info',
      })
    } else {
      // Try to detect from title
      const detectedCategory = detectCategoryFromTitle(mappedRow.title as string, categoryKeywords)

      if (detectedCategory && validCategories.includes(detectedCategory)) {
        finalCategory = detectedCategory
        errors.push({
          row: rowNumber,
          field: 'category',
          message: `Kategorie automatisch erkannt: "${detectedCategory}" (aus Titel)`,
          value: mappedRow.category as string || 'leer',
          type: 'info',
        })
      } else {
        finalCategory = validCategories[0] || 'jacken'
        errors.push({
          row: rowNumber,
          field: 'category',
          message: `Kategorie automatisch auf "${finalCategory}" gesetzt (keine Kategorie erkannt)`,
          value: mappedRow.category as string || 'leer',
          type: 'warning',
        })
      }
    }
  }

  mappedRow.category = finalCategory
}

function validateProductUrl(
  mappedRow: Record<string, unknown>,
  rowNumber: number,
  errors: ImportError[],
  format: string,
  shopifyDomain: string | null
): void {
  if (!mappedRow.product_url || (mappedRow.product_url as string).trim() === '') {
    if (format === 'shopify') {
      if (shopifyDomain && mappedRow.external_product_id) {
        errors.push({
          row: rowNumber,
          field: 'product_url',
          message: `Produkt-URL wird automatisch generiert: https://${shopifyDomain}/products/${mappedRow.external_product_id}`,
          value: 'auto-generiert',
          type: 'info',
        })
      } else if (!shopifyDomain) {
        errors.push({
          row: rowNumber,
          field: 'product_url',
          message: 'Produkt-URL fehlt und keine Shopify-Domain hinterlegt. Bitte Domain in Einstellungen pflegen oder URL manuell angeben.',
          value: mappedRow.product_url as string || 'leer',
          type: 'warning',
        })
      } else if (!mappedRow.external_product_id) {
        errors.push({
          row: rowNumber,
          field: 'product_url',
          message: 'Produkt-URL fehlt und kein Handle vorhanden. Handle erforderlich für automatische URL-Generierung.',
          value: mappedRow.product_url as string || 'leer',
        })
      }
    } else {
      errors.push({
        row: rowNumber,
        field: 'product_url',
        message: 'Produkt-URL fehlt',
        value: mappedRow.product_url as string || 'leer',
        type: 'warning',
      })
    }
  }
}

function validateOptionalFields(
  mappedRow: Record<string, unknown>,
  rowNumber: number,
  errors: ImportError[]
): void {
  // Validate condition
  if (mappedRow.condition && !VALID_CONDITIONS.includes((mappedRow.condition as string).toLowerCase())) {
    errors.push({
      row: rowNumber,
      field: 'condition',
      message: `Ungültiger Zustand. Erlaubt: ${VALID_CONDITIONS.join(', ')}`,
      value: mappedRow.condition as string,
    })
  }

  // Validate vintage style
  if (mappedRow.vintage_style && !VALID_VINTAGE_STYLES.includes(mappedRow.vintage_style as string)) {
    errors.push({
      row: rowNumber,
      field: 'vintage_style',
      message: `Ungültiger Vintage Style. Erlaubt: ${VALID_VINTAGE_STYLES.join(', ')}`,
      value: mappedRow.vintage_style as string,
    })
  }

  // Validate availability
  if (mappedRow.availability && !VALID_AVAILABILITY.includes(mappedRow.availability as string)) {
    errors.push({
      row: rowNumber,
      field: 'availability',
      message: `Ungültige Verfügbarkeit. Erlaubt: ${VALID_AVAILABILITY.join(', ')}`,
      value: mappedRow.availability as string,
    })
  }

  // Validate stock quantity
  const stockQty = parseInt(mappedRow.stock_qty as string)
  if (mappedRow.stock_qty && (isNaN(stockQty) || stockQty < 0)) {
    errors.push({
      row: rowNumber,
      field: 'stock_qty',
      message: 'Lagerbestand muss eine positive Zahl sein',
      value: mappedRow.stock_qty as string,
    })
  }
}

function validateUrls(
  mappedRow: Record<string, unknown>,
  rowNumber: number,
  errors: ImportError[]
): void {
  const urlFields = ['image_url_1', 'image_url_2', 'image_url_3', 'checkout_url']

  urlFields.forEach(field => {
    const url = mappedRow[field] as string
    if (url && url.trim() !== '' && !isValidUrl(url)) {
      errors.push({
        row: rowNumber,
        field,
        message: 'Ungültige URL',
        value: url,
      })
    }
  })

  // Validate product_url separately (only if provided)
  const productUrl = mappedRow.product_url as string
  if (productUrl && productUrl.trim() !== '' && !isValidUrl(productUrl)) {
    errors.push({
      row: rowNumber,
      field: 'product_url',
      message: 'Ungültige Produkt-URL',
      value: productUrl,
    })
  }
}

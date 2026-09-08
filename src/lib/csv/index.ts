/**
 * CSV Processing Utilities
 *
 * @example
 * import { validateCSVData, detectCategoryFromTitle } from '@/lib/csv'
 */

export {
  // Types
  type ImportError,
  type ValidationResult,
  type CSVValidationOptions,

  // Constants
  SHOPIFY_FIELD_MAPPING,
  CSV_FIELD_MAPPING,
  VALID_CONDITIONS,
  VALID_VINTAGE_STYLES,
  VALID_AVAILABILITY,

  // Functions
  detectSizeFromTitle,
  matchCategoryFromInput,
  detectCategoryFromTitle,
  mapCSVRow,
  isValidUrl,
  validateCSVData,
} from './validator'

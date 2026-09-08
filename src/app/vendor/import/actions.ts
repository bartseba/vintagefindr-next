'use server'

import Papa from 'papaparse'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireVendorAuth } from '@/lib/auth/session'
import { uploadImageFromUrl, deleteImageFromBunny } from '@/lib/bunny-cdn'
import { getValidCategories, getCategoryKeywords, getSizeKeywords, getAllBrands } from '@/lib/directus'
import {
  validateCSVData,
  detectCategoryFromTitle,
  SHOPIFY_FIELD_MAPPING,
  CSV_FIELD_MAPPING,
  type ImportError,
} from '@/lib/csv'

export interface ImportActionState {
  error?: string
  dryRun?: {
    validRows: number
    errors: ImportError[]
    filename: string
    format: string
    totalRows: number
  }
  import?: {
    success: boolean
    imported: number
    updated: number
    drafts: number
    pendingSuggestions: number
    skipped: number
    message: string
  }
}

async function createSuggestion(
  supabase: SupabaseClient,
  type: 'brand' | 'category' | 'size',
  value: string,
  vendorId: string
): Promise<string | null> {
  const tableName = `${type}_suggestions`
  const fieldName = type === 'size' ? 'size_value' : `${type}_name`

  const { data: existing } = await supabase
    .from(tableName)
    .select('id')
    .eq(fieldName, value)
    .eq('vendor_id', vendorId)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    return existing.id
  }

  const { data, error } = await supabase
    .from(tableName)
    .insert({ [fieldName]: value, vendor_id: vendorId, status: 'pending' })
    .select('id')
    .single()

  if (error) {
    console.error(`Error creating ${type} suggestion:`, error)
    return null
  }

  return data.id
}

interface ExistingProductImages {
  id: string
  external_product_id: string | null
  image_url_1: string | null
  image_url_2: string | null
  image_url_3: string | null
}

interface DirectusBrandRow {
  id: number
  Name: string
}

/**
 * Ported from `vendor.import.tsx`'s `action` — dispatches on `_action`
 * (`dry-run`/`import`/`import-with-errors`) read from the submitted
 * `FormData`, matching the Remix original's single-action-multiple-submit-
 * buttons pattern via `useActionState`.
 */
export async function importCSV(_prevState: ImportActionState, formData: FormData): Promise<ImportActionState> {
  const { supabase, vendor } = await requireVendorAuth()

  const [validCategories, categoryKeywords, sizeKeywords, brandsFromDirectus] = await Promise.all([
    getValidCategories(),
    getCategoryKeywords(),
    getSizeKeywords(),
    getAllBrands(),
  ])

  const categories = validCategories
  const keywords = categoryKeywords
  const sizes = sizeKeywords
  const brands = brandsFromDirectus as DirectusBrandRow[]

  try {
    const actionType = formData.get('_action')
    const csvFile = formData.get('csvFile') as File
    const csvFormat = (formData.get('csvFormat') as string) || 'standard'
    const publishImmediately = formData.get('publishImmediately') === 'on'

    if (!csvFile || csvFile.size === 0) {
      return { error: 'Bitte wählen Sie eine CSV-Datei aus' }
    }

    const csvText = await csvFile.text()

    const parseResult = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
    })

    if (parseResult.errors.length > 0) {
      console.error('CSV Parse errors:', parseResult.errors)
      return { error: 'CSV-Parsing-Fehler: ' + parseResult.errors.map((e) => e.message).join(', ') }
    }

    const { data: vendorDataShort } = await supabase
      .from('vendors')
      .select('shopify_domain')
      .eq('id', vendor.id)
      .single()

    const shopifyDomain = vendorDataShort?.shopify_domain || null

    if (actionType === 'dry-run') {
      const validation = validateCSVData(parseResult.data, {
        format: csvFormat as 'standard' | 'shopify',
        categoryKeywords: keywords,
        validCategories: categories,
        sizeKeywords: sizes,
        shopifyDomain,
      })
      return {
        dryRun: {
          validRows: validation.validRows.length,
          errors: validation.errors,
          filename: csvFile.name,
          format: csvFormat,
          totalRows: validation.totalRows,
        },
      }
    }

    if (actionType === 'import' || actionType === 'import-with-errors') {
      const validation = validateCSVData(parseResult.data, {
        format: csvFormat as 'standard' | 'shopify',
        categoryKeywords: keywords,
        validCategories: categories,
        sizeKeywords: sizes,
        shopifyDomain,
      })

      const actualErrors = validation.errors.filter((e) => !e.type || e.type === 'error')

      if (actionType === 'import' && actualErrors.length > 0) {
        return { error: 'Validierungsfehler gefunden. Bitte führen Sie zuerst einen Dry-Run durch.' }
      }

      const { data: vendorData } = await supabase
        .from('vendors')
        .select('store_name, store_location, store_website, shopify_domain')
        .eq('id', vendor.id)
        .single()

      const fieldMapping = csvFormat === 'shopify' ? SHOPIFY_FIELD_MAPPING : CSV_FIELD_MAPPING
      const realErrors = validation.errors.filter((e) => !e.type || e.type === 'error')
      const errorRowNumbers = new Set(realErrors.map((e) => e.row))
      const productsToInsert: Record<string, unknown>[] = []
      const productsToUpdate: Array<{ id: string; data: Record<string, unknown>; oldImages: string[] }> = []

      const csvExternalIds = new Set<string>()
      const duplicatesInCSV = new Set<string>()

      parseResult.data.forEach((row) => {
        const mappedRow: Record<string, string> = {}
        Object.keys(row).forEach((csvField) => {
          const dbField = fieldMapping[csvField.toLowerCase()]
          if (dbField) {
            mappedRow[dbField] = row[csvField]
          }
        })

        const externalId = mappedRow.external_product_id?.trim()
        if (externalId) {
          if (csvExternalIds.has(externalId)) {
            duplicatesInCSV.add(externalId)
          } else {
            csvExternalIds.add(externalId)
          }
        }
      })

      if (duplicatesInCSV.size > 0) {
        return {
          error: `CSV enthält doppelte externe Produkt-IDs: ${Array.from(duplicatesInCSV).join(', ')}. Bitte entfernen Sie die Duplikate und versuchen Sie es erneut.`,
        }
      }

      const existingProductsMap = new Map<string, ExistingProductImages>()
      if (csvExternalIds.size > 0) {
        const { data: existingProducts } = await supabase
          .from('products')
          .select('id, external_product_id, image_url_1, image_url_2, image_url_3')
          .eq('vendor_id', vendor.id)
          .in('external_product_id', Array.from(csvExternalIds))
          .eq('deleted', false)

        if (existingProducts && existingProducts.length > 0) {
          existingProducts.forEach((p: ExistingProductImages) => {
            if (p.external_product_id) {
              existingProductsMap.set(p.external_product_id, p)
            }
          })
        }
      }

      for (let i = 0; i < parseResult.data.length; i++) {
        const row = parseResult.data[i]
        const rowNumber = i + 2

        if (!row || Object.keys(row).length === 0) {
          continue
        }

        const mappedRow: Record<string, string> = {}
        Object.keys(row).forEach((csvField) => {
          const dbField = fieldMapping[csvField.toLowerCase()]
          if (dbField) {
            mappedRow[dbField] = row[csvField]
          }
        })

        const hasErrors = errorRowNumbers.has(rowNumber)

        let imageUrl1: string | null = null
        let imageUrl2: string | null = null
        let imageUrl3: string | null = null

        if (mappedRow.image_url_1) {
          const uploadResult = await uploadImageFromUrl(mappedRow.image_url_1, 'products')
          if (uploadResult.success && uploadResult.url) {
            imageUrl1 = uploadResult.url
          }
        }

        if (mappedRow.image_url_2) {
          const uploadResult = await uploadImageFromUrl(mappedRow.image_url_2, 'products')
          if (uploadResult.success && uploadResult.url) {
            imageUrl2 = uploadResult.url
          }
        }

        if (mappedRow.image_url_3) {
          const uploadResult = await uploadImageFromUrl(mappedRow.image_url_3, 'products')
          if (uploadResult.success && uploadResult.url) {
            imageUrl3 = uploadResult.url
          }
        }

        let finalCategory = mappedRow.category?.toLowerCase()
        let suggestedCategoryId: string | null = null
        let matchedCategoryName: string | null = null

        if (!finalCategory || !categories.includes(finalCategory)) {
          if (mappedRow.category) {
            const inputLower = mappedRow.category.toLowerCase().trim()

            for (const [categorySlug, keywordsList] of Object.entries(keywords)) {
              if (categorySlug.toLowerCase() === inputLower) {
                matchedCategoryName = categorySlug
                break
              }

              for (const keyword of keywordsList) {
                const keywordLower = keyword.toLowerCase()
                if (inputLower === keywordLower || inputLower.includes(keywordLower) || keywordLower.includes(inputLower)) {
                  matchedCategoryName = categorySlug
                  break
                }
              }
              if (matchedCategoryName) break
            }
          }

          if (matchedCategoryName && categories.includes(matchedCategoryName)) {
            finalCategory = matchedCategoryName
          } else {
            const detectedCategory = detectCategoryFromTitle(mappedRow.title, keywords)

            if (detectedCategory && categories.includes(detectedCategory)) {
              finalCategory = detectedCategory
            } else if (mappedRow.category) {
              suggestedCategoryId = await createSuggestion(supabase, 'category', mappedRow.category, vendor.id)
              finalCategory = categories[0] || 'jacken'
            } else {
              finalCategory = categories[0] || 'jacken'
            }
          }
        }

        let finalBrand: string | null = mappedRow.brand || null
        let suggestedBrandId: string | null = null

        if (finalBrand) {
          const normalizedBrand = finalBrand.toLowerCase().trim()
          const brandMatch = brands.find((b) => b.Name.toLowerCase() === normalizedBrand)

          if (brandMatch) {
            finalBrand = brandMatch.Name
          } else {
            suggestedBrandId = await createSuggestion(supabase, 'brand', finalBrand, vendor.id)
          }
        }

        let finalSize = mappedRow.size || 'One Size'
        let suggestedSizeId: string | null = null

        if (finalSize && finalSize !== 'One Size') {
          const normalizedSize = finalSize.toLowerCase().trim()
          let matchedSizeName: string | null = null

          const sizeMatches = Object.entries(sizes).some(([sizeName, sizeKeywordsList]) => {
            if (sizeName.toLowerCase() === normalizedSize) {
              matchedSizeName = sizeName
              return true
            }
            const keywordMatch = sizeKeywordsList.some((keyword) =>
              normalizedSize === keyword.toLowerCase() ||
              normalizedSize.includes(keyword.toLowerCase()) ||
              keyword.toLowerCase().includes(normalizedSize)
            )
            if (keywordMatch) {
              matchedSizeName = sizeName
              return true
            }
            return false
          })

          if (sizeMatches && matchedSizeName) {
            finalSize = matchedSizeName
          } else {
            suggestedSizeId = await createSuggestion(supabase, 'size', finalSize, vendor.id)
          }
        }

        const hasPendingSuggestions = Boolean(suggestedBrandId || suggestedCategoryId || suggestedSizeId)

        let finalProductUrl: string | null = mappedRow.product_url || null
        if (csvFormat === 'shopify' && vendorData?.shopify_domain && mappedRow.external_product_id && !finalProductUrl) {
          finalProductUrl = `https://${vendorData.shopify_domain}/products/${mappedRow.external_product_id}`
        }

        const productData = {
          vendor_id: vendor.id,
          vendor: vendorData?.store_name || vendor.store_name,
          vendor_location: vendorData?.store_location || null,
          vendor_website: vendorData?.store_website || null,
          title: mappedRow.title || null,
          description: mappedRow.description || null,
          brand: finalBrand,
          category: finalCategory || 'vintage',
          vintage_styles: mappedRow.vintage_style || null,
          price: parseFloat(mappedRow.price),
          currency: 'EUR',
          condition: mappedRow.condition || null,
          availability: mappedRow.availability || 'in_stock',
          shipping_cost: null,
          free_shipping_threshold: null,
          delivery_time_min_days: null,
          delivery_time_max_days: null,
          tax_included: true,
          tax_rate: 19.0,
          image_url_1: imageUrl1,
          image_url_2: imageUrl2,
          image_url_3: imageUrl3,
          product_url: finalProductUrl,
          checkout_url: mappedRow.checkout_url || null,
          stock_qty: mappedRow.stock_qty ? parseInt(mappedRow.stock_qty) : null,
          external_product_id: mappedRow.external_product_id?.trim() || null,
          tags: `csv-import${hasErrors ? ',has-errors,needs-review' : ''}${mappedRow.tags ? ',' + mappedRow.tags : ''}${hasPendingSuggestions ? ',pending-suggestions' : ''}${!publishImmediately ? ',draft' : ''}`,
          size: finalSize,
          is_active: publishImmediately && !hasErrors && !hasPendingSuggestions,
          deleted: false,
          suggested_brand_id: suggestedBrandId,
          suggested_category_id: suggestedCategoryId,
          suggested_size_id: suggestedSizeId,
        }

        const externalId = mappedRow.external_product_id?.trim()
        const existingProduct = externalId ? existingProductsMap.get(externalId) : null

        if (existingProduct) {
          const oldImages = [
            existingProduct.image_url_1,
            existingProduct.image_url_2,
            existingProduct.image_url_3,
          ].filter((url): url is string => Boolean(url))

          productsToUpdate.push({ id: existingProduct.id, data: productData, oldImages })
        } else {
          productsToInsert.push(productData)
        }
      }

      let insertedCount = 0
      let updatedCount = 0
      let totalErrors = 0

      if (productsToInsert.length > 0) {
        const { data, error } = await supabase.from('products').insert(productsToInsert).select()

        if (error) {
          console.error('Insert error:', error)
          totalErrors++
        } else {
          insertedCount = data?.length || 0
        }
      }

      if (productsToUpdate.length > 0) {
        for (const update of productsToUpdate) {
          const { error } = await supabase.from('products').update(update.data).eq('id', update.id)

          if (error) {
            console.error('Update error:', error)
            totalErrors++
          } else {
            updatedCount++

            const newImages = [update.data.image_url_1, update.data.image_url_2, update.data.image_url_3]
              .filter((url): url is string => Boolean(url))
            const imagesToDelete = update.oldImages.filter((oldImg) => !newImages.includes(oldImg))

            for (const imageUrl of imagesToDelete) {
              try {
                await deleteImageFromBunny(imageUrl)
              } catch (err) {
                console.error('Failed to delete old image:', err)
              }
            }
          }
        }
      }

      if (totalErrors > 0) {
        return {
          error: `Import teilweise fehlgeschlagen: ${insertedCount} neu erstellt, ${updatedCount} aktualisiert, ${totalErrors} Fehler`,
        }
      }

      const allProducts = [...productsToInsert, ...productsToUpdate.map((u) => u.data)]
      const draftCount = allProducts.filter((p) => !p.is_active).length
      const pendingSuggestionsCount = allProducts.filter((p) => p.suggested_brand_id || p.suggested_category_id || p.suggested_size_id).length

      let message = ''
      if (insertedCount > 0) {
        message += `${insertedCount} neue Produkte importiert`
      }
      if (updatedCount > 0) {
        if (message) message += ', '
        message += `${updatedCount} Produkte aktualisiert`
      }
      if (draftCount > 0) {
        message += `, ${draftCount} als Entwurf gespeichert`
      }
      if (pendingSuggestionsCount > 0) {
        message += `. ${pendingSuggestionsCount} Produkt(e) warten auf Freigabe (Marke/Kategorie/Größe)`
      }

      return {
        import: {
          success: true,
          imported: insertedCount,
          updated: updatedCount,
          drafts: draftCount,
          pendingSuggestions: pendingSuggestionsCount,
          skipped: validation.totalRows - validation.validRows.length,
          message,
        },
      }
    }

    return { error: 'Unbekannte Aktion' }
  } catch (error) {
    console.error('CSV Import Error:', error)
    return { error: 'Fehler beim Verarbeiten der CSV-Datei' }
  }
}

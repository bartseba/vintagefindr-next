'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FileText, AlertCircle, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ShopifyDomainModal } from '@/components/ShopifyDomainModal'
import { CSVFormatSelector } from '@/components/vendor/CSVFormatSelector'
import { CSVUploadZone } from '@/components/vendor/CSVUploadZone'
import { ImportDryRunResults } from '@/components/vendor/ImportDryRunResults'
import { ImportSuccessMessage } from '@/components/vendor/ImportSuccessMessage'
import { ImportHistory, type ImportHistoryItem } from '@/components/vendor/ImportHistory'
import { emailAddresses } from '@/constant/routes'
import { importCSV, type ImportActionState } from '@/app/vendor/import/actions'
import { updateShopifyDomain } from '@/app/vendor/settings/actions'

interface VendorImportFormProps {
  importHistory: ImportHistoryItem[]
  shopifyDomain: string | null
}

const initialState: ImportActionState = {}

export function VendorImportForm({ importHistory, shopifyDomain }: VendorImportFormProps) {
  const [state, formAction, isProcessing] = useActionState(importCSV, initialState)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [publishImmediately, setPublishImmediately] = useState(true)
  const [csvFormat, setCsvFormat] = useState<'standard' | 'shopify'>('standard')
  const [showShopifyDomainModal, setShowShopifyDomainModal] = useState(false)
  const [currentShopifyDomain, setCurrentShopifyDomain] = useState(shopifyDomain || '')

  const downloadSampleCSV = (format: 'standard' | 'shopify') => {
    let csvContent = ''
    let filename = ''

    if (format === 'standard') {
      csvContent = `titel,beschreibung,marke,preis,produkt_url,kategorie,größe,zustand,externe_produkt_id,verfügbarkeit,lagerbestand,bild_1,bild_2,bild_3,tags,vintage_style
"Vintage Nike Windbreaker Jacke 90er","Authentische Nike Windbreaker Jacke aus den 90er Jahren in Größe L. Sehr guter Zustand mit minimalen Gebrauchsspuren.","Nike",45.90,"https://ihr-shop.com/produkt/nike-windbreaker-001","Jacken & Mäntel","L","sehr gut","PROD-001","in_stock",1,"https://example.com/images/nike-jacket-front.jpg","https://example.com/images/nike-jacket-back.jpg","https://example.com/images/nike-jacket-detail.jpg","vintage,nike,90s,windbreaker,sportswear","Streetwear"
"Adidas Originals T-Shirt Retro","Klassisches Adidas Originals T-Shirt im Retro-Design. Ungetragen, Größe M.","Adidas",29.90,"https://ihr-shop.com/produkt/adidas-tshirt-002","T-Shirts & Tops","M","neu","PROD-002","in_stock",3,"https://example.com/images/adidas-shirt.jpg","","","retro,adidas,tshirt","Streetwear"
"Levi's 501 Jeans Vintage","Original Levi's 501 Jeans aus den 80er Jahren. Authentischer Vintage Look.","Levi's",79.90,"https://ihr-shop.com/produkt/levis-501-003","Hosen & Jeans","W32/L34","gut","PROD-003","in_stock",2,"https://example.com/images/levis-jeans.jpg","","","jeans,levis,denim,vintage","Y2K"`
      filename = 'vintagefindr-sample-standard.csv'
    } else {
      csvContent = `Handle,Title,Body (HTML),Vendor,Product Category,Tags,Variant Price,Variant Inventory Qty,Image Src,Variant SKU,Option1 Name,Option1 Value,Status
"vintage-nike-windbreaker","Vintage Nike Windbreaker Jacke 90er","Authentische Nike Windbreaker Jacke aus den 90er Jahren. Sehr guter Zustand mit minimalen Gebrauchsspuren.","Nike","Jacken & Mäntel","vintage, nike, 90s, windbreaker",45.90,1,"https://example.com/images/nike-jacket.jpg","NIKE-WB-001","Size","L","active"
"adidas-originals-tshirt","Adidas Originals T-Shirt Retro","Klassisches Adidas Originals T-Shirt im Retro-Design. Ungetragen.","Adidas","T-Shirts & Tops","retro, adidas, tshirt",29.90,3,"https://example.com/images/adidas-shirt.jpg","ADIDAS-TS-002","Size","M","active"
"levis-501-jeans","Levi's 501 Jeans Vintage","Original Levi's 501 Jeans aus den 80er Jahren. Authentischer Vintage Look.","Levi's","Hosen & Jeans","jeans, levis, denim, vintage",79.90,2,"https://example.com/images/levis-jeans.jpg","LEVIS-J-003","Size","W32/L34","active"`
      filename = 'vintagefindr-sample-shopify.csv'
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  // React 19 resets uncontrolled form fields (incl. the file input) after
  // every successful form-action submission. Without this, a dry-run
  // submit silently clears the selected file from the real DOM input —
  // `selectedFile` still shows "Datei bereit" (separate local state), but
  // the next submit ("Import starten") fails HTML5 required-validation on
  // the now-empty, visually hidden input and never even reaches the
  // server action. Re-attach the retained File via DataTransfer after
  // every action result so subsequent submits keep working.
  useEffect(() => {
    if (fileInputRef.current && selectedFile) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(selectedFile)
      fileInputRef.current.files = dataTransfer.files
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only needs to re-run when the action result changes, not on every selectedFile update (the change handler already keeps the input in sync in that case)
  }, [state])

  const handleSaveShopifyDomain = async (domain: string) => {
    const result = await updateShopifyDomain(domain)

    if (result.error) {
      console.error('Error saving domain:', result.error)
      return
    }

    setCurrentShopifyDomain(domain)
    setShowShopifyDomainModal(false)
    setCsvFormat('shopify')
  }

  const dryRunData = state.dryRun
  const importResult = state.import
  const errorMessage = state.error

  const hasNoRealErrors = dryRunData?.errors
    ? dryRunData.errors.filter((e) => !e.type || e.type === 'error').length === 0
    : false
  const hasRealErrors = dryRunData?.errors
    ? dryRunData.errors.filter((e) => !e.type || e.type === 'error').length > 0
    : false

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            CSV-Datei hochladen
          </h1>
          <p className="text-gray-600">
            Lade deine Produktdaten hoch und führe eine Validierung durch
          </p>
          <p>
            Probleme mit den CSV Daten? Schreib uns eine E-Mail an{' '}
            <a href={`mailto:${emailAddresses.support}`} className="text-blue-600 hover:text-blue-800">
              {`${emailAddresses.support}`}
            </a>
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <ShoppingBag className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-900">
                Bald verfügbar: Direkte Shopify-Integration!
              </p>
              <p className="text-xs text-green-800 mt-1">
                In Kürze können Sie Ihre Produkte direkt aus Shopify synchronisieren - ganz ohne manuellen CSV-Export.
              </p>
            </div>
          </div>
        </div>

        <form action={formAction} encType="multipart/form-data" className="space-y-6">
          <CSVFormatSelector
            csvFormat={csvFormat}
            onFormatChange={setCsvFormat}
            onDownloadSample={downloadSampleCSV}
          />

          <CSVUploadZone
            ref={fileInputRef}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
          />

          {selectedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    Datei bereit für Validierung
                  </p>
                  <p className="text-sm text-blue-700">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {csvFormat === 'shopify' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ShoppingBag className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-2">Shopify-Einstellungen</h4>
                  {currentShopifyDomain ? (
                    <div className="space-y-2">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Ihre Shopify-Domain:</span> {currentShopifyDomain}
                      </p>
                      <p className="text-xs text-blue-700">
                        Produkt-URLs werden automatisch generiert: {currentShopifyDomain}/products/[handle]
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowShopifyDomainModal(true)}
                        >
                          Domain ändern
                        </Button>
                        <Link href="/vendor/settings" className="inline-flex">
                          <Button type="button" variant="outline" size="sm">
                            Zu Einstellungen
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
                        Keine Shopify-Domain hinterlegt. Bitte pflegen Sie Ihre Domain, um automatische Produkt-URLs zu generieren.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setShowShopifyDomainModal(true)}
                        >
                          Domain jetzt pflegen
                        </Button>
                        <Link href="/vendor/settings" className="inline-flex">
                          <Button type="button" variant="outline" size="sm">
                            In Einstellungen pflegen
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900 mb-2">
                  {csvFormat === 'shopify' ? 'Shopify CSV' : 'CSV'} Anforderungen
                </h4>
                <div className="text-sm text-amber-800 space-y-4">
                  {csvFormat === 'shopify' ? (
                    <div className="border-t border-amber-300 pt-3">
                      <p><strong>Shopify CSV Format:</strong></p>
                      <p className="mb-2">Verwenden Sie den Standard Shopify Product Export mit folgenden Spalten:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li><code>Handle</code> - Produkt-Handle (z.B. vintage-nike-jacket)</li>
                        <li><code>Title</code> - Produkttitel</li>
                        <li><code>Body (HTML)</code> - Produktbeschreibung</li>
                        <li><code>Vendor</code> - Marke/Hersteller</li>
                        <li><code>Product Category</code> - Kategorie</li>
                        <li><code>Tags</code> - Schlagwörter</li>
                        <li><code>Variant Price</code> - Preis</li>
                        <li><code>Variant Inventory Qty</code> - Lagerbestand</li>
                        <li><code>Image Src</code> - Produktbild URL</li>
                        <li><code>Variant SKU</code> - SKU als Varianten-ID</li>
                        <li><code>Option1 Value / Option2 Value / Option3 Value</code> - Größenoptionen</li>
                      </ul>
                      <p className="text-xs text-amber-700 mt-2">
                        <strong>Produkt-URLs:</strong> Die Produkt-URLs werden automatisch aus Ihrer Shop-Domain und dem Handle generiert.
                      </p>
                      <p className="text-xs text-amber-700 mt-2">
                        <strong>Größen-Erkennung:</strong> Das System durchsucht automatisch alle Option Value Felder nach Größenangaben.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p><strong>Standard CSV Format:</strong></p>
                      <p className="mb-2"><strong>Erforderliche Spalten:</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li><code>titel</code> oder <code>title</code> - Produkttitel</li>
                        <li><code>marke</code> oder <code>brand</code> - Marke (erforderlich)</li>
                        <li><code>preis</code> oder <code>price</code> - Preis in Euro</li>
                        <li><code>produkt_url</code> oder <code>product_url</code> - Link zur Produktseite</li>
                      </ul>
                      <p className="mt-3"><strong>Optionale Spalten:</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li><code>beschreibung/description</code> - Produktbeschreibung</li>
                        <li><code>kategorie/category</code> - Produktkategorie</li>
                        <li><code>vintage_style/style</code> - Vintage-Stil</li>
                        <li><code>zustand/condition</code> - neu, sehr gut, gut, akzeptabel</li>
                        <li><code>größe/size/groesse</code> - Produktgröße</li>
                        <li><code>verfügbarkeit/availability</code> - in_stock, out_of_stock, preorder</li>
                        <li><code>lagerbestand/stock_qty</code> - Anzahl verfügbarer Stücke</li>
                        <li><code>bild_1/image_url_1</code> - Hauptbild URL</li>
                        <li><code>bild_2/image_url_2</code> - Zusätzliches Bild URL</li>
                        <li><code>bild_3/image_url_3</code> - Weiteres Bild URL</li>
                      </ul>
                    </div>
                  )}
                </div>
                <div className="text-sm text-amber-800 space-y-2">
                  <p className="mt-3 text-amber-700">
                    <strong>Hinweise:</strong> Die erste Zeile muss die Spaltennamen enthalten.
                    Bilder werden automatisch von den angegebenen URLs heruntergeladen und zu unserem CDN hochgeladen.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="publishImmediately"
                checked={publishImmediately}
                onChange={(e) => setPublishImmediately(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">
                  Produkte sofort veröffentlichen
                </p>
                <p className="text-sm text-gray-600">
                  Wenn aktiviert, werden Produkte sofort im Shop sichtbar. Wenn deaktiviert, werden sie als Entwurf gespeichert.
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              name="_action"
              value="dry-run"
              variant="outline"
              disabled={!selectedFile || isProcessing}
              isLoading={isProcessing}
            >
              {isProcessing ? 'Wird validiert...' : 'Import Prüfen'}
            </Button>

            {dryRunData && hasNoRealErrors && (
              <Button
                type="submit"
                name="_action"
                value="import"
                disabled={isProcessing}
                isLoading={isProcessing}
              >
                {isProcessing ? 'Wird importiert...' : 'Import starten'}
              </Button>
            )}

            {dryRunData && hasRealErrors && (
              <Button
                type="submit"
                name="_action"
                value="import-with-errors"
                variant="outline"
                disabled={isProcessing}
                isLoading={isProcessing}
              >
                {isProcessing ? 'Wird importiert...' : 'Mit Fehlern importieren'}
              </Button>
            )}
          </div>

          {dryRunData && <ImportDryRunResults dryRun={dryRunData} />}
        </form>

        {importResult?.success && <ImportSuccessMessage importResult={importResult} />}

        {errorMessage && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-medium text-red-900">Fehler</h3>
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <ImportHistory history={importHistory} />

      <ShopifyDomainModal
        isOpen={showShopifyDomainModal}
        onClose={() => setShowShopifyDomainModal(false)}
        currentDomain={currentShopifyDomain}
        onSave={handleSaveShopifyDomain}
      />
    </div>
  )
}

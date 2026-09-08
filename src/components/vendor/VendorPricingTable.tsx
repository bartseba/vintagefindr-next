'use client'

import { useActionState, useEffect, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { VendorFooter } from '@/components/VendorFooter'
import { createCheckoutSession, type CheckoutState } from '@/app/vendor/pricetable/actions'

export interface Plan {
  id: string
  name: string
  price: string
  priceAmount: number
  stripePriceId: string
  clicks: string
  centsPerClick: string
  features: string[]
  highlight?: boolean
  clicksAmount: number
}

interface VendorPricingTableProps {
  plans: Plan[]
  vendorStatus: string
}

const initialState: CheckoutState = {}

export function VendorPricingTable({ plans, vendorStatus }: VendorPricingTableProps) {
  const [state, formAction, isSubmitting] = useActionState(createCheckoutSession, initialState)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const isApproved = vendorStatus === 'approved'

  useEffect(() => {
    if (state.checkoutUrl) {
      window.location.href = state.checkoutUrl
    }
  }, [state.checkoutUrl])

  const handlePurchase = (stripePriceId: string, planId: string) => {
    if (!isApproved) {
      alert('Ihr Account muss erst von unserem Team genehmigt werden, bevor Sie Pakete buchen können.')
      return
    }
    if (!stripePriceId) {
      alert('Stripe Price ID ist nicht konfiguriert. Bitte kontaktiere den Support.')
      return
    }
    setSelectedPlan(planId)
  }

  return (
    <>
      <section className="bg-gray-50">
        <PageHeader backLink="/vendor/dashboard" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">Prepaid-Klickpakete</h2>
            <p className="mt-2 text-lg text-gray-600">
              Wähle das passende Prepaid-Paket für deinen Shop. Bezahlte Pakete sind 12 Monate gültig. Klicks werden serverseitig gezählt.
            </p>
          </div>

          {state.error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{state.error}</p>
            </div>
          )}

          {!isApproved && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-yellow-800 text-sm font-medium">Account-Genehmigung ausstehend</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Ihr Account wird aktuell von unserem Team überprüft. Sie können Pakete buchen, sobald Ihr Account genehmigt wurde. Dies dauert in der Regel 1-2 Werktage.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-[1024px] mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-6 bg-white shadow-sm ${plan.highlight ? 'border-vintage-primary ring-1 ring-indigo-50' : 'border-gray-200'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-vintage-primary text-white">
                      Empfohlen
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-semibold text-gray-900 mt-4 text-center">{plan.name}</h3>

                <div className="mt-4 text-center">
                  <div className="text-3xl font-extrabold text-gray-900">{plan.price}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {plan.clicks} • {plan.centsPerClick}
                  </div>
                </div>

                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-3 mt-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <form action={formAction}>
                    <input type="hidden" name="priceId" value={plan.stripePriceId} />
                    <button
                      type="submit"
                      disabled={!isApproved || (isSubmitting && selectedPlan === plan.id)}
                      onClick={() => handlePurchase(plan.stripePriceId, plan.id)}
                      className={`w-full inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${plan.highlight
                          ? 'bg-vintage-primary text-white hover:bg-vintage-secondary focus:ring-vintage-primary'
                          : 'bg-white text-vintage-primary border border-vintage-primary hover:bg-indigo-50 focus:ring-vintage-primary'}`}
                    >
                      {!isApproved ? 'Genehmigung ausstehend' : (isSubmitting && selectedPlan === plan.id ? 'Wird geladen...' : 'Paket kaufen')}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 mb-6 text-sm text-gray-600">
            <p><strong>Hinweis:</strong> Klicks werden serverseitig gezählt. Dein Dashboard zeigt Echtzeit-Verbrauch und Top-5 Produkte.</p>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Wichtig:</strong> Alle Pakete sind Prepaid-Klickpakete. Bezahlte Pakete haben eine Gültigkeit von 12 Monaten ab Kaufdatum. Nicht genutzte Klicks verfallen nach diesem Zeitraum. Es gibt keine Garantie für eine bestimmte Anzahl erreichter Klicks oder eine bestimmte Performance.</p>
            </div>
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>* Wichtiger Hinweis zur Produktsichtbarkeit:</strong>
              </p>
              <ul className="mt-2 text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Ohne aktives Klick-Paket oder wenn Ihr Paket abgelaufen ist, sind Ihre Produkte nicht öffentlich sichtbar</li>
                <li>Kostenlose Starterpakete sind 12 Monate gültig (einmalig bei Registrierung)</li>
                <li>Bezahlte Klick-Pakete sind 12 Monate gültig ab Kaufdatum</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <div className="my-4 p-3 text-xs text-gray-500 text-center">
        <p>
          * Gemäß § 19 UStG wird keine Umsatzsteuer berechnet und daher auch nicht ausgewiesen.
          Alle Preise sind Endpreise.
        </p>
      </div>
      <VendorFooter />
    </>
  )
}

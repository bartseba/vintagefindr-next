'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Gift, CheckCircle2, AlertCircle, Mail } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { VendorFooter } from '@/components/VendorFooter'
import { OTPModal } from '@/components/auth/OTPModal'
import { BusinessStatusInfoModal } from '@/components/BusinessStatusInfoModal'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { vendorOverview } from '@/constant/routes'

interface VendorRegisterFormProps {
  starterClicks: number
}

interface VendorRegistrationData {
  email: string
  firstName: string
  lastName: string
  storeName: string
  storeWebsite: string
  storeLocation: string
  ecommercePlatform: string
  inventorySystem: string
  numberOfItems: string
  acceptedTerms: boolean
  companyName: string
  companyAddress: string
  companyLegalForm: string
  confirmedBusinessStatus: boolean
}

const totalSteps = 2

export function VendorRegisterForm({ starterClicks }: VendorRegisterFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [registrationEmail, setRegistrationEmail] = useState('')
  const [registrationData, setRegistrationData] = useState<VendorRegistrationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmittingOTP, setIsSubmittingOTP] = useState(false)
  const [websiteValid, setWebsiteValid] = useState<boolean | null>(null)
  const [showBusinessInfoModal, setShowBusinessInfoModal] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    storeName: '',
    storeWebsite: '',
    storeLocation: '',
    ecommercePlatform: '',
    inventorySystem: '',
    numberOfItems: '',
    acceptedTerms: false,
    companyName: '',
    companyAddress: '',
    companyLegalForm: '',
    confirmedBusinessStatus: false,
  })
  const supabase = createSupabaseBrowserClient()

  const isValidUrl = (url: string): boolean => {
    if (!url) return false
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.storeName &&
          formData.storeWebsite &&
          formData.companyName &&
          formData.companyAddress &&
          formData.companyLegalForm
        )
      case 2:
        return !!(
          formData.email &&
          formData.firstName &&
          formData.lastName &&
          formData.confirmedBusinessStatus &&
          formData.acceptedTerms
        )
      default:
        return false
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isStepValid(currentStep)) {
      return
    }

    setCurrentStep(Math.min(currentStep + 1, totalSteps))
  }

  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1))

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmittingOTP(true)

    try {
      const payload = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        storeName: formData.storeName,
        storeWebsite: formData.storeWebsite,
        storeLocation: formData.storeLocation,
        ecommercePlatform: formData.ecommercePlatform,
        inventorySystem: formData.inventorySystem,
        numberOfItems: formData.numberOfItems,
        acceptedTerms: formData.acceptedTerms,
        companyName: formData.companyName,
        companyAddress: formData.companyAddress,
        companyLegalForm: formData.companyLegalForm,
        confirmedBusinessStatus: formData.confirmedBusinessStatus,
      }

      const response = await fetch('/api/validate-vendor-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.errors) {
        setError(Object.values(data.errors)[0] as string)
        setIsSubmittingOTP(false)
        return
      }

      if (data.success) {
        setRegistrationEmail(data.email)
        setRegistrationData(data)

        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: {
            shouldCreateUser: true,
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
            },
          },
        })

        if (otpError) {
          setError('Fehler beim Senden des Codes: ' + otpError.message)
          setIsSubmittingOTP(false)
        } else {
          setIsSubmittingOTP(false)
          setShowOTPModal(true)
        }
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
      setIsSubmittingOTP(false)
      console.error('Registration error:', err)
    }
  }

  const handleOTPSuccess = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError)
      setError('Fehler beim Abrufen der Session: ' + sessionError.message)
      return
    }

    if (!session) {
      setError('Keine aktive Session gefunden. Bitte versuchen Sie sich anzumelden.')
      return
    }

    if (!registrationData) {
      setError('Registrierungsdaten fehlen. Bitte versuchen Sie es erneut.')
      return
    }

    try {
      const { data: vendorResult, error: vendorError } = await supabase
        .rpc('create_vendor_profile', {
          p_user_id: session.user.id,
          p_first_name: registrationData.firstName,
          p_last_name: registrationData.lastName,
          p_email: registrationData.email,
          p_store_name: registrationData.storeName,
          p_store_website: registrationData.storeWebsite || null,
          p_store_location: registrationData.storeLocation || null,
          p_ecommerce_platform: registrationData.ecommercePlatform || null,
          p_inventory_system: registrationData.inventorySystem || null,
          p_number_of_items: registrationData.numberOfItems ? parseInt(registrationData.numberOfItems) : null,
          p_accepted_terms: registrationData.acceptedTerms,
          p_company_name: registrationData.companyName,
          p_company_address: registrationData.companyAddress,
          p_company_legal_form: registrationData.companyLegalForm,
          p_confirmed_business_status: registrationData.confirmedBusinessStatus,
        })

      if (vendorError) {
        console.error('Vendor profile creation error:', vendorError)
        setError('Fehler beim Erstellen des Vendor-Profils: ' + vendorError.message)
        return
      }

      if (vendorResult && !vendorResult.success) {
        setError('Fehler beim Erstellen des Vendor-Profils: ' + vendorResult.error)
        return
      }

      window.location.href = '/vendor/dashboard'
    } catch (err) {
      console.error('Vendor registration error:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <header className="top-0 bg-white shadow-md border-b-[#EAEAEA] border-b-1 border-solid mb-6 py-2">
        <div className="xl:container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href={vendorOverview}
                className="flex items-center gap-2 text-gray-600 hover:text-vintage-secondary"
              >
                <ArrowLeft size={20} />
                <span>zurück</span>
              </Link>
            </div>
            <Logo />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vintage-secondary mb-2">
            Händler Registrierung
          </h1>
          <p className="text-gray-600">
            Zeig deine Vintage-Produkte tausenden aktiven Suchenden. Die Registrierung ist kostenlos und dauert nur wenige Minuten.
          </p>

          <div className="mt-4 space-y-3">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg">
              <Gift className="h-5 w-5" />
              <span className="font-semibold">Startguthaben: {starterClicks} kostenlose Klicks</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
              <p className="text-sm text-blue-800">
                Das Startguthaben ist <strong>einmalig, nicht übertragbar</strong> und 12 Monate ab Registrierung gültig.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative mb-1">
            <div className="absolute top-4 left-[30px] right-[10px] h-1 bg-gray-200" />

            <div
              className="absolute top-4 left-[30px] h-1 bg-vintage-primary transition-all duration-500 max-w-[540px]"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />

            <div className="flex justify-between">
              {[1, 2].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`z-20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step < currentStep
                      ? 'bg-green-600 text-white'
                      : step === currentStep
                      ? 'bg-vintage-primary text-white ring-4 ring-vintage-primary/20'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step < currentStep ? <CheckCircle2 size={16} /> : step}
                  </div>
                  <span className={`text-sm mt-2 font-medium ${
                    step <= currentStep ? 'text-vintage-secondary' : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Store & Firma'}
                    {step === 2 && 'Account'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-sm font-medium text-gray-700">
            Schritt {currentStep} von {totalSteps}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 lg:min-w-[600px]">
          {currentStep === 1 && (
            <form onSubmit={nextStep} className="space-y-6">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-vintage-secondary mb-4">
                  Store & Unternehmensinformationen
                </h2>

                <Input
                  name="storeName"
                  label="Store Name *"
                  placeholder="Name Ihres Stores"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  required
                />

                <div>
                  <Input
                    name="storeWebsite"
                    label="Store Website *"
                    placeholder="https://www.dein-shop.com"
                    value={formData.storeWebsite}
                    onChange={(e) => {
                      handleInputChange(e)
                      if (e.target.value.length > 0) {
                        setWebsiteValid(isValidUrl(e.target.value))
                      } else {
                        setWebsiteValid(null)
                      }
                    }}
                    className={
                      websiteValid === true
                        ? 'border-green-500 focus:ring-green-500'
                        : websiteValid === false
                        ? 'border-red-500 focus:ring-red-500'
                        : ''
                    }
                    required
                  />
                  {websiteValid === false && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      Bitte gib eine gültige URL ein (z.B. https://dein-shop.de)
                    </p>
                  )}
                  {websiteValid === true && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 size={14} />
                      URL ist gültig
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-Commerce Platform (optional)
                    </label>
                    <select
                      name="ecommercePlatform"
                      value={formData.ecommercePlatform}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vintage-primary focus:border-transparent"
                    >
                      <option value="">Bitte wählen</option>
                      <option value="shopify">Shopify</option>
                      <option value="woocommerce">WooCommerce</option>
                      <option value="magento">Magento</option>
                      <option value="custom">Eigene Lösung</option>
                      <option value="other">Andere</option>
                    </select>
                  </div>

                  <Input
                    name="numberOfItems"
                    type="number"
                    label="Anzahl deiner Produkte (optional)"
                    placeholder="z.B. 100"
                    value={formData.numberOfItems}
                    onChange={handleInputChange}
                    hint="Hilft uns, dein Setup vorzubereiten"
                  />
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-medium text-vintage-secondary mb-4">
                    Unternehmensdaten
                  </h3>

                  <div className="space-y-4">
                    <Input
                      name="companyName"
                      label="Firmenname *"
                      placeholder="z.B. Vintage Store GmbH"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                    />

                    <Input
                      name="companyAddress"
                      label="Adresse *"
                      placeholder="Straße, Hausnummer, PLZ, Ort"
                      value={formData.companyAddress}
                      onChange={handleInputChange}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rechtsform <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="companyLegalForm"
                        value={formData.companyLegalForm}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vintage-primary focus:border-transparent"
                        required
                      >
                        <option value="">Bitte wählen</option>
                        <option value="Einzelunternehmen">Einzelunternehmen</option>
                        <option value="GbR">GbR</option>
                        <option value="OHG">OHG</option>
                        <option value="KG">KG</option>
                        <option value="GmbH">GmbH</option>
                        <option value="UG">UG (haftungsbeschränkt)</option>
                        <option value="AG">AG</option>
                        <option value="andere">Andere</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!isStepValid(1)}
                  className="px-8"
                >
                  Weiter
                </Button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-vintage-secondary mb-4">
                  Account-Informationen
                </h2>

                <Input
                  name="firstName"
                  label="Vorname *"
                  placeholder="Ihr Vorname"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />

                <Input
                  name="lastName"
                  label="Nachname *"
                  placeholder="Ihr Nachname"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />

                <Input
                  name="email"
                  type="email"
                  label="E-Mail Adresse *"
                  placeholder="ihre.email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />

                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="confirmedBusinessStatus"
                      checked={formData.confirmedBusinessStatus}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 mt-1 w-4 h-4"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      <span className="text-red-500">*</span> Ich bin Unternehmer (§14 BGB) und kein Privatverkäufer
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowBusinessInfoModal(true)
                        }}
                        className="text-vintage-primary hover:underline ml-1 font-medium"
                      >
                        Was bedeutet das?
                      </button>
                    </span>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="acceptedTerms"
                      checked={formData.acceptedTerms}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 mt-1"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      <span className="text-red-500">*</span> Ich akzeptiere die{' '}
                      <Link href="/agb" target="_blank" className="text-vintage-primary hover:text-amber-700">
                        Allgemeinen Geschäftsbedingungen
                      </Link>{' '}
                      und{' '}
                      <Link href="/datenschutz" target="_blank" className="text-vintage-primary hover:text-amber-700">
                        Datenschutzerklärung
                      </Link>
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="outline"
                  className="px-8"
                >
                  Zurück
                </Button>
                <Button
                  type="submit"
                  disabled={!isStepValid(2) || isSubmittingOTP}
                  isLoading={isSubmittingOTP}
                  className="px-8"
                >
                  {isSubmittingOTP ? 'Code wird gesendet...' : 'Registrierung abschließen'}
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p>
                      Du erhältst einen 6-stelligen Code per E-Mail für deine Registrierung.<br />
                      Bitte überprüfe auch deinen Spam-Ordner.
                    </p>
                    <p className="mt-2">
                      E-Mail Adresse:{' '}
                      <strong className="text-blue-900">{formData.email || 'deine E-Mail'}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
          <p className="text-sm text-gray-700">
            Probleme bei der Registrierung?{' '}
            <Link
              href="/kontakt"
              className="text-vintage-primary font-semibold hover:underline"
            >
              Kontakt aufnehmen
            </Link>
          </p>
        </div>

        <div className="mt-8 p-4 bg-vintage-primary rounded-lg text-center border border-gray-200">
          <p className="text-sm text-white">
            Bereits registriert?{' '}
            <Link
              href="/vendor/login?modal=login"
              className="text-white font-semibold hover:underline"
            >
              Jetzt anmelden
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-16">
        <VendorFooter />
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={registrationEmail}
        onSuccess={handleOTPSuccess}
        type="signup"
        isVendor={true}
      />

      <BusinessStatusInfoModal
        isOpen={showBusinessInfoModal}
        onClose={() => setShowBusinessInfoModal(false)}
      />
    </div>
  )
}

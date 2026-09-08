import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(request, RATE_LIMITS.strict, 'validate-vendor-registration')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const data = await request.json()

    const errors: Record<string, string> = {}

    if (!data.email) errors.email = 'E-Mail ist erforderlich'
    if (!data.storeName) errors.storeName = 'Store Name ist erforderlich'
    if (!data.storeWebsite) errors.storeWebsite = 'Store Website ist erforderlich'
    if (!data.companyName) errors.companyName = 'Firmenname ist erforderlich'
    if (!data.companyAddress) errors.companyAddress = 'Adresse ist erforderlich'
    if (!data.companyLegalForm) errors.companyLegalForm = 'Rechtsform ist erforderlich'
    if (!data.confirmedBusinessStatus) {
      errors.confirmedBusinessStatus = 'Sie müssen bestätigen, dass Sie als Unternehmer handeln'
    }
    if (!data.acceptedTerms) errors.acceptedTerms = 'Sie müssen die AGB akzeptieren'

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

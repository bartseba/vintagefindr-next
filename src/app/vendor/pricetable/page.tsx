import { requireVendorAuth } from '@/lib/auth/session'
import { VendorPricingTable, type Plan } from '@/components/vendor/VendorPricingTable'

function getPlans(): Plan[] {
  return [
    {
      id: 'test',
      name: 'test',
      price: '0,5€* einmalig',
      priceAmount: 0.5,
      stripePriceId: process.env.STRIPE_PRICE_TEST || '',
      clicks: '10 Klicks',
      clicksAmount: 10,
      centsPerClick: 'ca. 8 Ct/Klick',
      features: ['Klick-Übersicht im Dashboard', 'Volle Kostenkontrolle', 'Ideal zum Ausprobieren'],
    },
    {
      id: 'starter',
      name: 'Starter',
      price: '9€* einmalig',
      priceAmount: 9,
      stripePriceId: process.env.STRIPE_PRICE_STARTER || '',
      clicks: '150 Klicks',
      clicksAmount: 150,
      centsPerClick: 'ca. 6 Ct/Klick',
      features: ['Klick-Übersicht im Dashboard', 'Volle Kostenkontrolle', 'Ideal zum Ausprobieren'],
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '25€* einmalig',
      priceAmount: 25,
      stripePriceId: process.env.STRIPE_PRICE_BASIC || '',
      clicks: '750 Klicks',
      clicksAmount: 750,
      centsPerClick: 'ca. 4 Ct/Klick',
      features: ['Klick-Übersicht im Dashboard', 'Volle Kostenkontrolle', 'Beliebtestes Paket'],
      highlight: true,
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '80€* einmalig',
      priceAmount: 80,
      stripePriceId: process.env.STRIPE_PRICE_GROWTH || '',
      clicks: '3.000 Klicks',
      clicksAmount: 3000,
      centsPerClick: 'ca. 3 Ct/Klick',
      features: ['Klick-Übersicht im Dashboard', 'Volle Kostenkontrolle', 'Für große Händler'],
    },
  ]
}

export default async function VendorPricetablePage() {
  const { vendor } = await requireVendorAuth()
  const plans = getPlans()

  return <VendorPricingTable plans={plans} vendorStatus={vendor.status} />
}

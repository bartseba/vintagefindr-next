import type { Metadata } from 'next'
import { DsaMeldungForm } from '@/components/dsa/DsaMeldungForm'
import { siteUrl } from '@/constant/routes'

export const metadata: Metadata = {
  title: 'DSA-Meldung | VintageFindr',
  description: 'Melden Sie rechtswidrige Inhalte gemäß Digital Services Act (DSA)',
  alternates: { canonical: `${siteUrl}/dsa-meldung` },
}

export default function DsaMeldungPage() {
  return <DsaMeldungForm />
}

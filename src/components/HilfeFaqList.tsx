'use client'

import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'

interface SafeFaq {
  id: number
  question: string
  /** Pre-sanitized HTML — sanitize server-side before passing in, since `sanitizeHTML` is a `server-only` module. */
  safeAnswer: string
}

export function HilfeFaqList({ faqs }: { faqs: SafeFaq[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.safeAnswer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* FAQ Search */}
      <div className="relative mb-8">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="FAQ durchsuchen..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.map((faq, index) => (
          <div key={faq.id} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">{faq.question}</span>
              <span className={`transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                <ChevronDown />
              </span>
            </button>
            {openFaq === index && (
              <div
                className="px-6 pb-4 text-gray-700"
                dangerouslySetInnerHTML={{ __html: faq.safeAnswer }}
              />
            )}
          </div>
        ))}
      </div>

      {filteredFaqs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Keine FAQ-Einträge gefunden für &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </>
  )
}

import { sanitizeHTML } from '@/lib/sanitize'
import { Accordion } from './ui/Accordion'

interface FaqBlock {
  id: number
  Headline: string
  IntroText: string | null
  imageUrl?: string | null
  image_alt?: string | null
  isAiImage?: boolean
  faqs: Array<{ id: number; question: string; answer: string }>
}

export function FaqBlockSection({ block }: { block: FaqBlock }) {
  if (block.faqs.length === 0) return null

  return (
    <div className="mb-8 px-4 md:px-0">
      <h2 className="text-xl font-semibold text-vintage-secondary uppercase tracking-widest mb-4">
        {block.Headline}
      </h2>
      {block.IntroText && (
        <div
          className="content-block mb-4"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(block.IntroText) }}
        />
      )}
      <div className={'flex flex-col md:flex-row items-center gap-8'}>
        <div>
            {/* eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7) */}
            <img
              src={block.imageUrl || "https://vintagefindr-cms.b-cdn.net/faq-bild-vintage-kleiderstange.png?class=blockimage"}
              alt={block.image_alt || `FAQ-Illustration mit Kleiderstange – ${block.Headline.replace("FAQ","")}`}
              className="mb-4"
            />
            {block.isAiImage && (
              <p className="text-xs text-vintage-darkGray/60 -mt-3 mb-4">Bildnachweis: KI-generiert zur visuellen Veranschaulichung</p>
            )}
        </div>
        <div className="bg-white px-6 py-2 rounded-md border vintage-border">

          {block.faqs.map((faq, index) => (
            <Accordion key={faq.id} title={faq.question} defaultOpen={index === 0}>
              <div
                className="text-sm text-vintage-darkGray/80"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(faq.answer) }}
              />
            </Accordion>
          ))}
        </div>
      </div>
    </div>
  )
}

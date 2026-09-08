interface SectionHeaderSecondaryProps {
  headline: string
  subline: string
}

export function SectionHeaderSecondary({ headline, subline }: SectionHeaderSecondaryProps) {
  return (
    <div className="max-w-2xl text-center mx-auto mb-10 lg:mb-14 ">
      <h2 className="text-2xl md:text-4xl md:leading-tight font-medium font-playfair uppercase tracking-wide text-vintage-darkGray">{headline}</h2>
      <p className="text-base   text-vintage-secondary/85  tracking-wider mt-3">{subline}</p>
    </div>
  )
}

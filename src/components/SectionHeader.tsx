import ButtonPrimary from "./ui/ButtonPrimary";

type SectionHeaderProps = {
  title?: string;
  subtitle?: string;
  showAll?: string;
  margin?: string;
  textButton?: string;
};

export default function SectionHeader({
  title = "UNSERE\nVINTAGE  PICKS",
  subtitle = "Unsere Favoriten des Tages: schnell sichern, bevor sie weg sind.",
  showAll = "",
  textButton = "Alles anzeigen",
  margin = "py-4 mb-2  mt-6",
}: SectionHeaderProps) {
  return (
    <section className={`${margin}`}>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col flex-wrap">
          <h2
            className="uppercase font-extrabold text-vintage-darkGray text-3xl md:text-2xl font-medium roboto-mono-vintage"
          >
            {title}
          </h2>

          <p className="text-base   text-vintage-secondary/85  tracking-wider mb-1">
            {subtitle}
          </p>
        </div>
        {showAll && <ButtonPrimary size={"MEDIUM"} text={textButton} href={showAll} />}
      </div>
    </section>
  );
}

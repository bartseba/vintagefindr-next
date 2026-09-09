import { SectionHeaderSecondary } from "../ui/SectionHeaderSecondary";

const categories = [
    { url:`vintage/adidas`, label: "Adidas", icon: "Adidas"},
    { url:`vintage/nike`, label: "Nike", icon: "Nike"},
    { url:`vintage/puma`, label: "Puma", icon: "Puma"},
    { url:`vintage/fila`, label: "Fila", icon: "Fila"},
    { url:`vintage/carhartt`, label: "Carhartt", icon: "Carharrt"},
    { url:`vintage/thenorthface`, label: "The North Face", icon: "The North Face" },
    { url:`vintage/patagonia`, label: "patagonia", icon: "Patagonia" },
    { url:`vintage/levis`, label: "Levis", icon: "Levis" },
    { url:`vintage/stussy`, label: "Stüssy", icon: "Stüssy" },
    { url:`vintage/reebok`, label: "reebok", icon: "Reebok" },
    { url:`vintage/umbro`, label: "Umbro", icon: "Umbro" },
    { url:`vintage/columbia`, label: "columbia", icon: "Columbia" },
    { url:`vintage/stoneisland`, label: "stoneisland", icon: "Stone Island" },
    { url:`vintage/ralphlauren`, label: "ralphlauren", icon: "Ralph lauren" },
    { url:`vintage/burberry`, label: "burberry", icon: "Burberry" },
    { url:`vintage/arcteryx`, label: "Arc’teryx", icon: "Arc’teryx" },
];

export default function BrandLogoSection() {
    return (
        <div className={`py-12 mt-12  mb-12 bg-white`}>
            <div className={`xl:container mx-auto p-4 lg:p-8 `}>
                {/* Grid */}

                <div className="gap-6">
                    <SectionHeaderSecondary headline='Beliebte Vintage Marken' subline='Entdecke ikonische Vintage-Styles von bekanten Marken wie Adidas, Nike, Fila, Puma, Patgonia, Levis, Stüssy, The North Face.' />
                    <div className="space-y-6 lg:space-y-8">
                        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                            {categories.map((cat, index) => (
                            <a
                                key={index}
                                href={cat.url}
                                className="text-lg md:text-2xl font-bold uppercase tracking-tight text-vintage-secondary/40 hover:text-vintage-primary transition-colors duration-300"
                                aria-label={cat.label}
                            >
                                {cat.label}
                            </a>
                            ))}
                        </div>
                    </div>
                    {/* End Col */}
                </div>
            </div>
        </div>
    )
}

import Link from "next/link";

export default function SeoFooter() {
    return (
        <section className="bg-vintage-silverGray border-t border-gray-50">
            <div className={` xl:container px-4 py-12 mx-auto `}>
                {/* Title */}
                <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
                    <h2 className="text-2xl font-bold md:text-3xl md:leading-tight text-vintage-darkGray">
                        Finde Vintage- & Second-Hand Mode aus verschiedenen Shops
                    </h2>
                </div>
                {/* End Title */}
                <div className="mx-auto">
                    {/* Grid */}
                    <div className="grid sm:grid-cols-2 gap-6 md:gap-12">
                        <div>
                            <h2 className="text-lg font-semibold text-vintage-darkGray">
                                Vintage- & Second-Hand-Mode entdecken
                            </h2>
                            <p className="mt-2 text-vintage-darkGray">
                                Vintagefindr ist deine Suchmaschine für Vintage-Mode, Streetwear und Second-Hand.
                                Wir durchsuchen verschiedene Vintage-Shops und bündeln deren Angebote für dich. Ob Retro-Sneaker von Nike, klassische Adidas-Jacken oder Workwear von Carhartt – bei uns findest du Produkte aus vielen Shops an einem Ort.                            </p>
                            <ul className="flex flex-col lg:flex-row text-sm gap-2 mt-2">
                                <li><p className="text-vintage-darkGray font-medium">Marken:</p></li>
                                <li className="m-0"><Link href="/vintage/adidas" className="font-medium underline text-vintage-darkGray">Adidas</Link></li>
                                <li className="m-0"><Link href="/vintage/nike" className="font-medium underline text-vintage-darkGray">Nike</Link></li>
                                <li className="m-0"><Link href="/vintage/fila" className="font-medium underline text-vintage-darkGray">Fila</Link></li>
                                <li className="m-0"><Link href="/vintage/puma" className="font-medium underline text-vintage-darkGray">Puma</Link></li>
                            </ul>
                        </div>
                        {/* End Col */}

                        <div>
                            <h2 className="text-lg font-semibold text-vintage-darkGray">
                                Vintage Styles aus den 80ern, 90ern & der Y2K-Ära
                            </h2>
                            <p className="mt-2 text-vintage-darkGray">
                                Du magst den Look der 80er, 90er oder Y2K-Mode? Auf vintagefindr gibt es unterschiedliche Styles aus vergangenen Jahrzehnten. Die angebundenen Shops bieten Vintage-Mode in verschiedenen Kategorien und Preislagen.
                            </p>
                            <ul className="flex flex-col lg:flex-row text-sm gap-2 mt-2">
                                <li><p className="text-vintage-darkGray font-medium">Beliebte Kategorien:</p></li>
                                <li><Link href="/vintage/jacken" className="font-medium underline">Vintage Jacken</Link></li>
                                <li><Link href="/vintage/sneaker" className="font-medium underline">Vintage Sneaker</Link></li>
                                <li><Link href="/vintage/y2k" className="font-medium underline">Y2K Mode</Link></li>
                                <li><Link href="/vintage/sport/fussballtrikots" className="font-medium underline">Vintage Trikots</Link></li>
                            </ul>
                        </div>
                        {/* End Col */}

                        <div>
                            <h2 className="text-lg font-semibold text-vintage-darkGray">
                                Nachhaltig gedacht. Zeitlos getragen.
                            </h2>
                            <p className="mt-2 text-vintage-darkGray">
                                Vintage- und Second-Hand-Mode steht für die Weiterverwendung bestehender Kleidung. Dadurch kann der Bedarf an Neuproduktion reduziert und der Lebenszyklus von Mode verlängert werden. Von Fleece-Jacken über Fußball-Trikots bis hin zu Baggy Jeans – entdecke Mode aus unterschiedlichen Epochen.                            </p>
                            <ul className="flex flex-col lg:flex-row text-sm gap-2 mt-2">
                                <li><p className="text-vintage-darkGray font-medium">Beliebte Marken:</p></li>
                                <li><Link href="/vintage/adidas" className="font-medium underline">Adidas</Link></li>
                                <li><Link href="/vintage/nike" className="font-medium underline">Nike</Link></li>
                                <li><Link href="/vintage/fila" className="font-medium underline">Fila</Link></li>
                                <li><Link href="/vintage/puma" className="font-medium underline">Puma</Link></li>
                            </ul>
                        </div>
                        {/* End Col */}

                        <div>
                            <h2 className="text-lg font-semibold text-vintage-darkGray">
                                Suchst du nachhaltige Mode mit Style?
                            </h2>
                            <p className="mt-2 text-vintage-darkGray">
                                Entdecke verschiedene Vintage-Kategorien und finde passende Produkte aus vielen Vintage- und Second-Hand-Shops.
                            </p>

                            <ul className="flex flex-col lg:flex-row text-sm gap-2 mt-2">
                                <li><p className="text-vintage-darkGray font-medium">Vintage Styles:</p></li>
                                <li><Link href="/vintage/jacken" className="font-medium underline">Jacken</Link></li>
                                <li><Link href="/vintage/sneaker" className="font-medium underline">Sneaker</Link></li>
                                <li><Link href="/vintage/sport/fussballtrikots" className="font-medium underline">Trikots</Link></li>
                                <li><Link href="/vintage/oberteile/shirts" className="font-medium underline">Shirts</Link></li>
                                <li><Link href="/vintage/y2k" className="font-medium underline">Y2K</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

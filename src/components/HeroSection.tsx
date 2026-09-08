import ButtonPrimary from "./ui/ButtonPrimary";
import { SoccerBanner } from "./icons";
import { routes } from "@/constant/routes";

type HeroProps = {
  onDiscover?: () => void;
  gridImageSrc?: string; // z. B. "/grid-image.png"
};

interface ClothingItem {
  id: number;
  name: string;
  icon: string;
  size: 'small' | 'large';
  class?: string;
}

const clothingItems: ClothingItem[] = [
  { id: 1, name: 'Trikot', icon: "https://vintagefinder.b-cdn.net/categories/icons_skate.png?class=categories", size: 'small', class: "w-[150px]" },
  { id: 2, name: 'Tank Top', icon: "", size: 'large' },
  { id: 3, name: 'Steppjacke', icon: "https://vintagefinder.b-cdn.net/categories/icons_soccer.png?class=categories", size: 'large', class: "w-[150px]"  },
  { id: 4, name: 'Hoodie', icon: "https://vintagefinder.b-cdn.net/categories/icons_pullover.png?class=categories", size: 'small', class: "w-[150px] relative top-[5px]"  },
  { id: 5, name: 'Langarmshirt', icon: "https://vintagefinder.b-cdn.net/categories/icons_fleece.png?class=categories", size: 'small', class: "w-[87%] relative -top-[20px]"  },
  { id: 6, name: 'T-Shirt', icon: "https://vintagefinder.b-cdn.net/categories/icons_jacke.png?class=categories", size: 'large', class: "w-[85%]"  },
  { id: 7, name: 'Pufferjacke', icon: "https://vintagefinder.b-cdn.net/categories/icons_skate.png?class=categories", size: 'large', class: "w-[110px]"  },
  { id: 8, name: 'Jacke', icon: "https://vintagefinder.b-cdn.net/categories/icons_hemden.png?class=categories", size: 'small', class: "w-[120px]"  },
  { id: 9, name: 'Langarmshirt', icon: "https://vintagefinder.b-cdn.net/categories/icons_workwear.png?class=categories", size: 'small', class: "w-[120px]"  },
  { id: 10, name: 'T-Shirt', icon: "", size: 'large', class: "w-[88%]"  },
  { id: 11, name: 'Pufferjacke', icon: "", size: 'large', class: "w-[88%]"  },
  { id: 12, name: 'Jacke', icon: "", size: 'small', class: "w-[88%]"  },
];

const sizeClasses: Record<ClothingItem['size'], string> = {
  small: 'h-[200px]',
  large: 'h-[230px]',
};

export default function Hero({ gridImageSrc: _gridImageSrc = "/hero-fade.png" }: HeroProps) {
  return (
    <section className="relative bg-vintage-silverGray max-h-[490px] overflow-hidden ">
      <div className="xl:container mx-auto px-4 py-8">
        <div className="lg:grid items-center gap-10 md:grid-cols-[45%_auto] relative -top-px">
          {/* Left: Text */}
          <div>
          
            <p className="text-xs uppercase lg:text-sm font-bold  tracking-[0.2em] text-vintage-primary mb-3">
              Entdecke das besondere
            </p>

            <h1 className="font-playfair uppercase text-[62px] xl:text-[62px] leading-[1.15] tracking-tight text-vintage-darkGray mb-4">
              Vintage Mode & <span className="lg:block">Second Hand.</span>
            </h1>

            <p className="xl:mt-2 mb-4 xl:mb-6 max-w-2xl text-sm lg:text-[16px] bg-transparent text-vintage-secondary leading-relaxed">
              Entdecke Vintage Mode, Second Hand Kleidung und die neuesten Vintage Drops aus vielen Vintage Shops. Finde Jacken, Jeans, Hoodies, Sneaker, Streetwear und Retro Kleidung auf VintageFindr – nachhaltig, zeitlos und individuell.            </p>
            {/* Button mit abgesetztem Hintergrund */}
            <div className="flex gap-5 flex-col lg:flex-row">
              <ButtonPrimary text={"Jetzt Entdecken"} size={"MEDIUM"} href={"/vintage"}  />
              <ButtonPrimary text={"Neueste Drops"} variant="INVERT" size={"MEDIUM"} href={routes.newDrop}  />
            </div>

          </div>

          {/* Right: Bild — hidden on mobile via CSS, no JS needed */}
          <div className="hidden lg:block relative max-w-[650px] justify-self-end">
              <img className="max-h-[380px] w-full object-cover rounded-2xl shadow-[0px_0px_4px_1px_rgba(0,_0,_0,_0.1)]" src="https://vintagefinder.b-cdn.net/image/hero_image_startseite.jpg?class=blockimage" />
          </div>
        </div>
      </div>
    </section>
  );
}

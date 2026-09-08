import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeSearchOverlay } from "@/components/HomeSearchOverlay";

export default function RatgeberLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <HomeSearchOverlay />
      {children}
      <Footer partner />
    </>
  );
}

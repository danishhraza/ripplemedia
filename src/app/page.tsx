import { HeroSection } from "@/components/hero-section";
import { SelectedWorkSection } from "@/components/selected-work-section";
import { ServicesSection } from "@/components/services-section";
import { FloatingIconsSection } from "@/components/floating-icons-section";
import Pricing from "@/components/pricing";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <SelectedWorkSection />
      <ServicesSection />
      <FloatingIconsSection />
      <Pricing />
    </div>
  );
}

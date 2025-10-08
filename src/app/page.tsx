import { HeroSection } from "@/components/hero-section";
import { ComputerVideoSection } from "@/components/computer-video-section";
import { SelectedWorkSection } from "@/components/selected-work-section";
import { ServicesSection } from "@/components/services-section";
import { FloatingIconsSection } from "@/components/floating-icons-section";
import Pricing from "@/components/pricing";
import { WaterWaveSection } from "@/components/water-wave-section";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ComputerVideoSection />
      <SelectedWorkSection />
      <ServicesSection />
      <FloatingIconsSection />
      <Pricing />
      <WaterWaveSection />
    </div>
  );
}

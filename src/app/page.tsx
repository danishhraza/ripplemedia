import { HeroSection } from "@/components/hero-section";
import { ComputerVideoSection } from "@/components/computer-video-section";
import { SelectedWorkSection } from "@/components/selected-work-section";
import { FloatingIconsSection } from "@/components/floating-icons-section";
import Pricing from "@/components/pricing";
import WaterFooter from "@/components/water-footer/WaterFooter";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ComputerVideoSection />
      <SelectedWorkSection />
      <FloatingIconsSection />
      <Pricing />
      <WaterFooter />
    </div>
  );
}

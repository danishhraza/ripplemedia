import { HeroSection } from "@/components/hero-section";
import { SelectedWorkSection } from "@/components/selected-work-section";
import { ServicesSection } from "@/components/services-section";
import { FloatingIconsSection } from "@/components/floating-icons-section";

export default function Home() {
  return (
    <div className="min-h-screen ">
      <HeroSection />
      <SelectedWorkSection />
      <ServicesSection />
      <FloatingIconsSection />
    </div>
  );
}

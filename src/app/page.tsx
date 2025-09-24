import { HeroSection } from "@/components/hero-section";
import { SelectedWorkSection } from "@/components/selected-work-section";
import { ServicesSection } from "@/components/services-section";

export default function Home() {
  return (
    <div className="min-h-screen ">
      <HeroSection />
      <SelectedWorkSection />
      <ServicesSection />
    </div>
  );
}

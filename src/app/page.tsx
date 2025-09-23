import { HeroSection } from "@/components/hero-section";
import { SelectedWorkSection } from "@/components/selected-work-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <SelectedWorkSection />
    </div>
  );
}

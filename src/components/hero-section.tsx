"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";



export const HeroSection: React.FC = () => {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-svh bg-primary relative overflow-hidden">
      {/* Grid Pattern - Placed above video/vignette for visibility */}
      <div className="absolute inset-0 z-[3]">
        <BackgroundRippleEffect />
      </div>

      {/* Background Video Layer (above green bg, below grid) */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/videos/banner.MOV" />
        </video>
      </div>

      {/* Primary vignette overlay above video, below grid */}
      <div className="absolute inset-0 z-[2] pointer-events-none vignette-primary opacity-50 md:opacity-70" />




      {/* Top Bar */}
      <div className="absolute top-8 left-4 right-4 z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-black bg-primary uppercase text-sm font-poppins tracking-wider">
                Based in Austin, TX
              </span>
            </div>
            {/* Mobile-only contact button under location */}
            <Button
              onClick={scrollToPricing}
              className="md:hidden bg-primary text-black border-none hover:bg-primary/70 uppercase text-sm font-poppins tracking-wider z-20 w-max"
            >
              Book Now
            </Button>
          </div>

          {/* Desktop/tablet contact button on the right */}
          <Button
            onClick={scrollToPricing}
            className="hidden md:inline-flex bg-primary text-black border-none hover:bg-primary/70 uppercase text-sm font-poppins tracking-wider z-20"
          >
            Book Now
          </Button>
        </div>
      </div>

      {/* Main Title - Bottom Left (non-selectable branding) */}
      <div className="absolute bottom-8 left-6 md:left-8 z-10 text-left select-none">
        <h1 className="font-coolvetica text-8xl md:text-9xl lg:text-[14rem] text-primary font-normal tracking-wider leading-none italic">
          RIPPLE
        </h1>
        <h2 className="font-coolvetica text-5xl md:text-7xl lg:text-9xl text-card  font-normal tracking-wider leading-none md:-mt-6 text-right italic">
          MEDIA
        </h2>
      </div>




    </div>
  );
};

"use client";
import React from "react";
import { Button } from "@/components/ui/button";

/* Utilitarian hero: the footage carries the frame, so the only chrome is a
   hairline registration border and mono data strips. Legibility comes from a
   directional scrim rather than a grid or a coloured vignette. */

const SERVICES = [
  { n: "01", label: "Film" },
  { n: "02", label: "Photo" },
  { n: "03", label: "Edit" },
  { n: "04", label: "Web" },
];

export const HeroSection: React.FC = () => {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-svh bg-black relative overflow-hidden">
      {/* Background video */}
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

      {/* Directional scrim: heavy at the bottom-left where the type sits */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.12) 52%, rgba(0,0,0,0) 70%), linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0) 48%)",
        }}
      />

      {/* Registration frame with two lime crop marks */}
      <div className="absolute inset-3 md:inset-[22px] z-[3] pointer-events-none border border-white/20">
        <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-primary" />
        <div className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-primary" />
      </div>

      {/* Spec strip + booking */}
      <div className="absolute top-8 md:top-11 left-7 md:left-11 right-7 md:right-11 z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-stretch font-mono uppercase text-[10px] md:text-[10.5px] tracking-[0.16em] text-white/85">
            <span className="pr-3 md:pr-3.5 text-primary">Ripple Media</span>
            <span className="px-3 md:px-3.5 py-1.5 border-l border-white/20">Austin, TX</span>
            <span className="hidden sm:inline px-3 md:px-3.5 py-1.5 border-l border-white/20">
              30.2672&deg;N 97.7431&deg;W
            </span>
          </div>

          <Button
            onClick={scrollToPricing}
            className="bg-primary text-black border-none rounded-none hover:bg-primary/80 font-mono uppercase text-[11px] tracking-[0.16em] px-5 py-5 gap-3"
          >
            Book now
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none" aria-hidden="true">
              <path d="M0 4.5h9M6 1l3.5 3.5L6 8" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Scroll rail */}
      <div
        className="hidden lg:flex absolute right-11 top-1/2 z-10 items-center gap-3.5 font-mono uppercase text-[10px] tracking-[0.16em] text-white/80"
        style={{
          writingMode: "vertical-rl",
          transform: "translateY(-50%) rotate(180deg)",
          textShadow: "0 0 10px rgba(0,0,0,0.85)",
        }}
        aria-hidden="true"
      >
        <span className="block w-px h-14 bg-white/45" />
        Scroll
        <span className="block w-px h-14 bg-white/45" />
      </div>

      {/* Wordmark lockup */}
      <div className="absolute left-7 md:left-11 right-7 md:right-11 bottom-24 md:bottom-28 z-10">
        <div className="flex items-center gap-3.5 mb-3.5">
          <span className="font-mono uppercase text-[10px] md:text-[10.5px] tracking-[0.16em] text-primary">
            Fig. 01 &mdash; Reel
          </span>
          <span className="flex-1 max-w-[230px] h-px bg-white/25" />
        </div>

        <h1 className="select-none font-coolvetica italic font-normal text-primary leading-[0.82] tracking-[0.02em] text-[clamp(3.25rem,11.5vw,10.375rem)]">
          RIPPLE
          <span className="block text-white">MEDIA</span>
        </h1>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-10 mt-5">
          <p className="font-mono uppercase text-[10px] md:text-xs tracking-[0.14em] md:tracking-[0.2em] leading-[1.9] text-white/90 md:max-w-[22rem]">
            Film, photo, edit and development
            <br />
            for small brands and individuals.
          </p>

          <div className="flex gap-6 md:gap-[34px] font-mono uppercase text-[10px] md:text-[10.5px] tracking-[0.16em] text-white/70">
            {SERVICES.map(({ n, label }) => (
              <div key={n}>
                <b className="block font-normal text-primary mb-1.5">{n}</b>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status rule */}
      <div className="absolute left-7 md:left-11 right-7 md:right-11 bottom-8 md:bottom-11 z-10 flex items-center justify-between border-t border-white/20 pt-3 font-mono uppercase text-[10px] tracking-[0.16em] text-white/55">
        <span className="flex items-center gap-2">
          <i className="w-1.5 h-1.5 bg-primary not-italic" />
          Available for new projects
        </span>
        <span className="hidden sm:inline">Austin, TX &mdash; Remote worldwide</span>
      </div>
    </div>
  );
};

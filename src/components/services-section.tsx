"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "motion/react";

type Service = {
  key: string;
  title: string;
  items: string[]; // bullets shown inside the card
};

const services: Service[] = [
  {
    key: "videography",
    title: "Videography",
    items: ["Script • Shoot • Edit", "Color • Sound Design", "Multi‑format Delivery"],
  },
  {
    key: "short-reels",
    title: "Short Reels",
    items: ["Hooks & Storylines", "Fast Turnarounds", "Platform‑native Exports"],
  },
  {
    key: "photography",
    title: "Photography / Stills",
    items: ["Product & Lifestyle", "Retouching", "Multi‑crop Delivery"],
  },
  {
    key: "development",
    title: "Development",
    items: ["Next.js / React", "SEO • CWV", "Headless / CMS"],
  },
  {
    key: "smm",
    title: "Social Media Management",
    items: ["Planning & Publishing", "Community", "Analytics"],
  },
];

export const ServicesSection: React.FC = () => {
  const railRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Simple horizontal scroll with fixed boundary detection
  useEffect(() => {
    const el = railRef.current;
    const section = sectionRef.current;
    if (el && section) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        
        // Check if section is in viewport
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Only activate when section is well within viewport
        const isSectionActive = rect.top <= viewportHeight * 0.2 && rect.bottom >= viewportHeight * 0.8;
        
        if (!isSectionActive) {
          return;
        }
        
        // Check horizontal boundaries with proper calculation
        const scrollLeft = el.scrollLeft;
        const scrollWidth = el.scrollWidth;
        const clientWidth = el.clientWidth;
        const maxScroll = scrollWidth - clientWidth;
        
        const isAtStart = scrollLeft <= 2;
        const isAtEnd = scrollLeft >= maxScroll - 2;
        
        // At start boundary, allow scrolling up to previous section
        if (isAtStart && e.deltaY < 0) {
          return;
        }
        
        // At end boundary, allow scrolling down to next section  
        if (isAtEnd && e.deltaY > 0) {
          return;
        }
        
        // In middle or scrolling into the content - do horizontal scroll
        e.preventDefault();
        el.scrollBy(e.deltaY * 0.5, 0);
      };
      
      document.addEventListener("wheel", onWheel, { passive: false });
      return () => document.removeEventListener("wheel", onWheel);
    }
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden md:h-svh">
      {/* Stronger full-width primary gradient background (edge-to-edge) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 80% at 30% 50%, rgba(208,254,23,0.65) 0%, rgba(208,254,23,0.35) 40%, transparent 70%), radial-gradient(60% 60% at 70% 30%, rgba(208,254,23,0.45) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* Heading */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Our Service</p>
          <h2 className="mt-2 text-3xl md:text-6xl font-semibold text-neutral-900 leading-tight">
            We’re a creative team building services people remember
          </h2>
        </div>

      </div>

      {/* Full-bleed horizontal scroller (edge-to-edge across viewport) */}
      <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] px-6 py-4">
        
        <motion.div
          ref={railRef}
          className="flex gap-6 overflow-x-scroll overflow-y-hidden no-scrollbar snap-x snap-mandatory pb-6 overscroll-x-contain scroll-smooth px-2"
          style={{ scrollBehavior: 'smooth' }}
          initial={{ x: -40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {services.map((svc) => (
              <motion.div
                key={svc.key}
                className="snap-center min-w-[85%] sm:min-w-[70%] md:min-w-[420px] min-h-[240px] md:min-h-[280px] bg-white/70 backdrop-blur rounded-3xl border border-secondary shadow-[0_0_0_1px_rgba(0,0,0,0.04)] p-6 md:p-8 relative flex-shrink-0 hover:border-primary transition-colors duration-300"
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                {/* subtle inner gradient outline to mimic reference */}
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(120% 80% at 100% 0%, hsl(var(--primary)/0.08) 0%, transparent 60%)",
                    mask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
                    WebkitMask:
                      "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
                    padding: "1px",
                    boxSizing: "border-box",
                  }}
                />

                <h3 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-4">
                  {svc.title}
                </h3>

                <ul className="space-y-2 md:space-y-2 text-neutral-700">
                  {svc.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 group"
                    >
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/80 group-hover:bg-primary" />
                      <span className="text-sm md:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
      </div>
    </section>
  );
};

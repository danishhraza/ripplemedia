"use client";
import React from "react";
import { GrainOverlay } from "./ui/grain-overlay";
import { motion } from "motion/react";

/*
  Adjustments made per request:
  - Added a bit more vertical spacing between lines (using gap + consistent leading)
  - Moved computer slightly further left & up
  - Video now sits BEHIND the computer image (expects PNG with transparent screen)
  - Added protective wrapper with relative sizing so percentages keep alignment on resize
  - Provided a safe aspect-driven scale with clamp widths
*/

const lineClass = "font-normal text-black tracking-tight leading-[1] md:leading-[0.9]"; // slightly more line height

export const ComputerVideoSection: React.FC = () => {
  return (
    <section className="relative bg-neutral-100 py-24 overflow-hidden select-none">
      {/* SVG Grain overlay (fallback removed CSS noise for reliability) */}
  <GrainOverlay opacity={0.18} duration="11s" freqValues=".60;.63;.65;.67;.70;.66;.63;.60" animateSeed debugVisible />
  <div className="relative z-10 max-w-[1500px] mx-auto px-4">
        {/* TEXT BLOCK */}
  <div className="flex flex-col items-center text-center gap-[0.6em] md:gap-[1em]">
          <motion.p
            className={`text-[clamp(3.4rem,8.4vw,9.3rem)] ${lineClass} relative left-[9.5%] md:left-[-5.5%]`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            We are an
          </motion.p>
          <motion.p
            className={`text-[clamp(3.5rem,11vw,12rem)] font-editorial italic leading-[1] text-black relative -left-[5.5%] md:left-[4.5%]`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.05 }}
          >
            independent
          </motion.p>
          {/* Inline computer for mobile only (< md) */}
          <motion.div
            className="relative block md:hidden mx-auto my-[0.2em] w-[230px]"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            {/* Video behind */}
            <div className="absolute inset-0">
              <div
                className="absolute overflow-hidden"
                style={{
                  top: '10.5%',
                  left: '12.2%',
                  width: '57%',
                  height: '42.5%'
                }}
              >
                <video
                  className="w-full h-full object-cover origin-center scale-[0.97] translate-y-[-2%]"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/videos/banner.MOV" />
                </video>
              </div>
            </div>
            <img
              src="/images/computer.PNG"
              alt="Vintage computer"
              className="relative z-10 w-full h-auto drop-shadow-sm"
              draggable={false}
            />
          </motion.div>
          <motion.p
            className={`text-[clamp(3.9rem,9.8vw,11rem)] ${lineClass} relative left-[9.5%] md:left-[1.75%]`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            CREATIVE
          </motion.p>
          <motion.p
            className={`text-[clamp(3.3rem,8.4vw,9rem)] ${lineClass} relative -left-[9.5%] md:left-[-10.75%]`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.15 }}
          >
            Agency
          </motion.p>
        </div>

        {/* COMPUTER (absolute overlay) */}
        <motion.div
          className="pointer-events-none hidden md:block absolute top-1/2 left-1 -translate-y-[58%] -translate-x-[60%] md:translate-x-[22%]"
          initial={{ opacity: 0, scale: 0.82, y: -25 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.16,0.84,0.44,1] }}
        >
          {/* Wrapper maintains aspect; percentages inside remain stable on resize */}
          <div className="relative w-fluid">
            {/* VIDEO BELOW (behind) */}
            <div className="absolute inset-0">
              {/* Screen area sub-wrapper so we can shift & scale without leaking */}
              <div
                className="absolute overflow-hidden"
                /* Percentages tuned to align w/ transparent screen opening */
                style={{
                  top: "10.2%",
                  left: "12.2%",
                  width: "57.3%",
                  height: "42.6%",
                }}
              >
                <video
                  className="w-full h-full object-cover origin-center scale-[0.97] translate-y-[-2%]"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/videos/banner.MOV" />
                </video>
              </div>
            </div>
            {/* COMPUTER IMAGE ABOVE */}
            <img
              src="/images/computer.PNG"
              alt="Vintage computer"
              className="relative z-10 w-full h-auto drop-shadow-sm select-none"
              draggable={false}
            />
          </div>
        </motion.div>

        {/* ACTION REMOVED per request */}
      </div>
    </section>
  );
};
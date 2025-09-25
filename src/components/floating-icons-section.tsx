"use client";

import React from "react";
import { motion } from "motion/react";
import Image from "next/image";

const icons = [
  { src: "/icons/envato-graphic-4414ab3c-b43e-41e5-9040-468eb7a07e63.png", alt: "Design Icon 2" },
  {src: "/icons/envato-graphic-04ff51a2-8829-48f8-b4e9-613f978301fc.png", alt: "Microphone Icon"},
  { src: "/icons/envato-graphic-2bf5e420-f0c1-4e5a-b230-af8aec77fe66.png", alt: "Design Icon 1" },
  { src: "/icons/envato-graphic-c4337602-437e-4095-9335-00b3a9ef3e24.png", alt: "Design Icon 3" },
];

// Container animation for staggered entrance
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Individual icon entrance animation
const iconVariants = {
  hidden: {
    y: 100,
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export const FloatingIconsSection: React.FC = () => {
  return (
    <section className="relative py-6 md:py-16 bg-primary mx-4 md:mx-36 rounded-3xl overflow-hidden mb-11">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* Section Header */}
        <div className="text-left md:text-center mb-10 p-6">
          <motion.h2
            className="text-3xl md:text-4xl font-semibold text-black"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Pro Equipment For <span className="italic font-bold md:text-black/75">Pro Work!</span>
          </motion.h2>
        </div>

        {/* Floating Icons Grid */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-12 md:gap-16 px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {icons.map((icon, index) => (
            <motion.div
              key={index}
              className="relative flex items-center justify-center"
              variants={iconVariants}
              custom={index}
            >
              <motion.div
                className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 cursor-pointer"
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 2, -2, 0],
                }}
                whileHover={{
                  scale: 1.15,
                  y: -16,
                }}
                whileTap={{ 
                  scale: 0.9,
                }}
                transition={{
                  // Hover/unhover transitions
                  scale: { duration: 0.3, ease: "easeOut" },
                  y: { 
                    duration: 3 + index * 0.5, 
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  },
                  rotate: {
                    duration: 3 + index * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }
                }}
              >
                {/* Enhanced glow effect */}
                <motion.div 
                  className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0"
                  whileHover={{ 
                    opacity: 0.6,
                  }}
                  transition={{ duration: 0.2 }}
                />
                
                {/* Icon container */}
                <div className="relative w-full h-full transition-shadow duration-300">
                  <Image
                    src={icon.src}
                    alt={icon.alt}
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Decorative floating elements */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-secondary/50 rounded-full animate-pulse" />
        <div className="absolute top-32 right-20 w-1 h-1 bg-secondary/50 rounded-full animate-ping" />
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-secondary/20 rounded-full animate-bounce" />
      </div>
    </section>
  );
};
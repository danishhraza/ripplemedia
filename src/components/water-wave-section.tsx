"use client";

import React from "react";
import { motion } from "motion/react";

export const WaterWaveSection: React.FC = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-white to-neutral-100">
      {/* SVG Water Wave Animation */}
      <div className="absolute inset-0">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Water gradient */}
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(208, 254, 23, 0.3)" />
              <stop offset="30%" stopColor="rgba(134, 239, 172, 0.6)" />
              <stop offset="70%" stopColor="rgba(34, 197, 94, 0.8)" />
              <stop offset="100%" stopColor="rgba(22, 163, 74, 1)" />
            </linearGradient>
            
            {/* Wave border gradient */}
            <linearGradient id="waveBorder" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(208, 254, 23, 0.9)" />
              <stop offset="50%" stopColor="rgba(134, 239, 172, 0.7)" />
              <stop offset="100%" stopColor="rgba(34, 197, 94, 0.5)" />
            </linearGradient>

            {/* Displacement filter for text distortion */}
            <filter id="displacement" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence baseFrequency="0.02 0.1" numOctaves="3" seed="2" />
              <feDisplacementMap in="SourceGraphic" scale="8" />
            </filter>
          </defs>

          {/* Animated Wave Paths */}
          <motion.path
            d="M0,400 C300,350 600,450 900,400 C1050,375 1200,425 1200,400 L1200,800 L0,800 Z"
            fill="url(#waterGradient)"
            animate={{
              d: [
                "M0,400 C300,350 600,450 900,400 C1050,375 1200,425 1200,400 L1200,800 L0,800 Z",
                "M0,420 C300,370 600,470 900,420 C1050,395 1200,445 1200,420 L1200,800 L0,800 Z",
                "M0,400 C300,330 600,430 900,380 C1050,355 1200,405 1200,380 L1200,800 L0,800 Z",
                "M0,400 C300,350 600,450 900,400 C1050,375 1200,425 1200,400 L1200,800 L0,800 Z"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Secondary wave for depth */}
          <motion.path
            d="M0,450 C200,420 400,480 600,450 C800,420 1000,480 1200,450 L1200,800 L0,800 Z"
            fill="url(#waterGradient)"
            opacity="0.7"
            animate={{
              d: [
                "M0,450 C200,420 400,480 600,450 C800,420 1000,480 1200,450 L1200,800 L0,800 Z",
                "M0,470 C200,440 400,500 600,470 C800,440 1000,500 1200,470 L1200,800 L0,800 Z",
                "M0,430 C200,400 400,460 600,430 C800,400 1000,460 1200,430 L1200,800 L0,800 Z",
                "M0,450 C200,420 400,480 600,450 C800,420 1000,480 1200,450 L1200,800 L0,800 Z"
              ]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />

          {/* Wave border/foam effect */}
          <motion.path
            d="M0,400 C300,350 600,450 900,400 C1050,375 1200,425 1200,400"
            fill="none"
            stroke="url(#waveBorder)"
            strokeWidth="4"
            animate={{
              d: [
                "M0,400 C300,350 600,450 900,400 C1050,375 1200,425 1200,400",
                "M0,420 C300,370 600,470 900,420 C1050,395 1200,445 1200,420",
                "M0,400 C300,330 600,430 900,380 C1050,355 1200,405 1200,380",
                "M0,400 C300,350 600,450 900,400 C1050,375 1200,425 1200,400"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>
      </div>

      {/* Content above water */}
      <div className="relative z-10 flex flex-col justify-center min-h-[60vh] px-6 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Dive Into Your
            <br />
            <span className="bg-gradient-to-r from-green-600 to-primary bg-clip-text text-transparent">
              Creative Vision
            </span>
          </motion.h2>
          
          <motion.p
            className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Let&apos;s create something extraordinary together. From concept to completion, 
            we&apos;ll make waves in your industry.
          </motion.p>

          <motion.button
            className="bg-primary hover:bg-primary/90 text-black font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Your Project
          </motion.button>
        </div>
      </div>

      {/* Underwater Content with Displacement Effect */}
      <div className="absolute bottom-0 left-0 right-0 z-5">
        <div className="relative h-96 bg-gradient-to-t from-green-800/80 to-transparent">
          {/* Underwater text with distortion */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-center text-white/60"
              style={{ filter: "url(#displacement)" }}
              animate={{
                filter: [
                  "url(#displacement)",
                  "hue-rotate(10deg) url(#displacement)",
                  "hue-rotate(-10deg) url(#displacement)",
                  "url(#displacement)"
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <h3 className="text-2xl md:text-4xl font-bold mb-4 opacity-70">
                Submerged in Excellence
              </h3>
              <p className="text-sm md:text-lg opacity-50 max-w-md mx-auto">
                Every project flows with precision and creativity, creating ripples of success
              </p>
            </motion.div>
          </div>

          {/* Floating bubbles effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white/20 rounded-full"
                style={{
                  width: Math.random() * 10 + 5,
                  height: Math.random() * 10 + 5,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, -400],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Contact info overlay */}
      <div className="absolute bottom-8 left-8 z-20">
        <motion.div
          className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h4 className="font-semibold text-neutral-900 mb-2">Ready to make waves?</h4>
          <p className="text-sm text-neutral-600 mb-3">Get in touch today</p>
          <div className="flex flex-col gap-1 text-sm">
            <a href="mailto:hello@ripplemedia.com" className="text-primary hover:underline">
              hello@ripplemedia.com
            </a>
            <a href="tel:+1234567890" className="text-primary hover:underline">
              +1 (234) 567-890
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import Spline from "@splinetool/react-spline";



export const HeroSection: React.FC = () => {
  return (
    <div className="h-svh bg-primary relative overflow-hidden">
      <BackgroundRippleEffect />
      
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
      <div className="absolute inset-0 z-[2] pointer-events-none vignette-primary opacity-30 md:opacity-70" />


      
      
      {/* Top Bar */}
      <div className="absolute top-8 left-4 right-4 z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-sidebar-foreground rounded-full"></div>
              <span className="text-sidebar-foreground uppercase text-sm font-poppins tracking-wider">
                Based in Austin, TX
              </span>
            </div>
            {/* Mobile-only contact button under location */}
            <Button 
              variant="outline" 
              className="md:hidden border-sidebar-foreground text-sidebar-foreground hover:bg-sidebar-foreground hover:text-sidebar uppercase text-sm font-poppins tracking-wider z-20 w-max"
            >
              CONTACT NOW
            </Button>
          </div>

          {/* Desktop/tablet contact button on the right */}
          <Button 
            variant="outline" 
            className="hidden md:inline-flex border-sidebar-foreground text-sidebar-foreground hover:bg-sidebar-foreground hover:text-sidebar uppercase text-sm font-poppins tracking-wider z-20"
          >
            CONTACT NOW
          </Button>
        </div>
      </div>

      {/* Main Title - Bottom Left */}
      <div className="absolute bottom-8 left-6 md:left-8 z-10 text-left">
        <h1 className="font-coolvetica text-8xl md:text-9xl lg:text-[14rem] text-primary font-normal tracking-wider leading-none italic">
          RIPPLE
        </h1>
        <h2 className="font-coolvetica text-5xl md:text-7xl lg:text-9xl text-card  font-normal tracking-wider leading-none md:-mt-6 text-right italic">
          MEDIA
        </h2>
      </div>

      {/* Spline 3D Scene - Right Half (hidden on small screens) */}
      <div className="hidden md:block absolute top-0 right-0 w-1/2 h-full z-10">
        <Spline 
          scene="https://prod.spline.design/fK3RM9r34n-jdzEd/scene.splinecode"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </div>


    </div>
  );
};

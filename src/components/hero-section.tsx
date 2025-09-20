"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import Spline from "@splinetool/react-spline";



export const HeroSection: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary relative">
      <BackgroundRippleEffect />
      

      
      
      {/* Top Bar */}
      <div className="absolute top-8 left-4 right-4 z-10">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-sidebar-foreground rounded-full"></div>
            <span className="text-sidebar-foreground uppercase text-sm font-poppins tracking-wider">
              Based in Austin, TX
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-sidebar-foreground rounded-full"></div>
            <div className="w-1 h-1 bg-sidebar-foreground rounded-full"></div>
          </div>
          
          <Button 
            variant="outline" 
            className="border-sidebar-foreground text-sidebar-foreground hover:bg-sidebar-foreground hover:text-sidebar uppercase text-sm font-poppins tracking-wider z-20"
          >
            CONTACT NOW
          </Button>
        </div>
        
      </div>

      {/* Main Title - Bottom Left */}
      <div className="absolute bottom-8 left-8 z-10 text-left">
        <h1 className="font-coolvetica text-8xl md:text-9xl lg:text-[14rem] text-[#1F2021] font-normal tracking-wider leading-none italic">
          RIPPLE
        </h1>
        <h2 className="font-coolvetica text-6xl md:text-7xl lg:text-9xl text-[#1F2021] font-normal tracking-wider leading-none -mt-4">
          MEDIA
        </h2>
      </div>

      {/* Spline 3D Scene - Right Half */}
      <div className="absolute top-0 right-0 w-1/2 h-full z-10">
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

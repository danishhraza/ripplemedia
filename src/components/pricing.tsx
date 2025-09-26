"use client"
import React from 'react'
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Check, Star } from "lucide-react";

interface PricingCardProps {
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  description: string;
  buttonText: string;
  popular?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  subtitle,
  features,
  description,
  buttonText,
  popular = false
}) => {
  return (
    <div className="relative h-full">
      <div className="relative h-full rounded-2xl border-4 p-4 md:rounded-3xl md:p-6">
        <GlowingEffect
          spread={40}
          glow={popular}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={6}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-8 bg-white/80 backdrop-blur border border-gray-200">
          {/* Popular Badge */}
          {popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-primary text-black px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3" fill="currentColor" />
                Most Popular
              </div>
            </div>
          )}
          
          {/* Header */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900">{title}</h3>
              <p className="text-sm text-neutral-600">{subtitle}</p>
            </div>
            
            <div className="space-y-2">
              <div className="text-4xl font-bold text-neutral-900">
                {price}
                {price !== "Let's Talk" && <span className="text-lg font-normal text-neutral-600">+</span>}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="flex-1 space-y-4">
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-neutral-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-sm text-neutral-600 pt-4 border-t border-gray-200">
              {description}
            </p>
          </div>

          {/* Button */}
          <button className="w-full bg-primary hover:bg-primary/90 text-black font-semibold py-3 px-6 rounded-xl transition-colors">
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

const Pricing: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full mt-20 bg-gradient-to-b from-white to-neutral-50">
      {/* Simple CSS Grid Background */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `
            linear-gradient(rgba(208, 254, 23, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(208, 254, 23, 1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Top fade gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white via-white to-transparent z-10"></div>
      
      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white to-transparent z-10"></div>

      <div className="relative z-50 flex flex-col items-center justify-center min-h-screen px-5">
        {/* Pricing Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-4">
            Choose Your Package
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Professional media services tailored to your needs
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full pt-8">
          <PricingCard
            title="Package 1"
            price="$500"
            subtitle="Short Reels & Photos"
            features={[
              "Short reel creation",
              "Photo editing & retouching", 
              "Professional editing",
              "Multi-format delivery"
            ]}
            description="Best for ads, personal shoots, events and social media content"
            buttonText="Get Started"
          />

          <PricingCard
            title="Package 2" 
            price="$1,000"
            subtitle="Complete Media Package"
            features={[
              "Short reels & long videos",
              "Professional photography",
              "Drone shots & aerial footage",
              "Complete post-production",
              "Color grading & sound design"
            ]}
            description="Best for events, real estate, professional ads and brand content"
            buttonText="Get Started"
            popular={true}
          />

          <PricingCard
            title="Custom Quote"
            price="Let's Talk"
            subtitle="Tailored Solutions"
            features={[
              "Custom video projects",
              "Web development services",
              "Social media management",
              "Brand strategy consultation",
              "Long-term partnerships"
            ]}
            description="For more custom queries, development projects, and comprehensive social media management, reach out to me!"
            buttonText="Contact Me"
          />
        </div>
      </div>
    </div>
  )
}

export default Pricing
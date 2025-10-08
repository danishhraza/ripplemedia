"use client";
import React from "react";

interface GrainOverlayProps {
  /** Opacity of the grain layer (0 - 1). */
  opacity?: number;
  /** Optional className to extend styling */
  className?: string;
  /** baseFrequency animation values; default updated for stronger visibility */
  freqValues?: string;
  /** Duration of one animation cycle */
  duration?: string;
  /** Animate seed for extra variation (true = animate) */
  animateSeed?: boolean;
  /** Blend mode (normal|multiply|overlay|screen) */
  blendMode?: string;
  /** If true, removes blend mode & lifts opacity to be clearly visible */
  debugVisible?: boolean;
}

/**
 * SVG fractal-noise grain overlay.
 * Uses <feTurbulence> with animated baseFrequency for a subtle living texture.
 * More reliable than CSS image noise + blend across browsers and DPRs.
 */
export const GrainOverlay: React.FC<GrainOverlayProps> = ({
  opacity = 0.14,
  className = "",
  freqValues = ".60;.63;.65;.67;.70;.66;.63;.60",
  duration = "10s",
  animateSeed = false,
  blendMode = "multiply",
  debugVisible = false,
}) => {
  const appliedOpacity = debugVisible ? Math.min(opacity * 1.8, 0.4) : opacity;
  const appliedBlend = debugVisible ? "normal" : blendMode;
  return (
    <svg
      className={`pointer-events-none absolute inset-0 w-full h-full [mix-blend-mode:${appliedBlend}] ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      <filter id="grainFilter" x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves={3}
          stitchTiles="stitch"
          seed={2}
        >
          <animate
            attributeName="baseFrequency"
            dur={duration}
            values={freqValues}
            repeatCount="indefinite"
          />
          {animateSeed && (
            <animate
              attributeName="seed"
              dur={duration}
              values="2;3;4;5;6;2"
              repeatCount="indefinite"
            />
          )}
        </feTurbulence>
        <feComponentTransfer>
          <feFuncA type="linear" slope={1} intercept={0} />
        </feComponentTransfer>
      </filter>
      {/* A slight radial mask to soften edges */}
      <defs>
        <radialGradient id="grainFade" r="0.9" cx="0.5" cy="0.5">
          <stop offset="70%" stopColor="white" stopOpacity={1} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </radialGradient>
        <mask id="grainMask">
          <rect width="100%" height="100%" fill="url(#grainFade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" filter="url(#grainFilter)" opacity={appliedOpacity} mask="url(#grainMask)" />
    </svg>
  );
};

export default GrainOverlay;
"use client";

// Drop-in React footer. Requires: npm i three
// The visible text is painted inside the WebGL canvas; the <div> below it holds
// the real, crawlable/selectable markup (visually hidden) for SEO + a11y.

import { useEffect, useRef } from 'react';
import { createWaterFooter } from './water-footer-effect';

export default function WaterFooter({
  headline = 'Stories. In Motion.',
  sub = '@ripplemedia.us',
  height = 'clamp(300px, 70vw, 460px)'
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const fx = createWaterFooter(canvasRef.current, { headline, sub });
    return () => fx.destroy();
  }, [headline, sub]);

  return (
    <footer style={{ position: 'relative', width: '100%', height, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
      <div style={{
        position: 'absolute', width: 1, height: 1, overflow: 'hidden',
        clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', whiteSpace: 'nowrap'
      }}>
        <h2>{headline}</h2>
        <p>{sub}</p>
      </div>
    </footer>
  );
}

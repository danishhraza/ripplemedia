"use client";

// Full-screen liquid intro. Plays once per session, then unmounts itself.
//   0. the screen is already submerged on the very first paint, as an SVG
//      stand-in that covers the wait for the JS bundle and the WebGL context
//   1. the shader cross-fades in underneath it and holds
//   2. the level drops into view with a swell rolling left -> right
//   3. a vortex opens at centre and the water drains off the bottom edge
// Requires: npm i three   (already a dependency of the water footer)

import { useEffect, useRef, useState } from 'react';
import { createLiquidIntro } from './liquid-intro-effect';
import { INTRO_SESSION_KEY } from './intro-key';

// How long the shader takes to fade in over the SVG. The stand-in stays fully
// opaque underneath for all of it, so the water never goes see-through.
const HANDOVER_MS = 300;
// ...then the stand-in dissolves rather than being cut, so that the sliver where
// its waterline and the shader's disagree softens out instead of popping.
const STANDIN_FADE_MS = 220;

// The SVG stand-in works in a 1200 x 1000 box stretched to the viewport, so 1000
// user units == 100vh and the wave maths below reads in percentages.
const VB_W = 1200;
const VB_H = 1000;
const WAVE_PERIOD = 1200;   // one full crest+trough, and the drift loop distance

// Floor under the colour ramp's depth reference. Without it the ramp collapses as
// the surface drains toward zero and the last of the pool washes out to flat
// lime; that deep green is what makes it read as the same water as the footer.
const DEPTH_REF_FLOOR = 0.55;

// A wave surface as a single path: six half-periods laid end to end from -1200 to
// 2400, so a +/-1200 drift never runs out of geometry, then closed off below the
// bottom edge to fill the body of water.
function wavePath(y, amp) {
  const half = WAVE_PERIOD / 2;
  let d = `M${-WAVE_PERIOD},${y} q${half / 2},${-amp} ${half},0`;
  for (let i = 0; i < 5; i++) d += ` t${half},0`;
  return `${d} V${VB_H + 100} H${-WAVE_PERIOD} Z`;
}

const hexToRgb = (h) => {
  const v = parseInt(h.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
const mixHex = (a, b, t) => {
  const [r1, g1, b1] = hexToRgb(a), [r2, g2, b2] = hexToRgb(b);
  const m = (x, y) => Math.round(x + (y - x) * t);
  return `rgb(${m(r1, r2)},${m(g1, g2)},${m(b1, b2)})`;
};

// Mirrors the shader's body ramp exactly — dn = depth / depthRef, then
// mix(shallow, deep, pow(dn, 0.75)) — measured down the part of the screen the
// gradient actually covers, so the stand-in is already the colour the first
// WebGL frame will paint and the cross-fade has nothing to correct.
function bodyStops(shallow, deep, start, bandTop, steps = 7) {
  const out = [];
  for (let i = 0; i < steps; i++) {
    const p = i / (steps - 1);
    const y = bandTop + p * (1 - bandTop);        // 0 = top of viewport, 1 = bottom
    const depth = start - 1 + y;                  // how far under the surface that is
    const dn = Math.min(1, Math.max(0, depth / Math.max(start, 0.001)));
    out.push({ offset: p, color: mixHex(shallow, deep, Math.pow(dn, 0.75)) });
  }
  return out;
}

export default function LiquidIntro({
  startLevel = 106,        // % of viewport under water at load — >100 = fully submerged
  settleLevel = 82,        // % the waterline drops to as it comes into view
  speed = 1.25,            // 1 = base timing, higher = faster
  funnelDepth = 13,        // % depth of the vortex throat
  residue = true,          // droplets clinging to the glass as the surface pulls away
  shallow = '#cbf544',     // colour at the waterline
  deep = '#215020',        // colour in deep water
  once = true,             // true = play only on the first visit of a session
  onDone = undefined       // called when the drain finishes
}) {
  const hostRef = useRef(null);
  const standInRef = useRef(null);
  const canvasRef = useRef(null);
  // Deliberately not seeded from sessionStorage: that is a client-only value, and
  // reading it in the initial state would render the overlay on the server and
  // not on the client. The pre-paint script in the root layout hides this element
  // before it can flash on a repeat visit; the effect below is the real check.
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (gone) return;
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let seen = false;
    try { seen = sessionStorage.getItem(INTRO_SESSION_KEY) === '1'; } catch { /* private mode */ }

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = () => {
      if (once) { try { sessionStorage.setItem(INTRO_SESSION_KEY, '1'); } catch { /* private mode */ } }
      setGone(true);
      onDone && onDone();
    };
    if ((once && seen) || reduced) { finish(); return; }

    let fadeTimer = 0;
    const start = startLevel / 100;
    const settle = settleLevel / 100;
    const depthRefFor = (level) => Math.max(level, DEPTH_REF_FLOOR);

    const fx = createLiquidIntro(canvas, { shallow, deep, surfaceY: start, depthRef: start });
    // No WebGL: there is nothing to draw, so lift the stand-in off rather than
    // cut from a full green screen straight to the page.
    if (fx.supported === false) {
      fx.destroy();
      host.style.opacity = '0';
      fadeTimer = window.setTimeout(finish, HANDOVER_MS);
      return () => clearTimeout(fadeTimer);
    }

    fx.setState({
      shallow, deep, surface: start, depthRef: depthRefFor(start),
      funnel: 0, swirl: 0, crash: 0.05, alpha: 1, residue: 0, sweepX: -1, sweepAmp: 0
    });

    // lock scroll for the length of the intro. Taking the scrollbar away widens
    // the page by its own width and snaps it back when the lock lifts, so pad
    // the body by exactly that much to keep the content underneath still.
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const gutter = window.innerWidth - html.clientWidth;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    function unlock() {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevPadding;
    }

    const maxFunnel = funnelDepth / 100;
    const tHold = 0.45 / speed;    // a beat of still, fully submerged water
    const tSwell = 0.75 / speed;   // the level drops into view, swell rolling across
    const tDrain = 2.15 / speed;   // vortex opens and the water leaves
    const t1 = tHold, t2 = t1 + tSwell, t3 = t2 + tDrain;

    const eOut = (x) => 1 - Math.pow(1 - x, 3);
    const eIn = (x) => x * x * x;
    const smooth = (x) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };

    // `clock` always advances (it drives the shader's own wave motion); `t` is the
    // timeline position and is held at zero until the cross-fade has finished, so
    // the waterline cannot move while the stand-in is still backing it.
    let raf = 0, t = 0, clock = 0, last = performance.now(), nextRip = 0;
    let done = false, painted = false, handover = true;

    function end() {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      clearTimeout(watchdog);
      unlock();
      finish();
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05;
      clock += dt;
      if (!handover) t += dt;

      let surface, funnel = 0, swirl = 0, crash = 0, res = 0, alpha = 1, sweepX = -1, sweepAmp = 0;

      if (handover || t < t1) {
        // Submerged and holding. The waterline is off the top of the screen, so
        // what reads here is the body of the water itself — the rays, caustics
        // and bubbles that the depth ramp now keeps alive all the way down.
        surface = start;
        crash = 0.05;
      } else if (t < t2) {
        const p = (t - t1) / tSwell;
        // Drops into view, and the swell arrives with it.
        surface = start + (settle - start) * eOut(p);
        sweepX = -0.3 + p * 1.6;
        sweepAmp = 0.115 * Math.sin(Math.PI * Math.min(1, p * 1.05));
        crash = 0.12 + 0.20 * Math.sin(Math.PI * p);
        if (t > nextRip && sweepX > 0 && sweepX < 1) {
          nextRip = t + 0.07;
          fx.ripple(sweepX, Math.min(0.98, surface - 0.02), -0.05, 0.055);
        }
      } else if (t < t3) {
        const p = (t - t2) / tDrain;
        sweepX = 1.3 + p * 0.6;
        sweepAmp = 0.115 * (1 - smooth(p / 0.25));
        const acc = p * 0.35 + eIn(p) * 0.65;
        surface = settle + (-0.24 - settle) * acc;
        funnel = maxFunnel * Math.sin(Math.PI * Math.min(1, p * 1.12));
        swirl = smooth(p / 0.28) * (1 - smooth((p - 0.72) / 0.28));
        crash = 0.10 * (1 - p);
        res = residue ? smooth(p / 0.25) * (1 - smooth((p - 0.55) / 0.45)) : 0;
        alpha = 1 - smooth((p - 0.86) / 0.14);
        if (t > nextRip) {
          nextRip = t + 0.2;
          fx.ripple(0.15 + Math.random() * 0.7, Math.max(0.02, surface - 0.03), -0.035, 0.06);
        }
      } else {
        surface = -0.3;
        alpha = 0;
        end();
        return;
      }

      fx.setState({
        surface, depthRef: depthRefFor(surface),
        funnel, swirl, crash, alpha, residue: res, sweepX, sweepAmp
      });
      fx.render(clock);

      // First real frame is up. Fade the shader in ON TOP of the stand-in rather
      // than swapping them: the stand-in stays fully opaque underneath for the
      // whole fade, so the water never goes translucent and the page never shows
      // through. Once the canvas is opaque the stand-in can dissolve away.
      if (!painted) {
        painted = true;
        canvas.style.opacity = '1';
        fadeTimer = window.setTimeout(() => {
          const s = standInRef.current;
          if (s) s.style.opacity = '0';
          fadeTimer = window.setTimeout(() => {
            if (s) s.style.display = 'none';
            handover = false;   // the shader is opaque and alone; the timeline can run
          }, STANDIN_FADE_MS);
        }, HANDOVER_MS);
      }
    }
    raf = requestAnimationFrame(frame);

    // rAF stops in a backgrounded tab. If the visitor tabs away mid-drain the
    // loop never reaches the end, so this makes sure the page is handed back
    // rather than left scroll-locked under a frozen canvas.
    const watchdog = window.setTimeout(end, t3 * 1000 + HANDOVER_MS + STANDIN_FADE_MS + 2000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(watchdog);
      clearTimeout(fadeTimer);
      unlock();   // put the page back even if we are torn down mid-drain
      fx.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gone]);

  if (gone) return null;

  // Everything below is rendered into the server HTML, so the screen is already
  // submerged on the very first paint — before React hydrates and long before
  // WebGL has a frame. With the waterline above the top edge there is no crest to
  // watch, so slow drifting light stands in for the shader's rays and caustics
  // and keeps the wait from reading as a flat green box.
  const startFrac = startLevel / 100;
  const waterY = (1 - startFrac) * VB_H;          // negative once submerged
  const bandTop = Math.max(0, waterY) / VB_H;
  const stops = bodyStops(shallow, deep, startFrac, bandTop);
  const layer = { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' };

  return (
    <div
      ref={hostRef}
      className="liquid-intro"
      aria-hidden="true"
      style={{
        // inset-based sizing tracks the fixed containing block, so the overlay
        // follows a mobile URL bar showing/hiding and never overflows by the
        // scrollbar width the way 100vw/100vh would.
        position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none',
        transition: `opacity ${HANDOVER_MS}ms linear`
      }}
    >
      <svg
        ref={standInRef}
        style={{ ...layer, transition: `opacity ${STANDIN_FADE_MS}ms linear` }}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="liquidIntroBody"
            x1="0" y1={Math.max(0, waterY)} x2="0" y2={VB_H}
            gradientUnits="userSpaceOnUse"
          >
            {stops.map((s) => <stop key={s.offset} offset={s.offset} stopColor={s.color} />)}
          </linearGradient>
          <radialGradient id="liquidIntroGlow">
            <stop offset="0" stopColor={shallow} stopOpacity="0.30" />
            <stop offset="1" stopColor={shallow} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* A second crest just breaking the surface, for the case where the
            waterline is configured to start inside the viewport rather than
            above it. Off-screen at the default level. */}
        <g className="liquid-intro__wave-b">
          <path d={wavePath(waterY - 6, 9)} fill={deep} opacity="0.45" />
        </g>
        <g className="liquid-intro__wave-a">
          <path d={wavePath(waterY, 12)} fill="url(#liquidIntroBody)" />
          <path
            d={wavePath(waterY, 12)}
            fill="none"
            stroke="rgba(255,255,255,0.34)"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
        </g>
        <g className="liquid-intro__glow-a">
          <ellipse cx="330" cy="420" rx="430" ry="300" fill="url(#liquidIntroGlow)" />
        </g>
        <g className="liquid-intro__glow-b">
          <ellipse cx="880" cy="700" rx="380" ry="260" fill="url(#liquidIntroGlow)" />
        </g>
      </svg>
      <canvas
        ref={canvasRef}
        style={{ ...layer, opacity: 0, transition: `opacity ${HANDOVER_MS}ms linear` }}
      />
    </div>
  );
}

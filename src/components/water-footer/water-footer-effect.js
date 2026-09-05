// Framework-agnostic underwater footer effect.
// createWaterFooter(canvas, opts) -> { destroy(), splash(xPx, yPx) }
// Requires three.js (r150+). No DOM structure assumptions beyond the canvas.

import * as THREE from 'three';

const DEFAULTS = {
  headline: 'Stories. In Motion.',
  sub: '@ripplemedia.us',
  links: [],
  headlineFont: '{size}px "Coolvetica", "Helvetica Neue", Helvetica, Arial, sans-serif',
  bodyFont: '{size}px "Coolvetica", "Helvetica Neue", Helvetica, Arial, sans-serif',
  ink: '#0d1c05',
  inkLight: '#eef9d9',
  shallow: [0.80, 0.96, 0.27],   // lime at the waterline
  deep:    [0.13, 0.31, 0.12],   // deep green at the bottom
  surfaceY: 0.90,                // 0..1 from the bottom of the canvas
  autoDrops: false
};

const SIM = 192;

export function createWaterFooter(canvas, options = {}) {
  const o = { ...DEFAULTS, ...options };

  // No WebGL (hardware acceleration off + swiftshader blocked, old device, or the
  // user asked for reduced motion): paint a static gradient and bail out cleanly.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supported = (() => {
    try { return !!document.createElement('canvas').getContext('webgl'); } catch { return false; }
  })();
  if (!supported) {
    const [r, g, b] = o.shallow.map(v => Math.round(v * 255));
    const [r2, g2, b2] = o.deep.map(v => Math.round(v * 255));
    canvas.style.background = `linear-gradient(180deg, rgb(${r},${g},${b}) 0%, rgb(${r2},${g2},${b2}) 100%)`;
    canvas.parentElement?.setAttribute('data-water-fallback', '');   // CSS hook: reveal the real text
    return { splash() {}, destroy() { canvas.style.background = ''; } };
  }

  // preserveDrawingBuffer: without it the browser is free to clear the canvas's
  // GL buffer after any composite it isn't asked to refresh (e.g. while the
  // render loop is paused below via the offscreen IntersectionObserver, or on
  // a dropped frame) — which reads as a stray blank/garbled rectangle flashing
  // over the footer until the next draw call catches up.
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearAlpha(0);

  /* ---------- text layer drawn to a 2D canvas ---------- */
  const tc = document.createElement('canvas');
  const tctx = tc.getContext('2d');
  const textTex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
  textTex.minFilter = THREE.LinearFilter;
  textTex.magFilter = THREE.LinearFilter;
  textTex.generateMipmaps = false;
  textTex.flipY = false;
  textTex.needsUpdate = true;

  function drawText(w, h, dpr) {
    tc.width = Math.max(2, Math.round(w * dpr));
    tc.height = Math.max(2, Math.round(h * dpr));
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tctx.clearRect(0, 0, w, h);
    tctx.textAlign = 'center';
    tctx.fillStyle = o.ink;

    const waterTop = h * (1 - o.surfaceY);
    const body = h - waterTop;

    const hs = Math.min(w * 0.082, 104);
    tctx.font = o.headlineFont.replace('{size}', hs);
    tctx.textBaseline = 'alphabetic';
    tctx.fillText(o.headline, w / 2, waterTop + body * 0.46);

    const ss = Math.min(w * 0.017, 22);
    tctx.font = o.bodyFont.replace('{size}', ss);
    tctx.fillStyle = o.inkLight;
    tctx.globalAlpha = 0.92;
    tctx.fillText(o.sub, w / 2, waterTop + body * 0.60);

    if (o.links && o.links.length) {
      const ls = Math.min(w * 0.013, 15);
      tctx.font = o.bodyFont.replace('{size}', ls);
      tctx.fillStyle = o.inkLight;
      tctx.globalAlpha = 0.95;
      const gap = Math.min(w * 0.06, 74);
      const widths = o.links.map(t => tctx.measureText(t).width);
      const total = widths.reduce((a, b) => a + b, 0) + gap * (o.links.length - 1);
      let x = w / 2 - total / 2;
      o.links.forEach((t, i) => {
        tctx.textAlign = 'left';
        tctx.fillText(t.toUpperCase(), x, h - body * 0.13);
        x += widths[i] + gap;
      });
      tctx.textAlign = 'center';
    }
    tctx.globalAlpha = 1;

    // Snapshot the pixels into a *new* texture each time rather than mutating
    // the existing one's .image in place: three.js keeps the old texture's
    // upload path (texSubImage2D) once a texture has been uploaded once, and
    // that path assumes the size never changes. Feeding it a differently-sized
    // buffer overflows that assumption (GL_INVALID_VALUE: offset overflows
    // texture dimensions) and briefly shows corrupted/garbage pixels; a new
    // texture forces a full, correctly-sized re-upload instead.
    const px = tctx.getImageData(0, 0, tc.width, tc.height);
    const tex = new THREE.DataTexture(new Uint8Array(px.data.buffer.slice(0)), tc.width, tc.height);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.flipY = false;
    tex.needsUpdate = true;
    const prevTex = mat.uniforms.uText.value;
    mat.uniforms.uText.value = tex;
    if (prevTex) prevTex.dispose();
  }

  /* ---------- ripple simulation (ping-pong height field) ---------- */
  const rtOpts = {
    type: THREE.HalfFloatType, format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false
  };
  let rtA = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts);
  let rtB = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts);
  const simCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const simScene = new THREE.Scene();
  const simMat = new THREE.ShaderMaterial({
    uniforms: {
      tPrev: { value: null }, texel: { value: new THREE.Vector2(1 / SIM, 1 / SIM) },
      dropPos: { value: new THREE.Vector2(0.5, 0.5) }, dropAmp: { value: 0 }, dropRad: { value: 0.02 }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
      uniform sampler2D tPrev; uniform vec2 texel;
      uniform vec2 dropPos; uniform float dropAmp, dropRad;
      varying vec2 vUv;
      void main(){
        vec4 c = texture2D(tPrev, vUv);
        float h = c.r, hp = c.g;
        float s = texture2D(tPrev, vUv + vec2(texel.x,0.0)).r
                + texture2D(tPrev, vUv - vec2(texel.x,0.0)).r
                + texture2D(tPrev, vUv + vec2(0.0,texel.y)).r
                + texture2D(tPrev, vUv - vec2(0.0,texel.y)).r;
        float nh = (2.0*h - hp) + 0.055*(s - 4.0*h);   // low wave speed: spreads slowly
        nh *= 0.9975;                                   // and lingers so the wake stays readable
        nh = clamp(nh, -1.0, 1.0);                      // guard against sim blow-ups
        vec2 e = min(vUv, 1.0 - vUv);
        nh *= smoothstep(0.0, 0.05, min(e.x, e.y));
        if(dropAmp != 0.0) nh += dropAmp * smoothstep(dropRad, 0.0, distance(vUv, dropPos));
        gl_FragColor = vec4(nh, h, 0.0, 1.0);
      }`
  });
  simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMat));

  function simStep() {
    simMat.uniforms.tPrev.value = rtA.texture;
    renderer.setRenderTarget(rtB);
    renderer.render(simScene, simCam);
    renderer.setRenderTarget(null);
    const t = rtA; rtA = rtB; rtB = t;
    simMat.uniforms.dropAmp.value = 0;
  }
  renderer.setRenderTarget(rtA); renderer.clear();
  renderer.setRenderTarget(rtB); renderer.clear();
  renderer.setRenderTarget(null);

  function drop(u, v, amp, rad) {
    simMat.uniforms.dropPos.value.set(u, v);
    simMat.uniforms.dropAmp.value = amp;
    simMat.uniforms.dropRad.value = rad;
    simStep();
  }

  /* ---------- water pass ---------- */
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uText: { value: textTex }, uRipple: { value: null },
      uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) },
      uSurface: { value: o.surfaceY },
      uShallow: { value: new THREE.Color().fromArray(o.shallow) },
      uDeep: { value: new THREE.Color().fromArray(o.deep) }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uText, uRipple;
      uniform float uTime, uSurface;
      uniform vec2 uRes;
      uniform vec3 uShallow, uDeep;
      varying vec2 vUv;

      float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

      float caustic(vec2 p, float t){
        float v = 0.0;
        v += sin(p.x*3.1 + t*0.9) * sin(p.y*2.7 - t*0.7);
        v += sin(p.x*-4.7 + t*1.3) * sin(p.y*5.3 + t*0.5);
        v += sin((p.x+p.y)*6.1 - t*1.1);
        return v / 3.0;
      }

      void main(){
        vec2 uv = vUv;
        float aspect = uRes.x / max(uRes.y, 1.0);
        vec2 ar = vec2(aspect, 1.0);
        float t = uTime;

        // ---- ripple field ----
        vec2 tx = vec2(1.0/192.0);
        float h  = texture2D(uRipple, uv).r;
        h = (h == h) ? clamp(h, -1.0, 1.0) : 0.0;
        float hx = texture2D(uRipple, uv + vec2(tx.x,0.0)).r - texture2D(uRipple, uv - vec2(tx.x,0.0)).r;
        float hy = texture2D(uRipple, uv + vec2(0.0,tx.y)).r - texture2D(uRipple, uv - vec2(0.0,tx.y)).r;

        // ---- surface sheet: three overlapping folds seen edge-on ----
        float x = uv.x * aspect;
        float px = 1.0 / max(uRes.y, 1.0);             // keep the sheet a constant pixel depth
        float amp = clamp(40.0 * px, 0.055, 0.13);    // wave amplitude scale
        float drag = h * amp * 0.12;                   // cursor wake, very gentle
        float w1 = 0.38*sin(x*1.7 + t*0.72) + 0.17*sin(x*3.4 - t*1.02);
        float w2 = 0.32*sin(x*1.5 - t*0.58) + 0.14*sin(x*3.1 + t*0.86);
        float w3 = 0.26*sin(x*2.2 + t*0.46);
        float sBoff = clamp(34.0*px, 0.065, 0.12);
        float s  = uSurface + w1 * amp + drag;                              // front crest
        float sB = s - sBoff + (w2 - w1) * amp * 0.9;                       // underside of the sheet
        // sheet (below) is smoothstep(sB, s, uv.y), and smoothstep is undefined
        // when edge0 >= edge1. The wobble term can outrun sBoff: at a 460px
        // canvas the gap is 0.0739 while abs(w2-w1)*amp*0.9 peaks at 0.0790, so
        // on rare alignments of the wave sines the edges invert, sheet saturates
        // to 1.0 down the whole column, and the sheet/crest mixes paint it white.
        sB = min(sB, s - sBoff * 0.25);
        float sF = s - clamp(66.0*px, 0.120, 0.20) + (w3 - w1) * amp * 0.8; // far fold behind it

        float depth = s - uv.y;
        if(depth < 0.0){ discard; }

        // ---- body colour ----
        float dn = clamp(depth / max(uSurface, 0.001), 0.0, 1.0);
        vec3 col = mix(uShallow, uDeep, pow(dn, 0.75));

        // ---- god rays from the surface ----
        float sheet = smoothstep(sB, s, uv.y);          // 1 at the crest, 0 below the sheet
        float ray = 0.5 + 0.5*sin(uv.x*6.0 - uv.y*2.2 + t*0.22);
        ray *= 0.5 + 0.5*sin(uv.x*11.0 - uv.y*4.0 - t*0.17);
        ray *= smoothstep(0.85, 0.02, dn) * (1.0 - sheet);
        col += vec3(0.55, 0.72, 0.28) * ray * 0.16;

        // ---- caustic light banding just under the surface ----
        float c = caustic(uv*ar*4.0 + vec2(0.0, t*0.05), t);
        col += vec3(0.62, 0.80, 0.32) * smoothstep(0.25, 1.0, c) * smoothstep(0.55, 0.0, dn) * 0.30;

        // ---- refracted text ----
        vec2 warp = vec2(hx, hy) * 0.12
                  + vec2(sin(uv.y*22.0 + t*1.1), sin(uv.x*18.0*aspect - t*0.9)) * 0.0035
                  + vec2(sin(uv.y*9.0 - t*0.6), 0.0) * 0.0045;
        warp = (warp == warp) ? clamp(warp, vec2(-0.008), vec2(0.008)) : vec2(0.0);
        warp *= smoothstep(0.0, 0.10, depth);
        vec2 tuv = clamp(vec2(uv.x, 1.0 - uv.y) + vec2(warp.x, -warp.y), vec2(0.0), vec2(1.0));

        vec4 tsam = texture2D(uText, tuv);
        float a  = tsam.a;
        float ar_ = texture2D(uText, tuv + vec2(0.0018, 0.0)).a;   // slight chromatic split
        float ab_ = texture2D(uText, tuv - vec2(0.0018, 0.0)).a;

        vec3 ink = mix(tsam.rgb, mix(tsam.rgb, col, 0.18), dn * 0.5);
        col = mix(col, ink, a * 0.94);
        col += vec3(0.06, 0.0, 0.0) * (ar_ - a) * 0.6;
        col += vec3(0.0, 0.04, 0.06) * (ab_ - a) * 0.6;
        // caustic light playing over the letters
        col += vec3(0.5,0.7,0.25) * smoothstep(0.4,1.0,c) * a * 0.20;

        // ---- rising bubbles ----
        vec2 bp = uv * ar * 7.0;
        vec2 cell = floor(bp), f = fract(bp);
        float r1 = hash(cell), r2 = hash(cell + 7.7);
        if(r2 > 0.55){
          float sp = 0.05 + r1 * 0.10;
          vec2 bc = vec2(0.5 + 0.28*sin(t*0.8 + r1*30.0), fract(r1 + t*sp));
          float rad = 0.035 + r1*0.045;
          float d = length(f - bc);
          float bub = smoothstep(rad, rad*0.35, d) - smoothstep(rad*0.62, rad*0.2, d)*0.55;
          col += vec3(0.75,0.92,0.55) * bub * 0.30 * smoothstep(0.03, 0.25, dn);
        }

        // ---- the surface sheet, read edge-on ----
        // far fold: a soft lit line sitting behind everything
        float foldW = max(10.0*px, 0.016);
        float qF = (uv.y - sF) / foldW;
        float fold = exp(-qF * qF);
        col = mix(col, mix(uShallow, vec3(1.0), 0.62), fold * 0.22);
        float qFb = (uv.y - (sF - foldW*1.6)) / foldW;
        col *= 1.0 - 0.06 * exp(-qFb * qFb);                                     // its shaded back

        // the sheet itself: translucent, much paler than the body it lies over
        vec3 sheetCol = mix(uShallow, vec3(1.0), 0.55);
        float sh = pow(sheet, 1.25);
        col = mix(col, sheetCol, sh * 0.80);
        col = mix(col, vec3(1.0), pow(sheet, 3.5) * 0.30);                      // light gathers at the top

        // shadow along the underside where the sheet leaves the body
        float underW = max(7.0*px, 0.011);
        float qU = (uv.y - sB) / underW;
        float under = exp(-qU * qU);
        col *= 1.0 - 0.22 * under;

        // travelling sheen riding inside the sheet, so the fold reads as 3D
        float sheenY = s - clamp(13.0*px, 0.024, 0.045) - amp*0.22*sin(x*3.3 - t*0.6);
        float qS = (uv.y - sheenY) / max(6.0*px, 0.009);
        float sheen = exp(-qS * qS);
        col = mix(col, vec3(1.0), sheen * (0.20 + 0.14 * (0.5 + 0.5*sin(x*1.6 + t*0.55))));

        // crest: thin bright meniscus at the very top
        float qC = depth / max(2.5*px, 0.004);
        float crest = exp(-qC * qC);
        col = mix(col, vec3(1.0, 1.0, 0.96), crest * 0.85);

        float alpha = smoothstep(0.0, 0.0016, depth);
        gl_FragColor = vec4(col, alpha);
      }`
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  /* ---------- render + loop timing (declared before resize, which renders once immediately) ---------- */
  let raf = 0, t0 = performance.now(), nextDrop = t0 + 1200, running = true;
  function nowT() { return ((performance.now() - t0) / 1000) * (reduced ? 0.25 : 1); }
  function renderOnce(t) {
    simStep();
    mat.uniforms.uRipple.value = rtA.texture;
    mat.uniforms.uTime.value = t;
    renderer.render(scene, cam);
  }

  /* ---------- sizing ---------- */
  let W = 1, H = 1, dpr = 1;
  let lastKey = '';
  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), hh = Math.max(1, Math.round(r.height));
    const d = Math.min(devicePixelRatio, w < 820 ? 1.5 : 2);
    const key = w + 'x' + hh + '@' + d;
    if (key === lastKey) return;
    lastKey = key;
    W = w; H = hh; dpr = d;
    renderer.setSize(W, H, false);
    mat.uniforms.uRes.value.set(W, H);
    drawText(W, H, dpr);
    // Resizing the canvas clears its WebGL drawing buffer; without an immediate
    // repaint the browser can flash that cleared/garbage buffer for a frame
    // (visible as a stray rectangle) until the next rAF tick catches up.
    renderOnce(nowT());
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // Coolvetica loads async; if it isn't ready yet, drawText() above fell back to a
  // system font. Force one more text redraw once it's actually available.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      lastKey = '';
      resize();
    });
  }

  /* ---------- interaction ---------- */
  let lastMove = 0, prev = null;
  function toUV(ev) {
    const r = canvas.getBoundingClientRect();
    return [(ev.clientX - r.left) / r.width, 1 - (ev.clientY - r.top) / r.height];
  }
  function onMove(ev) {
    const now = performance.now();
    if (now - lastMove < 32) return;
    lastMove = now;
    const [u, v] = toUV(ev);
    if (u < 0 || u > 1 || v < 0 || v > 1) { prev = null; return; }
    // stroke the field along the path so it reads as a finger dragged through water
    // only disturb the water when the pointer has actually travelled — a stationary
    // cursor leaves one gentle wake and then nothing
    if (prev) {
      const dx = u - prev[0], dy = v - prev[1];
      const dist = Math.hypot(dx, dy);
      if (dist < 0.010) return;
      const steps = Math.min(3, Math.ceil(dist / 0.02));
      for (let i = 1; i <= steps; i++) {
        const k = i / steps;
        drop(prev[0] + dx * k, prev[1] + dy * k, -0.007, 0.070);
      }
    } else drop(u, v, -0.007, 0.070);
    prev = [u, v];
  }
  function onDown(ev) { const [u, v] = toUV(ev); drop(u, v, -0.025, 0.050); }
  if (!reduced) canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);

  /* ---------- loop ---------- */
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!running) return;
    const t = ((now - t0) / 1000) * (reduced ? 0.25 : 1);
    if (o.autoDrops && now > nextDrop) {
      drop(0.15 + Math.random() * 0.7, 0.50 + Math.random() * 0.38, -0.03, 0.060);
      nextDrop = now + 6000 + Math.random() * 6000;
    }
    renderOnce(t);
  }
  raf = requestAnimationFrame(frame);

  // pause when offscreen
  const io = new IntersectionObserver(e => { running = e[0].isIntersecting; }, { threshold: 0 });
  io.observe(canvas);

  return {
    splash(xPx, yPx) { drop(xPx / W, 1 - yPx / H, -0.55, 0.02); },
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      rtA.dispose(); rtB.dispose(); mat.dispose(); simMat.dispose();
      mat.uniforms.uText.value?.dispose(); renderer.dispose();
    }
  };
}

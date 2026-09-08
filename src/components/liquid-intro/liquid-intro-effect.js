// Full-screen liquid page-load intro — the underwater shader from
// components/water-footer/water-footer-effect.js with the text layer removed and the
// surface height, vortex funnel, swirl, travelling swell, crash amplitude, residue and
// alpha exposed as uniforms driven from outside (see LiquidIntro.jsx for the timeline).
// createLiquidIntro(canvas, opts) -> { setState(), ripple(), render(t), reset(), destroy() }

import * as THREE from 'three';

var SIM = 192;

// Colours are carried as raw 0..1 sRGB triples, the same convention as
// water-footer-effect.js, and pushed in with fromArray. Going through
// Color.set('#rrggbb') instead would hand the value to three's colour
// management, which converts sRGB -> linear working space and lands #215020 on
// screen as rgb(4,20,4) — near black, and nothing like the footer.
function toTriple(v) {
  if (Array.isArray(v)) return v;
  var n = parseInt(String(v).replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

  export function createLiquidIntro(canvas, options) {
    var o = Object.assign({
      shallow: [0.80, 0.96, 0.27],
      deep: [0.13, 0.31, 0.12],
      surfaceY: 0.0,
      depthRef: null
    }, options || {});

    var supported = (function () {
      try { return !!document.createElement('canvas').getContext('webgl'); } catch { return false; }
    })();
    if (!supported) {
      canvas.style.display = 'none';
      // The host drives the clock and calls render() every frame, so the stub has
      // to answer the whole interface or a WebGL-less browser throws mid-timeline
      // and leaves the page scroll-locked under a canvas that never finishes.
      return {
        supported: false, running: false,
        setState: function () {}, ripple: function () {}, reset: function () {},
        render: function () {}, destroy: function () {}
      };
    }

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearAlpha(0);

    /* ---------- ripple simulation (ping-pong height field) ---------- */
    var rtOpts = {
      type: THREE.HalfFloatType, format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false
    };
    var rtA = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts);
    var rtB = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts);
    var simCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var simScene = new THREE.Scene();
    var simMat = new THREE.ShaderMaterial({
      uniforms: {
        tPrev: { value: null }, texel: { value: new THREE.Vector2(1 / SIM, 1 / SIM) },
        dropPos: { value: new THREE.Vector2(0.5, 0.5) }, dropAmp: { value: 0 }, dropRad: { value: 0.02 }
      },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: [
        'uniform sampler2D tPrev; uniform vec2 texel;',
        'uniform vec2 dropPos; uniform float dropAmp, dropRad;',
        'varying vec2 vUv;',
        'void main(){',
        '  vec4 c = texture2D(tPrev, vUv);',
        '  float h = c.r, hp = c.g;',
        '  float s = texture2D(tPrev, vUv + vec2(texel.x,0.0)).r',
        '          + texture2D(tPrev, vUv - vec2(texel.x,0.0)).r',
        '          + texture2D(tPrev, vUv + vec2(0.0,texel.y)).r',
        '          + texture2D(tPrev, vUv - vec2(0.0,texel.y)).r;',
        '  float nh = (2.0*h - hp) + 0.075*(s - 4.0*h);',
        '  nh *= 0.9965;',
        '  nh = clamp(nh, -1.0, 1.0);',
        '  vec2 e = min(vUv, 1.0 - vUv);',
        '  nh *= smoothstep(0.0, 0.05, min(e.x, e.y));',
        '  if(dropAmp != 0.0) nh += dropAmp * smoothstep(dropRad, 0.0, distance(vUv, dropPos));',
        '  gl_FragColor = vec4(nh, h, 0.0, 1.0);',
        '}'
      ].join('\n')
    });
    simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMat));

    function simStep() {
      simMat.uniforms.tPrev.value = rtA.texture;
      renderer.setRenderTarget(rtB);
      renderer.render(simScene, simCam);
      renderer.setRenderTarget(null);
      var t = rtA; rtA = rtB; rtB = t;
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
    var scene = new THREE.Scene();
    var cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var mat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uRipple: { value: null },
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uSurface: { value: o.surfaceY },
      // Depth the colour ramp is measured against, exactly as the water footer
      // does it. Normalising by the body of water rather than a fixed 0.80 keeps
      // the gradient — and the god rays, caustics and bubbles that fade out with
      // it — spread across whatever is on screen, instead of saturating to flat
      // uDeep everywhere below 80% depth. Driven from outside so a draining
      // surface can keep a sane reference instead of collapsing to zero.
      uDepthRef: { value: o.depthRef != null ? o.depthRef : o.surfaceY },
        uFunnel: { value: 0 },
        uSwirl: { value: 0 },
        uCrash: { value: 0 },
        uSweepX: { value: -1 },
        uSweepAmp: { value: 0 },
        uAlpha: { value: 1 },
        uResidue: { value: 0 },
        uShallow: { value: new THREE.Color().fromArray(toTriple(o.shallow)) },
        uDeep: { value: new THREE.Color().fromArray(toTriple(o.deep)) }
      },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: [
        'precision highp float;',
        'uniform sampler2D uRipple;',
        'uniform float uTime, uSurface, uDepthRef, uFunnel, uSwirl, uCrash, uAlpha, uResidue;',
        'uniform float uSweepX, uSweepAmp;',
        'uniform vec2 uRes;',
        'uniform vec3 uShallow, uDeep;',
        'varying vec2 vUv;',

        'float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }',
        'float g(float x){ return exp(-x*x); }',

        'float caustic(vec2 p, float t){',
        '  float v = 0.0;',
        '  v += sin(p.x*3.1 + t*0.9) * sin(p.y*2.7 - t*0.7);',
        '  v += sin(p.x*-4.7 + t*1.3) * sin(p.y*5.3 + t*0.5);',
        '  v += sin((p.x+p.y)*6.1 - t*1.1);',
        '  return v / 3.0;',
        '}',

        'void main(){',
        '  vec2 uv = vUv;',
        '  float aspect = uRes.x / max(uRes.y, 1.0);',
        '  vec2 ar = vec2(aspect, 1.0);',
        '  float t = uTime;',
        '  float px = 1.0 / max(uRes.y, 1.0);',

        // ---- ripple field ----
        '  vec2 tx = vec2(1.0/192.0);',
        '  float h  = texture2D(uRipple, uv).r;',
        '  h = (h == h) ? clamp(h, -1.0, 1.0) : 0.0;',
        '  float hx = texture2D(uRipple, uv + vec2(tx.x,0.0)).r - texture2D(uRipple, uv - vec2(tx.x,0.0)).r;',
        '  float hy = texture2D(uRipple, uv + vec2(0.0,tx.y)).r - texture2D(uRipple, uv - vec2(0.0,tx.y)).r;',

        // ---- surface sheet: overlapping folds seen edge-on ----
        '  float x = uv.x * aspect;',
        '  float amp = clamp(46.0 * px, 0.030, 0.075) * (1.0 + uCrash * 2.6);',
        '  float drag = h * amp * 0.30;',
        '  float w1 = 0.38*sin(x*1.7 + t*0.72) + 0.17*sin(x*3.4 - t*1.02) + uCrash*0.55*sin(x*2.3 - t*3.1);',
        '  float w2 = 0.32*sin(x*1.5 - t*0.58) + 0.14*sin(x*3.1 + t*0.86);',
        '  float w3 = 0.26*sin(x*2.2 + t*0.46);',

        // ---- swell travelling left to right: crest with a trough dragging behind it ----
        '  float sweep = uSweepAmp * (1.15 * g((uv.x - uSweepX) / 0.17)',
        '              - 0.40 * g((uv.x - uSweepX + 0.27) / 0.22)',
        '              + 0.16 * g((uv.x - uSweepX - 0.21) / 0.14));',
        '  float crestLocal = g((uv.x - uSweepX) / 0.20) * uSweepAmp;',

        // ---- vortex funnel: depression at centre with a raised rim ----
        '  float dx = uv.x - 0.5;',
        '  float dip = uFunnel * g(dx / 0.155);',
        '  float rim = uFunnel * 0.13 * (g((dx - 0.27) / 0.10) + g((dx + 0.27) / 0.10));',

        '  float sBoff = clamp(30.0*px, 0.040, 0.085);',
        '  float s  = uSurface + w1 * amp + drag - dip + rim + sweep;',
        '  float sB = s - sBoff + (w2 - w1) * amp * 0.9;',
        '  sB = min(sB, s - sBoff * 0.25);',
        '  float sF = s - clamp(58.0*px, 0.085, 0.15) + (w3 - w1) * amp * 0.8;',

        '  float depth = s - uv.y;',

        // ---- water that clung to the glass as the surface pulled away ----
        '  if(depth < 0.0){',
        '    float lift = uv.y - s;',
        '    vec2 rc = floor(uv * ar * 9.0);',
        '    float r1 = hash(rc + 2.3), r2 = hash(rc + 11.7);',
        '    vec2 rf = fract(uv * ar * 9.0);',
        '    float rr = 0.10 + r1 * 0.22;',
        '    float dd = length((rf - vec2(0.30 + r1*0.4, 0.35 + r2*0.4)) * vec2(1.0, 1.35));',
        '    float blob = smoothstep(rr, rr*0.35, dd);',
        '    float keep = step(0.63, r2) * uResidue * exp(-lift * 9.0) * smoothstep(0.0, 0.03, lift);',
        '    float a = blob * keep * 0.5;',
        '    if(a < 0.004) discard;',
        '    vec3 film = mix(uShallow, vec3(1.0), 0.28);',
        '    gl_FragColor = vec4(film, a * uAlpha);',
        '    return;',
        '  }',

        // ---- body colour ----
        '  float dn = clamp(depth / max(uDepthRef, 0.001), 0.0, 1.0);',
        '  vec3 col = mix(uShallow, uDeep, pow(dn, 0.75));',

        // ---- swirl coordinates near the funnel throat ----
        '  float core = g(dx / 0.11);',
        '  float below = smoothstep(0.0, 0.10, depth);',
        '  float q = dx / (0.10 + depth * 1.9);',
        '  float spin = sin(q * 7.5 - t * 7.0 * uSwirl) * 0.5 + 0.5;',
        '  col = mix(col, col * 1.16, spin * core * uSwirl * below * 0.55);',
        '  col *= 1.0 - 0.42 * core * uFunnel * 3.0 * below;',

        // ---- god rays from the surface ----
        '  float sheet = smoothstep(sB, s, uv.y);',
        '  float ray = 0.5 + 0.5*sin(uv.x*6.0 - uv.y*2.2 + t*0.22);',
        '  ray *= 0.5 + 0.5*sin(uv.x*11.0 - uv.y*4.0 - t*0.17);',
        '  ray *= smoothstep(0.85, 0.02, dn) * (1.0 - sheet);',
        '  col += vec3(0.55, 0.72, 0.28) * ray * 0.16;',

        // ---- caustic banding under the surface ----
        '  float c = caustic(uv*ar*4.0 + vec2(0.0, t*0.05), t);',
        '  col += vec3(0.62, 0.80, 0.32) * smoothstep(0.25, 1.0, c) * smoothstep(0.55, 0.0, dn) * 0.30;',

        // ---- rising bubbles: faint fill, thin bright rim, small specular ----
        '  vec2 bp = uv * ar * 5.0;',
        '  vec2 cell = floor(bp), f = fract(bp);',
        '  float b1 = hash(cell), b2 = hash(cell + 7.7), b3 = hash(cell + 3.1);',
        '  if(b2 > 0.60){',
        '    float sp = 0.022 + b1 * 0.055;',
        '    vec2 bc = vec2(0.15 + 0.7*b3 + 0.05*sin(t*0.7 + b1*24.0), fract(b1 + t*sp));',
        '    float rad = 0.016 + b3 * 0.030;',
        '    vec2 dv = f - bc;',
        '    float d = length(dv);',
        '    float e = (d - rad) / max(rad * 0.30, 0.002);',
        '    float body = smoothstep(rad, rad*0.72, d) * 0.10;',
        '    float rimb = g(e) * 0.42;',
        '    vec2 sv = (dv - vec2(-rad*0.34, rad*0.34)) / max(rad*0.34, 0.002);',
        '    float spec = g(length(sv)) * 0.34;',
        '    float vis = smoothstep(0.015, 0.16, dn) * smoothstep(1.02, 0.60, dn);',
        '    col += vec3(0.88, 0.98, 0.74) * (body + rimb + spec) * 0.34 * vis;',
        '  }',

        // ---- the surface sheet, read edge-on (soft, not graphic) ----
        '  float foldW = max(12.0*px, 0.018);',
        '  float qF = (uv.y - sF) / foldW;',
        '  float fold = g(qF);',
        '  col = mix(col, mix(uShallow, vec3(1.0), 0.42), fold * 0.16);',
        '  float qFb = (uv.y - (sF - foldW*1.6)) / foldW;',
        '  col *= 1.0 - 0.05 * g(qFb);',

        '  vec3 sheetCol = mix(uShallow, vec3(1.0), 0.30);',
        '  col = mix(col, sheetCol, pow(sheet, 1.35) * 0.52);',
        '  col = mix(col, vec3(1.0), pow(sheet, 4.0) * 0.14);',

        '  float underW = max(9.0*px, 0.013);',
        '  col *= 1.0 - 0.16 * g((uv.y - sB) / underW);',

        '  float sheenY = s - clamp(14.0*px, 0.020, 0.040) - amp*0.22*sin(x*3.3 - t*0.6);',
        '  float sheen = g((uv.y - sheenY) / max(9.0*px, 0.012));',
        '  col = mix(col, vec3(1.0), sheen * (0.09 + 0.06 * (0.5 + 0.5*sin(x*1.6 + t*0.55))));',

        // crest: soft meniscus, wide and low-contrast so the waterline stays photographic
        '  float crest = g(depth / max(7.0*px, 0.009));',
        '  col = mix(col, mix(uShallow, vec3(1.0), 0.55), crest * (0.34 + crestLocal * 0.30));',

        '  float alpha = smoothstep(0.0, 3.0*px, depth) * uAlpha;',
        '  gl_FragColor = vec4(col, alpha);',
        '}'
      ].join('\n')
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    var raf = 0, running = true, W = 1, H = 1, lastKey = '';
    var clock = 0;

    function renderOnce(t) {
      simStep();
      mat.uniforms.uRipple.value = rtA.texture;
      mat.uniforms.uTime.value = t;
      renderer.render(scene, cam);
    }

    function resize() {
      var r = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width)), hh = Math.max(1, Math.round(r.height));
      var d = Math.min(devicePixelRatio, w < 820 ? 1.5 : 2);
      var key = w + 'x' + hh + '@' + d;
      if (key === lastKey) return;
      lastKey = key;
      W = w; H = hh;
      renderer.setPixelRatio(d);
      renderer.setSize(W, H, false);
      mat.uniforms.uRes.value.set(W, H);
      renderOnce(clock);
    }
    var ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    var io = new IntersectionObserver(function (e) { running = e[0].isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    return {
      supported: true,
      get running() { return running; },
      setState: function (st) {
        var u = mat.uniforms;
        if (st.surface !== undefined) u.uSurface.value = st.surface;
        if (st.depthRef !== undefined) u.uDepthRef.value = st.depthRef;
        if (st.funnel !== undefined) u.uFunnel.value = st.funnel;
        if (st.swirl !== undefined) u.uSwirl.value = st.swirl;
        if (st.crash !== undefined) u.uCrash.value = st.crash;
        if (st.sweepX !== undefined) u.uSweepX.value = st.sweepX;
        if (st.sweepAmp !== undefined) u.uSweepAmp.value = st.sweepAmp;
        if (st.alpha !== undefined) u.uAlpha.value = st.alpha;
        if (st.residue !== undefined) u.uResidue.value = st.residue;
        if (st.shallow) u.uShallow.value.fromArray(toTriple(st.shallow));
        if (st.deep) u.uDeep.value.fromArray(toTriple(st.deep));
      },
      ripple: function (u, v, amp, rad) { drop(u, v, amp, rad); },
      reset: function () {
        renderer.setRenderTarget(rtA); renderer.clear();
        renderer.setRenderTarget(rtB); renderer.clear();
        renderer.setRenderTarget(null);
      },
      render: function (t) { clock = t; renderOnce(t); },
      destroy: function () {
        cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
        rtA.dispose(); rtB.dispose(); mat.dispose(); simMat.dispose(); renderer.dispose();
      }
    };
  }

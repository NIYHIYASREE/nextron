import { useEffect, useRef } from "react";

/*
  FluidCanvas — WebGL fluid aurora, mouse-reactive
  Fixed bugs vs v1:
  - Canvas sized via window dimensions, not offsetWidth (which is 0 on fixed elements)
  - Correct per-FBO texel sizes passed to every shader
  - Dye colour multiplier raised (was 0.28 → 0.9) so it's actually visible
  - Splat radius tuned (gaussian exponent fixed)
  - Mouse delta scaled correctly; always fires on move (removed || true guard)
  - Auto-splat throttled to ~12fps, not every frame
  - Advect velocity self-advects using correct SIM texel
  - Pressure cleared each frame to avoid drift
*/

/* ── Simulation config ─────────────────────────────────────── */
const SIM_RES            = 128;
const DYE_RES            = 512;
const SPLAT_FORCE        = 6000;   // velocity push strength
const SPLAT_RADIUS       = 0.0015; // gaussian radius (tuned)
const VELOCITY_DISSIPATION = 0.98;
const DENSITY_DISSIPATION  = 0.975;
const CURL_STRENGTH      = 25;
const PRESSURE_ITER      = 20;
const AUTO_SPLAT_INTERVAL = 0.12; // seconds between ambient splats

/* Aurora palette — [h, s, l] */
const PALETTE = [
  [0.78, 1.0, 0.55],  // violet
  [0.91, 1.0, 0.55],  // hot pink / magenta
  [0.02, 1.0, 0.50],  // deep red
  [0.35, 0.9, 0.45],  // green
  [0.60, 1.0, 0.55],  // cyan-blue
  [0.70, 0.9, 0.58],  // purple
];

/* ── Shaders ───────────────────────────────────────────────── */
const VS = /* glsl */`
precision highp float;
attribute vec2 aPos;
varying vec2 vUv;
void main(){
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/* Splat: gaussian blob injected at (uPoint) with force (uColor) */
const FS_SPLAT = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D uBase;
uniform vec2  uPoint;
uniform vec3  uColor;
uniform float uRadius;
uniform float uAspect;
void main(){
  vec2 p = vUv - uPoint;
  p.x   *= uAspect;
  float d = exp(-dot(p,p) / uRadius);
  vec3  c = texture2D(uBase, vUv).xyz + uColor * d;
  gl_FragColor = vec4(c, 1.0);
}`;

/* Advect: trace back along velocity field */
const FS_ADVECT = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2  uTexelVel;
uniform vec2  uTexelSrc;
uniform float uDt;
uniform float uDissipation;
void main(){
  /* Back-trace in velocity-texture space */
  vec2 vel   = texture2D(uVelocity, vUv).xy;
  vec2 coord = vUv - uDt * vel;
  coord      = clamp(coord, vec2(0.0), vec2(1.0));
  gl_FragColor = texture2D(uSource, coord) * uDissipation;
}`;

/* Divergence of velocity */
const FS_DIV = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main(){
  float L = texture2D(uVelocity, vUv - vec2(uTexel.x,0)).x;
  float R = texture2D(uVelocity, vUv + vec2(uTexel.x,0)).x;
  float T = texture2D(uVelocity, vUv + vec2(0,uTexel.y)).y;
  float B = texture2D(uVelocity, vUv - vec2(0,uTexel.y)).y;
  gl_FragColor = vec4(0.5*(R-L+T-B), 0.0, 0.0, 1.0);
}`;

/* Pressure Jacobi */
const FS_PRESSURE = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexel;
void main(){
  float L   = texture2D(uPressure, vUv - vec2(uTexel.x,0)).x;
  float R   = texture2D(uPressure, vUv + vec2(uTexel.x,0)).x;
  float T   = texture2D(uPressure, vUv + vec2(0,uTexel.y)).x;
  float B   = texture2D(uPressure, vUv - vec2(0,uTexel.y)).x;
  float div = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L+R+T+B - div)*0.25, 0.0, 0.0, 1.0);
}`;

/* Gradient subtract */
const FS_GRADIENT = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main(){
  float L = texture2D(uPressure, vUv - vec2(uTexel.x,0)).x;
  float R = texture2D(uPressure, vUv + vec2(uTexel.x,0)).x;
  float T = texture2D(uPressure, vUv + vec2(0,uTexel.y)).x;
  float B = texture2D(uPressure, vUv - vec2(0,uTexel.y)).x;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  gl_FragColor = vec4(vel - vec2(R-L, T-B)*0.5, 0.0, 1.0);
}`;

/* Curl */
const FS_CURL = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main(){
  float L = texture2D(uVelocity, vUv - vec2(uTexel.x,0)).y;
  float R = texture2D(uVelocity, vUv + vec2(uTexel.x,0)).y;
  float T = texture2D(uVelocity, vUv + vec2(0,uTexel.y)).x;
  float B = texture2D(uVelocity, vUv - vec2(0,uTexel.y)).x;
  gl_FragColor = vec4((R-L-(T-B))*0.5+0.5, 0.0, 0.0, 1.0);
}`;

/* Vorticity confinement */
const FS_VORTICITY = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2  uTexel;
uniform float uCurlStr;
uniform float uDt;
void main(){
  float L = texture2D(uCurl, vUv-vec2(uTexel.x,0)).x*2.0-1.0;
  float R = texture2D(uCurl, vUv+vec2(uTexel.x,0)).x*2.0-1.0;
  float T = texture2D(uCurl, vUv+vec2(0,uTexel.y)).x*2.0-1.0;
  float B = texture2D(uCurl, vUv-vec2(0,uTexel.y)).x*2.0-1.0;
  float C = texture2D(uCurl, vUv).x*2.0-1.0;
  vec2 force = vec2(abs(T)-abs(B), abs(R)-abs(L));
  force /= max(length(force),0.0001);
  force *= uCurlStr * C;
  vec2 vel = texture2D(uVelocity, vUv).xy + force * uDt;
  gl_FragColor = vec4(vel, 0.0, 1.0);
}`;

/* Display: render dye to screen with tone-mapping */
const FS_DISPLAY = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D uDye;
void main(){
  vec3 c = texture2D(uDye, vUv).rgb;
  /* Reinhard tone-map, then gamma */
  c = c / (c + 0.18);
  c = pow(max(c, 0.0), vec3(0.75));
  gl_FragColor = vec4(c * 1.6, 1.0);
}`;

/* ── WebGL helpers ─────────────────────────────────────────── */
function mkShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function mkProgram(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, mkShader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, mkShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  p.u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i);
    p.u[info.name] = gl.getUniformLocation(p, info.name);
  }
  return p;
}

function mkFBO(gl, w, h, fmt, type, filter) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, fmt, w, h, 0, fmt, type, null);
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, w, h);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return {
    tex, fb, w, h,
    tx: 1 / w, ty: 1 / h,
    bind(slot) {
      gl.activeTexture(gl.TEXTURE0 + slot);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      return slot;
    },
  };
}

function mkDFBO(gl, w, h, fmt, type, filter) {
  let a = mkFBO(gl, w, h, fmt, type, filter);
  let b = mkFBO(gl, w, h, fmt, type, filter);
  return {
    get r() { return a; },
    get w() { return b; },
    swap() { [a, b] = [b, a]; },
  };
}

function hsl(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const ch = (n) => { const k = (n + h * 12) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return [ch(0), ch(8), ch(4)];
}

/* ── Component ─────────────────────────────────────────────── */
export default function FluidCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = ref.current;
    if (!canvas) return;

    /* Size canvas to actual viewport — offsetWidth=0 on fixed elements before layout */
    let W = window.innerWidth;
    let H = window.innerHeight;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);

    const gl = canvas.getContext("webgl", {
      alpha: false, antialias: false, depth: false,
      stencil: false, preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    /* Float texture support */
    const hfExt = gl.getExtension("OES_texture_half_float");
    gl.getExtension("OES_texture_half_float_linear");
    const FLOAT  = hfExt ? hfExt.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    const FILTER = hfExt ? gl.LINEAR : gl.NEAREST;
    const RGBA   = gl.RGBA;

    /* Programs */
    const pSplat    = mkProgram(gl, VS, FS_SPLAT);
    const pAdvect   = mkProgram(gl, VS, FS_ADVECT);
    const pDiv      = mkProgram(gl, VS, FS_DIV);
    const pPressure = mkProgram(gl, VS, FS_PRESSURE);
    const pGradient = mkProgram(gl, VS, FS_GRADIENT);
    const pCurl     = mkProgram(gl, VS, FS_CURL);
    const pVort     = mkProgram(gl, VS, FS_VORTICITY);
    const pDisplay  = mkProgram(gl, VS, FS_DISPLAY);

    /* Quad buffer */
    const qBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, qBuf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    function quad(prog) {
      gl.bindBuffer(gl.ARRAY_BUFFER, qBuf);
      const loc = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }

    /* FBOs */
    const vel  = mkDFBO(gl, SIM_RES, SIM_RES, RGBA, FLOAT, FILTER);
    const dye  = mkDFBO(gl, DYE_RES, DYE_RES, RGBA, FLOAT, FILTER);
    const divF = mkFBO (gl, SIM_RES, SIM_RES, RGBA, FLOAT, gl.NEAREST);
    const curl = mkFBO (gl, SIM_RES, SIM_RES, RGBA, FLOAT, gl.NEAREST);
    const pres = mkDFBO(gl, SIM_RES, SIM_RES, RGBA, FLOAT, gl.NEAREST);

    /* ── Pointer state ── */
    // prevX/Y track last position; on first move dx/dy will be large so we clamp
    let prevX = -1, prevY = -1;
    const splats = [];   // queue of splats to inject next frame
    let colorIdx = 0;

    function pushSplat(cx, cy, dx, dy, colorRGB, radius) {
      splats.push({ x: cx, y: cy, dx, dy, color: colorRGB, radius });
    }

    function onMouseMove(e) {
      const x = e.clientX / W;
      const y = 1 - e.clientY / H;
      if (prevX < 0) { prevX = x; prevY = y; return; }
      const dx = (x - prevX) * SPLAT_FORCE;
      const dy = (y - prevY) * SPLAT_FORCE;
      if (Math.abs(dx) + Math.abs(dy) > 0.01) {
        const [r, g, b] = hsl(...PALETTE[colorIdx % PALETTE.length]);
        colorIdx++;
        pushSplat(x, y, dx, dy, [r, g, b], SPLAT_RADIUS);
      }
      prevX = x; prevY = y;
    }

    function onTouchMove(e) {
      const t = e.touches[0];
      const x = t.clientX / W;
      const y = 1 - t.clientY / H;
      if (prevX < 0) { prevX = x; prevY = y; return; }
      const dx = (x - prevX) * SPLAT_FORCE;
      const dy = (y - prevY) * SPLAT_FORCE;
      if (Math.abs(dx) + Math.abs(dy) > 0.01) {
        const [r, g, b] = hsl(...PALETTE[colorIdx % PALETTE.length]);
        colorIdx++;
        pushSplat(x, y, dx, dy, [r, g, b], SPLAT_RADIUS);
      }
      prevX = x; prevY = y;
    }

    function onResize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      prevX = prevY = -1;
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove",  onTouchMove, { passive: true });
    window.addEventListener("resize",    onResize,    { passive: true });

    /* ── Draw helpers ── */
    function toFBO(prog, fbo) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fb);
      gl.viewport(0, 0, fbo.w, fbo.h);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function toScreen() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /* ── Splat inject ── */
    function doSplat(s) {
      const aspect = W / H;

      /* Velocity */
      gl.useProgram(pSplat); quad(pSplat);
      gl.uniform1i(pSplat.u["uBase"],   vel.r.bind(0));
      gl.uniform2f(pSplat.u["uPoint"],  s.x, s.y);
      gl.uniform3f(pSplat.u["uColor"],  s.dx, s.dy, 0.0);
      gl.uniform1f(pSplat.u["uRadius"], s.radius);
      gl.uniform1f(pSplat.u["uAspect"],aspect);
      toFBO(pSplat, vel.w);
      vel.swap();

      /* Dye */
      gl.uniform1i(pSplat.u["uBase"],   dye.r.bind(0));
      gl.uniform3f(pSplat.u["uColor"],  s.color[0], s.color[1], s.color[2]);
      toFBO(pSplat, dye.w);
      dye.swap();
    }

    /* ── Ambient auto-splat ── */
    let autoT = 0;
    let autoColorIdx = 0;
    function ambientSplat(t) {
      const [h, s, l] = PALETTE[autoColorIdx % PALETTE.length];
      autoColorIdx++;
      const col   = hsl(h, s, l);
      const angle = t * 0.00025;
      const x     = 0.5 + 0.3 * Math.cos(angle);
      const y     = 0.5 + 0.3 * Math.sin(angle * 0.61803);
      const dx    = -Math.sin(angle)         * 120;
      const dy    =  Math.cos(angle * 0.618) * 120;
      pushSplat(x, y, dx, dy, col, SPLAT_RADIUS * 1.4);
    }

    /* ── Main loop ── */
    let raf, lastT = performance.now();

    function frame(t) {
      raf = requestAnimationFrame(frame);

      const dt = Math.min((t - lastT) * 0.001, 0.033);
      lastT = t;

      /* Ambient splat at controlled interval */
      autoT += dt;
      if (autoT >= AUTO_SPLAT_INTERVAL) {
        autoT = 0;
        ambientSplat(t);
      }

      /* Flush splat queue */
      while (splats.length) doSplat(splats.shift());

      /* Curl */
      gl.useProgram(pCurl); quad(pCurl);
      gl.uniform1i(pCurl.u["uVelocity"], vel.r.bind(0));
      gl.uniform2f(pCurl.u["uTexel"],    vel.r.tx, vel.r.ty);
      toFBO(pCurl, curl);

      /* Vorticity */
      gl.useProgram(pVort); quad(pVort);
      gl.uniform1i(pVort.u["uVelocity"], vel.r.bind(0));
      gl.uniform1i(pVort.u["uCurl"],     curl.bind(1));
      gl.uniform2f(pVort.u["uTexel"],    vel.r.tx, vel.r.ty);
      gl.uniform1f(pVort.u["uCurlStr"],  CURL_STRENGTH);
      gl.uniform1f(pVort.u["uDt"],       dt);
      toFBO(pVort, vel.w);
      vel.swap();

      /* Divergence */
      gl.useProgram(pDiv); quad(pDiv);
      gl.uniform1i(pDiv.u["uVelocity"], vel.r.bind(0));
      gl.uniform2f(pDiv.u["uTexel"],    vel.r.tx, vel.r.ty);
      toFBO(pDiv, divF);

      /* Clear pressure */
      gl.bindFramebuffer(gl.FRAMEBUFFER, pres.r.fb);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, pres.w.fb);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);

      /* Pressure solve */
      for (let i = 0; i < PRESSURE_ITER; i++) {
        gl.useProgram(pPressure); quad(pPressure);
        gl.uniform1i(pPressure.u["uPressure"],  pres.r.bind(0));
        gl.uniform1i(pPressure.u["uDivergence"],divF.bind(1));
        gl.uniform2f(pPressure.u["uTexel"],     pres.r.tx, pres.r.ty);
        toFBO(pPressure, pres.w);
        pres.swap();
      }

      /* Gradient subtract */
      gl.useProgram(pGradient); quad(pGradient);
      gl.uniform1i(pGradient.u["uPressure"], pres.r.bind(0));
      gl.uniform1i(pGradient.u["uVelocity"], vel.r.bind(1));
      gl.uniform2f(pGradient.u["uTexel"],    pres.r.tx, pres.r.ty);
      toFBO(pGradient, vel.w);
      vel.swap();

      /* Advect velocity (self-advect) */
      gl.useProgram(pAdvect); quad(pAdvect);
      gl.uniform1i(pAdvect.u["uVelocity"],    vel.r.bind(0));
      gl.uniform1i(pAdvect.u["uSource"],      vel.r.bind(0));
      gl.uniform2f(pAdvect.u["uTexelVel"],    vel.r.tx, vel.r.ty);
      gl.uniform2f(pAdvect.u["uTexelSrc"],    vel.r.tx, vel.r.ty);
      gl.uniform1f(pAdvect.u["uDt"],          dt);
      gl.uniform1f(pAdvect.u["uDissipation"], VELOCITY_DISSIPATION);
      toFBO(pAdvect, vel.w);
      vel.swap();

      /* Advect dye */
      gl.uniform1i(pAdvect.u["uVelocity"],    vel.r.bind(0));
      gl.uniform1i(pAdvect.u["uSource"],      dye.r.bind(1));
      gl.uniform2f(pAdvect.u["uTexelVel"],    vel.r.tx, vel.r.ty);
      gl.uniform2f(pAdvect.u["uTexelSrc"],    dye.r.tx, dye.r.ty);
      gl.uniform1f(pAdvect.u["uDt"],          dt);
      gl.uniform1f(pAdvect.u["uDissipation"], DENSITY_DISSIPATION);
      toFBO(pAdvect, dye.w);
      dye.swap();

      /* Render to screen */
      gl.useProgram(pDisplay); quad(pDisplay);
      gl.uniform1i(pDisplay.u["uDye"], dye.r.bind(0));
      toScreen();
    }

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("resize",    onResize);
      gl.deleteBuffer(qBuf);
    };
  }, []);

  return <canvas ref={ref} className="fluid-canvas" aria-hidden="true" />;
}

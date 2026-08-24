import { useEffect, useRef } from "react";

/*
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FluidCanvas — WebGL Fluid Aurora Effect
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Architecture (3-texture ping-pong, NO external libraries):

    Texture A  — velocity field  (RG = vec2 velocity)
    Texture B  — dye/colour field (RGB = fluid colour)
    Screen     — final composite with additive blending + blur glow

  Each frame:
    1. SPLAT pass   — inject mouse velocity + colour into A & B
    2. ADVECT pass  — move dye along velocity field (B → B′)
    3. DIFFUSE pass — soft-blur velocity (A → A′, 1 iteration)
    4. DECAY pass   — fade both fields toward zero (natural settle)
    5. RENDER pass  — draw dye field to screen with tone-mapping

  Performance targets:
    • Simulation at ½ resolution (SIM_RES) — ~60fps on mobile
    • Render at full device pixel ratio capped at 2
    • Only GPU textures — zero CPU pixel reads
    • Passive event listeners, no React state updates per frame
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

/* ── Config ────────────────────────────────────────────────── */
const SIM_RES   = 128;   // simulation grid (power of 2, keep small for perf)
const DYE_RES   = 512;   // dye/colour texture resolution
const SPLAT_R   = 0.22;  // splat radius (fraction of smaller dimension)
const VELOCITY_DISSIPATION = 0.978;  // how fast velocity fades (0..1)
const DENSITY_DISSIPATION  = 0.972;  // how fast colour fades
const CURL      = 18;    // vorticity/curl strength — adds swirl
const PRESSURE_ITER = 12; // Jacobi pressure solve iterations

/* Aurora colour palette — HSL hue values cycled per splat */
const PALETTE = [
  [0.72, 0.85, 0.62],   // purple
  [0.88, 0.90, 0.55],   // magenta/pink
  [0.00, 0.78, 0.48],   // deep red
  [0.33, 0.80, 0.42],   // green
  [0.62, 0.75, 0.50],   // blue-cyan
  [0.80, 0.88, 0.58],   // violet
];

/* ── GLSL helpers ──────────────────────────────────────────── */
const VERT = `
  precision highp float;
  attribute vec2 a_pos;
  varying vec2 v_uv;
  void main() {
    v_uv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

/* Bilinear texture sample with manual wrap */
const BILINEAR_FRAG_PREFIX = `
  precision highp float;
  varying vec2 v_uv;
  uniform sampler2D u_tex;
  uniform vec2 u_texel;
`;

/* ── Fragment shaders ──────────────────────────────────────── */

/* Splat: add gaussian blob of velocity+colour at mouse position */
const SPLAT_FRAG = `
  precision highp float;
  varying vec2 v_uv;
  uniform sampler2D u_base;
  uniform vec2  u_pos;
  uniform vec3  u_color;
  uniform float u_radius;
  uniform float u_aspect;
  void main() {
    vec2 p = v_uv - u_pos;
    p.x *= u_aspect;
    float d = exp(-dot(p,p) / u_radius);
    vec3 splat = u_color * d;
    vec3 base  = texture2D(u_base, v_uv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`;

/* Advect: move field along velocity */
const ADVECT_FRAG = `
  precision highp float;
  varying vec2 v_uv;
  uniform sampler2D u_velocity;
  uniform sampler2D u_source;
  uniform vec2  u_texel;
  uniform float u_dt;
  uniform float u_dissipation;
  void main() {
    vec2 vel = texture2D(u_velocity, v_uv).xy;
    vec2 coord = v_uv - u_dt * vel * u_texel;
    vec4 result = texture2D(u_source, coord) * u_dissipation;
    gl_FragColor = result;
  }
`;

/* Divergence of velocity field */
const DIVERGENCE_FRAG = `
  precision highp float;
  varying vec2 v_uv;
  uniform sampler2D u_velocity;
  uniform vec2 u_texel;
  void main() {
    float L = texture2D(u_velocity, v_uv - vec2(u_texel.x,0)).x;
    float R = texture2D(u_velocity, v_uv + vec2(u_texel.x,0)).x;
    float T = texture2D(u_velocity, v_uv + vec2(0,u_texel.y)).y;
    float B = texture2D(u_velocity, v_uv - vec2(0,u_texel.y)).y;
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

/* Pressure Jacobi iteration */
const PRESSURE_FRAG = `
  precision highp float;
  varying vec2 v_uv;
  uniform sampler2D u_pressure;
  uniform sampler2D u_divergence;
  uniform vec2 u_texel;
  void main() {
    float L = texture2D(u_pressure, v_uv - vec2(u_texel.x,0)).x;
    float R = texture2D(u_pressure, v_uv + vec2(u_texel.x,0)).x;
    float T = texture2D(u_pressure, v_uv + vec2(0,u_texel.y)).x;
    float B = texture2D(u_pressure, v_uv - vec2(0,u_texel.y)).x;
    float div = texture2D(u_divergence, v_uv).x;
    float pressure = (L + R + T + B - div) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

/* Subtract pressure gradient from velocity to make it divergence-free */
const GRADIENT_FRAG = `
  precision highp float;
  varying vec2 v_uv;
  uniform sampler2D u_pressure;
  uniform sampler2D u_velocity;
  uniform vec2 u_texel;
  void main() {
    float L = texture2D(u_pressure, v_uv - vec2(u_texel.x,0)).x;
    float R = texture2D(u_pressure, v_uv + vec2(u_texel.x,0)).x;
    float T = texture2D(u_pressure, v_uv + vec2(0,u_texel.y)).x;
    float B = texture2D(u_pressure, v_uv - vec2(0,u_texel.y)).x;
    vec2  vel = texture2D(u_velocity, v_uv).xy;
    vel -= vec2(R - L, T - B) * 0.5;
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

/* Vorticity / curl — adds natural swirling */
const CURL_FRAG = `
  precision highp float;
  varying vec2 v_uv;
  uniform sampler2D u_velocity;
  uniform vec2 u_texel;
  void main() {
    float L = texture2D(u_velocity, v_uv - vec2(u_texel.x,0)).y;
    float R = texture2D(u_velocity, v_uv + vec2(u_texel.x,0)).y;
    float T = texture2D(u_velocity, v_uv + vec2(0,u_texel.y)).x;
    float B = texture2D(u_velocity, v_uv - vec2(0,u_texel.y)).x;
    float curl = R - L - T + B;
    gl_FragColor = vec4(0.5 * curl + 0.5, 0.0, 0.0, 1.0);
  }
`;

/* Apply vorticity confinement */
const VORTICITY_FRAG = `
  precision highp float;
  varying vec2 v_uv;
  uniform sampler2D u_velocity;
  uniform sampler2D u_curl;
  uniform vec2  u_texel;
  uniform float u_curl_str;
  uniform float u_dt;
  void main() {
    float L = texture2D(u_curl, v_uv - vec2(u_texel.x,0)).x;
    float R = texture2D(u_curl, v_uv + vec2(u_texel.x,0)).x;
    float T = texture2D(u_curl, v_uv + vec2(0,u_texel.y)).x;
    float B = texture2D(u_curl, v_uv - vec2(0,u_texel.y)).x;
    float C = texture2D(u_curl, v_uv).x;
    C = (C * 2.0) - 1.0; // remap from [0,1] to [-1,1]
    vec2 force = vec2(abs(T) - abs(B), abs(R) - abs(L));
    float len = max(length(force), 0.0001);
    force = (force / len) * u_curl_str * C;
    vec2 vel = texture2D(u_velocity, v_uv).xy + force * u_dt;
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

/* Final render: tone-map dye to screen */
const DISPLAY_FRAG = `
  precision highp float;
  varying vec2 v_uv;
  uniform sampler2D u_dye;
  uniform float u_brightness;
  void main() {
    vec3 c = texture2D(u_dye, v_uv).rgb;
    /* Filmic tone-map — avoids blow-out, keeps neon feel */
    c = c / (c + vec3(0.16));
    c = pow(c, vec3(0.82));
    gl_FragColor = vec4(c * u_brightness, 1.0);
  }
`;

/* ── WebGL helpers ─────────────────────────────────────────── */
function compileShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function createProgram(gl, vertSrc, fragSrc) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  /* Cache uniform locations */
  prog.uniforms = {};
  const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(prog, i);
    prog.uniforms[info.name] = gl.getUniformLocation(prog, info.name);
  }
  return prog;
}

function createFBO(gl, w, h, internalFormat, format, type, filter) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return {
    texture: tex,
    fbo: fb,
    width: w,
    height: h,
    texelSizeX: 1 / w,
    texelSizeY: 1 / h,
    attach(id) {
      gl.activeTexture(gl.TEXTURE0 + id);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      return id;
    },
  };
}

function createDoubleFBO(gl, w, h, internalFormat, format, type, filter) {
  let read  = createFBO(gl, w, h, internalFormat, format, type, filter);
  let write = createFBO(gl, w, h, internalFormat, format, type, filter);
  return {
    get read()  { return read; },
    get write() { return write; },
    swap() { [read, write] = [write, read]; },
  };
}

function hsl2rgb(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

/* ── React Component ───────────────────────────────────────── */
export default function FluidCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    /* Respect prefers-reduced-motion — skip WebGL entirely */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── Init WebGL ── */
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) return; // WebGL not available — CSS fallback shows

    /* Enable float textures if available (better quality, not required) */
    const halfFloat  = gl.getExtension("OES_texture_half_float");
    const halfLinear = gl.getExtension("OES_texture_half_float_linear");
    const floatType  = halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    const filterMode = halfLinear ? gl.LINEAR : gl.NEAREST;

    const RGBA = gl.RGBA;
    const SIM_W = SIM_RES, SIM_H = SIM_RES;
    const DYE_W = DYE_RES, DYE_H = DYE_RES;

    /* ── Compile programs ── */
    const progSplat      = createProgram(gl, VERT, SPLAT_FRAG);
    const progAdvect     = createProgram(gl, VERT, ADVECT_FRAG);
    const progDivergence = createProgram(gl, VERT, DIVERGENCE_FRAG);
    const progPressure   = createProgram(gl, VERT, PRESSURE_FRAG);
    const progGradient   = createProgram(gl, VERT, GRADIENT_FRAG);
    const progCurl       = createProgram(gl, VERT, CURL_FRAG);
    const progVorticity  = createProgram(gl, VERT, VORTICITY_FRAG);
    const progDisplay    = createProgram(gl, VERT, DISPLAY_FRAG);

    /* ── Full-screen quad ── */
    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    function bindQuad(prog) {
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      const loc = gl.getAttribLocation(prog, "a_pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }

    /* ── FBOs ── */
    let velocity   = createDoubleFBO(gl, SIM_W, SIM_H, RGBA, RGBA, floatType, filterMode);
    let dye        = createDoubleFBO(gl, DYE_W, DYE_H, RGBA, RGBA, floatType, filterMode);
    let divergence = createFBO(gl, SIM_W, SIM_H, RGBA, RGBA, floatType, gl.NEAREST);
    let curl       = createFBO(gl, SIM_W, SIM_H, RGBA, RGBA, floatType, gl.NEAREST);
    let pressure   = createDoubleFBO(gl, SIM_W, SIM_H, RGBA, RGBA, floatType, gl.NEAREST);

    /* ── Resize ── */
    let displayW = 0, displayH = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(canvas.offsetWidth  * dpr);
      const h = Math.floor(canvas.offsetHeight * dpr);
      if (w === displayW && h === displayH) return;
      displayW = w; displayH = h;
      canvas.width  = w;
      canvas.height = h;
    }
    resize();

    /* ── Mouse / touch tracking ── */
    const pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, down: false, moved: false };
    let paletteIdx = 0;
    let autoSplatTimer = 0;

    function onMove(cx, cy) {
      const rect = canvas.getBoundingClientRect();
      const nx = (cx - rect.left) / rect.width;
      const ny = 1.0 - (cy - rect.top)  / rect.height;
      if (pointer.down || true) {
        pointer.dx = (nx - pointer.x) * 8;
        pointer.dy = (ny - pointer.y) * 8;
        pointer.moved = Math.abs(pointer.dx) + Math.abs(pointer.dy) > 0.0001;
      }
      pointer.x = nx; pointer.y = ny;
    }

    const onMouseMove  = (e) => onMove(e.clientX, e.clientY);
    const onTouchMove  = (e) => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); };
    const onMouseDown  = ()  => { pointer.down = true; };
    const onMouseUp    = ()  => { pointer.down = false; };

    window.addEventListener("mousemove",  onMouseMove, { passive: true });
    window.addEventListener("touchmove",  onTouchMove, { passive: false });
    window.addEventListener("mousedown",  onMouseDown, { passive: true });
    window.addEventListener("mouseup",    onMouseUp,   { passive: true });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    /* ── Draw full-screen quad to an FBO ── */
    function drawToFBO(prog, fbo) {
      gl.useProgram(prog);
      bindQuad(prog);
      if (fbo) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
        gl.viewport(0, 0, fbo.width, fbo.height);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, displayW, displayH);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /* ── Splat helper ── */
    function splat(x, y, dx, dy, color, radius) {
      const aspect = displayW / displayH;
      const r = radius * radius;

      /* Velocity splat */
      gl.useProgram(progSplat);
      bindQuad(progSplat);
      gl.uniform1i(progSplat.uniforms["u_base"], velocity.read.attach(0));
      gl.uniform2f(progSplat.uniforms["u_pos"], x, y);
      gl.uniform3f(progSplat.uniforms["u_color"], dx, dy, 0);
      gl.uniform1f(progSplat.uniforms["u_radius"], r);
      gl.uniform1f(progSplat.uniforms["u_aspect"], aspect);
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
      gl.viewport(0, 0, SIM_W, SIM_H);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      velocity.swap();

      /* Dye splat */
      gl.uniform1i(progSplat.uniforms["u_base"], dye.read.attach(0));
      gl.uniform3f(progSplat.uniforms["u_color"], color[0] * 0.28, color[1] * 0.28, color[2] * 0.28);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dye.write.fbo);
      gl.viewport(0, 0, DYE_W, DYE_H);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      dye.swap();
    }

    /* ── Automatic ambient splats when no mouse input ── */
    function autoSplat(t) {
      const idx = Math.floor(t / 1800) % PALETTE.length;
      const [h, s, l] = PALETTE[idx];
      const color = hsl2rgb(h, s, l);
      const angle = t * 0.00028;
      const x = 0.5 + 0.32 * Math.cos(angle);
      const y = 0.5 + 0.32 * Math.sin(angle * 0.7);
      const dx = -Math.sin(angle) * 0.004;
      const dy =  Math.cos(angle * 0.7) * 0.004;
      splat(x, y, dx, dy, color, SPLAT_R * 0.5);
    }

    /* ── Simulation step ── */
    let lastT = performance.now();

    function step(t) {
      resize();
      const dt = Math.min((t - lastT) / 1000, 0.033); // cap at 30fps equivalent
      lastT = t;

      /* Auto splat — creates ambient motion when mouse is idle */
      autoSplatTimer += dt;
      if (autoSplatTimer > 0.08) {
        autoSplatTimer = 0;
        autoSplat(t);
      }

      /* Mouse splat */
      if (pointer.moved) {
        const [h, s, l] = PALETTE[paletteIdx % PALETTE.length];
        const color = hsl2rgb(h, s, l);
        paletteIdx++;
        splat(pointer.x, pointer.y, pointer.dx, pointer.dy, color, SPLAT_R);
        pointer.moved = false;
        pointer.dx = 0; pointer.dy = 0;
      }

      /* ── Curl ── */
      gl.useProgram(progCurl);
      bindQuad(progCurl);
      gl.uniform1i(progCurl.uniforms["u_velocity"], velocity.read.attach(0));
      gl.uniform2f(progCurl.uniforms["u_texel"], velocity.read.texelSizeX, velocity.read.texelSizeY);
      gl.bindFramebuffer(gl.FRAMEBUFFER, curl.fbo);
      gl.viewport(0, 0, SIM_W, SIM_H);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      /* ── Vorticity confinement ── */
      gl.useProgram(progVorticity);
      bindQuad(progVorticity);
      gl.uniform1i(progVorticity.uniforms["u_velocity"], velocity.read.attach(0));
      gl.uniform1i(progVorticity.uniforms["u_curl"],     curl.attach(1));
      gl.uniform2f(progVorticity.uniforms["u_texel"],    velocity.read.texelSizeX, velocity.read.texelSizeY);
      gl.uniform1f(progVorticity.uniforms["u_curl_str"], CURL);
      gl.uniform1f(progVorticity.uniforms["u_dt"],       dt);
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
      gl.viewport(0, 0, SIM_W, SIM_H);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      velocity.swap();

      /* ── Divergence ── */
      gl.useProgram(progDivergence);
      bindQuad(progDivergence);
      gl.uniform1i(progDivergence.uniforms["u_velocity"], velocity.read.attach(0));
      gl.uniform2f(progDivergence.uniforms["u_texel"],    velocity.read.texelSizeX, velocity.read.texelSizeY);
      gl.bindFramebuffer(gl.FRAMEBUFFER, divergence.fbo);
      gl.viewport(0, 0, SIM_W, SIM_H);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      /* ── Pressure solve (Jacobi) ── */
      for (let i = 0; i < PRESSURE_ITER; i++) {
        gl.useProgram(progPressure);
        bindQuad(progPressure);
        gl.uniform1i(progPressure.uniforms["u_pressure"],   pressure.read.attach(0));
        gl.uniform1i(progPressure.uniforms["u_divergence"], divergence.attach(1));
        gl.uniform2f(progPressure.uniforms["u_texel"],      pressure.read.texelSizeX, pressure.read.texelSizeY);
        gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.write.fbo);
        gl.viewport(0, 0, SIM_W, SIM_H);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        pressure.swap();
      }

      /* ── Subtract pressure gradient ── */
      gl.useProgram(progGradient);
      bindQuad(progGradient);
      gl.uniform1i(progGradient.uniforms["u_pressure"], pressure.read.attach(0));
      gl.uniform1i(progGradient.uniforms["u_velocity"], velocity.read.attach(1));
      gl.uniform2f(progGradient.uniforms["u_texel"],    pressure.read.texelSizeX, pressure.read.texelSizeY);
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
      gl.viewport(0, 0, SIM_W, SIM_H);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      velocity.swap();

      /* ── Advect velocity ── */
      gl.useProgram(progAdvect);
      bindQuad(progAdvect);
      gl.uniform1i(progAdvect.uniforms["u_velocity"],    velocity.read.attach(0));
      gl.uniform1i(progAdvect.uniforms["u_source"],      velocity.read.attach(0));
      gl.uniform2f(progAdvect.uniforms["u_texel"],       velocity.read.texelSizeX, velocity.read.texelSizeY);
      gl.uniform1f(progAdvect.uniforms["u_dt"],          dt);
      gl.uniform1f(progAdvect.uniforms["u_dissipation"], VELOCITY_DISSIPATION);
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
      gl.viewport(0, 0, SIM_W, SIM_H);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      velocity.swap();

      /* ── Advect dye ── */
      gl.uniform1i(progAdvect.uniforms["u_velocity"],    velocity.read.attach(0));
      gl.uniform1i(progAdvect.uniforms["u_source"],      dye.read.attach(1));
      gl.uniform2f(progAdvect.uniforms["u_texel"],       dye.read.texelSizeX, dye.read.texelSizeY);
      gl.uniform1f(progAdvect.uniforms["u_dt"],          dt);
      gl.uniform1f(progAdvect.uniforms["u_dissipation"], DENSITY_DISSIPATION);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dye.write.fbo);
      gl.viewport(0, 0, DYE_W, DYE_H);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      dye.swap();

      /* ── Render to screen ── */
      gl.useProgram(progDisplay);
      bindQuad(progDisplay);
      gl.uniform1i(progDisplay.uniforms["u_dye"],        dye.read.attach(0));
      gl.uniform1f(progDisplay.uniforms["u_brightness"], 1.8);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, displayW, displayH);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /* ── RAF loop ── */
    let rafId;
    function loop(t) {
      rafId = requestAnimationFrame(loop);
      step(t);
    }
    rafId = requestAnimationFrame(loop);

    /* ── Cleanup ── */
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("mousedown",  onMouseDown);
      window.removeEventListener("mouseup",    onMouseUp);
      gl.deleteBuffer(quadBuf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fluid-canvas"
      aria-hidden="true"
    />
  );
}

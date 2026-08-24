import { useEffect, useRef } from "react";

/*
  FluidCanvas — PavelDoGreat WebGL Fluid Simulation
  MIT License © 2017 Pavel Dobryakov
  Ported to React, stripped of dat.GUI/promo/GA,
  tuned for aurora colours + always-on mouse (no click required).
*/

export default function FluidCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── Config ── */
    const config = {
      SIM_RESOLUTION:      128,
      DYE_RESOLUTION:      1024,
      DENSITY_DISSIPATION: 1.0,
      VELOCITY_DISSIPATION:0.2,
      PRESSURE:            0.8,
      PRESSURE_ITERATIONS: 20,
      CURL:                30,
      SPLAT_RADIUS:        0.12,
      SPLAT_FORCE:         3000,
      COLORFUL:            true,
      COLOR_UPDATE_SPEED:  10,
      BACK_COLOR:          { r: 0, g: 0, b: 0 },
      TRANSPARENT:         true,
      BLOOM:               false,
      SUNRAYS:             false,
    };

    /* ── Pointer prototype ── */
    function Pointer() {
      this.id = -1;
      this.texcoordX = 0; this.texcoordY = 0;
      this.prevTexcoordX = 0; this.prevTexcoordY = 0;
      this.deltaX = 0; this.deltaY = 0;
      this.down = false; this.moved = false;
      this.color = [30, 0, 300];
    }

    const pointers = [new Pointer()];
    const splatStack = [];

    /* ── WebGL context ── */
    function getWebGLContext(c) {
      const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
      let gl = c.getContext("webgl2", params);
      const isWebGL2 = !!gl;
      if (!isWebGL2) gl = c.getContext("webgl", params) || c.getContext("experimental-webgl", params);
      if (!gl) return null;

      let halfFloat, supportLinearFiltering;
      if (isWebGL2) {
        gl.getExtension("EXT_color_buffer_float");
        supportLinearFiltering = gl.getExtension("OES_texture_float_linear");
      } else {
        halfFloat = gl.getExtension("OES_texture_half_float");
        supportLinearFiltering = gl.getExtension("OES_texture_half_float_linear");
      }
      gl.clearColor(0, 0, 0, 1);
      const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat && halfFloat.HALF_FLOAT_OES;

      function getSupportedFormat(intFmt, fmt, type) {
        if (!supportRenderTextureFormat(intFmt, fmt, type)) {
          if (intFmt === gl.R16F)  return getSupportedFormat(gl.RG16F, gl.RG, type);
          if (intFmt === gl.RG16F) return getSupportedFormat(gl.RGBA16F, gl.RGBA, type);
          return null;
        }
        return { internalFormat: intFmt, format: fmt };
      }
      function supportRenderTextureFormat(intFmt, fmt, type) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, intFmt, 4, 4, 0, fmt, type, null);
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      }

      let formatRGBA, formatRG, formatR;
      if (isWebGL2) {
        formatRGBA = getSupportedFormat(gl.RGBA16F, gl.RGBA, halfFloatTexType);
        formatRG   = getSupportedFormat(gl.RG16F,   gl.RG,   halfFloatTexType);
        formatR    = getSupportedFormat(gl.R16F,    gl.RED,  halfFloatTexType);
      } else {
        formatRGBA = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG   = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR    = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
      }

      if (!halfFloatTexType) return null; // no float texture support

      return { gl, ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering } };
    }

    const ctx = getWebGLContext(canvas);
    if (!ctx) return;
    const { gl, ext } = ctx;

    /* ── Compile / program helpers ── */
    function compileShader(type, source, keywords) {
      if (keywords) source = keywords.map(k => `#define ${k}`).join("\n") + "\n" + source;
      const s = gl.createShader(type);
      gl.shaderSource(s, source); gl.compileShader(s);
      return s;
    }
    function createProgram(vs, fs) {
      const p = gl.createProgram();
      gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
      return p;
    }
    function getUniforms(program) {
      const u = {};
      const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const name = gl.getActiveUniform(program, i).name;
        u[name] = gl.getUniformLocation(program, name);
      }
      return u;
    }
    class Program {
      constructor(vs, fs) {
        this.program = createProgram(vs, fs);
        this.uniforms = getUniforms(this.program);
      }
      bind() { gl.useProgram(this.program); }
    }
    class Material {
      constructor(vs, fsSrc) {
        this.vs = vs; this.fsSrc = fsSrc;
        this.programs = {}; this.activeProgram = null; this.uniforms = {};
      }
      setKeywords(kw) {
        const hash = kw.reduce((h, k) => {
          for (let i = 0; i < k.length; i++) h = (h << 5) - h + k.charCodeAt(i) | 0;
          return h;
        }, 0);
        if (!this.programs[hash]) {
          const fs = compileShader(gl.FRAGMENT_SHADER, this.fsSrc, kw);
          this.programs[hash] = createProgram(this.vs, fs);
        }
        if (this.programs[hash] === this.activeProgram) return;
        this.uniforms = getUniforms(this.programs[hash]);
        this.activeProgram = this.programs[hash];
      }
      bind() { gl.useProgram(this.activeProgram); }
    }

    /* ── Blit (full-screen quad) ── */
    const blit = (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
      return (target, clear = false) => {
        if (target == null) {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.viewport(0, 0, target.width, target.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        if (clear) { gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT); }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };
    })();

    /* ── FBO helpers ── */
    function createFBO(w, h, intFmt, fmt, type, param) {
      gl.activeTexture(gl.TEXTURE0);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, intFmt, w, h, 0, fmt, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0,0,w,h); gl.clear(gl.COLOR_BUFFER_BIT);
      return {
        texture: tex, fbo, width: w, height: h,
        texelSizeX: 1/w, texelSizeY: 1/h,
        attach(id) { gl.activeTexture(gl.TEXTURE0+id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; }
      };
    }
    function createDoubleFBO(w, h, intFmt, fmt, type, param) {
      let fbo1 = createFBO(w,h,intFmt,fmt,type,param);
      let fbo2 = createFBO(w,h,intFmt,fmt,type,param);
      return {
        width:w, height:h, texelSizeX:fbo1.texelSizeX, texelSizeY:fbo1.texelSizeY,
        get read() { return fbo1; }, set read(v) { fbo1=v; },
        get write() { return fbo2; }, set write(v) { fbo2=v; },
        swap() { [fbo1,fbo2]=[fbo2,fbo1]; }
      };
    }
    function resizeFBO(target, w, h, intFmt, fmt, type, param) {
      const n = createFBO(w,h,intFmt,fmt,type,param);
      copyProgram.bind();
      gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
      blit(n);
      return n;
    }
    function resizeDoubleFBO(target, w, h, intFmt, fmt, type, param) {
      if (target.width===w && target.height===h) return target;
      target.read  = resizeFBO(target.read,  w,h,intFmt,fmt,type,param);
      target.write = createFBO(w,h,intFmt,fmt,type,param);
      target.width=w; target.height=h;
      target.texelSizeX=1/w; target.texelSizeY=1/h;
      return target;
    }

    /* ── Shaders ── */
    const baseVS = compileShader(gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform vec2 texelSize;
      void main(){
        vUv=aPosition*0.5+0.5;
        vL=vUv-vec2(texelSize.x,0); vR=vUv+vec2(texelSize.x,0);
        vT=vUv+vec2(0,texelSize.y);  vB=vUv-vec2(0,texelSize.y);
        gl_Position=vec4(aPosition,0,1);
      }`);

    const copyFS       = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;void main(){gl_FragColor=texture2D(uTexture,vUv);}`);
    const clearFS      = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;uniform float value;void main(){gl_FragColor=value*texture2D(uTexture,vUv);}`);
    const colorFS      = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;uniform vec4 color;void main(){gl_FragColor=color;}`);
    const splatFS      = compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uTarget;uniform float aspectRatio;uniform vec3 color;uniform vec2 point;uniform float radius;void main(){vec2 p=vUv-point;p.x*=aspectRatio;vec3 splat=exp(-dot(p,p)/radius)*color;vec3 base=texture2D(uTarget,vUv).xyz;gl_FragColor=vec4(base+splat,1);}`);
    const advectionFS  = compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uVelocity;uniform sampler2D uSource;uniform vec2 texelSize;uniform vec2 dyeTexelSize;uniform float dt;uniform float dissipation;vec4 bilerp(sampler2D sam,vec2 uv,vec2 tsize){vec2 st=uv/tsize-.5;vec2 iuv=floor(st);vec2 fuv=fract(st);vec4 a=texture2D(sam,(iuv+vec2(.5,.5))*tsize);vec4 b=texture2D(sam,(iuv+vec2(1.5,.5))*tsize);vec4 c=texture2D(sam,(iuv+vec2(.5,1.5))*tsize);vec4 d=texture2D(sam,(iuv+vec2(1.5,1.5))*tsize);return mix(mix(a,b,fuv.x),mix(c,d,fuv.x),fuv.y);}void main(){` +
      (ext.supportLinearFiltering
        ? `vec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;vec4 result=texture2D(uSource,coord);`
        : `vec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;vec4 result=bilerp(uSource,coord,dyeTexelSize);`) +
      `float decay=1.+dissipation*dt;gl_FragColor=result/decay;}`);
    const divergenceFS = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).x;float R=texture2D(uVelocity,vR).x;float T=texture2D(uVelocity,vT).y;float B=texture2D(uVelocity,vB).y;vec2 C=texture2D(uVelocity,vUv).xy;if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;float div=.5*(R-L+T-B);gl_FragColor=vec4(div,0,0,1);}`);
    const curlFS       = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).y;float R=texture2D(uVelocity,vR).y;float T=texture2D(uVelocity,vT).x;float B=texture2D(uVelocity,vB).x;float vorticity=R-L-T+B;gl_FragColor=vec4(.5*vorticity,0,0,1);}`);
    const vorticityFS  = compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform sampler2D uVelocity;uniform sampler2D uCurl;uniform float curl;uniform float dt;void main(){float L=texture2D(uCurl,vL).x;float R=texture2D(uCurl,vR).x;float T=texture2D(uCurl,vT).x;float B=texture2D(uCurl,vB).x;float C=texture2D(uCurl,vUv).x;vec2 force=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));force/=length(force)+.0001;force*=curl*C;force.y*=-1.;vec2 vel=texture2D(uVelocity,vUv).xy+force*dt;vel=min(max(vel,-1000.),1000.);gl_FragColor=vec4(vel,0,1);}`);
    const pressureFS   = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uPressure;uniform sampler2D uDivergence;void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;float divergence=texture2D(uDivergence,vUv).x;gl_FragColor=vec4((L+R+B+T-divergence)*.25,0,0,1);}`);
    const gradSubFS    = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uPressure;uniform sampler2D uVelocity;void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;vec2 vel=texture2D(uVelocity,vUv).xy;vel.xy-=vec2(R-L,T-B);gl_FragColor=vec4(vel,0,1);}`);
    const displayFSsrc = `precision highp float;precision highp sampler2D;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform sampler2D uTexture;uniform vec2 texelSize;vec3 linearToGamma(vec3 c){c=max(c,vec3(0));return max(1.055*pow(c,vec3(.416666667))-.055,vec3(0));}void main(){vec3 c=texture2D(uTexture,vUv).rgb;float a=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c,a);}`;

    const copyProgram      = new Program(baseVS, copyFS);
    const clearProgram     = new Program(baseVS, clearFS);
    const colorProgram     = new Program(baseVS, colorFS);
    const splatProgram     = new Program(baseVS, splatFS);
    const advectionProgram = new Program(baseVS, advectionFS);
    const divergenceProgram= new Program(baseVS, divergenceFS);
    const curlProgram      = new Program(baseVS, curlFS);
    const vorticityProgram = new Program(baseVS, vorticityFS);
    const pressureProgram  = new Program(baseVS, pressureFS);
    const gradSubProgram   = new Program(baseVS, gradSubFS);
    const displayMaterial  = new Material(baseVS, displayFSsrc);
    displayMaterial.setKeywords([]);

    /* ── FBO init ── */
    let dye, velocity, divergenceF, curlF, pressure;

    function initFBOs() {
      const texType  = ext.halfFloatTexType;
      const rgba     = ext.formatRGBA;
      const rg       = ext.formatRG;
      const r        = ext.formatR;
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
      gl.disable(gl.BLEND);

      const simRes = getResolution(config.SIM_RESOLUTION);
      const dyeRes = getResolution(config.DYE_RESOLUTION);

      if (!dye)       dye      = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
      else            dye      = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
      if (!velocity)  velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
      else            velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);

      divergenceF = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
      curlF       = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
      pressure    = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    }

    function getResolution(res) {
      let ar = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (ar < 1) ar = 1/ar;
      const min = Math.round(res);
      const max = Math.round(res * ar);
      return gl.drawingBufferWidth > gl.drawingBufferHeight
        ? { width: max, height: min }
        : { width: min, height: max };
    }

    /* ── Resize ── */
    function resizeCanvas() {
      const w = scaleByPixelRatio(window.innerWidth);
      const h = scaleByPixelRatio(window.innerHeight);
      if (canvas.width === w && canvas.height === h) return false;
      canvas.width = w; canvas.height = h;
      return true;
    }
    function scaleByPixelRatio(v) {
      return Math.floor(v * (window.devicePixelRatio || 1));
    }

    initFBOs();
    multipleSplats(Math.floor(Math.random() * 5) + 2);

    /* ── Simulation step ── */
    function step(dt) {
      gl.disable(gl.BLEND);

      curlProgram.bind();
      gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(curlF);

      vorticityProgram.bind();
      gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(vorticityProgram.uniforms.uCurl,     curlF.attach(1));
      gl.uniform1f(vorticityProgram.uniforms.curl,      config.CURL);
      gl.uniform1f(vorticityProgram.uniforms.dt,        dt);
      blit(velocity.write); velocity.swap();

      divergenceProgram.bind();
      gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergenceF);

      clearProgram.bind();
      gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
      blit(pressure.write); pressure.swap();

      pressureProgram.bind();
      gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(pressureProgram.uniforms.uDivergence, divergenceF.attach(0));
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write); pressure.swap();
      }

      gradSubProgram.bind();
      gl.uniform2f(gradSubProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(gradSubProgram.uniforms.uPressure, pressure.read.attach(0));
      gl.uniform1i(gradSubProgram.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write); velocity.swap();

      advectionProgram.bind();
      gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      if (!ext.supportLinearFiltering)
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      const velId = velocity.read.attach(0);
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velId);
      gl.uniform1i(advectionProgram.uniforms.uSource,   velId);
      gl.uniform1f(advectionProgram.uniforms.dt,          dt);
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
      blit(velocity.write); velocity.swap();

      if (!ext.supportLinearFiltering)
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advectionProgram.uniforms.uSource,   dye.read.attach(1));
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
      blit(dye.write); dye.swap();
    }

    /* ── Render ── */
    function render(target) {
      if (config.TRANSPARENT) {
        /* Clear to fully transparent so site background shows through */
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
      } else {
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        /* Draw black background */
        colorProgram.bind();
        gl.uniform4f(colorProgram.uniforms.color, 0, 0, 0, 1);
        blit(target);
      }
      drawDisplay(target);
    }
    function drawDisplay(target) {
      const w = target ? target.width : gl.drawingBufferWidth;
      const h = target ? target.height : gl.drawingBufferHeight;
      displayMaterial.bind();
      gl.uniform2f(displayMaterial.uniforms.texelSize, 1/w, 1/h);
      gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
      blit(target);
    }

    /* ── Splat ── */
    function splat(x, y, dx, dy, color) {
      splatProgram.bind();
      gl.uniform1i(splatProgram.uniforms.uTarget,    velocity.read.attach(0));
      gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(splatProgram.uniforms.point,       x, y);
      gl.uniform3f(splatProgram.uniforms.color,       dx, dy, 0);
      gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100));
      blit(velocity.write); velocity.swap();

      gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
      gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
      blit(dye.write); dye.swap();
    }
    function multipleSplats(n) {
      for (let i = 0; i < n; i++) {
        const c = generateColor();
        c.r *= 10; c.g *= 10; c.b *= 10;
        splat(Math.random(), Math.random(), 1000*(Math.random()-.5), 1000*(Math.random()-.5), c);
      }
    }
    function correctRadius(r) {
      const ar = canvas.width / canvas.height;
      if (ar > 1) r *= ar;
      return r;
    }
    function splatPointer(p) {
      const dx = p.deltaX * config.SPLAT_FORCE;
      const dy = p.deltaY * config.SPLAT_FORCE;
      splat(p.texcoordX, p.texcoordY, dx, dy, p.color);
    }

    /* ── Colour utils ── */
    let colorUpdateTimer = 0;
    function updateColors(dt) {
      if (!config.COLORFUL) return;
      colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
      if (colorUpdateTimer >= 1) {
        colorUpdateTimer = colorUpdateTimer % 1;
        pointers.forEach(p => { p.color = generateColor(); });
      }
    }
    function generateColor() {
      const c = HSVtoRGB(Math.random(), 1, 1);
      c.r *= 0.15; c.g *= 0.15; c.b *= 0.15;
      return c;
    }
    function HSVtoRGB(h, s, v) {
      const i = Math.floor(h*6), f = h*6-i;
      const p=v*(1-s), q=v*(1-f*s), t=v*(1-(1-f)*s);
      switch(i%6){
        case 0:return{r:v,g:t,b:p};case 1:return{r:q,g:v,b:p};
        case 2:return{r:p,g:v,b:t};case 3:return{r:p,g:q,b:v};
        case 4:return{r:t,g:p,b:v};case 5:return{r:v,g:p,b:q};
      }
    }

    /* ── Pointer helpers ── */
    function updatePointerDown(pointer, id, posX, posY) {
      pointer.id = id; pointer.down = true; pointer.moved = false;
      pointer.texcoordX = posX / canvas.width;
      pointer.texcoordY = 1 - posY / canvas.height;
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.deltaX = 0; pointer.deltaY = 0;
      pointer.color = generateColor();
    }
    function updatePointerMove(pointer, posX, posY) {
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.texcoordX = posX / canvas.width;
      pointer.texcoordY = 1 - posY / canvas.height;
      pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
      pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    }
    function correctDeltaX(d) { const ar=canvas.width/canvas.height; if(ar<1) d*=ar; return d; }
    function correctDeltaY(d) { const ar=canvas.width/canvas.height; if(ar>1) d/=ar; return d; }

    /* ── Events — listen on window, always-on (no click required) ── */
    function onMouseMove(e) {
      const p = pointers[0];
      /* Always update, even without mousedown — gives continuous trail */
      p.down = true;
      updatePointerMove(p, scaleByPixelRatio(e.clientX), scaleByPixelRatio(e.clientY));
    }
    function onMouseLeave() { pointers[0].down = false; }
    function onTouchMove(e) {
      const touches = e.changedTouches;
      for (let i = 0; i < touches.length; i++) {
        let p = pointers.find(pt => pt.id === touches[i].identifier);
        if (!p) { p = new Pointer(); pointers.push(p); }
        if (!p.down) updatePointerDown(p, touches[i].identifier, scaleByPixelRatio(touches[i].pageX), scaleByPixelRatio(touches[i].pageY));
        updatePointerMove(p, scaleByPixelRatio(touches[i].pageX), scaleByPixelRatio(touches[i].pageY));
      }
    }
    function onTouchStart(e) {
      const touches = e.changedTouches;
      for (let i = 0; i < touches.length; i++) {
        while (pointers.length <= i+1) pointers.push(new Pointer());
        updatePointerDown(pointers[i+1], touches[i].identifier, scaleByPixelRatio(touches[i].pageX), scaleByPixelRatio(touches[i].pageY));
      }
    }
    function onTouchEnd(e) {
      const touches = e.changedTouches;
      for (let i = 0; i < touches.length; i++) {
        const p = pointers.find(pt => pt.id === touches[i].identifier);
        if (p) p.down = false;
      }
    }

    window.addEventListener("mousemove",  onMouseMove,  { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove",  onTouchMove,  { passive: true });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true });

    /* ── Main loop ── */
    let lastTime = Date.now();
    let rafId;

    function update() {
      rafId = requestAnimationFrame(update);
      const now = Date.now();
      let dt = Math.min((now - lastTime) / 1000, 0.016666);
      lastTime = now;

      if (resizeCanvas()) initFBOs();

      updateColors(dt);

      if (splatStack.length > 0) multipleSplats(splatStack.pop());
      pointers.forEach(p => { if (p.moved) { p.moved = false; splatPointer(p); } });

      step(dt);
      render(null);
    }

    rafId = requestAnimationFrame(update);

    /* ── Cleanup ── */
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("touchend",   onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fluid-canvas"
      aria-hidden="true"
      style={{ position:"fixed", top:0, left:0, width:"100vw", height:"100vh" }}
    />
  );
}

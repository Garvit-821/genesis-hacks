/**
 * The printing press: one WebGL canvas that draws every panel of the home page story.
 *
 * The DOM keeps the layout, captions, buttons and alt text; this layer reads each panel's
 * on-screen rectangle every frame and prints it with effects CSS cannot do:
 *   rule   the panel border is ruled clockwise, like a comic page being drawn
 *   print  the engraving soaks in like ink: a noisy front, dark masses first, wet specks ahead
 *   blur   a zoom blur while the camera pushes into a panel
 *   dev    hold to develop the photograph under a red darkroom safelight; the patch follows you
 *   splash an ink splash with splatter and a vermilion lip covers the stage between plates
 *
 * GSAP tweens the plain numbers on each PressPanel and on `splash`; this file only draws them.
 * Simplex noise: Ashima Arts / Stefan Gustavson (MIT).
 */

export type PressPanel = {
  el: HTMLElement
  frame: HTMLElement
  page: HTMLElement
  ink: string
  photo: string
  pos: [number, number]
  border: number
  shadow: boolean
  seed: number
  rule: number
  print: number
  blur: number
  dev: number
  dx: number
  dy: number
  tx: number
  ty: number
  inkTex: WebGLTexture | null
  photoTex: WebGLTexture | null
  imgW: number
  imgH: number
  photoState: 'none' | 'loading' | 'ready'
}

export type Press = {
  panels: PressPanel[]
  /** v: 0 nothing, 0..1 ink spreads from (x, y) until it covers, 1..2 it drains away from (x, y). */
  splash: { v: number; x: number; y: number; seed: number }
  loadPhoto: (p: PressPanel) => void
  destroy: () => void
}

const NOISE = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 3; i++) { s += a * snoise(p); p *= 2.07; a *= 0.5; }
  return s;
}
float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
`

const VERT = `
attribute vec2 aPos;
uniform vec4 uRect;
uniform vec2 uView;
varying vec2 vLocal;
void main() {
  vLocal = aPos;
  vec2 px = uRect.xy + aPos * uRect.zw;
  vec2 c = px / uView * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
}`

const PANEL_FRAG = `
precision highp float;
varying vec2 vLocal;
uniform sampler2D uInk;
uniform sampler2D uPhoto;
uniform float uHasPhoto;
uniform vec4 uRect;
uniform vec4 uFrame;
uniform vec2 uImg;
uniform vec2 uPos;
uniform float uRule;
uniform float uPrint;
uniform vec3 uDev;
uniform float uBlur;
uniform float uTime;
uniform float uSeed;
uniform float uBorder;
uniform float uSolid;
uniform vec3 uSolidColor;
uniform vec3 uPaperC;
uniform vec3 uInkC;
${NOISE}
vec2 coverUv(vec2 px) {
  vec2 f = (px - uFrame.xy) / uFrame.zw;
  float ra = uFrame.z / uFrame.w;
  float ia = uImg.x / uImg.y;
  vec2 s = ra > ia ? vec2(1.0, ia / ra) : vec2(ra / ia, 1.0);
  return uPos + (f - uPos) * s;
}
// Position along the border, clockwise from the top-left corner, 0..1.
float perimeter(vec2 lp, vec2 wh) {
  float P = 2.0 * (wh.x + wh.y);
  float dT = lp.y, dR = wh.x - lp.x, dB = wh.y - lp.y, dL = lp.x;
  float m = min(min(dT, dR), min(dB, dL));
  if (m == dT) return lp.x / P;
  if (m == dR) return (wh.x + lp.y) / P;
  if (m == dB) return (wh.x + wh.y + (wh.x - lp.x)) / P;
  return (2.0 * wh.x + wh.y + (wh.y - lp.y)) / P;
}
void main() {
  vec2 wh = uRect.zw;
  vec2 lp = vLocal * wh;
  if (uSolid > 0.5) {
    // The offset colour block behind an inset panel slides in with the ruling.
    float show = step(vLocal.x, uRule);
    gl_FragColor = vec4(uSolidColor, 1.0) * show;
    return;
  }
  vec2 uv = coverUv(uRect.xy + lp);
  vec2 asp = vec2(wh.x / wh.y, 1.0);

  vec3 eng;
  if (uBlur > 0.002) {
    vec2 dir = (uv - 0.5) * uBlur * 0.07;
    eng = vec3(0.0);
    for (int k = 0; k < 8; k++) eng += texture2D(uInk, uv - dir * float(k) / 7.0).rgb;
    eng /= 8.0;
  } else {
    eng = texture2D(uInk, uv).rgb;
  }

  // Printing order: a sweep from the top-left, dark masses first, noise to break the front.
  float tone = 1.0 - lum(texture2D(uInk, uv, 4.0).rgb);
  float n = fbm(vLocal * asp * 2.6 + uSeed);
  float sweep = (vLocal.x * asp.x * 0.45 + vLocal.y * 0.55) / (asp.x * 0.45 + 0.55);
  float order = clamp(sweep * 0.6 + (1.0 - tone) * 0.24 + (n * 0.5 + 0.5) * 0.16, 0.0, 1.0);
  float front = uPrint * 1.2 - 0.08;
  float printed = 1.0 - smoothstep(front - 0.028, front, order);
  float ahead = order - front;
  float wet = (1.0 - smoothstep(0.0, 0.09, ahead)) * step(0.0, ahead) * step(0.001, uPrint) * step(uPrint, 0.999);
  float speck = step(0.7, snoise(lp / 3.2 + uSeed * 7.0)) * wet;
  vec3 col = mix(uPaperC, eng, printed);
  col = mix(col, uInkC, clamp(wet * 0.14 + speck * 0.85, 0.0, 1.0));

  // Darkroom: the photograph develops under a red safelight inside a wobbling patch.
  if (uHasPhoto > 0.5 && uDev.z > 0.001) {
    float r = uDev.z;
    float wob = fbm(vLocal * asp * 4.5 + vec2(uTime * 0.13, -uTime * 0.09) + uSeed) * 0.09 * min(r, 0.45);
    float d = length((vLocal - uDev.xy) * asp) + wob;
    float dev = 1.0 - smoothstep(r - 0.05, r + 0.01, d);
    vec3 ph = texture2D(uPhoto, uv).rgb;
    // The red safelight lives in the developing rim; the middle is already true colour.
    float band = smoothstep(r * 0.55, r - 0.005, d);
    vec3 safelight = vec3(lum(ph)) * vec3(1.08, 0.34, 0.24) * 1.2;
    col = mix(col, mix(ph, safelight, band), dev);
  }

  float edge = min(min(lp.x, lp.y), min(wh.x - lp.x, wh.y - lp.y));
  float onBorder = 1.0 - step(uBorder, edge);
  float ruled = step(perimeter(lp, wh), uRule);
  col = mix(col, uInkC, onBorder * ruled);
  float a = step(0.0001, uRule);
  gl_FragColor = vec4(col * a, a);
}`

const SPLASH_FRAG = `
precision highp float;
varying vec2 vLocal;
uniform vec2 uView;
uniform vec2 uOrigin;
uniform float uSplash;
uniform float uSeed;
uniform vec3 uInkC;
uniform vec3 uSpotC;
${NOISE}
void main() {
  vec2 p = vLocal * uView;
  float far = length(uView);
  float d = distance(p, uOrigin) / far;
  float big = fbm(p / 260.0 + uSeed);
  float shape = d - big * 0.2;
  float ink;
  float lip;
  if (uSplash <= 1.0) {
    float front = uSplash * 1.3;
    ink = 1.0 - smoothstep(front - 0.006, front + 0.004, shape);
    // Splatter: droplets thrown ahead of the front.
    float band = (1.0 - smoothstep(0.0, 0.16, shape - front)) * step(front, shape);
    float drops = step(0.74, snoise(p / 26.0 + uSeed * 3.1)) * step(0.35, snoise(p / 7.0 - uSeed));
    ink = max(ink, drops * band * step(0.02, uSplash));
    lip = (1.0 - smoothstep(0.0, 0.022, front - shape)) * ink;
  } else {
    float back = (uSplash - 1.0) * 1.3;
    ink = smoothstep(back - 0.006, back + 0.004, shape);
    lip = (1.0 - smoothstep(0.0, 0.022, shape - back)) * ink;
  }
  vec3 col = mix(uInkC, uSpotC, lip * 0.95);
  gl_FragColor = vec4(col * ink, ink);
}`

const rgb = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]

export function createPress(host: HTMLElement, canvas: HTMLCanvasElement, panels: PressPanel[]): Press | null {
  const opts: WebGLContextAttributes = { alpha: true, premultipliedAlpha: true, antialias: false }
  const gl2 = canvas.getContext('webgl2', opts) as WebGL2RenderingContext | null
  const gl = (gl2 || canvas.getContext('webgl', opts)) as WebGLRenderingContext | null
  if (!gl) return null
  const mip = !!gl2

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader')
    return s
  }
  const program = (frag: string) => {
    const p = gl.createProgram()!
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag))
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link')
    return p
  }
  let panelProg: WebGLProgram
  let splashProg: WebGLProgram
  try {
    panelProg = program(PANEL_FRAG)
    splashProg = program(SPLASH_FRAG)
  } catch {
    return null
  }
  const loc = (p: WebGLProgram, names: string[]) => Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)]))
  const U = loc(panelProg, ['uRect', 'uView', 'uInk', 'uPhoto', 'uHasPhoto', 'uFrame', 'uImg', 'uPos', 'uRule', 'uPrint', 'uDev', 'uBlur', 'uTime', 'uSeed', 'uBorder', 'uSolid', 'uSolidColor', 'uPaperC', 'uInkC'])
  const S = loc(splashProg, ['uRect', 'uView', 'uOrigin', 'uSplash', 'uSeed', 'uInkC', 'uSpotC'])

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)
  const bindQuad = (p: WebGLProgram) => {
    const a = gl.getAttribLocation(p, 'aPos')
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.enableVertexAttribArray(a)
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0)
  }

  const PAPER = rgb('#f2eee6')
  const INK = rgb('#0c0b10')
  const SPOT = rgb('#e23b27')
  let dead = false
  const textures: WebGLTexture[] = []
  const load = (url: string, done: (t: WebGLTexture, w: number, h: number) => void) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      if (dead) return
      const t = gl.createTexture()!
      textures.push(t)
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      if (mip) {
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      }
      done(t, img.naturalWidth, img.naturalHeight)
    }
    img.src = url
  }
  panels.forEach((p) =>
    load(p.ink, (t, w, h) => {
      p.inkTex = t
      p.imgW = w
      p.imgH = h
    }),
  )
  const loadPhoto = (p: PressPanel) => {
    if (p.photoState !== 'none') return
    p.photoState = 'loading'
    load(p.photo, (t) => {
      p.photoTex = t
      p.photoState = 'ready'
    })
  }

  // ---- sizing ----
  let W = 1
  let H = 1
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 860 ? 1.5 : 1.75)
    W = canvas.clientWidth || 1
    H = canvas.clientHeight || 1
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)

  const splash = { v: 0, x: 0, y: 0, seed: Math.random() * 50 }
  let visible = false
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
  io.observe(host)

  let raf = 0
  let t = 0
  let prev = performance.now()
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - prev) / 1000, 0.05)
    prev = now
    if (!visible) return
    t += dt
    const cr = canvas.getBoundingClientRect()

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(panelProg)
    bindQuad(panelProg)
    gl.uniform2f(U.uView, W, H)
    gl.uniform1f(U.uTime, t)
    gl.uniform3fv(U.uPaperC, PAPER)
    gl.uniform3fv(U.uInkC, INK)
    gl.uniform1i(U.uInk, 0)
    gl.uniform1i(U.uPhoto, 1)
    for (const p of panels) {
      if (p.rule <= 0 || !p.inkTex || p.page.style.visibility === 'hidden') continue
      const r = p.el.getBoundingClientRect()
      const x = r.left - cr.left
      const y = r.top - cr.top
      if (x > W || y > H || x + r.width < 0 || y + r.height < 0) continue
      const k = 1 - Math.exp(-10 * dt)
      p.dx += (p.tx - p.dx) * k
      p.dy += (p.ty - p.dy) * k

      if (p.shadow) {
        gl.uniform1f(U.uSolid, 1)
        gl.uniform3fv(U.uSolidColor, SPOT)
        gl.uniform4f(U.uRect, x + 12, y + 12, r.width, r.height)
        gl.uniform1f(U.uRule, Math.min(1, p.rule * 1.4))
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }
      const f = p.frame.getBoundingClientRect()
      gl.uniform1f(U.uSolid, 0)
      gl.uniform4f(U.uRect, x, y, r.width, r.height)
      gl.uniform4f(U.uFrame, f.left - cr.left, f.top - cr.top, f.width, f.height)
      gl.uniform2f(U.uImg, p.imgW || 3, p.imgH || 2)
      gl.uniform2f(U.uPos, p.pos[0], p.pos[1])
      gl.uniform1f(U.uRule, p.rule)
      gl.uniform1f(U.uPrint, p.print)
      gl.uniform1f(U.uBlur, p.blur)
      gl.uniform1f(U.uSeed, p.seed)
      gl.uniform1f(U.uBorder, p.border)
      gl.uniform3f(U.uDev, p.dx, p.dy, p.dev)
      gl.uniform1f(U.uHasPhoto, p.photoState === 'ready' ? 1 : 0)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, p.inkTex)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, p.photoTex || p.inkTex)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    if (splash.v > 0 && splash.v < 2) {
      gl.useProgram(splashProg)
      bindQuad(splashProg)
      gl.uniform4f(S.uRect, 0, 0, W, H)
      gl.uniform2f(S.uView, W, H)
      gl.uniform2f(S.uOrigin, splash.x, splash.y)
      gl.uniform1f(S.uSplash, splash.v)
      gl.uniform1f(S.uSeed, splash.seed)
      gl.uniform3fv(S.uInkC, INK)
      gl.uniform3fv(S.uSpotC, SPOT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
  }
  raf = requestAnimationFrame(frame)

  return {
    panels,
    splash,
    loadPhoto,
    destroy() {
      dead = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      textures.forEach((tx) => gl.deleteTexture(tx))
      gl.deleteBuffer(buf)
      gl.deleteProgram(panelProg)
      gl.deleteProgram(splashProg)
    },
  }
}

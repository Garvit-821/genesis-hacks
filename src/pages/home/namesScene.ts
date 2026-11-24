import * as THREE from 'three'

/**
 * "Look closer": a photograph of a Genesis room printed as a line-printer engraving in which every
 * line is typed from the names of the partners who backed the weekend.
 *
 * The names are laid out as rows of monospaced capitals across the image. Each glyph is drawn from
 * a signed-distance atlas generated here at runtime, and its weight follows the photo under it: the
 * brighter the photo, the heavier (and brighter) the letter, so from a distance the rows read as
 * the photograph and up close they read as names. Headliners print in vermilion. The page drives a
 * view (centre and zoom), a print head (how many lines are typed), a loupe and a highlighted name.
 */

export type NameEntry = { name: string; tier: number }
export type View = { cx: number; cy: number; zoom: number }
export type Loupe = { x: number; y: number; size: number; mag: number }
export type NamesScene = {
  /** How often each name (by index) is printed in the picture. */
  counts: Int32Array
  /** Zoom (relative to a cover fit) at which the whole picture fits the screen. */
  containZoom: () => number
  /** Draw a frame. `print` is 0 to 1 of the lines typed; `hi` is a highlighted name index or -1. */
  frame: (v: View, print: number, loupe: Loupe | null, hi: number) => void
  /** The name index printed under a screen point (CSS pixels in the canvas), or -1. */
  pick: (x: number, y: number, v: View) => number
  destroy: () => void
}

const IW = 1600 // image width in world units
const LH = 5.2 // line height
const S = 48 // atlas font size (px)
const PAD = 6 // atlas cell padding (px), also the distance-field spread
const SEP = ' · '

const rgb = (h: string) => new THREE.Vector3(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255)

/* ---- signed distance field (Felzenszwalb & Huttenlocher squared distance transform) ---- */
const INF = 1e20
function edt1d(grid: Float64Array, offset: number, stride: number, length: number, f: Float64Array, d: Float64Array, v: Int32Array, z: Float64Array) {
  for (let q = 0; q < length; q++) f[q] = grid[offset + q * stride]
  let k = 0
  v[0] = 0
  z[0] = -INF
  z[1] = INF
  for (let q = 1; q < length; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
    while (s <= z[k]) {
      k--
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
    }
    k++
    v[k] = q
    z[k] = s
    z[k + 1] = INF
  }
  k = 0
  for (let q = 0; q < length; q++) {
    while (z[k + 1] < q) k++
    const r = v[k]
    d[q] = (q - r) * (q - r) + f[r]
  }
  for (let q = 0; q < length; q++) grid[offset + q * stride] = d[q]
}
function edt(grid: Float64Array, w: number, h: number) {
  const n = Math.max(w, h)
  const f = new Float64Array(n)
  const d = new Float64Array(n)
  const v = new Int32Array(n)
  const z = new Float64Array(n + 1)
  for (let x = 0; x < w; x++) edt1d(grid, x, w, h, f, d, v, z)
  for (let y = 0; y < h; y++) edt1d(grid, y * w, 1, w, f, d, v, z)
}

/** One distance-field cell per character, packed into a single-channel atlas. */
function atlas(chars: string[], family: string) {
  const probe = document.createElement('canvas').getContext('2d')!
  probe.font = `650 ${S}px ${family}`
  const adv = probe.measureText('M').width
  const cw = Math.ceil(adv) + PAD * 2
  const ch = Math.ceil(S * 1.22) + PAD * 2
  const base = PAD + Math.round(S * 0.92) // baseline inside a cell
  const AW = 1024
  const cols = Math.floor(AW / cw)
  const rows = Math.ceil(chars.length / cols)
  let AH = 1
  while (AH < rows * ch) AH *= 2
  const data = new Uint8Array(AW * AH)
  const c = document.createElement('canvas')
  c.width = cw
  c.height = ch
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  const outer = new Float64Array(cw * ch)
  const inner = new Float64Array(cw * ch)
  chars.forEach((char, i) => {
    ctx.clearRect(0, 0, cw, ch)
    ctx.font = `650 ${S}px ${family}`
    ctx.fillStyle = '#fff'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(char, PAD, base)
    const img = ctx.getImageData(0, 0, cw, ch).data
    for (let p = 0; p < cw * ch; p++) {
      const a = img[p * 4 + 3] / 255
      outer[p] = a >= 1 ? 0 : a <= 0 ? INF : Math.max(0, 0.5 - a) ** 2
      inner[p] = a >= 1 ? INF : a <= 0 ? 0 : Math.max(0, a - 0.5) ** 2
    }
    edt(outer, cw, ch)
    edt(inner, cw, ch)
    const ox = (i % cols) * cw
    const oy = Math.floor(i / cols) * ch
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const p = y * cw + x
        const dist = Math.sqrt(outer[p]) - Math.sqrt(inner[p]) // > 0 outside the glyph
        data[(oy + y) * AW + ox + x] = Math.max(0, Math.min(255, Math.round((0.5 - dist / (2 * PAD)) * 255)))
      }
    }
  })
  const tex = new THREE.DataTexture(data, AW, AH, THREE.RedFormat, THREE.UnsignedByteType)
  tex.unpackAlignment = 1
  tex.generateMipmaps = true
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return { tex, cw, ch, cols, AW, AH, adv, base }
}

const VERT = /* glsl */ `
  attribute vec2 aPos;
  attribute float aGlyph;
  attribute float aLine;
  attribute float aName;
  attribute float aTier;
  uniform vec2 uQuad;
  uniform vec2 uCell;
  uniform vec2 uAtlas;
  uniform float uCols;
  uniform float uPrint;
  uniform vec2 uImg;
  varying vec2 vAtlasUv;
  varying vec2 vImgUv;
  varying float vName;
  varying float vTier;
  varying float vHot;
  void main() {
    float done = floor(uPrint);
    float head = fract(uPrint) * uImg.x;
    bool shown = aLine < done || (aLine == done && aPos.x < head);
    vec2 local = vec2(position.x + 0.5, 0.5 - position.y);
    vec2 p = aPos + local * uQuad;
    // Freshly typed letters are still wet: vermilion just behind the print head.
    vHot = aLine == done ? clamp(1.0 - (head - aPos.x) / (uImg.x * 0.06), 0.0, 1.0) : 0.0;
    vec2 cell = vec2(mod(aGlyph, uCols), floor(aGlyph / uCols));
    vAtlasUv = (cell + local) * uCell / uAtlas;
    vImgUv = p / uImg;
    vName = aName;
    vTier = aTier;
    gl_Position = shown ? projectionMatrix * viewMatrix * vec4(p.x, -p.y, 0.0, 1.0) : vec4(2.0, 2.0, 2.0, 1.0);
  }
`
// Colours are raw sRGB, written straight out so they match the page. Output is premultiplied.
const FRAG = /* glsl */ `
  uniform sampler2D uAtlasTex;
  uniform sampler2D uPhoto;
  uniform vec4 uCrop;
  uniform vec3 uPaper;
  uniform vec3 uSpot;
  uniform float uHi;
  uniform float uHiAmt;
  varying vec2 vAtlasUv;
  varying vec2 vImgUv;
  varying float vName;
  varying float vTier;
  varying float vHot;
  void main() {
    float sd = texture2D(uAtlasTex, vAtlasUv).r;
    vec2 puv = vec2(mix(uCrop.x, uCrop.z, vImgUv.x), 1.0 - mix(uCrop.y, uCrop.w, vImgUv.y));
    vec3 ph = texture2D(uPhoto, puv).rgb;
    float tone = smoothstep(0.03, 0.66, dot(ph, vec3(0.2126, 0.7152, 0.0722)));
    bool hi = uHi >= 0.0 && abs(vName - uHi) < 0.5;
    bool head = vTier > -0.5 && vTier < 0.5;
    // The photo sets the weight: bright areas print heavy, dark areas print hairline.
    float thr = mix(0.7, 0.29, tone) - (head ? 0.03 : 0.0);
    vec3 col = (head ? uSpot : uPaper) * mix(0.24, 1.0, pow(tone, 0.85));
    if (hi) {
      thr = mix(thr, 0.36, uHiAmt);
      col = mix(col, uSpot * 1.2, uHiAmt);
    }
    float w = max(fwidth(sd) * 0.8, 0.012);
    float a = smoothstep(thr - w, thr + w, sd);
    col = mix(col, uSpot, vHot * 0.85);
    if (uHi >= 0.0 && !hi) a *= 1.0 - 0.5 * uHiAmt;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a, a);
  }
`

export async function namesScene(canvas: HTMLCanvasElement, photoSrc: string, entries: NameEntry[], crop: [number, number, number, number]): Promise<NamesScene | null> {
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace'
  try {
    await document.fonts.load(`650 ${S}px ${family}`)
  } catch {
    /* a fallback monospace still prints */
  }
  const photo = await new THREE.TextureLoader().loadAsync(photoSrc).catch(() => null)
  if (!photo) return null
  photo.minFilter = THREE.LinearFilter
  photo.generateMipmaps = false

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' })
  } catch {
    photo.dispose()
    return null
  }
  renderer.setClearColor(0x000000, 0)
  renderer.autoClear = false
  renderer.toneMapping = THREE.NoToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const srcW = (photo.image as HTMLImageElement).width
  const srcH = (photo.image as HTMLImageElement).height
  const IH = (IW * (crop[3] - crop[1]) * srcH) / ((crop[2] - crop[0]) * srcW)
  const lines = Math.floor(IH / LH)

  // ---- type every line ----
  const texts = entries.map((e) => e.name.toUpperCase())
  const chars = Array.from(new Set((texts.join('') + SEP).split(''))).filter((c) => c !== ' ')
  const glyphOf = new Map(chars.map((c, i) => [c, i]))
  const A = atlas(chars, family)
  const k = (LH * 0.86) / S // world units per atlas pixel
  const adv = A.adv * k
  const perLine = Math.ceil(IW / adv)
  const pos: number[] = []
  const glyph: number[] = []
  const lineAt: number[] = []
  const nameAt: number[] = []
  const tierAt: number[] = []
  const table = new Int16Array(lines * perLine).fill(-1)
  const counts = new Int32Array(entries.length)
  // Each line starts at a random name, part-way into it, so no name stacks into a column, and the
  // names run in a shuffled order so the vermilion headliners are scattered, not printed in a streak.
  let seed = 9
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const order = entries.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  for (let line = 0; line < lines; line++) {
    let col = 0
    let o = Math.floor(rnd() * order.length)
    let n = order[o]
    let skip = Math.floor(rnd() * Math.max(1, texts[n].length))
    const baseY = line * LH + LH * 0.8
    while (col < perLine) {
      const text = texts[n] + SEP
      counts[n]++
      for (let j = skip; j < text.length && col < perLine; j++, col++) {
        const sep = j >= texts[n].length
        table[line * perLine + col] = sep ? -1 : n
        const c = text[j]
        if (c === ' ') continue
        pos.push(col * adv - PAD * k, baseY - A.base * k)
        glyph.push(glyphOf.get(c) ?? 0)
        lineAt.push(line)
        nameAt.push(sep ? -1 : n)
        tierAt.push(sep ? -1 : entries[n].tier)
      }
      o = (o + 1) % order.length
      n = order[o]
      skip = 0
    }
  }

  const quad = new THREE.PlaneGeometry(1, 1)
  const geo = new THREE.InstancedBufferGeometry()
  geo.index = quad.index
  geo.setAttribute('position', quad.getAttribute('position'))
  geo.setAttribute('aPos', new THREE.InstancedBufferAttribute(new Float32Array(pos), 2))
  geo.setAttribute('aGlyph', new THREE.InstancedBufferAttribute(new Float32Array(glyph), 1))
  geo.setAttribute('aLine', new THREE.InstancedBufferAttribute(new Float32Array(lineAt), 1))
  geo.setAttribute('aName', new THREE.InstancedBufferAttribute(new Float32Array(nameAt), 1))
  geo.setAttribute('aTier', new THREE.InstancedBufferAttribute(new Float32Array(tierAt), 1))
  geo.instanceCount = glyph.length
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uQuad: { value: new THREE.Vector2(A.cw * k, A.ch * k) },
      uCell: { value: new THREE.Vector2(A.cw, A.ch) },
      uAtlas: { value: new THREE.Vector2(A.AW, A.AH) },
      uCols: { value: A.cols },
      uPrint: { value: 0 },
      uImg: { value: new THREE.Vector2(IW, IH) },
      uAtlasTex: { value: A.tex },
      uPhoto: { value: photo },
      uCrop: { value: new THREE.Vector4(...crop) },
      uPaper: { value: rgb('#f2eee6') },
      uSpot: { value: rgb('#e23b27') },
      uHi: { value: -1 },
      uHiAmt: { value: 0 },
    },
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.frustumCulled = false
  const scene = new THREE.Scene()
  scene.add(mesh)
  const cam = new THREE.OrthographicCamera(0, 1, 0, -1, -10, 10)
  const lens = new THREE.OrthographicCamera(0, 1, 0, -1, -10, 10)

  let W = 1
  let H = 1
  const resize = () => {
    W = canvas.clientWidth || window.innerWidth
    H = canvas.clientHeight || window.innerHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(W, H, false)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  const cover = () => Math.max(W / IW, H / IH)
  /** The visible window in world units for a view: [centre x, centre y (down), half width, half height]. */
  const windowOf = (v: View) => {
    const scale = cover() * v.zoom
    const hw = W / 2 / scale
    const hh = H / 2 / scale
    let cx = v.cx * IW
    let cy = v.cy * IH
    // Never show past the edge of the print while zoomed in; centre it when zoomed out.
    cx = hw * 2 >= IW ? IW / 2 : Math.min(IW - hw, Math.max(hw, cx))
    cy = hh * 2 >= IH ? IH / 2 : Math.min(IH - hh, Math.max(hh, cy))
    return [cx, cy, hw, hh] as const
  }
  const fit = (c: THREE.OrthographicCamera, cx: number, cy: number, hw: number, hh: number) => {
    c.left = cx - hw
    c.right = cx + hw
    c.top = -cy + hh
    c.bottom = -cy - hh
    c.updateProjectionMatrix()
  }
  const toWorld = (x: number, y: number, v: View) => {
    const [cx, cy, hw, hh] = windowOf(v)
    return [cx - hw + (x / W) * hw * 2, cy - hh + (y / H) * hh * 2] as const
  }

  let hiAmt = 0
  let hiId = -1
  return {
    counts,
    containZoom: () => Math.min(W / IW, H / IH) / cover(),
    frame: (v, print, loupe, hi) => {
      mat.uniforms.uPrint.value = Math.max(0, Math.min(lines, print * lines))
      // The highlight fades in and out; the last name stays lit while it fades.
      if (hi >= 0) hiId = hi
      hiAmt += ((hi >= 0 ? 1 : 0) - hiAmt) * 0.18
      if (hiAmt < 0.01 && hi < 0) hiId = -1
      mat.uniforms.uHi.value = hiId
      mat.uniforms.uHiAmt.value = hiAmt
      const [cx, cy, hw, hh] = windowOf(v)
      fit(cam, cx, cy, hw, hh)
      renderer.setScissorTest(false)
      renderer.setViewport(0, 0, W, H)
      renderer.clear()
      renderer.render(scene, cam)
      if (loupe) {
        // The loupe: the same print, magnified, inside a square that follows the pointer.
        const [wx, wy] = toWorld(loupe.x, loupe.y, v)
        const half = loupe.size / 2
        const lhw = (hw * (loupe.size / W)) / loupe.mag
        const lhh = (hh * (loupe.size / H)) / loupe.mag
        fit(lens, wx, wy, lhw, lhh)
        const x = Math.round(loupe.x - half)
        const y = Math.round(H - loupe.y - half)
        renderer.setScissorTest(true)
        renderer.setScissor(x, y, loupe.size, loupe.size)
        renderer.setViewport(x, y, loupe.size, loupe.size)
        renderer.clear()
        renderer.render(scene, lens)
        renderer.setScissorTest(false)
        renderer.setViewport(0, 0, W, H)
      }
    },
    pick: (x, y, v) => {
      const [wx, wy] = toWorld(x, y, v)
      const line = Math.floor(wy / LH)
      const col = Math.floor(wx / adv)
      if (line < 0 || line >= lines || col < 0 || col >= perLine) return -1
      // Between two names, snap to the nearer one.
      for (let d = 0; d <= 3; d++) {
        for (const c of d ? [col - d, col + d] : [col]) {
          if (c >= 0 && c < perLine && table[line * perLine + c] >= 0) return table[line * perLine + c]
        }
      }
      return -1
    },
    destroy: () => {
      ro.disconnect()
      geo.dispose()
      quad.dispose()
      mat.dispose()
      A.tex.dispose()
      photo.dispose()
      renderer.dispose()
    },
  }
}

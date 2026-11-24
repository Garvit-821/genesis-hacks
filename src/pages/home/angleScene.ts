import * as THREE from 'three'
import { VIEWS, type CamState } from './angleViews'

/**
 * "Three words": one sculpture of loose engraving strokes that hides three words.
 *
 * Every stroke of a word lies on a sight line from that word's viewpoint, pushed to a random depth
 * and scaled by the same factor, so from that one viewpoint each stroke projects back onto its
 * place in the word, and from anywhere else the strokes are noise (an anamorphic sculpture).
 * Unorthodox is horizontal hatching scattered deep; Daring is vermilion diagonal hatching that
 * crowds the lens; every stroke of Fast trails a hair-thin line along its sight line, hidden inside
 * the stroke from Fast's viewpoint and a burst of speed lines from anywhere else. Loose strokes that
 * belong to no word fill the room. Strokes are added as light, so a stroke that is not part of
 * the word in view can never hide one that is.
 *
 * The camera is driven from outside (the page's scroll), so the page decides when a word resolves.
 */

export type AngleScene = {
  /** Render one frame from camera state `s`; `fade` dims the sculpture (0 to 1) under an overlay. */
  frame: (s: CamState, fade?: number) => { act: number[]; nearest: number; align: number }
  destroy: () => void
}

type Spec = {
  text: string
  spot: boolean
  /** Hatch angle in degrees, counter-clockwise. */
  hatch: number
  /** Longest stroke, as a fraction of the word's height. */
  seg: number
  /** Depth range along each sight line, as a multiple of the viewpoint's distance. */
  depth: [number, number]
  /** Fast only: each stroke trails a hair-thin line of this length back along its sight line. */
  rods?: [number, number]
  /** Largest share of the screen height the word may take. */
  maxH: number
  seed: number
}

const SPECS: Spec[] = [
  { text: 'UNORTHODOX.', spot: false, hatch: 0, seg: 0.13, depth: [0.42, 1.75], maxH: 0.3, seed: 11 },
  { text: 'DARING.', spot: true, hatch: 27, seg: 0.12, depth: [0.2, 1.5], maxH: 0.34, seed: 23 },
  { text: 'FAST.', spot: false, hatch: 0, seg: 0.2, depth: [0.6, 1.2], rods: [0.8, 2.6], maxH: 0.36, seed: 37 },
]
const FOV = 34
const DECOYS = 760

const rad = (d: number) => (d * Math.PI) / 180
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const rgb = (h: string) => new THREE.Vector3(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255)

export function camPos(s: CamState, out: THREE.Vector3) {
  const a = rad(s.az)
  const e = rad(s.el)
  return out.set(Math.sin(a) * Math.cos(e) * s.r, Math.sin(e) * s.r, Math.cos(a) * Math.cos(e) * s.r)
}

/** The word drawn into a canvas, trimmed to its ink, as an inside/outside test. */
function raster(text: string, family: string) {
  const F = 260
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  const font = `800 ${F}px ${family}`
  ctx.font = font
  const m = ctx.measureText(text)
  const pad = 6
  const w = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + pad * 2
  const h = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + pad * 2
  c.width = w
  c.height = h
  ctx.font = font
  ctx.fillStyle = '#fff'
  ctx.fillText(text, pad + m.actualBoundingBoxLeft, pad + m.actualBoundingBoxAscent)
  const data = ctx.getImageData(0, 0, w, h).data
  const inside = (x: number, y: number) => {
    const xi = x | 0
    const yi = y | 0
    return xi >= 0 && yi >= 0 && xi < w && yi < h && data[(yi * w + xi) * 4 + 3] > 127
  }
  return { w, h, inside }
}

type Seg = { x: number; y: number; len: number }

/** Cut the word into hatch strokes: parallel lines `step` apart at `angle`, split into short runs. */
function hatch(r: ReturnType<typeof raster>, angle: number, step: number, segMax: number, rnd: () => number): Seg[] {
  const a = rad(angle)
  const dx = Math.cos(a)
  const dy = -Math.sin(a) // canvas y runs down
  const nx = -dy
  const ny = dx
  const corners = [
    [0, 0],
    [r.w, 0],
    [0, r.h],
    [r.w, r.h],
  ]
  const cs = corners.map(([x, y]) => x * nx + y * ny)
  const ts = corners.map(([x, y]) => x * dx + y * dy)
  const c0 = Math.min(...cs)
  const c1 = Math.max(...cs)
  const t0 = Math.min(...ts)
  const t1 = Math.max(...ts)
  const out: Seg[] = []
  for (let c = c0 + step * 0.5; c < c1; c += step) {
    // Positions along an angled line can be negative, so "no run yet" is NaN, not -1.
    let run = NaN
    for (let t = t0; t <= t1 + 1; t += 1) {
      const ins = t <= t1 && r.inside(c * nx + t * dx, c * ny + t * dy)
      if (ins && Number.isNaN(run)) run = t
      if (!ins && !Number.isNaN(run)) {
        let s = run
        while (s < t) {
          const want = segMax * (0.55 + 0.45 * rnd())
          // A short tail is swallowed by the stroke before it.
          const len = t - (s + want) < segMax * 0.3 ? t - s : want
          const mid = s + len / 2
          out.push({ x: c * nx + mid * dx, y: c * ny + mid * dy, len })
          s += len
        }
        run = NaN
      }
    }
  }
  return out
}

const VERT = /* glsl */ `
  attribute float aWord;
  attribute float aShade;
  varying float vWord;
  varying float vShade;
  varying float vLit;
  varying float vDist;
  void main() {
    vec4 mv = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
    vec3 n = normalize(mat3(viewMatrix) * mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    vLit = abs(n.z);
    vDist = -mv.z;
    vWord = aWord;
    vShade = aShade;
    gl_Position = projectionMatrix * mv;
  }
`
// Colours are raw sRGB, written straight out, so paper and ink match the page exactly.
const FRAG = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform vec3 uSpot;
  uniform vec4 uAct;
  uniform float uFar;
  uniform float uFade;
  varying float vWord;
  varying float vShade;
  varying float vLit;
  varying float vDist;
  void main() {
    float act = vWord < 0.5 ? uAct.x : vWord < 1.5 ? uAct.y : vWord < 2.5 ? uAct.z : uAct.w;
    vec3 base = (vWord > 0.5 && vWord < 1.5) ? uSpot : uPaper;
    float lit = 0.74 + 0.26 * vLit;
    float fog = clamp(1.25 - vDist / uFar, 0.78, 1.0);
    // Added as light over the ink page: brightness is the stroke's share of the word in view.
    gl_FragColor = vec4(base * vShade * lit * fog * act * (1.0 - 0.72 * uFade), 1.0);
  }
`

export async function angleScene(canvas: HTMLCanvasElement, onLayout?: (bottoms: number[]) => void): Promise<AngleScene | null> {
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() || 'sans-serif'
  try {
    await document.fonts.load(`800 120px ${family}`)
  } catch {
    /* the fallback face still draws a word */
  }
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
  } catch {
    return null
  }
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.NoToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 100)
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uInk: { value: rgb('#0c0b10') },
      uPaper: { value: rgb('#f2eee6') },
      uSpot: { value: rgb('#e23b27') },
      uAct: { value: new THREE.Vector4(0.6, 0.6, 0.6, 0.5) },
      uFar: { value: 30 },
      uFade: { value: 0 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  })
  let mesh: THREE.InstancedMesh | null = null

  /** Build every stroke for the current aspect ratio (a word must fit the frame it is read in). */
  const build = (W: number, H: number) => {
    const aspect = W / H
    const m = new THREE.Matrix4()
    const mats: THREE.Matrix4[] = []
    const words: number[] = []
    const shades: number[] = []
    const bottoms: number[] = []
    const view = new THREE.PerspectiveCamera(FOV, aspect, 0.05, 100)
    const right = new THREE.Vector3()
    const up = new THREE.Vector3()
    const back = new THREE.Vector3()
    const xa = new THREE.Vector3()
    const ya = new THREE.Vector3()
    const za = new THREE.Vector3()
    const p0 = new THREE.Vector3()
    const ray = new THREE.Vector3()
    const p = new THREE.Vector3()

    SPECS.forEach((spec, k) => {
      const rnd = seeded(spec.seed)
      camPos(VIEWS[k], view.position)
      view.lookAt(0, 0, 0)
      view.updateMatrixWorld()
      const e = view.matrixWorld.elements
      right.set(e[0], e[1], e[2]).normalize()
      up.set(e[4], e[5], e[6]).normalize()
      back.set(e[8], e[9], e[10]).normalize()
      const c = view.position
      const d0 = c.length()
      const h0 = 2 * d0 * Math.tan(rad(FOV / 2))
      const w0 = h0 * aspect
      const r = raster(spec.text, family)
      const ratio = r.w / r.h
      const wordW = Math.min(w0 * 0.82, h0 * spec.maxH * ratio)
      const px = wordW / r.w // world units per canvas pixel, on the plane through the centre
      bottoms.push(0.5 + (0.5 * wordW) / ratio / h0)
      // About one hatch line every 4.6 screen pixels, so the word reads as an engraving at any size.
      const rows = clamp(Math.round(((wordW / ratio / h0) * H) / 4.6), 14, 40)
      const step = r.h / rows
      const a = rad(spec.hatch)
      for (const s of hatch(r, spec.hatch, step, spec.seg * r.h, rnd)) {
        const u = (s.x - r.w / 2) * px
        const v = -(s.y - r.h / 2) * px
        p0.copy(c).addScaledVector(back, -d0).addScaledVector(right, u).addScaledVector(up, v)
        ray.subVectors(p0, c)
        const depth = lerp(spec.depth[0], spec.depth[1], rnd())
        p.copy(c).addScaledVector(ray, depth)
        const len = s.len * px * depth
        // Thicker lines when the word is small on screen, so it stays bright rather than grey.
        const th = step * (rows <= 18 ? 0.62 : 0.5) * px * depth
        xa.copy(right).multiplyScalar(Math.cos(a)).addScaledVector(up, Math.sin(a))
        za.copy(back)
        ya.crossVectors(za, xa).normalize()
        m.makeBasis(xa, ya, za).scale(new THREE.Vector3(len, th, th)).setPosition(p)
        mats.push(m.clone())
        words.push(k)
        const shade = 0.8 + 0.2 * rnd()
        shades.push(shade)
        if (spec.rods) {
          // The trail runs away from the viewpoint along the sight line, so from there it sits
          // inside its own stroke; from anywhere else it is a speed line.
          za.copy(ray).normalize().negate()
          xa.set(za.y, -za.x, 0)
          if (xa.lengthSq() < 1e-6) xa.set(1, 0, 0)
          xa.normalize()
          ya.crossVectors(za, xa).normalize()
          const zLen = lerp(spec.rods[0], spec.rods[1], rnd())
          const t = th * 0.55
          m.makeBasis(xa, ya, za).scale(new THREE.Vector3(t, t, zLen)).setPosition(p.addScaledVector(za, -zLen / 2))
          mats.push(m.clone())
          words.push(k)
          shades.push(shade * 0.75)
        }
      }
    })

    // The loose parts: strokes that belong to no word.
    const rnd = seeded(5)
    const q = new THREE.Quaternion()
    const eul = new THREE.Euler()
    for (let i = 0; i < DECOYS; i++) {
      do p.set(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1)
      while (p.lengthSq() > 1)
      p.multiply(new THREE.Vector3(4.4, 2.4, 4.4))
      q.setFromEuler(eul.set(rnd() * Math.PI * 2, rnd() * Math.PI * 2, rnd() * Math.PI * 2))
      const len = 0.06 + 0.42 * rnd() * rnd()
      const th = 0.012 + 0.016 * rnd()
      m.compose(p, q, new THREE.Vector3(len, th, th))
      mats.push(m.clone())
      words.push(3)
      shades.push(0.7 + 0.3 * rnd())
    }

    if (mesh) {
      scene.remove(mesh)
      mesh.geometry.dispose()
      mesh.dispose()
    }
    const geo = new THREE.BoxGeometry(1, 1, 1)
    geo.setAttribute('aWord', new THREE.InstancedBufferAttribute(new Float32Array(words), 1))
    geo.setAttribute('aShade', new THREE.InstancedBufferAttribute(new Float32Array(shades), 1))
    mesh = new THREE.InstancedMesh(geo, mat, mats.length)
    mats.forEach((mm, i) => mesh!.setMatrixAt(i, mm))
    mesh.instanceMatrix.needsUpdate = true
    mesh.frustumCulled = false
    scene.add(mesh)
    onLayout?.(bottoms)
  }

  let W = 0
  let H = 0
  let timer = 0
  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight
    if (w === W && h === H) return
    const first = W === 0
    W = w
    H = h
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, W < 860 ? 1.5 : 1.75))
    renderer.setSize(W, H, false)
    camera.aspect = W / H
    camera.updateProjectionMatrix()
    // Rebuilding is cheap but not free: wait for the resize to settle.
    window.clearTimeout(timer)
    if (first) build(W, H)
    else timer = window.setTimeout(() => build(W, H), 160)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  const dirs = VIEWS.map((v) => camPos(v, new THREE.Vector3()).normalize())
  const cd = new THREE.Vector3()
  const act = [0, 0, 0]
  return {
    frame: (s, fade = 0) => {
      camPos(s, camera.position)
      camera.lookAt(0, 0, 0)
      cd.copy(camera.position).normalize()
      let nearest = 0
      let minAng = 180
      let maxAct = 0
      dirs.forEach((d, k) => {
        const ang = (Math.acos(clamp(cd.dot(d), -1, 1)) * 180) / Math.PI
        if (ang < minAng) {
          minAng = ang
          nearest = k
        }
        act[k] = 1 - smooth(3, 24, ang)
        maxAct = Math.max(maxAct, act[k])
      })
      // While a word is resolving, everything else steps back; between words the room is busy again.
      const base = lerp(0.36, 0.06, maxAct)
      mat.uniforms.uAct.value.set(base + (1 - base) * act[0], base + (1 - base) * act[1], base + (1 - base) * act[2], lerp(0.34, 0.1, maxAct))
      mat.uniforms.uFade.value = fade
      renderer.render(scene, camera)
      return { act, nearest, align: clamp(1 - minAng / 32, 0, 1) }
    },
    destroy: () => {
      window.clearTimeout(timer)
      ro.disconnect()
      if (mesh) {
        mesh.geometry.dispose()
        mesh.dispose()
      }
      mat.dispose()
      renderer.dispose()
    },
  }
}

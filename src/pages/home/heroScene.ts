import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/**
 * The hero's 3D object: the Genesis double-G as a solid, bevelled mark rendered as an
 * engraving (screen-space hatching that follows the light, an inked outline, printed on paper),
 * circled by a ring of 36 blocks, one per hour of a hackathon. One block burns amber and
 * the "hour" advances every second, like a clock that has already started.
 * Pointer tilts it with a spring; scrolling spins it and pulls it toward the camera.
 */
export type HeroField = { start: () => void; setScatter: (v: number) => void; destroy: () => void }

const deg = (d: number) => (d * Math.PI) / 180

function markShapes() {
  // Same geometry as the SVG logo (viewBox 100, centre 50,50), rebuilt as filled outlines, y up.
  const ring = (r: number, t: number, a0: number, a1: number) => {
    const s = new THREE.Shape()
    s.absarc(0, 0, r + t / 2, deg(a0), deg(a1), false)
    s.absarc(0, 0, r - t / 2, deg(a1), deg(a0), true)
    s.closePath()
    return s
  }
  const outer = ring(41, 10, 32, 360)
  const inner = ring(18.5, 10, 32, 345)
  const bar = new THREE.Shape()
  bar.moveTo(0, -5)
  bar.lineTo(45.6, -5)
  bar.lineTo(45.6, 5)
  bar.lineTo(0, 5)
  bar.closePath()
  return [outer, inner, bar]
}

export function heroScene(sec: HTMLElement, canvas: HTMLCanvasElement, reduced: boolean): HeroField | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
  } catch {
    return null
  }
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.NoToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace
  canvas.setAttribute('role', 'img')
  canvas.setAttribute('aria-label', 'The Genesis logo as an engraved 3D object, circled by 36 blocks for the hours of a hackathon.')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  camera.position.set(0, 0, 9)


  // ---- the mark ----
  const geo = new THREE.ExtrudeGeometry(markShapes(), { depth: 12, bevelEnabled: true, bevelThickness: 2.4, bevelSize: 1.6, bevelSegments: 6, curveSegments: 72 })
  geo.center()
  geo.scale(0.026, 0.026, 0.026)
  // Engraving: tone from a fixed key light, then three hatch layers in screen space. Colours are
  // raw sRGB so the paper matches the page exactly.
  const rgb = (h: string) => new THREE.Vector3(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255)
  const metal = new THREE.ShaderMaterial({
    uniforms: {
      uInk: { value: rgb('#0c0b10') },
      uPaper: { value: rgb('#f2eee6') },
      uLight: { value: new THREE.Vector3(0.55, 0.65, 0.55).normalize() },
      uDpr: { value: 1 },
      uBuild: { value: 0 },
      uNight: { value: 0 },
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vV = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uInk; uniform vec3 uPaper; uniform vec3 uLight; uniform float uDpr;
      uniform float uBuild; uniform float uNight;
      varying vec3 vN; varying vec3 vV;
      float hatch(vec2 p, float a, float period) {
        float t = dot(p, vec2(cos(a), sin(a))) / period;
        t += 0.12 * sin(dot(p, vec2(-sin(a), cos(a))) / (period * 7.0));
        return abs(fract(t) - 0.5) * 2.0;
      }
      void main() {
        vec3 n = normalize(vN);
        float diff = max(dot(n, uLight), 0.0);
        float rim = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 3.0);
        float tone = clamp(diff * 0.95 + 0.1 + rim * 0.25, 0.0, 1.0);
        // Night falls as the page scrolls on: every surface takes more ink.
        float dark = clamp(1.0 - tone + uNight * 0.55, 0.0, 1.0);
        vec2 p = gl_FragCoord.xy / uDpr;
        // Engraved live: the first layer of cuts arrives, then the cross-hatch, then the deepest.
        float b1 = clamp(uBuild * 2.2, 0.0, 1.0);
        float b2 = clamp(uBuild * 2.2 - 0.6, 0.0, 1.0);
        float b3 = clamp(uBuild * 2.2 - 1.2, 0.0, 1.0);
        float ink = step(hatch(p, 0.56, 5.0), clamp((dark - 0.12) * 1.25, 0.0, 1.0) * b1);
        ink = max(ink, step(hatch(p, -0.7, 4.6), clamp((dark - 0.48) * 1.7, 0.0, 1.0) * b2));
        ink = max(ink, step(hatch(p, 1.45, 4.0), clamp((dark - 0.74) * 2.4, 0.0, 1.0) * b3));
        gl_FragColor = vec4(mix(uPaper, uInk, ink), 1.0);
      }`,
  })
  const mark = new THREE.Mesh(geo, metal)
  // Inked outline: the back faces, pushed out along their normals and drawn solid ink.
  const outlineMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { uInk: { value: rgb('#0c0b10') }, uWidth: { value: 0 } },
    vertexShader: `uniform float uWidth; void main() { vec3 p = position + normal * uWidth; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: `uniform vec3 uInk; void main() { gl_FragColor = vec4(uInk, 1.0); }`,
  })
  const outline = new THREE.Mesh(geo, outlineMat)
  mark.add(outline)

  // ---- 36 hour blocks ----
  const blockGeo = new RoundedBoxGeometry(0.11, 0.26, 0.11, 3, 0.035)
  const blockMat = new THREE.MeshBasicMaterial({ color: '#ffffff' })
  const blocks = new THREE.InstancedMesh(blockGeo, blockMat, 36)
  const ringR = 1.78
  const dummy = new THREE.Object3D()
  const baseScale = (i: number) => (i % 6 === 0 ? 1.45 : 1)
  const placeBlock = (i: number, pop = 1) => {
    const a = (i / 36) * Math.PI * 2
    dummy.position.set(Math.cos(a) * ringR, Math.sin(a) * ringR, 0)
    dummy.rotation.set(0, 0, a + Math.PI / 2)
    const s = baseScale(i) * pop
    dummy.scale.set(Math.max(pop, 0.0001), Math.max(s, 0.0001), Math.max(pop, 0.0001))
    dummy.updateMatrix()
    blocks.setMatrixAt(i, dummy.matrix)
  }
  const ink = new THREE.Color('#0c0b10')
  const violet = new THREE.Color('#0c0b10')
  const amber = new THREE.Color('#e23b27')
  for (let i = 0; i < 36; i++) {
    placeBlock(i)
    blocks.setColorAt(i, i % 6 === 0 ? violet : ink)
  }
  const ring = new THREE.Group()
  ring.add(blocks)
  ring.rotation.x = deg(-62)

  const rig = new THREE.Group()
  rig.add(mark, ring)
  scene.add(rig)

  // ---- layout: right of the headline on wide screens, low and smaller on narrow ones ----
  let W = 1
  let H = 1
  const place = { x: 0, y: 0, s: 1 }
  const resize = () => {
    W = sec.clientWidth || 1
    H = sec.clientHeight || 1
    const dpr = Math.min(window.devicePixelRatio || 1, W < 860 ? 1.5 : 1.75)
    renderer.setPixelRatio(dpr)
    metal.uniforms.uDpr.value = dpr
    renderer.setSize(W, H, false)
    camera.aspect = W / H
    camera.updateProjectionMatrix()
    const vh = 2 * Math.tan(deg(camera.fov / 2)) * camera.position.z
    const vw = vh * camera.aspect
    const narrow = W < 860
    place.x = narrow ? vw * 0.2 : vw * 0.24
    place.y = narrow ? -vh * 0.08 : 0
    place.s = narrow ? Math.min(vw / 6.2, 0.82) : Math.min(vh / 4.6, vw / 7.4)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(sec)

  // ---- motion state ----
  let px = 0
  let py = 0
  let rx = 0
  let ry = 0
  let vx = 0
  let vy = 0
  let scatter = 0
  let enter = reduced ? 1 : 0
  let started = reduced
  let visible = true
  let hour = 0
  let hourPop = 0
  let lastTick = 0
  let build = reduced ? 1 : 0
  const light = new THREE.Vector3(0.55, 0.65, 0.55).normalize()
  const lightTarget = new THREE.Vector3()
  const onMove = (e: PointerEvent) => {
    const r = sec.getBoundingClientRect()
    px = ((e.clientX - r.left) / r.width) * 2 - 1
    py = ((e.clientY - r.top) / r.height) * 2 - 1
  }
  const onLeave = () => {
    px = 0
    py = 0
  }
  if (!reduced) {
    sec.addEventListener('pointermove', onMove, { passive: true })
    sec.addEventListener('pointerleave', onLeave)
  }
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
  io.observe(sec)

  let prevNow = performance.now()
  let t = 0
  let raf = 0
  const render = () => {
    const now = performance.now()
    const dt = Math.min((now - prevNow) / 1000, 0.05)
    prevNow = now
    t += dt
    if (started && enter < 1) enter = Math.min(1, enter + dt / 1.6)
    const e = 1 - Math.pow(1 - enter, 4)
    // The engraving is cut live after the mark lands: outline first, then three passes of hatching.
    if (started && build < 1) build = Math.min(1, build + dt / 2.4)
    metal.uniforms.uBuild.value = build
    outlineMat.uniforms.uWidth.value = 0.022 * Math.min(1, build * 4)
    metal.uniforms.uNight.value = scatter
    // The light follows the pointer, so the hatching slides across the metal like a lamp moving.
    lightTarget.set(px * 0.95, -py * 0.85 + 0.3, 0.62).normalize()
    light.lerp(lightTarget, 1 - Math.exp(-4 * dt)).normalize()
    metal.uniforms.uLight.value.copy(light)

    // Spring toward the pointer: a little overshoot so it feels like a physical object.
    const tx = py * 0.32
    const ty = px * 0.55
    vx += (tx - rx) * 0.06
    vy += (ty - ry) * 0.06
    vx *= 0.82
    vy *= 0.82
    rx += vx
    ry += vy

    const s = place.s * (0.6 + 0.4 * e) * (1 + scatter * 0.9)
    rig.position.set(place.x * (1 - scatter * 0.35), place.y + Math.sin(t * 0.9) * 0.06 + (1 - e) * -0.6, scatter * 2.2)
    rig.scale.setScalar(s)
    mark.rotation.set(rx + Math.sin(t * 0.5) * 0.06, ry + Math.sin(t * 0.35) * 0.32 + (1 - e) * -2.4 + scatter * Math.PI * 1.4, Math.sin(t * 0.4) * 0.03)
    ring.rotation.z = -t * 0.08 + (1 - e) * 1.5
    ring.rotation.y = ry * 0.4
    ring.scale.setScalar(1 + scatter * 1.2)

    // The ring ticks in one block at a time while the mark is engraved.
    if (build < 1) {
      for (let i = 0; i < 36; i++) placeBlock(i, Math.min(1, Math.max(0, build * 40 - i)))
      blocks.instanceMatrix.needsUpdate = true
    }
    // The clock: one block per second takes the amber, pops, and hands it on.
    if (!reduced && build >= 1 && t - lastTick > 1) {
      lastTick = t
      blocks.setColorAt(hour, hour % 6 === 0 ? violet : ink)
      placeBlock(hour)
      hour = (hour + 1) % 36
      blocks.setColorAt(hour, amber)
      hourPop = 1
      blocks.instanceColor!.needsUpdate = true
    }
    if (hourPop > 0) {
      hourPop = Math.max(0, hourPop - dt * 2.2)
      placeBlock(hour, 1 + Math.sin(hourPop * Math.PI) * 0.6)
      blocks.instanceMatrix.needsUpdate = true
    }
    renderer.render(scene, camera)
  }
  const loop = () => {
    raf = requestAnimationFrame(loop)
    if (visible) render()
  }
  if (reduced) {
    outlineMat.uniforms.uWidth.value = 0.022
    blocks.setColorAt(0, amber)
    blocks.instanceColor!.needsUpdate = true
    render()
  } else loop()

  return {
    start: () => (started = true),
    setScatter: (v) => (scatter = v),
    destroy: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      sec.removeEventListener('pointermove', onMove)
      sec.removeEventListener('pointerleave', onLeave)
      geo.dispose()
      metal.dispose()
      outlineMat.dispose()
      blockGeo.dispose()
      blockMat.dispose()
      renderer.dispose()
    },
  }
}

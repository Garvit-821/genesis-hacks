/** A seeded line drawing of a room: walls, a door gap, a stage and rows of desks. */
function rng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

export function Floorplan({ seed, className = '', fx = true }: { seed: number; className?: string; fx?: boolean }) {
  const r = rng(seed * 9973 + 17)
  const W = 300
  const H = 190
  const cols = 4 + Math.floor(r() * 5)
  const rows = 3 + Math.floor(r() * 3)
  const stageW = 70 + r() * 80
  const desks: Array<[number, number, number, number]> = []
  const top = 52
  const cw = (W - 40) / cols
  const rh = (H - top - 18) / rows
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      if (r() < 0.12) continue
      desks.push([20 + x * cw + cw * 0.15, top + y * rh + rh * 0.2, cw * 0.7, rh * 0.42])
    }
  const door = 40 + r() * 160
  return (
    <svg className={`floorplan ${className}`} viewBox={`0 0 ${W} ${H}`} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true" data-fx={fx ? 'draw' : undefined}>
      <path d={`M${door} 2 H2 V${H - 2} H${W - 2} V2 H${door + 26}`} />
      <path d={`M${door} 2 A26 26 0 0 0 ${door + 26} 28`} strokeDasharray="2 3" />
      <rect x={(W - stageW) / 2} y="12" width={stageW} height="18" />
      {desks.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} />
      ))}
    </svg>
  )
}

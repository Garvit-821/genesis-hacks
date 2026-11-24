/**
 * Camera stations for the "Three words" sculpture. Shared by the DOM plan view (Home.tsx) and the
 * WebGL scene (angleScene.ts); kept free of three.js so the page chunk stays light.
 * az: degrees around the sculpture (0 = front), el: degrees above the horizon, r: distance.
 */
export type CamState = { az: number; el: number; r: number }

/** Where the camera waits before the section pins: far off to one side, the sculpture reads as noise. */
export const START: CamState = { az: -128, el: 24, r: 15.5 }

/** The three viewpoints. From each one, and only that one, its word resolves. */
export const VIEWS: readonly CamState[] = [
  { az: -36, el: 8, r: 9 }, // Unorthodox
  { az: 54, el: -15, r: 9 }, // Daring, from below
  { az: 6, el: 33, r: 9 }, // Fast, from above
]

/** Between Unorthodox and Daring the camera dives through the middle of the sculpture. */
export const THROUGH: CamState = { az: 8, el: -2, r: 5.6 }

/** The pull-back after Fast: all the parts, no word. */
export const END: CamState = { az: 130, el: 18, r: 16 }

/** Radius of the plan view in world units. */
export const MAP_R = 16

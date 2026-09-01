/**
 * §4.6's checks, as one function. The contrast test and the /tokens page both
 * call this, so the page can never show a pass the test would reject.
 *
 * Every threshold is a number. "Visibly different" is not something a function
 * can assert, so it is not checked here — that is what looking at /tokens is
 * for.
 */
import { palettes, type Palette, type PaletteName, type Role } from "./palette"

export function checkPalette(name: PaletteName, mode: Mode): Check[] {
  const palette = palettes[name]
  const value = (role: Role) => palette[role][mode]

  return CHECKS.map(([foreground, background, minimum]) => {
    const ratio = contrastRatio(value(foreground), value(background))
    return { foreground, background, minimum, ratio, passes: ratio >= minimum }
  })
}

/** WCAG 2.x relative luminance contrast, rounded the way §4.6 quotes it. */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 1000) / 1000
}

export function checkEveryPalette(): Check[] {
  return (Object.keys(palettes) as PaletteName[]).flatMap((name) =>
    MODES.flatMap((mode) =>
      checkPalette(name, mode).map((check) => ({ ...check, palette: name, mode })),
    ),
  )
}

function luminance(hex: string): number {
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(hex.replace("#", "").slice(i, i + 2), 16) / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const channel = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))

export type Mode = "light" | "dark"

export type Check = {
  foreground: Role
  background: Role
  minimum: number
  ratio: number
  passes: boolean
  palette?: PaletteName
  mode?: Mode
}

export const MODES: readonly Mode[] = ["light", "dark"]

/**
 * §4.6's table, in its order. Rows name §5.1's roles exactly.
 *
 * The focus ring is checked against page, card and muted — never against the
 * primary fill, because the ring is an outline drawn *outside* the control, on
 * the surface behind it. An inset ring would need this row to change.
 *
 * Thresholds never move. A failure means a colour is wrong, not that the floor
 * is too high — r5 shipped a border at 1.226 against a 1.25 floor while
 * claiming all-pass.
 */
const CHECKS: readonly [Role, Role, number][] = [
  ["text", "page", 4.5],
  ["text", "card", 4.5],
  ["text", "muted", 4.5],
  ["quiet", "page", 4.5],
  ["quiet", "card", 4.5],
  ["quiet", "muted", 4.5],
  ["quiet", "highlight", 4.5],
  ["text-on-primary", "primary", 4.5],
  ["text-on-highlight", "highlight", 4.5],
  ["text-on-danger", "danger", 4.5],
  ["primary", "page", 3.0],
  ["primary", "card", 3.0],
  ["primary", "muted", 3.0],
  ["danger", "page", 3.0],
  ["danger", "card", 3.0],
  ["input-border", "page", 3.0],
  ["input-border", "card", 3.0],
  ["focus-ring", "page", 3.0],
  ["focus-ring", "card", 3.0],
  ["focus-ring", "muted", 3.0],
  ["border", "page", 1.4],
  ["border", "card", 1.4],
  ["border", "muted", 1.25],
  ["highlight", "page", 1.15],
  ["highlight", "card", 1.15],
  ["card", "page", 1.15],
  ["disabled-text", "disabled-surface", 2.0],
]

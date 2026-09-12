/**
 * §4.6's checks, as one function. The contrast test and the /tokens page both
 * call this, so the page can never show a pass the test would reject.
 *
 * Every threshold is a number. "Visibly different" is not something a function
 * can assert, so it is not checked here — that is what looking at /tokens is
 * for.
 */
import { palettes, type Mode, type PaletteName, type Role } from "./palette"

export function checkPalette(name: PaletteName, mode: Mode): Check[] {
  const palette = palettes[name]
  const value = (role: Role) => palette[role][mode]

  const fill = (target: Fill) =>
    typeof target === "string" ? value(target) : shade(value(target.role), value("text"), target.state)

  return CHECKS.map(([foreground, background, minimum]) => {
    const ratio = contrastRatio(value(foreground), fill(background))
    return { foreground, background: label(background), minimum, ratio, passes: ratio >= minimum }
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

/**
 * `color-mix(in srgb, fill P%, text)`, in JS. srgb mixes the gamma-encoded
 * bytes, so this is a plain per-channel average of the parsed values — no
 * linearisation, unlike luminance() below. It has to stay in step with the
 * `pressable` utility in globals.css: if the percentages there move, MIX moves.
 * Exported for the test that enforces it — comments alone let the two drift.
 */
function shade(fill: string, text: string, state: PressableState): string {
  const weight = MIX[state]
  const toward = bytes(text)
  return `#${bytes(fill)
    .map((c, i) => Math.round(c * weight + toward[i] * (1 - weight)))
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`
}

function luminance(hex: string): number {
  const [r, g, b] = bytes(hex).map((c) => channel(c / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const bytes = (hex: string) => [0, 2, 4].map((i) => parseInt(hex.replace("#", "").slice(i, i + 2), 16))

const channel = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))

const label = (target: Fill) => (typeof target === "string" ? target : `${target.role} (${target.state})`)

export type { Mode }

export type Check = {
  foreground: Role
  background: string
  minimum: number
  ratio: number
  passes: boolean
  palette?: PaletteName
  mode?: Mode
}

export const MODES: readonly Mode[] = ["light", "dark"]

/** A background a check measures against: a flat role, or a role as `pressable` paints it. */
type Fill = Role | { role: Role; state: PressableState }

type PressableState = "hover" | "press"

/** The percentages in globals.css's `pressable` utility. */
export const MIX = { hover: 0.8, press: 0.6 } as const

const hover = (role: Role): Fill => ({ role, state: "hover" })
const press = (role: Role): Fill => ({ role, state: "press" })

/**
 * §4.6's table, in its order. Rows name §5.1's roles exactly.
 *
 * The focus ring is checked against page, card and muted — never against the
 * primary fill, because the ring is an outline drawn *outside* the control, on
 * the surface behind it. An inset ring would need this row to change.
 *
 * A pressable role is checked in all three of its states, because the hover and
 * press fills are the ones a hand-measurement is most likely to have got wrong
 * and the axe sweep only catches them after a full Storybook build.
 *
 * Thresholds never move. A failure means a colour is wrong, not that the floor
 * is too high — r5 shipped a border at 1.226 against a 1.25 floor while
 * claiming all-pass.
 */
const CHECKS: readonly [Role, Fill, number][] = [
  ["text", "page", 4.5],
  ["text", "card", 4.5],
  ["text", "muted", 4.5],
  ["quiet", "page", 4.5],
  ["quiet", "card", 4.5],
  ["quiet", "muted", 4.5],
  ["quiet", "highlight", 4.5],
  ["text-on-primary", "primary", 4.5],
  ["text-on-primary", hover("primary"), 4.5],
  ["text-on-primary", press("primary"), 4.5],
  ["text-on-highlight", "highlight", 4.5],
  ["text-on-danger", "danger-surface", 4.5],
  ["text-on-danger", hover("danger-surface"), 4.5],
  ["text-on-danger", press("danger-surface"), 4.5],
  ["danger", "page", 4.5],
  ["danger", "card", 4.5],
  ["primary", "page", 3.0],
  ["primary", "card", 3.0],
  ["primary", "muted", 3.0],
  ["danger-surface", "page", 3.0],
  ["danger-surface", "card", 3.0],
  ["input-border", "page", 3.0],
  ["input-border", "card", 3.0],
  ["input-border", "muted", 3.0],
  ["focus-ring", "page", 3.0],
  ["focus-ring", "card", 3.0],
  ["focus-ring", "muted", 3.0],
  ["border", "page", 1.4],
  ["border", "card", 1.4],
  ["border", "muted", 1.25],
  ["highlight", "page", 1.15],
  // Card carries the higher floor: it is the surface a hovered row sits on
  // (LINK_HOST paints highlight over card), so this row means "the hover
  // reads" — 1.15 once blessed a 1.17 hover no eye could see (bbk-42y).
  ["highlight", "card", 1.5],
  ["highlight", "muted", 1.15],
  ["card", "page", 1.15],
  ["disabled-text", "disabled-surface", 2.0],
]

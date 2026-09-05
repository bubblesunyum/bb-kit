/**
 * Both palettes in one file. The check function, the contrast test and
 * scripts/build-tokens.mts all import this, so a colour is written down once.
 *
 * The values are hand-fixed, not generated. Several roles sit between steps of
 * the ramp they started from, because they were tuned until §4.6 passed — so
 * regenerating them from the ramp would produce different colours. Plan §5.1
 * and §5.2 hold the same tables; these are the source of truth.
 */
export const palettes: Record<PaletteName, Palette> = {
  // Forest teal. One green hue for the brand, and a near-grey built at the same
  // hue with a trace of colour, so the greys sit with the green.
  forest: {
    "page": { light: "#E7EDEA", dark: "#0C110F" },
    "card": { light: "#FFFFFF", dark: "#1F2623" },
    "text": { light: "#0C110F", dark: "#F2F6F4" },
    "quiet": { light: "#4B5350", dark: "#B8C0BD" },
    "muted": { light: "#D2D9D6", dark: "#353D39" },
    "primary": { light: "#03614B", dark: "#57BA9A" },
    "text-on-primary": { light: "#FFFFFF", dark: "#00160F" },
    "highlight": { light: "#8DD6BA", dark: "#035541" },
    "text-on-highlight": { light: "#034937", dark: "#E1F4EC" },
    "border": { light: "#B8C0BD", dark: "#474F4C" },
    "input-border": { light: "#697774", dark: "#828C88" },
    "focus-ring": { light: "#007C60", dark: "#C2E8D9" },
    "disabled-surface": { light: "#D2D9D6", dark: "#353D39" },
    "disabled-text": { light: "#7F8985", dark: "#6D7773" },
    "danger": { light: "#AC1A1C", dark: "#F47C70" },
    "text-on-danger": { light: "#FFFFFF", dark: "#00160F" },
  },
  // Not a product — a test. Warm, loud, and inverted in both modes: light mode
  // has a dark page and a light primary, which is what catches a component
  // assuming the primary colour is the dark one.
  clash: {
    "page": { light: "#371C15", dark: "#F5E4DF" },
    "card": { light: "#4F2E26", dark: "#FEFBFA" },
    "text": { light: "#FDF2F0", dark: "#29140F" },
    "quiet": { light: "#C3ABA4", dark: "#5F4741" },
    "muted": { light: "#220D08", dark: "#E4CBC4" },
    "primary": { light: "#FFC0AF", dark: "#812E19" },
    "text-on-primary": { light: "#2E110A", dark: "#FEF7F5" },
    "highlight": { light: "#5F362B", dark: "#F6AF9D" },
    "text-on-highlight": { light: "#FCEEEB", dark: "#522C22" },
    "border": { light: "#7B5A52", dark: "#C4AAA4" },
    "input-border": { light: "#AE9089", dark: "#5F4741" },
    "focus-ring": { light: "#FFB6A3", dark: "#963118" },
    "disabled-surface": { light: "#4F2E26", dark: "#E4CBC4" },
    "disabled-text": { light: "#7C625B", dark: "#A68B84" },
    "danger": { light: "#F87C89", dark: "#AC1A1C" },
    "text-on-danger": { light: "#240705", dark: "#FEFBFA" },
  },
}

export type PaletteName = "forest" | "clash"

export type Mode = "light" | "dark"

/** One value per role per mode. Every role in §5.1's table, in its order. */
export type Palette = Record<Role, { light: string; dark: string }>

export type Role = (typeof ROLES)[number]

export const ROLES = [
  "page",
  "card",
  "text",
  "quiet",
  "muted",
  "primary",
  "text-on-primary",
  "highlight",
  "text-on-highlight",
  "border",
  "input-border",
  "focus-ring",
  "disabled-surface",
  "disabled-text",
  "danger",
  "text-on-danger",
] as const

export const DEFAULT_PALETTE: PaletteName = "forest"

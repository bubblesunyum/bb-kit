/**
 * Rule 7: no component ever names a color. Roles only.
 *
 * The violation this exists to catch is `text-white` on a primary button. In the
 * default palette's light mode, "text on primary" *is* white — so it looks right
 * in three of the four palette-and-mode combinations and is white-on-mint in the
 * fourth. Nothing else in the build would report it.
 */
export function findColorViolations(source: string): Violation[] {
  return BANNED.flatMap(({ what, pattern }) =>
    [...source.matchAll(pattern)].map((match) => ({
      what,
      found: match[0],
      line: source.slice(0, match.index).split("\n").length,
    })),
  )
}

export type Violation = { what: string; found: string; line: number }

// Tailwind's built-in palette, plus the keywords that behave like it. A role
// token is a word we chose — page, card, quiet — so anything on this list
// reaching a component means the palette was bypassed.
const PALETTE = [
  "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber",
  "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue",
  "indigo", "violet", "purple", "fuchsia", "pink", "rose", "white", "black",
]

// Every utility that takes a color. `border-` and `ring-` also take widths, but
// a width is a number and none of these names is a number.
const UTILITIES = [
  "text", "bg", "border", "ring", "outline", "divide", "fill", "stroke",
  "from", "via", "to", "decoration", "shadow", "accent", "caret", "placeholder",
]

const BANNED = [
  { what: "a hex literal", pattern: /#[0-9a-fA-F]{3,8}\b/g },
  { what: "a color function", pattern: /\b(rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/g },
  { what: "the dark: variant", pattern: /\bdark:/g },
  {
    what: "a built-in Tailwind color",
    pattern: new RegExp(
      String.raw`\b(?:${UTILITIES.join("|")})-(?:${PALETTE.join("|")})(?:-\d{2,3})?\b`,
      "g",
    ),
  },
]

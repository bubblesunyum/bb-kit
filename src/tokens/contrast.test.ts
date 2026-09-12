import { readFileSync } from "node:fs"
import { describe, expect, test } from "vitest"
import { checkPalette, contrastRatio, MIX, MODES } from "./contrast"
import { palettes, type PaletteName } from "./palette"

describe.each(Object.keys(palettes) as PaletteName[])("%s", (palette) => {
  describe.each(MODES)("%s", (mode) => {
    // Named per row so a failure says which pair is wrong, not just that one is.
    test.each(checkPalette(palette, mode))(
      "$foreground on $background clears $minimum",
      ({ ratio, minimum }) => {
        expect(ratio).toBeGreaterThanOrEqual(minimum)
      },
    )
  })
})

test("contrast ratio matches known values", () => {
  expect(contrastRatio("#FFFFFF", "#000000")).toBe(21)
  expect(contrastRatio("#000000", "#FFFFFF")).toBe(21)
  expect(contrastRatio("#777777", "#777777")).toBe(1)
})

test("MIX matches the pressable percentages in globals.css", () => {
  const css = readFileSync("src/app/globals.css", "utf8")
  // The colour space is part of the coupling too: shade() averages srgb bytes,
  // so a space change here without one there diverges just as silently.
  expect(css.match(/color-mix\(in srgb, var\(--pressable-fill/g)).toHaveLength(2)
  // The fill argument nests a fallback var, so the close is one-or-more parens.
  const percentages = [...css.matchAll(/var\(--pressable-fill.+?\)+\s*([\d.]+)%/g)].map(
    ([, percentage]) => Number(percentage) / 100,
  )

  // In order: hover first, press second. Exactly two — a third mix toward
  // --pressable-fill is a new state the shade() function does not know.
  expect(percentages).toEqual([MIX.hover, MIX.press])
})

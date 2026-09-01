import { describe, expect, test } from "vitest"
import { checkPalette, contrastRatio, MODES } from "./contrast"
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

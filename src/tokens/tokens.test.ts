import { readFileSync } from "node:fs"
import { expect, test } from "vitest"
import { buildTokenCss, OUTPUT } from "../../scripts/build-tokens.mts"

test("the committed token CSS matches the palette file", () => {
  expect(readFileSync(OUTPUT, "utf8")).toBe(buildTokenCss())
})

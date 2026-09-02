import { afterEach, describe, expect, test, vi } from "vitest"

import { classFor } from "./classes"

const VARIANTS = { plain: "", outline: "border", raised: "shadow-xs" }

afterEach(() => {
  vi.restoreAllMocks()
})

describe("looking a value up", () => {
  test("it returns the classes for a known value", () => {
    expect(classFor(VARIANTS, "outline", "Surface's variant")).toBe("border")
  })

  // The whole point: a wrong guess otherwise lands as an ignored attribute and
  // looks like it worked.
  test("it warns for an unknown value, naming what was expected", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    expect(classFor(VARIANTS, "soft", "Surface's variant")).toBe("")
    expect(warn).toHaveBeenCalledWith(
      'bb-kit: unknown Surface\'s variant "soft". Expected plain, outline, raised.',
    )
  })

  test("it warns once, however many times a component re-renders", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    classFor(VARIANTS, "squishy", "Surface's variant")
    classFor(VARIANTS, "squishy", "Surface's variant")

    expect(warn).toHaveBeenCalledTimes(1)
  })
})

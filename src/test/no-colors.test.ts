import { globSync, readFileSync } from "node:fs"
import { describe, expect, test } from "vitest"
import { findColorViolations } from "./no-colors"

describe("the detector", () => {
  test.each([
    ["bg-[#1F2623]", "a hex literal"],
    ["style={{ color: 'rgb(0 0 0)' }}", "a color function"],
    ["oklch(0.7 0.1 200)", "a color function"],
    ["dark:bg-card", "the dark: variant"],
    ["text-white", "a built-in Tailwind color"],
    ["bg-black/6", "a built-in Tailwind color"],
    ["text-slate-500", "a built-in Tailwind color"],
    ["border-gray-200", "a built-in Tailwind color"],
  ])("rejects %s", (source, what) => {
    expect(findColorViolations(source)).toContainEqual(
      expect.objectContaining({ what }),
    )
  })

  test.each([
    "bg-card text-text",
    "border-border ring-focus-ring",
    "bg-primary/50 text-on-primary",
    "text-quiet hover:bg-highlight",
    // The role names are ordinary words, and two of them collide with utilities
    // that also take a colour. Neither is a palette name, so neither may trip.
    "shadow-card border-b",
  ])("allows %s", (source) => {
    expect(findColorViolations(source)).toEqual([])
  })
})

test("no component source names a color", () => {
  const files = globSync("src/components/**/*.{ts,tsx}")

  const violations = files.flatMap((file) =>
    findColorViolations(readFileSync(file, "utf8")).map(
      (v) => `${file}:${v.line} — ${v.what}: ${v.found}`,
    ),
  )

  expect(violations).toEqual([])
})

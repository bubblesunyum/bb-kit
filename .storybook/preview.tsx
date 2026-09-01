import type { Decorator, Preview } from "@storybook/nextjs-vite"
// The app's real stylesheet, not just the tokens: it is what carries Tailwind
// itself, the @theme inline mapping and the base layer. Importing tokens.css
// alone gives stories the colour variables but no utilities at all, and the
// failure is silent — every class simply does nothing.
import "../src/app/globals.css"
import { Theme } from "../src/components/theme"
import { MODES } from "../src/tokens/contrast"
import { DEFAULT_PALETTE, palettes, type PaletteName } from "../src/tokens/palette"

// Derived, so adding a palette adds a toolbar entry and a four-up cell at once.
const PALETTES = Object.keys(palettes) as PaletteName[]

/**
 * Storybook renders into its own canvas, which is white. Theme paints a
 * background whenever it is given a mode, which is why every cell below passes
 * one explicitly — without it, dark mode is near-white text on a white canvas
 * and every story looks broken.
 */
const withTheme: Decorator = (Story, { globals }) => {
  if (globals.layout === "four-up") {
    return (
      /* The frame is pinned to the default palette's light border rather than
         left bare: with no Theme above it, its --border would resolve against
         :root's `color-scheme: light dark` and so follow whoever's laptop this
         is, which is the one thing a four-up view must not do. */
      <Theme
        palette={DEFAULT_PALETTE}
        mode="light"
        className="bg-border grid grid-cols-2 gap-px"
      >
        {PALETTES.flatMap((palette) =>
          MODES.map((mode) => (
            <Theme key={`${palette}-${mode}`} palette={palette} mode={mode} className="p-4">
              <p className="text-quiet mb-3 text-xs tracking-wide uppercase">
                {palette} {mode}
              </p>
              <Story />
            </Theme>
          )),
        )}
      </Theme>
    )
  }

  return (
    <Theme palette={globals.palette} mode={globals.mode} className="min-h-svh p-4">
      <Story />
    </Theme>
  )
}

const preview: Preview = {
  decorators: [withTheme],
  initialGlobals: { palette: "forest", mode: "light", layout: "single" },
  globalTypes: {
    palette: {
      description: "Palette",
      toolbar: { icon: "paintbrush", items: PALETTES, dynamicTitle: true },
    },
    mode: {
      description: "Mode",
      toolbar: { icon: "circlehollow", items: MODES, dynamicTitle: true },
    },
    layout: {
      description: "Layout",
      toolbar: {
        icon: "grid",
        // Both palettes across both modes, at once. The clashing palette exists
        // to catch a component that assumes the primary is dark, and you catch
        // that by seeing both side by side rather than toggling and remembering.
        items: [
          { value: "single", title: "Single" },
          { value: "four-up", title: "Four-up" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    // The decorator paints the page background itself, so Storybook's default
    // padding would leave a frame of the *canvas* colour around every story —
    // and the canvas takes :root, which is forest light. A clash dark story
    // inside a forest light frame is exactly the half-and-half look this whole
    // setup exists to avoid.
    layout: "fullscreen",

    // Viewport is part of core now rather than an addon, and is configured here.
    // The first consumer is a portfolio read on phones; nothing else in the kit
    // would surface a card that breaks at 375.
    viewport: {
      options: {
        phone: { name: "Phone", styles: { width: "375px", height: "812px" } },
        tablet: { name: "Tablet", styles: { width: "768px", height: "1024px" } },
        desktop: { name: "Desktop", styles: { width: "1440px", height: "900px" } },
      },
    },
    a11y: { test: "error" },
  },
}

export default preview

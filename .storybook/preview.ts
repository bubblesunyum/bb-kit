import type { Preview } from "@storybook/nextjs-vite"
// The app's real stylesheet, not just the tokens: it is what carries Tailwind
// itself, the @theme inline mapping and the base layer. Importing tokens.css
// alone gives stories the colour variables but no utilities at all, and the
// failure is silent — every class simply does nothing.
import "../src/app/globals.css"

const preview: Preview = {
  parameters: {
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

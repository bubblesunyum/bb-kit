import type { Preview } from "@storybook/nextjs-vite"
import "../src/tokens/tokens.css"

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

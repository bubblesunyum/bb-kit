import type { StorybookConfig } from "@storybook/nextjs-vite"

const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-a11y",
    // Only one element on a page can hold keyboard focus, so a grid of buttons
    // shows twenty resting states and no focus ring. This forces the states so
    // they can be seen side by side.
    "storybook-addon-pseudo-states",
  ],
}

export default config

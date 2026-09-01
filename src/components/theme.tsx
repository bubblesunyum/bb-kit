import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import type { Mode, PaletteName } from "@/tokens/palette"

/**
 * Sets the palette, the mode, or both on a subtree. No JavaScript at all, so it
 * renders on the server — the root provider is a separate component for exactly
 * that reason.
 *
 * Omit either prop and that half is inherited, which is what makes a
 * clash-palette island inside a dark page work without restating the mode.
 */
export function Theme({ palette, mode, className, ...props }: ThemeProps) {
  return (
    <div
      data-slot="theme"
      data-theme={palette}
      data-mode={mode}
      /* Changing either half changes what the tokens resolve to, and neither
         paints anything on its own — so a Theme that changes anything has to
         repaint, or it shows the surface behind it under its own text colour.
         A palette-only island is the easy one to miss: its text flips to the
         new palette while the background stays the old one. */
      className={cn((palette || mode) && "bg-page text-text", className)}
      {...props}
    />
  )
}

type ThemeProps = Omit<ComponentProps<"div">, "mode"> & {
  palette?: PaletteName
  mode?: Mode
}

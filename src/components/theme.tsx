import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import type { PaletteName } from "@/tokens/palette"

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
      /* Switching color-scheme changes what the tokens resolve to; it paints
         nothing. Without a background here the dark page shows through behind a
         light island's dark text. Only when a mode is given: an inherited-mode
         Theme should stay transparent so it sits on whatever is behind it. */
      className={cn(mode && "bg-page text-text", className)}
      {...props}
    />
  )
}

type ThemeProps = Omit<ComponentProps<"div">, "mode"> & {
  palette?: PaletteName
  mode?: Mode
}

type Mode = "light" | "dark"

"use client"

import { ThemeProvider as NextThemes } from "next-themes"
import type { ComponentProps } from "react"

/**
 * The root provider, one per app. Wraps next-themes for the mode only — it
 * writes data-mode, saves the reader's choice, follows the system preference,
 * and runs the before-paint script.
 *
 * enableColorScheme stays on: it writes color-scheme onto <html>, which is what
 * light-dark() reads.
 *
 * Nothing manages the palette. In v0 the site fixes it at build time and only
 * <Theme> overrides it. If readers ever pick it themselves, nest a second
 * next-themes provider on data-theme rather than hand-rolling one.
 *
 * The before-paint script changes attributes on <html> before React starts, so
 * React reports a hydration mismatch. The fix is <html suppressHydrationWarning>
 * in the root layout — NOT moving the theme into React state, which would break
 * server rendering and nested overrides both.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemes
      attribute="data-mode"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      {...props}
    >
      {children}
    </NextThemes>
  )
}

type ThemeProviderProps = ComponentProps<typeof NextThemes>

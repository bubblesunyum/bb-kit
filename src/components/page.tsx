import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/**
 * The background everything else sits on. Nothing else in the kit paints the
 * page, so without it a card floats on browser-default white and quiet text
 * against a dark palette is unreadable.
 *
 * It is a `div`, so the real `<body>` behind it is still white — visible on a
 * rubber-band scroll and behind any page shorter than the viewport. The fix is
 * two lines in the consumer's own layout, which the registry entry ships:
 * `<html suppressHydrationWarning>` and `<body className="bg-page text-text">`.
 * `Page` still earns its place, because a subtree can be a whole page of its
 * own — a preview frame, a story, a nested `Theme`.
 *
 * There is no padding and no max width. A page is not always a column of prose,
 * and a default that half the callers have to undo is the wrong default.
 */
export function Page({ className, ...props }: PageProps) {
  return (
    <div
      data-slot="page"
      /* dvh rather than a percentage, because a percentage height is only as
         tall as its parent and a bare `<div>` under `<body>` has no height to
         inherit — the background would stop at the last line of text. */
      className={cn("bg-page text-text min-h-dvh", className)}
      {...props}
    />
  )
}

type PageProps = ComponentProps<"div">

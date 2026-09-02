import type { ComponentProps } from "react"

import { classFor } from "@/lib/classes"
import { cn } from "@/lib/utils"

/**
 * A real dividing line. Horizontal by default; vertical when asked.
 *
 * A semantic separator rather than a border on a neighbouring element, so it
 * carries `role="separator"` and is visible to assistive tech in the structure.
 */
export function Separator({
  orientation = "horizontal",
  className,
  ...props
}: SeparatorProps) {
  const safeOrientation = isOrientation(orientation) ? orientation : "horizontal"

  return (
    <div
      {...props}
      data-slot="separator"
      data-orientation={safeOrientation}
      role="separator"
      aria-orientation={safeOrientation}
      className={cn(
        "bg-border shrink-0",
        classFor(ORIENTATIONS, orientation, "Separator's orientation"),
        className,
      )}
    />
  )
}

function isOrientation(value: string): value is Orientation {
  return value in ORIENTATIONS
}

type SeparatorProps = Omit<ComponentProps<"div">, "children"> & {
  orientation?: Orientation
}

type Orientation = keyof typeof ORIENTATIONS

const ORIENTATIONS = {
  horizontal: "h-px w-full",
  vertical: "h-full w-px self-stretch",
} as const

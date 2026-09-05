import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/**
 * A placeholder for content that has not arrived yet. The caller knows the
 * height the real content will take, so they pick the size — it defaults to a
 * single 16px bar, full width, which is right for a line of body copy.
 *
 * Holds still for readers who asked for reduced motion, through a CSS media
 * query rather than a JS hook — a hook would force the component into the
 * browser and off the server-renderable list.
 */
export function Skeleton({
  lines = 1,
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  const count = sanitizeLines(lines)
  const normalizedWidth = toCssDimension(width)
  const normalizedHeight = toCssDimension(height)

  if (count === 0) return null

  if (count === 1) {
    return (
      <div
        {...props}
        data-slot="skeleton"
        aria-hidden="true"
        className={cn(PULSE, !normalizedHeight && "h-4", !normalizedWidth && "w-full", className)}
        style={{
          width: normalizedWidth ?? undefined,
          height: normalizedHeight ?? undefined,
          ...style,
        }}
      />
    )
  }

  return (
    <div
      {...props}
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("flex flex-col gap-2", !normalizedWidth && "w-full", className)}
      style={{ width: normalizedWidth ?? undefined, ...style }}
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonLine key={index} isLast={index === count - 1} height={normalizedHeight} />
      ))}
    </div>
  )
}

const PULSE = "bg-muted animate-pulse rounded-md motion-reduce:animate-none"

function SkeletonLine({ isLast, height }: { isLast: boolean; height: string | undefined }) {
  return (
    <div
      data-slot="skeleton-line"
      className={cn(PULSE, !height && "h-4", isLast ? "w-3/4" : "w-full")}
      style={{ height: height ?? undefined }}
    />
  )
}

function sanitizeLines(value: number): number {
  if (!Number.isFinite(value)) return 1
  const floored = Math.floor(value)
  if (floored <= 0) return 0
  return Math.min(floored, 20)
}

function toCssDimension(value: string | number | undefined): string | undefined {
  if (value == null) return undefined
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return undefined
    return `${value}px`
  }
  return value
}

type SkeletonProps = Omit<ComponentProps<"div">, "children"> & {
  /** How many bars to render. One bar is the default — a single line. */
  lines?: number
  /**
   * The width of the whole skeleton, not of one bar: any CSS length —
   * "200px", "50%", 200 (as px). Defaults to 100%. On a multi-line skeleton
   * the lines fill it and the last still ends short, because a short last line
   * is what a paragraph looks like rather than something width should undo.
   */
  width?: string | number
  /** Any CSS length: "1rem", "16px", 16 (as px). Defaults to 16px (h-4). */
  height?: string | number
}

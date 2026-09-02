import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

import { H3, Text } from "./text"

/**
 * What to show when there is nothing to show. A centred stack with an
 * optional icon, a title, a quiet description and a place for an action.
 *
 * It is not a page — callers decide where it sits and how tall its container
 * is. Inside a `List` the empty slot renders it; on its own it centres within
 * whatever box it is given.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      {...props}
      data-slot="empty-state"
      className={cn("flex flex-col items-center gap-3 px-6 py-12 text-center", className)}
    >
      {icon ? (
        <div
          data-slot="empty-state-icon"
          className="text-quiet flex size-12 items-center justify-center [&_svg]:size-8"
        >
          {icon}
        </div>
      ) : null}
      {title ? (
        <H3 data-slot="empty-state-title" className="max-w-sm wrap-break-word">
          {title}
        </H3>
      ) : null}
      {description ? (
        <Text
          data-slot="empty-state-description"
          tone="quiet"
          size="sm"
          className="max-w-sm wrap-break-word"
        >
          {description}
        </Text>
      ) : null}
      {action ? (
        <div data-slot="empty-state-action" className="pt-2">
          {action}
        </div>
      ) : null}
    </div>
  )
}

type EmptyStateProps = Omit<ComponentProps<"div">, "children"> & {
  title?: string
  description?: string
  icon?: ReactNode
  /** Usually a button — PrimaryButton, GhostButton — or a link. */
  action?: ReactNode
}

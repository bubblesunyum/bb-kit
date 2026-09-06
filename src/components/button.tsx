import type { ComponentProps } from "react"

import { classFor } from "@/lib/classes"
import { cn } from "@/lib/utils"

/**
 * A real `<button>`. The four forms are paint only — same shape, same sizes,
 * same focus ring — so a row of mixed buttons lines up without being asked.
 *
 * The default form is `primary`, and there is no `Button variant="default"`
 * spelled differently: `default` is accepted as a silent alias, because it is
 * the word an agent types from shadcn habit and warning about it would be
 * warning about a right answer.
 */
export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      /* min-h, not h: a fixed height turns a long label into text sitting
         outside its own button, and the button that finally gets a long label
         is never the one you were looking at. */
      className={cn(
        /* wrap-anywhere, not Text's wrap-break-word: the label is an anonymous
           flex item, whose automatic minimum width is the longest unbreakable
           word, so break-word never gets the chance to break one and a pasted
           filename spills off the side of the page. Only `anywhere` shrinks
           that minimum. */
        "inline-flex items-center justify-center gap-2 rounded-lg text-center font-medium wrap-anywhere",
        /* No `outline-none` here: in Tailwind v4 it sets --tw-outline-style to
           none, which the focus-visible utilities below then inherit, and the
           ring silently never draws. Browsers only paint their own ring on
           :focus-visible anyway, and these rules replace it. */
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        /* pointer-events-none rather than a not-allowed cursor: it is the one
           thing that also stops the hover and press styles from firing on a
           button that cannot be pressed. */
        "disabled:pointer-events-none disabled:text-disabled-text",
        "transition-[background-color,color,transform] duration-120 ease-standard",
        "active:scale-[0.98] motion-reduce:active:scale-100",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        classFor(SIZES, size, "Button's size"),
        classFor(VARIANTS, variant, "Button's variant"),
        className,
      )}
      {...props}
    />
  )
}

/** The one that does the thing. Filled with the primary colour. */
export function PrimaryButton(props: FormProps) {
  return <Button variant="primary" {...props} />
}

/** No fill until you point at it. What a secondary action next to a primary looks like. */
export function GhostButton(props: FormProps) {
  return <Button variant="ghost" {...props} />
}

/**
 * A button that looks like a link — not a link that looks like a button. It is
 * still a `<button>`, so use it for actions, and use a real `<a>` for going
 * somewhere.
 */
export function LinkButton(props: FormProps) {
  return <Button variant="link" {...props} />
}

/** Deleting, discarding, anything you would want a moment to reconsider. */
export function DangerButton(props: FormProps) {
  return <Button variant="danger" {...props} />
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant
  size?: Size
}

/** The wrappers pick the variant, so no caller can pass a second one. */
type FormProps = Omit<ButtonProps, "variant">

type Variant = keyof typeof VARIANTS
type Size = keyof typeof SIZES

// 32 / 40 / 48px, all well clear of the 24px minimum target size in §5.6.
const SIZES = {
  sm: "min-h-8 gap-1.5 px-3 py-1 text-sm",
  md: "min-h-10 px-4 py-2 text-base",
  lg: "min-h-12 px-6 py-2.5 text-lg",
} as const

// Roles, never colours — Rule 7. The /90 and /80 steps are the fill mixed with
// what is behind it, which is why hover works on both palettes without a
// second set of tokens to keep in step.
const PRIMARY =
  "bg-primary text-text-on-primary hover:bg-primary/90 active:bg-primary/80 disabled:bg-disabled-surface"

const VARIANTS = {
  primary: PRIMARY,
  // The same string, not a copy of it, so the alias cannot drift from primary.
  default: PRIMARY,
  ghost: "text-text hover:bg-muted",
  link: "text-primary underline-offset-4 hover:underline",
  /* The press holds at /90 instead of deepening to /80: in clash light the
     fill mixes toward a dark page behind dark text, and /80 sinks to 3.98
     against the 4.5 floor. The press still reads — the button scales. */
  danger:
    "bg-danger-surface text-text-on-danger hover:bg-danger-surface/90 active:bg-danger-surface/90 disabled:bg-disabled-surface",
} as const

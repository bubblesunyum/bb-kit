import type { ComponentProps, MouseEvent } from "react"

import { classFor } from "@/lib/classes"
import { cn } from "@/lib/utils"

/**
 * A pill, and a real `<button>` — the tag filter toggle as well as the tag.
 *
 * There is no `variant`. The only two appearances are unselected and selected,
 * and those are states: a `filled` variant would be a second way to say
 * `selected`. Unselected is outlined; selected is filled with the primary
 * colour rather than the highlight, because no pale tint reaches the 3:1 a
 * control's state needs. The two also differ in text colour and weight, so the
 * state survives someone who cannot tell the hues apart, and `aria-pressed`
 * carries it to a screen reader.
 */
export function Badge({
  size = "md",
  selected = false,
  onSelectedChange,
  onClick,
  className,
  ...props
}: BadgeProps) {
  return (
    <button
      type="button"
      data-slot="badge"
      aria-pressed={selected}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (!event.defaultPrevented) onSelectedChange?.(!selected)
      }}
      /* Same reasoning as Button: min-h keeps a long tag inside its own pill,
         and wrap-anywhere is the only thing that shrinks a flex item's
         automatic minimum width below one unbreakable word. */
      className={cn(
        "inline-flex items-center justify-center gap-1.5 text-center wrap-anywhere",
        /* Caps and a little tracking read as a label rather than a
           sentence, which is what lets the pill shrink this far without
           the text turning into a hard-to-scan smudge. */
        "uppercase tracking-[0.5px]",
        /* No `outline-none` — in Tailwind v4 it sets --tw-outline-style to none
           and the focus-visible utilities below inherit it, so the ring never
           draws. */
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        /* pointer-events-none is the one thing that also stops hover and press
           firing on a badge that cannot be pressed. */
        "disabled:pointer-events-none disabled:text-disabled-text",
        "transition-[background-color,color,border-color,opacity,transform] duration-120 ease-standard",
        "active:scale-[0.97] motion-reduce:active:scale-100",
        "[&_svg]:size-[0.95em] [&_svg]:shrink-0",
        classFor(SIZES, size, "Badge's size"),
        selected ? SELECTED : UNSELECTED,
        className,
      )}
      {...props}
    />
  )
}

type BadgeProps = Omit<ComponentProps<"button">, "type"> & {
  size?: Size
  selected?: boolean
  onSelectedChange?: (next: boolean) => void
}

type Size = keyof typeof SIZES

// 28 / 32 / 40px — one step under Button, because a badge is a tag first and
// a control second, and a row of them on a card should sit quieter than the
// buttons around it. A default badge lines up with a small Button rather than
// a default one, which is the pairing a filter bar actually wants.
//
// The radius is half the *minimum* height rather than rounded-full, which is
// half the actual one. On a single line the two are identical and it is a
// pill; on a tag long enough to wrap, rounded-full grows ellipse ends that the
// middle lines of the label then run into.
const SIZES = {
  sm: "min-h-7 rounded-[0.875rem] px-2.5 py-0.5 text-xs",
  md: "min-h-8 rounded-[1rem] px-3 py-1 text-sm",
  lg: "min-h-10 rounded-[1.25rem] px-4 py-1.5 text-base",
} as const

// The border role is the input one, not the plain border: an unselected badge
// is a control whose outline is the only thing marking it, and that needs 3:1.
const UNSELECTED =
  "border-input-border border font-normal text-text hover:bg-muted disabled:border-disabled-surface"

const SELECTED =
  "border border-transparent bg-primary font-medium text-text-on-primary pressable [--pressable-fill:var(--primary)] disabled:bg-disabled-surface"

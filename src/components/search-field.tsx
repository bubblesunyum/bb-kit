"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { useRef, type ComponentProps } from "react"

import { classFor } from "@/lib/classes"
import { cn } from "@/lib/utils"

/**
 * A real `<input type="search">` with the magnifier and the clear button that
 * a reader expects to find on one.
 *
 * Browser-only, unlike `Button` and `Badge`. Those become browser-only in the
 * caller's file, when a handler is attached there; a search field has nowhere
 * to be but the browser, because `onValueChange` is the whole point of it.
 *
 * It never holds the text. `value` and `onValueChange` are the caller's, which
 * is what lets `FilterBar` keep the input immediate while it delays the
 * filtering behind it.
 *
 * The clear button is not optional and has no prop to remove it — Rule 2. It
 * appears when there is something to clear and is a real button, so it can be
 * tabbed to, which the browser's own is not in every engine.
 */
export function SearchField({
  value,
  onValueChange,
  placeholder = "Search",
  size = "md",
  disabled = false,
  onChange,
  className,
  ...props
}: SearchFieldProps) {
  const field = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={field}
      data-slot="search-field"
      /* The box lives here — border, fill and ring — while the input inside is
         only text. The input wears a fade mask (see MASKS below) and a mask
         cannot share an element with anything it must not fade, so the box
         moved out rather than the mask getting cleverer. Heights stay 32 / 40
         / 48px: with border-box sizing the wrapper's height includes its own
         border, and the input fills it. */
      className={cn(
        "relative border",
        "transition-[background-color,border-color] duration-120 ease-standard",
        /* The same gentle fill Badge and GhostButton use, so a field at the
           head of a filter bar answers a pointer the way the tags under it
           do. Without it rest and hover are indistinguishable. */
        disabled ? "pointer-events-none border-disabled-surface" : "border-input-border hover:bg-muted",
        /* No `outline-none` anywhere: in Tailwind v4 it sets
           --tw-outline-style to none and the ring below inherits it, so the
           ring never draws. */
        "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring",
        classFor(HEIGHTS, size, "SearchField's size"),
        classFor(ROUNDED, size, "SearchField's size"),
        className,
      )}
    >
      <SearchIcon
        data-slot="search-field-icon"
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2",
          disabled ? "text-disabled-text" : "text-quiet",
          classFor(ICONS, size, "SearchField's size"),
        )}
      />

      <input
        type="search"
        data-slot="search-field-input"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        /* The field carries no visible label, so without this it reaches a
           screen reader as an unnamed edit box. A caller passing its own
           aria-label or aria-labelledby still wins, because the spread is last. */
        aria-label={placeholder}
        onChange={(event) => {
          onChange?.(event)
          onValueChange?.(event.target.value)
        }}
        className={cn(
          /* Transparent rather than a surface of its own: there is no input
             background role, and a field has to sit correctly both on the page
             and inside a card without being told which it is on. Borderless for
             the same reason the box lives on the wrapper: the mask below would
             eat straight border segments and leave only the corners. */
          "h-full w-full bg-transparent text-text placeholder:text-quiet",
          "disabled:text-disabled-text disabled:placeholder:text-disabled-text",
          /* WebKit draws its own clear button on a search input, which would
             sit underneath ours. Firefox draws none at all — which is the
             reason ours exists rather than the reason to hide it. */
          "[&::-webkit-search-cancel-button]:appearance-none",
          classFor(FIELDS, size, "SearchField's size"),
          classFor(ROUNDED, size, "SearchField's size"),
          classFor(MASKS, size, "SearchField's size"),
        )}
        {...props}
      />

      {value && !disabled ? (
        <button
          type="button"
          data-slot="search-field-clear"
          aria-label="Clear search"
          /* Clearing unmounts this button, and focus would fall to the body —
             a keyboard reader would be dumped back to the top of the document
             for pressing the button that was under their finger. The ref is on
             the wrapper rather than the input because the input takes the
             caller's props, a caller's own ref among them. */
          onClick={() => {
            onValueChange?.("")
            field.current?.querySelector("input")?.focus()
          }}
          className={cn(
            "absolute inset-y-0 end-0 inline-flex items-center justify-center text-quiet",
            "hover:text-text",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring",
            "transition-[color,transform] duration-120 ease-standard",
            "active:scale-90 motion-reduce:active:scale-100",
            classFor(CLEARS, size, "SearchField's size"),
          )}
        >
          <XIcon aria-hidden className="size-4" />
        </button>
      ) : null}
    </div>
  )
}

/**
 * `className` lands on the wrapper, because that is the box a caller sizes —
 * `max-w-sm`, `w-full`. Everything else spreads onto the input, which is where
 * `id`, `name`, `autoFocus` and the aria attributes belong. Each part carries a
 * `data-slot` for the rest.
 *
 * `size` is the kit's, not the HTML attribute of the same name. `value` is
 * narrowed to a string so it and `onValueChange` agree, and it is required
 * rather than optional: omitting it makes the input uncontrolled, so the DOM
 * would hold text while the prop stayed undefined and the clear button — which
 * reads the prop — never appeared. Required, that is a compile error instead.
 */
type SearchFieldProps = Omit<ComponentProps<"input">, "type" | "size" | "value"> & {
  value: string
  onValueChange?: (next: string) => void
  size?: Size
}

type Size = keyof typeof FIELDS

// 32 / 40 / 48px, matching Button and Badge so a search field at the head of a
// filter bar lines up with the tags under it. On the wrapper, which owns the
// box; the input fills it.
const HEIGHTS = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
} as const

// The horizontal padding is the height on both sides — room for the magnifier
// at the start, and for the clear button, which is exactly that square.
const FIELDS = {
  sm: "ps-8 pe-8 text-sm",
  md: "ps-10 pe-10 text-base",
  lg: "ps-12 pe-12 text-lg",
} as const

// One rounding for the two boxes that have to match: the bordered input and
// the ringed wrapper around it. Separate from FIELDS because the input takes
// both and the wrapper takes only this.
const ROUNDED = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
} as const

// Logical properties throughout, so the magnifier and the clear button swap
// ends in a right-to-left language instead of crossing the text.
const ICONS = {
  sm: "start-2.5",
  md: "start-3",
  lg: "start-4",
} as const

// An overflowing value scrolls to a hard mid-glyph cut against the clear
// button, so the last rem of text fades instead. A mask rather than an overlay
// gradient, because the field is transparent over an unknown background — page
// or card — and there is no colour to fade toward. The input paints nothing
// but text, so the fade can run transparent off the trailing edge with no
// notch: there is no border or fill on this element for it to touch.
//
// Trailing-only, never leading: rest text starts at the leading content edge,
// so a leading fade would ghost every first glyph, while the trailing fade
// only touches text already leaving. The P in each gradient is that size's end
// padding above, and the rtl: half mirrors it — the clear button swaps ends,
// so the fade has to.
const MASKS = {
  sm: "[mask-image:linear-gradient(to_right,black_calc(100%_-_3rem),transparent_calc(100%_-_2rem))] rtl:[mask-image:linear-gradient(to_left,black_calc(100%_-_3rem),transparent_calc(100%_-_2rem))]",
  md: "[mask-image:linear-gradient(to_right,black_calc(100%_-_3.5rem),transparent_calc(100%_-_2.5rem))] rtl:[mask-image:linear-gradient(to_left,black_calc(100%_-_3.5rem),transparent_calc(100%_-_2.5rem))]",
  lg: "[mask-image:linear-gradient(to_right,black_calc(100%_-_4rem),transparent_calc(100%_-_3rem))] rtl:[mask-image:linear-gradient(to_left,black_calc(100%_-_4rem),transparent_calc(100%_-_3rem))]",
} as const

const CLEARS = {
  sm: "w-8 rounded-md",
  md: "w-10 rounded-lg",
  lg: "w-12 rounded-xl",
} as const

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
    <div ref={field} data-slot="search-field" className={cn("relative", className)}>
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
             and inside a card without being told which it is on. */
          "w-full border bg-transparent text-text placeholder:text-quiet",
          /* The same gentle fill Badge and GhostButton use, so a field at the
             head of a filter bar answers a pointer the way the tags under it
             do. Without it rest and hover are indistinguishable. */
          "hover:bg-muted",
          /* No `outline-none` — in Tailwind v4 it sets --tw-outline-style to
             none and the focus-visible utilities below inherit it, so the ring
             never draws. */
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
          /* pointer-events-none is the one thing that also stops the hover fill
             from firing on a field that cannot be typed in. */
          "disabled:pointer-events-none disabled:border-disabled-surface disabled:text-disabled-text disabled:placeholder:text-disabled-text",
          "transition-[background-color,border-color] duration-120 ease-standard",
          /* WebKit draws its own clear button on a search input, which would
             sit underneath ours. Firefox draws none at all — which is the
             reason ours exists rather than the reason to hide it. */
          "[&::-webkit-search-cancel-button]:appearance-none",
          disabled ? "border-disabled-surface" : "border-input-border",
          classFor(FIELDS, size, "SearchField's size"),
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
// filter bar lines up with the tags under it. A fixed height rather than
// Button's minimum: an input is one line by definition and cannot wrap.
//
// The horizontal padding is the height on both sides — room for the magnifier
// at the start, and for the clear button, which is exactly that square.
const FIELDS = {
  sm: "h-8 rounded-md ps-8 pe-8 text-sm",
  md: "h-10 rounded-lg ps-10 pe-10 text-base",
  lg: "h-12 rounded-xl ps-12 pe-12 text-lg",
} as const

// Logical properties throughout, so the magnifier and the clear button swap
// ends in a right-to-left language instead of crossing the text.
const ICONS = {
  sm: "start-2.5",
  md: "start-3",
  lg: "start-4",
} as const

const CLEARS = {
  sm: "w-8 rounded-md",
  md: "w-10 rounded-lg",
  lg: "w-12 rounded-xl",
} as const

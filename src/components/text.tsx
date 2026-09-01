import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/** A paragraph. Everything else in this file is this with the element chosen. */
export function Text(props: TextProps) {
  return <Styled element="p" {...props} />
}

/**
 * Level and size are separate: the wrapper picks the element and defaults for
 * size and weight, and both props still override. Otherwise the semantically
 * correct level would force a look, and a page ends up with an H3 where it
 * means an H2.
 *
 * The plan says a heading wrapper sets a size and nothing else. It also says
 * looking at it is the acceptance step, and at normal weight an H4 is
 * indistinguishable from the paragraph under it — so the weight default stays.
 */
export function H1(props: HeadingProps) {
  return <Styled element="h1" size="3xl" weight="semibold" {...props} />
}

export function H2(props: HeadingProps) {
  return <Styled element="h2" size="2xl" weight="semibold" {...props} />
}

export function H3(props: HeadingProps) {
  return <Styled element="h3" size="xl" weight="semibold" {...props} />
}

export function H4(props: HeadingProps) {
  return <Styled element="h4" size="lg" weight="semibold" {...props} />
}

export function Span(props: SpanProps) {
  return <Styled element="span" {...props} />
}

/** A real <label>, so htmlFor reaches the control it names. */
export function Label(props: LabelProps) {
  return <Styled element="label" {...props} />
}

/**
 * The element is chosen here and never by the caller: a heading level is
 * invisible when you look at one component on its own, and getting it wrong
 * hurts search engines and screen readers on a real page.
 *
 * There is deliberately no `loading` prop. The old kit's sized its skeleton to
 * the font size rather than the line height, so a loading paragraph came out
 * shorter than the text it replaced and the page jumped when it arrived.
 * Callers place `Skeleton` themselves, knowing the height they need.
 */
function Styled<T extends TextElement>({
  element,
  size = "base",
  tone = "default",
  weight = "normal",
  align = "start",
  className,
  ...props
}: ElementProps<T> & { element: T }) {
  /* Narrowed to one tag, because JSX checks props against every member of a
     union of elements at once and no set of props satisfies all seven. The
     exported wrappers above are the typed boundary; this never leaves the file. */
  const Tag = element as "p"

  return (
    <Tag
      data-slot="text"
      /* A pasted URL or a hashed filename is one unbreakable word, and left to
         itself it pushes its container wider than the page. Wrapping mid-word is
         the lesser ugliness, and it is a default nobody should have to ask for. */
      className={cn(
        "wrap-break-word",
        SIZES[size],
        TONES[tone],
        WEIGHTS[weight],
        ALIGNS[align],
        className,
      )}
      {...(props as ComponentProps<"p">)}
    />
  )
}

// `align` is a deprecated HTML attribute on several elements and `color` is a
// real one, which is why the colour prop here is `tone`.
type TextStyleProps = {
  size?: Size
  tone?: Tone
  weight?: Weight
  align?: Align
}

type TextProps = ElementProps<"p">
type HeadingProps = ElementProps<"h2">
type SpanProps = ElementProps<"span">
type LabelProps = ElementProps<"label">

// The element is not in here, so no caller can pass one.
type ElementProps<T extends TextElement> = Omit<ComponentProps<T>, "align" | "color"> &
  TextStyleProps

type TextElement = "p" | "h1" | "h2" | "h3" | "h4" | "span" | "label"
type Size = keyof typeof SIZES
type Tone = keyof typeof TONES
type Weight = keyof typeof WEIGHTS
type Align = keyof typeof ALIGNS

const SIZES = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
} as const

// Roles, never colours — Rule 7. `text-text-on-primary` reads oddly and is
// correct: the role is "text on primary" and the utility prefix is `text-`.
const TONES = {
  default: "text-text",
  quiet: "text-quiet",
  primary: "text-primary",
  danger: "text-danger",
  "on-primary": "text-text-on-primary",
  "on-danger": "text-text-on-danger",
} as const

const WEIGHTS = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
} as const

const ALIGNS = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
} as const

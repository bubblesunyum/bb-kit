import { Badge } from "@/components/badge"
import { Card, CardBody, CardFooter, CardMedia, CardTitle } from "@/components/card"
import { CardLink } from "@/components/card-link"
import { HStack, VStack } from "@/components/stack"
import { H3, Text } from "@/components/text"

/**
 * **These are examples, not components.** Copy the one you want into your own
 * project and edit it there.
 *
 * A post has a cover, a title, a date, tags and an excerpt — and that shape
 * belongs to your site, not to a UI kit. The kit ships the pieces; how a post
 * is arranged out of them is the part you will want to change, so it is given
 * as something to change rather than something to configure.
 *
 * There are two on purpose. One card-shaped and one row-shaped, out of the same
 * pieces, which is what proves the pieces recombine. An example earns promotion
 * to a real component when the same shape has held up across three separate
 * uses without changing — not before.
 */

/** A post as a standalone card: cover, title, date, excerpt, tags. */
export function PostCard({ post }: PostProps) {
  return (
    <Card>
      {post.cover ? (
        <CardMedia>
          {/* Decorative: the title beside it already says what this is, and a
              screen reader reading the same words twice is worse than silence. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- an example to copy should not assume Next. */}
          <img src={post.cover} alt="" className="aspect-[16/9]" />
        </CardMedia>
      ) : null}

      <CardTitle>
        {/* The link goes in the title, never the footer: the overlay covers the
            nearest positioned ancestor, and CardFooter is positioned. */}
        <H3 size="lg">
          <CardLink href={post.href}>{post.title}</CardLink>
        </H3>
        <PostDate date={post.date} />
      </CardTitle>

      <CardBody>
        <Text tone="quiet" size="sm">
          {post.excerpt}
        </Text>
      </CardBody>

      {post.tags.length > 0 ? (
        <CardFooter>
          <PostTags tags={post.tags} />
        </CardFooter>
      ) : null}
    </Card>
  )
}

/**
 * The same post as a row — a thumbnail beside the words.
 *
 * It renders the *contents* of a row rather than the row itself, so it goes
 * straight into a `List`'s `renderItem`, which supplies the `ListItem`.
 */
export function PostRow({ post }: PostProps) {
  return (
    <HStack gap={4} align="start">
      {post.cover ? (
        /* Fixed width and never allowed to shrink: a thumbnail that gives way
           to a long title collapses to a sliver rather than wrapping. */
        <div className="w-24 shrink-0 overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element -- an example to copy should not assume Next. */}
          <img src={post.cover} alt="" className="block aspect-square w-full object-cover" />
        </div>
      ) : null}

      <VStack gap={2} className="min-w-0 flex-1">
        <H3 size="base">
          <CardLink href={post.href}>{post.title}</CardLink>
        </H3>
        <PostDate date={post.date} />
        <Text tone="quiet" size="sm">
          {post.excerpt}
        </Text>
        {post.tags.length > 0 ? (
          /* relative for the same reason CardFooter is: the badges have to sit
             above the row's stretched link or it swallows their presses. */
          <HStack gap={2} className="relative flex-wrap">
            <PostTags tags={post.tags} />
          </HStack>
        ) : null}
      </VStack>
    </HStack>
  )
}

/**
 * A real `<time>`, so the machine-readable date is the one in the attribute and
 * the reader gets the pretty one.
 *
 * The locale and the time zone are both named rather than left to the machine.
 * A server and a browser in different zones format the same instant
 * differently, and React calls that a hydration mismatch. Your own site will
 * want its own locale here — that is one of the reasons this is an example.
 */
function PostDate({ date }: { date: string | undefined }) {
  if (!date) return null

  return (
    <Text tone="quiet" size="sm">
      <time dateTime={date}>{DATES.format(new Date(date))}</time>
    </Text>
  )
}

/**
 * The badges alone — each layout supplies the row around them, because the two
 * rows are not the same thing. `CardFooter` is the card's, and it is positioned
 * so the badges sit above the stretched link rather than under it.
 */
function PostTags({ tags }: { tags: readonly string[] }) {
  return tags.map((tag) => (
    <Badge key={tag} size="sm">
      {tag}
    </Badge>
  ))
}

/** Your site's shape, not the kit's. Copy it and change it. */
export type Post = {
  href: string
  title: string
  excerpt: string
  tags: readonly string[]
  /** ISO, so `<time dateTime>` gets something a machine can read. */
  date?: string
  cover?: string
}

type PostProps = { post: Post }

const DATES = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" })

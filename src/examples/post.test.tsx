import { render, screen, within } from "@testing-library/react"
import { axe } from "jest-axe"
import { describe, expect, test } from "vitest"

import { List } from "@/components/list"
import { awkwardPosts } from "@/test/awkward-content"

import { PostCard, PostRow, type Post } from "./post"

describe("PostCard", () => {
  test("the title is the link, and the whole card is clickable through it", () => {
    const { container } = render(<PostCard post={POST} />)

    const link = screen.getByRole("link", { name: POST.title })
    expect(link).toHaveAttribute("href", POST.href)
    // The link lives in the title, never the footer: the overlay covers the
    // nearest positioned ancestor, and CardFooter is one.
    expect(container.querySelector("[data-slot=card-title]")).toContainElement(link)
  })

  test("a tag for each one, above the link rather than under it", () => {
    const { container } = render(<PostCard post={POST} />)

    const footer = container.querySelector("[data-slot=card-footer]")
    expect(within(footer as HTMLElement).getAllByRole("button")).toHaveLength(POST.tags.length)
  })

  test("the date is a real time element carrying the machine-readable value", () => {
    const { container } = render(<PostCard post={POST} />)

    const time = container.querySelector("time")
    expect(time).toHaveAttribute("dateTime", POST.date)
    expect(time).toHaveTextContent("14 Mar 2026")
  })

  // An empty alt takes it out of the accessibility tree entirely, which is why
  // it is queried by tag: the title beside it already says what it is.
  test("the cover is decorative, so it is not announced twice", () => {
    const { container } = render(<PostCard post={POST} />)

    expect(container.querySelector("img")).toHaveAttribute("alt", "")
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  test("what is missing is not drawn, and nothing holds a space for it", () => {
    const { container } = render(<PostCard post={SPARSE} />)

    expect(container.querySelector("[data-slot=card-media]")).not.toBeInTheDocument()
    expect(container.querySelector("time")).not.toBeInTheDocument()
    expect(container.querySelector("[data-slot=card-footer]")).not.toBeInTheDocument()
  })

  test("it has no accessibility violations", async () => {
    const { container } = render(<PostCard post={POST} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe("PostRow", () => {
  test("it is the contents of a row, so List supplies the li", () => {
    const { container } = renderRow()

    expect(container.querySelectorAll("li")).toHaveLength(1)
    expect(within(container.querySelector("li") as HTMLElement).getByRole("link")).toBeInTheDocument()
  })

  test("the same five fields as the card", () => {
    const { container } = renderRow()

    expect(screen.getByRole("link", { name: POST.title })).toHaveAttribute("href", POST.href)
    expect(screen.getByText(POST.excerpt)).toBeInTheDocument()
    expect(screen.getAllByRole("button")).toHaveLength(POST.tags.length)
    expect(container.querySelector("img")).toHaveAttribute("src", POST.cover)
  })

  test("it has no accessibility violations inside its list", async () => {
    const { container } = renderRow()

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe("both shapes survive awkward content", () => {
  test("an empty title still leaves a link to press", () => {
    const [empty] = awkwardPosts()

    render(<PostCard post={empty} />)

    expect(screen.getByRole("link")).toBeInTheDocument()
  })

  test("a 24-tag row renders every tag rather than truncating", () => {
    const long = awkwardPosts()[1]

    render(<PostCard post={long} />)

    expect(screen.getAllByRole("button")).toHaveLength(long.tags.length)
  })
})

function renderRow(post: Post = POST) {
  return render(
    <List items={[post]} getKey={(one) => one.href} renderItem={(one) => <PostRow post={one} />} />,
  )
}

const POST: Post = {
  href: "/posts/tokens",
  title: "Designing tokens that survive a redesign",
  excerpt: "Roles, not colours.",
  tags: ["design", "css"],
  date: "2026-03-14",
  cover: "/story-cover.svg",
}

const SPARSE: Post = {
  href: "/posts/note",
  title: "A note",
  excerpt: "No cover, no date, no tags.",
  tags: [],
}

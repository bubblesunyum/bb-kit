import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"

import { Card, CardBody, CardFooter, CardTitle } from "./card"
import { CardLink } from "./card-link"
import { H3 } from "./text"

describe("what a CardLink is", () => {
  test("it is a real anchor", () => {
    render(<CardLink href="/post">A post</CardLink>)

    expect(screen.getByRole("link", { name: "A post" })).toHaveAttribute("href", "/post")
  })

  test("it covers the card with a pseudo-element rather than wrapping it", () => {
    render(<CardLink href="/post">A post</CardLink>)

    expect(screen.getByRole("link")).toHaveClass("after:absolute", "after:inset-0")
  })

  test("the focus ring goes on the overlay, so tabbing outlines the card", () => {
    render(<CardLink href="/post">A post</CardLink>)

    const className = screen.getByRole("link").className
    expect(className).toContain("focus-visible:after:outline-2")
    expect(className).not.toMatch(/(^|\s)focus:/)
  })

  test("asChild lets a framework's own link be the link", () => {
    render(
      <CardLink asChild>
        <a href="/post" data-testid="framework-link">
          A post
        </a>
      </CardLink>,
    )

    expect(screen.getByTestId("framework-link")).toHaveClass("after:absolute")
  })
})

// The whole reason CardLink exists rather than <Card asChild><a>.
describe("a card that has other clickable things in it", () => {
  function PostCard({ onTagClick }: { onTagClick: () => void }) {
    return (
      <Card>
        <CardTitle>
          <H3>
            <CardLink href="/post">A post about lists</CardLink>
          </H3>
        </CardTitle>
        <CardBody>Some words.</CardBody>
        <CardFooter>
          <button onClick={onTagClick}>typescript</button>
        </CardFooter>
      </Card>
    )
  }

  test("there is one link in the accessibility tree, not one per element", () => {
    render(<PostCard onTagClick={() => {}} />)

    expect(screen.getAllByRole("link")).toHaveLength(1)
  })

  test("the tag button is a sibling of the link, not nested inside it", () => {
    render(<PostCard onTagClick={() => {}} />)

    const link = screen.getByRole("link")
    expect(link).not.toContainElement(screen.getByRole("button"))
  })

  test("the tag button is still clickable", async () => {
    const onTagClick = vi.fn()
    render(<PostCard onTagClick={onTagClick} />)

    await userEvent.click(screen.getByRole("button", { name: "typescript" }))

    expect(onTagClick).toHaveBeenCalledOnce()
  })

  // The footer lifts itself above the overlay, so the caller does not have to
  // know the overlay is there.
  test("the footer is positioned above the link's overlay", () => {
    render(<PostCard onTagClick={() => {}} />)

    expect(screen.getByRole("button").parentElement).toHaveClass("relative")
  })
})

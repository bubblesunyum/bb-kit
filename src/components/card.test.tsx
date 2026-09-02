import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { Card, CardBody, CardFooter, CardMedia, CardTitle } from "./card"

describe("what a Card is", () => {
  test("it is a raised Surface by default", () => {
    render(<Card data-testid="card">content</Card>)

    const card = screen.getByTestId("card")
    expect(card).toHaveClass("bg-card", "rounded-lg", "shadow-xs")
  })

  test("it still takes Surface's other forms", () => {
    render(
      <Card variant="outline" data-testid="card">
        content
      </Card>,
    )

    const card = screen.getByTestId("card")
    expect(card).toHaveClass("border", "border-border")
    expect(card).not.toHaveClass("shadow-xs")
  })

  // Put relative on CardLink instead and the stretched overlay covers only the
  // link's own box, which is the bug the technique exists to avoid.
  test("the card is what is positioned, so a link inside can cover it", () => {
    render(<Card data-testid="card">content</Card>)

    expect(screen.getByTestId("card")).toHaveClass("relative")
  })

  test("it carries a data-slot of its own and passes the rest through", () => {
    render(
      <Card id="post" data-testid="card">
        content
      </Card>,
    )

    const card = screen.getByTestId("card")
    expect(card).toHaveAttribute("data-slot", "card")
    expect(card).toHaveAttribute("id", "post")
  })

  test("asChild makes the card the element it stands in for", () => {
    render(
      <Card asChild>
        <article>content</article>
      </Card>,
    )

    expect(screen.getByRole("article")).toHaveClass("bg-card", "relative")
  })
})

describe("the parts", () => {
  // A hardcoded level would be wrong about half the time.
  test("CardTitle renders no heading of its own", () => {
    render(
      <CardTitle>
        <h3>A post</h3>
      </CardTitle>,
    )

    expect(screen.getAllByRole("heading")).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument()
  })

  test("each part carries its own data-slot", () => {
    render(
      <Card>
        <CardMedia data-testid="media" />
        <CardTitle data-testid="title" />
        <CardBody data-testid="body" />
        <CardFooter data-testid="footer" />
      </Card>,
    )

    expect(screen.getByTestId("media")).toHaveAttribute("data-slot", "card-media")
    expect(screen.getByTestId("title")).toHaveAttribute("data-slot", "card-title")
    expect(screen.getByTestId("body")).toHaveAttribute("data-slot", "card-body")
    expect(screen.getByTestId("footer")).toHaveAttribute("data-slot", "card-footer")
  })

  // Surface owns the card's padding, so the media is what has to reach back out.
  test("CardMedia cancels the card's padding to reach the edges", () => {
    render(<CardMedia data-testid="media" />)

    const media = screen.getByTestId("media")
    expect(media).toHaveClass("-mx-4", "first:-mt-4", "last:-mb-4", "overflow-hidden")
  })

  test("the body takes the leftover height, so a footer sits at the bottom", () => {
    render(<CardBody data-testid="body" />)

    expect(screen.getByTestId("body")).toHaveClass("flex-1")
  })
})

describe("overriding it from outside", () => {
  test("className wins over what the card sets", () => {
    render(
      <Card className="gap-0 p-0" data-testid="card">
        content
      </Card>,
    )

    const card = screen.getByTestId("card")
    expect(card).toHaveClass("gap-0", "p-0")
    expect(card).not.toHaveClass("gap-3")
    expect(card).not.toHaveClass("p-4")
  })
})

describe("the media's bleed against the card's padding", () => {
  // Surface invites a padding override and CardMedia knows the default number
  // rather than reading it, so the two have to move together. This test is
  // where that shows up if either side changes.
  test("the cancel margin is the exact negative of Surface's padding", () => {
    render(
      <Card data-testid="card">
        <CardMedia data-testid="media" />
      </Card>,
    )

    expect(screen.getByTestId("card")).toHaveClass("p-4")
    expect(screen.getByTestId("media")).toHaveClass("-mx-4")
  })
})

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "jest-axe"
import type { FormEvent } from "react"
import { describe, expect, test, vi } from "vitest"

import { AWKWARD } from "@/test/awkward-content"
import { SearchField } from "./search-field"

describe("what a SearchField is", () => {
  test("it is a real search input", () => {
    render(<SearchField value="" />)

    expect(screen.getByRole("searchbox")).toHaveAttribute("type", "search")
  })

  // No visible label, so without this it reaches a screen reader unnamed.
  test("the placeholder names it, and it says Search without being asked", () => {
    render(<SearchField value="" />)

    const field = screen.getByRole("searchbox", { name: "Search" })
    expect(field).toHaveAttribute("placeholder", "Search")
  })

  test("a caller's own aria-label wins over the placeholder", () => {
    render(<SearchField value="" placeholder="Filter posts" aria-label="Search the archive" />)

    expect(screen.getByRole("searchbox", { name: "Search the archive" })).toBeInTheDocument()
  })

  test("it is medium without being asked", () => {
    render(<SearchField value="" />)

    expect(screen.getByRole("searchbox")).toHaveClass("h-10")
  })

  test("every part carries a data-slot", () => {
    const { container } = render(<SearchField value="hi" />)

    for (const slot of ["search-field", "search-field-icon", "search-field-input", "search-field-clear"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).toBeInTheDocument()
    }
  })
})

describe("the caller owns the text", () => {
  test("typing asks for the new value", async () => {
    const onValueChange = vi.fn()
    render(<SearchField value="" onValueChange={onValueChange} />)

    await userEvent.type(screen.getByRole("searchbox"), "d")

    expect(onValueChange).toHaveBeenCalledWith("d")
  })

  test("it shows what it is given and nothing else", () => {
    render(<SearchField value="design" />)

    expect(screen.getByRole("searchbox")).toHaveValue("design")
  })

  test("a caller's own onChange still runs", async () => {
    const onChange = vi.fn()
    const onValueChange = vi.fn()
    render(<SearchField value="" onChange={onChange} onValueChange={onValueChange} />)

    await userEvent.type(screen.getByRole("searchbox"), "d")

    expect(onChange).toHaveBeenCalled()
    expect(onValueChange).toHaveBeenCalled()
  })

  test("typing with no handler does not crash", async () => {
    render(<SearchField value="" />)

    await userEvent.type(screen.getByRole("searchbox"), "d")

    expect(screen.getByRole("searchbox")).toHaveValue("")
  })
})

describe("clearing it", () => {
  test("there is nothing to clear when it is empty", () => {
    render(<SearchField value="" />)

    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument()
  })

  test("the button appears once there is something in it", () => {
    render(<SearchField value="design" />)

    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument()
  })

  test("pressing it asks for an empty value", async () => {
    const onValueChange = vi.fn()
    render(<SearchField value="design" onValueChange={onValueChange} />)

    await userEvent.click(screen.getByRole("button", { name: "Clear search" }))

    expect(onValueChange).toHaveBeenCalledWith("")
  })

  // Otherwise pressing it drops a keyboard reader back to the top of the page,
  // because clearing is what unmounts the button they were standing on.
  test("focus lands back on the field, not on nothing", async () => {
    render(<SearchField value="design" />)

    await userEvent.click(screen.getByRole("button", { name: "Clear search" }))

    expect(screen.getByRole("searchbox")).toHaveFocus()
  })

  // It sits inside whatever form the field lands in; type="button" is the only
  // thing stopping it from submitting one.
  test("it is not a submit button", () => {
    render(<SearchField value="design" />)

    expect(screen.getByRole("button", { name: "Clear search" })).toHaveAttribute("type", "button")
  })

  test("a disabled field offers no clear button", () => {
    render(<SearchField value="design" disabled />)

    expect(screen.getByRole("searchbox")).toBeDisabled()
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument()
  })

  // Two clear buttons on one field is what happens if WebKit's own is left on.
  test("the browser's own clear button is suppressed", () => {
    render(<SearchField value="design" />)

    expect(screen.getByRole("searchbox").className).toContain(
      "[&::-webkit-search-cancel-button]:appearance-none",
    )
  })
})

describe("inside a real form", () => {
  // type="button" is the only thing standing between the clear button and a
  // submit on every clear. Asserting the attribute says the code is right;
  // this says the browser agrees.
  test("clearing does not submit the form around it", async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <SearchField value="design" />
        <button type="submit">Search</button>
      </form>,
    )

    await userEvent.click(screen.getByRole("button", { name: "Clear search" }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  test("the form's own submit button still submits", async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <SearchField value="design" />
        <button type="submit">Search</button>
      </form>,
    )

    await userEvent.click(screen.getByRole("button", { name: "Search" }))

    expect(onSubmit).toHaveBeenCalled()
  })

  // A search field is the one input a reader expects Enter to work in.
  test("Enter in the field submits", async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <SearchField value="design" />
        <button type="submit">Search</button>
      </form>,
    )

    await userEvent.type(screen.getByRole("searchbox"), "{Enter}")

    expect(onSubmit).toHaveBeenCalled()
  })
})

describe("the three sizes", () => {
  test("they are 32, 40 and 48px tall", () => {
    render(
      <>
        <SearchField value="" size="sm" placeholder="sm" />
        <SearchField value="" size="md" placeholder="md" />
        <SearchField value="" size="lg" placeholder="lg" />
      </>,
    )

    expect(screen.getByRole("searchbox", { name: "sm" })).toHaveClass("h-8")
    expect(screen.getByRole("searchbox", { name: "md" })).toHaveClass("h-10")
    expect(screen.getByRole("searchbox", { name: "lg" })).toHaveClass("h-12")
  })

  // The clear button is the square at the end of the field, so its width has to
  // match the padding that makes room for it or it covers the text.
  test("the clear button is as wide as the field is tall", () => {
    render(<SearchField value="design" size="lg" />)

    expect(screen.getByRole("searchbox")).toHaveClass("pe-12")
    expect(screen.getByRole("button", { name: "Clear search" })).toHaveClass("w-12")
  })

  test("a wrong guess at a size says so rather than silently doing nothing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    // @ts-expect-error the point of the test is the value the types forbid.
    render(<SearchField value="" size="xl" />)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("unknown SearchField's size \"xl\""))
    warn.mockRestore()
  })
})

describe("it answers a pointer", () => {
  // Without a hover fill, rest and hover are indistinguishable — the one thing
  // the states story is there to catch.
  test("hovering fills it the way Badge and GhostButton fill", () => {
    render(<SearchField value="" />)

    expect(screen.getByRole("searchbox")).toHaveClass("hover:bg-muted")
  })

  test("a disabled field takes no pointer events, so it cannot hover", () => {
    render(<SearchField value="" disabled />)

    expect(screen.getByRole("searchbox")).toHaveClass("disabled:pointer-events-none")
  })
})

describe("focus and overriding", () => {
  // :focus would put a ring on every mouse click.
  test("the ring is on focus-visible and never on focus", () => {
    render(<SearchField value="design" />)

    for (const element of [
      screen.getByRole("searchbox"),
      screen.getByRole("button", { name: "Clear search" }),
    ]) {
      expect(element.className).toContain("focus-visible:outline-focus-ring")
      expect(element.className).not.toMatch(/(^|\s)focus:/)
    }
  })

  test("className sizes the field's box", () => {
    const { container } = render(<SearchField value="" className="max-w-sm" />)

    expect(container.querySelector('[data-slot="search-field"]')).toHaveClass("max-w-sm")
  })

  test("everything else reaches the input", () => {
    render(<SearchField value="" id="filter" name="q" />)

    const field = screen.getByRole("searchbox")
    expect(field).toHaveAttribute("id", "filter")
    expect(field).toHaveAttribute("name", "q")
  })
})

describe("awkward content", () => {
  test("a long value stays in the field rather than growing it", () => {
    render(<SearchField value={AWKWARD.unbreakableWord} className="max-w-sm" />)

    const field = screen.getByRole("searchbox")
    expect(field).toHaveValue(AWKWARD.unbreakableWord)
    expect(field).toHaveClass("w-full", "h-10")
  })
})

test("it passes the accessibility checker, filled and empty", async () => {
  const { container } = render(
    <main>
      <SearchField value="design" />
      <SearchField value="" placeholder="Filter posts" />
      <SearchField value="design" disabled />
    </main>,
  )

  expect(await axe(container)).toHaveNoViolations()
})

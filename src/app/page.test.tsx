import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import Home from "./page"

describe("the home page", () => {
  test("it points at the pages that show the kit", () => {
    render(<Home />)

    expect(screen.getByRole("link", { name: "Kitchen sink" })).toHaveAttribute("href", "/kitchen-sink")
    expect(screen.getByRole("link", { name: "Tokens" })).toHaveAttribute("href", "/tokens")
  })
})

import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import { expect, test } from "vitest"

// Proves the three moving parts of the test setup at once — the JSX transform,
// jsdom with Testing Library, and the axe matcher — none of which any other test
// exercises until components exist.
test("the test environment renders JSX and runs the accessibility checker", async () => {
  const { container } = render(<button type="button">Press</button>)

  expect(screen.getByRole("button", { name: "Press" })).toBeInTheDocument()
  expect(await axe(container)).toHaveNoViolations()
})

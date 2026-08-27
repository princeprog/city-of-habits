import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { BuildingIllustration } from "@/components/city/building-illustration"

describe("BuildingIllustration", () => {
  it("provides a text alternative for a building", () => {
    render(<BuildingIllustration type="library" stage={2} color="sky" label="Read for 20 minutes" />)
    expect(screen.getByRole("img", { name: "Read for 20 minutes" })).toBeInTheDocument()
  })
})

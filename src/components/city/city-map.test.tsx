import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CityMap } from "@/components/city/city-map"

describe("CityMap", () => {
  it("represents the permanent center fountain in the accessible fallback", () => {
    const { container } = render(<CityMap habits={[]} checkIns={[]} />)

    expect(screen.getByRole("img", { name: /^Your living city/ })).toBeInTheDocument()
    expect(container.querySelector('[data-city-centerpiece="fountain"]')).toBeInTheDocument()
    expect(container.querySelector("desc")).toHaveTextContent(/central fountain/i)
  })
})

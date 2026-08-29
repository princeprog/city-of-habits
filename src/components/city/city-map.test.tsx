import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CityMap } from "@/components/city/city-map"
import { sampleHabits } from "@/lib/city/catalog"
import type { Habit } from "@/types/city"

describe("CityMap", () => {
  it("represents the permanent center fountain in the accessible fallback", () => {
    const { container } = render(<CityMap habits={[]} checkIns={[]} />)

    expect(screen.getByRole("img", { name: /^Your living city/ })).toBeInTheDocument()
    expect(container.querySelector('[data-city-centerpiece="fountain"]')).toBeInTheDocument()
    expect(container.querySelector("desc")).toHaveTextContent(/central fountain/i)
  })

  it("describes Arrange mode and lets keyboard users select a building", async () => {
    const user = userEvent.setup()
    const onSelectHabit = vi.fn()
    const habit: Habit = {
      ...sampleHabits[0],
      relatedHabitIds: [...sampleHabits[0].relatedHabitIds],
    }

    const { container } = render(
      <CityMap
        habits={[habit]}
        checkIns={[]}
        arranging
        selectedHabitId={habit.id}
        onSelectHabit={onSelectHabit}
      />,
    )

    expect(container.querySelector("desc")).toHaveTextContent(/arrange mode is active/i)
    const building = screen.getByRole("button", { name: new RegExp(habit.name) })
    expect(building).toHaveAttribute("aria-pressed", "true")
    await user.tab()
    await user.keyboard("{Enter}")
    expect(onSelectHabit).toHaveBeenCalledWith(habit)
  })

  it("keeps edge buildings fully inside the accessible land", () => {
    const edgeHabit: Habit = {
      ...sampleHabits[0],
      position: { x: 100, y: 100 },
      relatedHabitIds: [],
    }

    render(<CityMap habits={[edgeHabit]} checkIns={[]} onSelectHabit={() => undefined} />)

    expect(screen.getByRole("button", { name: new RegExp(edgeHabit.name) })).toHaveAttribute(
      "transform",
      "translate(80.36 77.36)",
    )
    expect(edgeHabit.position).toEqual({ x: 100, y: 100 })
  })
})

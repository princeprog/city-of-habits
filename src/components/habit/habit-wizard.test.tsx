import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { HabitWizard } from "@/components/habit/habit-wizard"
import type { Habit } from "@/types/city"

const createdHabit = {
  id: "habit-reading",
  name: "Read before bed",
  district: "mind",
  buildingType: "library",
  targetPerWeek: 4,
  colorToken: "sky",
  intention: "Make space for ideas.",
  status: "active",
  position: { x: 50, y: 50 },
  relatedHabitIds: [],
  createdAt: "2026-08-29T00:00:00.000Z",
  updatedAt: "2026-08-29T00:00:00.000Z",
} satisfies Habit

describe("HabitWizard", () => {
  it("blocks the next step until the habit name is valid", async () => {
    const user = userEvent.setup()

    render(
      <HabitWizard
        onCreate={vi.fn()}
        onCreated={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Next" }))

    expect(screen.getByText("Give the habit a name.")).toBeInTheDocument()
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument()
  })

  it("preserves values while moving between steps and saves once at the end", async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(createdHabit)
    const onCreated = vi.fn()

    render(
      <HabitWizard
        onCreate={onCreate}
        onCreated={onCreated}
        onCancel={vi.fn()}
      />,
    )

    const name = screen.getByLabelText("What do you want to repeat?")
    await user.type(name, "Read before bed")
    await user.click(screen.getByRole("button", { name: "Next" }))

    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Back" }))
    expect(screen.getByLabelText("What do you want to repeat?")).toHaveValue("Read before bed")

    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Place the foundation" }))

    expect(onCreate).toHaveBeenCalledTimes(1)
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ name: "Read before bed" }))
    expect(onCreated).toHaveBeenCalledWith(createdHabit)
  })
})

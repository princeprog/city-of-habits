import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CityArrangementToolbar } from "@/components/city/city-arrangement-toolbar"
import type { Habit } from "@/types/city"

const habits = [
  {
    id: "habit-read",
    name: "Read",
    district: "mind",
    buildingType: "library",
    targetPerWeek: 4,
    colorToken: "sky",
    status: "active",
    position: { x: 45, y: 45 },
    relatedHabitIds: [],
    createdAt: "2026-08-29T00:00:00.000Z",
    updatedAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "habit-walk",
    name: "Walk",
    district: "body",
    buildingType: "park",
    targetPerWeek: 5,
    colorToken: "moss",
    status: "active",
    position: { x: 65, y: 65 },
    relatedHabitIds: [],
    createdAt: "2026-08-29T00:00:00.000Z",
    updatedAt: "2026-08-29T00:00:00.000Z",
  },
] satisfies Habit[]

describe("CityArrangementToolbar", () => {
  it("offers selection, auto-arrange, keyboard nudges, cancel, and save", async () => {
    const user = userEvent.setup()
    const onNudge = vi.fn()
    const onAutoArrange = vi.fn()
    const onCancel = vi.fn()
    const onSave = vi.fn()

    render(
      <CityArrangementToolbar
        habits={habits}
        selectedHabitId="habit-read"
        dirty
        saving={false}
        onSelectHabit={vi.fn()}
        onNudge={onNudge}
        onAutoArrange={onAutoArrange}
        onCancel={onCancel}
        onSave={onSave}
      />,
    )

    expect(screen.getByText("Arrange mode")).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Building to arrange" })).toHaveTextContent("Read")

    await user.click(screen.getByRole("button", { name: "Move building north" }))
    await user.click(screen.getByRole("button", { name: "Auto-arrange city" }))
    await user.click(screen.getByRole("button", { name: "Cancel arrangement" }))
    await user.click(screen.getByRole("button", { name: "Save arrangement" }))

    expect(onNudge).toHaveBeenCalledWith("north")
    expect(onAutoArrange).toHaveBeenCalledOnce()
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onSave).toHaveBeenCalledOnce()
  })

  it("disables saving until the arrangement changes", () => {
    render(
      <CityArrangementToolbar
        habits={habits}
        selectedHabitId="habit-read"
        dirty={false}
        saving={false}
        onSelectHabit={vi.fn()}
        onNudge={vi.fn()}
        onAutoArrange={vi.fn()}
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />,
    )

    expect(screen.getByRole("button", { name: "Save arrangement" })).toBeDisabled()
  })
})

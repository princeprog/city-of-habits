import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  HabitCreationDialog,
  HabitCreationProvider,
  useHabitCreation,
} from "@/components/habit/habit-creation-dialog"
import type { Habit } from "@/types/city"

const createdHabit = {
  id: "habit-writing",
  name: "Write three lines",
  district: "creative",
  buildingType: "workshop",
  targetPerWeek: 3,
  colorToken: "coral",
  status: "active",
  position: { x: 50, y: 50 },
  relatedHabitIds: [],
  createdAt: "2026-08-29T00:00:00.000Z",
  updatedAt: "2026-08-29T00:00:00.000Z",
} satisfies Habit

function OpenHabitButton() {
  const { openCreateHabit } = useHabitCreation()
  return <button type="button" onClick={openCreateHabit}>Open habit creation</button>
}

describe("HabitCreationDialog", () => {
  it("opens from shared city state and closes after a clean cancel", async () => {
    const user = userEvent.setup()

    render(
      <HabitCreationProvider>
        <OpenHabitButton />
        <HabitCreationDialog
          onCreate={vi.fn().mockResolvedValue(createdHabit)}
        />
      </HabitCreationProvider>,
    )

    await user.click(screen.getByRole("button", { name: "Open habit creation" }))
    expect(screen.getByRole("dialog", { name: "Build a habit" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.queryByRole("dialog", { name: "Build a habit" })).not.toBeInTheDocument()
  })

  it("confirms before discarding a dirty draft", async () => {
    const user = userEvent.setup()

    render(
      <HabitCreationProvider>
        <OpenHabitButton />
        <HabitCreationDialog
          onCreate={vi.fn().mockResolvedValue(createdHabit)}
        />
      </HabitCreationProvider>,
    )

    await user.click(screen.getByRole("button", { name: "Open habit creation" }))
    await user.type(screen.getByLabelText("What do you want to repeat?"), "Journal")
    await user.click(screen.getByRole("button", { name: "Close" }))

    expect(screen.getByRole("alertdialog", { name: "Discard this foundation?" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Keep editing" }))
    expect(screen.getByRole("dialog", { name: "Build a habit" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Close" }))
    await user.click(screen.getByRole("button", { name: "Discard draft" }))
    expect(screen.queryByRole("dialog", { name: "Build a habit" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Open habit creation" }))
    expect(screen.getByLabelText("What do you want to repeat?")).toHaveValue("")
  })
})

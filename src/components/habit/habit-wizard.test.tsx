import { render, screen, waitFor } from "@testing-library/react"
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
  it("starts on the first step with the documented defaults", () => {
    render(
      <HabitWizard
        onCreate={vi.fn()}
        onCreated={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument()
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-label",
      "Step 1 of 3",
    )
    expect(screen.getByLabelText("What do you want to repeat?")).toHaveValue("")
    expect(screen.getByLabelText("Optional intention")).toHaveValue("")
  })

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
    expect(screen.getByLabelText("What do you want to repeat?")).toHaveFocus()
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument()
  })

  it("updates the placement preview and final review from the selected values", async () => {
    const user = userEvent.setup()

    render(
      <HabitWizard
        onCreate={vi.fn()}
        onCreated={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText("What do you want to repeat?"), "Morning walk")
    await user.click(screen.getByRole("button", { name: "Next" }))

    await user.click(screen.getByRole("combobox", { name: "Where does it belong?" }))
    await user.click(screen.getByRole("option", { name: "Body" }))
    await user.click(screen.getByRole("button", { name: "Tower" }))
    await user.click(screen.getByRole("combobox", { name: "Choose a city color" }))
    await user.click(screen.getByRole("option", { name: "Coral" }))

    expect(screen.getByText("Body district")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Tower" })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
    await user.click(screen.getByRole("button", { name: "Next" }))

    const target = screen.getByDisplayValue("4")
    target.focus()
    await user.keyboard("{End}")
    expect(screen.getByText("7 times")).toBeInTheDocument()
    expect(screen.getByText("Morning walk")).toBeInTheDocument()
    expect(screen.getByText("Body · Tower")).toBeInTheDocument()
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

  it("keeps the final step recoverable when saving fails", async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockRejectedValue(new Error("storage unavailable"))

    render(
      <HabitWizard
        onCreate={onCreate}
        onCreated={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText("What do you want to repeat?"), "Journal")
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Place the foundation" }))

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Place the foundation" })).toBeEnabled(),
    )
    expect(onCreate).toHaveBeenCalledTimes(1)
  })
})

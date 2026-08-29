import { describe, expect, it } from "vitest"

import { projectHabitScenery } from "@/lib/city/city-scenery"

describe("projectHabitScenery", () => {
  it.each([
    [0, 2],
    [1, 4],
    [2, 6],
    [3, 8],
  ])("adds permanent plot details through stage %i", (stage, count) => {
    expect(projectHabitScenery({
      habitId: "read",
      district: "mind",
      position: { x: -8, z: -8 },
      stage,
    })).toHaveLength(count)
  })

  it("keeps scenery deterministic and subordinate to the habit plot", () => {
    const input = {
      habitId: "walk",
      district: "body" as const,
      position: { x: 8, z: 8 },
      stage: 3,
    }
    const first = projectHabitScenery(input)

    expect(first).toEqual(projectHabitScenery(input))
    expect(first.every(({ position }) => Math.hypot(position.x - 8, position.z - 8) <= 2.2)).toBe(true)
    expect(first.filter(({ kind }) => kind === "ground")).toHaveLength(1)
  })

  it("uses district-specific baseline accents without creating buildings", () => {
    const districts = ["body", "mind", "creative", "connection", "work", "recovery"] as const
    const accents = districts.map((district) =>
      projectHabitScenery({
        habitId: district,
        district,
        position: { x: 8, z: 8 },
        stage: 0,
      })[1].kind,
    )

    expect(accents).toEqual(["tree", "bench", "flowers", "bench", "light", "rocks"])
    expect(accents).not.toContain("building")
  })
})

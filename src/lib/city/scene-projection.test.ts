import { describe, expect, it } from "vitest"

import { projectCityScene } from "@/lib/city/scene-projection"
import type { CheckIn, Habit } from "@/types/city"

const habit = (overrides: Partial<Habit> = {}): Habit => ({
  id: "habit-1",
  name: "Read",
  district: "mind",
  buildingType: "library",
  targetPerWeek: 4,
  colorToken: "sky",
  intention: "Make room for ideas.",
  status: "active",
  position: { x: 50, y: 50 },
  relatedHabitIds: [],
  createdAt: "2026-08-01T08:00:00.000Z",
  updatedAt: "2026-08-01T08:00:00.000Z",
  ...overrides,
})

describe("projectCityScene", () => {
  it("maps stored positions into a centered bounded 3D world", () => {
    const scene = projectCityScene([
      habit({ id: "west", position: { x: 0, y: 0 } }),
      habit({ id: "east", position: { x: 100, y: 100 } }),
    ], [])

    expect(scene.buildings.map(({ position }) => position)).toEqual([
      { x: -22, z: -22 },
      { x: 22, z: 22 },
    ])
  })

  it("resolves duplicate plots deterministically without changing stored positions", () => {
    const habits = [
      habit({ id: "first" }),
      habit({ id: "second" }),
      habit({ id: "third" }),
    ]

    const firstProjection = projectCityScene(habits, [])
    const secondProjection = projectCityScene(habits, [])

    expect(firstProjection.buildings.map(({ position }) => position)).toEqual([
      { x: 0, z: 0 },
      { x: 4, z: 0 },
      { x: -4, z: 0 },
    ])
    expect(firstProjection.buildings).toEqual(secondProjection.buildings)
    expect(habits.every(({ position }) => position.x === 50 && position.y === 50)).toBe(true)
  })

  it("keeps every building while dimming query and district mismatches", () => {
    const scene = projectCityScene([
      habit({ id: "read", name: "Read before bed", district: "mind" }),
      habit({ id: "walk", name: "Morning walk", district: "body", position: { x: 70, y: 70 } }),
    ], [], { query: "read", district: "mind" })

    expect(scene.buildings).toHaveLength(2)
    expect(scene.buildings.find(({ habitId }) => habitId === "read")?.visibility).toBe("visible")
    expect(scene.buildings.find(({ habitId }) => habitId === "walk")?.visibility).toBe("dimmed")
  })

  it("projects relationships into connectors between the resolved plots", () => {
    const scene = projectCityScene([
      habit({ id: "first", position: { x: 20, y: 20 }, relatedHabitIds: ["second"] }),
      habit({ id: "second", position: { x: 80, y: 80 } }),
    ], [] as CheckIn[])

    expect(scene.connectors).toEqual([
      {
        id: "path-first:second",
        fromHabitId: "first",
        toHabitId: "second",
        from: { x: -13.2, z: -13.2 },
        to: { x: 13.2, z: 13.2 },
      },
    ])
  })
})

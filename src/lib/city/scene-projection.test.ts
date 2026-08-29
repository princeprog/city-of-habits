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
      { x: 4, z: 4 },
      { x: -4, z: -4 },
      { x: 4, z: -4 },
    ])
    expect(firstProjection.buildings).toEqual(secondProjection.buildings)
    expect(habits.every(({ position }) => position.x === 50 && position.y === 50)).toBe(true)
  })

  it("keeps projected buildings outside the reserved city center", () => {
    const centeredHabit = habit({ position: { x: 50, y: 50 } })

    const scene = projectCityScene([centeredHabit], [])
    const projectedPosition = scene.buildings[0].position

    expect(Math.hypot(projectedPosition.x, projectedPosition.z)).toBeGreaterThanOrEqual(5)
    expect(centeredHabit.position).toEqual({ x: 50, y: 50 })
  })

  it("keeps projected buildings clear of the compact street grid", () => {
    const roadAlignedHabit = habit({ position: { x: 50, y: 66 } })

    const scene = projectCityScene([roadAlignedHabit], [])
    const projectedPosition = scene.buildings[0].position
    const roadOffsets = [-11, 0, 11]
    const clearsRoads =
      roadOffsets.every((offset) => Math.abs(projectedPosition.x - offset) > 1.8) &&
      roadOffsets.every((offset) => Math.abs(projectedPosition.z - offset) > 1.8)

    expect(clearsRoads).toBe(true)
    expect(roadAlignedHabit.position).toEqual({ x: 50, y: 66 })
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

  it("previews draft position overrides without mutating stored habits", () => {
    const storedHabit = habit({ id: "movable", position: { x: 25, y: 25 } })
    const overrides = new Map([["movable", { x: 68.18, y: 68.18 }]])

    const scene = projectCityScene([storedHabit], [], { positionOverrides: overrides })

    expect(scene.buildings[0].position).toEqual({ x: 8, z: 8 })
    expect(storedHabit.position).toEqual({ x: 25, y: 25 })
  })

  it("publishes density and a camera home frame from every rendered building", () => {
    const scene = projectCityScene([
      habit({ id: "one", position: { x: 34, y: 34 } }),
      habit({ id: "two", position: { x: 66, y: 66 } }),
      habit({ id: "three", position: { x: 66, y: 34 } }),
    ], [])

    expect(scene.density).toBe("neighborhood")
    expect(scene.homeFrame.target).toEqual({ x: 0, z: 0 })
    expect(scene.homeFrame.zoom).toBeGreaterThan(18)
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

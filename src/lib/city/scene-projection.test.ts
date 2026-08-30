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
  it("routes every selected building type to its matching 3D presentation", () => {
    const scene = projectCityScene([
      habit({ id: "park", buildingType: "park", position: { x: 20, y: 20 } }),
      habit({ id: "library", buildingType: "library", position: { x: 35, y: 35 } }),
      habit({ id: "workshop", buildingType: "workshop", position: { x: 50, y: 20 } }),
      habit({ id: "bridge", buildingType: "bridge", position: { x: 65, y: 35 } }),
      habit({ id: "tower", buildingType: "tower", position: { x: 80, y: 20 } }),
      habit({ id: "lighthouse", buildingType: "lighthouse", position: { x: 80, y: 80 } }),
    ], [])

    expect(scene.buildings.map((building) => ({
      type: building.buildingType,
      presentation: (building as typeof building & { presentation?: string }).presentation,
    }))).toEqual([
      { type: "park", presentation: "park-landscape" },
      { type: "library", presentation: "civic-library" },
      { type: "workshop", presentation: "industrial-workshop" },
      { type: "bridge", presentation: "road-bridge" },
      { type: "tower", presentation: "city-tower" },
      { type: "lighthouse", presentation: "coastal-lighthouse" },
    ])
  })

  it("tracks milestone count and uses the 7, 30, and 100 check-in thresholds", () => {
    const checkInsFor = (count: number): CheckIn[] => Array.from({ length: count }, (_, index) => ({
      id: `check-in-${index}`,
      habitId: "milestones",
      localDate: `2026-08-${String((index % 28) + 1).padStart(2, "0")}`,
      completedAt: "2026-08-30T08:00:00.000Z",
    }))

    const scenes = [7, 30, 100].map((count) => projectCityScene(
      [habit({ id: "milestones", position: { x: 50, y: 50 } })],
      checkInsFor(count),
    ))

    expect(scenes.map((scene) => ({
      landmarkStage: scene.landmarks[0]?.stage,
      milestoneCount: (scene.buildings[0] as typeof scene.buildings[number] & { milestoneCount?: number }).milestoneCount,
    }))).toEqual([
      { landmarkStage: 0, milestoneCount: 1 },
      { landmarkStage: 1, milestoneCount: 2 },
      { landmarkStage: 2, milestoneCount: 3 },
    ])
  })

  it("keeps earned geometry when a habit is paused or archived", () => {
    const checkIns: CheckIn[] = Array.from({ length: 12 }, (_, index) => ({
      id: `earned-${index}`,
      habitId: index === 0 ? "paused" : "archived",
      localDate: `2026-07-${String(index + 1).padStart(2, "0")}`,
      completedAt: "2026-08-30T08:00:00.000Z",
    }))
    const scene = projectCityScene([
      habit({ id: "paused", buildingType: "park", status: "paused", position: { x: 25, y: 25 } }),
      habit({ id: "archived", buildingType: "bridge", status: "archived", position: { x: 60, y: 60 } }),
    ], checkIns)

    expect(scene.buildings.map(({ status, stage, presentation }) => ({ status, stage, presentation }))).toEqual([
      { status: "paused", stage: 1, presentation: "park-landscape" },
      { status: "archived", stage: 2, presentation: "road-bridge" },
    ])
  })

  it("keeps edge buildings fully on the land without changing stored positions", () => {
    const habits = [
      habit({ id: "west", position: { x: 0, y: 0 } }),
      habit({ id: "east", position: { x: 100, y: 100 } }),
    ]
    const scene = projectCityScene(habits, [])

    expect(scene.buildings.map(({ position }) => position)).toEqual([
      { x: -16, z: -16 },
      { x: 16, z: 16 },
    ])
    expect(habits.map(({ position }) => position)).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 100 },
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

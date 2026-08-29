import { describe, expect, it } from "vitest"

import {
  CITY_BUILDING_EDGE_CLEARANCE,
  CITY_TERRAIN_SIZE,
  findNearestValidPlot,
  getCityDensityTier,
  getCityHomeFrame,
  getCompactArrangement,
  isValidCityPlot,
  toStoredPosition,
  toWorldPosition,
} from "@/lib/city/city-layout"
import type { Habit } from "@/types/city"

const habit = (id: string, district: Habit["district"], position = { x: 50, y: 50 }): Habit => ({
  id,
  name: id,
  district,
  buildingType: "library",
  targetPerWeek: 4,
  colorToken: "sky",
  status: "active",
  position,
  relatedHabitIds: [],
  createdAt: "2026-08-01T08:00:00.000Z",
  updatedAt: "2026-08-01T08:00:00.000Z",
})

describe("city layout", () => {
  it("keeps the terrain larger than every supported camera viewport", () => {
    expect(CITY_TERRAIN_SIZE).toBeGreaterThanOrEqual(160)
  })

  it("reserves enough edge clearance for the widest mature building", () => {
    expect(CITY_BUILDING_EDGE_CLEARANCE).toBeGreaterThanOrEqual(6)
  })

  it.each([
    [0, "seed"],
    [1, "settlement"],
    [2, "settlement"],
    [3, "neighborhood"],
    [5, "neighborhood"],
    [6, "town"],
    [12, "town"],
    [13, "city"],
  ] as const)("classifies %i habits as %s", (count, tier) => {
    expect(getCityDensityTier(count)).toBe(tier)
  })

  it("round-trips stored positions through world coordinates", () => {
    expect(toWorldPosition({ x: 25, y: 75 })).toEqual({ x: -11, z: 11 })
    expect(toStoredPosition({ x: -11, z: 11 })).toEqual({ x: 25, y: 75 })
    expect(toStoredPosition({ x: 99, z: -99 })).toEqual({ x: 100, y: 0 })
  })

  it("snaps away from the fountain, roads, and occupied plots", () => {
    const occupied = [{ x: 4, z: 4 }]
    const snapped = findNearestValidPlot({ x: 0, z: 0 }, occupied)

    expect(snapped).toEqual({ x: -4, z: -4 })
    expect(isValidCityPlot(snapped!, occupied)).toBe(true)
  })

  it("moves edge positions far enough inward for complete building footprints", () => {
    const snapped = findNearestValidPlot({ x: 22, z: 22 })

    expect(snapped).toEqual({ x: 16, z: 16 })
    expect(isValidCityPlot(snapped!)).toBe(true)
  })

  it("creates a deterministic compact five-habit neighborhood", () => {
    const habits = [
      habit("walk", "body"),
      habit("read", "mind"),
      habit("make", "creative"),
      habit("call", "connection"),
      habit("plan", "work"),
    ]

    const first = getCompactArrangement(habits)
    const second = getCompactArrangement(habits)
    const positions = [...first.values()].map(toWorldPosition)

    expect(first).toEqual(second)
    expect(first.size).toBe(5)
    expect(positions.every((position, index) => isValidCityPlot(position, positions.slice(0, index)))).toBe(true)
    expect(Math.max(...positions.map((position) => Math.hypot(position.x, position.z)))).toBeLessThan(13)
  })

  it("frames neighborhoods closer than large cities while keeping the fountain visible", () => {
    const neighborhood = getCityHomeFrame([
      { x: -7, z: -7 },
      { x: 7, z: 7 },
      { x: 7, z: -7 },
    ], "neighborhood")
    const city = getCityHomeFrame([
      { x: -19, z: -19 },
      { x: 19, z: 19 },
      { x: 19, z: -19 },
    ], "city")

    expect(neighborhood.target).toEqual({ x: 0, z: 0 })
    expect(neighborhood.zoom).toBeGreaterThan(city.zoom)
    expect(neighborhood.zoom).toBeLessThanOrEqual(26)
    expect(city.zoom).toBeGreaterThanOrEqual(11)
  })
})

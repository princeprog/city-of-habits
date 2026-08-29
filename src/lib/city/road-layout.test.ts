import { describe, expect, it } from "vitest"

import {
  CITY_ROAD_SEGMENTS,
  isPositionClearOfRoads,
} from "@/lib/city/road-layout"

describe("city road layout", () => {
  it("defines a compact three-by-three street grid", () => {
    const horizontalOffsets = CITY_ROAD_SEGMENTS
      .filter(({ rotation }) => rotation === 0)
      .map(({ position }) => position[1])
      .sort((a, b) => a - b)
    const verticalOffsets = CITY_ROAD_SEGMENTS
      .filter(({ rotation }) => rotation !== 0)
      .map(({ position }) => position[0])
      .sort((a, b) => a - b)

    expect(CITY_ROAD_SEGMENTS).toHaveLength(6)
    expect(horizontalOffsets).toEqual([-11, 0, 11])
    expect(verticalOffsets).toEqual([-11, 0, 11])
    expect(CITY_ROAD_SEGMENTS.every(({ width }) => width <= 0.82)).toBe(true)
  })

  it("identifies decoration positions that would clip through a road", () => {
    expect(isPositionClearOfRoads({ x: 14, z: -11 })).toBe(false)
    expect(isPositionClearOfRoads({ x: 0, z: 18 })).toBe(false)
    expect(isPositionClearOfRoads({ x: 16, z: 7 })).toBe(true)
  })
})

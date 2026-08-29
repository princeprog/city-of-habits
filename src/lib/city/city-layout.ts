import { isPositionClearOfRoads } from "@/lib/city/road-layout"
import type { CityPosition, DistrictId, Habit } from "@/types/city"

export const CITY_WORLD_SIZE = 44
export const CITY_WORLD_LIMIT = CITY_WORLD_SIZE / 2
export const CITY_PLOT_SPACING = 4
export const FOUNTAIN_CLEARANCE_RADIUS = 5
export const ROAD_BUILDING_CLEARANCE = 1.8
export const CITY_BUILDING_EDGE_CLEARANCE = 6
export const CITY_CAMERA_MIN_ELEVATION_DEGREES = 24
export const CITY_CAMERA_MAX_POLAR_ANGLE =
  ((90 - CITY_CAMERA_MIN_ELEVATION_DEGREES) * Math.PI) / 180

export type CityDensityTier = "seed" | "settlement" | "neighborhood" | "town" | "city"

export interface ScenePosition {
  x: number
  z: number
}

export interface CityHomeFrame {
  target: ScenePosition
  zoom: number
}

const districtAnchors: Record<DistrictId, ScenePosition> = {
  body: { x: 8, z: 8 },
  mind: { x: -8, z: -8 },
  creative: { x: 4, z: -8 },
  connection: { x: 8, z: -4 },
  work: { x: -4, z: 8 },
  recovery: { x: -8, z: 8 },
}

const plotCoordinates = [-20, -16, -8, -4, 4, 8, 16, 20]

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value))
}

function round(value: number) {
  return Math.round(value * 100) / 100
}

function distance(a: ScenePosition, b: ScenePosition) {
  return Math.hypot(a.x - b.x, a.z - b.z)
}

export function getCityDensityTier(count: number): CityDensityTier {
  if (count === 0) return "seed"
  if (count <= 2) return "settlement"
  if (count <= 5) return "neighborhood"
  if (count <= 12) return "town"
  return "city"
}

export function toWorldPosition(position: CityPosition): ScenePosition {
  return {
    x: round((clamp(position.x, 0, 100) / 100) * CITY_WORLD_SIZE - CITY_WORLD_LIMIT),
    z: round((clamp(position.y, 0, 100) / 100) * CITY_WORLD_SIZE - CITY_WORLD_LIMIT),
  }
}

export function toStoredPosition(position: ScenePosition): CityPosition {
  return {
    x: round(((clamp(position.x, -CITY_WORLD_LIMIT, CITY_WORLD_LIMIT) + CITY_WORLD_LIMIT) / CITY_WORLD_SIZE) * 100),
    y: round(((clamp(position.z, -CITY_WORLD_LIMIT, CITY_WORLD_LIMIT) + CITY_WORLD_LIMIT) / CITY_WORLD_SIZE) * 100),
  }
}

export function isValidCityPlot(
  position: ScenePosition,
  occupied: ScenePosition[] = [],
  options: { edgeMargin?: number } = {},
) {
  const edgeMargin = options.edgeMargin ?? CITY_BUILDING_EDGE_CLEARANCE
  const insideBounds =
    Math.abs(position.x) <= CITY_WORLD_LIMIT - edgeMargin &&
    Math.abs(position.z) <= CITY_WORLD_LIMIT - edgeMargin
  const clearsFountain = Math.hypot(position.x, position.z) >= FOUNTAIN_CLEARANCE_RADIUS
  const clearsRoads = isPositionClearOfRoads(position, ROAD_BUILDING_CLEARANCE)
  const clearsBuildings = occupied.every(
    (plot) =>
      Math.abs(plot.x - position.x) >= CITY_PLOT_SPACING ||
      Math.abs(plot.z - position.z) >= CITY_PLOT_SPACING,
  )
  return insideBounds && clearsFountain && clearsRoads && clearsBuildings
}

export function getValidCityPlots(occupied: ScenePosition[] = []) {
  return plotCoordinates.flatMap((z) =>
    plotCoordinates
      .map((x) => ({ x, z }))
      .filter((position) => isValidCityPlot(position, occupied)),
  )
}

export function findNearestValidPlot(candidate: ScenePosition, occupied: ScenePosition[] = []) {
  const tiePriority = (position: ScenePosition) => {
    if (position.x >= candidate.x && position.z >= candidate.z) return 0
    if (position.x <= candidate.x && position.z <= candidate.z) return 1
    if (position.x >= candidate.x && position.z <= candidate.z) return 2
    return 3
  }
  return getValidCityPlots(occupied).sort(
    (a, b) =>
      distance(a, candidate) - distance(b, candidate) ||
      tiePriority(a) - tiePriority(b) ||
      a.x - b.x ||
      a.z - b.z,
  )[0]
}

export function resolveCityPlot(
  candidate: ScenePosition,
  occupied: ScenePosition[] = [],
) {
  if (isValidCityPlot(candidate, occupied)) {
    return candidate
  }
  return findNearestValidPlot(candidate, occupied) ?? candidate
}

export function resolveCityPositions(
  items: ReadonlyArray<{ id: string; position: CityPosition }>,
) {
  const resolved = new Map<string, ScenePosition>()
  const occupied: ScenePosition[] = []

  for (const item of items) {
    const position = resolveCityPlot(toWorldPosition(item.position), occupied)
    occupied.push(position)
    resolved.set(item.id, position)
  }

  return resolved
}

export function getCompactArrangement(habits: Habit[]) {
  const arrangement = new Map<string, CityPosition>()
  const occupied: ScenePosition[] = []

  for (const habit of habits) {
    const preferred = districtAnchors[habit.district]
    const position = getValidCityPlots(occupied).sort(
      (a, b) =>
        distance(a, preferred) - distance(b, preferred) ||
        Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z) ||
        a.x - b.x ||
        a.z - b.z,
    )[0]
    if (!position) continue
    occupied.push(position)
    arrangement.set(habit.id, toStoredPosition(position))
  }

  return arrangement
}

export function getCompactHabitPosition(district: DistrictId, habits: Habit[]) {
  const occupied = habits.map(({ position }) => toWorldPosition(position))
  const preferred = districtAnchors[district]
  const position = getValidCityPlots(occupied).sort(
    (a, b) =>
      distance(a, preferred) - distance(b, preferred) ||
      Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z) ||
      a.x - b.x ||
      a.z - b.z,
  )[0]
  return toStoredPosition(position ?? resolveCityPlot(preferred, occupied))
}

export function getCityHomeFrame(
  positions: ScenePosition[],
  density: CityDensityTier,
): CityHomeFrame {
  const framed = [{ x: 0, z: 0 }, ...positions]
  const minX = Math.min(...framed.map(({ x }) => x))
  const maxX = Math.max(...framed.map(({ x }) => x))
  const minZ = Math.min(...framed.map(({ z }) => z))
  const maxZ = Math.max(...framed.map(({ z }) => z))
  const extent = Math.max(maxX - minX, maxZ - minZ)
  const tierMaximum: Record<CityDensityTier, number> = {
    seed: 26,
    settlement: 24,
    neighborhood: 22,
    town: 18,
    city: 14,
  }

  return {
    target: { x: round((minX + maxX) / 2), z: round((minZ + maxZ) / 2) },
    zoom: round(Math.min(tierMaximum[density], clamp(500 / Math.max(12, extent + 8), 11, 26))),
  }
}

import { getBuildingModelPath } from "@/lib/city/scene-assets"
import { deriveGrowthStage, getHabitCheckIns } from "@/lib/city/rules"
import type { CheckIn, DistrictId, Habit } from "@/types/city"

export const CITY_WORLD_SIZE = 44
export const CITY_WORLD_LIMIT = CITY_WORLD_SIZE / 2
export const CITY_PLOT_SPACING = 4
export const FOUNTAIN_CLEARANCE_RADIUS = 5

export interface ScenePosition {
  x: number
  z: number
}

export interface ProjectedCityBuilding {
  id: string
  habitId: string
  name: string
  district: DistrictId
  buildingType: Habit["buildingType"]
  colorToken: string
  status: Habit["status"]
  stage: number
  position: ScenePosition
  modelPath: string
  variant: number
  visibility: "visible" | "dimmed"
}

export interface ProjectedCityConnector {
  id: string
  fromHabitId: string
  toHabitId: string
  from: ScenePosition
  to: ScenePosition
}

export interface ProjectedCityLandmark {
  id: string
  habitId: string
  position: ScenePosition
  stage: number
  label: string
}

export interface CitySceneProjection {
  buildings: ProjectedCityBuilding[]
  connectors: ProjectedCityConnector[]
  landmarks: ProjectedCityLandmark[]
}

const stageIndex = ["planned", "started", "growing", "established"] as const
const plotOffsets: ScenePosition[] = [
  { x: 0, z: 0 },
  { x: 1, z: 0 },
  { x: -1, z: 0 },
  { x: 0, z: 1 },
  { x: 0, z: -1 },
  { x: 1, z: 1 },
  { x: -1, z: -1 },
  { x: 1, z: -1 },
  { x: -1, z: 1 },
]

function clampWorld(value: number) {
  const clamped = Math.max(-CITY_WORLD_LIMIT, Math.min(CITY_WORLD_LIMIT, value))
  return Math.round(clamped * 100) / 100
}

function toWorldPosition(position: Habit["position"]): ScenePosition {
  return {
    x: clampWorld((position.x / 100) * CITY_WORLD_SIZE - CITY_WORLD_LIMIT),
    z: clampWorld((position.y / 100) * CITY_WORLD_SIZE - CITY_WORLD_LIMIT),
  }
}

function resolvePlot(base: ScenePosition, occupied: ScenePosition[]) {
  for (const offset of plotOffsets) {
    const candidate = {
      x: clampWorld(base.x + offset.x * CITY_PLOT_SPACING),
      z: clampWorld(base.z + offset.z * CITY_PLOT_SPACING),
    }
    const overlapsFountain = Math.hypot(candidate.x, candidate.z) < FOUNTAIN_CLEARANCE_RADIUS
    const hasCollision = occupied.some(
      (plot) =>
        Math.abs(plot.x - candidate.x) < CITY_PLOT_SPACING &&
        Math.abs(plot.z - candidate.z) < CITY_PLOT_SPACING,
    )
    if (!overlapsFountain && !hasCollision) return candidate
  }

  return {
    x: clampWorld(base.x + CITY_PLOT_SPACING),
    z: clampWorld(base.z + CITY_PLOT_SPACING),
  }
}

function stableVariant(habitId: string) {
  return [...habitId].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 2
}

function matchesFilter(habit: Habit, query: string, district: DistrictId | "all") {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const matchesQuery =
    !normalizedQuery ||
    habit.name.toLocaleLowerCase().includes(normalizedQuery) ||
    habit.intention?.toLocaleLowerCase().includes(normalizedQuery)

  return district === "all" || habit.district === district ? Boolean(matchesQuery) : false
}

export function projectCityScene(
  habits: Habit[],
  checkIns: CheckIn[],
  options: { query?: string; district?: DistrictId | "all" } = {},
): CitySceneProjection {
  const positionsByHabit = new Map<string, ScenePosition>()
  const occupied: ScenePosition[] = []

  const buildings = habits.map((habit) => {
    const position = resolvePlot(toWorldPosition(habit.position), occupied)
    occupied.push(position)
    positionsByHabit.set(habit.id, position)
    const stage = deriveGrowthStage(getHabitCheckIns(habit.id, checkIns).length)

    return {
      id: `building-${habit.id}`,
      habitId: habit.id,
      name: habit.name,
      district: habit.district,
      buildingType: habit.buildingType,
      colorToken: habit.colorToken,
      status: habit.status,
      stage: stageIndex.indexOf(stage),
      position,
      modelPath: getBuildingModelPath(habit.buildingType, stableVariant(habit.id)),
      variant: stableVariant(habit.id),
      visibility: matchesFilter(habit, options.query ?? "", options.district ?? "all")
        ? "visible"
        : "dimmed",
    } satisfies ProjectedCityBuilding
  })

  const landmarks = habits.flatMap((habit) => {
    const checkInCount = getHabitCheckIns(habit.id, checkIns).length
    if (checkInCount < 7) return []
    const position = positionsByHabit.get(habit.id)
    if (!position) return []

    return [{
      id: `landmark-${habit.id}`,
      habitId: habit.id,
      position: {
        x: clampWorld(position.x + 1.4),
        z: clampWorld(position.z - 1.4),
      },
      stage: checkInCount >= 30 ? 2 : checkInCount >= 15 ? 1 : 0,
      label: `${habit.name} milestone landmark`,
    } satisfies ProjectedCityLandmark]
  })

  const connectors: ProjectedCityConnector[] = []
  const seenPaths = new Set<string>()
  for (const habit of habits) {
    for (const relatedId of habit.relatedHabitIds) {
      const related = habits.find((candidate) => candidate.id === relatedId)
      if (!related) continue
      const [fromHabitId, toHabitId] = [habit.id, related.id].sort()
      const id = `path-${fromHabitId}:${toHabitId}`
      if (seenPaths.has(id)) continue
      const from = positionsByHabit.get(fromHabitId)
      const to = positionsByHabit.get(toHabitId)
      if (!from || !to) continue
      seenPaths.add(id)
      connectors.push({ id, fromHabitId, toHabitId, from, to })
    }
  }

  return { buildings, connectors, landmarks }
}

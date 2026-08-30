import { getBuildingModelPath } from "@/lib/city/scene-assets"
import {
  CITY_WORLD_LIMIT,
  FOUNTAIN_CLEARANCE_RADIUS,
  getCityDensityTier,
  getCityHomeFrame,
  resolveCityPositions,
  type CityDensityTier,
  type CityHomeFrame,
  type ScenePosition,
} from "@/lib/city/city-layout"
import { projectHabitScenery, type ProjectedCityScenery } from "@/lib/city/city-scenery"
import { deriveGrowthStage, getHabitCheckIns, getMilestoneCount } from "@/lib/city/rules"
import type { CheckIn, CityPosition, DistrictId, Habit } from "@/types/city"

export { CITY_WORLD_LIMIT, FOUNTAIN_CLEARANCE_RADIUS }
export type { ScenePosition }

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
  presentation: CityBuildingPresentation
  milestoneCount: number
  variant: number
  visibility: "visible" | "dimmed"
}

export type CityBuildingPresentation =
  | "park-landscape"
  | "civic-library"
  | "industrial-workshop"
  | "road-bridge"
  | "city-tower"
  | "coastal-lighthouse"

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
  scenery: ProjectedCityScenery[]
  density: CityDensityTier
  homeFrame: CityHomeFrame
}

const stageIndex = ["planned", "started", "growing", "established"] as const
const buildingPresentations: Record<Habit["buildingType"], CityBuildingPresentation> = {
  park: "park-landscape",
  library: "civic-library",
  workshop: "industrial-workshop",
  bridge: "road-bridge",
  tower: "city-tower",
  lighthouse: "coastal-lighthouse",
}
function clampWorld(value: number) {
  const clamped = Math.max(-CITY_WORLD_LIMIT, Math.min(CITY_WORLD_LIMIT, value))
  return Math.round(clamped * 100) / 100
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
  options: {
    query?: string
    district?: DistrictId | "all"
    positionOverrides?: ReadonlyMap<string, CityPosition>
  } = {},
): CitySceneProjection {
  const positionsByHabit = resolveCityPositions(
    habits.map((habit) => ({
      id: habit.id,
      position: options.positionOverrides?.get(habit.id) ?? habit.position,
    })),
  )

  const buildings = habits.map((habit) => {
    const position = positionsByHabit.get(habit.id)!
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
      presentation: buildingPresentations[habit.buildingType],
      milestoneCount: getMilestoneCount(habit.id, checkIns),
      variant: stableVariant(habit.id),
      visibility: matchesFilter(habit, options.query ?? "", options.district ?? "all")
        ? "visible"
        : "dimmed",
    } satisfies ProjectedCityBuilding
  })

  const sceneryByHabit = buildings.map((building) =>
    projectHabitScenery({
      habitId: building.habitId,
      district: building.district,
      position: building.position,
      stage: building.stage,
    }),
  )
  const scenery = Array.from(
    { length: Math.max(0, ...sceneryByHabit.map((items) => items.length)) },
    (_, detailIndex) => sceneryByHabit.flatMap((items) => items[detailIndex] ?? []),
  ).flat()

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
      stage: checkInCount >= 100 ? 2 : checkInCount >= 30 ? 1 : 0,
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

  const density = getCityDensityTier(habits.length)
  const homeFrame = getCityHomeFrame(buildings.map(({ position }) => position), density)

  return { buildings, connectors, landmarks, scenery, density, homeFrame }
}

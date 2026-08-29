import type { ScenePosition } from "@/lib/city/city-layout"
import type { DistrictId } from "@/types/city"

export type CitySceneryKind =
  | "ground"
  | "path"
  | "tree"
  | "planter"
  | "light"
  | "bench"
  | "hedge"
  | "rocks"
  | "flowers"

export interface ProjectedCityScenery {
  id: string
  habitId: string
  district: DistrictId
  kind: CitySceneryKind
  position: ScenePosition
  rotation: number
  scale: number
}

const baselineAccent: Record<DistrictId, CitySceneryKind> = {
  body: "tree",
  mind: "bench",
  creative: "flowers",
  connection: "bench",
  work: "light",
  recovery: "rocks",
}

const stageDetails: CitySceneryKind[][] = [
  [],
  ["path", "tree"],
  ["planter", "light"],
  ["hedge", "flowers"],
]

function stableSeed(value: string) {
  return [...value].reduce((seed, character) => (seed * 31 + character.charCodeAt(0)) % 360, 17)
}

export function projectHabitScenery({
  habitId,
  district,
  position,
  stage,
}: {
  habitId: string
  district: DistrictId
  position: ScenePosition
  stage: number
}) {
  const kinds = [
    "ground" as const,
    baselineAccent[district],
    ...stageDetails.slice(1, Math.min(3, Math.max(0, stage)) + 1).flat(),
  ]
  const seed = stableSeed(habitId)

  return kinds.map((kind, index) => {
    if (kind === "ground") {
      return {
        id: `scenery-${habitId}-ground`,
        habitId,
        district,
        kind,
        position,
        rotation: 0,
        scale: 1,
      } satisfies ProjectedCityScenery
    }

    const angle = ((seed + index * 137.5) * Math.PI) / 180
    const radius = 1.35 + (index % 2) * 0.6
    return {
      id: `scenery-${habitId}-${kind}-${index}`,
      habitId,
      district,
      kind,
      position: {
        x: Math.round((position.x + Math.cos(angle) * radius) * 100) / 100,
        z: Math.round((position.z + Math.sin(angle) * radius) * 100) / 100,
      },
      rotation: Math.round(angle * 100) / 100,
      scale: index % 2 ? 0.9 : 1,
    } satisfies ProjectedCityScenery
  })
}

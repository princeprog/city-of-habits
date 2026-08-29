import type { BuildingType } from "@/types/city"

type DecorationId =
  | "bridge-pillar"
  | "chimney-basic"
  | "light-square"
  | "planter"
  | "road-bend"
  | "road-bridge"
  | "road-crossroad"
  | "road-roundabout"
  | "road-straight"
  | "tree-large"
  | "tree-small"

type CityModelPack = "commercial" | "industrial" | "roads" | "suburban"

const model = (pack: CityModelPack, fileName: string) =>
  `/models/city/${pack}/${fileName}.glb`

export const CITY_MODEL_PATHS = {
  buildings: {
    park: [model("suburban", "building-type-k"), model("suburban", "building-type-o")],
    library: [model("suburban", "building-type-o"), model("suburban", "building-type-t")],
    workshop: [model("industrial", "building-g"), model("industrial", "building-h")],
    bridge: [model("commercial", "building-a"), model("commercial", "building-j")],
    tower: [model("commercial", "building-skyscraper-c"), model("commercial", "building-j")],
    lighthouse: [model("industrial", "building-t"), model("industrial", "building-q")],
  } satisfies Record<BuildingType, string[]>,
  decorations: {
    "bridge-pillar": model("roads", "bridge-pillar"),
    "chimney-basic": model("industrial", "chimney-basic"),
    "light-square": model("roads", "light-square"),
    planter: model("suburban", "planter"),
    "road-bend": model("roads", "road-bend"),
    "road-bridge": model("roads", "road-bridge"),
    "road-crossroad": model("roads", "road-crossroad"),
    "road-roundabout": model("roads", "road-roundabout"),
    "road-straight": model("roads", "road-straight"),
    "tree-large": model("suburban", "tree-large"),
    "tree-small": model("suburban", "tree-small"),
  } satisfies Record<DecorationId, string>,
} as const

export function getBuildingModelPath(type: BuildingType, variant = 0) {
  const variants = CITY_MODEL_PATHS.buildings[type]
  return variants[Math.abs(variant) % variants.length]
}

export function getDecorationModelPath(id: DecorationId) {
  return CITY_MODEL_PATHS.decorations[id]
}

export type { DecorationId }

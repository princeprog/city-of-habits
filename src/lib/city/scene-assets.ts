import type { BuildingType } from "@/types/city"

type DecorationId =
  | "bridge-pillar"
  | "chimney-basic"
  | "light-square"
  | "path-long"
  | "planter"
  | "road-bend"
  | "road-bridge"
  | "road-crossroad"
  | "road-roundabout"
  | "road-straight"
  | "tree-large"
  | "tree-small"

const model = (fileName: string) => `/models/city/${fileName}.glb`

export const CITY_MODEL_PATHS = {
  buildings: {
    park: [model("building-type-k"), model("building-type-o")],
    library: [model("building-type-o"), model("building-type-t")],
    workshop: [model("building-g"), model("building-h")],
    bridge: [model("building-a"), model("building-j")],
    tower: [model("building-skyscraper-c"), model("building-j")],
    lighthouse: [model("building-t"), model("building-q")],
  } satisfies Record<BuildingType, string[]>,
  decorations: {
    "bridge-pillar": model("bridge-pillar"),
    "chimney-basic": model("chimney-basic"),
    "light-square": model("light-square"),
    "path-long": model("path-long"),
    planter: model("planter"),
    "road-bend": model("road-bend"),
    "road-bridge": model("road-bridge"),
    "road-crossroad": model("road-crossroad"),
    "road-roundabout": model("road-roundabout"),
    "road-straight": model("road-straight"),
    "tree-large": model("tree-large"),
    "tree-small": model("tree-small"),
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

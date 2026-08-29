import { z } from "zod"

import {
  BUILDING_TYPES,
  DISTRICT_IDS,
  type BuildingType,
  type DistrictId,
} from "@/types/city"
import { buildingCatalog, colorTokens, districtCatalog } from "@/lib/city/catalog"

export const habitCreationSchema = z.object({
  name: z.string().trim().min(2, "Give the habit a name.").max(80, "Keep the name under 80 characters."),
  district: z.enum(DISTRICT_IDS),
  buildingType: z.enum(BUILDING_TYPES),
  targetPerWeek: z.number().int().min(1).max(7),
  colorToken: z.enum(colorTokens),
  intention: z.string().trim().max(240, "Keep the intention under 240 characters.").optional(),
})

export type HabitCreationValues = z.infer<typeof habitCreationSchema>

export const habitCreationDefaults: HabitCreationValues = {
  name: "",
  district: "mind",
  buildingType: "library",
  targetPerWeek: 4,
  colorToken: "sky",
  intention: "",
}

export const habitCreationDistrictItems: Array<{ label: string; value: DistrictId }> =
  Object.entries(districtCatalog).map(([value, district]) => ({
    label: district.name,
    value: value as DistrictId,
  }))

export const habitCreationBuildingItems: Array<{ label: string; value: BuildingType }> =
  Object.entries(buildingCatalog).map(([value, building]) => ({
    label: building.name,
    value: value as BuildingType,
  }))

export const habitCreationColorItems = colorTokens.map((value) => ({
  label: value[0].toUpperCase() + value.slice(1),
  value,
}))

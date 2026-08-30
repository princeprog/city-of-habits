import type { CityVisualState } from "@/types/city"

export interface CityLightingProfile {
  skyColor: string
  terrainColor: string
  ambientColor: string
  ambientIntensity: number
  directionalColor: string
  directionalIntensity: number
  windowIntensity: number
  activityMotion: boolean
  isRainy: boolean
  cloudOpacity: number
  rainOpacity: number
  fountainIntensity: number
}

const timePalettes = {
  day: {
    skyColor: "#91b879",
    terrainColor: "#91b879",
    ambientColor: "#fff6df",
    ambientIntensity: 2.2,
    directionalColor: "#fff1d1",
    directionalIntensity: 3.5,
    windowIntensity: 0,
  },
  dusk: {
    skyColor: "#9b826e",
    terrainColor: "#7f996f",
    ambientColor: "#f6d3aa",
    ambientIntensity: 1.7,
    directionalColor: "#f4b982",
    directionalIntensity: 2.35,
    windowIntensity: 0.7,
  },
  night: {
    skyColor: "#25384a",
    terrainColor: "#3d604d",
    ambientColor: "#9bb5cf",
    ambientIntensity: 0.95,
    directionalColor: "#7187a6",
    directionalIntensity: 1.25,
    windowIntensity: 0.95,
  },
} as const

export function getCityLightingProfile({ timeOfDay, activity }: CityVisualState): CityLightingProfile {
  const palette = timePalettes[timeOfDay]
  const lively = activity === "lively"
  const quiet = activity === "quiet"
  const rainy = activity === "rainy"
  const activityIntensity = lively ? 0.2 : quiet ? -0.18 : 0

  return {
    skyColor: rainy ? (timeOfDay === "night" ? "#1f3342" : "#728b8c") : palette.skyColor,
    terrainColor: rainy ? (timeOfDay === "night" ? "#334f4b" : "#739678") : palette.terrainColor,
    ambientColor: rainy ? "#b8cbd0" : palette.ambientColor,
    ambientIntensity: Math.max(0.55, palette.ambientIntensity + activityIntensity - (rainy ? 0.25 : 0)),
    directionalColor: rainy ? "#9eb8c0" : palette.directionalColor,
    directionalIntensity: Math.max(0.7, palette.directionalIntensity + activityIntensity * 0.5 - (rainy ? 0.6 : 0)),
    windowIntensity: Math.max(0.32, palette.windowIntensity + (rainy ? 0.08 : 0)),
    activityMotion: (lively && !rainy) || rainy,
    isRainy: rainy,
    cloudOpacity: rainy ? (timeOfDay === "night" ? 0.48 : 0.35) : 0,
    rainOpacity: rainy ? 0.46 : 0,
    fountainIntensity: quiet ? 0.35 : lively ? 1.15 : rainy ? 0.62 : 0.82,
  }
}

export const DISTRICT_IDS = [
  "body",
  "mind",
  "creative",
  "connection",
  "work",
  "recovery",
] as const

export type DistrictId = (typeof DISTRICT_IDS)[number]

export const BUILDING_TYPES = [
  "park",
  "library",
  "workshop",
  "bridge",
  "tower",
  "lighthouse",
] as const

export type BuildingType = (typeof BUILDING_TYPES)[number]
export type HabitStatus = "active" | "paused" | "archived"
export type GrowthStage = "planned" | "started" | "growing" | "established"
export type Mood = "low" | "steady" | "good" | "energized"
export type ThemeMode = "paper" | "night"
export type MotionMode = "system" | "reduced" | "full"

export interface CityPosition {
  x: number
  y: number
}

export interface Habit {
  id: string
  name: string
  district: DistrictId
  buildingType: BuildingType
  targetPerWeek: number
  colorToken: string
  intention?: string
  status: HabitStatus
  position: CityPosition
  relatedHabitIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CheckIn {
  id: string
  habitId: string
  localDate: string
  completedAt: string
  note?: string
  mood?: Mood
}

export interface Reflection {
  id: string
  habitId?: string
  scopeKey: string
  period: "week" | "month"
  periodStart: string
  body: string
  createdAt: string
  updatedAt: string
}

export interface CityPreferences {
  id: "default"
  theme: ThemeMode
  quietMode: boolean
  soundEnabled: boolean
  motion: MotionMode
  hasSeenWelcome: boolean
  updatedAt: string
}

export interface CityElement {
  id: string
  kind: "building" | "path" | "landmark" | "park"
  sourceHabitId?: string
  sourceHabitIds?: string[]
  stage: number
  position: CityPosition
  styleKey: string
  label?: string
}

export interface CitySnapshot {
  habits: Habit[]
  checkIns: CheckIn[]
  reflections: Reflection[]
  preferences: CityPreferences
}

export interface CityBackupV1 extends CitySnapshot {
  schemaVersion: 1
  exportedAt: string
  appVersion: string
}

import { z } from "zod"

import type { CityBackupV1, CityBackupV2, CityPreferences, CitySnapshot } from "@/types/city"

const positionSchema = z.object({ x: z.number(), y: z.number() })
const habitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  district: z.enum(["body", "mind", "creative", "connection", "work", "recovery"]),
  buildingType: z.enum(["park", "library", "workshop", "bridge", "tower", "lighthouse"]),
  targetPerWeek: z.number().int().min(1).max(7),
  colorToken: z.string().min(1),
  intention: z.string().optional(),
  status: z.enum(["active", "paused", "archived"]),
  position: positionSchema,
  relatedHabitIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
})
const checkInSchema = z.object({
  id: z.string().min(1),
  habitId: z.string().min(1),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completedAt: z.string(),
  note: z.string().optional(),
  mood: z.enum(["low", "steady", "good", "energized"]).optional(),
})
const reflectionSchema = z.object({
  id: z.string().min(1),
  habitId: z.string().optional(),
  scopeKey: z.string().min(1),
  period: z.enum(["week", "month"]),
  periodStart: z.string(),
  body: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
const preferenceFields = {
  id: z.literal("default"),
  quietMode: z.boolean(),
  soundEnabled: z.boolean(),
  motion: z.enum(["system", "reduced", "full"]),
  hasSeenWelcome: z.boolean(),
  updatedAt: z.string(),
}
const legacyPreferencesSchema = z.object({
  ...preferenceFields,
  theme: z.enum(["paper", "night"]),
})
const preferencesSchema = z.object({
  ...preferenceFields,
  theme: z.enum(["light", "dark", "system"]),
})
const backupFields = {
  exportedAt: z.string(),
  appVersion: z.string(),
  habits: z.array(habitSchema),
  checkIns: z.array(checkInSchema),
  reflections: z.array(reflectionSchema),
}

export const cityBackupV1Schema = z.object({
  ...backupFields,
  schemaVersion: z.literal(1),
  preferences: legacyPreferencesSchema,
})

export const cityBackupSchema = z.object({
  ...backupFields,
  schemaVersion: z.literal(2),
  preferences: preferencesSchema,
})

function migrateTheme(theme: "paper" | "night"): "light" | "dark" {
  return theme === "night" ? "dark" : "light"
}

export function migrateBackupV1(backup: CityBackupV1): CityBackupV2 {
  return {
    ...backup,
    schemaVersion: 2,
    preferences: {
      ...backup.preferences,
      theme: migrateTheme(backup.preferences.theme),
    },
  }
}

export function createBackup(snapshot: CitySnapshot, appVersion: string): CityBackupV2 {
  return {
    ...snapshot,
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    appVersion,
  }
}

export function serializeBackup(backup: CityBackupV2) {
  return JSON.stringify(backup, null, 2)
}

export function parseBackup(value: unknown): CityBackupV2 {
  const schemaVersion = z.object({ schemaVersion: z.number() }).parse(value).schemaVersion
  if (schemaVersion === 1) {
    return migrateBackupV1(cityBackupV1Schema.parse(value))
  }
  if (schemaVersion === 2) {
    return cityBackupSchema.parse(value)
  }
  throw new Error(`Unsupported City of Habits backup schema: ${schemaVersion}`)
}

export function parseBackupText(text: string) {
  return parseBackup(JSON.parse(text))
}

export function getBackupSummary(backup: CityBackupV1 | CityBackupV2) {
  return {
    habits: backup.habits.length,
    checkIns: backup.checkIns.length,
    reflections: backup.reflections.length,
    exportedAt: backup.exportedAt,
  }
}

export function normalizePreferences(preferences: Omit<Partial<CityPreferences>, "theme"> & { theme?: string }): CityPreferences {
  const theme = preferences.theme === "paper"
    ? "light"
    : preferences.theme === "night"
      ? "dark"
      : preferences.theme === "light" || preferences.theme === "dark" || preferences.theme === "system"
        ? preferences.theme
        : "system"
  return { ...preferences, theme } as CityPreferences
}

import { z } from "zod"

import type { CityBackupV1, CitySnapshot } from "@/types/city"

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
const preferencesSchema = z.object({
  id: z.literal("default"),
  theme: z.enum(["paper", "night"]),
  quietMode: z.boolean(),
  soundEnabled: z.boolean(),
  motion: z.enum(["system", "reduced", "full"]),
  hasSeenWelcome: z.boolean(),
  updatedAt: z.string(),
})

export const cityBackupSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.string(),
  appVersion: z.string(),
  habits: z.array(habitSchema),
  checkIns: z.array(checkInSchema),
  reflections: z.array(reflectionSchema),
  preferences: preferencesSchema,
})

export function createBackup(snapshot: CitySnapshot, appVersion: string): CityBackupV1 {
  return {
    ...snapshot,
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    appVersion,
  }
}

export function serializeBackup(backup: CityBackupV1) {
  return JSON.stringify(backup, null, 2)
}

export function parseBackup(value: unknown) {
  return cityBackupSchema.parse(value)
}

export function parseBackupText(text: string) {
  return parseBackup(JSON.parse(text))
}

export function getBackupSummary(backup: CityBackupV1) {
  return {
    habits: backup.habits.length,
    checkIns: backup.checkIns.length,
    reflections: backup.reflections.length,
    exportedAt: backup.exportedAt,
  }
}

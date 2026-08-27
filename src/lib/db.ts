import Dexie, { type Table } from "dexie"

import { makeId, getLocalDateKey, getStablePosition } from "@/lib/city/rules"
import type {
  CheckIn,
  CityPreferences,
  CitySnapshot,
  Habit,
  Reflection,
} from "@/types/city"

export class CityDatabase extends Dexie {
  habits!: Table<Habit, string>
  checkIns!: Table<CheckIn, string>
  reflections!: Table<Reflection, string>
  preferences!: Table<CityPreferences, string>

  constructor() {
    super("city-of-habits")
    this.version(1).stores({
      habits: "&id, district, status, createdAt, updatedAt",
      checkIns: "&id, [habitId+localDate], habitId, localDate, completedAt",
      reflections: "&id, scopeKey, periodStart, createdAt",
      preferences: "&id",
    })
  }
}

export const cityDb = new CityDatabase()

export const defaultPreferences = (): CityPreferences => ({
  id: "default",
  theme: "paper",
  quietMode: false,
  soundEnabled: false,
  motion: "system",
  hasSeenWelcome: false,
  updatedAt: new Date().toISOString(),
})

export async function readCitySnapshot(): Promise<CitySnapshot> {
  const [habits, checkIns, reflections, preferences] = await Promise.all([
    cityDb.habits.toArray(),
    cityDb.checkIns.toArray(),
    cityDb.reflections.toArray(),
    cityDb.preferences.get("default"),
  ])

  return {
    habits,
    checkIns,
    reflections,
    preferences: preferences ?? defaultPreferences(),
  }
}

export async function savePreferences(input: Partial<CityPreferences>) {
  const next = {
    ...defaultPreferences(),
    ...(await cityDb.preferences.get("default")),
    ...input,
    id: "default" as const,
    updatedAt: new Date().toISOString(),
  }
  await cityDb.preferences.put(next)
  return next
}

export async function createHabit(
  input: Pick<
    Habit,
    "name" | "district" | "buildingType" | "targetPerWeek" | "colorToken" | "intention"
  >
) {
  const habits = await cityDb.habits.toArray()
  const now = new Date().toISOString()
  const habit: Habit = {
    id: makeId("habit"),
    ...input,
    targetPerWeek: Math.max(1, Math.min(7, input.targetPerWeek)),
    status: "active",
    position: getStablePosition(input.district, habits),
    relatedHabitIds: [],
    createdAt: now,
    updatedAt: now,
  }
  await cityDb.habits.add(habit)
  return habit
}

export async function updateHabit(id: string, changes: Partial<Habit>) {
  const current = await cityDb.habits.get(id)
  if (!current) throw new Error("Habit not found")
  const next = { ...current, ...changes, id, updatedAt: new Date().toISOString() }
  await cityDb.habits.put(next)
  return next
}

export async function toggleCheckIn(
  habitId: string,
  input?: Pick<CheckIn, "note" | "mood">,
  date = new Date()
) {
  const localDate = getLocalDateKey(date)
  const existing = await cityDb.checkIns
    .where("[habitId+localDate]")
    .equals([habitId, localDate])
    .first()

  if (existing) {
    await cityDb.checkIns.delete(existing.id)
    return null
  }

  const checkIn: CheckIn = {
    id: makeId("checkin"),
    habitId,
    localDate,
    completedAt: new Date().toISOString(),
    ...input,
  }
  await cityDb.checkIns.add(checkIn)
  await updateHabit(habitId, {})
  return checkIn
}

export async function saveReflection(
  input: Omit<Reflection, "id" | "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString()
  const existing = await cityDb.reflections
    .where("scopeKey")
    .equals(input.scopeKey)
    .first()
  const reflection: Reflection = {
    ...existing,
    ...input,
    id: existing?.id ?? makeId("reflection"),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  await cityDb.reflections.put(reflection)
  return reflection
}

export async function replaceCity(snapshot: CitySnapshot) {
  await cityDb.transaction(
    "rw",
    cityDb.habits,
    cityDb.checkIns,
    cityDb.reflections,
    cityDb.preferences,
    async () => {
      await Promise.all([
        cityDb.habits.clear(),
        cityDb.checkIns.clear(),
        cityDb.reflections.clear(),
        cityDb.preferences.clear(),
      ])
      await cityDb.habits.bulkAdd(snapshot.habits)
      await cityDb.checkIns.bulkAdd(snapshot.checkIns)
      await cityDb.reflections.bulkAdd(snapshot.reflections)
      await cityDb.preferences.put(snapshot.preferences)
    }
  )
}

export async function clearCity() {
  await replaceCity({
    habits: [],
    checkIns: [],
    reflections: [],
    preferences: defaultPreferences(),
  })
}

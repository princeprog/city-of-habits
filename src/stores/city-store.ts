"use client"

import { create } from "zustand"

import {
  cityDb,
  clearCity,
  createHabit,
  defaultPreferences,
  readCitySnapshot,
  replaceCity,
  savePreferences,
  saveReflection,
  toggleCheckIn,
  updateHabit,
} from "@/lib/db"
import { sampleCheckIns, sampleHabits } from "@/lib/city/catalog"
import type {
  CheckIn,
  CityPreferences,
  Habit,
  Mood,
  Reflection,
} from "@/types/city"

interface CityStore {
  habits: Habit[]
  checkIns: CheckIn[]
  reflections: Reflection[]
  preferences: CityPreferences
  hydrated: boolean
  hydrate: () => Promise<void>
  addHabit: (input: Parameters<typeof createHabit>[0]) => Promise<Habit>
  updateHabit: (id: string, changes: Partial<Habit>) => Promise<void>
  toggleCheckIn: (habitId: string, input?: { note?: string; mood?: Mood }) => Promise<CheckIn | null>
  saveReflection: (input: Omit<Reflection, "id" | "createdAt" | "updatedAt">) => Promise<void>
  setPreferences: (input: Partial<CityPreferences>) => Promise<void>
  loadSampleCity: () => Promise<void>
  resetCity: () => Promise<void>
  replaceFromBackup: (snapshot: { habits: Habit[]; checkIns: CheckIn[]; reflections: Reflection[]; preferences: CityPreferences }) => Promise<void>
}

export const useCityStore = create<CityStore>((set) => ({
  habits: [],
  checkIns: [],
  reflections: [],
  preferences: defaultPreferences(),
  hydrated: false,
  hydrate: async () => {
    const snapshot = await readCitySnapshot()
    set({ ...snapshot, hydrated: true })
  },
  addHabit: async (input) => {
    const habit = await createHabit(input)
    set((state) => ({ habits: [...state.habits, habit] }))
    return habit
  },
  updateHabit: async (id, changes) => {
    const next = await updateHabit(id, changes)
    set((state) => ({ habits: state.habits.map((habit) => (habit.id === id ? next : habit)) }))
  },
  toggleCheckIn: async (habitId, input) => {
    const result = await toggleCheckIn(habitId, input)
    const snapshot = await readCitySnapshot()
    set({ ...snapshot, hydrated: true })
    return result
  },
  saveReflection: async (input) => {
    await saveReflection(input)
    const snapshot = await readCitySnapshot()
    set({ ...snapshot, hydrated: true })
  },
  setPreferences: async (input) => {
    const preferences = await savePreferences(input)
    set({ preferences })
  },
  loadSampleCity: async () => {
    await replaceCity({
      habits: sampleHabits.map((habit) => ({
        ...habit,
        relatedHabitIds: [...habit.relatedHabitIds],
      })),
      checkIns: sampleCheckIns.map((checkIn) => ({ ...checkIn })),
      reflections: [],
      preferences: { ...defaultPreferences(), hasSeenWelcome: true },
    })
    const snapshot = await readCitySnapshot()
    set({ ...snapshot, hydrated: true })
  },
  resetCity: async () => {
    await clearCity()
    const snapshot = await readCitySnapshot()
    set({ ...snapshot, hydrated: true })
  },
  replaceFromBackup: async (snapshot) => {
    await replaceCity(snapshot)
    const next = await readCitySnapshot()
    set({ ...next, hydrated: true })
  },
}))

export async function closeCityDatabase() {
  await cityDb.close()
}

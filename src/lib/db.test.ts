import { beforeEach, describe, expect, it } from "vitest"

import {
  clearCity,
  cityDb,
  createHabit,
  normalizeThemeMode,
  readCitySnapshot,
  replaceCity,
  savePreferences,
  toggleCheckIn,
  updateHabitPositions,
} from "@/lib/db"

describe("local city persistence", () => {
  beforeEach(async () => {
    await clearCity()
  })

  it("allows one check-in per habit and local calendar day, then undoes it", async () => {
    const habit = await createHabit({ name: "Read", district: "mind", buildingType: "library", targetPerWeek: 4, colorToken: "sky", intention: "Make room" })
    const date = new Date("2026-08-27T22:00:00")
    const first = await toggleCheckIn(habit.id, { mood: "good" }, date)
    const second = await toggleCheckIn(habit.id, undefined, date)
    expect(first?.habitId).toBe(habit.id)
    expect(second).toBeNull()
    expect((await readCitySnapshot()).checkIns).toHaveLength(0)
  })

  it("keeps existing data when a replacement transaction fails", async () => {
    const habit = await createHabit({ name: "Journal", district: "mind", buildingType: "library", targetPerWeek: 3, colorToken: "teal", intention: "Leave a note" })
    const before = await readCitySnapshot()
    await expect(replaceCity({ ...before, habits: [habit, habit] })).rejects.toBeTruthy()
    const after = await readCitySnapshot()
    expect(after.habits.map((item) => item.id)).toEqual([habit.id])
    expect(after.preferences.id).toBe("default")
  })

  it("declares the compound check-in index", () => {
    expect(cityDb.checkIns.schema.indexes.some((index) => index.name === "[habitId+localDate]")).toBe(true)
  })

  it("migrates legacy and unsupported preference themes", () => {
    expect(normalizeThemeMode("paper")).toBe("light")
    expect(normalizeThemeMode("night")).toBe("dark")
    expect(normalizeThemeMode("system")).toBe("system")
    expect(normalizeThemeMode("unexpected")).toBe("system")
    expect(normalizeThemeMode(undefined)).toBe("system")
  })

  it("persists each supported theme choice", async () => {
    for (const theme of ["light", "dark", "system"] as const) {
      const preferences = await savePreferences({ theme })
      expect(preferences.theme).toBe(theme)
      expect((await readCitySnapshot()).preferences.theme).toBe(theme)
    }
  })

  it("updates multiple habit positions atomically and clamps stored coordinates", async () => {
    const first = await createHabit({ name: "Read", district: "mind", buildingType: "library", targetPerWeek: 4, colorToken: "sky", intention: "Make room" })
    const second = await createHabit({ name: "Walk", district: "body", buildingType: "park", targetPerWeek: 5, colorToken: "teal", intention: "Get outside" })
    const previousUpdatedAt = "2026-01-01T00:00:00.000Z"
    await cityDb.habits.bulkUpdate([
      { key: first.id, changes: { updatedAt: previousUpdatedAt } },
      { key: second.id, changes: { updatedAt: previousUpdatedAt } },
    ])

    const updated = await updateHabitPositions([
      { id: first.id, position: { x: -12, y: 140 } },
      { id: second.id, position: { x: 72, y: 31 } },
    ])

    expect(updated.map(({ id, position }) => ({ id, position }))).toEqual([
      { id: first.id, position: { x: 0, y: 100 } },
      { id: second.id, position: { x: 72, y: 31 } },
    ])
    expect(updated.every((habit) => habit.updatedAt !== previousUpdatedAt)).toBe(true)
    expect((await cityDb.habits.bulkGet([first.id, second.id])).map((habit) => habit?.position)).toEqual([
      { x: 0, y: 100 },
      { x: 72, y: 31 },
    ])
  })

  it("rolls back every position when one requested habit is missing", async () => {
    const first = await createHabit({ name: "Read", district: "mind", buildingType: "library", targetPerWeek: 4, colorToken: "sky", intention: "Make room" })
    const second = await createHabit({ name: "Walk", district: "body", buildingType: "park", targetPerWeek: 5, colorToken: "teal", intention: "Get outside" })

    await expect(updateHabitPositions([
      { id: first.id, position: { x: 25, y: 25 } },
      { id: "missing-habit", position: { x: 75, y: 75 } },
    ])).rejects.toThrow("Habit not found")

    expect((await cityDb.habits.bulkGet([first.id, second.id])).map((habit) => habit?.position)).toEqual([
      first.position,
      second.position,
    ])
  })
})

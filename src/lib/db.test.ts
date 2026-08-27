import { beforeEach, describe, expect, it } from "vitest"

import { clearCity, cityDb, createHabit, readCitySnapshot, replaceCity, toggleCheckIn } from "@/lib/db"

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
})

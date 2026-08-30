import { describe, expect, it } from "vitest"

import { isValidCityPlot, toWorldPosition } from "@/lib/city/city-layout"
import { deriveGrowthStage, getDaysAgo, getStablePosition, getWeekDateKeys } from "@/lib/city/rules"
import * as cityRules from "@/lib/city/rules"
import type { Habit } from "@/types/city"

describe("city growth projections", () => {
  it.each([
    ["2026-08-30T05:59:00", "night"],
    ["2026-08-30T06:00:00", "day"],
    ["2026-08-30T16:59:00", "day"],
    ["2026-08-30T17:00:00", "dusk"],
    ["2026-08-30T19:59:00", "dusk"],
    ["2026-08-30T20:00:00", "night"],
  ])("maps local time %s to %s", (time, expected) => {
    const resolveCityTimeOfDay = (cityRules as typeof cityRules & {
      resolveCityTimeOfDay?: (date: Date, preview?: "auto" | "day" | "dusk" | "night") => string
    }).resolveCityTimeOfDay

    expect(resolveCityTimeOfDay?.(new Date(time))).toBe(expected)
  })

  it("lets a temporary lighting preview override the automatic time", () => {
    const resolveCityTimeOfDay = (cityRules as typeof cityRules & {
      resolveCityTimeOfDay?: (date: Date, preview?: "auto" | "day" | "dusk" | "night") => string
    }).resolveCityTimeOfDay

    expect(resolveCityTimeOfDay?.(new Date("2026-08-30T12:00:00"), "night")).toBe("night")
    expect(resolveCityTimeOfDay?.(new Date("2026-08-30T22:00:00"), "day")).toBe("day")
  })

  it.each([
    [0, "planned"],
    [1, "started"],
    [3, "started"],
    [4, "growing"],
    [11, "growing"],
    [12, "established"],
    [100, "established"],
  ])("maps %i lifetime check-ins to %s", (count, stage) => {
    expect(deriveGrowthStage(count)).toBe(stage)
  })

  it("calculates local calendar distance without time-of-day drift", () => {
    expect(getDaysAgo("2026-08-20", new Date("2026-08-27T23:30:00"))).toBe(7)
    expect(getDaysAgo("2026-08-27", new Date("2026-08-27T00:05:00"))).toBe(0)
  })

  it("returns a Monday-first seven-day week", () => {
    expect(getWeekDateKeys(new Date("2026-08-27T12:00:00"))).toEqual([
      "2026-08-24",
      "2026-08-25",
      "2026-08-26",
      "2026-08-27",
      "2026-08-28",
      "2026-08-29",
      "2026-08-30",
    ])
  })

  it("places new habits on compact valid parcels without moving existing habits", () => {
    const existing = [{
      id: "read",
      name: "Read",
      district: "mind",
      buildingType: "library",
      targetPerWeek: 4,
      colorToken: "sky",
      status: "active",
      position: { x: 31.82, y: 31.82 },
      relatedHabitIds: [],
      createdAt: "2026-08-01T08:00:00.000Z",
      updatedAt: "2026-08-01T08:00:00.000Z",
    } satisfies Habit]

    const position = getStablePosition("body", existing)

    expect(isValidCityPlot(toWorldPosition(position), existing.map(({ position: stored }) => toWorldPosition(stored)))).toBe(true)
    expect(existing[0].position).toEqual({ x: 31.82, y: 31.82 })
  })
})

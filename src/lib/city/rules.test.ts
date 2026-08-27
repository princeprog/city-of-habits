import { describe, expect, it } from "vitest"

import { deriveGrowthStage, getDaysAgo, getWeekDateKeys } from "@/lib/city/rules"

describe("city growth projections", () => {
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
})

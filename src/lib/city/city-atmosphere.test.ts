import { describe, expect, it } from "vitest"

import { getCityLightingProfile } from "@/lib/city/city-atmosphere"

describe("city lighting profiles", () => {
  it("layers activity over the time-of-day palette", () => {
    const day = getCityLightingProfile({ timeOfDay: "day", activity: "steady" })
    const lively = getCityLightingProfile({ timeOfDay: "day", activity: "lively" })
    const night = getCityLightingProfile({ timeOfDay: "night", activity: "steady" })

    expect(lively.ambientIntensity).toBeGreaterThan(day.ambientIntensity)
    expect(lively.activityMotion).toBe(true)
    expect(night.skyColor).not.toBe(day.skyColor)
    expect(night.windowIntensity).toBeGreaterThan(day.windowIntensity)
  })

  it("keeps rainy night cool while retaining rain and readable lights", () => {
    const profile = getCityLightingProfile({ timeOfDay: "night", activity: "rainy" })

    expect(profile.isRainy).toBe(true)
    expect(profile.terrainColor).not.toBe(getCityLightingProfile({ timeOfDay: "night", activity: "steady" }).terrainColor)
    expect(profile.windowIntensity).toBeGreaterThan(0)
  })

  it("reduces activity without removing readable night lighting", () => {
    const quiet = getCityLightingProfile({ timeOfDay: "night", activity: "quiet" })
    const steady = getCityLightingProfile({ timeOfDay: "night", activity: "steady" })

    expect(quiet.ambientIntensity).toBeLessThan(steady.ambientIntensity)
    expect(quiet.windowIntensity).toBeGreaterThan(0)
    expect(quiet.activityMotion).toBe(false)
  })
})

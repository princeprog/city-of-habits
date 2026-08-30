import { describe, expect, it } from "vitest"

import { getBridgeGeometryProfile } from "@/lib/city/bridge-geometry"

describe("bridge geometry profile", () => {
  it("makes the established bridge read as an arched civic crossing", () => {
    const profile = getBridgeGeometryProfile(3, 2)

    expect(profile.hasArch).toBe(true)
    expect(profile.hasWaterClearance).toBe(true)
    expect(profile.abutmentCount).toBe(2)
    expect(profile.deckLength).toBeGreaterThan(profile.deckWidth)
    expect(profile.railPostCount).toBe(5)
    expect(profile.lampCount).toBe(4)
  })

  it("reveals the bridge in readable stages without changing its footprint", () => {
    const planned = getBridgeGeometryProfile(0, 0)
    const started = getBridgeGeometryProfile(1, 0)
    const growing = getBridgeGeometryProfile(2, 1)
    const established = getBridgeGeometryProfile(3, 1)

    expect(planned.hasArch).toBe(false)
    expect(planned.abutmentCount).toBe(2)
    expect(started.hasArch).toBe(true)
    expect(started.hasWaterClearance).toBe(true)
    expect(growing.railPostCount).toBeGreaterThan(started.railPostCount)
    expect(established.deckLength).toBeGreaterThanOrEqual(growing.deckLength)
    expect(established.lampCount).toBe(4)
    expect(new Set([planned.plotSize, started.plotSize, growing.plotSize, established.plotSize]).size).toBe(1)
  })
})

import { describe, expect, it } from "vitest"

import { getCityRenderQuality } from "@/lib/city/city-quality"

describe("getCityRenderQuality", () => {
  it("uses the full SimCity presentation on large screens", () => {
    expect(getCityRenderQuality({ width: 1440, devicePixelRatio: 2 })).toEqual({
      tier: "desktop",
      pixelRatio: 1.5,
      shadows: true,
      decorationLimit: 42,
    })
  })

  it("reduces effects on mobile and honors reduced motion", () => {
    expect(getCityRenderQuality({
      width: 390,
      devicePixelRatio: 3,
      prefersReducedMotion: true,
    })).toEqual({
      tier: "mobile",
      pixelRatio: 1,
      shadows: false,
      decorationLimit: 12,
    })
  })

  it("keeps an in-between budget for tablet widths", () => {
    expect(getCityRenderQuality({ width: 800, devicePixelRatio: 1 })).toEqual({
      tier: "tablet",
      pixelRatio: 1,
      shadows: false,
      decorationLimit: 24,
    })
  })
})

import { describe, expect, it } from "vitest"

import {
  getBrowserCityRenderQuality,
  getCityRenderQuality,
} from "@/lib/city/city-quality"

describe("getCityRenderQuality", () => {
  it("uses the full SimCity presentation on large screens", () => {
    expect(getCityRenderQuality({ width: 1440, devicePixelRatio: 2 })).toEqual({
      tier: "desktop",
      pixelRatio: 1.5,
      shadows: true,
      damping: true,
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
      damping: false,
      decorationLimit: 12,
    })
  })

  it("keeps an in-between budget for tablet widths", () => {
    expect(getCityRenderQuality({ width: 800, devicePixelRatio: 1 })).toEqual({
      tier: "tablet",
      pixelRatio: 1,
      shadows: false,
      damping: true,
      decorationLimit: 24,
    })
  })

  it("reads the browser snapshot before the first canvas render", () => {
    const originalWidth = window.innerWidth
    const originalDevicePixelRatio = window.devicePixelRatio
    const originalMatchMedia = window.matchMedia

    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 })
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 3 })
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({ matches: true }) as MediaQueryList,
    })

    expect(getBrowserCityRenderQuality()).toEqual({
      tier: "mobile",
      pixelRatio: 1,
      shadows: false,
      damping: false,
      decorationLimit: 12,
    })

    Object.defineProperty(window, "innerWidth", { configurable: true, value: originalWidth })
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: originalDevicePixelRatio })
    Object.defineProperty(window, "matchMedia", { configurable: true, value: originalMatchMedia })
  })
})

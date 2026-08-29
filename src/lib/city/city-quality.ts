export type CityRenderTier = "mobile" | "tablet" | "desktop"

export interface CityRenderQuality {
  tier: CityRenderTier
  pixelRatio: number
  shadows: boolean
  damping: boolean
  decorationLimit: number
}

export function getCityRenderQuality({
  width,
  devicePixelRatio = 1,
  prefersReducedMotion = false,
}: {
  width: number
  devicePixelRatio?: number
  prefersReducedMotion?: boolean
}): CityRenderQuality {
  if (width < 640) {
    return {
      tier: "mobile",
      pixelRatio: 1,
      shadows: false,
      damping: false,
      decorationLimit: 12,
    }
  }

  if (width < 1024) {
    return {
      tier: "tablet",
      pixelRatio: Math.min(1.25, Math.max(1, devicePixelRatio)),
      shadows: false,
      damping: !prefersReducedMotion,
      decorationLimit: 24,
    }
  }

  return {
    tier: "desktop",
    pixelRatio: Math.min(1.5, Math.max(1, devicePixelRatio)),
    shadows: !prefersReducedMotion,
    damping: !prefersReducedMotion,
    decorationLimit: 42,
  }
}

export function getBrowserCityRenderQuality(): CityRenderQuality {
  if (typeof window === "undefined") {
    return getCityRenderQuality({ width: 1024, devicePixelRatio: 1 })
  }

  return getCityRenderQuality({
    width: window.innerWidth,
    devicePixelRatio: window.devicePixelRatio,
    prefersReducedMotion:
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  })
}

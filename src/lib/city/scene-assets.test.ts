import { describe, expect, it } from "vitest"

import {
  CITY_MODEL_PATHS,
  getBuildingModelPath,
  getDecorationModelPath,
} from "@/lib/city/scene-assets"

describe("city scene assets", () => {
  it("keeps every building type on a local curated model", () => {
    expect(Object.keys(CITY_MODEL_PATHS.buildings)).toEqual([
      "park",
      "library",
      "workshop",
      "bridge",
      "tower",
      "lighthouse",
    ])

    expect(getBuildingModelPath("tower", 0)).toBe(
      "/models/city/commercial/building-skyscraper-c.glb",
    )
    expect(getBuildingModelPath("tower", 1)).toBe(
      "/models/city/commercial/building-j.glb",
    )
    expect(getBuildingModelPath("tower", 4)).toBe(
      "/models/city/commercial/building-skyscraper-c.glb",
    )
  })

  it("exposes only same-origin decoration paths", () => {
    expect(getDecorationModelPath("tree-large")).toBe(
      "/models/city/suburban/tree-large.glb",
    )
    const paths = [
      ...Object.values(CITY_MODEL_PATHS.buildings).flat(),
      ...Object.values(CITY_MODEL_PATHS.decorations),
    ]
    expect(
      paths.every((path) =>
        /^\/models\/city\/(commercial|industrial|roads|suburban)\/.+\.glb$/.test(path),
      ),
    ).toBe(true)
  })
})

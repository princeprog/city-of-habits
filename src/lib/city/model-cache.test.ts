import { describe, expect, it } from "vitest"

import {
  CITY_MODEL_CACHE_NAME,
  isCityModelRequest,
} from "@/lib/city/model-cache"

describe("city model caching", () => {
  it("recognizes only same-origin city model and texture paths", () => {
    const origin = "https://example.test"
    expect(isCityModelRequest(new URL("https://example.test/models/city/suburban/tree.glb"), origin)).toBe(true)
    expect(isCityModelRequest(new URL("https://example.test/models/city/suburban/tree.glb?rev=1"), origin)).toBe(true)
    expect(isCityModelRequest(new URL("https://example.test/models/city/suburban/Textures/colormap.png"), origin)).toBe(true)
    expect(isCityModelRequest(new URL("https://example.test/models/city/tree.png"), origin)).toBe(false)
    expect(isCityModelRequest(new URL("https://example.test/models/city/suburban/Textures/other.png"), origin)).toBe(false)
    expect(isCityModelRequest(new URL("https://example.test/models/other/tree.glb"), origin)).toBe(false)
    expect(isCityModelRequest(new URL("https://cdn.example.test/models/city/tree.glb"), origin)).toBe(false)
  })

  it("uses a versioned bounded cache name", () => {
    expect(CITY_MODEL_CACHE_NAME).toBe("city-3d-models-v1")
  })
})

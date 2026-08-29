import { describe, expect, it } from "vitest"

import {
  habitCreationDefaults,
  habitCreationSchema,
} from "@/components/habit/habit-creation"

describe("habit creation contract", () => {
  it("provides safe defaults for a new foundation", () => {
    expect(habitCreationDefaults).toEqual({
      name: "",
      district: "mind",
      buildingType: "library",
      targetPerWeek: 4,
      colorToken: "sky",
      intention: "",
    })
  })

  it("rejects an empty habit name and accepts a complete foundation", () => {
    expect(habitCreationSchema.safeParse(habitCreationDefaults).success).toBe(false)
    expect(
      habitCreationSchema.safeParse({
        ...habitCreationDefaults,
        name: "Read before bed",
      }).success,
    ).toBe(true)
  })
})

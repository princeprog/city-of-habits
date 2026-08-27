import type { BuildingType, DistrictId } from "@/types/city"

export const districtCatalog: Record<
  DistrictId,
  {
    name: string
    shortName: string
    description: string
    building: BuildingType
    token: string
    icon: string
  }
> = {
  body: {
    name: "Body",
    shortName: "Body",
    description: "Movement, nutrition, health, and physical care.",
    building: "park",
    token: "--chart-5",
    icon: "✦",
  },
  mind: {
    name: "Mind",
    shortName: "Mind",
    description: "Learning, reading, focus, and reflection.",
    building: "library",
    token: "--chart-4",
    icon: "◇",
  },
  creative: {
    name: "Creative",
    shortName: "Create",
    description: "Making, drawing, coding, music, and experiments.",
    building: "workshop",
    token: "--chart-1",
    icon: "✳",
  },
  connection: {
    name: "Connection",
    shortName: "Connect",
    description: "Friends, family, communication, and community.",
    building: "bridge",
    token: "--chart-2",
    icon: "⌁",
  },
  work: {
    name: "Work",
    shortName: "Work",
    description: "Professional practice, planning, and deep work.",
    building: "tower",
    token: "--primary",
    icon: "▥",
  },
  recovery: {
    name: "Recovery",
    shortName: "Recover",
    description: "Sleep, rest, quiet, and emotional reset.",
    building: "lighthouse",
    token: "--chart-3",
    icon: "○",
  },
}

export const buildingCatalog: Record<
  BuildingType,
  { name: string; description: string; shape: string }
> = {
  park: {
    name: "Park",
    description: "A green place for movement and care.",
    shape: "park",
  },
  library: {
    name: "Library",
    description: "A quiet place for ideas and attention.",
    shape: "library",
  },
  workshop: {
    name: "Workshop",
    description: "A practical place to make, test, and tinker.",
    shape: "workshop",
  },
  bridge: {
    name: "Bridge",
    description: "A path toward people and shared moments.",
    shape: "bridge",
  },
  tower: {
    name: "Tower",
    description: "A visible marker for focused practice.",
    shape: "tower",
  },
  lighthouse: {
    name: "Lighthouse",
    description: "A steady signal for rest and reset.",
    shape: "lighthouse",
  },
}

export const moodLabels = {
  low: "Low",
  steady: "Steady",
  good: "Good",
  energized: "Energized",
} as const

export const colorTokens = [
  "coral",
  "teal",
  "gold",
  "sky",
  "moss",
  "blue",
] as const

export type ColorToken = (typeof colorTokens)[number]

export const sampleHabits = [
  {
    id: "sample-reading",
    name: "Read for 20 minutes",
    district: "mind" as const,
    buildingType: "library" as const,
    targetPerWeek: 4,
    colorToken: "sky",
    intention: "Make a little room for ideas every day.",
    status: "active" as const,
    position: { x: 25, y: 28 },
    relatedHabitIds: ["sample-journal"],
    createdAt: "2026-01-02T08:00:00.000Z",
    updatedAt: "2026-08-20T08:00:00.000Z",
  },
  {
    id: "sample-feature",
    name: "Build one feature",
    district: "creative" as const,
    buildingType: "workshop" as const,
    targetPerWeek: 3,
    colorToken: "coral",
    intention: "Leave a trace of making behind.",
    status: "active" as const,
    position: { x: 55, y: 24 },
    relatedHabitIds: [],
    createdAt: "2026-01-12T08:00:00.000Z",
    updatedAt: "2026-08-21T08:00:00.000Z",
  },
  {
    id: "sample-family",
    name: "Call my family",
    district: "connection" as const,
    buildingType: "bridge" as const,
    targetPerWeek: 2,
    colorToken: "gold",
    intention: "Keep the bridge warm.",
    status: "active" as const,
    position: { x: 72, y: 51 },
    relatedHabitIds: [],
    createdAt: "2026-02-01T08:00:00.000Z",
    updatedAt: "2026-08-18T08:00:00.000Z",
  },
  {
    id: "sample-sleep",
    name: "Sleep before 11:00",
    district: "recovery" as const,
    buildingType: "lighthouse" as const,
    targetPerWeek: 5,
    colorToken: "blue",
    intention: "Let the city switch off gently.",
    status: "active" as const,
    position: { x: 29, y: 69 },
    relatedHabitIds: [],
    createdAt: "2026-01-05T08:00:00.000Z",
    updatedAt: "2026-08-21T08:00:00.000Z",
  },
  {
    id: "sample-walk",
    name: "Go for a walk",
    district: "body" as const,
    buildingType: "park" as const,
    targetPerWeek: 3,
    colorToken: "moss",
    intention: "Notice the street outside.",
    status: "active" as const,
    position: { x: 73, y: 77 },
    relatedHabitIds: ["sample-sleep"],
    createdAt: "2026-02-08T08:00:00.000Z",
    updatedAt: "2026-08-19T08:00:00.000Z",
  },
  {
    id: "sample-journal",
    name: "Write three lines",
    district: "mind" as const,
    buildingType: "library" as const,
    targetPerWeek: 3,
    colorToken: "teal",
    intention: "Leave a small note for tomorrow.",
    status: "paused" as const,
    position: { x: 43, y: 42 },
    relatedHabitIds: ["sample-reading"],
    createdAt: "2026-02-20T08:00:00.000Z",
    updatedAt: "2026-08-15T08:00:00.000Z",
  },
] as const

export const sampleCheckIns = [
  ...Array.from({ length: 16 }, (_, index) => ({
    id: `sample-reading-${index}`,
    habitId: "sample-reading",
    localDate: `2026-08-${String(21 - (index % 18)).padStart(2, "0")}`,
    completedAt: `2026-08-${String(21 - (index % 18)).padStart(2, "0")}T08:00:00.000Z`,
    note: index === 0 ? "A little more focused after reading." : undefined,
    mood: index % 3 === 0 ? ("good" as const) : ("steady" as const),
  })),
  ...Array.from({ length: 9 }, (_, index) => ({
    id: `sample-feature-${index}`,
    habitId: "sample-feature",
    localDate: `2026-08-${String(20 - (index % 14)).padStart(2, "0")}`,
    completedAt: `2026-08-${String(20 - (index % 14)).padStart(2, "0")}T10:00:00.000Z`,
  })),
  ...Array.from({ length: 7 }, (_, index) => ({
    id: `sample-family-${index}`,
    habitId: "sample-family",
    localDate: `2026-08-${String(18 - (index % 12)).padStart(2, "0")}`,
    completedAt: `2026-08-${String(18 - (index % 12)).padStart(2, "0")}T18:00:00.000Z`,
  })),
] as const

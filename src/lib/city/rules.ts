import type {
  CheckIn,
  CityElement,
  CityPosition,
  DistrictId,
  GrowthStage,
  Habit,
  CityActivity,
  CityTimeOfDay,
  CityTimePreview,
} from "@/types/city"
import { getCompactHabitPosition } from "@/lib/city/city-layout"

export function makeId(prefix = "city") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function parseLocalDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function getDaysAgo(dateKey: string, today = new Date()) {
  const todayDate = parseLocalDate(getLocalDateKey(today))
  const date = parseLocalDate(dateKey)
  return Math.floor((todayDate.getTime() - date.getTime()) / 86_400_000)
}

export function deriveGrowthStage(checkInCount: number): GrowthStage {
  if (checkInCount === 0) return "planned"
  if (checkInCount <= 3) return "started"
  if (checkInCount <= 11) return "growing"
  return "established"
}

export function getHabitCheckIns(habitId: string, checkIns: CheckIn[]) {
  return checkIns
    .filter((checkIn) => checkIn.habitId === habitId)
    .sort((a, b) => b.localDate.localeCompare(a.localDate))
}

export function getLatestCheckIn(habitId: string, checkIns: CheckIn[]) {
  return getHabitCheckIns(habitId, checkIns)[0]
}

export function getHabitStage(habitId: string, checkIns: CheckIn[]) {
  return deriveGrowthStage(getHabitCheckIns(habitId, checkIns).length)
}

export function getAtmosphere(habits: Habit[], checkIns: CheckIn[]) {
  if (!habits.length) return "clear" as const
  const latest = checkIns
    .filter((checkIn) => habits.some((habit) => habit.id === checkIn.habitId))
    .sort((a, b) => b.localDate.localeCompare(a.localDate))[0]

  if (!latest) return "quiet" as const
  const daysAgo = getDaysAgo(latest.localDate)
  if (daysAgo <= 0) return "lively" as const
  if (daysAgo <= 2) return "steady" as const
  if (daysAgo <= 6) return "quiet" as const
  return "rainy" as const
}

export function resolveCityTimeOfDay(
  date = new Date(),
  preview: CityTimePreview = "auto",
): CityTimeOfDay {
  if (preview !== "auto") return preview

  const minutes = date.getHours() * 60 + date.getMinutes()
  if (minutes >= 17 * 60 && minutes < 20 * 60) return "dusk"
  if (minutes >= 6 * 60 && minutes < 17 * 60) return "day"
  return "night"
}

export function getCityVisualState(
  activity: CityActivity,
  date = new Date(),
  preview: CityTimePreview = "auto",
) {
  return {
    timeOfDay: resolveCityTimeOfDay(date, preview),
    activity,
  } as const
}

export function getWeekStart(date = new Date()) {
  const start = new Date(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  return getLocalDateKey(start)
}

export function getWeekDateKeys(date = new Date()) {
  const start = parseLocalDate(getWeekStart(date))
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start)
    current.setDate(start.getDate() + index)
    return getLocalDateKey(current)
  })
}

export function getWeeklyCheckInCount(
  habitId: string,
  checkIns: CheckIn[],
  date = new Date()
) {
  const dates = new Set(getWeekDateKeys(date))
  return checkIns.filter(
    (checkIn) => checkIn.habitId === habitId && dates.has(checkIn.localDate)
  ).length
}

export function getDistrictCounts(habits: Habit[]) {
  return habits.reduce<Record<DistrictId, number>>(
    (counts, habit) => {
      counts[habit.district] += 1
      return counts
    },
    {
      body: 0,
      mind: 0,
      creative: 0,
      connection: 0,
      work: 0,
      recovery: 0,
    }
  )
}

export function getStablePosition(
  district: DistrictId,
  habits: Habit[]
): CityPosition {
  return getCompactHabitPosition(district, habits)
}

export function projectCity(habits: Habit[], checkIns: CheckIn[]) {
  const elements: CityElement[] = []

  habits.forEach((habit) => {
    const habitCheckIns = getHabitCheckIns(habit.id, checkIns)
    const stage = deriveGrowthStage(habitCheckIns.length)
    elements.push({
      id: `building-${habit.id}`,
      kind: "building",
      sourceHabitId: habit.id,
      stage: ["planned", "started", "growing", "established"].indexOf(stage),
      position: habit.position,
      styleKey: `${habit.district}-${habit.buildingType}-${habit.colorToken}`,
      label: habit.name,
    })

    if (habitCheckIns.length >= 7) {
      elements.push({
        id: `landmark-${habit.id}`,
        kind: "landmark",
        sourceHabitId: habit.id,
        stage: habitCheckIns.length >= 30 ? 2 : habitCheckIns.length >= 15 ? 1 : 0,
        position: { x: Math.min(92, habit.position.x + 5), y: Math.max(10, habit.position.y - 8) },
        styleKey: "milestone",
        label: `${habit.name} landmark`,
      })
    }
  })

  const seenPaths = new Set<string>()
  habits.forEach((habit) => {
    habit.relatedHabitIds.forEach((relatedId) => {
      const related = habits.find((candidate) => candidate.id === relatedId)
      if (!related) return
      const key = [habit.id, related.id].sort().join(":")
      if (seenPaths.has(key)) return
      seenPaths.add(key)
      elements.push({
        id: `path-${key}`,
        kind: "path",
        sourceHabitIds: [habit.id, related.id],
        stage: 1,
        position: {
          x: (habit.position.x + related.position.x) / 2,
          y: (habit.position.y + related.position.y) / 2,
        },
        styleKey: "connection",
      })
    })
  })

  return elements
}

export function getMilestoneCount(habitId: string, checkIns: CheckIn[]) {
  const count = getHabitCheckIns(habitId, checkIns).length
  return [7, 30, 100].filter((milestone) => count >= milestone).length
}

export function getMostRecentDate(checkIns: CheckIn[]) {
  return checkIns
    .map((checkIn) => checkIn.localDate)
    .sort((a, b) => b.localeCompare(a))[0]
}

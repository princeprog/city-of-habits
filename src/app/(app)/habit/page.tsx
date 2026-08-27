import type { Metadata } from "next"

import { HabitDetailPage } from "@/components/habit/habit-detail"

export const metadata: Metadata = {
  title: "Habit detail",
  robots: { index: false, follow: false },
}

export default function HabitPage() {
  return <HabitDetailPage />
}

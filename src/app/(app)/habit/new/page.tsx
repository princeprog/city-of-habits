import type { Metadata } from "next"

import { HabitForm } from "@/components/habit/habit-form"

export const metadata: Metadata = {
  title: "Build a habit",
  robots: { index: false, follow: false },
}

export default function NewHabitPage() {
  return <HabitForm />
}

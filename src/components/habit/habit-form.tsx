"use client"

import { useRouter } from "next/navigation"

import { HabitWizard } from "@/components/habit/habit-wizard"
import { Card } from "@/components/ui/card"
import { useCityStore } from "@/stores/city-store"

export function HabitForm() {
  const router = useRouter()
  const addHabit = useCityStore((state) => state.addHabit)

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
      <Card className="mx-auto max-w-3xl overflow-hidden">
        <HabitWizard
          onCreate={addHabit}
          onCreated={(habit) => router.push(`/habit?id=${habit.id}`)}
          onCancel={() => router.push("/city")}
        />
      </Card>
    </div>
  )
}

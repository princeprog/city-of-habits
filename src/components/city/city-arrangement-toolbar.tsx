"use client"

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Move3D,
  Save,
  Sparkles,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Habit } from "@/types/city"

export type CityNudgeDirection = "north" | "east" | "south" | "west"

interface CityArrangementToolbarProps {
  habits: Habit[]
  selectedHabitId?: string
  dirty: boolean
  saving: boolean
  onSelectHabit: (habitId: string) => void
  onNudge: (direction: CityNudgeDirection) => void
  onAutoArrange: () => void
  onCancel: () => void
  onSave: () => void
}

export function CityArrangementToolbar({
  habits,
  selectedHabitId,
  dirty,
  saving,
  onSelectHabit,
  onNudge,
  onAutoArrange,
  onCancel,
  onSave,
}: CityArrangementToolbarProps) {
  const items = habits.map((habit) => ({ label: habit.name, value: habit.id }))

  return (
    <Card size="sm" className="w-full max-w-4xl" aria-label="City arrangement controls">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Move3D aria-hidden="true" />
          Arrange city
        </CardTitle>
        <Badge variant="secondary">Arrange mode</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Select
          items={items}
          value={selectedHabitId ?? null}
          onValueChange={(value) => {
            if (value) onSelectHabit(value)
          }}
        >
          <SelectTrigger aria-label="Building to arrange" className="w-full lg:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <ButtonGroup aria-label="Move selected building">
            <Button variant="outline" size="icon" aria-label="Move building north" onClick={() => onNudge("north")} disabled={!selectedHabitId || saving}>
              <ArrowUp />
            </Button>
            <Button variant="outline" size="icon" aria-label="Move building west" onClick={() => onNudge("west")} disabled={!selectedHabitId || saving}>
              <ArrowLeft />
            </Button>
            <Button variant="outline" size="icon" aria-label="Move building east" onClick={() => onNudge("east")} disabled={!selectedHabitId || saving}>
              <ArrowRight />
            </Button>
            <Button variant="outline" size="icon" aria-label="Move building south" onClick={() => onNudge("south")} disabled={!selectedHabitId || saving}>
              <ArrowDown />
            </Button>
          </ButtonGroup>
          <Button variant="outline" onClick={onAutoArrange} disabled={habits.length === 0 || saving} aria-label="Auto-arrange city">
            <Sparkles data-icon="inline-start" />
            Auto-arrange
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={saving} aria-label="Cancel arrangement">
            <X data-icon="inline-start" />
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!dirty || saving} aria-label="Save arrangement">
            <Save data-icon="inline-start" />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

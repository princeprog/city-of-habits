"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowUpRight,
  ChartNoAxesColumn,
  Check,
  LocateFixed,
  Minus,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  Settings,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { CityMap } from "@/components/city/city-map"
import { BuildingIllustration } from "@/components/city/building-illustration"
import { HabitCreationDialog, useHabitCreation } from "@/components/habit/habit-creation-dialog"
import type {
  CityMapCommand,
  CityMapCommandAction,
} from "@/components/city/city-3d-map"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { districtCatalog } from "@/lib/city/catalog"
import {
  getAtmosphere,
  getHabitCheckIns,
  getHabitStage,
  getLocalDateKey,
  getWeeklyCheckInCount,
} from "@/lib/city/rules"
import { useCityStore } from "@/stores/city-store"
import type { DistrictId, Habit } from "@/types/city"

const City3DMap = dynamic(
  () => import("@/components/city/city-3d-map").then((module) => module.City3DMap),
  { ssr: false, loading: () => <CityMapLoading /> },
)

const stageIndex = ["planned", "started", "growing", "established"] as const

const atmosphereCopy = {
  clear: "A clear plot",
  lively: "Lively today",
  steady: "Steady today",
  quiet: "A quieter day",
  rainy: "Rain over the city",
} as const

const districtOrder = Object.keys(districtCatalog) as DistrictId[]

export function CityDashboard() {
  const router = useRouter()
  const { openCreateHabit } = useHabitCreation()
  const { habits, checkIns, hydrated, hydrate, loadSampleCity, toggleCheckIn } = useCityStore()
  const [district, setDistrict] = useState<"all" | DistrictId>("all")
  const [query, setQuery] = useState("")
  const [selectedHabitId, setSelectedHabitId] = useState<string>()
  const mapCommandId = useRef(0)
  const [mapCommand, setMapCommand] = useState<CityMapCommand>()

  useEffect(() => {
    if (!hydrated) void hydrate()
  }, [hydrate, hydrated])

  const selectedHabit = useMemo(
    () => habits.find((habit) => habit.id === selectedHabitId),
    [habits, selectedHabitId],
  )
  const today = getLocalDateKey()
  const activeHabits = habits.filter((habit) => habit.status === "active")
  const todayCount = activeHabits.filter((habit) =>
    getHabitCheckIns(habit.id, checkIns).some((checkIn) => checkIn.localDate === today),
  ).length
  const atmosphere = getAtmosphere(habits, checkIns)
  const atmosphereMeta = atmosphereCopy[atmosphere]

  const selectHabit = (habitId: string) => setSelectedHabitId(habitId)
  const issueMapCommand = (action: CityMapCommandAction) => {
    mapCommandId.current += 1
    setMapCommand({ id: mapCommandId.current, action })
  }

  const handleCheckIn = async (habit: Habit) => {
    const result = await toggleCheckIn(habit.id)
    toast(result ? "The building grew a little." : "Today's light was turned off.", {
      description: habit.name,
    })
  }

  const handleHabitCreated = (habit: Habit) => {
    setQuery("")
    setDistrict("all")
    setSelectedHabitId(habit.id)
    mapCommandId.current += 1
    setMapCommand({
      id: mapCommandId.current,
      action: "focus-habit",
      habitId: habit.id,
    })
  }

  if (!hydrated) return <CityDashboardSkeleton />

  return (
    <main
      className="flex h-svh min-h-svh flex-col overflow-hidden bg-[#edf1e8] text-[#1d2b24]"
      data-city-mode="immersive"
      data-city-query={query || undefined}
      data-city-district={district}
      data-city-selected-habit={selectedHabit?.name}
    >
      <header
        className="flex min-h-16 flex-wrap items-center gap-3 border-b bg-background px-3 py-3 md:h-16 md:flex-nowrap md:px-5"
        data-city-toolbar
      >
        <SidebarTrigger className="shrink-0" />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">My City</h1>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">A living map of your habits</p>
        </div>
        <Badge variant="secondary" className="hidden lg:inline-flex">{atmosphereMeta}</Badge>
        <div className="order-3 flex w-full items-center gap-2 md:order-none md:ml-auto md:w-auto">
          <form
            className="min-w-0 flex-1 md:w-56 lg:w-72"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <InputGroup>
              <InputGroupInput
                aria-label="Search habits"
                placeholder="Search habits"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              {query && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButtonClear onClear={() => setQuery("")} />
                </InputGroupAddon>
              )}
            </InputGroup>
          </form>
          <ButtonGroup aria-label="City header actions">
            <Button onClick={openCreateHabit}>
              <Plus data-icon="inline-start" />
              <span className="hidden sm:inline">Add habit</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="icon" aria-label="More city actions" />}
              >
                <MoreVertical />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push("/report")}>
                    <ChartNoAxesColumn />
                    Reports
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </div>
      </header>

      <section className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className="relative h-full min-h-0 w-full overflow-hidden bg-[#9ebd8e]"
          data-city-map-surface
          data-city-habit-count={habits.length}
        >
          <City3DMap
            className="absolute inset-0 rounded-none"
            habits={habits}
            checkIns={checkIns}
            selectedHabitId={selectedHabitId}
            query={query}
            district={district}
            onSelectHabit={selectHabit}
            mapCommand={mapCommand}
            fallback={
              <CityMap
                habits={habits}
                checkIns={checkIns}
                onSelectHabit={selectHabitByHabit(setSelectedHabitId)}
                className="h-full min-h-0 rounded-none border-0 shadow-none"
              />
            }
          />

          <div className="absolute left-4 top-4 z-10 w-[min(22rem,calc(100%-2rem))] md:left-5 md:top-5" data-city-status-card>
            <Card className="border-white/70 bg-white/95 shadow-lg backdrop-blur-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <ProgressRing value={activeHabits.length ? Math.round((todayCount / activeHabits.length) * 100) : 0} />
                  <div className="min-w-0">
                    <p className="text-base font-semibold tracking-tight">{habits.length ? "Your city is alive" : "Your city is a clear plot"}</p>
                    <p className="mt-1 text-sm text-[#69756d]">
                      {habits.length ? `${todayCount} of ${activeHabits.length} habits checked in today` : "Add a habit to place the first building."}
                    </p>
                  </div>
                </div>
                {habits.length ? (
                  <p className="mt-4 text-sm font-medium text-[#276d47]">
                    Select a building on the map to inspect its rhythm.
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={openCreateHabit} className="bg-[#276d47] text-white hover:bg-[#1d5a39]">
                      Add a habit
                      <Plus data-icon="inline-end" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void loadSampleCity()}>
                      Explore a sample city
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="absolute bottom-4 left-4 z-10 hidden flex-col gap-1 rounded-lg border border-white/70 bg-white/90 p-1 shadow-lg backdrop-blur-sm md:flex md:bottom-5 md:left-5" aria-label="District filters">
            <DistrictButton value="all" selected={district === "all"} onClick={() => setDistrict("all")} label="Show all districts" />
            {districtOrder.map((id) => (
              <DistrictButton
                key={id}
                value={id}
                selected={district === id}
                onClick={() => setDistrict(id)}
                label={`Show ${districtCatalog[id].name.toLocaleLowerCase()} district`}
              />
            ))}
          </div>

          {selectedHabit ? (
            <HabitInspector
              habit={selectedHabit}
              checkIns={checkIns}
              onClose={() => setSelectedHabitId(undefined)}
              onCheckIn={() => void handleCheckIn(selectedHabit)}
              onViewHabit={() => router.push(`/habit?id=${selectedHabit.id}`)}
            />
          ) : (
            <div className="pointer-events-none absolute bottom-5 right-5 z-10 hidden max-w-[15rem] text-right text-xs font-medium text-white drop-shadow-md lg:block">
              Select a building to see its habit and check-in rhythm.
            </div>
          )}

          <div className="pointer-events-auto absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-lg border border-white/70 bg-white/90 p-1 shadow-lg backdrop-blur-sm" aria-label="Map controls">
            <Button variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={() => issueMapCommand("zoom-in")}><Plus /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={() => issueMapCommand("zoom-out")}><Minus /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Center city" onClick={() => issueMapCommand("center")}><LocateFixed /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Reset map" onClick={() => issueMapCommand("reset")}><RotateCcw /></Button>
          </div>
        </div>
        <HabitCreationDialog onCreated={handleHabitCreated} />
      </section>
    </main>
  )
}

function InputGroupButtonClear({ onClear }: { onClear: () => void }) {
  return (
    <Button type="button" variant="ghost" size="icon-xs" aria-label="Clear search" onClick={onClear}>
      <X />
    </Button>
  )
}

function selectHabitByHabit(setSelectedHabitId: (id: string) => void) {
  return (habit: Habit) => setSelectedHabitId(habit.id)
}

function ProgressRing({ value }: { value: number }) {
  const radius = 25
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference
  return (
    <div className="relative size-16 shrink-0" aria-label={`${value}% of today's active habits completed`} role="img">
      <svg viewBox="0 0 64 64" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#e1eae0" strokeWidth="5" />
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#398253" strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums">{value}%</span>
    </div>
  )
}

function DistrictButton({
  value,
  selected,
  onClick,
  label,
}: {
  value: "all" | DistrictId
  selected: boolean
  onClick: () => void
  label: string
}) {
  const meta = value === "all" ? undefined : districtCatalog[value]
  return (
    <Button
      variant={selected ? "secondary" : "ghost"}
      size="icon-sm"
      aria-label={label}
      aria-pressed={selected}
      title={meta?.name ?? "All districts"}
      onClick={onClick}
      className={cn(selected && "bg-[#e7f0e3] text-[#276d47] hover:bg-[#e0ecdc]")}
    >
      <span className="text-xs font-semibold">{meta?.icon ?? "⌂"}</span>
    </Button>
  )
}

function HabitInspector({
  habit,
  checkIns,
  onClose,
  onCheckIn,
  onViewHabit,
}: {
  habit: Habit
  checkIns: ReturnType<typeof useCityStore.getState>["checkIns"]
  onClose: () => void
  onCheckIn: () => void
  onViewHabit: () => void
}) {
  const today = getLocalDateKey()
  const habitCheckIns = getHabitCheckIns(habit.id, checkIns)
  const isDone = habitCheckIns.some((checkIn) => checkIn.localDate === today)
  const stage = getHabitStage(habit.id, checkIns)
  const weeklyCount = getWeeklyCheckInCount(habit.id, checkIns)
  const weekKeys = ["M", "T", "W", "T", "F", "S", "S"]

  return (
    <aside className="absolute inset-x-4 bottom-4 z-20 max-h-[calc(100%-2rem)] overflow-auto md:inset-x-auto md:right-5 md:top-5 md:bottom-auto md:w-[19rem]" aria-label={`${habit.name} habit inspector`}>
      <Card className="border-white/70 bg-white/95 shadow-xl backdrop-blur-sm">
        <CardHeader className="gap-3 border-b border-[#e5ebe2] p-4">
          <div className="flex items-start gap-3">
            <BuildingIllustration type={habit.buildingType} stage={stageIndex.indexOf(stage)} color={habit.colorToken} status={habit.status} size={48} />
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-lg"><h2>{habit.name}</h2></CardTitle>
              <CardDescription>{districtCatalog[habit.district].name} district · {stage}</CardDescription>
            </div>
            <Button variant="ghost" size="icon-sm" aria-label="Close habit inspector" onClick={onClose}><X /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-[#68766d]">Established</p><p className="mt-1 font-medium">{new Date(habit.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p></div>
            <div><p className="text-xs text-[#68766d]">Lifetime check-ins</p><p className="mt-1 font-medium">{habitCheckIns.length}</p></div>
          </div>
          <div className="rounded-lg border border-[#e0e9dd] bg-[#f8fbf6] p-3">
            <div className="flex items-center justify-between text-xs text-[#68766d]"><span>Weekly rhythm</span><span className="font-medium text-[#1d2b24]">{weeklyCount}/{habit.targetPerWeek}</span></div>
            <Progress value={Math.min(100, Math.round((weeklyCount / habit.targetPerWeek) * 100))} className="mt-2 h-1.5" aria-label={`${weeklyCount} of ${habit.targetPerWeek} weekly check-ins`} />
            <div className="mt-3 grid grid-cols-7 gap-1">
              {weekKeys.map((day, index) => <span key={`${day}-${index}`} className={cn("flex size-6 items-center justify-center rounded-full border text-[10px] font-medium", index < weeklyCount ? "border-[#398253] bg-[#398253] text-white" : "border-[#dce5d9] text-[#829086]")} aria-label={`${day} ${index < weeklyCount ? "checked in" : "not checked in"}`}>{index < weeklyCount ? <Check className="size-3" /> : day}</span>)}
            </div>
          </div>
          {habit.intention && <p className="text-sm leading-6 text-[#54635a]">“{habit.intention}”</p>}
          <div className="grid gap-2">
            <Button className="w-full bg-[#398253] text-white hover:bg-[#2f7047]" onClick={onCheckIn} aria-label={isDone ? "Undo today's check-in" : "Check in today"}>
              {isDone ? <Check data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
              {isDone ? "Checked in today" : "Check in today"}
            </Button>
            <Button variant="outline" className="w-full border-[#d6e1d3]" onClick={onViewHabit}>View habit <ArrowUpRight data-icon="inline-end" /></Button>
          </div>
          <p className="text-center text-[11px] text-[#718077]">Local to this browser · no account required</p>
        </CardContent>
      </Card>
    </aside>
  )
}

function CityMapLoading() {
  return <div className="flex h-full min-h-0 items-center justify-center bg-[#a7c498] text-sm font-medium text-white/90">Opening your city…</div>
}

function CityDashboardSkeleton() {
  return (
    <main className="min-h-svh bg-[#edf1e8] p-4" data-city-mode="immersive">
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] max-w-[1800px] flex-col gap-4 rounded-xl border border-[#dce5d9] bg-white/60 p-4">
        <div className="h-12 animate-pulse rounded-lg bg-[#e3ece0]" />
        <div className="flex-1 animate-pulse rounded-xl bg-[#c2d5b3]" />
      </div>
    </main>
  )
}

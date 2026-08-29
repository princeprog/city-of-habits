"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  LocateFixed,
  Minus,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { CityMap } from "@/components/city/city-map"
import { BuildingIllustration } from "@/components/city/building-illustration"
import type {
  CityMapCommand,
  CityMapCommandAction,
} from "@/components/city/city-3d-map"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  clear: { label: "A clear plot", description: "Your first foundation is waiting." },
  lively: { label: "Lively today", description: "Your recent check-ins are lighting the streets." },
  steady: { label: "Steady today", description: "The city is holding its shape." },
  quiet: { label: "A quieter day", description: "The buildings are still here when you return." },
  rainy: { label: "Rain over the city", description: "Progress stays built through quiet days." },
} as const

const districtOrder = Object.keys(districtCatalog) as DistrictId[]

export function CityDashboard() {
  const router = useRouter()
  const browseRef = useRef<HTMLDivElement>(null)
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
  const weeklyTarget = activeHabits.reduce((sum, habit) => sum + habit.targetPerWeek, 0)
  const weeklyProgress = activeHabits.reduce(
    (sum, habit) => sum + getWeeklyCheckInCount(habit.id, checkIns),
    0,
  )
  const progressValue = weeklyTarget ? Math.min(100, Math.round((weeklyProgress / weeklyTarget) * 100)) : 0
  const atmosphere = getAtmosphere(habits, checkIns)
  const atmosphereMeta = atmosphereCopy[atmosphere]

  const selectHabit = (habitId: string) => setSelectedHabitId(habitId)
  const issueMapCommand = (action: CityMapCommandAction) => {
    mapCommandId.current += 1
    setMapCommand({ id: mapCommandId.current, action })
  }
  const scrollToBuildings = () => browseRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })

  const handleCheckIn = async (habit: Habit) => {
    const result = await toggleCheckIn(habit.id)
    toast(result ? "The building grew a little." : "Today's light was turned off.", {
      description: habit.name,
    })
  }

  if (!hydrated) return <CityDashboardSkeleton />

  return (
    <main
      className="min-h-svh overflow-x-hidden bg-[#edf1e8] text-[#1d2b24]"
      data-city-mode="immersive"
      data-city-query={query || undefined}
      data-city-district={district}
    >
      <header
        className="flex min-h-16 flex-wrap items-center gap-3 border-b border-[#dce5d9] bg-white/95 px-3 py-3 backdrop-blur md:h-16 md:flex-nowrap md:px-5"
        data-city-toolbar
      >
        <SidebarTrigger className="shrink-0" />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">My City</h1>
          <p className="truncate text-xs text-[#68766d] sm:text-sm">A living map of your habits</p>
        </div>
        <Badge variant="outline" className="hidden border-[#d7e4d7] bg-[#f3f8f0] text-[#277047] lg:inline-flex">
          <span className="size-1.5 rounded-full bg-[#4d925d]" aria-hidden="true" />
          {atmosphereMeta.label}
        </Badge>
        <div className="order-3 flex w-full items-center gap-2 md:order-none md:ml-auto md:w-auto">
          <form
            className="min-w-0 flex-1 md:w-56 lg:w-72"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <InputGroup className="h-10 border-[#d8dfd7] bg-white shadow-none">
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search habits"
                placeholder="Search habits"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButtonClear onClear={() => setQuery("")} />
                </InputGroupAddon>
              )}
            </InputGroup>
          </form>
          <Link href="/habit/new" className={cn(buttonVariants({ size: "lg" }), "h-10 bg-[#276d47] px-3 text-white hover:bg-[#1d5a39]") }>
            <Plus data-icon="inline-start" />
            <span className="hidden sm:inline">Add habit</span>
            <span className="sm:hidden">Add</span>
          </Link>
          <Button variant="outline" size="icon" aria-label="City actions" className="h-10 w-10 border-[#d8dfd7] bg-white">
            <MoreVertical />
          </Button>
        </div>
      </header>

      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col gap-3 p-3 md:gap-4 md:p-5">
        <div className="relative min-h-[36rem] flex-1 overflow-hidden rounded-xl border border-[#d4dfd0] bg-[#9ebd8e] shadow-sm md:min-h-[40rem]">
          <City3DMap
            className="absolute inset-0"
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
                className="h-full min-h-[36rem] rounded-xl border-0 shadow-none md:min-h-[40rem]"
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
                <button
                  type="button"
                  className="mt-4 flex w-full items-center justify-between text-left text-sm font-medium text-[#276d47] hover:text-[#1d5a39]"
                  onClick={scrollToBuildings}
                >
                  {habits.length ? "Browse today's buildings" : "Start building your city"}
                  <ChevronRight aria-hidden="true" className="size-4" />
                </button>
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

        <section ref={browseRef} className="rounded-xl border border-[#dce5d9] bg-white p-4 shadow-sm sm:p-5" aria-label="Browse buildings" data-building-list>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-tight">Browse buildings</p>
              <p className="mt-0.5 text-xs text-[#68766d]">Every building is a repeated action with a place in your city.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#68766d]">
              <span>{habits.length} {habits.length === 1 ? "building" : "buildings"}</span>
              <span aria-hidden="true">·</span>
              <span>{weeklyProgress}/{weeklyTarget || 0} this week</span>
            </div>
          </div>
          {habits.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {habits.map((habit) => {
                const isMatch = matchesCityFilter(habit, query, district)
                const habitCheckIns = getHabitCheckIns(habit.id, checkIns)
                const isDone = habitCheckIns.some((checkIn) => checkIn.localDate === today)
                const stage = getHabitStage(habit.id, checkIns)
                return (
                  <Button
                    key={habit.id}
                    type="button"
                    variant="outline"
                    aria-label={`${habit.name}, ${districtCatalog[habit.district].name} district`}
                    data-building-match={isMatch ? "match" : "dimmed"}
                    className={cn(
                      "h-auto justify-start gap-3 border-[#dce5d9] bg-[#fbfcfa] p-3 text-left hover:bg-[#f3f8f0]",
                      !isMatch && "opacity-45",
                    )}
                    onClick={() => selectHabit(habit.id)}
                  >
                    <BuildingIllustration type={habit.buildingType} stage={stageIndex.indexOf(stage)} color={habit.colorToken} status={habit.status} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{habit.name}</span>
                      <span className="mt-0.5 block truncate text-xs font-normal text-[#68766d]">{districtCatalog[habit.district].name} · {stage}</span>
                    </span>
                    {isDone ? <Check className="size-4 text-[#347a4d]" aria-label="Checked in today" /> : <span className="size-2 rounded-full bg-[#cfd8ce]" aria-hidden="true" />}
                  </Button>
                )
              })}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-start gap-3 rounded-lg border border-dashed border-[#cbdac8] bg-[#f7faf5] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Your city is ready for its first foundation.</p>
                <p className="mt-1 text-xs text-[#68766d]">Start with one repeatable action, or explore a local sample city.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/habit/new" className={buttonVariants({ size: "sm" })}>Add a habit <Plus data-icon="inline-end" /></Link>
                <Button size="sm" variant="outline" onClick={() => void loadSampleCity()}>Explore a sample city</Button>
              </div>
            </div>
          )}
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="This week" value={`${weeklyProgress}/${weeklyTarget || 0}`} detail="check-ins toward your rhythm" progress={progressValue} />
          <StatCard label="Atmosphere" value={atmosphereMeta.label} detail={atmosphereMeta.description} icon={<Sparkles />} />
          <StatCard label="Private by design" value="Local only" detail="Your city stays in this browser." icon={<CircleHelp />} />
        </div>
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

function matchesCityFilter(habit: Habit, query: string, district: "all" | DistrictId) {
  const normalized = query.trim().toLocaleLowerCase()
  const queryMatches = !normalized || habit.name.toLocaleLowerCase().includes(normalized) || habit.intention?.toLocaleLowerCase().includes(normalized)
  return Boolean(queryMatches) && (district === "all" || district === habit.district)
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

function StatCard({ label, value, detail, icon, progress }: { label: string; value: string; detail: string; icon?: React.ReactNode; progress?: number }) {
  return (
    <Card className="border-[#dce5d9] bg-white shadow-sm">
      <CardHeader className="gap-2 p-4">
        <div className="flex items-center justify-between gap-3"><CardDescription>{label}</CardDescription>{icon ? <span className="text-[#398253]">{icon}</span> : null}</div>
        <CardTitle className="text-base">{value}</CardTitle>
        {progress !== undefined && <Progress value={progress} aria-label={`${progress}% of weekly target`} />}
        <p className="text-xs font-normal text-[#68766d]">{detail}</p>
      </CardHeader>
    </Card>
  )
}

function CityMapLoading() {
  return <div className="flex h-full min-h-[36rem] items-center justify-center rounded-xl bg-[#a7c498] text-sm font-medium text-white/90">Opening your city…</div>
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

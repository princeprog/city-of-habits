"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowUpRight,
  ChartNoAxesColumn,
  Check,
  LocateFixed,
  Move3D,
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
import {
  CityArrangementToolbar,
  type CityNudgeDirection,
} from "@/components/city/city-arrangement-toolbar"
import { HabitCreationDialog, useHabitCreation } from "@/components/habit/habit-creation-dialog"
import type {
  CityMapCommand,
  CityMapCommandAction,
} from "@/components/city/city-3d-map"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { districtCatalog } from "@/lib/city/catalog"
import {
  CITY_PLOT_SPACING,
  findNearestValidPlot,
  getCompactArrangement,
  toStoredPosition,
  toWorldPosition,
} from "@/lib/city/city-layout"
import {
  getAtmosphere,
  getCityVisualState,
  getHabitCheckIns,
  getHabitStage,
  getLocalDateKey,
  getWeeklyCheckInCount,
} from "@/lib/city/rules"
import { useCityStore } from "@/stores/city-store"
import type { CityPosition, CityTimePreview, DistrictId, Habit } from "@/types/city"

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
  const { habits, checkIns, preferences, hydrated, hydrate, loadSampleCity, toggleCheckIn, updateHabitPositions } = useCityStore()
  const [district, setDistrict] = useState<"all" | DistrictId>("all")
  const [query, setQuery] = useState("")
  const [selectedHabitId, setSelectedHabitId] = useState<string>()
  const mapCommandId = useRef(0)
  const [mapCommand, setMapCommand] = useState<CityMapCommand>()
  const [isArranging, setIsArranging] = useState(false)
  const [arrangementOriginal, setArrangementOriginal] = useState<Map<string, CityPosition>>(new Map())
  const [arrangementDraft, setArrangementDraft] = useState<Map<string, CityPosition>>(new Map())
  const [arrangementSelectedId, setArrangementSelectedId] = useState<string>()
  const [arrangementSaving, setArrangementSaving] = useState(false)
  const [discardArrangementOpen, setDiscardArrangementOpen] = useState(false)
  const [arrangementAnnouncement, setArrangementAnnouncement] = useState("")
  const [timePreview, setTimePreview] = useState<CityTimePreview>("auto")
  const [now, setNow] = useState<Date>()
  const [recentlyCheckedHabitId, setRecentlyCheckedHabitId] = useState<string>()
  const [stageChangedHabitId, setStageChangedHabitId] = useState<string>()
  const checkInGlowTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const stageRevealTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!hydrated) void hydrate()
  }, [hydrate, hydrated])

  useEffect(() => {
    const updateClock = () => setNow(new Date())
    updateClock()
    const timer = window.setInterval(updateClock, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => () => {
    if (checkInGlowTimer.current) clearTimeout(checkInGlowTimer.current)
    if (stageRevealTimer.current) clearTimeout(stageRevealTimer.current)
  }, [])

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
  const visualState = useMemo(
    () => getCityVisualState(atmosphere, now ?? new Date(), timePreview),
    [atmosphere, now, timePreview],
  )
  const arrangementDirty = useMemo(
    () => positionsDiffer(arrangementOriginal, arrangementDraft),
    [arrangementDraft, arrangementOriginal],
  )
  const fallbackHabits = useMemo(
    () => habits.map((habit) => ({
      ...habit,
      position: arrangementDraft.get(habit.id) ?? habit.position,
    })),
    [arrangementDraft, habits],
  )

  const selectHabit = (habitId: string) => setSelectedHabitId(habitId)
  const issueMapCommand = (action: CityMapCommandAction) => {
    mapCommandId.current += 1
    setMapCommand({ id: mapCommandId.current, action })
  }

  const handleCheckIn = async (habit: Habit) => {
    const previousStage = stageIndex.indexOf(getHabitStage(habit.id, checkIns))
    const result = await toggleCheckIn(habit.id)
    if (checkInGlowTimer.current) clearTimeout(checkInGlowTimer.current)
    if (stageRevealTimer.current) clearTimeout(stageRevealTimer.current)
    if (result) {
      setRecentlyCheckedHabitId(habit.id)
      checkInGlowTimer.current = setTimeout(() => setRecentlyCheckedHabitId(undefined), 800)
      const nextStage = stageIndex.indexOf(getHabitStage(habit.id, useCityStore.getState().checkIns))
      if (nextStage > previousStage) {
        setStageChangedHabitId(habit.id)
        stageRevealTimer.current = setTimeout(() => setStageChangedHabitId(undefined), 450)
      }
    } else {
      setRecentlyCheckedHabitId(undefined)
      setStageChangedHabitId(undefined)
    }
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

  const beginArrangement = () => {
    if (habits.length === 0) return
    const positions = new Map(habits.map((habit) => [habit.id, { ...habit.position }]))
    const firstId = selectedHabitId && positions.has(selectedHabitId)
      ? selectedHabitId
      : habits[0].id
    setQuery("")
    setDistrict("all")
    setSelectedHabitId(undefined)
    setArrangementOriginal(positions)
    setArrangementDraft(new Map(positions))
    setArrangementSelectedId(firstId)
    setArrangementAnnouncement("Arrange mode started. Map navigation is paused.")
    setIsArranging(true)
    issueMapCommand("reset")
  }

  const finishArrangement = () => {
    setIsArranging(false)
    setArrangementOriginal(new Map())
    setArrangementDraft(new Map())
    setArrangementSelectedId(undefined)
    setDiscardArrangementOpen(false)
    setArrangementAnnouncement("")
  }

  const requestCancelArrangement = () => {
    if (arrangementDirty) {
      setDiscardArrangementOpen(true)
    } else {
      finishArrangement()
    }
  }

  const handleAutoArrange = () => {
    const next = getCompactArrangement(habits)
    setArrangementDraft(next)
    setArrangementSelectedId((current) => current ?? habits[0]?.id)
    setArrangementAnnouncement("Compact arrangement previewed. Save to keep these positions.")
    issueMapCommand("reset")
  }

  const handleNudge = (direction: CityNudgeDirection) => {
    if (!arrangementSelectedId) return
    const current = arrangementDraft.get(arrangementSelectedId)
    if (!current) return
    const world = toWorldPosition(current)
    const offsets: Record<CityNudgeDirection, { x: number; z: number }> = {
      north: { x: 0, z: -CITY_PLOT_SPACING },
      east: { x: CITY_PLOT_SPACING, z: 0 },
      south: { x: 0, z: CITY_PLOT_SPACING },
      west: { x: -CITY_PLOT_SPACING, z: 0 },
    }
    const occupied = habits
      .filter((habit) => habit.id !== arrangementSelectedId)
      .map((habit) => toWorldPosition(arrangementDraft.get(habit.id) ?? habit.position))
    const candidate = {
      x: world.x + offsets[direction].x,
      z: world.z + offsets[direction].z,
    }
    const nextWorld = findNearestValidPlot(candidate, [...occupied, world])
    if (!nextWorld) {
      setArrangementAnnouncement("No open parcel is available in that direction.")
      return
    }
    const next = new Map(arrangementDraft)
    next.set(arrangementSelectedId, toStoredPosition(nextWorld))
    setArrangementDraft(next)
    setArrangementAnnouncement(`Moved ${habits.find((habit) => habit.id === arrangementSelectedId)?.name ?? "building"} ${direction}.`)
  }

  const handleMoveHabit = (habitId: string, position: CityPosition) => {
    setArrangementSelectedId(habitId)
    setArrangementDraft((current) => {
      const previous = current.get(habitId)
      if (previous && positionsEqual(previous, position)) return current
      const next = new Map(current)
      next.set(habitId, position)
      return next
    })
    setArrangementAnnouncement(`Moved ${habits.find((habit) => habit.id === habitId)?.name ?? "building"} to a valid parcel.`)
  }

  const handleSaveArrangement = async () => {
    const changes = habits
      .filter((habit) => {
        const position = arrangementDraft.get(habit.id)
        return position && !positionsEqual(position, habit.position)
      })
      .map((habit) => ({ id: habit.id, position: arrangementDraft.get(habit.id)! }))
    if (changes.length === 0) return

    const previous = changes.map(({ id }) => ({ id, position: { ...arrangementOriginal.get(id)! } }))
    setArrangementSaving(true)
    try {
      await updateHabitPositions(changes)
      finishArrangement()
      issueMapCommand("reset")
      toast.success("City arrangement saved.", {
        action: {
          label: "Undo",
          onClick: () => {
            void updateHabitPositions(previous).then(() => {
              issueMapCommand("reset")
              toast.success("Previous arrangement restored.")
            }).catch(() => toast.error("The previous arrangement could not be restored."))
          },
        },
      })
    } catch {
      toast.error("The arrangement could not be saved.", {
        description: "Your draft is still open. Try again when you are ready.",
      })
    } finally {
      setArrangementSaving(false)
    }
  }

  useEffect(() => {
    if (!isArranging) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || discardArrangementOpen) return
      event.preventDefault()
      requestCancelArrangement()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  })

  if (!hydrated) return <CityDashboardSkeleton />

  return (
    <main
      className="flex h-svh min-h-svh flex-col overflow-hidden bg-[#edf1e8] text-[#1d2b24]"
      data-city-mode="immersive"
      data-city-query={query || undefined}
      data-city-district={district}
      data-city-selected-habit={selectedHabit?.name}
      data-city-arrange-mode={isArranging || undefined}
      data-city-arrangement-dirty={isArranging ? arrangementDirty : undefined}
      data-city-time-of-day={visualState.timeOfDay}
      data-city-activity={visualState.activity}
      data-city-time-preview={timePreview}
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
        <CityStatusPopover
          habitsCount={habits.length}
          activeHabitsCount={activeHabits.length}
          todayCount={todayCount}
          atmosphere={atmosphereMeta}
          onAddHabit={openCreateHabit}
          onLoadSampleCity={loadSampleCity}
        />
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
                  <DropdownMenuItem disabled={habits.length === 0} onClick={beginArrangement}>
                    <Move3D />
                    Arrange city
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Preview lighting</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={timePreview}
                        onValueChange={(value) => setTimePreview(value as CityTimePreview)}
                      >
                        <DropdownMenuRadioItem value="auto">Auto</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="day">Day</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="dusk">Dusk</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="night">Night</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
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
            positionOverrides={isArranging ? arrangementDraft : undefined}
            arranging={isArranging}
            onMoveHabit={handleMoveHabit}
            onArrangementIssue={setArrangementAnnouncement}
            onSelectHabit={selectHabit}
            mapCommand={mapCommand}
            visualState={visualState}
            quietMode={preferences.quietMode}
            reducedMotion={preferences.motion === "reduced"}
            recentlyCheckedHabitId={recentlyCheckedHabitId}
            stageChangedHabitId={stageChangedHabitId}
            fallback={
              <CityMap
                habits={fallbackHabits}
                checkIns={checkIns}
                arranging={isArranging}
                selectedHabitId={arrangementSelectedId}
                lastMapCommand={mapCommand?.action}
                onSelectHabit={selectHabitByHabit(isArranging ? setArrangementSelectedId : setSelectedHabitId)}
                className="h-full min-h-0 rounded-none border-0 shadow-none"
              />
            }
          />

          {isArranging && (
            <div className="absolute inset-x-3 bottom-3 z-30 flex justify-center sm:inset-x-5 sm:bottom-5" data-city-arrangement-toolbar>
              <CityArrangementToolbar
                habits={habits}
                selectedHabitId={arrangementSelectedId}
                dirty={arrangementDirty}
                saving={arrangementSaving}
                onSelectHabit={setArrangementSelectedId}
                onNudge={handleNudge}
                onAutoArrange={handleAutoArrange}
                onCancel={requestCancelArrangement}
                onSave={() => void handleSaveArrangement()}
              />
            </div>
          )}

          <p className="sr-only" role="status" aria-live="polite">{arrangementAnnouncement}</p>

          {!isArranging && <div className="absolute bottom-4 left-4 z-10 hidden flex-col gap-1 rounded-lg border border-white/70 bg-white/90 p-1 shadow-lg backdrop-blur-sm md:flex md:bottom-5 md:left-5" aria-label="District filters">
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
          </div>}

          {!isArranging && (selectedHabit ? (
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
          ))}

          {!isArranging && <div className="pointer-events-auto absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-lg border border-white/70 bg-white/90 p-1 shadow-lg backdrop-blur-sm" aria-label="Map controls">
            <Button variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={() => issueMapCommand("zoom-in")}><Plus /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={() => issueMapCommand("zoom-out")}><Minus /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Center city" onClick={() => issueMapCommand("center")}><LocateFixed /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Reset map" onClick={() => issueMapCommand("reset")}><RotateCcw /></Button>
          </div>}
        </div>
        <HabitCreationDialog onCreated={handleHabitCreated} />
        <AlertDialog open={discardArrangementOpen} onOpenChange={setDiscardArrangementOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard arrangement?</AlertDialogTitle>
              <AlertDialogDescription>
                Your building positions will return to where they were before Arrange mode.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue arranging</AlertDialogCancel>
              <AlertDialogAction onClick={finishArrangement}>Discard changes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </main>
  )
}

function positionsEqual(first: CityPosition, second: CityPosition) {
  return first.x === second.x && first.y === second.y
}

function positionsDiffer(
  first: ReadonlyMap<string, CityPosition>,
  second: ReadonlyMap<string, CityPosition>,
) {
  if (first.size !== second.size) return true
  for (const [id, position] of first) {
    const candidate = second.get(id)
    if (!candidate || !positionsEqual(position, candidate)) return true
  }
  return false
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

function CityStatusPopover({
  habitsCount,
  activeHabitsCount,
  todayCount,
  atmosphere,
  onAddHabit,
  onLoadSampleCity,
}: {
  habitsCount: number
  activeHabitsCount: number
  todayCount: number
  atmosphere: string
  onAddHabit: () => void
  onLoadSampleCity: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const progress = activeHabitsCount
    ? Math.round((todayCount / activeHabitsCount) * 100)
    : 0
  const hasHabits = habitsCount > 0
  const progressCopy = activeHabitsCount
    ? `${todayCount} of ${activeHabitsCount} habits checked in today`
    : hasHabits
      ? "No active habits to check in today"
      : "Add a habit to place the first building."

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            aria-label={`City status: ${progress}% complete. ${progressCopy}`}
            data-city-status-trigger
          />
        }
      >
        <span className="tabular-nums">{progress}%</span>
        <span className="hidden lg:inline" aria-hidden="true">
          · {activeHabitsCount ? `${todayCount}/${activeHabitsCount} today` : atmosphere}
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72" data-city-status-popover>
        <PopoverHeader>
          <PopoverTitle>{hasHabits ? "Your city is alive" : "Your city is a clear plot"}</PopoverTitle>
          <PopoverDescription>{progressCopy}</PopoverDescription>
        </PopoverHeader>
        <Progress value={progress} aria-label={`${progress}% of today's active habits completed`} />
        {hasHabits ? (
          <p className="text-sm text-muted-foreground">
            Select a building on the map to inspect its rhythm.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                setOpen(false)
                onAddHabit()
              }}
            >
              Add a habit
              <Plus data-icon="inline-end" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setOpen(false)
                void onLoadSampleCity()
              }}
            >
              Explore a sample city
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
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

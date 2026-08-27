"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight, Check, CloudRain, CloudSun, Leaf, Plus, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { BuildingIllustration } from "@/components/city/building-illustration"
import { CityMap } from "@/components/city/city-map"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { districtCatalog } from "@/lib/city/catalog"
import { getAtmosphere, getDistrictCounts, getHabitCheckIns, getHabitStage, getLocalDateKey, getWeeklyCheckInCount } from "@/lib/city/rules"
import { useCityStore } from "@/stores/city-store"
import type { DistrictId } from "@/types/city"

const atmosphereCopy = {
  clear: { label: "A clear foundation", description: "The first street is waiting for you.", icon: Leaf },
  lively: { label: "Lively tonight", description: "A few more windows are glowing.", icon: Sparkles },
  steady: { label: "A steady evening", description: "The city is holding its shape.", icon: CloudSun },
  quiet: { label: "A quieter day", description: "The streets are leaving room to breathe.", icon: CloudSun },
  rainy: { label: "Rain over the city", description: "The buildings are still here when you return.", icon: CloudRain },
} as const

export function CityDashboard() {
  const router = useRouter()
  const { habits, checkIns, hydrated, hydrate, loadSampleCity, toggleCheckIn } = useCityStore()
  const [district, setDistrict] = useState<"all" | DistrictId>("all")

  useEffect(() => {
    if (!hydrated) void hydrate()
  }, [hydrate, hydrated])

  const filteredHabits = useMemo(
    () => (district === "all" ? habits : habits.filter((habit) => habit.district === district)),
    [district, habits]
  )
  const districtCounts = useMemo(() => getDistrictCounts(habits), [habits])
  const atmosphere = getAtmosphere(habits, checkIns)
  const atmosphereMeta = atmosphereCopy[atmosphere]
  const AtmosphereIcon = atmosphereMeta.icon
  const today = getLocalDateKey()
  const todayCount = checkIns.filter((checkIn) => checkIn.localDate === today).length
  const weeklyTarget = habits.filter((habit) => habit.status === "active").reduce((sum, habit) => sum + habit.targetPerWeek, 0)
  const weeklyProgress = habits.filter((habit) => habit.status === "active").reduce((sum, habit) => sum + getWeeklyCheckInCount(habit.id, checkIns), 0)
  const progressValue = weeklyTarget ? Math.min(100, Math.round((weeklyProgress / weeklyTarget) * 100)) : 0

  if (!hydrated) {
    return <DashboardSkeleton />
  }

  if (!habits.length) {
    return (
      <div className="paper-grain flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-5 sm:p-8">
        <Empty className="max-w-xl border bg-card/70 shadow-sm">
          <EmptyHeader>
            <EmptyMedia variant="icon"><BuildingIllustration type="library" stage={0} color="sky" size={38} /></EmptyMedia>
            <h1 className="font-editorial text-3xl">Your city is a clear plot.</h1>
            <EmptyDescription className="max-w-md text-base">Give one repeated action a place to live. You can always start small, change the weather, and return later.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            <Button size="lg" render={<Link href="/habit/new" />} nativeButton={false}>Build your first foundation <Plus data-icon="inline-end" /></Button>
            <Button size="lg" variant="outline" onClick={() => void loadSampleCity()}>Explore a sample city</Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="paper-grain min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-label text-[0.6rem] text-primary">The city dashboard</p>
            <h1 className="font-editorial mt-2 text-4xl tracking-[-0.04em] sm:text-5xl">Good evening, builder.</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">A small look at what your repeated actions are making visible.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-2 rounded-full px-3 py-1.5"><AtmosphereIcon aria-hidden="true" />{atmosphereMeta.label}</Badge>
            <Button render={<Link href="/habit/new" />} nativeButton={false}>Build a habit <Plus data-icon="inline-end" /></Button>
          </div>
        </header>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Card className="bg-card/75 shadow-none"><CardContent className="flex items-center justify-between gap-4 p-4"><div><p className="font-label text-[0.55rem] text-muted-foreground">Buildings</p><p className="mt-1 text-2xl font-semibold tabular-nums">{habits.length}</p></div><BuildingIllustration type="tower" stage={3} color="blue" size={38} /></CardContent></Card>
          <Card className="bg-card/75 shadow-none"><CardContent className="flex items-center justify-between gap-4 p-4"><div><p className="font-label text-[0.55rem] text-muted-foreground">Today</p><p className="mt-1 text-2xl font-semibold tabular-nums">{todayCount}<span className="ml-1 text-sm font-normal text-muted-foreground">check-ins</span></p></div><Check className="text-primary" aria-hidden="true" /></CardContent></Card>
          <Card className="bg-card/75 shadow-none"><CardContent className="p-4"><div className="flex items-center justify-between gap-4"><p className="font-label text-[0.55rem] text-muted-foreground">This week</p><span className="font-mono text-xs text-muted-foreground">{weeklyProgress}/{weeklyTarget || 0}</span></div><Progress value={progressValue} className="mt-3" aria-label={`${progressValue}% of weekly target`} /><p className="mt-2 text-xs text-muted-foreground">Keep the rhythm flexible.</p></CardContent></Card>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-editorial text-2xl tracking-tight">Explore your city</h2>
            <p className="mt-1 text-sm text-muted-foreground">Every building is a repeated action with a story.</p>
          </div>
          <ToggleGroup value={district === "all" ? ["all"] : [district]} onValueChange={(values) => setDistrict((values[0] as "all" | DistrictId | undefined) ?? "all")} variant="outline" spacing={0} className="max-w-full overflow-x-auto bg-background">
            <ToggleGroupItem value="all" aria-label="Show all districts">All</ToggleGroupItem>
            {Object.entries(districtCatalog).map(([id, meta]) => <ToggleGroupItem key={id} value={id} aria-label={`Show ${meta.name} district`}>{meta.shortName}</ToggleGroupItem>)}
          </ToggleGroup>
        </div>

        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <CityMap habits={filteredHabits} checkIns={checkIns} onSelectHabit={(habit) => router.push(`/habit?id=${habit.id}`)} className="min-h-[34rem]" />
          <aside className="flex flex-col gap-4">
            <Card className="bg-card/80">
              <CardHeader className="pb-3"><CardTitle className="font-editorial text-2xl">Active streets</CardTitle><CardDescription>{atmosphereMeta.description}</CardDescription></CardHeader>
              <CardContent className="flex flex-col gap-3">
                {filteredHabits.filter((habit) => habit.status !== "archived").map((habit) => {
                  const habitCheckIns = getHabitCheckIns(habit.id, checkIns)
                  const isDone = habitCheckIns.some((checkIn) => checkIn.localDate === today)
                  const stage = getHabitStage(habit.id, checkIns)
                  return (
                    <div key={habit.id} className="rounded-xl border bg-background/70 p-3">
                      <div className="flex items-start gap-3">
                        <BuildingIllustration type={habit.buildingType} stage={["planned", "started", "growing", "established"].indexOf(stage)} color={habit.colorToken} status={habit.status} size={38} />
                        <div className="min-w-0 flex-1"><Link href={`/habit?id=${habit.id}`} className="block truncate text-sm font-medium hover:underline">{habit.name}</Link><p className="mt-1 text-xs text-muted-foreground">{districtCatalog[habit.district].name} · {stage}</p></div>
                        <Button size="icon-sm" variant={isDone ? "secondary" : "outline"} onClick={() => void toggleCheckIn(habit.id).then((result) => toast(result ? "The building grew a little." : "A quiet day is okay.", { description: result ? habit.name : "Today's light was turned off." }))} aria-label={isDone ? `Undo today's check-in for ${habit.name}` : `Check in ${habit.name}`}>{isDone ? <Check /> : <Plus />}</Button>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[0.68rem] text-muted-foreground"><span>{getWeeklyCheckInCount(habit.id, checkIns)} of {habit.targetPerWeek} this week</span><Link href={`/habit?id=${habit.id}`} className="inline-flex items-center gap-1 text-primary hover:underline">Details <ArrowUpRight /></Link></div>
                    </div>
                  )
                })}
              </CardContent>
              <CardFooter className="border-t pt-4"><Link href="/report" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">Read the city report <ArrowUpRight /></Link></CardFooter>
            </Card>
            <Card className="bg-primary text-primary-foreground shadow-none"><CardContent className="p-5"><p className="font-label text-[0.55rem] opacity-70">Districts with a pulse</p><div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">{Object.entries(districtCatalog).map(([id, meta]) => <div key={id}><p className="font-mono text-lg tabular-nums">{districtCounts[id as DistrictId]}</p><p className="mt-0.5 truncate text-[0.68rem] opacity-75">{meta.shortName}</p></div>)}</div></CardContent></Card>
          </aside>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-6 p-6 sm:p-10"><div className="flex flex-col gap-3"><Skeleton className="h-3 w-32" /><Skeleton className="h-12 w-72" /><Skeleton className="h-4 w-96 max-w-full" /></div><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]"><Skeleton className="min-h-[34rem] rounded-[1.5rem]" /><Skeleton className="min-h-[34rem] rounded-2xl" /></div></div>
}

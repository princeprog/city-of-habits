"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight, Check, CloudRain, CloudSun, Leaf, Plus, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { BuildingIllustration } from "@/components/city/building-illustration"
import { CityMap } from "@/components/city/city-map"
import { Badge } from "@/components/ui/badge"
import { buttonVariants, Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { districtCatalog } from "@/lib/city/catalog"
import { getAtmosphere, getDistrictCounts, getHabitCheckIns, getHabitStage, getLocalDateKey, getWeeklyCheckInCount } from "@/lib/city/rules"
import { cn } from "@/lib/utils"
import { useCityStore } from "@/stores/city-store"
import type { DistrictId } from "@/types/city"

const atmosphereCopy = {
  clear: { label: "A clear foundation", description: "The first street is waiting for you.", icon: Leaf },
  lively: { label: "Lively tonight", description: "A few more windows are glowing.", icon: Sparkles },
  steady: { label: "A steady evening", description: "The city is holding its shape.", icon: CloudSun },
  quiet: { label: "A quieter day", description: "The streets are leaving room to breathe.", icon: CloudSun },
  rainy: { label: "Rain over the city", description: "The buildings are still here when you return.", icon: CloudRain },
} as const

const stageIndex = ["planned", "started", "growing", "established"] as const

export function CityDashboard() {
  const router = useRouter()
  const { habits, checkIns, hydrated, hydrate, loadSampleCity, toggleCheckIn } = useCityStore()
  const [district, setDistrict] = useState<"all" | DistrictId>("all")

  useEffect(() => {
    if (!hydrated) void hydrate()
  }, [hydrate, hydrated])

  const filteredHabits = useMemo(() => district === "all" ? habits : habits.filter((habit) => habit.district === district), [district, habits])
  const districtCounts = useMemo(() => getDistrictCounts(habits), [habits])
  const atmosphere = getAtmosphere(habits, checkIns)
  const atmosphereMeta = atmosphereCopy[atmosphere]
  const AtmosphereIcon = atmosphereMeta.icon
  const today = getLocalDateKey()
  const todayCount = checkIns.filter((checkIn) => checkIn.localDate === today).length
  const activeHabits = habits.filter((habit) => habit.status === "active")
  const weeklyTarget = activeHabits.reduce((sum, habit) => sum + habit.targetPerWeek, 0)
  const weeklyProgress = activeHabits.reduce((sum, habit) => sum + getWeeklyCheckInCount(habit.id, checkIns), 0)
  const progressValue = weeklyTarget ? Math.min(100, Math.round((weeklyProgress / weeklyTarget) * 100)) : 0

  if (!hydrated) return <DashboardSkeleton />

  if (!habits.length) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-5 sm:p-8">
        <Empty className="max-w-xl">
          <EmptyHeader>
            <EmptyMedia variant="icon"><BuildingIllustration type="library" stage={0} color="sky" size={38} /></EmptyMedia>
            <h1 className="font-heading text-sm font-medium tracking-tight">Your city is a clear plot.</h1>
            <EmptyDescription>Give one repeated action a place to live. You can always start small, change the weather, and return later.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            <Link href="/habit/new" className={buttonVariants({ size: "lg" })}>Build your first foundation <Plus data-icon="inline-end" /></Link>
            <Button size="lg" variant="outline" onClick={() => void loadSampleCity()}>Explore a sample city</Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">The city dashboard</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Good evening, builder.</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">A small look at what your repeated actions are making visible.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline"><AtmosphereIcon />{atmosphereMeta.label}</Badge>
            <Link href="/habit/new" className={buttonVariants()}>Build a habit <Plus data-icon="inline-end" /></Link>
          </div>
        </header>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Card size="sm"><CardHeader><CardDescription>Buildings</CardDescription><CardTitle className="text-2xl">{habits.length}</CardTitle></CardHeader><CardContent><BuildingIllustration type="tower" stage={3} color="blue" size={38} /></CardContent></Card>
          <Card size="sm"><CardHeader><CardDescription>Today</CardDescription><CardTitle className="text-2xl">{todayCount}<span className="ml-1 text-sm font-normal text-muted-foreground">check-ins</span></CardTitle></CardHeader><CardContent><Check aria-hidden="true" /></CardContent></Card>
          <Card size="sm"><CardHeader><div className="flex items-center justify-between gap-4"><CardDescription>This week</CardDescription><span className="text-xs text-muted-foreground">{weeklyProgress}/{weeklyTarget || 0}</span></div><Progress value={progressValue} aria-label={`${progressValue}% of weekly target`} /></CardHeader><CardContent><p className="text-xs text-muted-foreground">Keep the rhythm flexible.</p></CardContent></Card>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Explore your city</h2>
            <p className="mt-1 text-sm text-muted-foreground">Every building is a repeated action with a story.</p>
          </div>
          <ToggleGroup value={[district]} onValueChange={(values) => setDistrict((values[0] as "all" | DistrictId | undefined) ?? "all")} variant="outline" spacing={0} className="max-w-full overflow-x-auto">
            <ToggleGroupItem value="all" aria-label="Show all districts">All</ToggleGroupItem>
            {Object.entries(districtCatalog).map(([id, meta]) => <ToggleGroupItem key={id} value={id} aria-label={`Show ${meta.name} district`}>{meta.shortName}</ToggleGroupItem>)}
          </ToggleGroup>
        </div>

        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <CityMap habits={filteredHabits} checkIns={checkIns} onSelectHabit={(habit) => router.push(`/habit?id=${habit.id}`)} className="min-h-[34rem]" />
          <aside className="flex flex-col gap-4">
            <Card>
              <CardHeader><CardTitle>Active streets</CardTitle><CardDescription>{atmosphereMeta.description}</CardDescription></CardHeader>
              <CardContent>
                <ItemGroup>
                  {filteredHabits.filter((habit) => habit.status !== "archived").map((habit) => {
                    const habitCheckIns = getHabitCheckIns(habit.id, checkIns)
                    const isDone = habitCheckIns.some((checkIn) => checkIn.localDate === today)
                    const stage = getHabitStage(habit.id, checkIns)
                    return (
                      <Item key={habit.id} variant="outline">
                        <ItemMedia variant="icon"><BuildingIllustration type={habit.buildingType} stage={stageIndex.indexOf(stage)} color={habit.colorToken} status={habit.status} size={38} /></ItemMedia>
                        <ItemContent><ItemTitle><Link href={`/habit?id=${habit.id}`} className="truncate hover:underline">{habit.name}</Link></ItemTitle><ItemDescription>{districtCatalog[habit.district].name} · {stage} · {getWeeklyCheckInCount(habit.id, checkIns)} of {habit.targetPerWeek} this week</ItemDescription></ItemContent>
                        <ItemActions><Button size="icon-sm" variant={isDone ? "secondary" : "outline"} onClick={() => void toggleCheckIn(habit.id).then((result) => toast(result ? "The building grew a little." : "A quiet day is okay.", { description: result ? habit.name : "Today's light was turned off." }))} aria-label={isDone ? `Undo today's check-in for ${habit.name}` : `Check in ${habit.name}`}>{isDone ? <Check /> : <Plus />}</Button><Link href={`/habit?id=${habit.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))} aria-label={`Open ${habit.name}`}><ArrowUpRight /></Link></ItemActions>
                      </Item>
                    )
                  })}
                </ItemGroup>
              </CardContent>
              <CardFooter><Link href="/report" className="text-sm font-medium text-primary hover:underline">Read the city report <ArrowUpRight /></Link></CardFooter>
            </Card>
            <Card>
              <CardHeader><CardTitle>Districts with a pulse</CardTitle><CardDescription>Buildings by neighborhood.</CardDescription></CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">{Object.entries(districtCatalog).map(([id, meta]) => <div key={id}><p className="text-lg font-semibold tabular-nums">{districtCounts[id as DistrictId]}</p><p className="text-xs text-muted-foreground">{meta.shortName}</p></div>)}</CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-6 p-6 sm:p-10"><div className="flex flex-col gap-3"><Skeleton className="h-3 w-32" /><Skeleton className="h-12 w-72" /><Skeleton className="h-4 w-96 max-w-full" /></div><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]"><Skeleton className="min-h-[34rem]" /><Skeleton className="min-h-[34rem]" /></div></div>
}

"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo } from "react"
import { ArrowLeft, ArrowUpRight, Link2, Plus, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { BuildingIllustration } from "@/components/city/building-illustration"
import { CityMap } from "@/components/city/city-map"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldLabel } from "@/components/ui/field"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { buildingCatalog, districtCatalog } from "@/lib/city/catalog"
import { getHabitCheckIns, getHabitStage, getMilestoneCount, getWeeklyCheckInCount } from "@/lib/city/rules"
import { cn } from "@/lib/utils"
import { DISTRICT_IDS, type DistrictId, type Habit } from "@/types/city"
import { useCityStore } from "@/stores/city-store"

const stageIndex = ["planned", "started", "growing", "established"] as const

export function DistrictPage() {
  return <Suspense fallback={<DistrictSkeleton />}><DistrictView /></Suspense>
}

function DistrictView() {
  const params = useSearchParams()
  const router = useRouter()
  const requestedId = params.get("id")
  const selectedId: "all" | DistrictId = requestedId && DISTRICT_IDS.includes(requestedId as DistrictId) ? requestedId as DistrictId : "all"
  const { habits, checkIns, hydrated, hydrate, updateHabit } = useCityStore()

  useEffect(() => {
    if (!hydrated) void hydrate()
  }, [hydrate, hydrated])

  const district = selectedId === "all" ? undefined : districtCatalog[selectedId]
  const visibleHabits = useMemo(() => selectedId === "all" ? habits : habits.filter((habit) => habit.district === selectedId), [habits, selectedId])
  const connectionKeys = useMemo(() => {
    const keys = new Set<string>()
    habits.forEach((habit) => habit.relatedHabitIds.forEach((relatedId) => {
      if (habits.some((candidate) => candidate.id === relatedId)) keys.add([habit.id, relatedId].sort().join(":"))
    }))
    return keys
  }, [habits])

  async function toggleConnection(source: Habit, target: Habit, nextValue: boolean) {
    const sourceRelated = new Set(source.relatedHabitIds)
    const targetRelated = new Set(target.relatedHabitIds)
    if (nextValue) {
      sourceRelated.add(target.id)
      targetRelated.add(source.id)
    } else {
      sourceRelated.delete(target.id)
      targetRelated.delete(source.id)
    }
    await updateHabit(source.id, { relatedHabitIds: Array.from(sourceRelated) })
    await updateHabit(target.id, { relatedHabitIds: Array.from(targetRelated) })
    toast(nextValue ? "A new street now connects these buildings." : "The street connection was removed.")
  }

  if (!hydrated) return <DistrictSkeleton />

  const title = district?.name ?? "All districts"
  const description = district?.description ?? "See how every part of your life contributes to one living map."
  const totalCheckIns = visibleHabits.reduce((sum, habit) => sum + getHabitCheckIns(habit.id, checkIns).length, 0)
  const landmarkCount = visibleHabits.reduce((sum, habit) => sum + getMilestoneCount(habit.id, checkIns), 0)

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:px-6 sm:py-9 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/city" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}><ArrowLeft data-icon="inline-start" />Back to the city</Link>
          <Link href="/habit/new" className={buttonVariants()}>Build a habit <Plus data-icon="inline-end" /></Link>
        </div>

        <header className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">The neighborhood report</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-6xl">{title}</h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:min-w-[24rem]">
            <Card size="sm"><CardHeader><CardDescription>Buildings</CardDescription><CardTitle className="text-2xl">{visibleHabits.length}</CardTitle></CardHeader></Card>
            <Card size="sm"><CardHeader><CardDescription>Check-ins</CardDescription><CardTitle className="text-2xl">{totalCheckIns}</CardTitle></CardHeader></Card>
            <Card size="sm"><CardHeader><CardDescription>Landmarks</CardDescription><CardTitle className="text-2xl">{landmarkCount}</CardTitle></CardHeader></Card>
          </div>
        </header>

        <nav aria-label="Districts" className="mt-7 flex max-w-full gap-2 overflow-x-auto pb-1">
          <Link href="/district?id=all" className={buttonVariants({ size: "sm", variant: selectedId === "all" ? "secondary" : "outline" })}>All</Link>
          {DISTRICT_IDS.map((id) => <Link key={id} href={`/district?id=${id}`} className={buttonVariants({ size: "sm", variant: selectedId === id ? "secondary" : "outline" })}>{districtCatalog[id].shortName}</Link>)}
        </nav>

        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <CityMap habits={visibleHabits} checkIns={checkIns} onSelectHabit={(habit) => router.push(`/habit?id=${habit.id}`)} className="min-h-[30rem]" />
          <aside className="flex flex-col gap-4">
            <Card>
              <CardHeader><CardTitle>Buildings in {district?.shortName ?? "the city"}</CardTitle><CardDescription>Each one has its own pace and a place in the neighborhood.</CardDescription></CardHeader>
              <CardContent>
                {visibleHabits.length ? <ItemGroup>{visibleHabits.map((habit) => {
                  const count = getHabitCheckIns(habit.id, checkIns).length
                  const stage = getHabitStage(habit.id, checkIns)
                  const weekly = getWeeklyCheckInCount(habit.id, checkIns)
                  const otherHabits = habits.filter((candidate) => candidate.id !== habit.id && candidate.status !== "archived")
                  return (
                    <Item key={habit.id} variant="outline">
                      <ItemMedia variant="icon"><BuildingIllustration type={habit.buildingType} stage={stageIndex.indexOf(stage)} color={habit.colorToken} status={habit.status} size={34} /></ItemMedia>
                      <ItemContent><ItemTitle><Link href={`/habit?id=${habit.id}`} className="truncate hover:underline">{habit.name}</Link></ItemTitle><ItemDescription>{buildingCatalog[habit.buildingType].name} · {stage} · {count} total</ItemDescription><Progress value={Math.min(100, Math.round((weekly / habit.targetPerWeek) * 100))} aria-label={`${habit.name}: ${weekly} of ${habit.targetPerWeek} this week`} /></ItemContent>
                      <ItemActions>
                        <Popover>
                          <PopoverTrigger render={<button type="button" className={buttonVariants({ variant: "outline", size: "icon-sm" })} aria-label={`Manage connections for ${habit.name}`} />}><Link2 /></PopoverTrigger>
                          <PopoverContent align="end" className="w-80">
                            <PopoverHeader><PopoverTitle>Connect this building</PopoverTitle><PopoverDescription>Connections are two-way streets between habits.</PopoverDescription></PopoverHeader>
                            <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
                              {otherHabits.length ? otherHabits.map((other) => {
                                const checked = habit.relatedHabitIds.includes(other.id)
                                return <Field key={other.id} orientation="horizontal"><Checkbox id={`${habit.id}-${other.id}`} checked={checked} onCheckedChange={(value) => void toggleConnection(habit, other, value === true)} /><FieldLabel htmlFor={`${habit.id}-${other.id}`}>{other.name}<Badge variant="outline">{districtCatalog[other.district].shortName}</Badge></FieldLabel></Field>
                              }) : <p className="text-sm text-muted-foreground">Create another active habit to draw a street.</p>}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Link href={`/habit?id=${habit.id}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label={`Open ${habit.name}`}><ArrowUpRight /></Link>
                      </ItemActions>
                    </Item>
                  )
                })}</ItemGroup> : <Empty><EmptyHeader><EmptyMedia variant="icon"><Sparkles /></EmptyMedia><EmptyTitle>No buildings here yet.</EmptyTitle><EmptyDescription>Give this district a repeated action and the map will make room.</EmptyDescription></EmptyHeader><EmptyContent><Link href="/habit/new" className={buttonVariants()}>Build the first foundation <Plus data-icon="inline-end" /></Link></EmptyContent></Empty>}
              </CardContent>
              <CardFooter><Link href="/report" className="text-sm font-medium text-primary hover:underline">Read the city report <ArrowUpRight /></Link></CardFooter>
            </Card>
            <Card><CardHeader><CardTitle>Connected streets</CardTitle><CardDescription>{connectionKeys.size} {connectionKeys.size === 1 ? "street" : "streets"} connect the city.</CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">A city can hold separate rhythms and still let them meet.</p></CardContent></Card>
          </aside>
        </div>
      </div>
    </div>
  )
}

function DistrictSkeleton() {
  return <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-6 p-6 sm:p-10"><Skeleton className="h-3 w-40" /><Skeleton className="h-14 w-80 max-w-full" /><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]"><Skeleton className="min-h-[30rem]" /><Skeleton className="min-h-[30rem]" /></div></div>
}

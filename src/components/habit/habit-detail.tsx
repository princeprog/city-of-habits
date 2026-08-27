"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, CloudRain, Pause, Play, RotateCcw, Sparkles, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { BuildingIllustration } from "@/components/city/building-illustration"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { getHabitCheckIns, getHabitStage, getLocalDateKey, getMilestoneCount, getWeekStart, getWeeklyCheckInCount } from "@/lib/city/rules"
import { useCityStore } from "@/stores/city-store"
import type { Habit } from "@/types/city"

const stageCopy = {
  planned: { title: "A foundation plot", description: "The city is holding a place for this intention.", color: "sky" },
  started: { title: "The first rooms are open", description: "A beginning is already part of the map.", color: "teal" },
  growing: { title: "The building is growing", description: "Recent attention is adding detail to the block.", color: "gold" },
  established: { title: "An established landmark", description: "This rhythm has become part of the city.", color: "moss" },
} as const

export function HabitDetailPage() {
  return <Suspense fallback={<HabitDetailSkeleton />}><HabitDetail /></Suspense>
}

function HabitDetail() {
  const params = useSearchParams()
  const id = params.get("id")
  const { habits, checkIns, reflections, hydrated, hydrate, toggleCheckIn, updateHabit, saveReflection } = useCityStore()
  const [reflectionText, setReflectionText] = useState("")
  const [isSavingReflection, setIsSavingReflection] = useState(false)

  useEffect(() => {
    if (!hydrated) void hydrate()
  }, [hydrate, hydrated])

  const habit = habits.find((candidate) => candidate.id === id)
  const habitCheckIns = useMemo(() => (habit ? getHabitCheckIns(habit.id, checkIns) : []), [checkIns, habit])
  const stage = habit ? getHabitStage(habit.id, checkIns) : "planned"
  const stageMeta = stageCopy[stage]
  const isDoneToday = habitCheckIns.some((checkIn) => checkIn.localDate === getLocalDateKey())
  const weeklyCount = habit ? getWeeklyCheckInCount(habit.id, checkIns) : 0
  const reflection = habit ? reflections.find((item) => item.scopeKey === `${habit.id}:reflection`) : undefined
  const completedDates = habitCheckIns.map((checkIn) => new Date(`${checkIn.localDate}T12:00:00`))

  useEffect(() => {
    // This synchronizes the editor with the persisted reflection selected by the URL.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReflectionText(reflection?.body ?? "")
  }, [reflection?.body])

  if (!hydrated) return <HabitDetailSkeleton />
  if (!habit) {
    return <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6"><Card className="max-w-md"><CardHeader><CardTitle className="font-editorial text-3xl">That building is not on this map.</CardTitle><CardDescription>It may have been removed, or this link may be out of date.</CardDescription></CardHeader><CardFooter><Button render={<Link href="/city" />} nativeButton={false}><ArrowLeft data-icon="inline-start" />Back to the city</Button></CardFooter></Card></div>
  }

  const habitId = habit.id

  async function handleCheckIn() {
    const result = await toggleCheckIn(habitId)
    toast(result ? "The building grew a little." : "Today's light is off.", { description: result ? "Your check-in is part of the city now." : "A quiet day is okay. The history remains." })
  }

  async function handleStatus(status: Habit["status"]) {
    await updateHabit(habitId, { status })
    toast(status === "archived" ? "The landmark moved to the archive." : status === "paused" ? "The district is taking a quiet season." : "The building is open again.")
  }

  async function handleReflection() {
    setIsSavingReflection(true)
    await saveReflection({ habitId, scopeKey: `${habitId}:reflection`, period: "week", periodStart: getWeekStart(), body: reflectionText })
    setIsSavingReflection(false)
    toast.success("Reflection saved.")
  }

  return (
    <div className="paper-grain min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" className="-ml-2" render={<Link href="/city" />} nativeButton={false}><ArrowLeft data-icon="inline-start" />Back to the city</Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" render={<Link href={`/district?id=${habit.district}`} />} nativeButton={false}>View district <ArrowUpRight data-icon="inline-end" /></Button>
            {habit.status === "archived" ? <Button size="sm" onClick={() => void handleStatus("active")}><RotateCcw data-icon="inline-start" />Restore</Button> : <AlertDialog><AlertDialogTrigger render={<Button size="sm" variant="destructive"><Trash2 data-icon="inline-start" />Archive</Button>} /><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Move this landmark to the archive?</AlertDialogTitle><AlertDialogDescription>The building and every check-in will remain in your city history. It will simply become quieter.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep it here</AlertDialogCancel><AlertDialogAction onClick={() => void handleStatus("archived")}>Move to archive</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}
          </div>
        </div>

        <header className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div className="flex items-start gap-5">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-3xl border bg-card shadow-sm sm:size-32"><BuildingIllustration type={habit.buildingType} stage={["planned", "started", "growing", "established"].indexOf(stage)} color={habit.colorToken} status={habit.status} size={92} /></div>
            <div className="min-w-0"><p className="font-label text-[0.6rem] text-primary">{habit.district} district · {habit.buildingType}</p><h1 className="font-editorial mt-2 text-4xl tracking-[-0.04em] sm:text-6xl">{habit.name}</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{habit.intention || stageMeta.description}</p><div className="mt-4 flex flex-wrap items-center gap-2"><Badge variant="secondary">{stageMeta.title}</Badge>{habit.status === "paused" && <Badge variant="outline"><Pause />Paused</Badge>}{habit.status === "archived" && <Badge variant="outline">Archive district</Badge>}</div></div>
          </div>
          <Card className="bg-card/75 shadow-none"><CardContent className="p-4"><p className="font-label text-[0.55rem] text-muted-foreground">This week</p><div className="mt-2 flex items-end justify-between gap-3"><p className="text-3xl font-semibold tabular-nums">{weeklyCount}<span className="ml-1 text-base font-normal text-muted-foreground">/ {habit.targetPerWeek}</span></p><span className="font-mono text-xs text-muted-foreground">{habitCheckIns.length} total</span></div><Progress value={Math.min(100, Math.round((weeklyCount / habit.targetPerWeek) * 100))} className="mt-3" /><p className="mt-2 text-xs text-muted-foreground">A direction, not a grade.</p></CardContent></Card>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <Card className="bg-card/85"><CardHeader className="flex flex-row items-center justify-between gap-4"><div><CardTitle className="font-editorial text-2xl">Today in the building</CardTitle><CardDescription>{isDoneToday ? "A warm window is already on." : "One calm action is enough."}</CardDescription></div><Button size="lg" onClick={() => void handleCheckIn()} disabled={habit.status !== "active"}>{isDoneToday ? <><Check data-icon="inline-start" />Checked in</> : <>Check in <Sparkles data-icon="inline-end" /></>}</Button></CardHeader><CardContent><div className="rounded-2xl border bg-background/60 p-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">{isDoneToday ? <Check /> : <CloudRain />}</div><div><p className="text-sm font-medium">{isDoneToday ? "The city noticed." : "The weather can change."}</p><p className="mt-1 text-xs text-muted-foreground">{isDoneToday ? "This check-in is part of your history." : "Missed days never erase the rooms you have built."}</p></div></div></div></CardContent></Card>

          <Card className="bg-primary text-primary-foreground shadow-none"><CardHeader><p className="font-label text-[0.55rem] opacity-70">The next detail</p><CardTitle className="font-editorial text-2xl">{Math.max(0, [0, 3, 11, 30][["planned", "started", "growing", "established"].indexOf(stage)] - habitCheckIns.length)} more check-ins</CardTitle><CardDescription className="text-primary-foreground/75">until the next visible milestone.</CardDescription></CardHeader><CardContent><div className="flex items-center gap-2 text-sm"><Sparkles /><span>{getMilestoneCount(habit.id, checkIns)} landmark{getMilestoneCount(habit.id, checkIns) === 1 ? "" : "s"} unlocked</span></div></CardContent></Card>
        </div>

        <Tabs defaultValue="history" className="mt-8">
          <TabsList><TabsTrigger value="history"><CalendarDays data-icon="inline-start" />History</TabsTrigger><TabsTrigger value="reflection">Reflection</TabsTrigger><TabsTrigger value="care">Care for the building</TabsTrigger></TabsList>
          <TabsContent value="history" className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <Card><CardHeader><CardTitle className="font-editorial text-2xl">The check-in history</CardTitle><CardDescription>Every marked day remains part of the map.</CardDescription></CardHeader><CardContent><Calendar mode="single" selected={new Date()} modifiers={{ completed: completedDates }} modifiersClassNames={{ completed: "bg-accent text-accent-foreground font-semibold" }} className="mx-auto w-full rounded-xl border bg-background/60 p-3 [--cell-size:2.4rem]" /></CardContent></Card>
            <div className="flex flex-col gap-4"><Card><CardHeader><CardTitle className="text-base">Recent notes</CardTitle></CardHeader><CardContent className="flex flex-col gap-3">{habitCheckIns.filter((checkIn) => checkIn.note).slice(0, 4).map((checkIn) => <div key={checkIn.id} className="border-l-2 border-primary/40 pl-3"><p className="text-sm leading-relaxed">{checkIn.note}</p><p className="font-label mt-1 text-[0.52rem] text-muted-foreground">{checkIn.localDate}</p></div>)}{!habitCheckIns.some((checkIn) => checkIn.note) && <p className="text-sm leading-relaxed text-muted-foreground">Add context on a future check-in when it feels useful.</p>}</CardContent></Card><Card><CardContent className="p-5"><p className="font-label text-[0.55rem] text-muted-foreground">Lifetime</p><p className="mt-2 text-3xl font-semibold tabular-nums">{habitCheckIns.length}</p><p className="mt-1 text-sm text-muted-foreground">days that belong to this story.</p></CardContent></Card></div>
          </TabsContent>
          <TabsContent value="reflection" className="mt-4"><Card><CardHeader><CardTitle className="font-editorial text-2xl">What did this habit make possible?</CardTitle><CardDescription>Keep a sentence for the person who will return to this building later.</CardDescription></CardHeader><CardContent><FieldGroup><Field><FieldLabel htmlFor="habit-reflection">A note for this week</FieldLabel><Textarea id="habit-reflection" value={reflectionText} onChange={(event) => setReflectionText(event.target.value)} placeholder="I felt more present after making this a small part of the week." className="min-h-32 resize-none" /><FieldDescription>This stays in your browser with the rest of your city.</FieldDescription></Field></FieldGroup></CardContent><CardFooter><Button onClick={() => void handleReflection()} disabled={isSavingReflection}>{isSavingReflection ? "Saving..." : "Save reflection"}</Button></CardFooter></Card></TabsContent>
          <TabsContent value="care" className="mt-4"><Card><CardHeader><CardTitle className="font-editorial text-2xl">Change the season</CardTitle><CardDescription>Pausing is a way to care for the city, not a failure state.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-3">{habit.status === "paused" ? <Button onClick={() => void handleStatus("active")}><Play data-icon="inline-start" />Open the building</Button> : habit.status === "active" ? <Button variant="outline" onClick={() => void handleStatus("paused")}><Pause data-icon="inline-start" />Pause for a while</Button> : <Button onClick={() => void handleStatus("active")}><RotateCcw data-icon="inline-start" />Restore to active</Button>}</CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function HabitDetailSkeleton() {
  return <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-6 p-6 sm:p-10"><Skeleton className="h-8 w-32" /><div className="flex items-center gap-5"><Skeleton className="size-28 rounded-3xl" /><div className="flex flex-col gap-3"><Skeleton className="h-3 w-32" /><Skeleton className="h-12 w-72" /><Skeleton className="h-4 w-96 max-w-full" /></div></div><Skeleton className="h-96 w-full rounded-2xl" /></div>
}

"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, CloudRain, Pause, Play, RotateCcw, Sparkles, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { BuildingIllustration } from "@/components/city/building-illustration"
import { Badge } from "@/components/ui/badge"
import { buttonVariants, Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { getHabitCheckIns, getHabitStage, getLocalDateKey, getMilestoneCount, getWeekStart, getWeeklyCheckInCount } from "@/lib/city/rules"
import { cn } from "@/lib/utils"
import { useCityStore } from "@/stores/city-store"
import type { Habit } from "@/types/city"

const stageCopy = {
  planned: { title: "A foundation plot", description: "The city is holding a place for this intention." },
  started: { title: "The first rooms are open", description: "A beginning is already part of the map." },
  growing: { title: "The building is growing", description: "Recent attention is adding detail to the block." },
  established: { title: "An established landmark", description: "This rhythm has become part of the city." },
} as const

const stageIndex = ["planned", "started", "growing", "established"] as const

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
  const habitCheckIns = useMemo(() => habit ? getHabitCheckIns(habit.id, checkIns) : [], [checkIns, habit])
  const stage = habit ? getHabitStage(habit.id, checkIns) : "planned"
  const stageMeta = stageCopy[stage]
  const isDoneToday = habitCheckIns.some((checkIn) => checkIn.localDate === getLocalDateKey())
  const weeklyCount = habit ? getWeeklyCheckInCount(habit.id, checkIns) : 0
  const reflection = habit ? reflections.find((item) => item.scopeKey === `${habit.id}:reflection`) : undefined
  const completedDates = habitCheckIns.map((checkIn) => new Date(`${checkIn.localDate}T12:00:00`))

  useEffect(() => {
    // Synchronize the editor with the persisted reflection selected by the URL.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReflectionText(reflection?.body ?? "")
  }, [reflection?.body])

  if (!hydrated) return <HabitDetailSkeleton />
  if (!habit) {
    return <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6"><Card className="max-w-md"><CardHeader><h1 className="text-3xl font-semibold tracking-tight">That building is not on this map.</h1><CardDescription>It may have been removed, or this link may be out of date.</CardDescription></CardHeader><CardFooter><Link href="/city" className={buttonVariants()}><ArrowLeft data-icon="inline-start" />Back to the city</Link></CardFooter></Card></div>
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

  const nextMilestone = [0, 3, 11, 30][stageIndex.indexOf(stage)]

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/city" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}><ArrowLeft data-icon="inline-start" />Back to the city</Link>
          <div className="flex items-center gap-2">
            <Link href={`/district?id=${habit.district}`} className={buttonVariants({ variant: "outline", size: "sm" })}>View district <ArrowUpRight data-icon="inline-end" /></Link>
            {habit.status === "archived" ? <Button size="sm" onClick={() => void handleStatus("active")}><RotateCcw data-icon="inline-start" />Restore</Button> : <AlertDialog><AlertDialogTrigger render={<Button size="sm" variant="destructive"><Trash2 data-icon="inline-start" />Archive</Button>} /><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Move this landmark to the archive?</AlertDialogTitle><AlertDialogDescription>The building and every check-in will remain in your city history. It will simply become quieter.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep it here</AlertDialogCancel><AlertDialogAction onClick={() => void handleStatus("archived")}>Move to archive</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}
          </div>
        </div>

        <header className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div className="flex items-start gap-5">
            <Card size="sm" className="flex size-24 shrink-0 items-center justify-center p-2 sm:size-32"><BuildingIllustration type={habit.buildingType} stage={stageIndex.indexOf(stage)} color={habit.colorToken} status={habit.status} size={92} /></Card>
            <div className="min-w-0"><p className="text-sm font-medium text-primary">{habit.district} district · {habit.buildingType}</p><h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-6xl">{habit.name}</h1><p className="mt-3 max-w-xl text-sm text-muted-foreground">{habit.intention || stageMeta.description}</p><div className="mt-4 flex flex-wrap items-center gap-2"><Badge variant="secondary">{stageMeta.title}</Badge>{habit.status === "paused" && <Badge variant="outline"><Pause />Paused</Badge>}{habit.status === "archived" && <Badge variant="outline">Archive district</Badge>}</div></div>
          </div>
          <Card size="sm"><CardHeader><CardDescription>This week</CardDescription><CardTitle className="text-3xl">{weeklyCount}<span className="ml-1 text-base font-normal text-muted-foreground">/ {habit.targetPerWeek}</span></CardTitle><CardDescription>{habitCheckIns.length} total</CardDescription><Progress value={Math.min(100, Math.round((weeklyCount / habit.targetPerWeek) * 100))} aria-label={`${weeklyCount} of ${habit.targetPerWeek} this week`} /></CardHeader></Card>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <Card><CardHeader className="flex-row items-start justify-between gap-4"><div><CardTitle>Today in the building</CardTitle><CardDescription>{isDoneToday ? "A warm window is already on." : "One calm action is enough."}</CardDescription></div><CardAction><Button size="lg" onClick={() => void handleCheckIn()} disabled={habit.status !== "active"}>{isDoneToday ? <><Check data-icon="inline-start" />Checked in</> : <>Check in <Sparkles data-icon="inline-end" /></>}</Button></CardAction></CardHeader><CardContent><Item variant="outline"><ItemMedia variant="icon">{isDoneToday ? <Check /> : <CloudRain />}</ItemMedia><ItemContent><ItemTitle>{isDoneToday ? "The city noticed." : "The weather can change."}</ItemTitle><ItemDescription>{isDoneToday ? "This check-in is part of your history." : "Missed days never erase the rooms you have built."}</ItemDescription></ItemContent></Item></CardContent></Card>
          <Card><CardHeader><CardDescription>The next detail</CardDescription><CardTitle>{Math.max(0, nextMilestone - habitCheckIns.length)} more check-ins</CardTitle><CardDescription>until the next visible milestone.</CardDescription></CardHeader><CardContent><div className="flex items-center gap-2 text-sm"><Sparkles /><span>{getMilestoneCount(habit.id, checkIns)} landmark{getMilestoneCount(habit.id, checkIns) === 1 ? "" : "s"} unlocked</span></div></CardContent></Card>
        </div>

        <Tabs defaultValue="history" className="mt-8">
          <TabsList><TabsTrigger value="history"><CalendarDays data-icon="inline-start" />History</TabsTrigger><TabsTrigger value="reflection">Reflection</TabsTrigger><TabsTrigger value="care">Care for the building</TabsTrigger></TabsList>
          <TabsContent value="history" className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <Card><CardHeader><CardTitle>The check-in history</CardTitle><CardDescription>Every marked day remains part of the map.</CardDescription></CardHeader><CardContent><Calendar mode="single" selected={new Date()} modifiers={{ completed: completedDates }} modifiersClassNames={{ completed: "bg-accent text-accent-foreground font-semibold" }} className="mx-auto w-full" /></CardContent></Card>
            <div className="flex flex-col gap-4"><Card><CardHeader><CardTitle>Recent notes</CardTitle></CardHeader><CardContent>{habitCheckIns.some((checkIn) => checkIn.note) ? <ItemGroup>{habitCheckIns.filter((checkIn) => checkIn.note).slice(0, 4).map((checkIn) => <Item key={checkIn.id} size="sm" variant="muted"><ItemContent><ItemDescription className="text-foreground">{checkIn.note}</ItemDescription><ItemDescription>{checkIn.localDate}</ItemDescription></ItemContent></Item>)}</ItemGroup> : <p className="text-sm text-muted-foreground">Add context on a future check-in when it feels useful.</p>}</CardContent></Card><Card><CardHeader><CardDescription>Lifetime</CardDescription><CardTitle className="text-3xl">{habitCheckIns.length}</CardTitle><CardDescription>days that belong to this story.</CardDescription></CardHeader></Card></div>
          </TabsContent>
          <TabsContent value="reflection" className="mt-4"><Card><CardHeader><CardTitle>What did this habit make possible?</CardTitle><CardDescription>Keep a sentence for the person who will return to this building later.</CardDescription></CardHeader><CardContent><FieldGroup><Field><FieldLabel htmlFor="habit-reflection">A note for this week</FieldLabel><Textarea id="habit-reflection" value={reflectionText} onChange={(event) => setReflectionText(event.target.value)} placeholder="I felt more present after making this a small part of the week." className="min-h-32 resize-none" /><FieldDescription>This stays in your browser with the rest of your city.</FieldDescription></Field></FieldGroup></CardContent><CardFooter><Button onClick={() => void handleReflection()} disabled={isSavingReflection}>{isSavingReflection ? "Saving..." : "Save reflection"}</Button></CardFooter></Card></TabsContent>
          <TabsContent value="care" className="mt-4"><Card><CardHeader><CardTitle>Change the season</CardTitle><CardDescription>Pausing is a way to care for the city, not a failure state.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-3">{habit.status === "paused" ? <Button onClick={() => void handleStatus("active")}><Play data-icon="inline-start" />Open the building</Button> : habit.status === "active" ? <Button variant="outline" onClick={() => void handleStatus("paused")}><Pause data-icon="inline-start" />Pause for a while</Button> : <Button onClick={() => void handleStatus("active")}><RotateCcw data-icon="inline-start" />Restore to active</Button>}</CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function HabitDetailSkeleton() {
  return <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-6 p-6 sm:p-10"><Skeleton className="h-8 w-32" /><div className="flex items-center gap-5"><Skeleton className="size-28" /><div className="flex flex-col gap-3"><Skeleton className="h-3 w-32" /><Skeleton className="h-12 w-72" /><Skeleton className="h-4 w-96 max-w-full" /></div></div><Skeleton className="h-96 w-full" /></div>
}

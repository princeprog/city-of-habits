"use client"

import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { CalendarDays, CloudRain, Download, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { districtCatalog } from "@/lib/city/catalog"
import { getAtmosphere, getDistrictCounts, getMostRecentDate, getWeekDateKeys, getWeeklyCheckInCount } from "@/lib/city/rules"
import { useCityStore } from "@/stores/city-store"

type ReportPeriod = "week" | "month"

const chartConfig = {
  checkIns: { label: "Check-ins", color: "var(--primary)" },
} satisfies ChartConfig

function monthData(checkIns: ReturnType<typeof useCityStore.getState>["checkIns"]) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const buckets = Math.ceil(daysInMonth / 7)
  return Array.from({ length: buckets }, (_, index) => {
    const start = index * 7 + 1
    const end = Math.min(daysInMonth, start + 6)
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`
    const count = checkIns.filter((checkIn) => {
      if (!checkIn.localDate.startsWith(prefix)) return false
      const day = Number(checkIn.localDate.slice(-2))
      return day >= start && day <= end
    }).length
    return { label: `${start}-${end}`, count }
  })
}

export function CityReport() {
  const { habits, checkIns, reflections, hydrated, hydrate, saveReflection } = useCityStore()
  const [period, setPeriod] = useState<ReportPeriod>("week")
  const [reflectionText, setReflectionText] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!hydrated) void hydrate()
  }, [hydrate, hydrated])

  const reportData = useMemo(() => period === "month"
    ? monthData(checkIns).map((entry) => ({ label: entry.label, checkIns: entry.count }))
    : getWeekDateKeys().map((dateKey) => ({ label: dateKey.slice(5), checkIns: checkIns.filter((checkIn) => checkIn.localDate === dateKey).length })), [checkIns, period])
  const total = reportData.reduce((sum, entry) => sum + entry.checkIns, 0)
  const districtCounts = useMemo(() => getDistrictCounts(habits), [habits])
  const mostActiveDistrict = Object.entries(districtCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as keyof typeof districtCatalog | undefined
  const recentDate = getMostRecentDate(checkIns)
  const atmosphere = getAtmosphere(habits, checkIns)
  const reflection = reflections.find((item) => item.scopeKey === `city:${period}`)

  useEffect(() => {
    // Synchronize the editor with the persisted reflection selected by the tab.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReflectionText(reflection?.body ?? "")
  }, [period, reflection?.body])

  async function handleSaveReflection() {
    setIsSaving(true)
    const now = new Date()
    await saveReflection({ scopeKey: `city:${period}`, period, periodStart: period === "week" ? new Date(`${getWeekDateKeys()[0]}T12:00:00`).toISOString() : new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), body: reflectionText })
    setIsSaving(false)
    toast.success("Report reflection saved.")
  }

  if (!hydrated) return <ReportSkeleton />

  if (!habits.length) {
    return <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-5 sm:p-8"><Empty className="max-w-lg"><EmptyHeader><EmptyMedia variant="icon"><CalendarDays /></EmptyMedia><h1 className="font-heading text-sm font-medium tracking-tight">Your first report is waiting.</h1><EmptyDescription>Create a habit and the city will begin keeping a private record of its rhythm.</EmptyDescription></EmptyHeader></Empty></div>
  }

  const activeHabits = habits.filter((habit) => habit.status === "active")
  const weeklyTarget = activeHabits.reduce((sum, habit) => sum + habit.targetPerWeek, 0)
  const weeklyProgress = activeHabits.reduce((sum, habit) => sum + getWeeklyCheckInCount(habit.id, checkIns), 0)

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:px-6 sm:py-9 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-medium text-primary">A private, local report</p><h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-6xl">The city report</h1><p className="mt-3 max-w-xl text-sm text-muted-foreground">Notice the rhythm without turning it into a score. These numbers stay in this browser.</p></div>
          <Badge variant="outline"><CloudRain />{atmosphere} atmosphere</Badge>
        </header>

        <Tabs value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)} className="mt-8">
          <TabsList><TabsTrigger value="week">This week</TabsTrigger><TabsTrigger value="month">This month</TabsTrigger></TabsList>
          <TabsContent value="week" className="mt-5"><ReportOverview period="week" total={total} reportData={reportData} /></TabsContent>
          <TabsContent value="month" className="mt-5"><ReportOverview period="month" total={total} reportData={reportData} /></TabsContent>
        </Tabs>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card><CardHeader><CardTitle>What the city is saying</CardTitle><CardDescription>A few soft signals from the current map.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><Card size="sm"><CardHeader><CardDescription>Most active district</CardDescription><CardTitle>{mostActiveDistrict ? districtCatalog[mostActiveDistrict].name : "Not yet"}</CardTitle><CardDescription>{mostActiveDistrict ? `${districtCounts[mostActiveDistrict]} building${districtCounts[mostActiveDistrict] === 1 ? "" : "s"}` : "Start with one foundation."}</CardDescription></CardHeader></Card><Card size="sm"><CardHeader><CardDescription>Weekly direction</CardDescription><CardTitle>{weeklyProgress} / {weeklyTarget || 0}</CardTitle><CardDescription>A direction, not a grade.</CardDescription></CardHeader></Card><Card size="sm"><CardHeader><CardDescription>Last light</CardDescription><CardTitle>{recentDate ?? "No check-ins"}</CardTitle><CardDescription>Earned history stays put.</CardDescription></CardHeader></Card></CardContent></Card>
          <Card><CardHeader><Sparkles /><CardTitle>A gentle accounting.</CardTitle><CardDescription>The report is here to help you notice what deserves care next.</CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">No account. No social score. No tracking.</p></CardContent></Card>
        </div>

        <Card className="mt-6"><CardHeader><CardTitle>Keep a reflection</CardTitle><CardDescription>Write a sentence for the end of this {period}. It remains in your local city backup.</CardDescription></CardHeader><CardContent><Textarea value={reflectionText} onChange={(event) => setReflectionText(event.target.value)} placeholder="I noticed that..." className="min-h-28 resize-none" /></CardContent><CardFooter className="justify-end"><Button onClick={() => void handleSaveReflection()} disabled={isSaving}>{isSaving ? "Saving..." : "Save reflection"}<Download data-icon="inline-end" /></Button></CardFooter></Card>
      </div>
    </div>
  )
}

function ReportOverview({ period, total, reportData }: { period: ReportPeriod; total: number; reportData: Array<{ label: string; checkIns: number }> }) {
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]"><Card><CardHeader><CardTitle>Your {period} at a glance</CardTitle><CardDescription>{total} check-in{total === 1 ? "" : "s"} across the city.</CardDescription></CardHeader><CardContent><ChartContainer config={chartConfig} className="h-64 w-full"><BarChart accessibilityLayer data={reportData} margin={{ left: 4, right: 4, top: 8, bottom: 0 }}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} /><ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} /><Bar dataKey="checkIns" fill="var(--color-checkIns)" radius={5} /></BarChart></ChartContainer></CardContent></Card><Card><CardHeader><CardDescription>How to read this</CardDescription><CardTitle>Small marks become a skyline.</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Each bar is simply a day you chose to return. There is no penalty for a quiet stretch.</p></CardContent></Card></div>
}

function ReportSkeleton() {
  return <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-6 p-6 sm:p-10"><Skeleton className="h-3 w-40" /><Skeleton className="h-14 w-80 max-w-full" /><Skeleton className="h-72 w-full" /></div>
}

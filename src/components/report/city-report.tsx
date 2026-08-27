"use client"

import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { CalendarDays, CloudRain, Download, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
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

  const reportData = useMemo(() => {
    if (period === "month") return monthData(checkIns).map((entry) => ({ label: entry.label, checkIns: entry.count }))
    return getWeekDateKeys().map((dateKey) => ({ label: dateKey.slice(5), checkIns: checkIns.filter((checkIn) => checkIn.localDate === dateKey).length }))
  }, [checkIns, period])
  const total = reportData.reduce((sum, entry) => sum + entry.checkIns, 0)
  const districtCounts = useMemo(() => getDistrictCounts(habits), [habits])
  const mostActiveDistrict = Object.entries(districtCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as keyof typeof districtCatalog | undefined
  const recentDate = getMostRecentDate(checkIns)
  const atmosphere = getAtmosphere(habits, checkIns)
  const reflection = reflections.find((item) => item.scopeKey === `city:${period}`)

  useEffect(() => {
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
    return <div className="paper-grain flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-5 sm:p-8"><Empty className="max-w-lg border bg-card/70"><EmptyHeader><EmptyMedia variant="icon"><CalendarDays /></EmptyMedia><EmptyTitle className="font-editorial text-3xl">Your first report is waiting.</EmptyTitle><EmptyDescription>Create a habit and the city will begin keeping a private record of its rhythm.</EmptyDescription></EmptyHeader></Empty></div>
  }

  const activeHabits = habits.filter((habit) => habit.status === "active")
  const weeklyTarget = activeHabits.reduce((sum, habit) => sum + habit.targetPerWeek, 0)
  const weeklyProgress = activeHabits.reduce((sum, habit) => sum + getWeeklyCheckInCount(habit.id, checkIns), 0)

  return (
    <div className="paper-grain min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:px-6 sm:py-9 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="font-label text-[0.6rem] text-primary">A private, local report</p><h1 className="font-editorial mt-2 text-4xl tracking-[-0.04em] sm:text-6xl">The city report</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Notice the rhythm without turning it into a score. These numbers stay in this browser.</p></div>
          <Badge variant="outline" className="w-fit gap-2 rounded-full px-3 py-1.5"><CloudRain aria-hidden="true" />{atmosphere} atmosphere</Badge>
        </header>

        <Tabs value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)} className="mt-8">
          <TabsList><TabsTrigger value="week">This week</TabsTrigger><TabsTrigger value="month">This month</TabsTrigger></TabsList>
          <TabsContent value="week" className="mt-5"><ReportOverview period="week" total={total} reportData={reportData} /></TabsContent>
          <TabsContent value="month" className="mt-5"><ReportOverview period="month" total={total} reportData={reportData} /></TabsContent>
        </Tabs>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card className="bg-card/85"><CardHeader><CardTitle className="font-editorial text-2xl">What the city is saying</CardTitle><CardDescription>A few soft signals from the current map.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border bg-background/60 p-4"><p className="font-label text-[0.55rem] text-muted-foreground">Most active district</p><p className="mt-2 text-lg font-medium">{mostActiveDistrict ? districtCatalog[mostActiveDistrict].name : "Not yet"}</p><p className="mt-1 text-xs text-muted-foreground">{mostActiveDistrict ? `${districtCounts[mostActiveDistrict]} building${districtCounts[mostActiveDistrict] === 1 ? "" : "s"}` : "Start with one foundation."}</p></div><div className="rounded-xl border bg-background/60 p-4"><p className="font-label text-[0.55rem] text-muted-foreground">Weekly direction</p><p className="mt-2 text-lg font-medium">{weeklyProgress} / {weeklyTarget || 0}</p><p className="mt-1 text-xs text-muted-foreground">A direction, not a grade.</p></div><div className="rounded-xl border bg-background/60 p-4"><p className="font-label text-[0.55rem] text-muted-foreground">Last light</p><p className="mt-2 text-lg font-medium">{recentDate ?? "No check-ins"}</p><p className="mt-1 text-xs text-muted-foreground">Earned history stays put.</p></div></CardContent></Card>
          <Card className="bg-primary text-primary-foreground shadow-none"><CardContent className="flex h-full flex-col justify-between gap-8 p-5"><div><Sparkles /><p className="font-editorial mt-4 text-2xl">A gentle accounting.</p><p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">The report is here to help you notice what deserves care next.</p></div><p className="text-xs text-primary-foreground/70">No account. No social score. No tracking.</p></CardContent></Card>
        </div>

        <Card className="mt-6 bg-card/85"><CardHeader><CardTitle className="font-editorial text-2xl">Keep a reflection</CardTitle><CardDescription>Write a sentence for the end of this {period}. It remains in your local city backup.</CardDescription></CardHeader><CardContent><Textarea value={reflectionText} onChange={(event) => setReflectionText(event.target.value)} placeholder="I noticed that..." className="min-h-28 resize-none" /></CardContent><div className="flex justify-end border-t px-6 py-4"><Button onClick={() => void handleSaveReflection()} disabled={isSaving}>{isSaving ? "Saving..." : "Save reflection"} <Download data-icon="inline-end" /></Button></div></Card>
      </div>
    </div>
  )
}

function ReportOverview({ period, total, reportData }: { period: ReportPeriod; total: number; reportData: Array<{ label: string; checkIns: number }> }) {
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]"><Card className="bg-card/85"><CardHeader><CardTitle className="font-editorial text-2xl">Your {period} at a glance</CardTitle><CardDescription>{total} check-in{total === 1 ? "" : "s"} across the city.</CardDescription></CardHeader><CardContent><ChartContainer config={chartConfig} className="h-64 w-full"><BarChart accessibilityLayer data={reportData} margin={{ left: 4, right: 4, top: 8, bottom: 0 }}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} /><ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} /><Bar dataKey="checkIns" fill="var(--color-checkIns)" radius={5} /></BarChart></ChartContainer></CardContent></Card><Card className="bg-secondary/60 shadow-none"><CardContent className="flex h-full flex-col justify-between gap-8 p-5"><div><p className="font-label text-[0.55rem] text-muted-foreground">How to read this</p><p className="font-editorial mt-3 text-2xl">Small marks become a skyline.</p></div><p className="text-sm leading-relaxed text-muted-foreground">Each bar is simply a day you chose to return. There is no penalty for a quiet stretch.</p></CardContent></Card></div>
}

function ReportSkeleton() {
  return <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-6 p-6 sm:p-10"><Skeleton className="h-3 w-40" /><Skeleton className="h-14 w-80 max-w-full" /><Skeleton className="h-72 w-full rounded-2xl" /></div>
}

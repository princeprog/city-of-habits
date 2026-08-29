import Image from "next/image"
import {
  BarChart3,
  CheckCircle2,
  CircleCheck,
  CloudSun,
  Layers3,
  MapPinned,
  Sparkles,
} from "lucide-react"

import { Reveal } from "@/components/landing/landing-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const benefits = [
  "Visualize your habits as a real city",
  "Unlock new districts as you progress",
  "Stay motivated by watching your city grow",
  "Keep all your progress in one beautiful place",
] as const

const stats = [
  { label: "Buildings", value: "6" },
  { label: "Check-ins", value: "24" },
  { label: "Atmosphere", value: "Lively" },
  { label: "Districts", value: "6" },
] as const

const activities = [
  { title: "Meditated for 10 minutes", time: "2m ago" },
  { title: "Completed workout", time: "5h ago" },
  { title: "Read 20 pages", time: "Yesterday" },
] as const

export function LandingShowcase() {
  return (
    <section
      id="features"
      className="scroll-mt-24 bg-secondary/25 px-5 py-20 sm:px-8 sm:py-28 lg:px-12"
      aria-labelledby="showcase-title"
    >
      <div id="why-cities" className="scroll-mt-24" aria-hidden="true" />
      <div className="mx-auto grid max-w-[93rem] items-center gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
        <Reveal className="max-w-xl" distance={24}>
          <p className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">
            More than a tracker
          </p>
          <h2
            id="showcase-title"
            className="mt-5 max-w-lg text-balance font-serif text-5xl leading-[0.98] tracking-tight sm:text-6xl"
          >
            A living map of your life.
          </h2>
          <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            See the big picture. Your habits, progress, and focus areas come
            together in one beautiful city that grows with you.
          </p>
          <ul className="mt-8 grid gap-4 text-sm sm:text-base">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.12} distance={28}>
          <Card className="overflow-hidden border-border/80 bg-card shadow-[0_22px_60px_-30px_rgba(23,37,31,0.35)]">
            <div className="flex min-h-[30rem]">
              <aside className="hidden w-14 shrink-0 flex-col items-center gap-5 border-r border-border/70 bg-secondary/25 py-5 sm:flex">
                <MapPinned className="size-5 text-primary" aria-hidden="true" />
                {[Layers3, BarChart3, CheckCircle2, Sparkles].map((Icon, index) => (
                  <span
                    key={index}
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                ))}
              </aside>
              <div className="min-w-0 flex-1">
                <CardHeader className="gap-1 border-b border-border/70 px-5 py-5 sm:px-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="font-serif text-2xl">My City</CardTitle>
                      <CardDescription className="mt-1 text-primary">
                        Level 23 · Flourishing city
                      </CardDescription>
                    </div>
                    <CloudSun className="size-6 text-primary" aria-label="Lively atmosphere" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 px-5 py-5 sm:px-7">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {stats.map(({ label, value }) => (
                      <div key={label} className="rounded-lg border border-border/70 bg-background px-3 py-3">
                        <p className="text-[0.65rem] text-muted-foreground">{label}</p>
                        <p className="mt-1 text-sm font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-hidden rounded-xl border border-border/70 bg-secondary/20">
                    <Image
                      src="/images/landing/dashboard-city.png"
                      alt="Top-down miniature city panorama with six colorful districts and connected streets."
                      width={1536}
                      height={1024}
                      loading="eager"
                      sizes="(min-width: 1024px) 56vw, 100vw"
                      className="aspect-[1.8] h-auto w-full object-cover object-center"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                    <Card size="sm" className="bg-background shadow-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Recent activity</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {activities.map(({ title, time }) => (
                          <div key={title} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                            <div className="min-w-0">
                              <p className="truncate font-medium">{title}</p>
                              <p className="text-muted-foreground">{time}</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card size="sm" className="bg-background shadow-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Today&apos;s progress</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end justify-between gap-3">
                          <p className="font-serif text-3xl">6/8</p>
                          <p className="text-right text-xs text-muted-foreground">habits completed</p>
                        </div>
                        <Progress value={75} className="mt-4" aria-label="75 percent of habits completed" />
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}

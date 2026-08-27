import Link from "next/link"
import { ArrowRight, Compass, Download, LockKeyhole, Sparkles } from "lucide-react"

import { CityLogo } from "@/components/city/city-logo"
import { CityMap } from "@/components/city/city-map"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { sampleCheckIns, sampleHabits } from "@/lib/city/catalog"

const principles = [
  {
    icon: Sparkles,
    title: "Small actions count",
    description: "One calm check-in gives the city another window, tree, path, or street.",
  },
  {
    icon: Compass,
    title: "Missed days are information",
    description: "The weather can change without erasing the work that came before it.",
  },
  {
    icon: LockKeyhole,
    title: "The city belongs to one person",
    description: "Your routines stay in your browser. There are no public scores or feeds.",
  },
]

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative border-b bg-background">
        <div className="absolute inset-0 city-grid opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-6 sm:px-8 lg:px-12 lg:pb-28">
          <header className="flex items-center justify-between">
            <CityLogo />
            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Main navigation">
              <Link href="#how-it-works" className="transition-colors hover:text-foreground">How it works</Link>
              <Link href="#principles" className="transition-colors hover:text-foreground">Principles</Link>
              <Button size="sm" render={<Link href="/city" />} nativeButton={false}>Enter the city <ArrowRight data-icon="inline-end" /></Button>
            </nav>
            <Button className="md:hidden" size="sm" render={<Link href="/city" />} nativeButton={false}>Enter <ArrowRight data-icon="inline-end" /></Button>
          </header>

          <div className="grid items-center gap-12 pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:pt-28">
            <div className="max-w-2xl">
              <Badge variant="outline" className="font-label rounded-full px-3 py-1 text-[0.6rem] tracking-[0.18em]">Frontend-only / local-first</Badge>
              <h1 className="font-editorial mt-7 text-balance text-5xl leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:text-[6.3rem]">See the life you are building.</h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">City of Habits turns recurring actions into a living personal city. Every check-in adds detail, warmth, and a reason to return.</p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button size="lg" render={<Link href="/city" />} nativeButton={false}>Build your city <ArrowRight data-icon="inline-end" /></Button>
                <Button size="lg" variant="ghost" render={<Link href="#how-it-works" />} nativeButton={false}>Take the short tour</Button>
              </div>
              <p className="font-label mt-5 text-[0.6rem] text-muted-foreground">No account · Works offline · Export anytime</p>
            </div>
            <div className="relative lg:pl-4">
              <div className="absolute -inset-4 rounded-[2rem] bg-accent/40 blur-2xl" aria-hidden="true" />
              <div className="relative">
                <CityMap habits={sampleHabits.map((habit) => ({ ...habit, relatedHabitIds: [...habit.relatedHabitIds] }))} checkIns={sampleCheckIns.map((checkIn) => ({ ...checkIn }))} sample className="min-h-[25rem] rotate-[1deg] lg:min-h-[34rem]" />
                <div className="absolute -bottom-5 -left-4 max-w-[15rem] rounded-2xl border bg-background/90 p-4 shadow-lg backdrop-blur sm:left-4">
                  <p className="font-label text-[0.58rem] text-muted-foreground">Tonight in the city</p>
                  <p className="font-editorial mt-2 text-xl">The library has a new warm window.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-10 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.55fr_1fr] lg:gap-20">
          <div>
            <p className="font-label text-[0.62rem] text-primary">01 / The loop</p>
            <h2 className="font-editorial mt-4 text-4xl tracking-[-0.03em] sm:text-5xl">From one intention to a living neighborhood.</h2>
          </div>
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Name", "Choose a behavior you want to see in the city."],
              ["Place", "Give it a district and a visual identity."],
              ["Check in", "Mark the habit as done with one calm interaction."],
              ["Notice", "Explore what the pattern is making possible."],
            ].map(([title, description], index) => (
              <div key={title} className="border-l border-border px-5 py-2 first:border-l-0 first:pl-0 sm:nth-[3]:border-l-0 lg:nth-[3]:border-l lg:first:pl-0">
                <span className="font-label text-[0.58rem] text-muted-foreground">0{index + 1}</span>
                <h3 className="mt-8 text-base font-semibold capitalize">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="principles" className="scroll-mt-10 border-y bg-card/60">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="max-w-2xl">
            <p className="font-label text-[0.62rem] text-primary">02 / Point of view</p>
            <h2 className="font-editorial mt-4 text-4xl tracking-[-0.03em] sm:text-5xl">A gentler way to notice consistency.</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">The city rewards continuity with richness. A quiet day changes the atmosphere, but it never destroys what you have already made.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="bg-background/70 shadow-none">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Icon aria-hidden="true" /></div>
                  <CardTitle className="font-editorial pt-2 text-2xl">{title}</CardTitle>
                  <CardDescription className="leading-relaxed">{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="font-label text-[0.62rem] text-primary">03 / A private place</p>
            <h2 className="font-editorial mt-4 max-w-3xl text-4xl tracking-[-0.03em] sm:text-6xl">Your habits are meaningful before they are measurable.</h2>
          </div>
          <div className="lg:justify-self-end lg:max-w-sm">
            <div className="flex items-start gap-4 rounded-2xl border bg-card p-5">
              <Download className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="font-medium">Portable by design</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Export your city as a JSON backup whenever you want. No account, server, or lock-in.</p>
              </div>
            </div>
            <Button className="mt-4 w-full" size="lg" render={<Link href="/city" />} nativeButton={false}>Enter your empty city <ArrowRight data-icon="inline-end" /></Button>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div className="flex items-center gap-3"><CityLogo compact /><Separator orientation="vertical" className="h-4" /><span>A living map of your daily life.</span></div>
          <p className="font-label text-[0.56rem]">Built quietly, kept locally.</p>
        </div>
      </footer>

    </main>
  )
}

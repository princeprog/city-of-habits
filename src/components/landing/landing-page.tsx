import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Compass, Download, LockKeyhole, Sparkles } from "lucide-react"

import { CityLogo } from "@/components/city/city-logo"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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

const steps = [
  ["Name", "Choose a behavior you want to see in the city."],
  ["Place", "Give it a district and a visual identity."],
  ["Check in", "Mark the habit as done with one calm interaction."],
  ["Notice", "Explore what the pattern is making possible."],
] as const

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="border-b">
        <div className="mx-auto flex h-20 max-w-[93rem] items-center justify-between px-5 sm:px-8 lg:h-24 lg:px-12">
          <CityLogo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Main navigation">
            <Link href="#how-it-works" className="hover:text-foreground">
              How it works
            </Link>
            <Link href="#principles" className="hover:text-foreground">
              Principles
            </Link>
            <Link href="/city" className={buttonVariants({ size: "lg" })}>
              Enter the city <ArrowRight data-icon="inline-end" />
            </Link>
          </nav>
          <Link href="/city" className={cn(buttonVariants({ size: "sm" }), "md:hidden")}>
            Enter <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
      </header>

      <section className="border-b" aria-labelledby="landing-title">
        <div className="mx-auto grid max-w-[93rem] items-center gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:min-h-[calc(100svh-6rem)] lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-12 lg:py-12">
          <div className="max-w-2xl lg:py-8">
            <Badge variant="outline">Frontend-only / local-first</Badge>
            <h1 id="landing-title" className="mt-8 text-balance text-5xl font-semibold tracking-tight sm:text-6xl xl:text-7xl">
              See the life you are building.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">City of Habits turns recurring actions into a living personal city. Every check-in adds detail, warmth, and a reason to return.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/city" className={buttonVariants({ size: "lg" })}>
                Build your city <ArrowRight data-icon="inline-end" />
              </Link>
              <Link href="#how-it-works" className={buttonVariants({ size: "lg", variant: "ghost" })}>
                Take the short tour <ArrowRight data-icon="inline-end" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No account · Works offline · Export anytime</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Sample city</CardTitle>
              <CardAction>
                <Badge variant="outline">6 buildings</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Image src="/sample-city-hero.png" alt="An isometric sample city with Mind, Creative, Connection, Work, Recovery, and Body districts connected by roads." width={1448} height={1086} sizes="(min-width: 1024px) 52vw, 100vw" className="aspect-[4/3] w-full object-cover" priority />
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-10 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.55fr_1fr] lg:gap-20">
          <div>
            <p className="text-sm font-medium text-primary">01 / The loop</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">From one intention to a living neighborhood.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, description], index) => (
              <Card key={title} size="sm">
                <CardHeader>
                  <CardDescription>0{index + 1}</CardDescription>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{description}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="principles" className="scroll-mt-10 border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">02 / Point of view</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">A gentler way to notice consistency.</h2>
            <p className="mt-5 text-muted-foreground">The city rewards continuity with richness. A quiet day changes the atmosphere, but it never destroys what you have already made.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardHeader>
                  <Icon aria-hidden="true" />
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-primary">03 / A private place</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Your habits are meaningful before they are measurable.</h2>
          </div>
          <div className="lg:justify-self-end lg:max-w-sm">
            <Card>
              <CardContent className="flex items-start gap-4">
                <Download aria-hidden="true" />
                <div>
                  <p className="font-medium">Portable by design</p>
                  <p className="mt-1 text-sm text-muted-foreground">Export your city as a JSON backup whenever you want. No account, server, or lock-in.</p>
                </div>
              </CardContent>
            </Card>
            <Link href="/city" className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}>Enter your empty city <ArrowRight data-icon="inline-end" /></Link>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div className="flex items-center gap-3"><CityLogo compact /><Separator orientation="vertical" className="h-4" /><span>A living map of your daily life.</span></div>
          <p>Built quietly, kept locally.</p>
        </div>
      </footer>
    </main>
  )
}

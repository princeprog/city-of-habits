import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  CloudOff,
  Compass,
  Download,
  Eye,
  Landmark,
  LockKeyhole,
  Map,
  Route,
  Sparkles,
} from "lucide-react";

import { CityLogo } from "@/components/city/city-logo";
import { Reveal } from "@/components/landing/landing-motion";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const heroPromises = [
  {
    icon: LockKeyhole,
    label: "No account",
    description: "Begin without a profile or public identity.",
    tone: "text-primary",
  },
  {
    icon: CloudOff,
    label: "Works offline",
    description: "Your city remains available on this device.",
    tone: "text-chart-4",
  },
  {
    icon: Download,
    label: "Export anytime",
    description: "Keep a portable JSON backup of your progress.",
    tone: "text-chart-2",
  },
] as const;

const districts = [
  { name: "Mind", tone: "text-chart-4", surface: "bg-chart-4/10" },
  { name: "Creative", tone: "text-chart-2", surface: "bg-chart-2/15" },
  { name: "Connection", tone: "text-chart-3", surface: "bg-chart-3/10" },
  { name: "Work", tone: "text-chart-1", surface: "bg-chart-1/10" },
  { name: "Recovery", tone: "text-chart-2", surface: "bg-chart-2/15" },
  { name: "Body", tone: "text-chart-5", surface: "bg-chart-5/10" },
] as const;

const steps = [
  {
    icon: Sparkles,
    title: "Name",
    description: "Choose a behavior you want to see in the city.",
    detail: "Start with one foundation",
    tone: "text-chart-3",
    surface: "bg-chart-3/10",
  },
  {
    icon: Map,
    title: "Place",
    description: "Give it a district and a visual identity.",
    detail: "Make the intention visible",
    tone: "text-chart-4",
    surface: "bg-chart-4/10",
  },
  {
    icon: CheckCircle2,
    title: "Check in",
    description: "Mark the habit as done with one calm interaction.",
    detail: "Return whenever you can",
    tone: "text-primary",
    surface: "bg-primary/10",
  },
  {
    icon: Eye,
    title: "Notice",
    description: "Explore what the pattern is making possible.",
    detail: "Let the bigger picture emerge",
    tone: "text-chart-2",
    surface: "bg-chart-2/15",
  },
] as const;

const features = [
  {
    icon: Building2,
    eyebrow: "Habits become places",
    title: "Read your progress as a city",
    description:
      "Each repeated action becomes a building. As the habit continues, its place gains detail and the wider neighborhood begins to take shape.",
    footer: "Buildings, paths, and landmarks grow together.",
    className: "lg:col-span-7 lg:row-span-2 lg:min-h-[34rem]",
    tone: "primary",
  },
  {
    icon: Compass,
    eyebrow: "Six districts",
    title: "Give every routine a meaningful home",
    description:
      "Body, Mind, Creative, Connection, Work, and Recovery keep different parts of life visible without turning them into a leaderboard.",
    footer: "A place for every kind of progress.",
    className: "lg:col-span-5",
    tone: "accent",
  },
  {
    icon: CheckCircle2,
    eyebrow: "One calm check-in",
    title: "Keep the loop small enough to repeat",
    description:
      "A single local check-in is enough to add another day to the story. Missed days never erase what you built.",
    footer: "Progress is lifetime-derived.",
    className: "lg:col-span-5",
    tone: "secondary",
  },
  {
    icon: BarChart3,
    eyebrow: "Private reports",
    title: "Notice patterns without judgment",
    description:
      "See completion rhythm, active foundations, and recent growth through a calm local report.",
    footer: "Reflection stays on your device.",
    className: "lg:col-span-4",
    tone: "coral",
  },
  {
    icon: Download,
    eyebrow: "Portable by design",
    title: "Take the map with you",
    description:
      "Export a complete JSON backup whenever you want, then keep your records close and under your control.",
    footer: "No remote account required.",
    className: "lg:col-span-8",
    tone: "ivory",
  },
] as const;

const privacyPromises = [
  {
    icon: LockKeyhole,
    title: "Private by default",
    description: "There are no public profiles, rankings, or social feeds.",
  },
  {
    icon: CloudOff,
    title: "Local-first",
    description:
      "Habits and check-ins stay in your browser instead of a remote account.",
  },
  {
    icon: Download,
    title: "Portable",
    description: "Export a complete JSON backup whenever you want.",
  },
  {
    icon: Eye,
    title: "Quiet by design",
    description:
      "No pressure loops, public scores, or attention-hungry notifications.",
  },
] as const;

const closingSignals = [
  { icon: Building2, label: "Foundations" },
  { icon: Route, label: "Connections" },
  { icon: Landmark, label: "Landmarks" },
  { icon: BarChart3, label: "Reports" },
  { icon: Download, label: "Backups" },
] as const;

export function LandingPage() {
  return (
    <main
      data-landing-theme="light"
      className="min-h-screen overflow-x-clip bg-background text-foreground"
    >
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-20 max-w-[93rem] items-center justify-between px-5 sm:px-8 lg:px-12">
          <CityLogo />
          <nav
            className="hidden items-center gap-6 text-sm text-muted-foreground md:flex"
            aria-label="Main navigation"
          >
            <Link
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How it works
            </Link>
            <Link
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link href="/city" className={buttonVariants({ size: "lg" })}>
              Enter the city <ArrowRight data-icon="inline-end" />
            </Link>
          </nav>
          <Link
            href="/city"
            className={cn(buttonVariants({ size: "sm" }), "md:hidden")}
          >
            Enter <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
      </header>

      <section
        className="px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:px-12 lg:pt-20"
        aria-labelledby="landing-title"
      >
        <div className="mx-auto max-w-[93rem]">
          <Reveal className="mx-auto max-w-4xl text-center">
            <Badge
              className="border-primary/25 bg-primary/5 text-primary"
              variant="outline"
            >
              A private daily practice
            </Badge>
            <h1
              id="landing-title"
              className="mt-6 text-balance text-5xl font-semibold tracking-tight sm:text-7xl lg:text-8xl"
            >
              See the life <span className="text-primary">you are building.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              City of Habits turns recurring actions into a living personal
              city. Every check-in adds detail, warmth, and a reason to
              return.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/city" className={buttonVariants({ size: "lg" })}>
                Build your city <ArrowRight data-icon="inline-end" />
              </Link>
              <Link
                href="#how-it-works"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                })}
              >
                Take the short tour <ArrowRight data-icon="inline-end" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.12} distance={28}>
            <Card className="relative mx-auto mt-16 max-w-6xl overflow-hidden bg-foreground text-background shadow-xl">
              <CardHeader className="gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div>
                  <h2 className="font-heading text-base leading-snug font-medium text-background">
                    A sample city
                  </h2>
                  <CardDescription className="text-background/70">
                    Six foundations connected into one living map.
                  </CardDescription>
                </div>
                <CardAction>
                  <Badge variant="secondary">Six districts</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-5 sm:pb-5">
                <Image
                  src="/sample-city-hero.png"
                  alt="An isometric sample city with Mind, Creative, Connection, Work, Recovery, and Body districts connected by roads."
                  width={1448}
                  height={1086}
                  sizes="(min-width: 1280px) 72rem, (min-width: 640px) 90vw, 94vw"
                  className="aspect-[4/3] w-full object-cover"
                  priority
                />
              </CardContent>
            </Card>
          </Reveal>

          <div className="relative z-10 mx-auto -mt-7 grid max-w-5xl gap-3 px-2 sm:grid-cols-3 sm:px-8">
            {heroPromises.map(
              ({ icon: Icon, label, description, tone }, index) => (
                <Reveal key={label} delay={0.2 + index * 0.08} distance={16}>
                  <Card
                    size="sm"
                    className="h-full bg-card/95 shadow-md backdrop-blur"
                  >
                    <CardHeader>
                      <Icon className={cn("mb-1", tone)} aria-hidden="true" />
                      <h3 className="font-heading text-base leading-snug font-medium">
                        {label}
                      </h3>
                      <CardDescription>{description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Reveal>
              ),
            )}
          </div>

          <Reveal delay={0.32} distance={12}>
            <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <span>Six districts</span>
                <Separator className="hidden w-12 bg-primary/30 sm:block" />
                <span>One living map</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {districts.map(({ name, tone, surface }) => (
                  <Badge
                    key={name}
                    variant="outline"
                    className={cn("gap-2 border-border/70", surface, tone)}
                  >
                    <span
                      className="size-2 rounded-full bg-current"
                      aria-hidden="true"
                    />
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-12"
        aria-labelledby="how-it-works-title"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge
              className="border-primary/25 bg-primary/5 text-primary"
              variant="outline"
            >
              How it works
            </Badge>
            <h2
              id="how-it-works-title"
              className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
            >
              One intention becomes a living neighborhood.
            </h2>
            <p className="mt-5 text-pretty text-muted-foreground sm:text-lg">
              The loop stays small enough to repeat and visual enough to notice.
              You make one calm choice; the city carries the longer story.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(
              (
                { icon: Icon, title, description, detail, tone, surface },
                index,
              ) => (
                <Reveal key={title} className="h-full" delay={index * 0.07}>
                  <Card size="sm" className="h-full min-h-64 bg-card">
                    <CardHeader>
                      <div
                        className={cn(
                          "flex size-11 items-center justify-center rounded-full",
                          surface,
                          tone,
                        )}
                      >
                        <Icon aria-hidden="true" />
                      </div>
                      <CardDescription className="pt-2 text-xs uppercase tracking-[0.18em]">
                        Step 0{index + 1}
                      </CardDescription>
                      <h3 className="font-heading text-base leading-snug font-medium">
                        {title}
                      </h3>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <p className="text-sm text-muted-foreground">
                        {description}
                      </p>
                      <Badge
                        variant="outline"
                        className="w-fit border-border/70"
                      >
                        {detail}
                      </Badge>
                    </CardContent>
                  </Card>
                </Reveal>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-24 bg-secondary/45 px-5 py-20 sm:px-8 sm:py-24 lg:px-12"
        aria-labelledby="features-title"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge
              className="border-primary/25 bg-primary/5 text-primary"
              variant="outline"
            >
              Features
            </Badge>
            <h2
              id="features-title"
              className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
            >
              Keep your whole practice in one place.
            </h2>
            <p className="mt-5 text-pretty text-muted-foreground sm:text-lg">
              A habit tracker, a city builder, and a private reflection space—all
              connected by the same small daily action.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 lg:grid-cols-12 lg:grid-rows-2">
            {features.map(
              (
                {
                  icon: Icon,
                  eyebrow,
                  title,
                  description,
                  footer,
                  className,
                  tone,
                },
                index,
              ) => {
                const isPrimary = tone === "primary";
                const surface = {
                  primary: "bg-primary text-primary-foreground",
                  accent: "bg-accent/35",
                  secondary: "bg-secondary",
                  coral: "bg-chart-3/10",
                  ivory: "bg-card",
                }[tone];

                return (
                  <Reveal
                    key={title}
                    className={cn("h-full", className)}
                    delay={index * 0.07}
                  >
                    <Card
                      className={cn(
                        "flex h-full flex-col overflow-hidden",
                        surface,
                      )}
                    >
                      <CardHeader className="gap-4">
                        <Icon
                          className={cn(
                            "mb-1",
                            isPrimary ? "text-accent" : "text-primary",
                          )}
                          aria-hidden="true"
                        />
                        <CardDescription
                          className={cn(
                            "text-xs uppercase tracking-[0.18em]",
                            isPrimary && "text-primary-foreground",
                          )}
                        >
                          {eyebrow}
                        </CardDescription>
                        <h3
                          className={cn(
                            "font-heading text-2xl leading-snug font-medium sm:text-3xl",
                            isPrimary && "text-primary-foreground",
                          )}
                        >
                          {title}
                        </h3>
                      </CardHeader>
                      <CardContent className="mt-auto">
                        <p
                          className={cn(
                            "max-w-xl text-sm leading-6 text-muted-foreground",
                            isPrimary && "text-primary-foreground",
                          )}
                        >
                          {description}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Badge
                          variant={isPrimary ? "secondary" : "outline"}
                          className={cn(
                            "border-border/70",
                            isPrimary && "border-transparent",
                          )}
                        >
                          {footer}
                        </Badge>
                      </CardFooter>
                    </Card>
                  </Reveal>
                );
              },
            )}
          </div>
        </div>
      </section>

      <section
        id="privacy"
        className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-12"
        aria-labelledby="privacy-title"
      >
        <Card className="mx-auto max-w-[93rem] overflow-hidden bg-primary text-primary-foreground">
          <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <CardHeader className="gap-5 px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
              <Badge variant="secondary" className="w-fit">
                Local-first
              </Badge>
              <h2
                id="privacy-title"
                className="text-balance text-4xl tracking-tight text-primary-foreground sm:text-6xl"
              >
                The map is yours to keep.
              </h2>
              <CardDescription className="max-w-xl text-pretty text-base text-primary-foreground sm:text-lg">
                City of Habits is designed as a private place to notice your own
                patterns, not another platform that asks you to perform them.
              </CardDescription>
              <Link
                href="/city"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "mt-2 w-fit",
                )}
              >
                Open your city <ArrowRight data-icon="inline-end" />
              </Link>
            </CardHeader>

            <CardContent className="grid gap-8 px-6 py-10 sm:grid-cols-2 sm:px-10 sm:py-14 lg:border-l lg:border-primary-foreground/20 lg:px-14 lg:py-16">
              {privacyPromises.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <Icon className="shrink-0 text-accent" aria-hidden="true" />
                  <div className="flex flex-col gap-1">
                    <h3 className="font-medium text-primary-foreground">
                      {title}
                    </h3>
                    <p className="text-sm leading-6 text-primary-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </div>
        </Card>
      </section>

      <section
        className="px-5 pb-6 sm:px-8 sm:pb-8 lg:px-12"
        aria-labelledby="final-cta-title"
      >
        <Card className="mx-auto max-w-[93rem] overflow-hidden bg-accent/30">
          <CardHeader className="mx-auto w-full max-w-4xl items-center px-6 py-16 text-center sm:px-10 sm:py-24">
            <Badge
              className="border-primary/25 bg-background/70 text-primary"
              variant="outline"
            >
              Start small
            </Badge>
            <h2
              id="final-cta-title"
              className="mt-5 text-balance font-heading text-4xl leading-snug font-medium tracking-tight sm:text-7xl"
            >
              One foundation. <span className="text-foreground">A city can follow.</span>
            </h2>
              <CardDescription className="mt-4 max-w-2xl text-pretty text-base sm:text-lg">
              Choose one behavior worth returning to. The streets, buildings, and
              landmarks can grow from there.
            </CardDescription>
            <Link
              href="/city"
              className={cn(buttonVariants({ size: "lg" }), "mt-7")}
            >
              Enter your empty city <ArrowRight data-icon="inline-end" />
            </Link>
          </CardHeader>

          <CardContent className="px-6 pb-10 sm:px-10 sm:pb-14">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {closingSignals.map(({ icon: Icon, label }, index) => (
                <Badge
                  key={label}
                  variant="outline"
                  className={cn(
                    "gap-2 border-border/70 bg-background/65 px-4 py-2",
                    index % 2 === 0 ? "-rotate-1" : "rotate-1",
                  )}
                >
                  <Icon aria-hidden="true" />
                  {label}
                </Badge>
              ))}
            </div>
          </CardContent>

          <CardFooter className="mx-6 flex-col items-start justify-between gap-4 border-t border-border/70 px-0 py-6 sm:mx-10 sm:flex-row sm:items-center sm:px-0">
            <CityLogo compact />
            <p className="text-left text-sm text-muted-foreground sm:text-right">
              Built quietly, kept locally.
            </p>
          </CardFooter>
        </Card>
      </section>

      <footer>
        <div className="mx-auto max-w-[93rem] px-5 sm:px-8 lg:px-12">
          <Separator />
          <div className="flex flex-col gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span>City of Habits</span>
              <Separator orientation="vertical" className="h-4" />
              <span>A living map of your daily life.</span>
            </div>
            <div className="flex gap-5">
              <Link href="#how-it-works" className="hover:text-foreground">
                How it works
              </Link>
              <Link href="#privacy" className="hover:text-foreground">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

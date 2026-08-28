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
  Sparkles,
} from "lucide-react";

import { CityLogo } from "@/components/city/city-logo";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const heroPromises = [
  {
    icon: LockKeyhole,
    label: "No account",
    description: "Begin without a profile or public identity.",
  },
  {
    icon: CloudOff,
    label: "Works offline",
    description: "Your city remains available on this device.",
  },
  {
    icon: Download,
    label: "Export anytime",
    description: "Keep a portable JSON backup of your progress.",
  },
] as const;

const steps = [
  {
    icon: Sparkles,
    title: "Name",
    description: "Choose a behavior you want to see in the city.",
  },
  {
    icon: Map,
    title: "Place",
    description: "Give it a district and a visual identity.",
  },
  {
    icon: CheckCircle2,
    title: "Check in",
    description: "Mark the habit as done with one calm interaction.",
  },
  {
    icon: Eye,
    title: "Notice",
    description: "Explore what the pattern is making possible.",
  },
] as const;

const features = [
  {
    icon: Building2,
    eyebrow: "Habits become places",
    title: "Build a city you can read at a glance",
    description:
      "Each repeated action becomes a building. As the habit continues, its place gains detail and the wider neighborhood begins to take shape.",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    icon: Compass,
    eyebrow: "Six districts",
    title: "Give every routine a meaningful home",
    description:
      "Body, Mind, Creative, Connection, Work, and Recovery keep different parts of life visible without turning them into a leaderboard.",
    className: "md:col-span-1",
  },
  {
    icon: BarChart3,
    eyebrow: "Private reports",
    title: "Read patterns without judgment",
    description:
      "See completion rhythm, active foundations, and recent growth through a calm local report.",
    className: "md:col-span-1",
  },
  {
    icon: Sparkles,
    eyebrow: "Gentle continuity",
    title: "Missed days change the atmosphere, not the past",
    description:
      "The city can feel quieter without erasing what you already built. Progress stays useful even when a streak ends.",
    className: "md:col-span-2",
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

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-clip">
      <header className="sticky top-0 z-20 border-b bg-background">
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
        className="px-3 pb-16 pt-3 sm:px-5 sm:pb-20 lg:px-8"
        aria-labelledby="landing-title"
      >
        <Card className="relative mx-auto min-h-[48rem] max-w-[93rem] justify-center overflow-hidden py-12 sm:min-h-[54rem] sm:py-16 lg:min-h-[60rem] lg:py-20">
          <CardHeader className="relative mx-auto max-w-4xl justify-items-center px-5 text-center sm:px-8">
            <Badge variant="outline">Frontend-only / local-first</Badge>
            <h1
              id="landing-title"
              className="mt-5 text-balance text-5xl font-semibold tracking-tight sm:text-7xl lg:text-8xl"
            >
              See the life you are building.
            </h1>
            <CardDescription className="mt-4 max-w-2xl text-pretty text-base sm:text-lg">
              City of Habits turns recurring actions into a living personal
              city. Every check-in adds detail, warmth, and a reason to return.
            </CardDescription>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/city" className={buttonVariants({ size: "lg" })}>
                Build your city <ArrowRight data-icon="inline-end" />
              </Link>
              <Link
                href="#how-it-works"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                Take the short tour <ArrowRight data-icon="inline-end" />
              </Link>
            </div>
          </CardHeader>

          <CardContent className="relative mx-auto mt-10 w-full max-w-5xl px-5 sm:px-8 lg:px-16">
            <Card>
              <CardHeader>
                <CardTitle>Sample city</CardTitle>
                <CardDescription>
                  Six foundations connected into one living map.
                </CardDescription>
                <CardAction>
                  <Badge variant="outline">6 buildings</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <Image
                  src="/sample-city-hero.png"
                  alt="An isometric sample city with Mind, Creative, Connection, Work, Recovery, and Body districts connected by roads."
                  width={1448}
                  height={1086}
                  sizes="(min-width: 1280px) 56rem, (min-width: 640px) 80vw, 92vw"
                  className="aspect-[4/3] w-full object-cover"
                  priority
                />
              </CardContent>
            </Card>
          </CardContent>

          {heroPromises.map(({ icon: Icon, label, description }, index) => (
            <Card
              key={label}
              size="sm"
              className={cn(
                "absolute hidden w-48 xl:flex",
                index === 0 && "left-8 top-48 -rotate-2",
                index === 1 && "right-8 top-60 rotate-2",
                index === 2 && "bottom-16 left-10 rotate-1",
              )}
            >
              <CardHeader>
                <Icon aria-hidden="true" />
                <CardTitle>{label}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}

          <CardFooter className="mx-5 mt-8 justify-center sm:mx-8 xl:hidden">
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {heroPromises.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </CardFooter>
        </Card>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
        aria-labelledby="how-it-works-title"
      >
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline">How it works</Badge>
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
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <Card key={title} size="sm" className="min-h-52">
              <CardHeader>
                <Icon aria-hidden="true" />
                <CardDescription>0{index + 1}</CardDescription>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-24 border-y bg-muted/30"
        aria-labelledby="features-title"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline">Features</Badge>
            <h2
              id="features-title"
              className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
            >
              Keep your whole practice in one place.
            </h2>
            <p className="mt-5 text-pretty text-muted-foreground sm:text-lg">
              A habit tracker, a city builder, and a private reflection
              space—all connected by the same small daily action.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {features.map(
              ({ icon: Icon, eyebrow, title, description, className }) => (
                <Card key={title} className={cn("min-h-64", className)}>
                  <CardHeader>
                    <Icon aria-hidden="true" />
                    <CardDescription>{eyebrow}</CardDescription>
                    <CardTitle>{title}</CardTitle>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <p className="max-w-xl text-sm text-muted-foreground">
                      {description}
                    </p>
                  </CardContent>
                  {title === "Build a city you can read at a glance" ? (
                    <CardFooter>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Landmark aria-hidden="true" />
                        Buildings, paths, and landmarks grow together.
                      </div>
                    </CardFooter>
                  ) : null}
                </Card>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        id="privacy"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
        aria-labelledby="privacy-title"
      >
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline">Local-first</Badge>
          <h2
            id="privacy-title"
            className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
          >
            Your routines stay yours.
          </h2>
          <p className="mt-5 text-pretty text-muted-foreground sm:text-lg">
            City of Habits is designed as a private place to notice your own
            patterns, not another platform that asks you to perform them.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {privacyPromises.map(({ icon: Icon, title, description }) => (
            <Card key={title} size="sm" className="min-h-48">
              <CardHeader>
                <Icon aria-hidden="true" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section
        className="px-3 pb-3 sm:px-5 sm:pb-5 lg:px-8 lg:pb-8"
        aria-labelledby="final-cta-title"
      >
        <Card className="relative mx-auto min-h-[34rem] max-w-[93rem] justify-center overflow-hidden py-16 sm:min-h-[40rem]">
          <CardHeader className="relative mx-auto max-w-3xl justify-items-center px-5 text-center sm:px-8">
            <Badge variant="outline">Your city is waiting</Badge>
            <h2
              id="final-cta-title"
              className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-7xl"
            >
              Start with one foundation.
            </h2>
            <CardDescription className="mt-4 max-w-xl text-pretty text-base sm:text-lg">
              Choose one behavior worth returning to. The streets, buildings,
              and landmarks can grow from there.
            </CardDescription>
            <Link
              href="/city"
              className={cn(buttonVariants({ size: "lg" }), "mt-5")}
            >
              Enter your empty city <ArrowRight data-icon="inline-end" />
            </Link>
          </CardHeader>

          <CardContent className="mx-auto mt-12 grid w-full max-w-4xl grid-cols-3 gap-4 px-5 sm:grid-cols-6 sm:px-8">
            {[
              Building2,
              Compass,
              CheckCircle2,
              Landmark,
              BarChart3,
              Download,
            ].map((Icon, index) => (
              <Card
                key={index}
                size="sm"
                className={cn(
                  "aspect-square items-center justify-center p-0",
                  index % 2 === 0 ? "-rotate-2" : "rotate-2",
                )}
                aria-hidden="true"
              >
                <Icon />
              </Card>
            ))}
          </CardContent>

          <CardFooter className="mx-5 mt-12 justify-between gap-4 sm:mx-8">
            <CityLogo compact />
            <p className="text-right text-sm text-muted-foreground">
              Built quietly, kept locally.
            </p>
          </CardFooter>
        </Card>
      </section>

      <footer>
        <div className="mx-auto flex max-w-[93rem] flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
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
      </footer>
    </main>
  );
}

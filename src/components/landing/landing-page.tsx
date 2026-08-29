import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CloudOff,
  Download,
  Eye,
  Landmark,
  LockKeyhole,
  Route,
} from "lucide-react";

import { CityLogo } from "@/components/city/city-logo";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingJourney } from "@/components/landing/landing-journey";
import { LandingShowcase } from "@/components/landing/landing-showcase";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
      <LandingHero />

      <LandingJourney />

      <LandingShowcase />

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

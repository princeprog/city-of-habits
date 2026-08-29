import Image from "next/image"
import Link from "next/link"
import {
  Accessibility,
  ArrowRight,
  CloudOff,
  Download,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react"

import { CityLogo } from "@/components/city/city-logo"
import { Reveal } from "@/components/landing/landing-motion"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const districtLabels = [
  { name: "Mind", level: 4, className: "left-[30%] top-[12%]" },
  { name: "Work", level: 6, className: "left-[55%] top-[4%]" },
  { name: "Body", level: 5, className: "right-[5%] top-[25%]" },
  { name: "Recovery", level: 3, className: "left-[8%] top-[36%]" },
  { name: "Connection", level: 4, className: "left-[36%] bottom-[7%]" },
  { name: "Creative", level: 2, className: "right-[10%] bottom-[10%]" },
] as const

const promises = [
  {
    icon: LockKeyhole,
    title: "No account",
    description: "Begin without a profile or public identity.",
  },
  {
    icon: CloudOff,
    title: "Works offline",
    description: "Your city remains available on this device.",
  },
  {
    icon: Download,
    title: "Export anytime",
    description: "Keep a portable JSON backup of your progress.",
  },
] as const

const principles = [
  { icon: LockKeyhole, label: "Private" },
  { icon: Waypoints, label: "Local-first" },
  { icon: CloudOff, label: "Offline" },
  { icon: Download, label: "Portable" },
  { icon: Accessibility, label: "Accessible" },
  { icon: ShieldCheck, label: "No tracking" },
] as const

export function LandingHero() {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex h-20 max-w-[93rem] items-center justify-between px-5 sm:px-8 lg:px-12">
          <CityLogo showTagline={false} />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Main navigation">
            <Link href="#features" className="transition-colors hover:text-foreground">Features</Link>
            <Link href="#how-it-works" className="transition-colors hover:text-foreground">How it works</Link>
            <Link href="#why-cities" className="transition-colors hover:text-foreground">Why cities</Link>
            <Link href="#privacy" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link href="#about" className="transition-colors hover:text-foreground">About</Link>
            <Link href="/city" className={buttonVariants({ variant: "ghost", size: "lg" })}>My city</Link>
            <Link href="/habit/new" className={buttonVariants({ size: "lg" })}>Start building <ArrowRight data-icon="inline-end" /></Link>
          </nav>
          <Link href="/habit/new" className={cn(buttonVariants({ size: "sm" }), "md:hidden")}>Start building <ArrowRight data-icon="inline-end" /></Link>
        </div>
      </header>

      <section className="overflow-hidden px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:px-12 lg:pb-20 lg:pt-20" aria-labelledby="landing-title">
        <div className="mx-auto grid max-w-[93rem] items-center gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-3">
          <Reveal className="relative z-10 max-w-2xl lg:pb-10" distance={26}>
            <Badge className="border-primary/20 bg-secondary text-primary" variant="outline">
              <Sparkles data-icon="inline-start" />
              Visualize. Build. Become.
            </Badge>
            <h1 id="landing-title" className="mt-6 text-balance text-5xl leading-[0.98] font-semibold tracking-[-0.045em] sm:text-7xl lg:text-[5.2rem]">
              Turn your habits into a city <span className="text-primary">you&apos;re proud of.</span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              City of Habits is a visual habit tracker where daily routines become buildings, streets, parks, and neighborhoods in your personal city.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/habit/new" className={buttonVariants({ size: "lg" })}>Start building your city <ArrowRight data-icon="inline-end" /></Link>
              <Link href="#how-it-works" className={buttonVariants({ variant: "outline", size: "lg" })}>See how it works <ArrowRight data-icon="inline-end" /></Link>
            </div>
          </Reveal>

          <Reveal delay={0.12} distance={30}>
            <div className="relative mx-auto w-full max-w-4xl lg:-mr-10 lg:ml-auto lg:scale-[1.04]">
              <Image
                src="/images/landing/hero-city.png"
                alt="A warm miniature city with connected streets, parks, and varied buildings representing six habit districts."
                width={1536}
                height={1024}
                sizes="(min-width: 1280px) 58vw, (min-width: 768px) 64vw, 100vw"
                className="h-auto w-full object-contain"
                priority
              />
              {districtLabels.map(({ name, level, className }) => (
                <Card
                  key={name}
                  data-district-label={name}
                  size="sm"
                  className={cn(
                    "pointer-events-none absolute hidden min-w-20 bg-card/95 shadow-md sm:block",
                    className,
                  )}
                >
                  <CardHeader className="gap-0 p-2.5">
                    <CardTitle className="text-xs">{name}</CardTitle>
                    <CardDescription className="text-[0.65rem]">Level {level}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="relative z-10 mx-auto -mt-2 grid max-w-5xl gap-3 sm:-mt-7 sm:grid-cols-3 sm:px-8">
          {promises.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={0.2 + index * 0.08} distance={16}>
              <Card size="sm" className="h-full bg-card/95 shadow-md">
                <CardHeader>
                  <Icon className="mb-1 text-primary" aria-hidden="true" />
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border/80 bg-card/55 px-5 py-8 sm:px-8 lg:px-12" aria-label="City of Habits principles">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
          <p className="text-center text-[0.68rem] font-semibold tracking-[0.3em] text-muted-foreground">BUILT AROUND WHAT MATTERS</p>
          <div className="grid w-full grid-cols-2 gap-5 text-center text-sm text-muted-foreground sm:grid-cols-3 lg:grid-cols-6">
            {principles.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2">
                <Icon className="size-4" aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

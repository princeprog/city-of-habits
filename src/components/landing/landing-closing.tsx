import Image from "next/image"
import Link from "next/link"
import {
  Archive,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Map,
  ShieldCheck,
} from "lucide-react"

import { Reveal } from "@/components/landing/landing-motion"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const proofPoints = [
  {
    icon: Map,
    title: "Progress stays built",
    description:
      "Your growth is lifetime-derived, so missed days never erase what you have already made.",
  },
  {
    icon: LockKeyhole,
    title: "Records stay local",
    description:
      "Habits, check-ins, reflections, and preferences remain in this browser on your device.",
  },
  {
    icon: Archive,
    title: "Backups stay yours",
    description:
      "Export a complete JSON backup whenever you want and keep a portable copy of your city.",
  },
] as const

const footerLinks = {
  Product: [
    ["How it works", "#how-it-works"],
    ["Why cities", "#why-cities"],
    ["Privacy", "#privacy"],
  ],
  Project: [
    ["About", "#about"],
    ["My city", "/city"],
    ["New habit", "/habit/new"],
  ],
  Application: [
    ["Reports", "/report"],
    ["Settings", "/settings"],
    ["Offline fallback", "/offline"],
  ],
} as const

export function LandingClosing() {
  return (
    <>
      <section
        id="privacy"
        className="scroll-mt-24 bg-background px-5 py-20 sm:px-8 sm:py-28 lg:px-12"
        aria-labelledby="privacy-title"
      >
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="border-primary/25 bg-secondary text-primary">
              Built for your real life
            </Badge>
            <h2
              id="privacy-title"
              className="mt-5 text-balance font-serif text-4xl leading-tight tracking-tight sm:text-6xl"
            >
              A city that stays yours.
            </h2>
            <p className="mt-5 text-pretty text-muted-foreground sm:text-lg">
              City of Habits is private by design: local-first, offline-ready,
              portable, and free from tracking.
            </p>
          </Reveal>

          <div id="about" className="mt-12 scroll-mt-24" aria-labelledby="proof-title">
            <h2 id="proof-title" className="sr-only">
              Why people can trust City of Habits
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {proofPoints.map(({ icon: Icon, title, description }, index) => (
                <Reveal key={title} delay={index * 0.08} className="h-full">
                  <Card className="h-full border-border/80 bg-card">
                    <CardHeader className="gap-5">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                        <Icon className="size-6" aria-hidden="true" />
                      </div>
                      <CardTitle className="font-serif text-2xl">{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm leading-6 text-muted-foreground">
                      {description}
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="px-5 pb-12 sm:px-8 sm:pb-16 lg:px-12"
        aria-labelledby="final-cta-title"
      >
        <div className="relative isolate mx-auto min-h-[28rem] max-w-[93rem] overflow-hidden rounded-2xl border border-border/80 bg-secondary">
          <Image
            src="/images/landing/closing-skyline.png"
            alt="Warm waterfront skyline with a bridge, trees, and varied buildings."
            fill
            loading="eager"
            sizes="(min-width: 1280px) 93rem, 100vw"
            className="object-cover object-right"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/90 to-transparent" />
          <div className="relative z-10 flex min-h-[28rem] max-w-xl flex-col justify-center px-6 py-14 sm:px-12 lg:px-16">
            <p className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">
              Start today
            </p>
            <h2
              id="final-cta-title"
              className="mt-5 text-balance font-serif text-5xl leading-[0.98] tracking-tight sm:text-7xl"
            >
              Your best life is worth building.
            </h2>
            <p className="mt-5 max-w-md text-pretty leading-7 text-muted-foreground">
              Start small. Build tomorrow. Be proud of the city you are making.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/habit/new" className={buttonVariants({ size: "lg" })}>
                Start building for free <ArrowRight data-icon="inline-end" />
              </Link>
              <Link
                href="#features"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Explore features
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                Free to start
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                No account required
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-[93rem] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr_1.2fr]">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/brand-mark.svg"
                  alt=""
                  aria-hidden="true"
                  width={32}
                  height={32}
                  className="size-8"
                />
                <span className="font-semibold tracking-tight">City of Habits</span>
              </Link>
              <p className="mt-5 max-w-xs text-sm leading-6 text-primary-foreground/75">
                A living map for your life. Every habit you build shapes the life
                you want.
              </p>
              <p className="mt-6 text-xs text-primary-foreground">
                Private by design · Kept on your device
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-5">
              {Object.entries(footerLinks).map(([heading, links]) => (
                <div key={heading}>
                  <p className="text-sm font-semibold">{heading}</p>
                  <div className="mt-4 grid gap-3 text-sm text-primary-foreground/70">
                    {links.map(([label, href]) => (
                      <Link key={label} href={href} className="transition-colors hover:text-primary-foreground">
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 p-5">
              <p className="font-semibold">Keep your city close</p>
              <p className="mt-2 text-sm leading-6 text-primary-foreground">
                Your personal city is ready whenever you are.
              </p>
              <Link
                href="/city"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "mt-5 w-full",
                )}
              >
                Open my city <ArrowRight data-icon="inline-end" />
              </Link>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-primary-foreground/20 pt-6 text-xs text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 City of Habits. All rights reserved.</span>
            <span>Built quietly, kept locally.</span>
          </div>
        </div>
      </footer>
    </>
  )
}

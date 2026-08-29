import { BarChart3, CalendarCheck2, Plus } from "lucide-react"

import { Reveal } from "@/components/landing/landing-motion"

const steps = [
  {
    icon: Plus,
    title: "1. Add a habit",
    description: "Choose the habits that matter. Every habit is a building block.",
    className: "bg-secondary text-primary",
  },
  {
    icon: CalendarCheck2,
    title: "2. Check in daily",
    description: "Stay consistent. Your buildings grow with every completion.",
    className: "bg-chart-4/15 text-chart-4",
  },
  {
    icon: BarChart3,
    title: "3. Watch your city grow",
    description:
      "Unlock new districts, build your skyline, and see your progress come to life.",
    className: "bg-accent text-foreground",
  },
] as const

export function LandingJourney() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-y border-border/80 bg-card/55 px-5 py-20 sm:px-8 sm:py-24 lg:px-12"
      aria-labelledby="how-it-works-title"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">
            How it works
          </p>
          <h2
            id="how-it-works-title"
            className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Build your city in 3 steps
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-0">
          {steps.map(({ icon: Icon, title, description, className }, index) => (
            <Reveal
              key={title}
              className="relative px-2 text-center lg:px-10"
              delay={index * 0.08}
            >
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute -left-px top-1/2 hidden h-28 -translate-y-1/2 bg-border lg:block"
                />
              ) : null}
              <div
                className={`mx-auto flex size-16 items-center justify-center rounded-xl ${className}`}
              >
                <Icon className="size-8" strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

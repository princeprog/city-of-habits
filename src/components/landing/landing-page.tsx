import { LandingClosing } from "@/components/landing/landing-closing"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingJourney } from "@/components/landing/landing-journey"
import { LandingShowcase } from "@/components/landing/landing-showcase"

export function LandingPage() {
  return (
    <main
      data-landing-theme="light"
      className="min-h-screen overflow-x-clip bg-background text-foreground"
    >
      <LandingHero />
      <LandingJourney />
      <LandingShowcase />
      <LandingClosing />
    </main>
  )
}

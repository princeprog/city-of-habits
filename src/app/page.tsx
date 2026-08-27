import type { Metadata } from "next"

import { LandingPage } from "@/components/landing/landing-page"

export const metadata: Metadata = {
  title: "A living map of your daily life",
  description:
    "Turn recurring actions into buildings, streets, parks, and neighborhoods in a private personal city.",
}

export default function Page() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "City of Habits",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    description: "A private, local-first habit tracker that turns repeated actions into a living personal city.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://city-of-habits.vercel.app",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  }

  return <><LandingPage /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></>
}
